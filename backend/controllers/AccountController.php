<?php
require_once __DIR__ . "/../config/database.php";

/**
 * AccountController
 * Manages credit (Udhar) customers, their transactions, and payment history.
 */
class AccountController
{
    // ─── GET /api/accounts/customers ─────────────────────────────────────────
    // Returns all credit customers for this shop with optional search & filter.
    public static function getCustomers(array $user): void
    {
        global $conn;

        $shopId      = (int) $user['shop_id'];
        $search      = trim($_GET['search']   ?? '');
        $onlyPending = ($_GET['pending'] ?? '') === '1';   // filter: balance > 0

        $where  = ["shop_id = ?"];
        $params = [$shopId];

        if ($search !== '') {
            $where[]  = "(name LIKE ? OR phone LIKE ?)";
            $params[] = "%{$search}%";
            $params[] = "%{$search}%";
        }

        if ($onlyPending) {
            $where[] = "remaining_balance > 0";
        }

        $whereSQL = implode(' AND ', $where);

        $stmt = $conn->prepare("
            SELECT id, name, phone, address,
                   total_credit, total_paid, remaining_balance, status, created_at
            FROM   credit_customers
            WHERE  {$whereSQL}
            ORDER  BY remaining_balance DESC, name ASC
        ");
        $stmt->execute($params);

        echo json_encode(["customers" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }

    // ─── GET /api/accounts/customers/:id ─────────────────────────────────────
    // Returns one customer + all their transactions (with items) + payment history.
    public static function getCustomer(array $user, int $id): void
    {
        global $conn;

        $shopId = (int) $user['shop_id'];

        // Customer row
        $stmt = $conn->prepare("
            SELECT id, name, phone, address,
                   total_credit, total_paid, remaining_balance, status, created_at
            FROM   credit_customers
            WHERE  id = ? AND shop_id = ?
        ");
        $stmt->execute([$id, $shopId]);
        $customer = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$customer) {
            http_response_code(404);
            echo json_encode(["error" => "Customer not found"]);
            return;
        }

        // Transactions
        $tStmt = $conn->prepare("
            SELECT id, bill_number, total_amount, paid_amount, remaining_amount, note, created_at
            FROM   credit_transactions
            WHERE  customer_id = ? AND shop_id = ?
            ORDER  BY created_at DESC
        ");
        $tStmt->execute([$id, $shopId]);
        $transactions = $tStmt->fetchAll(PDO::FETCH_ASSOC);

        // Items for each transaction
        foreach ($transactions as &$txn) {
            $iStmt = $conn->prepare("
                SELECT product_name, quantity, price, total
                FROM   credit_transaction_items
                WHERE  transaction_id = ?
                ORDER  BY id ASC
            ");
            $iStmt->execute([$txn['id']]);
            $txn['items'] = $iStmt->fetchAll(PDO::FETCH_ASSOC);
        }
        unset($txn);

        // Payment history
        $pStmt = $conn->prepare("
            SELECT id, amount, payment_mode, note, created_at
            FROM   credit_payments
            WHERE  customer_id = ? AND shop_id = ?
            ORDER  BY created_at DESC
        ");
        $pStmt->execute([$id, $shopId]);
        $payments = $pStmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "customer"     => $customer,
            "transactions" => $transactions,
            "payments"     => $payments,
        ]);
    }

    // ─── POST /api/accounts/customers ────────────────────────────────────────
    // Create a new credit customer.
    public static function createCustomer(array $user): void
    {
        global $conn;

        $data   = json_decode(file_get_contents("php://input"), true) ?? [];
        $shopId = (int) $user['shop_id'];

        if (empty($data['name']) || empty($data['phone'])) {
            http_response_code(422);
            echo json_encode(["error" => "Name and phone are required"]);
            return;
        }

        // Prevent duplicate phone in same shop
        $dup = $conn->prepare("SELECT id FROM credit_customers WHERE phone = ? AND shop_id = ?");
        $dup->execute([trim($data['phone']), $shopId]);
        if ($dup->fetch()) {
            http_response_code(409);
            echo json_encode(["error" => "A customer with this phone number already exists"]);
            return;
        }

        $stmt = $conn->prepare("
            INSERT INTO credit_customers (shop_id, name, phone, address)
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([
            $shopId,
            trim($data['name']),
            trim($data['phone']),
            $data['address'] ?? null,
        ]);

        $newId = (int) $conn->lastInsertId();
        $s2    = $conn->prepare("SELECT * FROM credit_customers WHERE id = ?");
        $s2->execute([$newId]);

        http_response_code(201);
        echo json_encode(["message" => "Customer created", "customer" => $s2->fetch(PDO::FETCH_ASSOC)]);
    }

    // ─── PUT /api/accounts/customers/:id ─────────────────────────────────────
    // Update customer details (name, phone, address).
    public static function updateCustomer(array $user, int $id): void
    {
        global $conn;

        $data   = json_decode(file_get_contents("php://input"), true) ?? [];
        $shopId = (int) $user['shop_id'];

        if (empty($data['name']) || empty($data['phone'])) {
            http_response_code(422);
            echo json_encode(["error" => "Name and phone are required"]);
            return;
        }

        $stmt = $conn->prepare("
            UPDATE credit_customers
            SET name = ?, phone = ?, address = ?
            WHERE id = ? AND shop_id = ?
        ");
        $stmt->execute([
            trim($data['name']),
            trim($data['phone']),
            $data['address'] ?? null,
            $id,
            $shopId,
        ]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(["error" => "Customer not found"]);
            return;
        }

        echo json_encode(["message" => "Customer updated"]);
    }

    // ─── DELETE /api/accounts/customers/:id ──────────────────────────────────
    public static function deleteCustomer(array $user, int $id): void
    {
        global $conn;

        $shopId = (int) $user['shop_id'];

        $chk = $conn->prepare("SELECT remaining_balance FROM credit_customers WHERE id = ? AND shop_id = ?");
        $chk->execute([$id, $shopId]);
        $customer = $chk->fetch(PDO::FETCH_ASSOC);

        if (!$customer) {
            http_response_code(404);
            echo json_encode(["error" => "Customer not found"]);
            return;
        }

        if ((float)$customer['remaining_balance'] > 0) {
            http_response_code(409);
            echo json_encode(["error" => "Cannot delete customer with outstanding balance"]);
            return;
        }

        $conn->prepare("DELETE FROM credit_customers WHERE id = ? AND shop_id = ?")->execute([$id, $shopId]);
        echo json_encode(["message" => "Customer deleted"]);
    }

    // ─── POST /api/accounts/transactions ─────────────────────────────────────
    // Record a new Udhar (credit) transaction.
    // Body: { customer_id, bill_number, total_amount, paid_amount, note, items:[{product_name,quantity,price,total}] }
    public static function addTransaction(array $user): void
    {
        global $conn;

        $data   = json_decode(file_get_contents("php://input"), true) ?? [];
        $shopId = (int) $user['shop_id'];

        $requiredFields = ['customer_id', 'total_amount'];
        foreach ($requiredFields as $f) {
            if (!isset($data[$f])) {
                http_response_code(422);
                echo json_encode(["error" => "Missing required field: {$f}"]);
                return;
            }
        }

        $customerId   = (int) $data['customer_id'];
        $totalAmount  = (float) $data['total_amount'];
        $paidAmount   = (float) ($data['paid_amount'] ?? 0);
        $remaining    = $totalAmount - $paidAmount;
        $billNumber   = $data['bill_number'] ?? ('BILL-' . strtoupper(uniqid()));

        // Verify customer belongs to this shop
        $chk = $conn->prepare("SELECT id FROM credit_customers WHERE id = ? AND shop_id = ?");
        $chk->execute([$customerId, $shopId]);
        if (!$chk->fetch()) {
            http_response_code(404);
            echo json_encode(["error" => "Customer not found"]);
            return;
        }

        $conn->beginTransaction();
        try {
            // Insert transaction
            $tStmt = $conn->prepare("
                INSERT INTO credit_transactions
                       (shop_id, customer_id, bill_number, total_amount, paid_amount, remaining_amount, note)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            $tStmt->execute([
                $shopId, $customerId, $billNumber,
                $totalAmount, $paidAmount, $remaining,
                $data['note'] ?? null,
            ]);
            $transactionId = (int) $conn->lastInsertId();

            // Insert items
            if (!empty($data['items']) && is_array($data['items'])) {
                $iStmt = $conn->prepare("
                    INSERT INTO credit_transaction_items
                           (transaction_id, product_name, quantity, price, total)
                    VALUES (?, ?, ?, ?, ?)
                ");
                foreach ($data['items'] as $item) {
                    $iStmt->execute([
                        $transactionId,
                        $item['product_name'],
                        (int) ($item['quantity'] ?? 1),
                        (float) $item['price'],
                        (float) $item['total'],
                    ]);
                }
            }

            // Update customer totals:
            //   totalCredit       += totalAmount
            //   totalPaid         += paidAmount
            //   remainingBalance  += remaining
            //   status             = 'active'  (they have an open bill)
            $uStmt = $conn->prepare("
                UPDATE credit_customers
                SET total_credit      = total_credit      + ?,
                    total_paid        = total_paid        + ?,
                    remaining_balance = remaining_balance + ?,
                    status            = IF(remaining_balance + ? > 0, 'active', 'cleared')
                WHERE id = ? AND shop_id = ?
            ");
            $uStmt->execute([$totalAmount, $paidAmount, $remaining, $remaining, $customerId, $shopId]);

            // If paid_amount > 0, also record a payment entry for the initial partial payment
            if ($paidAmount > 0) {
                $conn->prepare("
                    INSERT INTO credit_payments (shop_id, customer_id, amount, payment_mode, note)
                    VALUES (?, ?, ?, 'cash', ?)
                ")->execute([$shopId, $customerId, $paidAmount, "Partial payment at time of purchase"]);
            }

            $conn->commit();

            http_response_code(201);
            echo json_encode([
                "message"        => "Credit transaction recorded",
                "transaction_id" => $transactionId,
                "bill_number"    => $billNumber,
                "remaining"      => $remaining,
            ]);

        } catch (Exception $e) {
            $conn->rollBack();
            http_response_code(500);
            echo json_encode(["error" => "Transaction failed: " . $e->getMessage()]);
        }
    }

    // ─── POST /api/accounts/payments ─────────────────────────────────────────
    // Record a payment from a customer; updates balances across the board.
    // Body: { customer_id, amount, payment_mode, note }
    public static function addPayment(array $user): void
    {
        global $conn;

        $data   = json_decode(file_get_contents("php://input"), true) ?? [];
        $shopId = (int) $user['shop_id'];

        if (empty($data['customer_id']) || empty($data['amount'])) {
            http_response_code(422);
            echo json_encode(["error" => "customer_id and amount are required"]);
            return;
        }

        $customerId  = (int) $data['customer_id'];
        $amount      = (float) $data['amount'];
        $paymentMode = $data['payment_mode'] ?? 'cash';
        $note        = $data['note'] ?? null;

        if ($amount <= 0) {
            http_response_code(422);
            echo json_encode(["error" => "Payment amount must be greater than 0"]);
            return;
        }

        // Validate customer
        $chk = $conn->prepare("
            SELECT id, remaining_balance FROM credit_customers
            WHERE id = ? AND shop_id = ?
        ");
        $chk->execute([$customerId, $shopId]);
        $customer = $chk->fetch(PDO::FETCH_ASSOC);

        if (!$customer) {
            http_response_code(404);
            echo json_encode(["error" => "Customer not found"]);
            return;
        }

        if ($amount > (float) $customer['remaining_balance']) {
            http_response_code(422);
            echo json_encode(["error" => "Payment amount exceeds remaining balance"]);
            return;
        }

        $conn->beginTransaction();
        try {
            // Insert payment record
            $conn->prepare("
                INSERT INTO credit_payments (shop_id, customer_id, amount, payment_mode, note)
                VALUES (?, ?, ?, ?, ?)
            ")->execute([$shopId, $customerId, $amount, $paymentMode, $note]);

            // Apply payment to oldest unpaid transactions first (FIFO)
            $openTxns = $conn->prepare("
                SELECT id, remaining_amount
                FROM   credit_transactions
                WHERE  customer_id = ? AND shop_id = ? AND remaining_amount > 0
                ORDER  BY created_at ASC
            ");
            $openTxns->execute([$customerId, $shopId]);
            $leftToApply = $amount;

            foreach ($openTxns->fetchAll(PDO::FETCH_ASSOC) as $txn) {
                if ($leftToApply <= 0) break;

                $apply = min($leftToApply, (float)$txn['remaining_amount']);

                // Apply this portion to the transaction (additive to avoid race)
                $conn->prepare("
                    UPDATE credit_transactions
                    SET paid_amount = paid_amount + ?, remaining_amount = remaining_amount - ?
                    WHERE id = ?
                ")->execute([$apply, $apply, $txn['id']]);

                $leftToApply -= $apply;
            }

            // Update customer aggregate totals:
            //   totalPaid        += amount
            //   remainingBalance -= amount
            //   status           = 'cleared' if balance reaches 0
            $newBalance = (float)$customer['remaining_balance'] - $amount;
            $conn->prepare("
                UPDATE credit_customers
                SET total_paid        = total_paid + ?,
                    remaining_balance = remaining_balance - ?,
                    status            = IF(remaining_balance - ? <= 0, 'cleared', 'active')
                WHERE id = ? AND shop_id = ?
            ")->execute([$amount, $amount, $amount, $customerId, $shopId]);

            $conn->commit();

            echo json_encode([
                "message"          => "Payment recorded successfully",
                "amount_paid"      => $amount,
                "new_balance"      => round(max(0, $newBalance), 2),
                "status"           => $newBalance <= 0 ? "cleared" : "active",
            ]);

        } catch (Exception $e) {
            $conn->rollBack();
            http_response_code(500);
            echo json_encode(["error" => "Payment failed: " . $e->getMessage()]);
        }
    }

    // ─── GET /api/accounts/summary ───────────────────────────────────────────
    // Quick stats: total customers, total outstanding, total collected.
    public static function getSummary(array $user): void
    {
        global $conn;

        $shopId = (int) $user['shop_id'];

        $stmt = $conn->prepare("
            SELECT
                COUNT(*)                                   AS total_customers,
                SUM(total_credit)                          AS total_credit,
                SUM(total_paid)                            AS total_collected,
                SUM(remaining_balance)                     AS total_outstanding,
                SUM(status = 'cleared')                    AS cleared_customers,
                SUM(status = 'active' AND remaining_balance > 0) AS pending_customers
            FROM credit_customers
            WHERE shop_id = ?
        ");
        $stmt->execute([$shopId]);

        echo json_encode(["summary" => $stmt->fetch(PDO::FETCH_ASSOC)]);
    }
}
?>
