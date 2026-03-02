<?php
// ─── Bootstrap ────────────────────────────────────────────────────────────────

// Set PHP timezone to IST so date() / strtotime() match MySQL session timezone
date_default_timezone_set('Asia/Kolkata');

require_once __DIR__ . "/vendor/autoload.php";

// Load .env variables (SMTP credentials, app URL, etc.)
if (file_exists(__DIR__ . "/.env")) {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
    $dotenv->load();
}

// ─── CORS Headers ─────────────────────────────────────────────────────────────
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Handle preflight OPTIONS request globally
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ─── Route Dispatcher ──────────────────────────────────────────────────────────
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Serve static uploads (images)
if (str_starts_with($uri, '/uploads/')) {
    $file = __DIR__ . $uri;
    if (is_file($file)) {
        $mime = mime_content_type($file) ?: 'application/octet-stream';
        header("Content-Type: $mime");
        header("Access-Control-Allow-Origin: *");
        readfile($file);
        exit;
    }
    http_response_code(404); echo ''; exit;
}

// Auth routes  →  /api/auth/*
if (str_starts_with($uri, '/api/auth')) {
    require_once __DIR__ . "/routes/auth.php";
    exit;
}

// SuperAdmin routes  →  /api/super/*
if (str_starts_with($uri, '/api/super')) {
    require_once __DIR__ . "/routes/super.php";
    exit;
}

// Shop Admin – dashboard stats  →  /api/shop/*
if (str_starts_with($uri, '/api/shop')) {
    require_once __DIR__ . "/routes/shopDashboard.php";
    exit;
}

// Shop Admin – products  →  /api/products/*
if (str_starts_with($uri, '/api/products')) {
    require_once __DIR__ . "/routes/products.php";
    exit;
}

// Shop Admin – categories  →  /api/categories/*
if (str_starts_with($uri, '/api/categories')) {
    require_once __DIR__ . "/routes/categories.php";
    exit;
}

// Shop Admin – account management  →  /api/accounts/*
if (str_starts_with($uri, '/api/accounts')) {
    require_once __DIR__ . "/routes/accounts.php";
    exit;
}

// Shop Admin – sales  →  /api/sales/*
if (str_starts_with($uri, '/api/sales')) {
    require_once __DIR__ . "/routes/sales.php";
    exit;
}

// Shop Admin – settings  →  /api/settings/*
if (str_starts_with($uri, '/api/settings')) {
    require_once __DIR__ . "/routes/settings.php";
    exit;
}

// Shop Admin – reports  →  /api/reports/*
if (str_starts_with($uri, '/api/reports')) {
    require_once __DIR__ . "/routes/reports.php";
    exit;
}

// Razorpay Webhooks  →  /api/webhooks/*  (no JWT – HMAC verified inside)
if (str_starts_with($uri, '/api/webhooks')) {
    require_once __DIR__ . "/routes/webhooks.php";
    exit;
}

// 404 – no matching route
http_response_code(404);
echo json_encode(["message" => "Route not found"]);
?>
