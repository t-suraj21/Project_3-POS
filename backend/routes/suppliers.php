<?php

require_once __DIR__ . "/../middleware/AuthMiddleware.php";
require_once __DIR__ . "/../controllers/SupplierController.php";

$user = AuthMiddleware::verifyToken();
$method = $_SERVER['REQUEST_METHOD'];

// Route parsing
// e.g. /api/suppliers
// e.g. /api/suppliers/5
// e.g. /api/suppliers/5/payments
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$parts = explode('/', trim($uri, '/'));

$id = isset($parts[2]) && is_numeric($parts[2]) ? (int)$parts[2] : null;
$action = isset($parts[3]) ? $parts[3] : null;

// Routing logic
if ($method === 'GET' && !$id) {
    SupplierController::getAll($user);
} elseif ($method === 'GET' && $id && !$action) {
    SupplierController::getOne($user, $id);
} elseif ($method === 'POST' && !$id) {
    SupplierController::create($user);
} elseif ($method === 'PUT' && $id && !$action) {
    SupplierController::update($user, $id);
} elseif ($method === 'DELETE' && $id && !$action) {
    SupplierController::delete($user, $id);
} elseif ($method === 'POST' && $id && $action === 'payments') {
    SupplierController::addPayment($user, $id);
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed / Route not found"]);
}
