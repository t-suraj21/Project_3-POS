<?php
require_once __DIR__ . "/../config/database.php";

class ProductController
{
    private static string $uploadDir = __DIR__ . "/../uploads/products/";

    // ── Helpers ───────────────────────────────────────────────────────────────

    /** Remove old image file safely */
    private static function deleteImage(?string $path): void
    {
        if ($path) {
            $file = __DIR__ . "/../" . $path;
            if (is_file($file)) unlink($file);
        }
    }

    /** Handle image upload; returns relative path or null */
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

    // ─── GET /api/products ────────────────────────────────────────────────────
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

        $whereSQL = implode(' AND ', $where);

        $stmt = $conn->prepare("
            SELECT p.id, p.shop_id, p.category_id, p.name, p.sku, p.barcode,
                   p.description, p.brand, p.image,
                   p.cost_price, p.sell_price, p.stock, p.alert_stock,
                   p.gst_percent, p.price_type, p.created_at,
                   c.name AS category_name, c.parent_id AS category_parent_id
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
            WHERE {$whereSQL}
            ORDER BY p.created_at DESC
        ");
        $stmt->execute($params);
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["products" => $products]);
    }

    // ─── GET /api/products/:id ────────────────────────────────────────────────
    public static function getOne(array $user, int $id): void
    {
        global $conn;

        $stmt = $conn->prepare("
            SELECT p.*, c.name AS category_name
            FROM products p
            LEFT JOIN categories c ON c.id = p.category_id
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

    // ─── POST /api/products ───────────────────────────────────────────────────
    public static function create(array $user): void
    {
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

        $stmt = $conn->prepare("
            INSERT INTO products
                (shop_id, category_id, name, sku, barcode, description, brand, image,
                 cost_price, sell_price, stock, alert_stock, gst_percent, price_type)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ");

        $stmt->execute([
            $shopId,
            $data['category_id']  ?: null,
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
        ]);

        $newId = (int) $conn->lastInsertId();

        // Return the created product
        $s2 = $conn->prepare("SELECT * FROM products WHERE id = ?");
        $s2->execute([$newId]);

        http_response_code(201);
        echo json_encode([
            "message" => "Product created",
            "product" => $s2->fetch(PDO::FETCH_ASSOC),
        ]);
    }

    // ─── PUT /api/products/:id ────────────────────────────────────────────────
    public static function update(array $user, int $id): void
    {
        global $conn;

        $isMultipart = str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'multipart');
        $data        = $isMultipart ? $_POST : (json_decode(file_get_contents("php://input"), true) ?? []);
        $shopId      = (int) $user['shop_id'];

        if (empty($data['name']) || !isset($data['sell_price'])) {
            http_response_code(422);
            echo json_encode(["error" => "name and sell_price are required"]);
            return;
        }

        // Check ownership and get old image
        $old = $conn->prepare("SELECT image FROM products WHERE id = ? AND shop_id = ?");
        $old->execute([$id, $shopId]);
        $existing = $old->fetch(PDO::FETCH_ASSOC);
        if (!$existing) {
            http_response_code(404);
            echo json_encode(["error" => "Product not found"]);
            return;
        }

        // Handle new image upload
        $imagePath = $existing['image'];
        if ($isMultipart && !empty($_FILES['image']['tmp_name'])) {
            self::deleteImage($existing['image']);
            $imagePath = self::handleUpload();
        }
        // Allow explicit image removal
        if (isset($data['remove_image']) && $data['remove_image'] === '1') {
            self::deleteImage($existing['image']);
            $imagePath = null;
        }

        $stmt = $conn->prepare("
            UPDATE products SET
                category_id = ?,
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
                price_type  = ?
            WHERE id = ? AND shop_id = ?
        ");

        $stmt->execute([
            $data['category_id']  ?: null,
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
            $id,
            $shopId,
        ]);

        echo json_encode(["message" => "Product updated"]);
    }

    // ─── DELETE /api/products/:id ─────────────────────────────────────────────
    public static function delete(array $user, int $id): void
    {
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
