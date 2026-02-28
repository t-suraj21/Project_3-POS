<?php
// autoload loaded by index.php

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$JWT_SECRET = "POS_SUPER_SECRET_KEY_2024_ABCDEFGH";  // Must be >= 32 chars for HS256 (firebase/php-jwt v7)

/**
 * Generate a signed JWT token for the given user record.
 */
function generateJWT(array $user): string
{
    global $JWT_SECRET;

    $payload = [
        "iss"     => "pos_app",
        "iat"     => time(),
        "exp"     => time() + (60 * 60 * 24), // 24 hours
        "id"      => $user['id'],
        "email"   => $user['email'],
        "role"    => $user['role'],
        "shop_id" => $user['shop_id'],
        "name"    => $user['name'],
    ];

    return JWT::encode($payload, $JWT_SECRET, 'HS256');
}

/**
 * Decode and validate a JWT token.
 * Returns the decoded payload as an array, or null on failure.
 */
function decodeJWT(string $token): ?array
{
    global $JWT_SECRET;

    try {
        $decoded = JWT::decode($token, new Key($JWT_SECRET, 'HS256'));
        return (array) $decoded;
    } catch (\Exception $e) {
        return null;
    }
}
?>
