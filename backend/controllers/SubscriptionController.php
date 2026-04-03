<?php
/**
 * SubscriptionController – Manage shop subscriptions
 *
 * Handles:
 * - Creating subscriptions (after payment)
 * - Pausing/resuming subscriptions
 * - Checking subscription status
 * - Listing all subscriptions (for superadmin)
 */

require_once __DIR__ . "/../config/database.php";

class SubscriptionController
{
    /**
     * GET /api/subscriptions/plans
     * Fetch all available subscription plans
     */
    public static function getPlans(): void
    {
        global $conn;

        $stmt = $conn->query("
            SELECT id, name, duration, price, active
            FROM subscription_plans
            WHERE active = TRUE
            ORDER BY duration ASC
        ");

        $plans = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($plans);
    }

    /**
     * GET /api/subscriptions/shop/:id
     * Get subscription details for a specific shop
     */
    public static function getShopSubscription(int $shopId): void
    {
        global $conn;

        $stmt = $conn->prepare("
            SELECT s.*, sp.price, sp.duration
            FROM subscriptions s
            LEFT JOIN subscription_plans sp ON s.plan_name = sp.name
            WHERE s.shop_id = ?
            ORDER BY s.created_at DESC
            LIMIT 1
        ");
        $stmt->execute([$shopId]);
        $subscription = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$subscription) {
            http_response_code(404);
            echo json_encode(["message" => "No subscription found for this shop"]);
            return;
        }

        // Calculate remaining days
        $endDate = strtotime($subscription['end_date']);
        $now = time();
        $subscription['days_remaining'] = max(0, intdiv($endDate - $now, 86400));
        $subscription['is_expired'] = $endDate < $now;

        echo json_encode($subscription);
    }

    /**
     * POST /api/subscriptions/create
     * Create a new subscription for a shop (after payment)
     */
    public static function createSubscription(): void
    {
        global $conn;

        $data = json_decode(file_get_contents("php://input"));

        // Validate required fields
        $required = ['shop_id', 'plan_name', 'payment_id'];
        foreach ($required as $field) {
            if (empty($data->$field)) {
                http_response_code(422);
                echo json_encode(["message" => "Missing required field: $field"]);
                return;
            }
        }

        $shopId = (int) $data->shop_id;
        $planName = $data->plan_name;
        $paymentId = $data->payment_id;

        // Verify shop exists
        $shopStmt = $conn->prepare("SELECT id FROM shops WHERE id = ?");
        $shopStmt->execute([$shopId]);
        if (!$shopStmt->fetch()) {
            http_response_code(404);
            echo json_encode(["message" => "Shop not found"]);
            return;
        }

        // Get plan details
        $planStmt = $conn->prepare("
            SELECT id, duration, price FROM subscription_plans
            WHERE name = ? AND active = TRUE
        ");
        $planStmt->execute([$planName]);
        $plan = $planStmt->fetch();

        if (!$plan) {
            http_response_code(404);
            echo json_encode(["message" => "Invalid or inactive plan"]);
            return;
        }

        try {
            $conn->beginTransaction();

            $startDate = date('Y-m-d H:i:s');
            $endDate = date('Y-m-d H:i:s', strtotime("+{$plan['duration']} days"));

            // Create subscription record
            $stmt = $conn->prepare("
                INSERT INTO subscriptions
                    (shop_id, plan_name, plan_duration_days, amount, start_date, end_date, status, payment_id, payment_status)
                 VALUES (?, ?, ?, ?, ?, ?, 'active', ?, 'completed')
            ");
            $stmt->execute([
                $shopId,
                $planName,
                $plan['duration'],
                $plan['price'],
                $startDate,
                $endDate,
                $paymentId,
            ]);

            // Update shop subscription status
            $updateStmt = $conn->prepare("
                UPDATE shops
                SET subscription_status = 'active', 
                    subscription_plan_name = ?,
                    subscription_end_date = ?
                WHERE id = ?
            ");
            $updateStmt->execute([$planName, $endDate, $shopId]);

            $conn->commit();

            http_response_code(201);
            echo json_encode([
                "message" => "Subscription created successfully",
                "subscription_id" => $conn->lastInsertId(),
                "end_date" => $endDate,
            ]);

        } catch (\Exception $e) {
            $conn->rollBack();
            http_response_code(500);
            echo json_encode(["message" => "Failed to create subscription: " . $e->getMessage()]);
        }
    }

    /**
     * POST /api/subscriptions/:id/pause
     * Pause a subscription
     */
    public static function pauseSubscription(int $subscriptionId): void
    {
        global $conn;

        $stmt = $conn->prepare("
            SELECT * FROM subscriptions WHERE id = ?
        ");
        $stmt->execute([$subscriptionId]);
        $subscription = $stmt->fetch();

        if (!$subscription) {
            http_response_code(404);
            echo json_encode(["message" => "Subscription not found"]);
            return;
        }

        if ($subscription['status'] === 'paused') {
            http_response_code(400);
            echo json_encode(["message" => "Subscription is already paused"]);
            return;
        }

        if ($subscription['status'] !== 'active') {
            http_response_code(400);
            echo json_encode(["message" => "Cannot pause subscription with status: " . $subscription['status']]);
            return;
        }

        try {
            $conn->beginTransaction();

            $pausedAt = date('Y-m-d H:i:s');

            $updateStmt = $conn->prepare("
                UPDATE subscriptions
                SET status = 'paused', paused_at = ?
                WHERE id = ?
            ");
            $updateStmt->execute([$pausedAt, $subscriptionId]);

            // Update shop status
            $shopStmt = $conn->prepare("
                UPDATE shops
                SET subscription_status = 'paused'
                WHERE id = ?
            ");
            $shopStmt->execute([$subscription['shop_id']]);

            $conn->commit();

            http_response_code(200);
            echo json_encode(["message" => "Subscription paused successfully"]);

        } catch (\Exception $e) {
            $conn->rollBack();
            http_response_code(500);
            echo json_encode(["message" => "Failed to pause subscription: " . $e->getMessage()]);
        }
    }

    /**
     * POST /api/subscriptions/:id/resume
     * Resume a paused subscription
     */
    public static function resumeSubscription(int $subscriptionId): void
    {
        global $conn;

        $stmt = $conn->prepare("
            SELECT * FROM subscriptions WHERE id = ?
        ");
        $stmt->execute([$subscriptionId]);
        $subscription = $stmt->fetch();

        if (!$subscription) {
            http_response_code(404);
            echo json_encode(["message" => "Subscription not found"]);
            return;
        }

        if ($subscription['status'] !== 'paused') {
            http_response_code(400);
            echo json_encode(["message" => "Subscription is not paused"]);
            return;
        }

        try {
            $conn->beginTransaction();

            // Calculate new end date by extending with paused duration
            $pausedAt = strtotime($subscription['paused_at']);
            $now = time();
            $totalPausedDays = intdiv($now - $pausedAt, 86400);
            $oldEndDate = strtotime($subscription['end_date']);
            $newEndDate = date('Y-m-d H:i:s', $oldEndDate + ($totalPausedDays * 86400));

            $updateStmt = $conn->prepare("
                UPDATE subscriptions
                SET status = 'active', 
                    paused_at = NULL,
                    end_date = ?,
                    paused_duration = paused_duration + ?
                WHERE id = ?
            ");
            $updateStmt->execute([$newEndDate, $totalPausedDays, $subscriptionId]);

            // Update shop status
            $shopStmt = $conn->prepare("
                UPDATE shops
                SET subscription_status = 'active', subscription_end_date = ?
                WHERE id = ?
            ");
            $shopStmt->execute([$newEndDate, $subscription['shop_id']]);

            $conn->commit();

            http_response_code(200);
            echo json_encode([
                "message" => "Subscription resumed successfully",
                "new_end_date" => $newEndDate,
            ]);

        } catch (\Exception $e) {
            $conn->rollBack();
            http_response_code(500);
            echo json_encode(["message" => "Failed to resume subscription: " . $e->getMessage()]);
        }
    }

    /**
     * GET /api/subscriptions/all
     * Get all subscriptions (superadmin only)
     */
    public static function getAllSubscriptions(): void
    {
        global $conn;

        $stmt = $conn->query("
            SELECT s.id, s.shop_id, s.plan_name, s.amount, s.start_date, s.end_date, 
                   s.status, s.paused_at, 
                   sh.name as shop_name, sh.email as shop_email, sh.phone as shop_phone
            FROM subscriptions s
            JOIN shops sh ON s.shop_id = sh.id
            ORDER BY s.created_at DESC
        ");

        $subscriptions = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Add calculated fields
        foreach ($subscriptions as &$sub) {
            $endDate = strtotime($sub['end_date']);
            $now = time();
            $sub['days_remaining'] = max(0, intdiv($endDate - $now, 86400));
            $sub['is_expired'] = $endDate < $now;
        }

        echo json_encode($subscriptions);
    }

    /**
     * GET /api/subscriptions/status
     * Get subscription stats for dashboard
     */
    public static function getSubscriptionStats(): void
    {
        global $conn;

        $stats = [];

        // Active subscriptions
        $stmt = $conn->query("SELECT COUNT(*) as count FROM subscriptions WHERE status = 'active'");
        $stats['active'] = $stmt->fetch()['count'];

        // Paused subscriptions
        $stmt = $conn->query("SELECT COUNT(*) as count FROM subscriptions WHERE status = 'paused'");
        $stats['paused'] = $stmt->fetch()['count'];

        // Expired subscriptions
        $stmt = $conn->query("SELECT COUNT(*) as count FROM subscriptions WHERE end_date < NOW() AND status != 'expired'");
        $stats['expiring_soon'] = $stmt->fetch()['count'];

        // Total revenue
        $stmt = $conn->query("SELECT SUM(amount) as total FROM subscriptions WHERE status IN ('active', 'completed')");
        $result = $stmt->fetch();
        $stats['total_revenue'] = (float) ($result['total'] ?? 0);

        echo json_encode($stats);
    }
}
?>
