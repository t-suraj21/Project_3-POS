<?php
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../utils/jwt.php";
require_once __DIR__ . "/../utils/Mailer.php";
require_once __DIR__ . "/../vendor/autoload.php";

class AuthController
{
    // ─── POST /api/auth/register-shop ────────────────────────────────────────
    public static function registerShop(): void
    {
        global $conn;

        $data = json_decode(file_get_contents("php://input"));

        // ── Validate required fields ──────────────────────────────────────
        $required = ['shop_name', 'owner_name', 'email', 'password'];
        foreach ($required as $field) {
            if (empty($data->$field)) {
                http_response_code(422);
                echo json_encode(["message" => "Field '$field' is required"]);
                return;
            }
        }

        // ── Validate email format ─────────────────────────────────────────
        if (!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(422);
            echo json_encode(["message" => "Please enter a valid email address"]);
            return;
        }

        // ── Check for duplicate email ─────────────────────────────────────
        $stmt = $conn->prepare("SELECT id, is_verified FROM users WHERE email = ?");
        $stmt->execute([$data->email]);
        $existing = $stmt->fetch();

        if ($existing) {
            if (!$existing['is_verified']) {
                self::resendOtpForExistingUser((int) $existing['id'], $data);
                return;
            }
            http_response_code(409);
            echo json_encode(["message" => "This email is already registered. Please sign in."]);
            return;
        }

        // ── Generate 6-digit OTP ──────────────────────────────────────────
        $cfg       = require __DIR__ . "/../config/email.php";
        $otp       = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $expiresAt = date('Y-m-d H:i:s', time() + ($cfg['token_ttl'] * 60));

        try {
            $conn->beginTransaction();

            // 1. Create shop record
            $stmt = $conn->prepare(
                "INSERT INTO shops (name, email, phone) VALUES (?, ?, ?)"
            );
            $stmt->execute([
                $data->shop_name,
                $data->email,
                $data->phone ?? null,
            ]);
            $shopId = $conn->lastInsertId();

            // 2. Create user (unverified)
            $hashedPassword = password_hash($data->password, PASSWORD_BCRYPT);
            $stmt = $conn->prepare(
                "INSERT INTO users
                    (shop_id, name, email, password, role, is_verified, verification_token, token_expires_at)
                 VALUES (?, ?, ?, ?, 'shop_admin', 0, ?, ?)"
            );
            $stmt->execute([
                $shopId,
                $data->owner_name,
                $data->email,
                $hashedPassword,
                $otp,
                $expiresAt,
            ]);

            $conn->commit();

            // 3. Send OTP email
            $emailSent = Mailer::sendOtp(
                $data->email,
                $data->owner_name,
                $data->shop_name,
                $otp
            );

            http_response_code(201);
            echo json_encode([
                "message"    => "OTP sent to {$data->email}. Please enter it to verify your account.",
                "email_sent" => $emailSent,
            ]);

        } catch (\Exception $e) {
            $conn->rollBack();
            http_response_code(500);
            echo json_encode(["message" => "Registration failed. Please try again."]);
        }
    }


    // ─── POST /api/auth/verify-otp ────────────────────────────────────────────
    public static function verifyOtp(): void
    {
        global $conn;

        $data  = json_decode(file_get_contents("php://input"));
        $email = trim($data->email ?? '');
        $otp   = trim($data->otp   ?? '');

        if (!$email || !$otp) {
            http_response_code(422);
            echo json_encode(["message" => "Email and OTP are required."]);
            return;
        }

        $stmt = $conn->prepare(
            "SELECT id, is_verified, verification_token, token_expires_at FROM users WHERE email = ?"
        );
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user) {
            http_response_code(404);
            echo json_encode(["message" => "No account found with that email."]);
            return;
        }

        if ($user['is_verified']) {
            http_response_code(200);
            echo json_encode(["message" => "Your account is already verified. You can sign in."]);
            return;
        }

