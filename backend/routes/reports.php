<?php
require_once __DIR__ . "/../middleware/roleMiddleware.php";
require_once __DIR__ . "/../controllers/ReportController.php";

$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') { http_response_code(204); exit; }

$user = verifyRole('shop_admin');

// GET /api/reports/summary
if ($uri === '/api/reports/summary' && $method === 'GET') {
    ReportController::summary($user);
    exit;
}

// GET /api/reports/date-range?from=YYYY-MM-DD&to=YYYY-MM-DD
if ($uri === '/api/reports/date-range' && $method === 'GET') {
    ReportController::dateRange($user);
    exit;
}

http_response_code(404);
echo json_encode(["error" => "Report route not found"]);
