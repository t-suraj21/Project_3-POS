<?php
/**
 * inventory.php — Inventory Routes
 *
 * Maps HTTP method + URI to the correct InventoryController method.
 * All routes require a valid JWT with role = shop_admin.
 *
 * Routes:
 *   GET  /api/inventory/summary       — KPI summary cards
 *   GET  /api/inventory/stock         — Full stock list (searchable)
 *   GET  /api/inventory/low-stock     — Products at or below alert level
 *   POST /api/inventory/stock/:id     — Update stock for one product + log history
 *   GET  /api/inventory/history       — Stock change audit log
 */
require_once __DIR__ . "/../controllers/InventoryController.php";
require_once __DIR__ . "/../middleware/roleMiddleware.php";

$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') { http_response_code(204); exit; }

// GET /api/inventory/summary
if ($uri === '/api/inventory/summary' && $method === 'GET') {
    $user = verifyRole('shop_admin');
    InventoryController::getSummary($user);
    exit;
}

// GET /api/inventory/stock
if ($uri === '/api/inventory/stock' && $method === 'GET') {
    $user = verifyRole('shop_admin');
    InventoryController::getStockList($user);
    exit;
}

// GET /api/inventory/low-stock
if ($uri === '/api/inventory/low-stock' && $method === 'GET') {
    $user = verifyRole('shop_admin');
    InventoryController::getLowStock($user);
    exit;
}

// GET /api/inventory/history
if ($uri === '/api/inventory/history' && $method === 'GET') {
    $user = verifyRole('shop_admin');
    InventoryController::getHistory($user);
    exit;
}

// POST /api/inventory/stock/:id  — update stock + log
if (preg_match('#^/api/inventory/stock/(\d+)$#', $uri, $m) && $method === 'POST') {
    $user = verifyRole('shop_admin');
    InventoryController::updateStock($user, (int) $m[1]);
    exit;
}

http_response_code(405);
echo json_encode(["message" => "Method not allowed"]);
?>
