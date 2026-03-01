<?php
require_once __DIR__ . "/../controllers/AuthController.php";

$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Handle preflight CORS request
if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// POST /api/auth/register-shop
if ($uri === '/api/auth/register-shop' && $method === 'POST') {
    AuthController::registerShop();
    exit;
}

// POST /api/auth/verify-otp
if ($uri === '/api/auth/verify-otp' && $method === 'POST') {
    AuthController::verifyOtp();
    exit;
}

// POST /api/auth/resend-verification
if ($uri === '/api/auth/resend-verification' && $method === 'POST') {
    AuthController::resendVerification();
    exit;
}

// POST /api/auth/login
if ($uri === '/api/auth/login' && $method === 'POST') {
    AuthController::login();
    exit;
}

// GET /api/auth/me  (protected)
if ($uri === '/api/auth/me' && $method === 'GET') {
    AuthController::me();
    exit;
}

// POST /api/auth/forgot-password
if ($uri === '/api/auth/forgot-password' && $method === 'POST') {
    AuthController::forgotPassword();
    exit;
}

// POST /api/auth/reset-password
if ($uri === '/api/auth/reset-password' && $method === 'POST') {
    AuthController::resetPassword();
    exit;
}
?>
