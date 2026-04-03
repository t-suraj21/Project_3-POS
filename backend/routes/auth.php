<?php
require_once __DIR__ . "/../controllers/AuthController.php";
require_once __DIR__ . "/../middleware/rateLimitMiddleware.php";

$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Handle preflight CORS request
if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// POST /api/auth/register-shop — Rate limit: 5 per hour per IP
if ($uri === '/api/auth/register-shop' && $method === 'POST') {
    requireRateLimit('register-shop', 5);
    AuthController::registerShop();
    exit;
}

// POST /api/auth/register-superadmin — Rate limit: 5 per hour per IP
if ($uri === '/api/auth/register-superadmin' && $method === 'POST') {
    requireRateLimit('register-superadmin', 5);
    AuthController::registerSuperadmin();
    exit;
}

// POST /api/auth/verify-otp — Rate limit: 10 per hour per IP
if ($uri === '/api/auth/verify-otp' && $method === 'POST') {
    requireRateLimit('verify-otp', 10);
    AuthController::verifyOtp();
    exit;
}

// POST /api/auth/resend-verification — Rate limit: 3 per hour per IP
if ($uri === '/api/auth/resend-verification' && $method === 'POST') {
    requireRateLimit('resend-verification', 3);
    AuthController::resendVerification();
    exit;
}

// POST /api/auth/login — Rate limit: 10 per hour per IP
if ($uri === '/api/auth/login' && $method === 'POST') {
    requireRateLimit('login', 10);
    AuthController::login();
    exit;
}

// GET /api/auth/me  (protected)
if ($uri === '/api/auth/me' && $method === 'GET') {
    AuthController::me();
    exit;
}

// POST /api/auth/forgot-password — Rate limit: 3 per hour per IP
if ($uri === '/api/auth/forgot-password' && $method === 'POST') {
    requireRateLimit('forgot-password', 3);
    AuthController::forgotPassword();
    exit;
}

// POST /api/auth/reset-password — Rate limit: 5 per hour per IP
if ($uri === '/api/auth/reset-password' && $method === 'POST') {
    requireRateLimit('reset-password', 5);
    AuthController::resetPassword();
    exit;
}
?>
