<?php
require_once __DIR__ . "/../controllers/ProductController.php";
require_once __DIR__ . "/../middleware/roleMiddleware.php";

$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') { http_response_code(204); exit; }

// GET|POST /api/products
if ($uri === '/api/products') {
    $user = verifyRole('shop_admin');
    if ($method === 'GET')  { ProductController::getAll($user);    exit; }
    if ($method === 'POST') { ProductController::create($user);    exit; }
}

// GET|PUT|DELETE /api/products/:id
if (preg_match('#^/api/products/(\d+)$#', $uri, $m)) {
    $user = verifyRole('shop_admin');
    $id   = (int) $m[1];
    if ($method === 'GET')    { ProductController::getOne($user, $id);   exit; }
    if ($method === 'PUT')    { ProductController::update($user, $id);   exit; }
    if ($method === 'DELETE') { ProductController::delete($user, $id);   exit; }
}

http_response_code(405);
echo json_encode(["message" => "Method not allowed"]);
?>
