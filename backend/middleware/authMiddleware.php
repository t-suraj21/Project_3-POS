<?php
require_once __DIR__ . "/../utils/jwt.php";

/**
 * Verify the Bearer token from the Authorization header.
 * Returns the decoded payload array on success.
 * Sends a 401 response and exits on failure.
 */
function authenticate(): array
{
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

    if (empty($authHeader) || !preg_match('/Bearer\s+(.+)/i', $authHeader, $matches)) {
        http_response_code(401);
        echo json_encode(["message" => "Unauthorized: No token provided"]);
        exit;
    }

    $token   = $matches[1];
    $payload = decodeJWT($token);

    if (!$payload) {
        http_response_code(401);
        echo json_encode(["message" => "Unauthorized: Invalid or expired token"]);
        exit;
    }

    return $payload;
}

/**
 * Ensure the authenticated user has one of the allowed roles.
 * Call after authenticate().
 */
function authorizeRoles(array $payload, array $allowedRoles): void
{
    if (!in_array($payload['role'], $allowedRoles, true)) {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden: Insufficient permissions"]);
        exit;
    }
}
?>
