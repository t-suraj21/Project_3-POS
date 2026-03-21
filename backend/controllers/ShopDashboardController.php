<?php
require_once __DIR__ . "/../config/database.php";

class ShopDashboardController
{
    // ─── GET /api/shop/dashboard ──────────────────────────────────────────────
    public static function stats(array $user): void
    {
        global $conn;

        $shopId = (int) $user['shop_id'];

        // ── Products ──────────────────────────────────────────────────────────
        $stmt = $conn->prepare("SELECT COUNT(*) FROM products WHERE shop_id = ?");
        $stmt->execute([$shopId]);
        $totalProducts = (int) $stmt->fetchColumn();

        $stmt = $conn->prepare("SELECT COUNT(*) FROM products WHERE shop_id = ? AND stock <= alert_stock");
        $stmt->execute([$shopId]);
        $lowStockCount = (int) $stmt->fetchColumn();

        $stmt = $conn->prepare("SELECT COUNT(*) FROM categories WHERE shop_id = ?");
        $stmt->execute([$shopId]);
        $totalCategories = (int) $stmt->fetchColumn();

        // ── Customers ─────────────────────────────────────────────────────────
        $stmt = $conn->prepare("
            SELECT COUNT(DISTINCT customer_name)
            FROM sales
            WHERE shop_id = ?
              AND customer_name IS NOT NULL AND customer_name != '' AND customer_name != 'Walk-in'
        ");
        $stmt->execute([$shopId]);
        $totalCustomers = (int) $stmt->fetchColumn();

        $stmt = $conn->prepare("SELECT COUNT(*) FROM credit_customers WHERE shop_id = ?");
        $stmt->execute([$shopId]);
        $creditCustomers = (int) $stmt->fetchColumn();
        $stmt = $conn->prepare("SELECT COALESCE(SUM(remaining_balance), 0) FROM credit_customers WHERE shop_id = ?");
        $stmt->execute([$shopId]);
        $outstandingCredit = (float) $stmt->fetchColumn();

        // ── Sales counts (exclude refunded) ──────────────────────────────────
        $stmt = $conn->prepare("SELECT COUNT(*) FROM sales WHERE shop_id = ? AND status != 'refunded'");
        $stmt->execute([$shopId]);
        $salesAllTime = (int) $stmt->fetchColumn();

        $stmt = $conn->prepare("SELECT COUNT(*) FROM sales WHERE shop_id = ? AND status = 'refunded'");
        $stmt->execute([$shopId]);
        $refundedCount = (int) $stmt->fetchColumn();

        $stmt = $conn->prepare("SELECT COUNT(*) FROM sales WHERE shop_id = ? AND status IN ('partial', 'credit')");
        $stmt->execute([$shopId]);
        $pendingCount = (int) $stmt->fetchColumn();

        $stmt = $conn->prepare("SELECT COUNT(*) FROM sales WHERE shop_id = ? AND status != 'refunded' AND DATE(created_at) = CURDATE()");
        $stmt->execute([$shopId]);
        $salesToday = (int) $stmt->fetchColumn();

        $stmt = $conn->prepare("SELECT COUNT(*) FROM sales WHERE shop_id = ? AND status != 'refunded' AND YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1)");
        $stmt->execute([$shopId]);
        $salesWeek = (int) $stmt->fetchColumn();

        $stmt = $conn->prepare("SELECT COUNT(*) FROM sales WHERE shop_id = ? AND status != 'refunded' AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())");
        $stmt->execute([$shopId]);
        $salesMonth = (int) $stmt->fetchColumn();

        // ── Revenue (exclude refunded) ────────────────────────────────────────
        $stmt = $conn->prepare("SELECT COALESCE(SUM(paid_amount),0) FROM sales WHERE shop_id = ? AND status != 'refunded' AND DATE(created_at) = CURDATE()");
        $stmt->execute([$shopId]);
        $revenueToday = (float) $stmt->fetchColumn();

        $stmt = $conn->prepare("SELECT COALESCE(SUM(paid_amount),0) FROM sales WHERE shop_id = ? AND status != 'refunded' AND YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1)");
        $stmt->execute([$shopId]);
        $revenueWeek = (float) $stmt->fetchColumn();

        $stmt = $conn->prepare("SELECT COALESCE(SUM(paid_amount),0) FROM sales WHERE shop_id = ? AND status != 'refunded' AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())");
        $stmt->execute([$shopId]);
        $revenueMonth = (float) $stmt->fetchColumn();

        $stmt = $conn->prepare("SELECT COALESCE(SUM(paid_amount),0) FROM sales WHERE shop_id = ? AND status != 'refunded' AND YEAR(created_at) = YEAR(CURDATE())");
        $stmt->execute([$shopId]);
        $revenueYear = (float) $stmt->fetchColumn();

        $stmt = $conn->prepare("SELECT COALESCE(SUM(paid_amount),0) FROM sales WHERE shop_id = ? AND status != 'refunded'");
        $stmt->execute([$shopId]);
        $revenueAllTime = (float) $stmt->fetchColumn();

        // ── Payment mode breakdown (all time, exclude refunded) ───────────────
        $stmt = $conn->prepare("
            SELECT payment_mode,
                   COUNT(*) AS order_count,
                   COALESCE(SUM(paid_amount), 0) AS total_revenue
            FROM sales
            WHERE shop_id = ? AND status != 'refunded'
            GROUP BY payment_mode
            ORDER BY total_revenue DESC
        ");
        $stmt->execute([$shopId]);
        $paymentBreakdown = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // ── Top 5 selling products (by units sold, exclude refunded) ──────────
        $stmt = $conn->prepare("
            SELECT p.id, p.name, p.sku, p.sell_price, p.stock,
                   COALESCE(SUM(si.quantity), 0) AS units_sold,
                   COALESCE(SUM(si.total), 0) AS total_revenue,
                   c.name AS category_name
            FROM products p
            LEFT JOIN sale_items si ON si.product_id = p.id
            LEFT JOIN sales s ON s.id = si.sale_id AND s.status != 'refunded'
            LEFT JOIN categories c ON c.id = p.category_id
            WHERE p.shop_id = ?
            GROUP BY p.id, p.name, p.sku, p.sell_price, p.stock, c.name
            ORDER BY units_sold DESC
            LIMIT 5
        ");
        $stmt->execute([$shopId]);
        $topProducts = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // ── Low-stock product list (up to 8) ──────────────────────────────────
        $stmt = $conn->prepare("
            SELECT p.id, p.name, p.sku, p.stock, p.alert_stock, p.sell_price,
                   c.name AS category_name
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            WHERE p.shop_id = ? AND p.stock <= p.alert_stock
            ORDER BY p.stock ASC
            LIMIT 8
        ");
        $stmt->execute([$shopId]);
        $lowStockItems = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // ── Recent sales (last 10) ────────────────────────────────────────────
        $stmt = $conn->prepare("
            SELECT s.id, s.bill_number, s.total_amount, s.paid_amount,
                   s.payment_mode, s.payment_status, s.status, s.created_at,
                   COALESCE(s.customer_name, 'Walk-in') AS customer_name
            FROM sales s
            WHERE s.shop_id = ?
            ORDER BY s.created_at DESC
            LIMIT 10
        ");
        $stmt->execute([$shopId]);
        $recentSales = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "total_products"    => $totalProducts,
            "total_categories"  => $totalCategories,
            "total_customers"   => $totalCustomers,
            "credit_customers"  => $creditCustomers,
            "low_stock"         => $lowStockCount,
            "sales_all_time"    => $salesAllTime,
            "refunded_count"    => $refundedCount,
            "pending_count"     => $pendingCount,
            "outstanding_credit"=> $outstandingCredit,
            "revenue_all_time"  => $revenueAllTime,
            // sales by period (excl. refunded)
            "sales_today"       => $salesToday,
            "sales_week"        => $salesWeek,
            "sales_month"       => $salesMonth,
            // revenue by period (excl. refunded, uses paid_amount)
            "revenue_today"     => $revenueToday,
            "revenue_week"      => $revenueWeek,
            "revenue_month"     => $revenueMonth,
            "revenue_year"      => $revenueYear,
            "payment_breakdown" => $paymentBreakdown,
            "top_products"      => $topProducts,
            "low_stock_items"   => $lowStockItems,
            "recent_sales"      => $recentSales,
        ]);
    }
}
