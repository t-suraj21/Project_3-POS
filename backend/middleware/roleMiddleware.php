<?php
require_once __DIR__ . "/../utils/jwt.php";

/**
 * Verify the Bearer token AND assert the caller has the required role.
 * Returns the decoded payload on success.
 * Sends 401/403 and exits on failure.
 */
function verifyRole(string $requiredRole): array
{
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

    if (empty($authHeader) || !preg_match('/Bearer\s+(.+)/i', $authHeader, $matches)) {
        http_response_code(401);
        echo json_encode(["message" => "Unauthorized: No token provided"]);
        exit;
    }

    $payload = decodeJWT($matches[1]);

    if (!$payload) {
        http_response_code(401);
        echo json_encode(["message" => "Unauthorized: Invalid or expired token"]);
        exit;
    }

    if ($payload['role'] !== $requiredRole) {
        http_response_code(403);
        echo json_encode(["message" => "Forbidden: Requires '$requiredRole' role"]);
        exit;
    }

    return $payload;
}
?>
