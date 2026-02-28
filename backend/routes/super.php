<?php
require_once __DIR__ . "/../controllers/SuperAdminController.php";
require_once __DIR__ . "/../middleware/roleMiddleware.php";

$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Handle preflight
if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ── GET /api/super/shops ──────────────────────────────────────────────────────
if ($uri === '/api/super/shops' && $method === 'GET') {
    verifyRole('superadmin');
    SuperAdminController::getAllShops();
    exit;
}

// ── GET|PUT /api/super/shops/:id ──────────────────────────────────────────────
if (preg_match('#^/api/super/shops/(\d+)$#', $uri, $m)) {
    verifyRole('superadmin');

    if ($method === 'GET') {
        SuperAdminController::getShop((int) $m[1]);
    } elseif ($method === 'PUT') {
        SuperAdminController::updateShop((int) $m[1]);
    } else {
        http_response_code(405);
        echo json_encode(["message" => "Method not allowed"]);
    }
    exit;
}

// ── POST /api/super/shops/:id/logo ────────────────────────────────────────────
if (preg_match('#^/api/super/shops/(\d+)/logo$#', $uri, $m) && $method === 'POST') {
    verifyRole('superadmin');
    SuperAdminController::uploadLogo((int) $m[1]);
    exit;
}

// ── GET /api/super/revenue ────────────────────────────────────────────────────
if ($uri === '/api/super/revenue' && $method === 'GET') {
    verifyRole('superadmin');
    SuperAdminController::globalRevenue();
    exit;
}
?>
