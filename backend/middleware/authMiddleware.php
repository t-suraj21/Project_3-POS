<?php
/**
 * authMiddleware.php — Authentication Guard
 *
 * Provides two reusable functions for protecting API routes:
 *
 *   authenticate()      — Extract and validate the JWT from the request.
 *                         Use this when any logged-in user is allowed.
 *
 *   authorizeRoles()    — After authenticate(), check that the user's role
 *                         is in the list of roles allowed for this route.
 *
 * Typical usage in a route file:
 *
 *   $user = authenticate();
 *   authorizeRoles($user, ['shop_admin', 'cashier']);
 *
 * Most routes use roleMiddleware.php's verifyRole() instead, which combines
 * both of these into a single call as a convenience.
 */
require_once __DIR__ . "/../utils/jwt.php";

/**
 * Read the Bearer token from the Authorization header, decode it, and
 * return the payload so the route knows who is calling.
 *
 * We check both capitalised and lowercase header names because some HTTP
 * clients (and certain server configurations) send "authorization" in lowercase.
 *
 * @return array  The decoded JWT payload (id, email, role, shop_id, name)
 */
function authenticate(): array
{
    $headers    = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

    // The header must be present and follow the "Bearer <token>" format.
    if (empty($authHeader) || !preg_match('/Bearer\s+(.+)/i', $authHeader, $matches)) {
        http_response_code(401);
        echo json_encode(["message" => "Unauthorized: No token provided"]);
        exit;
    }

    $token   = $matches[1];
    $payload = decodeJWT($token);

    // decodeJWT() returns null if the token is expired, tampered with, or malformed.
    if (!$payload) {
        http_response_code(401);
        echo json_encode(["message" => "Unauthorized: Invalid or expired token"]);
        exit;
    }

    return $payload;
}

/**
 * Assert that the authenticated user's role is in the list of permitted roles.
 *
 * Call this immediately after authenticate() when a route should only be
 * accessible to specific roles (e.g., only shop_admin, not cashier).
 *
 * @param  array  $payload       The decoded JWT payload from authenticate()
 * @param  array  $allowedRoles  Roles that are permitted (e.g., ['shop_admin'])
 */
function authorizeRoles(array $payload, array $allowedRoles): void
{
    if (!in_array($payload['role'], $allowedRoles, true)) {
        http_response_code(403); // 403 Forbidden — user is authenticated but lacks permission
        echo json_encode(["message" => "Forbidden: Insufficient permissions"]);
        exit;
    }
}
?>