        // Check expiry
        if ($user['token_expires_at'] && strtotime($user['token_expires_at']) < time()) {
            http_response_code(410);
            echo json_encode([
                "message" => "OTP has expired. Please request a new one.",
                "expired" => true,
            ]);
            return;
        }

        // Check OTP value
        if ($user['verification_token'] !== $otp) {
            http_response_code(400);
            echo json_encode(["message" => "Incorrect OTP. Please check and try again."]);
            return;
        }

        // ── Activate account ──────────────────────────────────────────────
        $stmt = $conn->prepare(
            "UPDATE users
             SET is_verified = 1, verification_token = NULL, token_expires_at = NULL
             WHERE id = ?"
        );
        $stmt->execute([$user['id']]);

        http_response_code(200);
        echo json_encode(["message" => "Email verified successfully! You can now sign in."]);
    }


    // ─── POST /api/auth/resend-verification ───────────────────────────────────
    public static function resendVerification(): void
    {
        global $conn;

        $data  = json_decode(file_get_contents("php://input"));
        $email = trim($data->email ?? '');

        if (!$email) {
            http_response_code(422);
            echo json_encode(["message" => "Email address is required."]);
            return;
        }

        $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        $generic = "If that email is registered and unverified, a new OTP has been sent.";

        if (!$user || $user['is_verified']) {
            http_response_code(200);
            echo json_encode(["message" => $generic]);
            return;
        }

        $cfg       = require __DIR__ . "/../config/email.php";
        $otp       = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $expiresAt = date('Y-m-d H:i:s', time() + ($cfg['token_ttl'] * 60));

        $stmt = $conn->prepare(
            "UPDATE users SET verification_token = ?, token_expires_at = ? WHERE id = ?"
        );
        $stmt->execute([$otp, $expiresAt, $user['id']]);

        $sStmt = $conn->prepare("SELECT name FROM shops WHERE id = ?");
        $sStmt->execute([$user['shop_id']]);
        $shop  = $sStmt->fetch();

        Mailer::sendOtp($email, $user['name'], $shop['name'] ?? 'Your Shop', $otp);

        http_response_code(200);
        echo json_encode(["message" => $generic]);
    }


    // ─── POST /api/auth/login ─────────────────────────────────────────────────
    public static function login(): void
    {
        global $conn;

        $data = json_decode(file_get_contents("php://input"));

        if (empty($data->email) || empty($data->password)) {
            http_response_code(422);
            echo json_encode(["message" => "Email and password are required"]);
            return;
        }

        $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$data->email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($data->password, $user['password'])) {
            http_response_code(401);
            echo json_encode(["message" => "Invalid email or password"]);
            return;
        }

        if (!$user['is_verified']) {
            http_response_code(403);
            echo json_encode([
                "message"    => "Please verify your email. Enter the OTP we sent to your inbox.",
                "unverified" => true,
                "email"      => $user['email'],
            ]);
            return;
        }

        $token = generateJWT($user);
        unset($user['password']);

        http_response_code(200);
        echo json_encode([
            "message" => "Login successful",
            "token"   => $token,
            "user"    => $user,
        ]);
    }


    // ─── GET /api/auth/me ─────────────────────────────────────────────────────
    public static function me(): void
    {
        global $conn;

        require_once __DIR__ . "/../middleware/authMiddleware.php";
        $payload = authenticate();

        $stmt = $conn->prepare(
            "SELECT id, shop_id, name, email, role, created_at FROM users WHERE id = ?"
        );
        $stmt->execute([$payload['id']]);
        $user = $stmt->fetch();

        if (!$user) {
            http_response_code(404);
            echo json_encode(["message" => "User not found"]);
            return;
        }

        echo json_encode(["user" => $user]);
    }


    // ─── private: resend OTP when unverified account re-registers ────────────
    private static function resendOtpForExistingUser(int $userId, object $data): void
    {
        global $conn;

        $cfg       = require __DIR__ . "/../config/email.php";
        $otp       = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $expiresAt = date('Y-m-d H:i:s', time() + ($cfg['token_ttl'] * 60));

        $stmt = $conn->prepare(
            "UPDATE users SET verification_token = ?, token_expires_at = ? WHERE id = ?"
        );
        $stmt->execute([$otp, $expiresAt, $userId]);

        $sStmt = $conn->prepare(
            "SELECT s.name FROM shops s JOIN users u ON u.shop_id = s.id WHERE u.id = ?"
        );
        $sStmt->execute([$userId]);
        $shop     = $sStmt->fetch();
        $shopName = $shop['name'] ?? ($data->shop_name ?? 'Your Shop');

        Mailer::sendOtp($data->email, $data->owner_name ?? '', $shopName, $otp);

        http_response_code(200);
        echo json_encode([
            "message"    => "OTP resent to {$data->email}. Please enter it to verify your account.",
            "email_sent" => true,
        ]);
    }


    // ─── POST /api/auth/forgot-password ──────────────────────────────────────
    public static function forgotPassword(): void
    {
        global $conn;

        $data  = json_decode(file_get_contents("php://input"));
        $email = trim($data->email ?? '');

        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(422);
            echo json_encode(["message" => "A valid email address is required."]);
            return;
        }

        // Always return same generic message to prevent email enumeration
        $generic = "If that email is registered, a password reset link has been sent.";

        $stmt = $conn->prepare("SELECT id, name, is_verified FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !$user['is_verified']) {
            http_response_code(200);
            echo json_encode(["message" => $generic]);
            return;
        }

        // Generate a secure 64-char hex token (32 random bytes)
        $token     = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', time() + 1800); // 30 minutes

        $stmt = $conn->prepare(
            "UPDATE users SET reset_token = ?, reset_token_expires_at = ? WHERE id = ?"
        );
        $stmt->execute([$token, $expiresAt, $user['id']]);

        // Build frontend reset URL using APP_URL from .env (works on any device/phone)
        $appUrl   = rtrim($_ENV['APP_URL'] ?? 'http://localhost:5173', '/');
        $resetUrl = "{$appUrl}/reset-password?token={$token}";

        Mailer::sendPasswordReset($email, $user['name'], $resetUrl);

        http_response_code(200);
        echo json_encode(["message" => $generic]);
    }


    // ─── POST /api/auth/reset-password ───────────────────────────────────────
    public static function resetPassword(): void
    {
        global $conn;

        $data     = json_decode(file_get_contents("php://input"));
        $token    = trim($data->token    ?? '');
        $password = trim($data->password ?? '');

        if (!$token) {
            http_response_code(422);
            echo json_encode(["message" => "Reset token is required."]);
            return;
        }

        if (strlen($password) < 6) {
            http_response_code(422);
            echo json_encode(["message" => "Password must be at least 6 characters."]);
            return;
        }

        $stmt = $conn->prepare(
            "SELECT id, reset_token_expires_at FROM users WHERE reset_token = ?"
        );
        $stmt->execute([$token]);
        $user = $stmt->fetch();

        if (!$user) {
            http_response_code(400);
            echo json_encode(["message" => "Invalid or already-used reset link. Please request a new one."]);
            return;
        }

        if (strtotime($user['reset_token_expires_at']) < time()) {
            http_response_code(410);
            echo json_encode(["message" => "This reset link has expired. Please request a new one.", "expired" => true]);
            return;
        }

        // Update password and clear the token so it can't be reused
        $hashed = password_hash($password, PASSWORD_BCRYPT);
        $stmt   = $conn->prepare(
            "UPDATE users
             SET password = ?, reset_token = NULL, reset_token_expires_at = NULL
             WHERE id = ?"
        );
        $stmt->execute([$hashed, $user['id']]);

        http_response_code(200);
        echo json_encode(["message" => "Password updated successfully! You can now sign in."]);
    }
}

