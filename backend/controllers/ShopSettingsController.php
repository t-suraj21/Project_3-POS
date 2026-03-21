<?php
require_once __DIR__ . "/../config/database.php";

class ShopSettingsController
{
    private static string $uploadDir = __DIR__ . "/../uploads/shop/";

    // ── Image upload helper ───────────────────────────────────────────────────
    private static function handleUpload(string $field): ?string
    {
        if (empty($_FILES[$field]['tmp_name'])) return null;

        $allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/x-icon', 'image/vnd.microsoft.icon'];
        $type    = mime_content_type($_FILES[$field]['tmp_name']);

        if (!in_array($type, $allowed)) {
            http_response_code(422);
            echo json_encode(["error" => "Only JPG, PNG, WEBP, GIF or ICO images are allowed."]);
            exit;
        }
        if ($_FILES[$field]['size'] > 1 * 1024 * 1024) {
            http_response_code(422);
            echo json_encode(["error" => ucfirst($field) . " must be under 1 MB."]);
            exit;
        }

        if (!is_dir(self::$uploadDir)) mkdir(self::$uploadDir, 0755, true);

        $ext = match($type) {
            'image/png'  => 'png',
            'image/webp' => 'webp',
            'image/gif'  => 'gif',
            'image/x-icon', 'image/vnd.microsoft.icon' => 'ico',
            default      => 'jpg',
        };
        $filename = $field . '_' . uniqid('', true) . '.' . $ext;
        move_uploaded_file($_FILES[$field]['tmp_name'], self::$uploadDir . $filename);
        return "uploads/shop/{$filename}";
    }

    private static function deleteFile(?string $path): void
    {
        if ($path) {
            $file = __DIR__ . "/../" . $path;
            if (is_file($file)) unlink($file);
        }
    }

