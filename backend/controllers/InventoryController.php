<?php
/**
 * InventoryController.php — Inventory & Stock Management
 *
 * This controller is the backbone of the inventory feature. It manages all
 * stock-related operations for a shop:
 *
 *   GET  /api/inventory/stock          — Paginated / searchable full stock list
 *   GET  /api/inventory/low-stock      — Products currently at or below alert level
 *   POST /api/inventory/stock/:id      — Update stock for a single product & log history
 *   GET  /api/inventory/history        — Stock change history (all products or one)
 *   GET  /api/inventory/summary        — Quick KPI cards (total SKUs, stock value, etc.)
 *
 * Every method is scoped to the authenticated shop via $user['shop_id'],
 * so a shop owner can never see or modify another shop's inventory.
 */
require_once __DIR__ . "/../config/database.php";

class InventoryController
{
    // GET /api/inventory/summary
    /**
     * Return high-level KPI numbers for the inventory dashboard cards.
     *
     * Returns:
     *   total_products    — how many active products the shop has
     *   total_stock_units — sum of all stock quantities
     *   low_stock_count   — products at or below their individual alert levels
     *   out_of_stock      — products with stock = 0
     *   stock_value       — total inventory value at cost price (cost × stock)
     *   retail_value      — total inventory value at sell price (sell × stock)
     */
    public static function getSummary(array $user): void
    {
        global $conn;
        $shopId = (int) $user['shop_id'];

        $stmt = $conn->prepare("
            SELECT
                COUNT(*)                                          AS total_products,
                COALESCE(SUM(stock), 0)                          AS total_stock_units,
                SUM(stock <= alert_stock AND stock > 0)          AS low_stock_count,
                SUM(stock = 0)                                    AS out_of_stock,
                COALESCE(SUM(cost_price * stock), 0)              AS stock_value,
                COALESCE(SUM(sell_price * stock), 0)              AS retail_value
            FROM products
            WHERE shop_id = ?
        ");
        $stmt->execute([$shopId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode([
            "total_products"    => (int)   $row['total_products'],
            "total_stock_units" => (int)   $row['total_stock_units'],
            "low_stock_count"   => (int)   $row['low_stock_count'],
            "out_of_stock"      => (int)   $row['out_of_stock'],
            "stock_value"       => (float) $row['stock_value'],
            "retail_value"      => (float) $row['retail_value'],
        ]);
    }
    // GET /api/inventory/stock
    /**
     * Return the complete stock list for the authenticated shop.
     *
     * This powers the "Stock List" tab. Every product is returned with its
     * current stock, alert level, and a computed "status" so the frontend
     * doesn't have to re-derive it:
     *   out_of_stock — stock === 0
     *   low_stock    — 0 < stock <= alert_stock
     *   in_stock     — stock > alert_stock
     *
     * Supports optional query params:
     *   ?search=<text>      — filter by product name / SKU / barcode
     *   ?category_id=<id>   — filter by category
     *   ?status=low|out     — only low-stock or out-of-stock products
     *   ?sort=name|stock|value  — sort column (default: name)
     */
    public static function getStockList(array $user): void
    {
        global $conn;
        $shopId = (int) $user['shop_id'];

        $search   = trim($_GET['search']      ?? '');
        $catId    = isset($_GET['category_id']) && $_GET['category_id'] !== '' ? (int) $_GET['category_id'] : null;
        $status   = $_GET['status']   ?? '';        // 'low', 'out', or ''
        $sort     = $_GET['sort']     ?? 'name';    // 'name', 'stock', 'value'

        $where  = ["p.shop_id = ?"];
        $params = [$shopId];

        if ($search !== '') {
            $where[]  = "(p.name LIKE ? OR p.sku LIKE ? OR p.barcode LIKE ?)";
            $like     = "%{$search}%";
            array_push($params, $like, $like, $like);
        }
        if ($catId !== null) {
            $where[]  = "p.category_id = ?";
            $params[] = $catId;
        }
        if ($status === 'low') {
            $where[] = "p.stock > 0 AND p.stock <= p.alert_stock";
        } elseif ($status === 'out') {
            $where[] = "p.stock = 0";
        }

        $whereSQL = implode(' AND ', $where);

        $orderSQL = match($sort) {
            'stock' => "p.stock ASC",
            'value' => "(p.sell_price * p.stock) DESC",
            default  => "p.name ASC",
        };

        $stmt = $conn->prepare("
            SELECT
                p.id, p.name, p.sku, p.barcode, p.image,
                p.stock, p.alert_stock,
                p.cost_price, p.sell_price,
                p.is_available,
                ROUND(p.sell_price * p.stock, 2)  AS stock_value,
                c.name                             AS category_name,
                CASE
                    WHEN p.stock = 0            THEN 'out_of_stock'
                    WHEN p.stock <= p.alert_stock THEN 'low_stock'
                    ELSE                             'in_stock'
                END AS stock_status
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            WHERE {$whereSQL}
            ORDER BY {$orderSQL}
        ");
        $stmt->execute($params);
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($products as &$p) {
            $p['stock']       = (int)   $p['stock'];
            $p['alert_stock'] = (int)   $p['alert_stock'];
            $p['cost_price']  = (float) $p['cost_price'];
            $p['sell_price']  = (float) $p['sell_price'];
            $p['stock_value'] = (float) $p['stock_value'];
            $p['is_available'] = (bool) $p['is_available'];
        }
        unset($p);

        echo json_encode(["products" => $products, "total" => count($products)]);
    }
    // GET /api/inventory/low-stock
    /**
     * Return only products that are at or below their alert stock level.
     *
     * This powers the "Low Stock Warning" tab. We include out-of-stock items
     * here too because they're equally urgent — the difference is the status
     * label ("out_of_stock" vs "low_stock").
     *
     * Results are sorted most-urgent first: out-of-stock at the top,
     * then ascending by remaining stock so the shop owner sees what needs
     * restocking soonest.
     */
    public static function getLowStock(array $user): void
    {
        global $conn;
        $shopId = (int) $user['shop_id'];

        $stmt = $conn->prepare("
            SELECT
                p.id, p.name, p.sku, p.image,
                p.stock, p.alert_stock,
                p.sell_price,
                c.name AS category_name,
                CASE
                    WHEN p.stock = 0            THEN 'out_of_stock'
                    WHEN p.stock <= p.alert_stock THEN 'low_stock'
                END AS stock_status
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            WHERE p.shop_id = ? AND p.stock <= p.alert_stock
            ORDER BY p.stock ASC, p.name ASC
        ");
        $stmt->execute([$shopId]);
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($products as &$p) {
            $p['stock']       = (int)   $p['stock'];
            $p['alert_stock'] = (int)   $p['alert_stock'];
            $p['sell_price']  = (float) $p['sell_price'];
        }
        unset($p);

        echo json_encode(["products" => $products, "total" => count($products)]);
    }
    // POST /api/inventory/stock/:id
    /**
     * Update the stock level for a single product and record the change in
     * the stock_history table so the shop owner has a full audit trail.
     *
     * Request body (JSON):
     *   {
     *     "change_type"  : "restock" | "manual" | "adjustment" | "return",
     *     "quantity"     : 50,        // positive = add, negative = subtract
     *     "note"         : "Received from supplier ABC"  // optional
     *   }
     *
     * The endpoint validates that the resulting stock won't go negative,
     * updates the products table, and writes one row to stock_history.
     */
    public static function updateStock(array $user, int $productId): void
    {
        global $conn;
        $shopId = (int) $user['shop_id'];
        // JWT payload stores the user id under the key "id" (see utils/jwt.php)
        $userId = (int) ($user['id'] ?? 0);
        $check = $conn->prepare("SELECT id, name, stock FROM products WHERE id = ? AND shop_id = ?");
        $check->execute([$productId, $shopId]);
        $product = $check->fetch(PDO::FETCH_ASSOC);

        if (!$product) {
            http_response_code(404);
            echo json_encode(["error" => "Product not found"]);
            return;
        }

        $body = json_decode(file_get_contents("php://input"), true) ?? [];
        if (!isset($body['quantity']) || !is_numeric($body['quantity'])) {
            http_response_code(422);
            echo json_encode(["error" => "quantity is required and must be a number"]);
            return;
        }

        $validTypes = ['restock', 'manual', 'adjustment', 'return'];
        $changeType = in_array($body['change_type'] ?? '', $validTypes)
            ? $body['change_type']
            : 'manual';

        $quantityChange = (int) $body['quantity'];
        $note           = trim($body['note'] ?? '') ?: null;
        $beforeStock    = (int) $product['stock'];
        $afterStock     = $beforeStock + $quantityChange;

        // Never allow stock to go below 0
        if ($afterStock < 0) {
            http_response_code(422);
            echo json_encode([
                "error" => "Stock update would result in negative stock. Current stock: {$beforeStock}, change: {$quantityChange}.",
            ]);
            return;
        }
        $conn->beginTransaction();
        try {
            // 1. Update the product's stock level
            $conn->prepare("UPDATE products SET stock = ? WHERE id = ? AND shop_id = ?")
                 ->execute([$afterStock, $productId, $shopId]);

            // 2. Insert a history record
            $conn->prepare("
                INSERT INTO stock_history
                    (shop_id, product_id, change_type, quantity_change,
                     quantity_before, quantity_after, note, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ")->execute([
                $shopId, $productId, $changeType,
                $quantityChange, $beforeStock, $afterStock,
                $note, $userId > 0 ? $userId : null,
            ]);

            $conn->commit();

            echo json_encode([
                "message"         => "Stock updated successfully",
                "product_name"    => $product['name'],
                "quantity_before" => $beforeStock,
                "quantity_after"  => $afterStock,
                "change"          => $quantityChange,
            ]);
        } catch (\Exception $e) {
            $conn->rollBack();
            http_response_code(500);
            echo json_encode(["error" => "Failed to update stock. Please try again."]);
        }
    }
    // GET /api/inventory/history
    /**
     * Return the stock change history for the shop.
     *
     * This powers the "Stock History" tab. By default it returns all stock
     * changes across all products, newest first. An optional query param
     * ?product_id=<id> narrows it to a single product.
     *
     * Each row includes the product name so the frontend can display it
     * without a separate lookup.
     *
     * Optional query params:
     *   ?product_id=<id>    — filter to one product
     *   ?change_type=<type> — filter by change type
     *   ?limit=<n>          — max rows (default 100, max 500)
     */
    public static function getHistory(array $user): void
    {
        global $conn;
        $shopId = (int) $user['shop_id'];

        $productId  = isset($_GET['product_id']) && $_GET['product_id'] !== ''
                        ? (int) $_GET['product_id'] : null;
        $changeType = $_GET['change_type'] ?? '';
        $limit      = min((int) ($_GET['limit'] ?? 100), 500);

        $where  = ["sh.shop_id = ?"];
        $params = [$shopId];

        if ($productId !== null) {
            $where[]  = "sh.product_id = ?";
            $params[] = $productId;
        }
        if ($changeType !== '') {
            $where[]  = "sh.change_type = ?";
            $params[] = $changeType;
        }

        $whereSQL = implode(' AND ', $where);

        $stmt = $conn->prepare("
            SELECT
                sh.id,
                sh.product_id,
                sh.change_type,
                sh.quantity_change,
                sh.quantity_before,
                sh.quantity_after,
                sh.note,
                sh.created_at,
                p.name  AS product_name,
                p.sku   AS product_sku,
                p.image AS product_image,
                u.name  AS updated_by
            FROM stock_history sh
            LEFT JOIN products p ON p.id = sh.product_id
            LEFT JOIN users    u ON u.id = sh.created_by
            WHERE {$whereSQL}
            ORDER BY sh.created_at DESC
            LIMIT {$limit}
        ");
        $stmt->execute($params);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($rows as &$row) {
            $row['quantity_change'] = (int) $row['quantity_change'];
            $row['quantity_before'] = (int) $row['quantity_before'];
            $row['quantity_after']  = (int) $row['quantity_after'];
        }
        unset($row);

        echo json_encode(["history" => $rows, "total" => count($rows)]);
    }
}
?>
