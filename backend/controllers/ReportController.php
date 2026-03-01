<?php
require_once __DIR__ . "/../config/database.php";

/**
 * ReportController
 * Four report endpoints for the POS reporting page:
 *   1. Daily Sales Report     GET /api/reports/daily?date=YYYY-MM-DD
 *   2. Monthly Sales Report   GET /api/reports/monthly?year=YYYY&month=MM
 *   3. Best Products Report   GET /api/reports/best-products?from=...&to=...&limit=20
 *   4. Profit Report          GET /api/reports/profit?from=...&to=...
 */
class ReportController
{
    // ─── 1. DAILY SALES REPORT ────────────────────────────────────────────────
    // GET /api/reports/daily?date=YYYY-MM-DD
    public static function daily(array $user): void
    {
        global $conn;
        $shopId = (int) $user['shop_id'];
        $date   = $_GET['date'] ?? date('Y-m-d');

        // Validate date format
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            $date = date('Y-m-d');
        }

        // ── Summary totals for the day ────────────────────────────────────────
        $stmt = $conn->prepare("
            SELECT
                COUNT(*)                                        AS total_orders,
                COALESCE(SUM(total_amount),  0)                 AS total_revenue,
                COALESCE(SUM(paid_amount),   0)                 AS total_paid,
                COALESCE(SUM(total_amount - paid_amount), 0)    AS total_balance,
                COALESCE(SUM(discount),      0)                 AS total_discount,
                COALESCE(SUM(tax_amount),    0)                 AS total_tax,
                SUM(payment_mode = 'cash')                      AS cash_orders,
                SUM(payment_mode = 'upi')                       AS upi_orders,
                SUM(payment_mode = 'card')                      AS card_orders,
                SUM(payment_mode = 'credit')                    AS credit_orders,
                COALESCE(SUM(CASE WHEN payment_mode='cash'   THEN total_amount ELSE 0 END), 0) AS cash_revenue,
                COALESCE(SUM(CASE WHEN payment_mode='upi'    THEN total_amount ELSE 0 END), 0) AS upi_revenue,
                COALESCE(SUM(CASE WHEN payment_mode='card'   THEN total_amount ELSE 0 END), 0) AS card_revenue,
                COALESCE(SUM(CASE WHEN payment_mode='credit' THEN total_amount ELSE 0 END), 0) AS credit_revenue,
                SUM(status = 'paid')                            AS completed_orders,
                SUM(status IN ('credit','partial'))             AS pending_orders,
                SUM(status = 'refunded')                        AS refunded_orders
            FROM sales
            WHERE shop_id = ? AND DATE(created_at) = ?
              AND status != 'refunded'
        ");
        $stmt->execute([$shopId, $date]);
        $summary = $stmt->fetch(PDO::FETCH_ASSOC);

        // ── Hourly breakdown ──────────────────────────────────────────────────
        $stmt = $conn->prepare("
            SELECT
                HOUR(created_at)                    AS hour,
                COUNT(*)                            AS orders,
                COALESCE(SUM(total_amount), 0)      AS revenue
            FROM sales
            WHERE shop_id = ? AND DATE(created_at) = ?
              AND status != 'refunded'
            GROUP BY HOUR(created_at)
            ORDER BY hour ASC
        ");
        $stmt->execute([$shopId, $date]);
        $hourly = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Fill all 24 hours (so the chart has a complete array)
        $hourlyFull = array_fill(0, 24, ['hour' => 0, 'orders' => 0, 'revenue' => 0.0]);
        foreach ($hourlyFull as $h => $v) $hourlyFull[$h]['hour'] = $h;
        foreach ($hourly as $row) {
            $h = (int) $row['hour'];
            $hourlyFull[$h] = ['hour' => $h, 'orders' => (int)$row['orders'], 'revenue' => (float)$row['revenue']];
        }

        // ── All sales for the day (latest first) ──────────────────────────────
        $stmt = $conn->prepare("
            SELECT s.id, s.bill_number, s.customer_name, s.customer_phone,
                   s.total_amount, s.paid_amount, s.payment_mode, s.status,
                   s.created_at,
                   COUNT(si.id) AS item_count
            FROM sales s
            LEFT JOIN sale_items si ON si.sale_id = s.id
            WHERE s.shop_id = ? AND DATE(s.created_at) = ?
            GROUP BY s.id
            ORDER BY s.created_at DESC
        ");
        $stmt->execute([$shopId, $date]);
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "date"    => $date,
            "summary" => $summary,
            "hourly"  => array_values($hourlyFull),
            "orders"  => $orders,
        ]);
    }

