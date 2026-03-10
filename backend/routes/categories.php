<?php
require_once __DIR__ . "/../controllers/CategoryController.php";
require_once __DIR__ . "/../middleware/roleMiddleware.php";

$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') { http_response_code(204); exit; }

// GET /api/categories/flat  (for dropdowns)
if ($uri === '/api/categories/flat' && $method === 'GET') {
    $user = verifyRole('shop_admin');
    CategoryController::getFlat($user);
    exit;
}

// GET|POST /api/categories
if ($uri === '/api/categories') {
    $user = verifyRole('shop_admin');
    if ($method === 'GET')  { CategoryController::getAll($user);   exit; }
    if ($method === 'POST') { CategoryController::create($user);   exit; }
}

// PATCH /api/categories/:id/status  — toggle active/inactive
if (preg_match('#^/api/categories/(\d+)/status$#', $uri, $m)) {
    $user = verifyRole('shop_admin');
    $id   = (int) $m[1];
    if ($method === 'PATCH') { CategoryController::toggleStatus($user, $id); exit; }
}

// PUT|DELETE /api/categories/:id
if (preg_match('#^/api/categories/(\d+)$#', $uri, $m)) {
    $user = verifyRole('shop_admin');
    $id   = (int) $m[1];
    if ($method === 'PUT')    { CategoryController::update($user, $id); exit; }
    if ($method === 'DELETE') { CategoryController::delete($user, $id); exit; }
}

http_response_code(405);
echo json_encode(["message" => "Method not allowed"]);
?>
