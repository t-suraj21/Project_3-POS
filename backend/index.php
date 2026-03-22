<?php
/**
 * index.php — Application Entry Point
 *
 * Every HTTP request handled by this POS backend arrives here first.
 * This file is responsible for three things:
 *   1. Bootstrapping the environment (timezone, Composer autoload, .env secrets)
 *   2. Setting the CORS headers so the React frontend can talk to this API
 *   3. Dispatching the request to the correct route file based on the URI prefix
 *
 * We intentionally use a simple if-chain router instead of a framework.
 * This keeps the codebase lightweight and easy to follow without any magic.
 */

// PHP's date() and strtotime() default to UTC, but our MySQL session is set to
// IST (+05:30). Keeping both in sync prevents off-by-one bugs in date filters.
date_default_timezone_set('Asia/Kolkata');

// Load all Composer-managed libraries (firebase/php-jwt, PHPMailer, phpdotenv)
require_once __DIR__ . "/vendor/autoload.php";

// Pull in secrets from the .env file (SMTP credentials, Razorpay keys, etc.).
// The file is optional so the app doesn't crash on first-time setup.
if (file_exists(__DIR__ . "/.env")) {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
    $dotenv->load();
}

// ─── CORS Headers ─────────────────────────────────────────────────────────────
// These headers tell browsers that our React frontend (on a different port)
// is allowed to make requests to this API. In production, restrict
// Access-Control-Allow-Origin to your actual domain instead of "*".
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Browsers send a preflight OPTIONS request before any cross-origin request
// that uses custom headers (like Authorization). We handle it here globally
// so every route file doesn't have to worry about it.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204); // 204 No Content — preflight accepted
    exit;
}

// ─── Route Dispatcher ─────────────────────────────────────────────────────────
// Strip query string and decode the request path so we can match it cleanly.
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Product images are stored on disk and served directly from here.
// The frontend requests them as /uploads/products/<filename>.
if (str_starts_with($uri, '/uploads/')) {
    $file = __DIR__ . $uri;
    if (is_file($file)) {
        $mime = mime_content_type($file) ?: 'application/octet-stream';
        header("Content-Type: $mime");
        header("Access-Control-Allow-Origin: *"); // allow the Vite dev server to load images
        readfile($file);
        exit;
    }
    http_response_code(404); echo ''; exit;
}

// ── Auth routes — register, login, OTP verify, password reset
if (str_starts_with($uri, '/api/auth')) {
    require_once __DIR__ . "/routes/auth.php";
    exit;
}

// ── Super Admin routes — platform-wide oversight
if (str_starts_with($uri, '/api/super')) {
    require_once __DIR__ . "/routes/super.php";
    exit;
}

// ── Shop dashboard — KPI stats for the shop owner's home screen
if (str_starts_with($uri, '/api/shop')) {
    require_once __DIR__ . "/routes/shopDashboard.php";
    exit;
}

// ── Products — full CRUD + availability toggle
if (str_starts_with($uri, '/api/products')) {
    require_once __DIR__ . "/routes/products.php";
    exit;
}

// ── Categories — two-level category tree (parent → subcategory)
if (str_starts_with($uri, '/api/categories')) {
    require_once __DIR__ . "/routes/categories.php";
    exit;
}

// ── Customer accounts — ledger, credit balances, transaction history
if (str_starts_with($uri, '/api/accounts')) {
    require_once __DIR__ . "/routes/accounts.php";
    exit;
}

// ── Sales — create bills, list orders, refunds, credit payments
if (str_starts_with($uri, '/api/sales')) {
    require_once __DIR__ . "/routes/sales.php";
    exit;
}

// ── Shop settings & billing layouts — name, address, GST number, logo, favicon, billing layouts
if (str_starts_with($uri, '/api/settings') || str_starts_with($uri, '/api/billing')) {
    require_once __DIR__ . "/routes/settings.php";
    exit;
}

// ── Reports — revenue summaries, top products, low-stock alerts
if (str_starts_with($uri, '/api/reports')) {
    require_once __DIR__ . "/routes/reports.php";
    exit;
}

// ── Inventory — stock list, low-stock warnings, stock updates, history
if (str_starts_with($uri, '/api/inventory')) {
    require_once __DIR__ . "/routes/inventory.php";
    exit;
}

// ── Workers — manage shop workers and assign roles
if (str_starts_with($uri, '/api/workers')) {
    require_once __DIR__ . "/routes/workers.php";
    exit;
}

// ── Razorpay webhooks — no JWT here; the payload is verified by HMAC signature
if (str_starts_with($uri, '/api/webhooks')) {
    require_once __DIR__ . "/routes/webhooks.php";
    exit;
}

// If nothing matched, return a 404 so the client knows the route doesn't exist.
http_response_code(404);
echo json_encode(["message" => "Route not found"]);
?>
