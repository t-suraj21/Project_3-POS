<?php
require_once __DIR__ . "/../config/database.php";

class NotificationController
{
    /**
     * GET /api/notifications — Get all notifications for a shop
     * Returns unread notifications first, then read ones
     * Can optionally filter by type
     */
    public static function getNotifications(array $user): void
    {
        global $conn;

        $shopId = (int) $user['shop_id'];
        $limit = isset($_GET['limit']) ? (int) $_GET['limit'] : 20;
        $offset = isset($_GET['offset']) ? (int) $_GET['offset'] : 0;
        $type = isset($_GET['type']) ? $_GET['type'] : null;

        $limit = max(1, min($limit, 200));
        $offset = max(0, $offset);

        // Build query
        $query = "
            SELECT *
            FROM notifications
            WHERE shop_id = :shop_id
        ";

        if ($type) {
            $query .= " AND type = :type";
        }

        $query .= " ORDER BY is_read ASC, created_at DESC LIMIT :limit OFFSET :offset";

        $stmt = $conn->prepare($query);
        $stmt->bindValue(':shop_id', $shopId, PDO::PARAM_INT);
        if ($type) {
            $stmt->bindValue(':type', $type, PDO::PARAM_STR);
        }
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Get unread count
        $stmt = $conn->prepare("SELECT COUNT(*) FROM notifications WHERE shop_id = ? AND is_read = 0");
        $stmt->execute([$shopId]);
        $unreadCount = (int) $stmt->fetchColumn();

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => $notifications,
            'unread_count' => $unreadCount,
            'total_count' => count($notifications)
        ]);
    }

    /**
     * POST /api/notifications/:id/read — Mark a notification as read
     */
    public static function markAsRead(): void
    {
        global $conn;

        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        // Extract notification ID from /api/notifications/{id}/read
        if (preg_match('/\/api\/notifications\/(\d+)\/read/', $uri, $matches)) {
            $notificationId = (int) $matches[1];
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid notification ID']);
            return;
        }

        $stmt = $conn->prepare("
            UPDATE notifications
            SET is_read = 1, read_at = NOW()
            WHERE id = ?
        ");

        if ($stmt->execute([$notificationId])) {
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'Notification marked as read']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update notification']);
        }
    }

    /**
     * POST /api/notifications/mark-all-read — Mark all notifications as read for a shop
     */
    public static function markAllAsRead(array $user): void
    {
        global $conn;

        $shopId = (int) $user['shop_id'];

        $stmt = $conn->prepare("
            UPDATE notifications
            SET is_read = 1, read_at = NOW()
            WHERE shop_id = ? AND is_read = 0
        ");

        if ($stmt->execute([$shopId])) {
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'All notifications marked as read']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update notifications']);
        }
    }

    /**
     * GET /api/notifications/summary — Get notification summary for navbar
     * Returns counts by type and critical notifications
     */
    public static function getSummary(array $user): void
    {
        global $conn;

        $shopId = (int) $user['shop_id'];

        // Get unread count by type
        $stmt = $conn->prepare("
            SELECT type, COUNT(*) as count
            FROM notifications
            WHERE shop_id = ? AND is_read = 0
            GROUP BY type
        ");
        $stmt->execute([$shopId]);
        $countByType = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

        // Get unread count
        $stmt = $conn->prepare("SELECT COUNT(*) FROM notifications WHERE shop_id = ? AND is_read = 0");
        $stmt->execute([$shopId]);
        $totalUnread = (int) $stmt->fetchColumn();

        // Get critical unread notifications (limit to 5)
        $stmt = $conn->prepare("
            SELECT id, type, title, message, priority, created_at
            FROM notifications
            WHERE shop_id = ? AND is_read = 0
            ORDER BY priority = 'critical' DESC, created_at DESC
            LIMIT 5
        ");
        $stmt->execute([$shopId]);
        $critical = $stmt->fetchAll(PDO::FETCH_ASSOC);

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'unread_count' => $totalUnread,
            'count_by_type' => $countByType,
            'critical_notifications' => $critical
        ]);
    }

    /**
     * Internal: Create a notification (called by system)
     * This is used internally when events occur (stock alert, refund, etc.)
     * Prevents duplicate notifications for same entity within 1 hour
     */
    public static function createNotification(
        int $shopId,
        string $type,
        string $title,
        string $message,
        ?string $relatedEntityType = null,
        ?int $relatedEntityId = null,
        ?string $actionUrl = null,
        string $priority = 'medium'
    ): bool {
        global $conn;

        // Check for duplicate unread notification within last 1 hour
        if ($relatedEntityType && $relatedEntityId) {
            $checkStmt = $conn->prepare("
                SELECT id FROM notifications
                WHERE shop_id = ? 
                  AND type = ?
                  AND related_entity_type = ?
                  AND related_entity_id = ?
                  AND is_read = 0
                  AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
                LIMIT 1
            ");
            $checkStmt->execute([$shopId, $type, $relatedEntityType, $relatedEntityId]);
            
            if ($checkStmt->rowCount() > 0) {
                // Duplicate notification already exists, don't create another
                return false;
            }
        }

        $stmt = $conn->prepare("
            INSERT INTO notifications
            (shop_id, type, title, message, related_entity_type, related_entity_id, action_url, priority)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");

        return $stmt->execute([
            $shopId,
            $type,
            $title,
            $message,
            $relatedEntityType,
            $relatedEntityId,
            $actionUrl,
            $priority
        ]);
    }

    /**
     * Internal: Delete old read notifications (older than 30 days)
     * Can be called via cron job
     */
    public static function cleanupOldNotifications(): void
    {
        global $conn;

        $stmt = $conn->prepare("
            DELETE FROM notifications
            WHERE is_read = 1 AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
        ");

        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'Old notifications cleaned up']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to cleanup notifications']);
        }
    }

    /**
     * Internal: Check and create stock alert notifications
     * Should be called when products are created/updated or stock changes
     */
    public static function checkStockAlerts(int $shopId): void
    {
        global $conn;

        // Check for products with stock <= alert_stock
        $stmt = $conn->prepare("
            SELECT id, name, stock, alert_stock
            FROM products
            WHERE shop_id = ? AND stock <= alert_stock AND is_available = 1
            AND id NOT IN (
                SELECT related_entity_id FROM notifications
                WHERE shop_id = ? AND type = 'low_stock'
                AND is_read = 0 AND created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)
            )
        ");
        $stmt->execute([$shopId, $shopId]);
        $lowStockProducts = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($lowStockProducts as $product) {
            self::createNotification(
                $shopId,
                'low_stock',
                'Low Stock Alert',
                "{$product['name']} stock is {$product['stock']} (alert: {$product['alert_stock']})",
                'product',
                $product['id'],
                '/inventory',
                'high'
            );
        }
    }
}
