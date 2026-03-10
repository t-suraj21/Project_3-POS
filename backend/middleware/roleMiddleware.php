<?php
/**
 * roleMiddleware.php — Combined Auth + Role Guard
 *
 * Most routes in this app need to both:
 *   1. Verify the caller is logged in (valid JWT)
 *   2. Ensure they have exactly the right role
 *
 * verifyRole() does both in one call, making route files cleaner:
 *
 *   $user = verifyRole('shop_admin');   // 401 if not logged in, 403 if wrong role
 *   // From here on, $user is the fully trusted payload from the token.
 *
 * This is preferred over calling authenticate() + authorizeRoles() separately
 * when only a single role is expected (which covers most of our routes).
 */
require_once __DIR__ . "/../utils/jwt.php";

/**
 * Verify the JWT Bearer token and assert the caller holds the required role.
 *
 * Steps:
 *   1. Extract the token from the Authorization header.
 *   2. Decode and validate it with decodeJWT().
 *   3. Compare the role in the payload to $requiredRole.
 *   4. Return the payload so the controller knows the caller's shop_id, etc.
 *
 * @param  string $requiredRole  The exact role string required (e.g. 'shop_admin')
 * @return array                 Decoded JWT payload on success
 */
function verifyRole(string $requiredRole): array
{
    $headers    = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

    // No token at all — the client needs to log in first.
    if (empty($authHeader) || !preg_match('/Bearer\s+(.+)/i', $authHeader, $matches)) {
        http_response_code(401);
        echo json_encode(["message" => "Unauthorized: No token provided"]);
        exit;
    }

    $payload = decodeJWT($matches[1]);

    // Token is expired, corrupted, or signed with the wrong secret.
    if (!$payload) {
        http_response_code(401);
        echo json_encode(["message" => "Unauthorized: Invalid or expired token"]);
        exit;
    }

    // Token is valid but the user doesn't have the right role for this endpoint.
    // For example, a cashier trying to access a shop_admin-only route.
    if ($payload['role'] !== $requiredRole) {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden: Requires '$requiredRole' role"]);
        exit;
    }

    // All checks passed — hand the payload to the controller.
    return $payload;
}
?>
