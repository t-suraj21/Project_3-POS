<?php
require_once __DIR__ . "/../controllers/ShopDashboardController.php";
require_once __DIR__ . "/../middleware/roleMiddleware.php";

$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') { http_response_code(204); exit; }

// GET /api/shop/dashboard
if ($uri === '/api/shop/dashboard' && $method === 'GET') {
    $user = verifyRole('shop_admin');
    ShopDashboardController::stats($user);
    exit;
}
?>
