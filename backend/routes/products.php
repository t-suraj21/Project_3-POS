<?php
require_once __DIR__ . "/../controllers/ProductController.php";
require_once __DIR__ . "/../middleware/roleMiddleware.php";

$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') { http_response_code(204); exit; }

// GET|POST /api/products
if ($uri === '/api/products') {
    $user = verifyModuleAccess('products');
    if ($method === 'GET')  { ProductController::getAll($user);    exit; }
    if ($method === 'POST') { ProductController::create($user);    exit; }
}

// PATCH /api/products/:id/status  — toggle available / unavailable
if (preg_match('#^/api/products/(\d+)/status$#', $uri, $m)) {
    $user = verifyModuleAccess('products');
    $id   = (int) $m[1];
    if ($method === 'PATCH') { ProductController::toggleStatus($user, $id); exit; }
}

// GET|POST(_method=PUT)|PUT|DELETE /api/products/:id
if (preg_match('#^/api/products/(\d+)$#', $uri, $m)) {
    $user = verifyModuleAccess('products');
    $id   = (int) $m[1];
    if ($method === 'GET')    { ProductController::getOne($user, $id);   exit; }
    // Support POST with _method=PUT override (PHP doesn't parse $_POST for PUT multipart)
    if ($method === 'PUT' || ($method === 'POST' && ($_POST['_method'] ?? '') === 'PUT')) {
        ProductController::update($user, $id);
        exit;
    }
    if ($method === 'DELETE') { ProductController::delete($user, $id);   exit; }
}

http_response_code(405);
echo json_encode(["message" => "Method not allowed"]);
?>
