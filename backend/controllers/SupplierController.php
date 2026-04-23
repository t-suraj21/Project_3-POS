<?php
/**
 * SupplierController.php — Supplier Management
 */
require_once __DIR__ . "/../config/database.php";

class SupplierController
{
    private static function requireWritePermission(array $user): void
    {
        $canWrite = in_array($user['role'], ['superadmin', 'shop_admin', 'manager', 'account_worker', 'stock_manager'], true);
        if (!$canWrite) {
            http_response_code(403);
            echo json_encode(["error" => "You don't have permission to manage suppliers."]);
            exit;
        }
    }

    public static function getAll(array $user): void
    {
        global $conn;
        $shopId = (int) $user['shop_id'];

        try {
            // Verify supplier table exists
            $tableCheck = $conn->prepare("
                SELECT COUNT(*) as cnt FROM information_schema.TABLES 
                WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'suppliers'
            ");
            $tableCheck->execute();
            $tableExists = (bool) $tableCheck->fetchColumn();
            
            if (!$tableExists) {
                http_response_code(500);
                echo json_encode([
                    "error" => "Suppliers table not found in database. Please run migrations.",
                    "suppliers" => [],
                    "pending_count" => 0
                ]);
                return;
            }

            $stmt = $conn->prepare("
                SELECT id, shop_id, name, email, phone, address, 
                       total_purchased, total_paid, remaining_balance, 
                       status, created_at, updated_at
                FROM suppliers
                WHERE shop_id = ?
                ORDER BY created_at DESC
            ");
            $stmt->execute([$shopId]);
            $suppliers = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Ensure all numeric fields are properly formatted
            foreach ($suppliers as &$sup) {
                $sup['total_purchased'] = (float) $sup['total_purchased'];
                $sup['total_paid'] = (float) $sup['total_paid'];
                $sup['remaining_balance'] = (float) $sup['remaining_balance'];
                $sup['shop_id'] = (int) $sup['shop_id'];
            }
            
            // Add pending_suppliers summary for accounts dashboard
            $s2 = $conn->prepare("SELECT COUNT(*) as cnt FROM suppliers WHERE shop_id = ? AND remaining_balance > 0");
            $s2->execute([$shopId]);
            $pendingCount = (int) $s2->fetchColumn();

            echo json_encode([
                "success" => true,
                "suppliers" => $suppliers,
                "pending_count" => $pendingCount,
                "total_count" => count($suppliers)
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                "error" => "Database error: " . $e->getMessage(),
                "suppliers" => [],
                "pending_count" => 0
            ]);
        }
    }

    public static function getOne(array $user, int $id): void
    {
        global $conn;
        $shopId = (int) $user['shop_id'];

        try {
            $stmt = $conn->prepare("
                SELECT id, shop_id, name, email, phone, address, 
                       total_purchased, total_paid, remaining_balance, 
                       status, created_at, updated_at 
                FROM suppliers 
                WHERE id = ? AND shop_id = ?
            ");
            $stmt->execute([$id, $shopId]);
            $supplier = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$supplier) {
                http_response_code(404);
                echo json_encode(["error" => "Supplier not found"]);
                return;
            }

            // Ensure numeric fields are properly formatted
            $supplier['total_purchased'] = (float) $supplier['total_purchased'];
            $supplier['total_paid'] = (float) $supplier['total_paid'];
            $supplier['remaining_balance'] = (float) $supplier['remaining_balance'];

            $p_stmt = $conn->prepare("
                SELECT id, shop_id, supplier_id, product_name, quantity, unit, cost_price, 
                       total_amount, note, created_at 
                FROM supplier_purchases 
                WHERE supplier_id = ? AND shop_id = ? 
                ORDER BY created_at DESC
            ");
            $p_stmt->execute([$id, $shopId]);
            $purchases = $p_stmt->fetchAll(PDO::FETCH_ASSOC);

            // Format purchase amounts
            foreach ($purchases as &$p) {
                $p['cost_price'] = (float) $p['cost_price'];
                $p['total_amount'] = (float) $p['total_amount'];
                $p['quantity'] = (int) $p['quantity'];
            }

            $pay_stmt = $conn->prepare("
                SELECT id, shop_id, supplier_id, amount, payment_mode, note, created_at 
                FROM supplier_payments 
                WHERE supplier_id = ? AND shop_id = ? 
                ORDER BY created_at DESC
            ");
            $pay_stmt->execute([$id, $shopId]);
            $payments = $pay_stmt->fetchAll(PDO::FETCH_ASSOC);

            // Format payment amounts
            foreach ($payments as &$pay) {
                $pay['amount'] = (float) $pay['amount'];
            }

            echo json_encode([
                "success" => true,
                "supplier" => $supplier,
                "purchases" => $purchases,
                "payments" => $payments,
                "purchase_count" => count($purchases),
                "payment_count" => count($payments)
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["error" => "Database error: " . $e->getMessage()]);
        }
    }

    public static function create(array $user): void
    {
        self::requireWritePermission($user);
        global $conn;

        $data   = json_decode(file_get_contents("php://input"), true) ?? [];
        $shopId = (int) $user['shop_id'];

        // ── Validate required fields ──────────────────────────────────
        if (empty($data['name'])) {
            http_response_code(422);
            echo json_encode(["error" => "Supplier name is required"]);
            return;
        }

        // ── Sanitise basic fields ─────────────────────────────────────
        $email   = !empty($data['email'])   ? trim($data['email'])   : null;
        $phone   = !empty($data['phone'])   ? trim($data['phone'])   : null;
        $address = !empty($data['address']) ? trim($data['address']) : null;

        // ── Process products array ────────────────────────────────────
        $products = [];
        if (!empty($data['products']) && is_array($data['products'])) {
            foreach ($data['products'] as $p) {
                $name  = trim($p['product_name'] ?? '');
                $qty   = max(0.001, (float) ($p['quantity'] ?? 1));
                $unit  = trim($p['unit'] ?? 'pcs');
                $price = max(0, (float) ($p['cost_price'] ?? 0));
                $note  = trim($p['note'] ?? '');
                if ($name !== '' && $price > 0) {
                    $products[] = [
                        'product_name' => $name,
                        'quantity'     => $qty,
                        'unit'         => $unit ?: 'pcs',
                        'cost_price'   => $price,
                        'total_amount' => round($qty * $price, 2),
                        'note'         => $note ?: null,
                    ];
                }
            }
        }

        // ── Calculate totals ─────────────────────────────────────────
        $totalPurchased = array_sum(array_column($products, 'total_amount'));
        $paidAmount     = max(0, (float) ($data['paid_amount'] ?? 0));

        // Paid cannot exceed total
        if ($paidAmount > $totalPurchased && $totalPurchased > 0) {
            $paidAmount = $totalPurchased;
        }

        $remainingBalance = round($totalPurchased - $paidAmount, 2);
        $status = ($remainingBalance <= 0 && $totalPurchased > 0) ? 'cleared' : 'active';

        $conn->beginTransaction();
        try {
            // 1. Insert supplier ──────────────────────────────────────
            $stmt = $conn->prepare("
                INSERT INTO suppliers
                    (shop_id, name, email, phone, address,
                     total_purchased, total_paid, remaining_balance, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $shopId,
                trim($data['name']),
                $email,
                $phone,
                $address,
                $totalPurchased,
                $paidAmount,
                $remainingBalance,
                $status,
            ]);
            $newId = (int) $conn->lastInsertId();

            // 2. Insert each product purchase ─────────────────────────
            if (!empty($products)) {
                $pStmt = $conn->prepare("
                    INSERT INTO supplier_purchases
                        (shop_id, supplier_id, product_name, quantity, unit, cost_price, total_amount, note)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ");
                foreach ($products as $p) {
                    $pStmt->execute([
                        $shopId,
                        $newId,
                        $p['product_name'],
                        $p['quantity'],
                        $p['unit'],
                        $p['cost_price'],
                        $p['total_amount'],
                        $p['note'],
                    ]);
                }
            }

            // 3. Record initial payment if any ────────────────────────
            if ($paidAmount > 0) {
                $payMode = in_array($data['payment_mode'] ?? '', ['cash','upi','card','bank_transfer'])
                    ? $data['payment_mode']
                    : 'cash';
                $payNote = !empty($data['payment_note']) ? trim($data['payment_note']) : 'Initial payment';

                $payStmt = $conn->prepare("
                    INSERT INTO supplier_payments
                        (shop_id, supplier_id, amount, payment_mode, note)
                    VALUES (?, ?, ?, ?, ?)
                ");
                $payStmt->execute([$shopId, $newId, $paidAmount, $payMode, $payNote]);
            }

            $conn->commit();

            // 4. Fetch back the created supplier ──────────────────────
            $s2 = $conn->prepare("
                SELECT id, shop_id, name, email, phone, address,
                       total_purchased, total_paid, remaining_balance,
                       status, created_at, updated_at
                FROM suppliers WHERE id = ?
            ");
            $s2->execute([$newId]);
            $newSupplier = $s2->fetch(PDO::FETCH_ASSOC);

            $newSupplier['total_purchased']   = (float) $newSupplier['total_purchased'];
            $newSupplier['total_paid']         = (float) $newSupplier['total_paid'];
            $newSupplier['remaining_balance'] = (float) $newSupplier['remaining_balance'];

            http_response_code(201);
            echo json_encode([
                "success"        => true,
                "message"        => "Supplier created successfully",
                "supplier"       => $newSupplier,
                "purchase_count" => count($products),
            ]);

        } catch (Exception $e) {
            $conn->rollBack();
            http_response_code(500);
            echo json_encode([
                "error" => "Failed to create supplier: " . $e->getMessage()
            ]);
        }
    }
    
    public static function delete(array $user, int $id): void
    {
        self::requireWritePermission($user);
        global $conn;
        $shopId = (int) $user['shop_id'];

        // Verify supplier exists and belongs to shop
        $check = $conn->prepare("SELECT id FROM suppliers WHERE id = ? AND shop_id = ?");
        $check->execute([$id, $shopId]);
        
        if (!$check->fetch()) {
            http_response_code(404);
            echo json_encode(["error" => "Supplier not found"]);
            return;
        }

        // Delete supplier (cascades will handle related records)
        $stmt = $conn->prepare("DELETE FROM suppliers WHERE id = ? AND shop_id = ?");
        $stmt->execute([$id, $shopId]);

        echo json_encode(["message" => "Supplier deleted successfully"]);
    }
    
    public static function update(array $user, int $id): void
    {
        self::requireWritePermission($user);
        global $conn;
        $shopId = (int) $user['shop_id'];

        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        if (empty($data['name'])) {
            http_response_code(422);
            echo json_encode(["error" => "Supplier name is required"]);
            return;
        }

        try {
            // Verify supplier exists and belongs to shop
            $check = $conn->prepare("SELECT id FROM suppliers WHERE id = ? AND shop_id = ?");
            $check->execute([$id, $shopId]);
            if (!$check->fetch()) {
                http_response_code(404);
                echo json_encode(["error" => "Supplier not found"]);
                return;
            }

            $email = !empty($data['email']) ? trim($data['email']) : null;
            $phone = !empty($data['phone']) ? trim($data['phone']) : null;
            $address = !empty($data['address']) ? trim($data['address']) : null;

            $stmt = $conn->prepare("
                UPDATE suppliers 
                SET name = ?, email = ?, phone = ?, address = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ? AND shop_id = ?
            ");
            $stmt->execute([
                trim($data['name']),
                $email,
                $phone,
                $address,
                $id,
                $shopId
            ]);

            // Fetch updated supplier
            $s2 = $conn->prepare("
                SELECT id, shop_id, name, email, phone, address, 
                       total_purchased, total_paid, remaining_balance, 
                       status, created_at, updated_at
                FROM suppliers 
                WHERE id = ?
            ");
            $s2->execute([$id]);
            $updatedSupplier = $s2->fetch(PDO::FETCH_ASSOC);

            // Format numeric fields
            $updatedSupplier['total_purchased'] = (float) $updatedSupplier['total_purchased'];
            $updatedSupplier['total_paid'] = (float) $updatedSupplier['total_paid'];
            $updatedSupplier['remaining_balance'] = (float) $updatedSupplier['remaining_balance'];

            echo json_encode([
                "success" => true,
                "message" => "Supplier updated successfully",
                "supplier" => $updatedSupplier
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                "error" => "Failed to update supplier: " . $e->getMessage()
            ]);
        }
    }

    public static function addPayment(array $user, int $id): void
    {
        self::requireWritePermission($user);
        global $conn;

        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        $shopId = (int) $user['shop_id'];

        if (empty($data['amount']) || $data['amount'] <= 0) {
            http_response_code(422);
            echo json_encode(["error" => "Valid payment amount is required"]);
            return;
        }
        $amount = (float) $data['amount'];

        $conn->beginTransaction();
        try {
            // Log payment
            $stmt = $conn->prepare("
                INSERT INTO supplier_payments (shop_id, supplier_id, amount, payment_mode, note)
                VALUES (?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $shopId,
                $id,
                $amount,
                $data['payment_mode'] ?? 'cash',
                $data['note'] ?? null
            ]);

            // Update supplier balance
            $upd = $conn->prepare("
                UPDATE suppliers 
                SET total_paid = total_paid + ?, remaining_balance = remaining_balance - ?
                WHERE id = ? AND shop_id = ?
            ");
            $upd->execute([$amount, $amount, $id, $shopId]);

            // Auto-clear status if 0
            $conn->prepare("
                UPDATE suppliers 
                SET status = 'cleared' 
                WHERE id = ? AND shop_id = ? AND remaining_balance <= 0
            ")->execute([$id, $shopId]);
            
            // Or set active if > 0
            $conn->prepare("
                UPDATE suppliers 
                SET status = 'active' 
                WHERE id = ? AND shop_id = ? AND remaining_balance > 0
            ")->execute([$id, $shopId]);

            $conn->commit();
            echo json_encode(["message" => "Payment recorded successfully"]);
        } catch (Exception $e) {
            $conn->rollBack();
            http_response_code(500);
            echo json_encode(["error" => "Failed to record payment"]);
        }
    }
}
