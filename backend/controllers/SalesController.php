<?php
require_once __DIR__ . "/../config/database.php";

class SalesController
{
    // ─── GET /api/sales ───────────────────────────────────────────────────────
    public static function getAll(array $user): void
    {
        global $conn;
        $shopId = (int) $user['shop_id'];
        $limit  = min((int) ($_GET['limit'] ?? 100), 500);
        $status = trim($_GET['status'] ?? '');
        $search = trim($_GET['search'] ?? '');
        $date   = trim($_GET['date']   ?? '');

        $where  = ["s.shop_id = ?"];
        $params = [$shopId];

        if ($status !== '' && $status !== 'all') {
            // completed = fully paid (status = 'paid')
            // pending   = credit sales (status = 'credit') OR partial payments (status = 'partial')
            // refunded  = status = 'refunded'
            if ($status === 'completed') {
                $where[]  = "s.status = 'paid'";
            } elseif ($status === 'pending') {
                $where[]  = "s.status IN ('credit', 'partial')";
            } elseif ($status === 'refunded') {
                $where[]  = "s.status = 'refunded'";
            }
        }
        if ($search !== '') {
            $like     = "%{$search}%";
            $where[]  = "(s.bill_number LIKE ? OR s.customer_name LIKE ? OR s.customer_phone LIKE ?)";
            array_push($params, $like, $like, $like);
        }
        if ($date !== '') {
            $where[]  = "DATE(s.created_at) = ?";
            $params[] = $date;
        }

        $whereSQL = implode(' AND ', $where);

        $stmt = $conn->prepare("
            SELECT s.id, s.bill_number, s.customer_name, s.customer_phone,
                   s.subtotal, s.discount, s.tax_amount, s.total_amount,
                   s.paid_amount, s.change_amount, s.payment_mode, s.status,
                   s.note, s.created_at,
                   COUNT(si.id) AS item_count
            FROM sales s
            LEFT JOIN sale_items si ON si.sale_id = s.id
            WHERE {$whereSQL}
            GROUP BY s.id
            ORDER BY s.created_at DESC
            LIMIT {$limit}
        ");
        $stmt->execute($params);
        $sales = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Total count for badge
        $cStmt = $conn->prepare("SELECT COUNT(*) FROM sales s WHERE {$whereSQL}");
        $cStmt->execute($params);
        $total = (int) $cStmt->fetchColumn();

        echo json_encode(["sales" => $sales, "total" => $total]);
    }

    // ─── PUT /api/sales/:id/refund ────────────────────────────────────────────
    public static function refund(array $user, int $id): void
    {
        global $conn;
        $shopId = (int) $user['shop_id'];

        // Verify sale belongs to shop and is not already refunded
        $stmt = $conn->prepare("SELECT id, status FROM sales WHERE id = ? AND shop_id = ?");
        $stmt->execute([$id, $shopId]);
        $sale = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$sale) {
            http_response_code(404);
            echo json_encode(["error" => "Sale not found."]);
            return;
        }
        if ($sale['status'] === 'refunded') {
            http_response_code(422);
            echo json_encode(["error" => "This sale has already been refunded."]);
            return;
        }

        $conn->beginTransaction();
        try {
            // Restore stock for every item
            $items = $conn->prepare("SELECT product_id, quantity FROM sale_items WHERE sale_id = ?");
            $items->execute([$id]);
            $restore = $conn->prepare(
                "UPDATE products SET stock = stock + ? WHERE id = ? AND shop_id = ?"
            );
            foreach ($items->fetchAll(PDO::FETCH_ASSOC) as $item) {
                if (!empty($item['product_id'])) {
                    $restore->execute([(int)$item['quantity'], (int)$item['product_id'], $shopId]);
                }
            }

            // Mark sale as refunded
            $conn->prepare("UPDATE sales SET status = 'refunded' WHERE id = ?")
                 ->execute([$id]);

            $conn->commit();
            echo json_encode(["message" => "Sale refunded successfully. Stock has been restored."]);

        } catch (\Exception $e) {
            $conn->rollBack();
            http_response_code(500);
            echo json_encode(["error" => "Refund failed: " . $e->getMessage()]);
        }
    }

