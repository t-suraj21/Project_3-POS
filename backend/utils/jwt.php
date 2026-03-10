<?php
/**
 * jwt.php — JSON Web Token Helpers
 *
 * Provides two simple functions for creating and reading JWTs:
 *   - generateJWT()  → sign a new token for a freshly logged-in user
 *   - decodeJWT()    → validate an incoming token and return its payload
 *
 * We use the HS256 algorithm (HMAC + SHA-256) which requires a shared secret
 * instead of a public/private key pair. This is fine for a single-server app.
 * The firebase/php-jwt library handles all the cryptographic heavy lifting.
 *
 * ⚠ In production, move JWT_SECRET to your .env file and NEVER commit it.
 */

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

// The secret used to sign and verify every token. Must be at least 32 characters
// for HS256 to be cryptographically secure (firebase/php-jwt v7 requirement).
$JWT_SECRET = "POS_SUPER_SECRET_KEY_2024_ABCDEFGH";

/**
 * Create a signed JWT token for the given user.
 *
 * The token embeds the user's id, email, role, shop_id, and name so that
 * every protected API route has access to the caller's identity without
 * hitting the database again on each request.
 *
 * Tokens expire after 7 days — the user will need to log in again after that.
 *
 * @param  array  $user  A row from the users table (must include id, email, role, shop_id, name)
 * @return string        The signed JWT string to send back to the client
 */
function generateJWT(array $user): string
{
    global $JWT_SECRET;

    $payload = [
        "iss"     => "pos_app",           // issuer — identifies this application
        "iat"     => time(),               // issued at — Unix timestamp of creation
        "exp"     => time() + (60 * 60 * 24 * 7), // expires — 7 days from now
        "id"      => $user['id'],
        "email"   => $user['email'],
        "role"    => $user['role'],        // superadmin | shop_admin | cashier
        "shop_id" => $user['shop_id'],     // null for superadmin
        "name"    => $user['name'],
    ];

    return JWT::encode($payload, $JWT_SECRET, 'HS256');
}

/**
 * Decode and validate an incoming JWT token.
 *
 * This function checks both the signature (was it signed by us?) and the
 * expiry time (has it expired?). If either check fails, we return null
 * so the caller can respond with a 401 Unauthorized.
 *
 * @param  string      $token  The raw JWT string from the Authorization header
 * @return array|null          Decoded payload as an associative array, or null if invalid
 */
function decodeJWT(string $token): ?array
{
    global $JWT_SECRET;

    try {
        $decoded = JWT::decode($token, new Key($JWT_SECRET, 'HS256'));
        // JWT::decode() returns a stdClass object; we cast it to an array
        // so the rest of the codebase can use consistent array syntax.
        return (array) $decoded;
    } catch (\Exception $e) {
        // Token is expired, malformed, or has an invalid signature.
        // We intentionally swallow the exception and return null —
        // the middleware layer will convert this into a 401 response.
        return null;
    }
}
?>
