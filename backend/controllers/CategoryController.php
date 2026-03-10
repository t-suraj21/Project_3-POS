<?php
require_once __DIR__ . "/../config/database.php";

class CategoryController
{
    private static string $uploadDir = __DIR__ . "/../uploads/categories/";

    private static function deleteImage(?string $path): void
    {
        if ($path) {
            $file = __DIR__ . "/../" . $path;
            if (is_file($file)) unlink($file);
        }
    }

    private static function handleUpload(): ?string
    {
        if (empty($_FILES['image']['tmp_name'])) return null;

        $allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        $type    = mime_content_type($_FILES['image']['tmp_name']);

        if (!in_array($type, $allowed)) {
            http_response_code(422);
            echo json_encode(["error" => "Only JPG, PNG, WEBP or GIF allowed."]);
            exit;
        }
        if ($_FILES['image']['size'] > 1 * 1024 * 1024) {
            http_response_code(422);
            echo json_encode(["error" => "Image must be under 1 MB."]);
            exit;
        }

        if (!is_dir(self::$uploadDir)) mkdir(self::$uploadDir, 0755, true);

        $ext = match($type) {
            'image/jpeg' => 'jpg', 'image/png' => 'png',
            'image/webp' => 'webp', default => 'gif',
        };
        $filename = uniqid('cat_', true) . '.' . $ext;
        move_uploaded_file($_FILES['image']['tmp_name'], self::$uploadDir . $filename);

        return "uploads/categories/{$filename}";
    }

