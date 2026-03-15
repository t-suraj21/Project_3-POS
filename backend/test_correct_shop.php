<?php
require_once __DIR__ . "/config/database.php";

$worker_data = [
    'name' => 'Aditya',
    'email' => 'aditya' . time() . '@test.com',
    'password' => 'password123',
    'role' => 'sales_worker'
];

// Use correct shop ID (11 for Suraj Yadav)
$shop_id = 11;

try {
    echo "Creating worker for shop_id: $shop_id\n";
    echo "Worker: " . $worker_data['name'] . " (" . $worker_data['email'] . ")\n\n";
    
    $stmt = $conn->prepare(
        "INSERT INTO users (shop_id, name, email, password, role, is_verified)
         VALUES (?, ?, ?, ?, ?, ?)"
    );
    
    $hashedPassword = password_hash($worker_data['password'], PASSWORD_BCRYPT);
    
    $result = $stmt->execute([
        $shop_id,
        $worker_data['name'],
        $worker_data['email'],
        $hashedPassword,
        $worker_data['role'],
        1
    ]);
    
    if ($result) {
        echo "✓ Worker created successfully!\n";
        echo "Worker ID: " . $conn->lastInsertId() . "\n\n";
    }
    
    // Verify it appears in the list
    echo "Fetching all workers for shop $shop_id...\n";
    $stmt2 = $conn->prepare(
        "SELECT id, name, email, role, is_verified, created_at FROM users 
         WHERE shop_id = ? AND role <> 'shop_admin'
         ORDER BY created_at DESC"
    );
    $stmt2->execute([$shop_id]);
    $workers = $stmt2->fetchAll(PDO::FETCH_ASSOC);
    echo "Found " . count($workers) . " workers:\n";
    foreach ($workers as $w) {
        echo "  ✓ " . $w['name'] . " (" . $w['email'] . ") - " . $w['role'] . " - Created: " . $w['created_at'] . "\n";
    }
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
}

?>
