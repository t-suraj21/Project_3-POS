<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/controllers/SupplierController.php';

global $conn;
$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

try {
    $_SERVER['REQUEST_METHOD'] = 'POST';
    $user = ['shop_id' => 4, 'role' => 'shop_admin'];

    // Override php://input with our test object
    // Wait, we can't easily mock php://input. Let's just modify the controller logic safely.
    $data = ["name" => "Inline Supplier"];

    $stmt = $conn->prepare("
        INSERT INTO suppliers (shop_id, name, email, phone, address)
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        (int) $user['shop_id'],
        trim($data['name']),
        trim($data['email'] ?? ''),
        trim($data['phone'] ?? ''),
        trim($data['address'] ?? '')
    ]);

    echo "INLINE SUCCESS " . $conn->lastInsertId();
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