    // ─── 2. MONTHLY SALES REPORT ──────────────────────────────────────────────
    // GET /api/reports/monthly?year=YYYY&month=MM
    public static function monthly(array $user): void
    {
        global $conn;
        $shopId = (int) $user['shop_id'];
        $year   = (int) ($_GET['year']  ?? date('Y'));
        $month  = (int) ($_GET['month'] ?? date('n'));

        // Clamp values
        $year  = max(2020, min(2099, $year));
        $month = max(1,    min(12,   $month));

        $daysInMonth = cal_days_in_month(CAL_GREGORIAN, $month, $year);
        $monthStr    = sprintf('%04d-%02d', $year, $month);

        // ── Monthly summary ───────────────────────────────────────────────────
        $stmt = $conn->prepare("
            SELECT
                COUNT(*)                                     AS total_orders,
                COALESCE(SUM(total_amount), 0)               AS total_revenue,
                COALESCE(SUM(paid_amount),  0)               AS total_paid,
                COALESCE(SUM(discount),     0)               AS total_discount,
                COALESCE(SUM(tax_amount),   0)               AS total_tax,
                SUM(status = 'paid')                         AS completed_orders,
                SUM(status IN ('credit','partial'))          AS pending_orders,
                SUM(status = 'refunded')                     AS refunded_orders,
                COALESCE(SUM(CASE WHEN payment_mode='cash'   THEN total_amount ELSE 0 END), 0) AS cash_revenue,
                COALESCE(SUM(CASE WHEN payment_mode='upi'    THEN total_amount ELSE 0 END), 0) AS upi_revenue,
                COALESCE(SUM(CASE WHEN payment_mode='card'   THEN total_amount ELSE 0 END), 0) AS card_revenue,
                COALESCE(SUM(CASE WHEN payment_mode='credit' THEN total_amount ELSE 0 END), 0) AS credit_revenue
            FROM sales
            WHERE shop_id = ? AND DATE_FORMAT(created_at, '%Y-%m') = ?
              AND status != 'refunded'
        ");
        $stmt->execute([$shopId, $monthStr]);
        $summary = $stmt->fetch(PDO::FETCH_ASSOC);

        // ── Previous month for comparison ─────────────────────────────────────
        $prevYear  = $month === 1 ? $year - 1 : $year;
        $prevMonth = $month === 1 ? 12 : $month - 1;
        $prevStr   = sprintf('%04d-%02d', $prevYear, $prevMonth);

        $stmt = $conn->prepare("
            SELECT
                COALESCE(SUM(total_amount), 0) AS total_revenue,
                COUNT(*)                        AS total_orders
            FROM sales
            WHERE shop_id = ? AND DATE_FORMAT(created_at, '%Y-%m') = ?
              AND status != 'refunded'
        ");
        $stmt->execute([$shopId, $prevStr]);
        $prevMonth_data = $stmt->fetch(PDO::FETCH_ASSOC);

        // ── Daily breakdown within month ──────────────────────────────────────
        $stmt = $conn->prepare("
            SELECT
                DAY(created_at)                      AS day,
                COUNT(*)                             AS orders,
                COALESCE(SUM(total_amount), 0)       AS revenue,
                COALESCE(SUM(paid_amount), 0)        AS paid
            FROM sales
            WHERE shop_id = ? AND DATE_FORMAT(created_at, '%Y-%m') = ?
              AND status != 'refunded'
            GROUP BY DAY(created_at)
            ORDER BY day ASC
        ");
        $stmt->execute([$shopId, $monthStr]);
        $dailyRows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Fill every day (1 to daysInMonth)
        $daily = [];
        $dayMap = [];
        foreach ($dailyRows as $r) $dayMap[(int)$r['day']] = $r;
        for ($d = 1; $d <= $daysInMonth; $d++) {
            $daily[] = isset($dayMap[$d])
                ? ['day' => $d, 'orders' => (int)$dayMap[$d]['orders'], 'revenue' => (float)$dayMap[$d]['revenue'], 'paid' => (float)$dayMap[$d]['paid']]
                : ['day' => $d, 'orders' => 0, 'revenue' => 0.0, 'paid' => 0.0];
        }

        // ── Week-by-week breakdown ────────────────────────────────────────────
        $stmt = $conn->prepare("
            SELECT
                CEIL(DAY(created_at) / 7)           AS week_num,
                COUNT(*)                             AS orders,
                COALESCE(SUM(total_amount), 0)       AS revenue
            FROM sales
            WHERE shop_id = ? AND DATE_FORMAT(created_at, '%Y-%m') = ?
              AND status != 'refunded'
            GROUP BY week_num
            ORDER BY week_num ASC
        ");
        $stmt->execute([$shopId, $monthStr]);
        $weekly = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "year"       => $year,
            "month"      => $month,
            "month_name" => date('F Y', mktime(0,0,0,$month,1,$year)),
            "summary"    => $summary,
            "prev_month" => $prevMonth_data,
            "daily"      => $daily,
            "weekly"     => $weekly,
        ]);
    }

    // ─── 3. BEST PRODUCTS REPORT ──────────────────────────────────────────────
    // GET /api/reports/best-products?from=YYYY-MM-DD&to=YYYY-MM-DD&limit=20
    public static function bestProducts(array $user): void
    {
        global $conn;
        $shopId = (int) $user['shop_id'];
        $from   = $_GET['from']  ?? date('Y-m-01');
        $to     = $_GET['to']    ?? date('Y-m-d');
        $limit  = min((int)($_GET['limit'] ?? 20), 100);

        // Validate dates
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $from)) $from = date('Y-m-01');
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $to))   $to   = date('Y-m-d');

        // ── Top products by quantity ──────────────────────────────────────────
        $stmt = $conn->prepare("
            SELECT
                si.product_id,
                si.product_name,
                SUM(si.quantity)                    AS total_qty,
                COALESCE(SUM(si.total), 0)          AS total_revenue,
                COALESCE(SUM(si.quantity * si.cost_price), 0) AS total_cost,
                COALESCE(SUM(si.total - si.quantity * si.cost_price), 0) AS gross_profit,
                COUNT(DISTINCT s.id)                AS times_sold,
                COALESCE(AVG(si.sell_price), 0)     AS avg_price,
                p.stock                             AS current_stock,
                c.name                              AS category_name
            FROM sale_items si
            JOIN sales s ON s.id = si.sale_id
                AND s.shop_id = ?
                AND s.status != 'refunded'
                AND DATE(s.created_at) BETWEEN ? AND ?
            LEFT JOIN products   p ON p.id = si.product_id
            LEFT JOIN categories c ON c.id = p.category_id
            GROUP BY si.product_id, si.product_name
            ORDER BY total_qty DESC
            LIMIT ?
        ");
        $stmt->execute([$shopId, $from, $to, $limit]);
        $byQty = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // ── Top products by revenue ───────────────────────────────────────────
        $stmt = $conn->prepare("
            SELECT
                si.product_id,
                si.product_name,
                SUM(si.quantity)                    AS total_qty,
                COALESCE(SUM(si.total), 0)          AS total_revenue,
                COALESCE(SUM(si.quantity * si.cost_price), 0) AS total_cost,
                COALESCE(SUM(si.total - si.quantity * si.cost_price), 0) AS gross_profit,
                COUNT(DISTINCT s.id)                AS times_sold,
                p.stock                             AS current_stock,
                c.name                              AS category_name
            FROM sale_items si
            JOIN sales s ON s.id = si.sale_id
                AND s.shop_id = ?
                AND s.status != 'refunded'
                AND DATE(s.created_at) BETWEEN ? AND ?
            LEFT JOIN products   p ON p.id = si.product_id
            LEFT JOIN categories c ON c.id = p.category_id
            GROUP BY si.product_id, si.product_name
            ORDER BY total_revenue DESC
            LIMIT ?
        ");
        $stmt->execute([$shopId, $from, $to, $limit]);
        $byRevenue = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // ── Category-level breakdown ──────────────────────────────────────────
        $stmt = $conn->prepare("
            SELECT
                COALESCE(c.name, 'Uncategorized')   AS category,
                SUM(si.quantity)                    AS total_qty,
                COALESCE(SUM(si.total), 0)          AS total_revenue,
                COUNT(DISTINCT si.product_id)       AS unique_products
            FROM sale_items si
            JOIN sales s ON s.id = si.sale_id
                AND s.shop_id = ?
                AND s.status != 'refunded'
                AND DATE(s.created_at) BETWEEN ? AND ?
            LEFT JOIN products   p ON p.id = si.product_id
            LEFT JOIN categories c ON c.id = p.category_id
            GROUP BY c.name
            ORDER BY total_revenue DESC
        ");
        $stmt->execute([$shopId, $from, $to]);
        $byCategory = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // ── Period summary ────────────────────────────────────────────────────
        $stmt = $conn->prepare("
            SELECT
                COUNT(DISTINCT s.id)                    AS total_orders,
                COALESCE(SUM(si.quantity), 0)           AS total_items_sold,
                COALESCE(SUM(si.total), 0)              AS total_revenue,
                COUNT(DISTINCT si.product_id)           AS unique_products_sold
            FROM sale_items si
            JOIN sales s ON s.id = si.sale_id
                AND s.shop_id = ?
                AND s.status != 'refunded'
                AND DATE(s.created_at) BETWEEN ? AND ?
        ");
        $stmt->execute([$shopId, $from, $to]);
        $periodSummary = $stmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            "from"            => $from,
            "to"              => $to,
            "period_summary"  => $periodSummary,
            "by_qty"          => $byQty,
            "by_revenue"      => $byRevenue,
            "by_category"     => $byCategory,
        ]);
    }

    // ─── 4. PROFIT REPORT ─────────────────────────────────────────────────────
    // GET /api/reports/profit?from=YYYY-MM-DD&to=YYYY-MM-DD
    public static function profit(array $user): void
    {
        global $conn;
        $shopId = (int) $user['shop_id'];
        $from   = $_GET['from'] ?? date('Y-m-01');
        $to     = $_GET['to']   ?? date('Y-m-d');

        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $from)) $from = date('Y-m-01');
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $to))   $to   = date('Y-m-d');

        // ── Overall profit summary ────────────────────────────────────────────
        $stmt = $conn->prepare("
            SELECT
                COUNT(DISTINCT s.id)                            AS total_orders,
                COALESCE(SUM(s.total_amount),  0)               AS total_revenue,
                COALESCE(SUM(s.paid_amount),   0)               AS total_collected,
                COALESCE(SUM(s.discount),      0)               AS total_discount,
                COALESCE(SUM(s.tax_amount),    0)               AS total_tax,
                COALESCE(SUM(si.quantity * si.cost_price), 0)   AS total_cost,
                COALESCE(SUM(si.total - si.quantity * si.cost_price), 0) AS gross_profit,
                COALESCE(SUM(s.total_amount - s.paid_amount), 0) AS pending_receivable
            FROM sales s
            JOIN sale_items si ON si.sale_id = s.id
            WHERE s.shop_id = ? AND DATE(s.created_at) BETWEEN ? AND ?
              AND s.status != 'refunded'
        ");
        $stmt->execute([$shopId, $from, $to]);
        $summary = $stmt->fetch(PDO::FETCH_ASSOC);

        // Compute margin
        $revenue = (float)($summary['total_revenue'] ?? 0);
        $cost    = (float)($summary['total_cost']    ?? 0);
        $profit  = (float)($summary['gross_profit']  ?? 0);
        $summary['profit_margin'] = $revenue > 0 ? round($profit / $revenue * 100, 2) : 0.0;
        $summary['net_profit']    = $profit - (float)($summary['total_discount'] ?? 0);

        // ── Daily profit breakdown ────────────────────────────────────────────
        $stmt = $conn->prepare("
            SELECT
                DATE(s.created_at)                              AS sale_date,
                COUNT(DISTINCT s.id)                            AS orders,
                COALESCE(SUM(s.total_amount), 0)                AS revenue,
                COALESCE(SUM(si.quantity * si.cost_price), 0)   AS cost,
                COALESCE(SUM(si.total - si.quantity * si.cost_price), 0) AS profit
            FROM sales s
            JOIN sale_items si ON si.sale_id = s.id
            WHERE s.shop_id = ? AND DATE(s.created_at) BETWEEN ? AND ?
              AND s.status != 'refunded'
            GROUP BY DATE(s.created_at)
            ORDER BY sale_date ASC
        ");
        $stmt->execute([$shopId, $from, $to]);
        $daily = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // ── Payment-mode profit split ─────────────────────────────────────────
        $stmt = $conn->prepare("
            SELECT
                s.payment_mode,
                COUNT(DISTINCT s.id)                            AS orders,
                COALESCE(SUM(s.total_amount), 0)                AS revenue,
                COALESCE(SUM(si.quantity * si.cost_price), 0)   AS cost,
                COALESCE(SUM(si.total - si.quantity * si.cost_price), 0) AS profit
            FROM sales s
            JOIN sale_items si ON si.sale_id = s.id
            WHERE s.shop_id = ? AND DATE(s.created_at) BETWEEN ? AND ?
              AND s.status != 'refunded'
            GROUP BY s.payment_mode
            ORDER BY revenue DESC
        ");
        $stmt->execute([$shopId, $from, $to]);
        $byMode = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // ── Top profitable products ───────────────────────────────────────────
        $stmt = $conn->prepare("
            SELECT
                si.product_name,
                SUM(si.quantity)                                AS total_qty,
                COALESCE(SUM(si.total), 0)                      AS revenue,
                COALESCE(SUM(si.quantity * si.cost_price), 0)   AS cost,
                COALESCE(SUM(si.total - si.quantity * si.cost_price), 0) AS profit,
                CASE WHEN SUM(si.total) > 0
                     THEN ROUND(SUM(si.total - si.quantity * si.cost_price) / SUM(si.total) * 100, 1)
                     ELSE 0 END                                 AS margin_pct
            FROM sale_items si
            JOIN sales s ON s.id = si.sale_id
                AND s.shop_id = ?
                AND s.status != 'refunded'
                AND DATE(s.created_at) BETWEEN ? AND ?
            GROUP BY si.product_id, si.product_name
            ORDER BY profit DESC
            LIMIT 15
        ");
        $stmt->execute([$shopId, $from, $to]);
        $topProducts = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "from"         => $from,
            "to"           => $to,
            "summary"      => $summary,
            "daily"        => $daily,
            "by_mode"      => $byMode,
            "top_products" => $topProducts,
        ]);
    }
}
?>