    // GET /api/categories  (?parent_only=1 | ?sub_only=1 | ?search=xxx)
    public static function getAll(array $user): void
    {
        global $conn;

        $shopId     = (int) $user['shop_id'];
        $parentOnly = ($_GET['parent_only'] ?? '') === '1';
        $subOnly    = ($_GET['sub_only']    ?? '') === '1';
        $search     = trim($_GET['search']  ?? '');

        $where  = ["c.shop_id = ?"];
        $params = [$shopId];

        if ($parentOnly) $where[] = "c.parent_id IS NULL";
        if ($subOnly)    $where[] = "c.parent_id IS NOT NULL";
        if ($search !== '') { $where[] = "c.name LIKE ?"; $params[] = "%{$search}%"; }

        $whereSQL = implode(' AND ', $where);

        $stmt = $conn->prepare("
            SELECT c.id, c.shop_id, c.parent_id, c.name, c.description, c.image, c.status, c.created_at,
                   p.name AS parent_name,
                   (SELECT COUNT(*) FROM products pr WHERE pr.category_id = c.id) AS product_count
            FROM   categories c
            LEFT JOIN categories p ON p.id = c.parent_id
            WHERE  {$whereSQL}
            ORDER  BY c.parent_id ASC, c.name ASC
        ");
        $stmt->execute($params);
        echo json_encode(["categories" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }

    // GET /api/categories/flat
    public static function getFlat(array $user): void
    {
        global $conn;
        $stmt = $conn->prepare("SELECT id, parent_id, name FROM categories WHERE shop_id = ? ORDER BY parent_id ASC, name ASC");
        $stmt->execute([(int) $user['shop_id']]);
        echo json_encode(["categories" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }

    // POST /api/categories
    public static function create(array $user): void
    {
        global $conn;

        $isMulti = str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'multipart');
        $data    = $isMulti ? $_POST : (json_decode(file_get_contents("php://input"), true) ?? []);
        $shopId  = (int) $user['shop_id'];

        if (empty($data['name'])) {
            http_response_code(422);
            echo json_encode(["error" => "Category name is required"]);
            return;
        }

        $parentId = null;
        if (!empty($data['parent_id'])) {
            $chk = $conn->prepare("SELECT id FROM categories WHERE id = ? AND shop_id = ?");
            $chk->execute([(int)$data['parent_id'], $shopId]);
            if (!$chk->fetch()) { http_response_code(422); echo json_encode(["error" => "Invalid parent category"]); return; }
            $parentId = (int) $data['parent_id'];
        }

        $imagePath = $isMulti ? self::handleUpload() : null;

        $stmt = $conn->prepare("INSERT INTO categories (shop_id, parent_id, name, description, image) VALUES (?,?,?,?,?)");
        $stmt->execute([$shopId, $parentId, trim($data['name']), $data['description'] ?: null, $imagePath]);

        $newId = (int) $conn->lastInsertId();
        $s2    = $conn->prepare("SELECT * FROM categories WHERE id = ?");
        $s2->execute([$newId]);

        http_response_code(201);
        echo json_encode(["message" => "Category created", "category" => $s2->fetch(PDO::FETCH_ASSOC)]);
    }

    // PUT /api/categories/:id
    public static function update(array $user, int $id): void
    {
        global $conn;

        $isMulti = str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'multipart');
        $data    = $isMulti ? $_POST : (json_decode(file_get_contents("php://input"), true) ?? []);
        $shopId  = (int) $user['shop_id'];

        if (empty($data['name'])) { http_response_code(422); echo json_encode(["error" => "Category name is required"]); return; }

        $old = $conn->prepare("SELECT image FROM categories WHERE id = ? AND shop_id = ?");
        $old->execute([$id, $shopId]);
        $existing = $old->fetch(PDO::FETCH_ASSOC);
        if (!$existing) { http_response_code(404); echo json_encode(["error" => "Category not found"]); return; }

        $imagePath = $existing['image'];
        if ($isMulti && !empty($_FILES['image']['tmp_name'])) {
            self::deleteImage($existing['image']);
            $imagePath = self::handleUpload();
        }
        if (($data['remove_image'] ?? '') === '1') { self::deleteImage($existing['image']); $imagePath = null; }

        $stmt = $conn->prepare("UPDATE categories SET name=?, description=?, image=? WHERE id=? AND shop_id=?");
        $stmt->execute([trim($data['name']), $data['description'] ?: null, $imagePath, $id, $shopId]);

        echo json_encode(["message" => "Category updated"]);
    }

    // PATCH /api/categories/:id/status  — toggle active / inactive
    public static function toggleStatus(array $user, int $id): void
    {
        global $conn;

        $shopId = (int) $user['shop_id'];

        $row = $conn->prepare("SELECT status FROM categories WHERE id = ? AND shop_id = ?");
        $row->execute([$id, $shopId]);
        $cat = $row->fetch(PDO::FETCH_ASSOC);

        if (!$cat) {
            http_response_code(404);
            echo json_encode(["error" => "Category not found"]);
            return;
        }

        $newStatus = $cat['status'] === 'active' ? 'inactive' : 'active';

        $conn->prepare("UPDATE categories SET status = ? WHERE id = ? AND shop_id = ?")
             ->execute([$newStatus, $id, $shopId]);

        echo json_encode(["message" => "Status updated", "status" => $newStatus]);
    }

    // DELETE /api/categories/:id
    public static function delete(array $user, int $id): void
    {
        global $conn;

        $shopId = (int) $user['shop_id'];

        $chk = $conn->prepare("SELECT COUNT(*) FROM products WHERE category_id=? AND shop_id=?");
        $chk->execute([$id, $shopId]);
        if ((int)$chk->fetchColumn() > 0) { http_response_code(409); echo json_encode(["error" => "Cannot delete: category has products"]); return; }

        $chkSub = $conn->prepare("SELECT COUNT(*) FROM categories WHERE parent_id=? AND shop_id=?");
        $chkSub->execute([$id, $shopId]);
        if ((int)$chkSub->fetchColumn() > 0) { http_response_code(409); echo json_encode(["error" => "Cannot delete: remove sub-categories first"]); return; }

        $row = $conn->prepare("SELECT image FROM categories WHERE id=? AND shop_id=?");
        $row->execute([$id, $shopId]);
        $cat = $row->fetch(PDO::FETCH_ASSOC);
        if (!$cat) { http_response_code(404); echo json_encode(["error" => "Category not found"]); return; }

        self::deleteImage($cat['image']);
        $conn->prepare("DELETE FROM categories WHERE id=? AND shop_id=?")->execute([$id, $shopId]);

        echo json_encode(["message" => "Category deleted"]);
    }
}
?>
