<?php
require_once __DIR__ . "/../controllers/SalesController.php";
require_once __DIR__ . "/../controllers/RazorpayController.php";
require_once __DIR__ . "/../middleware/authMiddleware.php";
require_once __DIR__ . "/../middleware/roleMiddleware.php";

$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') { http_response_code(204); exit; }

$user = verifyRole('shop_admin');

// GET /api/sales
if ($uri === '/api/sales' && $method === 'GET') {
    SalesController::getAll($user);
    exit;
}

// POST /api/sales
if ($uri === '/api/sales' && $method === 'POST') {
    SalesController::create($user);
    exit;
}

// GET /api/sales/:id
if (preg_match('#^/api/sales/(\d+)$#', $uri, $m) && $method === 'GET') {
    SalesController::getOne($user, (int) $m[1]);
    exit;
}

// PUT /api/sales/:id/refund
if (preg_match('#^/api/sales/(\d+)/refund$#', $uri, $m) && $method === 'PUT') {
    SalesController::refund($user, (int) $m[1]);
    exit;
}

// POST /api/sales/:id/collect-payment
if (preg_match('#^/api/sales/(\d+)/collect-payment$#', $uri, $m) && $method === 'POST') {
    SalesController::collectPayment($user, (int) $m[1]);
    exit;
}

// ── Razorpay Online Payment Routes ───────────────────────────────────────────

// POST /api/sales/razorpay/create-order
if ($uri === '/api/sales/razorpay/create-order' && $method === 'POST') {
    RazorpayController::createOrder($user);
    exit;
}

// POST /api/sales/razorpay/verify-payment
if ($uri === '/api/sales/razorpay/verify-payment' && $method === 'POST') {
    RazorpayController::verifyPayment($user);
    exit;
}

http_response_code(404);
echo json_encode(["error" => "Route not found"]);
