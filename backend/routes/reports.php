<?php
require_once __DIR__ . "/../middleware/roleMiddleware.php";
require_once __DIR__ . "/../controllers/ReportController.php";

$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') { http_response_code(204); exit; }

// Only shop_admin can access reports (matches frontend ShopAdminLayout guard)
$user = verifyRole('shop_admin');

// GET /api/reports/daily?date=YYYY-MM-DD
if ($uri === '/api/reports/daily' && $method === 'GET') {
    ReportController::daily($user);
    exit;
}

// GET /api/reports/monthly?year=YYYY&month=MM
if ($uri === '/api/reports/monthly' && $method === 'GET') {
    ReportController::monthly($user);
    exit;
}

// GET /api/reports/best-products?from=...&to=...
if ($uri === '/api/reports/best-products' && $method === 'GET') {
    ReportController::bestProducts($user);
    exit;
}

// GET /api/reports/profit?from=...&to=...
if ($uri === '/api/reports/profit' && $method === 'GET') {
    ReportController::profit($user);
    exit;
}

http_response_code(404);
echo json_encode(["error" => "Report route not found"]);
