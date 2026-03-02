<?php
// ── Webhook routes — NO JWT auth (verified by HMAC in controller) ─────────────
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../controllers/RazorpayController.php";

$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'OPTIONS') { http_response_code(204); exit; }

// POST /api/webhooks/razorpay
if ($uri === '/api/webhooks/razorpay' && $method === 'POST') {
    RazorpayController::webhook();
    exit;
}

http_response_code(404);
echo json_encode(["error" => "Webhook route not found"]);
