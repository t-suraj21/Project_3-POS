<?php
require_once __DIR__ . "/../controllers/WorkerController.php";
require_once __DIR__ . "/../middleware/roleMiddleware.php";

$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') { http_response_code(204); exit; }

$user = verifyModuleAccess('workers');

// GET|POST /api/workers
if ($uri === '/api/workers') {
    if ($method === 'GET')  { WorkerController::getAll($user);  exit; }
    if ($method === 'POST') { WorkerController::create($user);  exit; }
}

// PATCH|DELETE /api/workers/:id
if (preg_match('#^/api/workers/(\d+)$#', $uri, $m)) {
    $workerId = (int) $m[1];

    if ($method === 'PATCH')  { WorkerController::updateRole($user, $workerId); exit; }
    if ($method === 'DELETE') { WorkerController::delete($user, $workerId);     exit; }
}

http_response_code(405);
echo json_encode(["message" => "Method not allowed"]);
