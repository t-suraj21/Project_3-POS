<?php
/**
 * ProductController.php — Product Management
 *
 * Handles everything related to a shop's product catalogue:
 *   - Listing products with search, category, low-stock, and availability filters
 *   - Creating new products (with optional image upload)
 *   - Updating existing products (including swapping or removing the image)
 *   - Toggling the "is_available" flag so the owner can hide products from the sales screen
 *   - Deleting products (also removes the uploaded image from disk)
 *
 * All methods receive the decoded JWT payload as $user so they can scope
 * every query to the correct shop_id. A shop owner can only ever see and
 * modify their own products — never another shop's.
 */
require_once __DIR__ . "/../config/database.php";

class ProductController
{
    // Absolute path to the folder where product images are stored on disk.
    // This is kept as a class constant so every method references the same location.
    private static string $uploadDir = __DIR__ . "/../uploads/products/";
    /**
     * Delete an uploaded product image from disk.
     *
     * We store a relative path like "uploads/products/prod_abc.jpg" in the DB.
     * This helper resolves that to an absolute path and removes the file safely,
     * doing nothing if the path is null or the file no longer exists.
     *
     * @param string|null $path  The relative path stored in the database
     */
    private static function deleteImage(?string $path): void
    {
        if ($path) {
            $file = __DIR__ . "/../" . $path;
            if (is_file($file)) unlink($file);
        }
    }

    /**
     * Handle an incoming image file upload.
     *
     * Validates the MIME type (only common image formats accepted) and the file
     * size (max 2 MB), then moves the temp file into the uploads directory with
     * a unique filename. Returns the relative path to store in the database, or
     * null if no file was submitted.
     *
     * We generate a unique filename with uniqid() to avoid collisions and to
     * prevent users from guessing or overwriting each other's images.
     *
     * @return string|null  Relative path like "uploads/products/prod_abc.jpg", or null
     */
    private static function handleUpload(): ?string
    {
        if (empty($_FILES['image']['tmp_name'])) return null;

        $allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        $type    = mime_content_type($_FILES['image']['tmp_name']);

        if (!in_array($type, $allowed)) {
            http_response_code(422);
            echo json_encode(["error" => "Only JPG, PNG, WEBP or GIF images are allowed."]);
            exit;
        }

        if ($_FILES['image']['size'] > 2 * 1024 * 1024) {
            http_response_code(422);
            echo json_encode(["error" => "Image must be under 2 MB."]);
            exit;
        }

        if (!is_dir(self::$uploadDir)) mkdir(self::$uploadDir, 0755, true);

        $ext      = match($type) {
            'image/jpeg' => 'jpg',
            'image/png'  => 'png',
            'image/webp' => 'webp',
            default      => 'gif',
        };
        $filename = uniqid('prod_', true) . '.' . $ext;
        move_uploaded_file($_FILES['image']['tmp_name'], self::$uploadDir . $filename);

        return "uploads/products/{$filename}";
    }

