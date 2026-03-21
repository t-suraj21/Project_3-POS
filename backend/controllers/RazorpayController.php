<?php
require_once __DIR__ . "/../config/database.php";

/**
 * RazorpayController
 *
 * Endpoints:
 *   POST /api/sales/razorpay/create-order   – Create Razorpay order + pending sale
 *   POST /api/sales/razorpay/verify-payment – Verify signature + finalise sale
 *   POST /api/webhooks/razorpay             – Handle Razorpay async webhook events
 */
class RazorpayController
{
    // ── Internal helpers ──────────────────────────────────────────────────────

    private static function creds(): array
    {
        return [
            'key_id'     => $_ENV['RAZORPAY_KEY_ID']      ?? '',
            'key_secret' => $_ENV['RAZORPAY_KEY_SECRET']  ?? '',
        ];
    }

    /**
     * Call the Razorpay REST API.
     *
     * @return array  ['ok' => bool, 'data' => array, 'http_code' => int]
     */
    private static function rzApi(string $endpoint, array $payload): array
    {
        ['key_id' => $keyId, 'key_secret' => $keySecret] = self::creds();

        $ch = curl_init("https://api.razorpay.com/v1{$endpoint}");
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => json_encode($payload),
            CURLOPT_USERPWD        => "{$keyId}:{$keySecret}",
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json', 'Accept: application/json'],
            CURLOPT_TIMEOUT        => 30,
        ]);
        $resp     = curl_exec($ch);
        $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlErr  = curl_error($ch);
        curl_close($ch);

        $data = $resp ? (json_decode($resp, true) ?? []) : [];
        return [
            'ok'        => !$curlErr && $httpCode === 200,
            'data'      => $data,
            'http_code' => $httpCode,
            'curl_err'  => $curlErr,
        ];
    }

    // ─── 1. CREATE ORDER ─────────────────────────────────────────────────────
    // POST /api/sales/razorpay/create-order
    public static function createOrder(array $user): void
    {
        global $conn;
        $shopId = (int) $user['shop_id'];
        $data   = json_decode(file_get_contents("php://input"), true) ?? [];

        // ── Credential check ──────────────────────────────────────────────────
        ['key_id' => $keyId, 'key_secret' => $keySecret] = self::creds();
        if (!$keyId || !$keySecret) {
            http_response_code(500);
            echo json_encode(["error" => "Razorpay credentials are not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env"]);
            return;
        }

        // ── Validate items ────────────────────────────────────────────────────
        $items = $data['items'] ?? [];
        if (empty($items)) {
            http_response_code(422);
            echo json_encode(["error" => "Cart is empty. Add at least one product."]);
            return;
        }

        // ── Validate customer fields ──────────────────────────────────────────
        $custName    = trim($data['customer_name']    ?? '');
        $custPhone   = trim($data['customer_phone']   ?? '');
        $custAddress = trim($data['customer_address'] ?? '');

        if (empty($custName)) {
            http_response_code(422);
            echo json_encode(["error" => "Customer name is required."]);
            return;
        }
        if (empty($custPhone)) {
            http_response_code(422);
            echo json_encode(["error" => "Customer mobile number is required."]);
            return;
        }

        // ── Compute totals ────────────────────────────────────────────────────
        $subtotal  = 0.0;
        foreach ($items as $item) $subtotal += (float)($item['total'] ?? 0);
        $discount  = max(0.0, (float)($data['discount']   ?? 0));
        $taxAmount = max(0.0, (float)($data['tax_amount'] ?? 0));
        $total     = round($subtotal - $discount + $taxAmount, 2);

        // Razorpay amount is in paise (₹1 = 100 paise)
        $amountPaise = (int) round($total * 100);
        if ($amountPaise < 100) {
            http_response_code(422);
            echo json_encode(["error" => "Minimum order amount is ₹1.00."]);
            return;
        }

        // ── Generate bill number ──────────────────────────────────────────────
        $billNum   = 'BILL-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -6));
        $receiptId = 'rcpt_' . strtolower(substr(uniqid(), -8));

        // ── Call Razorpay API ─────────────────────────────────────────────────
        $result = self::rzApi('/orders', [
            'amount'          => $amountPaise,
            'currency'        => 'INR',
            'receipt'         => $receiptId,
            'payment_capture' => 1,
            'notes'           => [
                'bill_number' => $billNum,
                'shop_id'     => (string) $shopId,
            ],
        ]);

        if (!$result['ok']) {
            $errMsg = $result['data']['error']['description']
                   ?? $result['curl_err']
                   ?? 'Razorpay API error. Please try again.';
            http_response_code(502);
            echo json_encode(["error" => $errMsg]);
            return;
        }

        $rzOrderId = $result['data']['id'];

        // ── Insert pending sale + items + deduct stock ────────────────────────
        $conn->beginTransaction();
        try {
            $stmt = $conn->prepare("
                INSERT INTO sales
                    (shop_id, bill_number, customer_id, customer_name, customer_phone,
                     customer_address, subtotal, discount, tax_amount, total_amount,
                     paid_amount, change_amount, payment_mode, payment_type, payment_status,
                     razorpay_order_id, note, status)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            ");
            $stmt->execute([
                $shopId,
                $billNum,
                !empty($data['customer_id']) ? (int)$data['customer_id'] : null,
                $custName,
                $custPhone,
                $custAddress ?: null,
                $subtotal,
                $discount,
                $taxAmount,
                $total,
                0,          // paid_amount = 0 until verified
                0,          // change_amount
                'online',
                'online',
                'pending',  // payment_status
                $rzOrderId,
                $data['note'] ?? null,
                'partial',  // sale status = partial until payment verified
            ]);
            $saleId = (int) $conn->lastInsertId();

            // Insert items + deduct stock
            $itemStmt = $conn->prepare("
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
                    !empty($item['product_id']) ? (int)$item['product_id'] : null,
                    $item['product_name'],
                    $item['sku']          ?? null,
                    $item['unit']         ?? null,
                    (int)   $item['quantity'],
                    (float)($item['cost_price']      ?? 0),
                    (float) $item['sell_price'],
                    (float)($item['discount_amount'] ?? 0),
                    (float) $item['total'],
                ]);
                if (!empty($item['product_id'])) {
                    $stockStmt->execute([(int)$item['quantity'], (int)$item['product_id'], $shopId]);
                }
            }

            $conn->commit();

            // ── Return all data the frontend needs for the checkout popup ─────
            echo json_encode([
                'razorpay_order_id' => $rzOrderId,
                'amount'            => $amountPaise,
                'currency'          => 'INR',
                'sale_id'           => $saleId,
                'bill_number'       => $billNum,
                'key_id'            => $keyId,
                'description'       => "Payment for Bill #{$billNum}",
                'prefill' => [
                    'name'    => $custName,
                    'contact' => $custPhone,
                    'email'   => '',
                ],
                'notes' => [
                    'bill_number' => $billNum,
                ],
            ]);

        } catch (\Exception $e) {
            $conn->rollBack();
            http_response_code(500);
            echo json_encode(["error" => "Failed to save pending sale: " . $e->getMessage()]);
        }
    }

    // ─── 2. VERIFY PAYMENT ───────────────────────────────────────────────────
    // POST /api/sales/razorpay/verify-payment
    public static function verifyPayment(array $user): void
    {
        global $conn;
        $shopId = (int) $user['shop_id'];
        $data   = json_decode(file_get_contents("php://input"), true) ?? [];

        $rzOrderId   = trim($data['razorpay_order_id']   ?? '');
        $rzPaymentId = trim($data['razorpay_payment_id'] ?? '');
        $rzSignature = trim($data['razorpay_signature']  ?? '');

        if (!$rzOrderId || !$rzPaymentId || !$rzSignature) {
            http_response_code(422);
            echo json_encode(["error" => "Missing payment verification fields."]);
            return;
        }

        // ── Verify HMAC-SHA256 signature ──────────────────────────────────────
        ['key_secret' => $keySecret] = self::creds();
        $expectedSig = hash_hmac('sha256', "{$rzOrderId}|{$rzPaymentId}", $keySecret);

        if (!hash_equals($expectedSig, $rzSignature)) {
            http_response_code(400);
            echo json_encode(["error" => "Payment signature verification failed. Possible tampered request."]);
            return;
        }

        // ── Load the pending sale ─────────────────────────────────────────────
        $stmt = $conn->prepare("
            SELECT id, bill_number, total_amount, customer_id,
                   customer_name, customer_phone, customer_address
            FROM sales
            WHERE razorpay_order_id = ? AND shop_id = ?
        ");
        $stmt->execute([$rzOrderId, $shopId]);
        $sale = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$sale) {
            http_response_code(404);
            echo json_encode(["error" => "Sale not found for this payment."]);
            return;
        }

        // Guard against double-processing (webhook may have already set it)
        $check = $conn->prepare("SELECT payment_status FROM sales WHERE id = ?");
        $check->execute([(int)$sale['id']]);
        if ($check->fetchColumn() === 'paid') {
            // Already marked paid — just return success silently
            echo json_encode([
                "success"     => true,
                "message"     => "Payment already verified.",
                "bill_number" => $sale['bill_number'],
                "sale_id"     => (int)$sale['id'],
                "total"       => (float)$sale['total_amount'],
                "payment_id"  => $rzPaymentId,
            ]);
            return;
        }

        $saleId = (int)$sale['id'];
        $total  = (float)$sale['total_amount'];

        $conn->beginTransaction();
        try {
            // ── Mark sale as fully paid ───────────────────────────────────────
            $conn->prepare("
                UPDATE sales
                SET payment_status      = 'paid',
                    status              = 'paid',
                    paid_amount         = total_amount,
                    change_amount       = 0,
                    razorpay_payment_id = ?,
                    razorpay_signature  = ?
                WHERE id = ? AND shop_id = ?
            ")->execute([$rzPaymentId, $rzSignature, $saleId, $shopId]);

            // ── Customer credit tracking ──────────────────────────────────────
            $custName       = trim($sale['customer_name']    ?? '');
            $custPhone      = trim($sale['customer_phone']   ?? '');
            $custAddress    = trim($sale['customer_address'] ?? '');
            $incomingCustId = !empty($sale['customer_id']) ? (int)$sale['customer_id'] : null;
            $billNum        = $sale['bill_number'];

            if ($custName || $incomingCustId) {
                if ($incomingCustId) {
                    $custId = $incomingCustId;
                    $conn->prepare("
                        UPDATE credit_customers
                        SET total_credit = total_credit + ?,
                            total_paid   = total_paid   + ?,
                            status       = IF(remaining_balance <= 0, 'cleared', 'active')
                        WHERE id = ? AND shop_id = ?
                    ")->execute([$total, $total, $custId, $shopId]);
                } else {
                    if ($custPhone !== '') {
                        $cStmt = $conn->prepare("SELECT id FROM credit_customers WHERE shop_id = ? AND phone = ?");
                        $cStmt->execute([$shopId, $custPhone]);
                    } else {
                        $cStmt = $conn->prepare("SELECT id FROM credit_customers WHERE shop_id = ? AND LOWER(name) = LOWER(?)");
                        $cStmt->execute([$shopId, $custName]);
                    }
                    $cust = $cStmt->fetch(PDO::FETCH_ASSOC);

                    if (!$cust) {
                        $conn->prepare("
                            INSERT INTO credit_customers
                                (shop_id, name, phone, address, total_credit, total_paid, remaining_balance, status)
                            VALUES (?,?,?,?,?,?,0,'cleared')
                        ")->execute([$shopId, $custName, $custPhone, $custAddress ?: null, $total, $total]);
                        $custId = (int)$conn->lastInsertId();
                    } else {
                        $custId = (int)$cust['id'];
                        $conn->prepare("
                            UPDATE credit_customers
                            SET total_credit = total_credit + ?,
                                total_paid   = total_paid   + ?,
                                status       = IF(remaining_balance <= 0, 'cleared', 'active')
                            WHERE id = ?
                        ")->execute([$total, $total, $custId]);
                    }
                }

                $conn->prepare("UPDATE sales SET customer_id = ? WHERE id = ?")
                     ->execute([$custId, $saleId]);
                $conn->prepare("
                    INSERT INTO credit_transactions
                        (shop_id, customer_id, bill_number, total_amount, paid_amount, remaining_amount, note)
                    VALUES (?,?,?,?,?,0,?)
                ")->execute([
                    $shopId, $custId, $billNum, $total, $total,
                    "Online payment via Razorpay | ID: {$rzPaymentId}",
                ]);
                $ctId = (int)$conn->lastInsertId();
                $saleItems = $conn->prepare("SELECT * FROM sale_items WHERE sale_id = ?");
                $saleItems->execute([$saleId]);
                $ctiStmt = $conn->prepare("
                    INSERT INTO credit_transaction_items (transaction_id, product_name, quantity, price, total)
                    VALUES (?,?,?,?,?)
                ");
                foreach ($saleItems->fetchAll(PDO::FETCH_ASSOC) as $item) {
                    $ctiStmt->execute([
                        $ctId, $item['product_name'],
                        $item['quantity'], $item['sell_price'], $item['total'],
                    ]);
                }
            }

            $conn->commit();

            echo json_encode([
                "success"     => true,
                "message"     => "Payment verified successfully!",
                "bill_number" => $billNum,
                "sale_id"     => $saleId,
                "total"       => $total,
                "payment_id"  => $rzPaymentId,
            ]);

        } catch (\Exception $e) {
            $conn->rollBack();
            http_response_code(500);
            echo json_encode(["error" => "Verification failed: " . $e->getMessage()]);
        }
    }

    // ─── 3. WEBHOOK ──────────────────────────────────────────────────────────
    // POST /api/webhooks/razorpay  (no JWT auth — verified via HMAC)
    public static function webhook(): void
    {
        global $conn;

        $rawPayload    = file_get_contents("php://input");
        $receivedSig   = $_SERVER['HTTP_X_RAZORPAY_SIGNATURE'] ?? '';
        $webhookSecret = $_ENV['RAZORPAY_WEBHOOK_SECRET']      ?? '';

        // ── Verify webhook signature if secret is set ─────────────────────────
        if ($webhookSecret !== '') {
            $expectedSig = hash_hmac('sha256', $rawPayload, $webhookSecret);
            if (!hash_equals($expectedSig, $receivedSig)) {
                http_response_code(400);
                echo json_encode(["error" => "Invalid webhook signature."]);
                return;
            }
        }

        $event     = json_decode($rawPayload, true) ?? [];
        $eventName = $event['event'] ?? '';

        switch ($eventName) {

            // ── Payment captured (async confirmation) ─────────────────────────
            case 'payment.captured':
                $payment   = $event['payload']['payment']['entity'] ?? [];
                $rzOrderId = $payment['order_id'] ?? '';
                $rzPayId   = $payment['id']        ?? '';

                if ($rzOrderId && $rzPayId) {
                    $conn->prepare("
                        UPDATE sales
                        SET payment_status      = 'paid',
                            status              = 'paid',
                            paid_amount         = total_amount,
                            razorpay_payment_id = ?
                        WHERE razorpay_order_id = ?
                          AND payment_status   != 'paid'
                    ")->execute([$rzPayId, $rzOrderId]);
                }
                break;

            // ── Payment failed ────────────────────────────────────────────────
            case 'payment.failed':
                $payment   = $event['payload']['payment']['entity'] ?? [];
                $rzOrderId = $payment['order_id'] ?? '';

                if ($rzOrderId) {
                    $conn->prepare("
                        UPDATE sales
                        SET payment_status = 'failed'
                        WHERE razorpay_order_id = ?
                          AND payment_status    = 'pending'
                    ")->execute([$rzOrderId]);
                }
                break;

            // ── Refund processed ──────────────────────────────────────────────
            case 'refund.processed':
                $refund    = $event['payload']['refund']['entity'] ?? [];
                $rzPayId   = $refund['payment_id'] ?? '';

                if ($rzPayId) {
                    $conn->prepare("
                        UPDATE sales
                        SET status         = 'refunded',
                            payment_status = 'paid'
                        WHERE razorpay_payment_id = ?
                    ")->execute([$rzPayId]);
                }
                break;
        }

        http_response_code(200);
        echo json_encode(["status" => "ok", "event" => $eventName]);
    }
}
?>
