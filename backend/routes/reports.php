<?php
require_once __DIR__ . "/../middleware/authMiddleware.php";
require_once __DIR__ . "/../middleware/roleMiddleware.php";
require_once __DIR__ . "/../controllers/ReportController.php";

$user = verifyToken();
verifyRole($user, ['shop_admin']);

// GET /api/reports/daily
if ($uri === '/api/reports/daily' && $method === 'GET') {
    ReportController::daily($user);
    exit;
}

// GET /api/reports/monthly
if ($uri === '/api/reports/monthly' && $method === 'GET') {
    ReportController::monthly($user);
    exit;
}

// GET /api/reports/best-products
if ($uri === '/api/reports/best-products' && $method === 'GET') {
    ReportController::bestProducts($user);
    exit;
}

// GET /api/reports/profit
if ($uri === '/api/reports/profit' && $method === 'GET') {
    ReportController::profit($user);
    exit;
}

http_response_code(404);
echo json_encode(["error" => "Report route not found"]);