    // ─── GET /api/sales/:id ───────────────────────────────────────────────────
    public static function getOne(array $user, int $id): void
    {
        global $conn;
        $shopId = (int) $user['shop_id'];

        $stmt = $conn->prepare("SELECT * FROM sales WHERE id = ? AND shop_id = ?");
        $stmt->execute([$id, $shopId]);
        $sale = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$sale) {
            http_response_code(404);
            echo json_encode(["error" => "Sale not found"]);
            return;
        }

        $stmt2 = $conn->prepare("SELECT * FROM sale_items WHERE sale_id = ?");
        $stmt2->execute([$id]);
        $sale['items'] = $stmt2->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["sale" => $sale]);
    }

    // ─── POST /api/sales/:id/collect-payment ─────────────────────────────────
    // Collect a balance payment on a pending/partial/credit sale.
    // Updates: sales, credit_transactions, credit_customers, credit_payments.
    // Body: { amount, payment_mode, note }
    public static function collectPayment(array $user, int $id): void
    {
        global $conn;
        $shopId = (int) $user['shop_id'];
        $data   = json_decode(file_get_contents("php://input"), true) ?? [];

        $amount  = (float) ($data['amount']       ?? 0);
        $payMode = in_array($data['payment_mode'] ?? '', ['cash','upi','card','credit'])
                     ? $data['payment_mode'] : 'cash';
        $note    = trim($data['note'] ?? '');

        if ($amount <= 0) {
            http_response_code(422);
            echo json_encode(["error" => "Payment amount must be greater than 0."]);
            return;
        }

        // Load sale
        $stmt = $conn->prepare("SELECT * FROM sales WHERE id = ? AND shop_id = ?");
        $stmt->execute([$id, $shopId]);
        $sale = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$sale) {
            http_response_code(404);
            echo json_encode(["error" => "Sale not found."]);
            return;
        }
        if (in_array($sale['status'], ['paid', 'refunded'])) {
            http_response_code(422);
            echo json_encode(["error" => "This sale is already fully paid or refunded."]);
            return;
        }

        $remaining = round((float)$sale['total_amount'] - (float)$sale['paid_amount'], 2);
        if ($amount > $remaining + 0.01) {
            http_response_code(422);
            echo json_encode([
                "error" => "Amount (₹" . number_format($amount, 2) .
                           ") exceeds remaining balance (₹" . number_format($remaining, 2) . ")."
            ]);
            return;
        }

        $newPaid    = round((float)$sale['paid_amount'] + $amount, 2);
        $newBalance = round(max(0, (float)$sale['total_amount'] - $newPaid), 2);
        $newStatus  = $newBalance <= 0.001 ? 'paid' : 'partial';

        $conn->beginTransaction();
        try {
            // 1. Update sale paid amount + status
            $conn->prepare(
                "UPDATE sales SET paid_amount = ?, status = ? WHERE id = ? AND shop_id = ?"
            )->execute([$newPaid, $newStatus, $id, $shopId]);

            // 2. Apply to matching credit_transactions (by bill_number, oldest first)
            $openTxns = $conn->prepare("
                SELECT id, remaining_amount
                FROM   credit_transactions
                WHERE  shop_id = ? AND bill_number = ? AND remaining_amount > 0
                ORDER  BY created_at ASC
            ");
            $openTxns->execute([$shopId, $sale['bill_number']]);
            $leftToApply = $amount;

            foreach ($openTxns->fetchAll(PDO::FETCH_ASSOC) as $txn) {
                if ($leftToApply <= 0.001) break;
                $apply = min($leftToApply, (float)$txn['remaining_amount']);
                $conn->prepare("
                    UPDATE credit_transactions
                    SET paid_amount     = paid_amount     + ?,
                        remaining_amount = remaining_amount - ?
                    WHERE id = ?
                ")->execute([$apply, $apply, (int)$txn['id']]);
                $leftToApply -= $apply;
            }

            // 3. Update credit_customers if this sale is linked to one
            if (!empty($sale['customer_id'])) {
                $custId = (int) $sale['customer_id'];

                $cStmt = $conn->prepare(
                    "SELECT id, remaining_balance FROM credit_customers WHERE id = ? AND shop_id = ?"
                );
                $cStmt->execute([$custId, $shopId]);
                $custRow = $cStmt->fetch(PDO::FETCH_ASSOC);

                if ($custRow) {
                    $conn->prepare("
                        UPDATE credit_customers
                        SET total_paid        = total_paid        + ?,
                            remaining_balance = GREATEST(0, remaining_balance - ?),
                            status            = IF(remaining_balance - ? <= 0, 'cleared', 'active')
                        WHERE id = ? AND shop_id = ?
                    ")->execute([$amount, $amount, $amount, $custId, $shopId]);

                    // Record in credit_payments
                    $conn->prepare("
                        INSERT INTO credit_payments (shop_id, customer_id, amount, payment_mode, note)
                        VALUES (?, ?, ?, ?, ?)
                    ")->execute([
                        $shopId, $custId, $amount, $payMode,
                        $note ?: "Balance payment for {$sale['bill_number']}",
                    ]);
                }
            }

            $conn->commit();

            echo json_encode([
                "message"     => "Payment collected successfully.",
                "new_paid"    => $newPaid,
                "new_balance" => $newBalance,
                "new_status"  => $newStatus,
            ]);

        } catch (\Exception $e) {
            $conn->rollBack();
            http_response_code(500);
            echo json_encode(["error" => "Payment failed: " . $e->getMessage()]);
        }
    }

    // ─── POST /api/sales ──────────────────────────────────────────────────────
    public static function create(array $user): void
    {
        global $conn;
        $shopId = (int) $user['shop_id'];
        $data   = json_decode(file_get_contents("php://input"), true) ?? [];

        // ── Validate items ────────────────────────────────────────────────────
        $items = $data['items'] ?? [];
        if (empty($items)) {
            http_response_code(422);
            echo json_encode(["error" => "Cart is empty. Add at least one product."]);
            return;
        }

        // ── Compute totals ────────────────────────────────────────────────────
        $subtotal   = 0;
        foreach ($items as $item) {
            $subtotal += (float) ($item['total'] ?? 0);
        }
        $discount    = max(0, (float) ($data['discount']    ?? 0));
        $taxAmount   = max(0, (float) ($data['tax_amount']  ?? 0));
        $total       = $subtotal - $discount + $taxAmount;
        $paidAmount  = (float) ($data['paid_amount']  ?? $total);
        $change      = max(0, $paidAmount - $total);
        $payMode     = in_array($data['payment_mode'] ?? '', ['cash','upi','card','credit'])
                         ? $data['payment_mode'] : 'cash';
        $status      = $payMode === 'credit' ? 'credit'
                         : ($paidAmount >= $total ? 'paid' : 'partial');

        // ── Bill number: BILL-YYYYMMDD-XXXXXX ────────────────────────────────
        $billNum = 'BILL-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -6));

        $conn->beginTransaction();
        try {
            // ── Insert sale ───────────────────────────────────────────────────
            $stmt = $conn->prepare("
                INSERT INTO sales
                    (shop_id, bill_number, customer_id, customer_name, customer_phone,
                     customer_address,
                     subtotal, discount, tax_amount, total_amount, paid_amount,
                     change_amount, payment_mode, note, status)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            ");
            $stmt->execute([
                $shopId,
                $billNum,
                $data['customer_id']      ?? null,
                $data['customer_name']    ?? null,
                $data['customer_phone']   ?? null,
                $data['customer_address'] ?? null,
                $subtotal,
                $discount,
                $taxAmount,
                $total,
                $paidAmount,
                $change,
                $payMode,
                $data['note']             ?? null,
                $status,
            ]);
            $saleId = (int) $conn->lastInsertId();

            // ── Insert items + deduct stock ───────────────────────────────────
            $itemStmt  = $conn->prepare("
                INSERT INTO sale_items
                    (sale_id, product_id, product_name, sku, unit, quantity,
                     cost_price, sell_price, discount_amount, total)
                VALUES (?,?,?,?,?,?,?,?,?,?)
            ");
            $stockStmt = $conn->prepare(
                "UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ? AND shop_id = ?"
            );

            foreach ($items as $item) {
                $itemStmt->execute([
                    $saleId,
                    $item['product_id']   ?? null,
                    $item['product_name'],
                    $item['sku']          ?? null,
                    $item['unit']         ?? null,
                    (int)   $item['quantity'],
                    (float) ($item['cost_price']      ?? 0),
                    (float)  $item['sell_price'],
                    (float) ($item['discount_amount'] ?? 0),
                    (float)  $item['total'],
                ]);
                if (!empty($item['product_id'])) {
                    $stockStmt->execute([(int) $item['quantity'], (int) $item['product_id'], $shopId]);
                }
            }

            // ── Link to customer record for ALL payment modes ─────────────────
            // Any sale with a customer name (or selected customer ID) gets tracked.
            // For cash/UPI/card: balance = 0 (fully paid). For credit/partial: balance > 0.
            $custName       = trim($data['customer_name']    ?? '');
            $custPhone      = trim($data['customer_phone']   ?? '');
            $custAddress    = trim($data['customer_address'] ?? '');
            $incomingCustId = !empty($data['customer_id']) ? (int) $data['customer_id'] : null;
            $balance        = round($total - $paidAmount, 2); // ≥0; 0 for fully paid

            if (!empty($custName) || $incomingCustId) {
                if ($incomingCustId) {
                    // Use existing customer from the dropdown
                    $custId = $incomingCustId;
                    $conn->prepare("
                        UPDATE credit_customers
                        SET total_credit       = total_credit       + ?,
                            total_paid         = total_paid         + ?,
                            remaining_balance  = remaining_balance  + ?,
                            status             = IF(remaining_balance + ? <= 0, 'cleared', 'active')
                        WHERE id = ? AND shop_id = ?
                    ")->execute([$total, $paidAmount, $balance, $balance, $custId, $shopId]);
                } else {
                    // Upsert: find by phone (preferred) or name
                    if ($custPhone !== '') {
                        $custStmt = $conn->prepare(
                            "SELECT id FROM credit_customers WHERE shop_id = ? AND phone = ?"
                        );
                        $custStmt->execute([$shopId, $custPhone]);
                    } else {
                        $custStmt = $conn->prepare(
                            "SELECT id FROM credit_customers WHERE shop_id = ? AND LOWER(name) = LOWER(?)"
                        );
                        $custStmt->execute([$shopId, $custName]);
                    }
                    $cust = $custStmt->fetch(PDO::FETCH_ASSOC);

                    if (!$cust) {
                        $conn->prepare("
                            INSERT INTO credit_customers
                                (shop_id, name, phone, address, total_credit, total_paid, remaining_balance, status)
                            VALUES (?,?,?,?,?,?,?,?)
                        ")->execute([
                            $shopId,
                            $custName,
                            $custPhone,
                            $custAddress ?: null,
                            $total,
                            $paidAmount,
                            $balance,
                            $balance > 0 ? 'active' : 'cleared',
                        ]);
                        $custId = (int) $conn->lastInsertId();
                    } else {
                        $custId = (int) $cust['id'];
                        $conn->prepare("
                            UPDATE credit_customers
                            SET total_credit      = total_credit      + ?,
                                total_paid        = total_paid        + ?,
                                remaining_balance = remaining_balance + ?,
                                status            = IF(remaining_balance + ? <= 0, 'cleared', 'active')
                            WHERE id = ?
                        ")->execute([$total, $paidAmount, $balance, $balance, $custId]);
                    }
                }

                // Link the sale row to this customer
                $conn->prepare("UPDATE sales SET customer_id = ? WHERE id = ?")
                     ->execute([$custId, $saleId]);

                // Record a transaction (visible in Customer Detail page)
                $conn->prepare("
                    INSERT INTO credit_transactions
                        (shop_id, customer_id, bill_number, total_amount, paid_amount, remaining_amount, note)
                    VALUES (?,?,?,?,?,?,?)
                ")->execute([
                    $shopId, $custId, $billNum, $total, $paidAmount, $balance,
                    $data['note'] ?? null,
                ]);
                $ctId = (int) $conn->lastInsertId();

                // Transaction items
                $ctiStmt = $conn->prepare("
                    INSERT INTO credit_transaction_items (transaction_id, product_name, quantity, price, total)
                    VALUES (?,?,?,?,?)
                ");
                foreach ($items as $item) {
                    $ctiStmt->execute([
                        $ctId,
                        $item['product_name'],
                        (int)   $item['quantity'],
                        (float) $item['sell_price'],
                        (float) $item['total'],
                    ]);
                }
            }

            $conn->commit();

            http_response_code(201);
            echo json_encode([
                "message"     => "Sale completed successfully!",
                "bill_number" => $billNum,
                "sale_id"     => $saleId,
                "total"       => $total,
                "change"      => $change,
            ]);

        } catch (\Exception $e) {
            $conn->rollBack();
            http_response_code(500);
            echo json_encode(["error" => "Failed to save sale: " . $e->getMessage()]);
        }
    }
}