    /**
     * Check if the user has write permission for products.
     * Only shop_admin, manager, and stock_manager can create/update/delete/toggle products.
     * Sales workers and cashiers are read-only.
     *
     * @param array $user Decoded JWT payload with 'role' key
     * @return void Exits with 403 if unauthorized
     */
    private static function requireWritePermission(array $user): void
    {
        $canWrite = in_array($user['role'], ['shop_admin', 'manager', 'stock_manager'], true);
        if (!$canWrite) {
            http_response_code(403);
            echo json_encode(["error" => "You don't have permission to modify products. Only stock managers and admins can do this."]);
            exit;
        }
    }
    // GET /api/products
    /**
     * Return the full product list for the authenticated shop.
     *
     * Supports four optional query-string filters that can be combined freely:
     *   ?search=<text>          — full-text search across name, SKU, barcode, description
     *   ?category_id=<id>       — narrow down to a single category
     *   ?low_stock=1            — only show products at or below their alert stock level
     *   ?available_only=1       — only show products marked as available (used by the Sales screen)
     *
     * Each product row includes its category name and parent category id so
     * the frontend can display the full category path without a second request.
     */
    public static function getAll(array $user): void
    {
        global $conn;

        $shopId   = (int) $user['shop_id'];
        $search   = trim($_GET['search']   ?? '');
        $catId    = isset($_GET['category_id']) && $_GET['category_id'] !== '' ? (int) $_GET['category_id'] : null;
        $lowStock = isset($_GET['low_stock']) && $_GET['low_stock'] === '1';

        $where  = ["p.shop_id = ?"];
        $params = [$shopId];

        if ($search !== '') {
            $where[]  = "(p.name LIKE ? OR p.sku LIKE ? OR p.barcode LIKE ? OR p.description LIKE ?)";
            $like     = "%{$search}%";
            array_push($params, $like, $like, $like, $like);
        }
        if ($catId !== null) {
            $where[]  = "p.category_id = ?";
            $params[] = $catId;
        }
        if ($lowStock) {
            $where[] = "p.stock <= p.alert_stock";
        }

        // When fetching for the sales / billing screen, hide unavailable products
        $availableOnly = isset($_GET['available_only']) && $_GET['available_only'] === '1';
        if ($availableOnly) {
            $where[] = "p.is_available = 1";
        }

        $whereSQL = implode(' AND ', $where);

        $stmt = $conn->prepare("
            SELECT p.id, p.shop_id, p.category_id, p.supplier_id, p.name, p.sku, p.barcode,
                   p.description, p.brand, p.image,
                   p.cost_price, p.sell_price, p.stock, p.alert_stock,
                   p.gst_percent, p.price_type, p.is_available, p.created_at,
                   c.name AS category_name, c.parent_id AS category_parent_id,
                   s.name AS supplier_name
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            LEFT JOIN suppliers s ON s.id = p.supplier_id
            WHERE {$whereSQL}
            ORDER BY p.created_at DESC
        ");
        $stmt->execute($params);
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["products" => $products]);
    }
    // GET /api/products/:id
    /**
     * Return a single product by its ID.
     *
     * We include the category name in the response so the edit form can
     * pre-populate the category dropdown without a separate API call.
     * The shop_id check ensures a shop owner can never peek at a competitor's products.
     */
    public static function getOne(array $user, int $id): void
    {
        global $conn;

        $stmt = $conn->prepare("
            SELECT p.*, c.name AS category_name, s.name AS supplier_name
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            LEFT JOIN suppliers s ON s.id = p.supplier_id
            WHERE p.id = ? AND p.shop_id = ?
        ");
        $stmt->execute([$id, (int) $user['shop_id']]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$product) {
            http_response_code(404);
            echo json_encode(["error" => "Product not found"]);
            return;
        }

        echo json_encode(["product" => $product]);
    }
    // POST /api/products
    /**
     * Create a brand-new product for the shop.
     *
     * Accepts both JSON bodies and multipart/form-data (needed when an image
     * is being uploaded at the same time). The content-type header decides
     * which parsing path we take.
     *
     * Only 'name' and 'sell_price' are strictly required. Everything else
     * (SKU, barcode, stock, GST, description, image) is optional.
     *
     * After inserting, we immediately SELECT the new row back from the database
     * and return it in the response so the frontend has the generated ID and
     * all default values without needing to make a second GET request.
     */
    public static function create(array $user): void
    {
        self::requireWritePermission($user);

        global $conn;

        // Support both JSON body and multipart/form-data
        $isMultipart = str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'multipart');
        $data        = $isMultipart ? $_POST : (json_decode(file_get_contents("php://input"), true) ?? []);
        $shopId      = (int) $user['shop_id'];

        if (empty($data['name']) || !isset($data['sell_price'])) {
            http_response_code(422);
            echo json_encode(["error" => "name and sell_price are required"]);
            return;
        }

        $imagePath = $isMultipart ? self::handleUpload() : null;

        $supplierId = !empty($data['supplier_id']) ? (int) $data['supplier_id'] : null;

        $stmt = $conn->prepare("
            INSERT INTO products
                (shop_id, category_id, supplier_id, name, sku, barcode, description, brand, image,
                 cost_price, sell_price, stock, alert_stock, gst_percent, price_type, unit_type)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ");

        $stmt->execute([
            $shopId,
            $data['category_id']  ?: null,
            $supplierId,
            trim($data['name']),
            $data['sku']          ?: null,
            $data['barcode']      ?: null,
            $data['description']  ?: null,
            $data['brand']        ?: null,
            $imagePath,
            (float) ($data['cost_price']  ?? 0),
            (float) $data['sell_price'],
            (int)   ($data['stock']       ?? 0),
            (int)   ($data['alert_stock'] ?? 5),
            (float) ($data['gst_percent'] ?? 0),
            in_array($data['price_type'] ?? '', ['inclusive','exclusive'])
                ? $data['price_type'] : 'exclusive',
            $data['unit_type'] ?? 'pcs',
        ]);

        $newId = (int) $conn->lastInsertId();
        
        // Log purchase transaction if stock > 0 and supplier is selected
        $stock = (int) ($data['stock'] ?? 0);
        $costPrice = (float) ($data['cost_price'] ?? 0);
        
        if ($supplierId && $stock > 0) {
            $totalPurchaseAmt = $stock * $costPrice;
            $s_stmt = $conn->prepare("
                INSERT INTO supplier_purchases (shop_id, supplier_id, product_name, quantity, cost_price, total_amount, note)
                VALUES (?, ?, ?, ?, ?, ?, 'Initial Stock')
            ");
            $s_stmt->execute([
                $shopId,
                $supplierId,
                trim($data['name']),
                $stock,
                $costPrice,
                $totalPurchaseAmt
            ]);
            
            // Update Supplier's total balances
            $upd = $conn->prepare("
                UPDATE suppliers
                SET total_purchased = total_purchased + ?, remaining_balance = remaining_balance + ?, status = 'active'
                WHERE id = ? AND shop_id = ?
            ");
            $upd->execute([$totalPurchaseAmt, $totalPurchaseAmt, $supplierId, $shopId]);
        }

        $s2 = $conn->prepare("SELECT * FROM products WHERE id = ?");
        $s2->execute([$newId]);

        http_response_code(201);
        echo json_encode([
            "message" => "Product created",
            "product" => $s2->fetch(PDO::FETCH_ASSOC),
        ]);
    }
    // PUT /api/products/:id
    /**
     * Update an existing product.
     *
     * Image handling has three states:
     *   1. No new file submitted → keep the existing image path as-is
     *   2. A new file submitted → delete the old file, upload the new one
     *   3. remove_image=1 in the form → delete the old file, set image to null
     *
     * PHP doesn't populate $_POST for a PUT multipart request, so the frontend
     * sends a POST with a hidden `_method=PUT` field when it needs to upload a
     * new image alongside the update. The route file handles this override.
     */
    public static function update(array $user, int $id): void
    {
        self::requireWritePermission($user);

        global $conn;

        $isMultipart = str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'multipart');
        $data        = $isMultipart ? $_POST : (json_decode(file_get_contents("php://input"), true) ?? []);
        $shopId      = (int) $user['shop_id'];

        if (empty($data['name']) || !isset($data['sell_price'])) {
            http_response_code(422);
            echo json_encode(["error" => "name and sell_price are required"]);
            return;
        }
        $old = $conn->prepare("SELECT image FROM products WHERE id = ? AND shop_id = ?");
        $old->execute([$id, $shopId]);
        $existing = $old->fetch(PDO::FETCH_ASSOC);
        if (!$existing) {
            http_response_code(404);
            echo json_encode(["error" => "Product not found"]);
            return;
        }
        $imagePath = $existing['image'];
        if ($isMultipart && !empty($_FILES['image']['tmp_name'])) {
            self::deleteImage($existing['image']);
            $imagePath = self::handleUpload();
        }
        if (isset($data['remove_image']) && $data['remove_image'] === '1') {
            self::deleteImage($existing['image']);
            $imagePath = null;
        }

        $supplierId = !empty($data['supplier_id']) ? (int) $data['supplier_id'] : null;

        $stmt = $conn->prepare("
            UPDATE products SET
                category_id = ?,
                supplier_id = ?,
                name        = ?,
                sku         = ?,
                barcode     = ?,
                description = ?,
                brand       = ?,
                image       = ?,
                cost_price  = ?,
                sell_price  = ?,
                stock       = ?,
                alert_stock = ?,
                gst_percent = ?,
                price_type  = ?,
                unit_type   = ?
            WHERE id = ? AND shop_id = ?
        ");

        $stmt->execute([
            $data['category_id']  ?: null,
            $supplierId,
            trim($data['name']),
            $data['sku']          ?: null,
            $data['barcode']      ?: null,
            $data['description']  ?: null,
            $data['brand']        ?: null,
            $imagePath,
            (float) ($data['cost_price']  ?? 0),
            (float) $data['sell_price'],
            (int)   ($data['stock']       ?? 0),
            (int)   ($data['alert_stock'] ?? 5),
            (float) ($data['gst_percent'] ?? 0),
            in_array($data['price_type'] ?? '', ['inclusive','exclusive'])
                ? $data['price_type'] : 'exclusive',
            $data['unit_type'] ?? 'pcs',
            $id,
            $shopId,
        ]);

        echo json_encode(["message" => "Product updated"]);
    }
    // PATCH /api/products/:id/status
    /**
     * Toggle or explicitly set the "is_available" flag on a product.
     *
     * The shop owner uses this to temporarily hide a product from the Sales /
     * POS screen without deleting it. Useful for out-of-season items, items
     * being restocked, or products that are temporarily pulled from sale.
     *
     * The request body can include:
     *   { "is_available": 0 }  — explicitly mark as unavailable
     *   { "is_available": 1 }  — explicitly mark as available
     *   {}                     — omit the field to flip whatever the current value is
     *
     * The frontend does an optimistic UI update (flips the toggle immediately)
     * and reverts if this request fails, so the response just needs to confirm
     * the new state.
     */
    public static function toggleStatus(array $user, int $id): void
    {
        self::requireWritePermission($user);

        global $conn;

        $shopId = (int) $user['shop_id'];
        $chk = $conn->prepare("SELECT id, is_available FROM products WHERE id = ? AND shop_id = ?");
        $chk->execute([$id, $shopId]);
        $row = $chk->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            http_response_code(404);
            echo json_encode(["error" => "Product not found"]);
            return;
        }

        $body      = json_decode(file_get_contents("php://input"), true) ?? [];
        $newStatus = isset($body['is_available'])
            ? ((int) $body['is_available'] ? 1 : 0)
            : ((int) $row['is_available'] ? 0 : 1);

        $conn->prepare("UPDATE products SET is_available = ? WHERE id = ? AND shop_id = ?")
             ->execute([$newStatus, $id, $shopId]);

        echo json_encode([
            "message"      => $newStatus ? "Product marked as available" : "Product marked as unavailable",
            "is_available" => $newStatus,
        ]);
    }
    // DELETE /api/products/:id
    /**
     * Permanently delete a product.
     *
     * We first fetch the product to get its image path, then delete both
     * the database row and the image file on disk. The shop_id check in the
     * query makes it impossible for one shop to delete another shop's product.
     *
     * Note: this is a hard delete. If the product has associated sale_items,
     * those rows already have a snapshot of the product name and price, so
     * historical order data is preserved even after the product is gone.
     */
    public static function delete(array $user, int $id): void
    {
        self::requireWritePermission($user);

        global $conn;

        $stmt = $conn->prepare("SELECT image FROM products WHERE id = ? AND shop_id = ?");
        $stmt->execute([$id, (int) $user['shop_id']]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            http_response_code(404);
            echo json_encode(["error" => "Product not found"]);
            return;
        }

        self::deleteImage($row['image']);

        $conn->prepare("DELETE FROM products WHERE id = ? AND shop_id = ?")->execute([$id, (int) $user['shop_id']]);

        echo json_encode(["message" => "Product deleted"]);
    }
}
?>
