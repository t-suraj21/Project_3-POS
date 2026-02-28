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
        $stmt = $conn->prepare("SELECT COUNT(*) FROM customers WHERE shop_id = ?");
        $stmt->execute([$shopId]);
        $totalCustomers = (int) $stmt->fetchColumn();

        // ── Sales counts ─────────────────────────────────────────────────────
        $stmt = $conn->prepare("SELECT COUNT(*) FROM sales WHERE shop_id = ? AND DATE(created_at) = CURDATE()");
        $stmt->execute([$shopId]);
        $salesToday = (int) $stmt->fetchColumn();

        $stmt = $conn->prepare("SELECT COUNT(*) FROM sales WHERE shop_id = ? AND YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1)");
        $stmt->execute([$shopId]);
        $salesWeek = (int) $stmt->fetchColumn();

        $stmt = $conn->prepare("SELECT COUNT(*) FROM sales WHERE shop_id = ? AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())");
        $stmt->execute([$shopId]);
        $salesMonth = (int) $stmt->fetchColumn();

        // ── Revenue ───────────────────────────────────────────────────────────
        $stmt = $conn->prepare("SELECT COALESCE(SUM(total_amount),0) FROM sales WHERE shop_id = ? AND DATE(created_at) = CURDATE()");
        $stmt->execute([$shopId]);
        $revenueToday = (float) $stmt->fetchColumn();

        $stmt = $conn->prepare("SELECT COALESCE(SUM(total_amount),0) FROM sales WHERE shop_id = ? AND YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1)");
        $stmt->execute([$shopId]);
        $revenueWeek = (float) $stmt->fetchColumn();

        $stmt = $conn->prepare("SELECT COALESCE(SUM(total_amount),0) FROM sales WHERE shop_id = ? AND MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())");
        $stmt->execute([$shopId]);
        $revenueMonth = (float) $stmt->fetchColumn();

        $stmt = $conn->prepare("SELECT COALESCE(SUM(total_amount),0) FROM sales WHERE shop_id = ? AND YEAR(created_at) = YEAR(CURDATE())");
        $stmt->execute([$shopId]);
        $revenueYear = (float) $stmt->fetchColumn();

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

        echo json_encode([
            // products
            "total_products"   => $totalProducts,
            "total_categories" => $totalCategories,
            "total_customers"  => $totalCustomers,
            "low_stock"        => $lowStockCount,
            // sales by period
            "sales_today"      => $salesToday,
            "sales_week"       => $salesWeek,
            "sales_month"      => $salesMonth,
            // revenue by period
            "revenue_today"    => $revenueToday,
            "revenue_week"     => $revenueWeek,
            "revenue_month"    => $revenueMonth,
            "revenue_year"     => $revenueYear,
            // low stock details
            "low_stock_items"  => $lowStockItems,
        ]);
    }
}
?>

        // Total products
        $stmt = $conn->prepare("SELECT COUNT(*) FROM products WHERE shop_id = ?");
        $stmt->execute([$shopId]);
        $totalProducts = (int) $stmt->fetchColumn();

        // Products at or below alert stock
        $stmt = $conn->prepare("SELECT COUNT(*) FROM products WHERE shop_id = ? AND stock <= alert_stock");
        $stmt->execute([$shopId]);
        $lowStock = (int) $stmt->fetchColumn();

        // Total categories
        $stmt = $conn->prepare("SELECT COUNT(*) FROM categories WHERE shop_id = ? AND parent_id IS NULL");
        $stmt->execute([$shopId]);
        $totalCategories = (int) $stmt->fetchColumn();

        // Total revenue
        $stmt = $conn->prepare("SELECT COALESCE(SUM(total_amount), 0) FROM sales WHERE shop_id = ?");
        $stmt->execute([$shopId]);
        $totalRevenue = (float) $stmt->fetchColumn();

        // Recent low-stock products (up to 5)
        $stmt = $conn->prepare("
            SELECT p.id, p.name, p.sku, p.stock, p.alert_stock, p.sell_price,
                   c.name AS category_name
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            WHERE p.shop_id = ? AND p.stock <= p.alert_stock
            ORDER BY p.stock ASC
            LIMIT 5
        ");
        $stmt->execute([$shopId]);
        $lowStockProducts = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "total_products"   => $totalProducts,
            "low_stock"        => $lowStock,
            "total_categories" => $totalCategories,
            "total_revenue"    => $totalRevenue,
            "low_stock_items"  => $lowStockProducts,
        ]);
    }
}
?>
