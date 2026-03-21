<?php
require_once __DIR__ . "/../config/database.php";

/**
 * ReportController
 * Single endpoint: GET /api/reports/summary
 * Returns:
 *   - collection  : today / week / month / year totals + payment-mode breakdown
 *   - top_products: best-selling by units and by revenue (last 30 days + all time)
 *   - low_stock   : products at or below alert threshold
 */
class ReportController
{
    public static function summary(array $user): void
    {
        global $conn;
        $shopId = (int) $user['shop_id'];

        // ════════════════════════════════════════════════════════════════
        // 1. COLLECTION SUMMARY — today / week / month / year
        // ════════════════════════════════════════════════════════════════

        $periods = [
            'today' => [
                "DATE(created_at) = CURDATE()",
            ],
            'week' => [
                "YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1)",
            ],
            'month' => [
                "MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())",
            ],
            'year' => [
                "YEAR(created_at) = YEAR(CURDATE())",
            ],
        ];

        $collection = [];
        foreach ($periods as $key => $conds) {
            $where = $conds[0];
            $stmt = $conn->prepare("
                SELECT
                    COUNT(*)                                                              AS total_orders,
                    COALESCE(SUM(total_amount), 0)                                        AS total_revenue,
                    COALESCE(SUM(paid_amount),  0)                                        AS total_collected,
                    COALESCE(SUM(total_amount - paid_amount), 0)                          AS total_balance,
                    COALESCE(SUM(discount),     0)                                        AS total_discount,
                    COALESCE(SUM(CASE WHEN payment_mode='cash'   THEN paid_amount ELSE 0 END), 0) AS cash,
                    COALESCE(SUM(CASE WHEN payment_mode='upi'    THEN paid_amount ELSE 0 END), 0) AS upi,
                    COALESCE(SUM(CASE WHEN payment_mode='card'   THEN paid_amount ELSE 0 END), 0) AS card,
                    COALESCE(SUM(CASE WHEN payment_mode='credit' THEN paid_amount ELSE 0 END), 0) AS credit,
                    SUM(payment_mode = 'cash')   AS cash_orders,
                    SUM(payment_mode = 'upi')    AS upi_orders,
                    SUM(payment_mode = 'card')   AS card_orders,
                    SUM(payment_mode = 'credit') AS credit_orders,
                    SUM(status = 'paid')         AS completed_orders,
                    SUM(status IN ('partial','credit')) AS pending_orders,
                    SUM(status = 'refunded')     AS refunded_orders
                FROM sales
                WHERE shop_id = ? AND $where AND status != 'refunded'
            ");
            $stmt->execute([$shopId]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $collection[$key] = [
                'total_orders'      => (int)   $row['total_orders'],
                'total_revenue'     => (float) $row['total_revenue'],
                'total_collected'   => (float) $row['total_collected'],
                'total_balance'     => (float) $row['total_balance'],
                'total_discount'    => (float) $row['total_discount'],
                'cash'              => (float) $row['cash'],
                'upi'               => (float) $row['upi'],
                'card'              => (float) $row['card'],
                'credit'            => (float) $row['credit'],
                'cash_orders'       => (int)   $row['cash_orders'],
                'upi_orders'        => (int)   $row['upi_orders'],
                'card_orders'       => (int)   $row['card_orders'],
                'credit_orders'     => (int)   $row['credit_orders'],
                'completed_orders'  => (int)   $row['completed_orders'],
                'pending_orders'    => (int)   $row['pending_orders'],
            ];
        }

        // Daily breakdown for current month (for the mini bar chart)
        $stmt = $conn->prepare("
            SELECT
                DAY(created_at)              AS day,
                COUNT(*)                     AS orders,
                COALESCE(SUM(total_amount),0) AS revenue
            FROM sales
            WHERE shop_id = ?
              AND MONTH(created_at) = MONTH(CURDATE())
              AND YEAR(created_at)  = YEAR(CURDATE())
              AND status != 'refunded'
            GROUP BY DAY(created_at)
            ORDER BY day ASC
        ");
        $stmt->execute([$shopId]);
        $dailyBarRaw = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $daysInMonth = (int) date('t');
        $dailyBar = [];
        $dayMap = [];
        foreach ($dailyBarRaw as $r) $dayMap[(int)$r['day']] = $r;
        for ($d = 1; $d <= $daysInMonth; $d++) {
            $dailyBar[] = [
                'day'     => $d,
                'orders'  => isset($dayMap[$d]) ? (int)   $dayMap[$d]['orders']  : 0,
                'revenue' => isset($dayMap[$d]) ? (float) $dayMap[$d]['revenue'] : 0.0,
            ];
        }

        // ════════════════════════════════════════════════════════════════
        // 2. TOP PRODUCTS — best selling (all-time, by qty & revenue)
        // ════════════════════════════════════════════════════════════════

        // By units sold (all time)
        $stmt = $conn->prepare("
            SELECT
                p.id,
                p.name,
                p.sku,
                p.sell_price,
                p.stock,
                c.name                         AS category_name,
                COALESCE(SUM(si.quantity), 0)  AS units_sold,
                COALESCE(SUM(si.total),    0)  AS total_revenue,
                COUNT(DISTINCT si.sale_id)     AS order_count
            FROM products p
            LEFT JOIN sale_items si ON si.product_id = p.id
            LEFT JOIN sales s ON s.id = si.sale_id AND s.status != 'refunded' AND s.shop_id = ?
            LEFT JOIN categories c ON c.id = p.category_id
            WHERE p.shop_id = ?
            GROUP BY p.id, p.name, p.sku, p.sell_price, p.stock, c.name
            ORDER BY units_sold DESC
            LIMIT 20
        ");
        $stmt->execute([$shopId, $shopId]);
        $topByQty = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $topByQty = array_map(function ($r) {
            return [
                'id'            => (int)   $r['id'],
                'name'          => $r['name'],
                'sku'           => $r['sku'],
                'sell_price'    => (float) $r['sell_price'],
                'stock'         => (int)   $r['stock'],
                'category_name' => $r['category_name'] ?? 'Uncategorised',
                'units_sold'    => (int)   $r['units_sold'],
                'total_revenue' => (float) $r['total_revenue'],
                'order_count'   => (int)   $r['order_count'],
            ];
        }, $topByQty);

        // By revenue (all time) — re-sort the same list
        $topByRevenue = $topByQty; // already fetched; sort by total_revenue desc
        usort($topByRevenue, fn($a, $b) => $b['total_revenue'] <=> $a['total_revenue']);

        // ════════════════════════════════════════════════════════════════
        // 3. LOW STOCK REPORT
        // ════════════════════════════════════════════════════════════════

        $stmt = $conn->prepare("
            SELECT
                p.id,
                p.name,
                p.sku,
                p.stock,
                p.alert_stock,
                p.sell_price,
                p.cost_price,
                c.name AS category_name
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            WHERE p.shop_id = ? AND p.stock <= p.alert_stock
            ORDER BY p.stock ASC, p.name ASC
        ");
        $stmt->execute([$shopId]);
        $lowStock = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $lowStock = array_map(function ($r) {
            return [
                'id'            => (int)   $r['id'],
                'name'          => $r['name'],
                'sku'           => $r['sku'],
                'stock'         => (int)   $r['stock'],
                'alert_stock'   => (int)   $r['alert_stock'],
                'sell_price'    => (float) $r['sell_price'],
                'cost_price'    => (float) $r['cost_price'],
                'category_name' => $r['category_name'] ?? 'Uncategorised',
            ];
        }, $lowStock);

        // ════════════════════════════════════════════════════════════════
        // 4. OUT-OF-STOCK COUNT
        // ════════════════════════════════════════════════════════════════
        $stmt = $conn->prepare("SELECT COUNT(*) FROM products WHERE shop_id = ? AND stock = 0");
        $stmt->execute([$shopId]);
        $outOfStockCount = (int) $stmt->fetchColumn();

        $stmt = $conn->prepare("SELECT COUNT(*) FROM products WHERE shop_id = ? AND stock > 0 AND stock <= alert_stock");
        $stmt->execute([$shopId]);
        $lowStockCount = (int) $stmt->fetchColumn();

        // ════════════════════════════════════════════════════════════════
        // ════════════════════════════════════════════════════════════════
        echo json_encode([
            'collection'       => $collection,
            'daily_bar'        => $dailyBar,
            'top_by_qty'       => $topByQty,
            'top_by_revenue'   => $topByRevenue,
            'low_stock'        => $lowStock,
            'out_of_stock_count' => $outOfStockCount,
            'low_stock_count'    => $lowStockCount,
            'generated_at'     => date('Y-m-d H:i:s'),
        ]);
    }

    // ════════════════════════════════════════════════════════════════════════
    // DATE-RANGE REPORT
    // GET /api/reports/date-range?from=YYYY-MM-DD&to=YYYY-MM-DD
    // ════════════════════════════════════════════════════════════════════════
    public static function dateRange(array $user): void
    {
        global $conn;
        $shopId = (int) $user['shop_id'];

        // Validate & default dates
        $from = $_GET['from'] ?? date('Y-m-d');
        $to   = $_GET['to']   ?? date('Y-m-d');
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $from)) $from = date('Y-m-d');
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $to))   $to   = date('Y-m-d');
        // ensure from <= to
        if ($from > $to) [$from, $to] = [$to, $from];

        // ── 1. Summary totals for the range ──────────────────────────────────
        $stmt = $conn->prepare("
            SELECT
                COUNT(*)                                                               AS total_orders,
                COALESCE(SUM(total_amount), 0)                                         AS total_revenue,
                COALESCE(SUM(paid_amount),  0)                                         AS total_collected,
                COALESCE(SUM(total_amount - paid_amount), 0)                           AS total_balance,
                COALESCE(SUM(discount), 0)                                             AS total_discount,
                COALESCE(SUM(tax_amount), 0)                                           AS total_tax,
                COALESCE(SUM(CASE WHEN payment_mode='cash'   THEN paid_amount ELSE 0 END), 0) AS cash,
                COALESCE(SUM(CASE WHEN payment_mode='upi'    THEN paid_amount ELSE 0 END), 0) AS upi,
                COALESCE(SUM(CASE WHEN payment_mode='card'   THEN paid_amount ELSE 0 END), 0) AS card,
                COALESCE(SUM(CASE WHEN payment_mode='credit' THEN paid_amount ELSE 0 END), 0) AS credit,
                SUM(payment_mode = 'cash')              AS cash_orders,
                SUM(payment_mode = 'upi')               AS upi_orders,
                SUM(payment_mode = 'card')              AS card_orders,
                SUM(payment_mode = 'credit')            AS credit_orders,
                SUM(status = 'paid')                    AS completed_orders,
                SUM(status IN ('partial','credit'))     AS pending_orders,
                SUM(status = 'refunded')                AS refunded_orders
            FROM sales
            WHERE shop_id = ?
              AND DATE(created_at) BETWEEN ? AND ?
              AND status != 'refunded'
        ");
        $stmt->execute([$shopId, $from, $to]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $summary = [
            'total_orders'     => (int)   $row['total_orders'],
            'total_revenue'    => (float) $row['total_revenue'],
            'total_collected'  => (float) $row['total_collected'],
            'total_balance'    => (float) $row['total_balance'],
            'total_discount'   => (float) $row['total_discount'],
            'total_tax'        => (float) $row['total_tax'],
            'cash'             => (float) $row['cash'],
            'upi'              => (float) $row['upi'],
            'card'             => (float) $row['card'],
            'credit'           => (float) $row['credit'],
            'cash_orders'      => (int)   $row['cash_orders'],
            'upi_orders'       => (int)   $row['upi_orders'],
            'card_orders'      => (int)   $row['card_orders'],
            'credit_orders'    => (int)   $row['credit_orders'],
            'completed_orders' => (int)   $row['completed_orders'],
            'pending_orders'   => (int)   $row['pending_orders'],
            'refunded_orders'  => (int)   $row['refunded_orders'],
        ];

        // ── 2. Day-by-day breakdown ───────────────────────────────────────────
        $stmt = $conn->prepare("
            SELECT
                DATE(created_at)               AS sale_date,
                COUNT(*)                       AS orders,
                COALESCE(SUM(total_amount), 0) AS revenue,
                COALESCE(SUM(paid_amount),  0) AS collected
            FROM sales
            WHERE shop_id = ?
              AND DATE(created_at) BETWEEN ? AND ?
              AND status != 'refunded'
            GROUP BY DATE(created_at)
            ORDER BY sale_date ASC
        ");
        $stmt->execute([$shopId, $from, $to]);
        $dailyRows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $daily = array_map(fn($r) => [
            'date'      => $r['sale_date'],
            'orders'    => (int)   $r['orders'],
            'revenue'   => (float) $r['revenue'],
            'collected' => (float) $r['collected'],
        ], $dailyRows);

        // ── 3. Top products in this range ─────────────────────────────────────
        $stmt = $conn->prepare("
            SELECT
                p.name,
                p.sku,
                c.name                        AS category_name,
                COALESCE(SUM(si.quantity), 0) AS units_sold,
                COALESCE(SUM(si.total),    0) AS total_revenue,
                COUNT(DISTINCT si.sale_id)    AS order_count
            FROM sale_items si
            JOIN sales s  ON s.id  = si.sale_id
            JOIN products p ON p.id = si.product_id
            LEFT JOIN categories c ON c.id = p.category_id
            WHERE s.shop_id = ?
              AND DATE(s.created_at) BETWEEN ? AND ?
              AND s.status != 'refunded'
            GROUP BY p.id, p.name, p.sku, c.name
            ORDER BY units_sold DESC
            LIMIT 15
        ");
        $stmt->execute([$shopId, $from, $to]);
        $topProductsRaw = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $topProducts = array_map(fn($r) => [
            'name'          => $r['name'],
            'sku'           => $r['sku'],
            'category_name' => $r['category_name'] ?? 'Uncategorised',
            'units_sold'    => (int)   $r['units_sold'],
            'total_revenue' => (float) $r['total_revenue'],
            'order_count'   => (int)   $r['order_count'],
        ], $topProductsRaw);

        // ── 4. Individual orders in the range (latest first, max 200) ─────────
        $stmt = $conn->prepare("
            SELECT
                s.id, s.bill_number,
                COALESCE(s.customer_name, 'Walk-in') AS customer_name,
                s.customer_phone,
                s.total_amount, s.paid_amount,
                s.payment_mode, s.status,
                s.created_at,
                COUNT(si.id) AS item_count
            FROM sales s
            LEFT JOIN sale_items si ON si.sale_id = s.id
            WHERE s.shop_id = ?
              AND DATE(s.created_at) BETWEEN ? AND ?
            GROUP BY s.id
            ORDER BY s.created_at DESC
            LIMIT 200
        ");
        $stmt->execute([$shopId, $from, $to]);
        $orders = array_map(fn($r) => [
            'id'            => (int)   $r['id'],
            'bill_number'   => $r['bill_number'],
            'customer_name' => $r['customer_name'],
            'customer_phone'=> $r['customer_phone'],
            'total_amount'  => (float) $r['total_amount'],
            'paid_amount'   => (float) $r['paid_amount'],
            'payment_mode'  => $r['payment_mode'],
            'status'        => $r['status'],
            'created_at'    => $r['created_at'],
            'item_count'    => (int)   $r['item_count'],
        ], $stmt->fetchAll(PDO::FETCH_ASSOC));

        echo json_encode([
            'from'         => $from,
            'to'           => $to,
            'summary'      => $summary,
            'daily'        => $daily,
            'top_products' => $topProducts,
            'orders'       => $orders,
        ]);
    }
}
