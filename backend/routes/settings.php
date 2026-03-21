<?php
require_once __DIR__ . "/../controllers/ShopSettingsController.php";
require_once __DIR__ . "/../middleware/roleMiddleware.php";

$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') { http_response_code(204); exit; }

// GET /api/billing-layouts (no auth required - public endpoint)
if ($uri === '/api/billing-layouts' && $method === 'GET') {
    ShopSettingsController::getBillingLayouts();
    exit;
}

// All other endpoints require authentication
$user = verifyModuleAccess('settings');

// GET /api/settings
if ($uri === '/api/settings' && $method === 'GET') {
    ShopSettingsController::get($user);
    exit;
}

// POST /api/settings  (multipart form-data)
if ($uri === '/api/settings' && $method === 'POST') {
    ShopSettingsController::update($user);
    exit;
}

// DELETE /api/settings
if ($uri === '/api/settings' && $method === 'DELETE') {
    ShopSettingsController::deleteShop($user);
    exit;
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
