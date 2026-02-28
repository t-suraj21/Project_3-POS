<?php
require_once __DIR__ . "/../config/database.php";

class SuperAdminController
{
    // ─── GET /api/super/shops ─────────────────────────────────────────────────
    public static function getAllShops(): void
    {
        global $conn;

        $stmt = $conn->query("
            SELECT s.*,
                COALESCE((SELECT SUM(total_amount) FROM sales WHERE shop_id = s.id), 0)
                AS total_revenue
            FROM shops s
            ORDER BY s.created_at DESC
        ");

        $shops = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($shops);
    }

    // ─── GET /api/super/shops/:id ─────────────────────────────────────────────
    public static function getShop(int $id): void
    {
        global $conn;

        $stmt = $conn->prepare("
            SELECT s.*,
                COALESCE((SELECT SUM(total_amount) FROM sales WHERE shop_id = s.id), 0)
                AS total_revenue
            FROM shops s
            WHERE s.id = ?
        ");
        $stmt->execute([$id]);
        $shop = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$shop) {
            http_response_code(404);
            echo json_encode(["message" => "Shop not found"]);
            return;
        }

        echo json_encode($shop);
    }

    // ─── PUT /api/super/shops/:id ─────────────────────────────────────────────
    public static function updateShop(int $id): void
    {
        global $conn;

        $data = json_decode(file_get_contents("php://input"), true);

        if (empty($data)) {
            http_response_code(422);
            echo json_encode(["message" => "No data provided"]);
            return;
        }

        $stmt = $conn->prepare("
            UPDATE shops
            SET name        = ?,
                email       = ?,
                phone       = ?,
                address     = ?,
                gst_enabled = ?
            WHERE id = ?
        ");

        $stmt->execute([
            $data['name']        ?? null,
            $data['email']       ?? null,
            $data['phone']       ?? null,
            $data['address']     ?? null,
            isset($data['gst_enabled']) ? (int) $data['gst_enabled'] : 1,
            $id,
        ]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(["message" => "Shop not found or nothing changed"]);
            return;
        }

        http_response_code(200);
        echo json_encode(["message" => "Shop updated successfully"]);
    }

    // ─── POST /api/super/shops/:id/logo ──────────────────────────────────────
    public static function uploadLogo(int $id): void
    {
        global $conn;

        if (!isset($_FILES['logo'])) {
            http_response_code(422);
            echo json_encode(["message" => "No file uploaded"]);
            return;
        }

        $file     = $_FILES['logo'];
        $allowed  = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        $maxSize  = 2 * 1024 * 1024; // 2 MB

        if (!in_array($file['type'], $allowed)) {
            http_response_code(422);
            echo json_encode(["message" => "Invalid file type. Allowed: jpg, png, webp, gif"]);
            return;
        }

        if ($file['size'] > $maxSize) {
            http_response_code(422);
            echo json_encode(["message" => "File too large. Max 2 MB"]);
            return;
        }

        $uploadDir = __DIR__ . "/../uploads/logos/";
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $ext      = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = "shop_{$id}_" . time() . "." . $ext;
        $dest     = $uploadDir . $filename;

        if (!move_uploaded_file($file['tmp_name'], $dest)) {
            http_response_code(500);
            echo json_encode(["message" => "Failed to save file"]);
            return;
        }

        $logoPath = "/uploads/logos/" . $filename;

        $stmt = $conn->prepare("UPDATE shops SET logo = ? WHERE id = ?");
        $stmt->execute([$logoPath, $id]);

        echo json_encode([
            "message" => "Logo uploaded successfully",
            "logo"    => $logoPath,
        ]);
    }

    // ─── GET /api/super/revenue ───────────────────────────────────────────────
    public static function globalRevenue(): void
    {
        global $conn;

        $stmt = $conn->query("SELECT COALESCE(SUM(total_amount), 0) AS total FROM sales");
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode(["total" => (float) $data['total']]);
    }
}
?>
