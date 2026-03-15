<?php
require_once __DIR__ . "/../controllers/AccountController.php";
require_once __DIR__ . "/../middleware/roleMiddleware.php";

$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') { http_response_code(204); exit; }

// GET /api/accounts  (alias → customers list, used by billing dropdown)
if ($uri === '/api/accounts' && $method === 'GET') {
    $user = verifyModuleAccess('accounts');
    AccountController::getCustomers($user);
    exit;
}

// GET /api/accounts/summary
if ($uri === '/api/accounts/summary' && $method === 'GET') {
    $user = verifyModuleAccess('accounts');
    AccountController::getSummary($user);
    exit;
}

// GET|POST /api/accounts/customers
if ($uri === '/api/accounts/customers') {
    $user = verifyModuleAccess('accounts');
    if ($method === 'GET')  { AccountController::getCustomers($user);   exit; }
    if ($method === 'POST') { AccountController::createCustomer($user); exit; }
}

// GET|PUT|DELETE /api/accounts/customers/:id
if (preg_match('#^/api/accounts/customers/(\d+)$#', $uri, $m)) {
    $user = verifyModuleAccess('accounts');
    $id   = (int) $m[1];
    if ($method === 'GET')    { AccountController::getCustomer($user, $id);    exit; }
    if ($method === 'PUT')    { AccountController::updateCustomer($user, $id); exit; }
    if ($method === 'DELETE') { AccountController::deleteCustomer($user, $id); exit; }
}

// POST /api/accounts/transactions
if ($uri === '/api/accounts/transactions' && $method === 'POST') {
    $user = verifyModuleAccess('accounts');
    AccountController::addTransaction($user);
    exit;
}

// POST /api/accounts/payments
if ($uri === '/api/accounts/payments' && $method === 'POST') {
    $user = verifyModuleAccess('accounts');
    AccountController::addPayment($user);
    exit;
}

http_response_code(405);
echo json_encode(["message" => "Method not allowed"]);
?>
