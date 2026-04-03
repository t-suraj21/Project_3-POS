<?php
require_once __DIR__ . "/../controllers/NotificationController.php";
require_once __DIR__ . "/../middleware/authMiddleware.php";

$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Handle preflight CORS request
if ($method === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// GET /api/notifications — Get notifications for current shop
if ($uri === '/api/notifications' && $method === 'GET') {
    $user = authenticate();
    NotificationController::getNotifications($user);
    exit;
}

// GET /api/notifications/summary — Get notification summary for navbar
if ($uri === '/api/notifications/summary' && $method === 'GET') {
    $user = authenticate();
    NotificationController::getSummary($user);
    exit;
}

// POST /api/notifications/{id}/read — Mark notification as read
if (preg_match('/^\/api\/notifications\/\d+\/read$/', $uri) && $method === 'POST') {
    $user = authenticate();
    NotificationController::markAsRead();
    exit;
}

// POST /api/notifications/mark-all-read — Mark all as read
if ($uri === '/api/notifications/mark-all-read' && $method === 'POST') {
    $user = authenticate();
    NotificationController::markAllAsRead($user);
    exit;
}

// POST /api/notifications/cleanup — Clean up old notifications (internal)
if ($uri === '/api/notifications/cleanup' && $method === 'POST') {
    $user = authenticate();
    NotificationController::cleanupOldNotifications();
    exit;
}

// POST /api/notifications/test — Create a test notification (for debugging)
if ($uri === '/api/notifications/test' && $method === 'POST') {
    $user = authenticate();
    $shopId = (int) $user['shop_id'];
    
    // Create a test notification
    NotificationController::createNotification(
        $shopId,
        'general',
        '🧪 Test Notification',
        'This is a test notification to verify the system is working correctly.',
        null,
        null,
        null,
        'high'
    );
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Test notification created successfully',
        'shop_id' => $shopId
    ]);
    exit;
}