    // ── GET /api/settings ─────────────────────────────────────────────────────
    public static function get(array $user): void
    {
        global $conn;
        $shopId = (int) $user['shop_id'];

        $stmt = $conn->prepare("SELECT * FROM shops WHERE id = ?");
        $stmt->execute([$shopId]);
        $shop = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$shop) {
            http_response_code(404);
            echo json_encode(["error" => "Shop not found."]);
            return;
        }
        unset($shop['created_at']); // not needed on FE
        echo json_encode(["shop" => $shop]);
    }

    // ── POST /api/settings  (multipart/form-data) ─────────────────────────────
    public static function update(array $user): void
    {
        global $conn;
        $shopId = (int) $user['shop_id'];
        $data   = $_POST;

        if (empty($data['name'])) {
            http_response_code(422);
            echo json_encode(["error" => "Shop name is required."]);
            return;
        }
        $old = $conn->prepare("SELECT logo, favicon FROM shops WHERE id = ?");
        $old->execute([$shopId]);
        $current = $old->fetch(PDO::FETCH_ASSOC);
        if (!$current) {
            http_response_code(404);
            echo json_encode(["error" => "Shop not found."]);
            return;
        }
        $logo = $current['logo'];
        if (!empty($_FILES['logo']['tmp_name'])) {
            self::deleteFile($current['logo']);
            $logo = self::handleUpload('logo');
        }
        if (($data['remove_logo'] ?? '') === '1') {
            self::deleteFile($current['logo']);
            $logo = null;
        }
        $favicon = $current['favicon'];
        if (!empty($_FILES['favicon']['tmp_name'])) {
            self::deleteFile($current['favicon']);
            $favicon = self::handleUpload('favicon');
        }
        if (($data['remove_favicon'] ?? '') === '1') {
            self::deleteFile($current['favicon']);
            $favicon = null;
        }

        // Validate GSTIN (India format: 15 chars alphanumeric) if provided
        $gstin = strtoupper(trim($data['gstin'] ?? ''));
        if ($gstin !== '' && !preg_match('/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/', $gstin)) {
            http_response_code(422);
            echo json_encode(["error" => "Invalid GSTIN format. Expected: 22AAAAA0000A1Z5"]);
            return;
        }

        $stmt = $conn->prepare("
            UPDATE shops SET
                name             = ?,
                email            = ?,
                phone            = ?,
                address          = ?,
                country          = ?,
                state            = ?,
                pincode          = ?,
                gstin            = ?,
                currency         = ?,
                currency_symbol  = ?,
                timezone         = ?,
                pagination_limit = ?,
                gst_enabled      = ?,
                logo             = ?,
                favicon          = ?,
                billing_layout   = ?
            WHERE id = ?
        ");
        $stmt->execute([
            trim($data['name']),
            trim($data['email']      ?? ''),
            trim($data['phone']      ?? ''),
            trim($data['address']    ?? ''),
            trim($data['country']    ?? 'India'),
            trim($data['state']      ?? ''),
            trim($data['pincode']    ?? ''),
            $gstin ?: null,
            trim($data['currency']        ?? 'INR'),
            trim($data['currency_symbol'] ?? '₹'),
            trim($data['timezone']        ?? 'Asia/Kolkata'),
            max(1, min(500, (int) ($data['pagination_limit'] ?? 20))),
            isset($data['gst_enabled']) && $data['gst_enabled'] === '1' ? 1 : 0,
            $logo,
            $favicon,
            trim($data['billing_layout'] ?? 'classic'),
            $shopId,
        ]);
        $s2 = $conn->prepare("SELECT * FROM shops WHERE id = ?");
        $s2->execute([$shopId]);
        $shop = $s2->fetch(PDO::FETCH_ASSOC);

        echo json_encode(["message" => "Shop settings saved successfully.", "shop" => $shop]);
    }

    // ── GET /api/billing-layouts  (No auth required, public) ──────────────────
    public static function getBillingLayouts(): void
    {
        global $conn;

        $stmt = $conn->prepare("
            SELECT id, name, code, description, is_active
            FROM billing_layouts
            WHERE is_active = 1
            ORDER BY id ASC
        ");
        $stmt->execute();
        $layouts = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["layouts" => $layouts]);
    }

    // ── DELETE /api/settings ──────────────────────────────────────────────────
    public static function deleteShop(array $user): void
    {
        global $conn;
        $shopId = (int) $user['shop_id'];

        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        if (($data['confirm'] ?? '') !== 'DELETE') {
            http_response_code(422);
            echo json_encode(["error" => "Send { \"confirm\": \"DELETE\" } to confirm shop deletion."]);
            return;
        }
        $shop = $conn->prepare("SELECT logo, favicon FROM shops WHERE id = ?");
        $shop->execute([$shopId]);
        $s = $shop->fetch(PDO::FETCH_ASSOC);

        $conn->beginTransaction();
        try {
            $tables = [
                "credit_transaction_items" => "transaction_id IN (SELECT id FROM credit_transactions WHERE shop_id = ?)",
                "credit_transactions"      => "shop_id = ?",
                "credit_customers"         => "shop_id = ?",
                "sale_items"               => "sale_id IN (SELECT id FROM sales WHERE shop_id = ?)",
                "sales"                    => "shop_id = ?",
                "products"                 => "shop_id = ?",
                "categories"               => "shop_id = ?",
                "users"                    => "shop_id = ?",
                "shops"                    => "id = ?",
            ];
            foreach ($tables as $table => $where) {
                // Use shop_id param for nested queries too
                $conn->prepare("DELETE FROM `{$table}` WHERE {$where}")->execute([$shopId]);
            }
            $conn->commit();
            if ($s) {
                self::deleteFile($s['logo']);
                self::deleteFile($s['favicon']);
            }

            echo json_encode(["message" => "Shop and all associated data has been permanently deleted."]);
        } catch (\Exception $e) {
            $conn->rollBack();
            http_response_code(500);
            echo json_encode(["error" => "Deletion failed: " . $e->getMessage()]);
        }
    }
}
