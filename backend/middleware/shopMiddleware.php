<?php
/**
 * shopMiddleware.php — Shop Data Isolation
 *
 * Ensures that every API request can only access data belonging to the user's shop.
 * This middleware extracts the shop_id from the decoded JWT and provides helper
 * functions to safely scope all database queries.
 *
 * ⚠️ CRITICAL: Every query MUST use getShopId($user) to filter results
 * Otherwise, users could view/modify other shops' data
 */

require_once __DIR__ . "/../utils/jwt.php";

/**
 * Extract and validate the Authorization header, returning the decoded JWT payload.
 *
 * Exits with 401 if:
 *   - No Authorization header is present
 *   - The header is malformed
 *   - The token is invalid or expired
 *
 * @return array  The decoded JWT payload with keys: id, email, role, shop_id, name, iat, exp, iss
 */
function requireAuth(): array
{
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

    if (empty($authHeader)) {
        http_response_code(401);
        echo json_encode(["message" => "Missing Authorization header"]);
        exit;
    }

    if (!preg_match('/^Bearer\s+(.+)$/', $authHeader, $matches)) {
        http_response_code(401);
        echo json_encode(["message" => "Invalid Authorization header format. Use: Bearer <token>"]);
        exit;
    }

    $token = $matches[1];
    $user = decodeJWT($token);

    if (!$user) {
        http_response_code(401);
        echo json_encode(["message" => "Invalid or expired token"]);
        exit;
    }

    return $user;
}

/**
 * Get the shop_id from the decoded JWT payload.
 *
 * For shop_admin/manager/worker roles: returns their assigned shop_id
 * For superadmin: returns null (superadmin can see all shops)
 *
 * ⚠️ ALWAYS use this in queries to ensure data isolation
 *
 * @param array $user  Decoded JWT payload
 * @return int|null    The shop_id to filter by, or null for superadmin
 */
function getShopId(array $user): ?int
{
    // SuperAdmin has no shop_id restriction
    if ($user['role'] === 'superadmin') {
        return null;
    }

    // All other roles must have a shop_id
    $shopId = $user['shop_id'] ?? null;

    if ($shopId === null) {
        http_response_code(403);
        echo json_encode(["message" => "User has no assigned shop"]);
        exit;
    }

    return (int) $shopId;
}

/**
 * Verify that the user has write permission for a resource.
 *
 * Only allows: shop_admin, manager, stock_manager, account_worker, sales_worker
 * Denies: cashier, superadmin (for most operations)
 *
 * @param array $user              Decoded JWT payload
 * @param array $allowedRoles      List of roles that can write (optional override)
 * @return void                    Exits with 403 if unauthorized
 */
function requireWritePermission(array $user, array $allowedRoles = null): void
{
    $allowedRoles = $allowedRoles ?? ['shop_admin', 'manager', 'stock_manager', 'account_worker', 'sales_worker'];

    if (!in_array($user['role'], $allowedRoles, true)) {
        http_response_code(403);
        echo json_encode([
            "message" => "You don't have permission to modify data. Only managers and above can do this.",
            "your_role" => $user['role']
        ]);
        exit;
    }
}

/**
 * Verify that the user has read-only permission.
 * All authenticated users have at least read access.
 *
 * @param array $user  Decoded JWT payload
 * @return void        Exits with 403 if user is not authenticated
 */
function requireReadPermission(array $user): void
{
    // All authenticated users can read their shop's data
    // This is a placeholder for future permission granularity
}

/**
 * Verify that a specific resource belongs to the user's shop.
 *
 * Useful when you need to ensure a product/sale/customer belongs to the
 * user's shop before allowing modifications.
 *
 * @param PDO    $conn              Database connection
 * @param string $table             Table name (e.g., 'products', 'sales')
 * @param int    $resourceId        The ID of the resource to verify
 * @param array  $user              Decoded JWT payload
 * @return bool                      true if resource belongs to user's shop, false otherwise
 */
function resourceBelongsToUserShop(PDO $conn, string $table, int $resourceId, array $user): bool
{
    $shopId = getShopId($user);

    // SuperAdmin can access any resource
    if ($shopId === null) {
        return true;
    }

    // Check if resource's shop_id matches user's shop_id
    $stmt = $conn->prepare("SELECT shop_id FROM {$table} WHERE id = ?");
    $stmt->execute([$resourceId]);
    $result = $stmt->fetch();

    if (!$result) {
        return false; // Resource doesn't exist
    }

    return (int) $result['shop_id'] === $shopId;
}

/**
 * Helper: Verify resource ownership or exit with 403.
 *
 * Combines resourceBelongsToUserShop() check with error response.
 *
 * @param PDO    $conn      Database connection
 * @param string $table     Table name
 * @param int    $resourceId  Resource ID
 * @param array  $user      Decoded JWT payload
 * @return void             Exits with 403 if resource doesn't belong to user
 */
function requireResourceOwnership(PDO $conn, string $table, int $resourceId, array $user): void
{
    $belongs = resourceBelongsToUserShop($conn, $table, $resourceId, $user);

    if (!$belongs) {
        http_response_code(403);
        echo json_encode(["message" => "You don't have access to this resource"]);
        exit;
    }
}

/**
 * Build a WHERE clause fragment for filtering by shop_id.
 *
 * Usage:
 *   $query = "SELECT * FROM products WHERE " . buildShopFilter('p', $user, 'p.shop_id');
 *   $stmt = $conn->prepare($query);
 *
 * @param array  $user           Decoded JWT payload
 * @param string $shopIdColumn   Column name (e.g., 'p.shop_id' or 'products.shop_id')
 * @return string                WHERE clause fragment: "shop_id = ?" or "1=1" for superadmin
 */
function buildShopFilter(array $user, string $shopIdColumn = 'shop_id'): string
{
    $shopId = getShopId($user);

    if ($shopId === null) {
        // SuperAdmin: no filter needed
        return "1=1";
    }

    // Regular user: filter by shop_id
    return "{$shopIdColumn} = {$shopId}";
}

/**
 * Extract and append shop_id to an INSERT/UPDATE payload.
 *
 * Prevents users from manually specifying a different shop_id in the request.
 * The shop_id is always set from the JWT token.
 *
 * Usage:
 *   $payload = json_decode($body);
 *   $payload = enforceShopId($payload, $user);
 *   // Now $payload->shop_id is definitely the user's shop_id
 *
 * @param stdClass|array $data   The input payload
 * @param array $user            Decoded JWT payload
 * @return std Class|array       The same object/array with shop_id enforced
 */
function enforceShopId($data, array $user)
{
    $shopId = getShopId($user);

    if (is_array($data)) {
        $data['shop_id'] = $shopId;
    } else {
        $data->shop_id = $shopId;
    }

    return $data;
}

?>
