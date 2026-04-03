<?php
require_once __DIR__ . "/../controllers/SubscriptionController.php";
require_once __DIR__ . "/../middleware/roleMiddleware.php";

$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Handle preflight
if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ── GET /api/subscriptions/plans ──────────────────────────────────────────
if ($uri === '/api/subscriptions/plans' && $method === 'GET') {
    SubscriptionController::getPlans();
    exit;
}

// ── GET /api/subscriptions/shop/:id ───────────────────────────────────────
if (preg_match('#^/api/subscriptions/shop/(\d+)$#', $uri, $m) && $method === 'GET') {
    SubscriptionController::getShopSubscription((int) $m[1]);
    exit;
}

// ── POST /api/subscriptions/create ────────────────────────────────────────
if ($uri === '/api/subscriptions/create' && $method === 'POST') {
    SubscriptionController::createSubscription();
    exit;
}

// ── POST /api/subscriptions/:id/pause ─────────────────────────────────────
if (preg_match('#^/api/subscriptions/(\d+)/pause$#', $uri, $m) && $method === 'POST') {
    verifyRole('superadmin');
    SubscriptionController::pauseSubscription((int) $m[1]);
    exit;
}

// ── POST /api/subscriptions/:id/resume ────────────────────────────────────
if (preg_match('#^/api/subscriptions/(\d+)/resume$#', $uri, $m) && $method === 'POST') {
    verifyRole('superadmin');
    SubscriptionController::resumeSubscription((int) $m[1]);
    exit;
}

// ── GET /api/subscriptions/all ────────────────────────────────────────────
if ($uri === '/api/subscriptions/all' && $method === 'GET') {
    verifyRole('superadmin');
    SubscriptionController::getAllSubscriptions();
    exit;
}

// ── GET /api/subscriptions/status ─────────────────────────────────────────
if ($uri === '/api/subscriptions/status' && $method === 'GET') {
    verifyRole('superadmin');
    SubscriptionController::getSubscriptionStats();
    exit;
}

// If no route matched
http_response_code(404);
echo json_encode(["message" => "Subscription endpoint not found"]);
?>
