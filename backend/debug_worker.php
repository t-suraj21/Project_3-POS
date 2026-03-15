<?php
require_once __DIR__ . "/config/database.php";
require_once __DIR__ . "/controllers/WorkerController.php";

// Simulate a shop admin user
$user = [
    'id' => 1,
    'shop_id' => 1,
    'role' => 'shop_admin'
];

// Simulate POST request data
$_SERVER['REQUEST_METHOD'] = 'POST';

// Create worker data
$worker_data = [
    'name' => 'Test Worker',
    'email' => 'test' . time() . '@test.com',
    'password' => 'password123',
    'role' => 'sales_worker'
];

// Temporarily override input stream
$input = json_encode($worker_data);
$temp_file = tmpfile();
fwrite($temp_file, $input);
rewind($temp_file);

// Simulate php://input
global $argv;
$_POST = $worker_data; // Backup for debugging

echo "====== WORKER CREATION DEBUG ======\n";
echo "Shop ID: " . $user['shop_id'] . "\n";
echo "Worker Data: " . json_encode($worker_data, JSON_PRETTY_PRINT) . "\n";
echo "================================\n\n";

// Try to insert directly
try {
    echo "Testing direct database insert...\n";
    
    $stmt = $conn->prepare(
        "INSERT INTO users (shop_id, name, email, password, role, is_verified)
         VALUES (?, ?, ?, ?, ?, ?)"
    );
    
    $hashedPassword = password_hash($worker_data['password'], PASSWORD_BCRYPT);
    
    echo "Prepared statement successful\n";
    echo "Executing with:\n";
    echo "  shop_id: " . $user['shop_id'] . "\n";
    echo "  name: " . $worker_data['name'] . "\n";
    echo "  email: " . $worker_data['email'] . "\n";
    echo "  password hash: " . substr($hashedPassword, 0, 20) . "...\n";
    echo "  role: " . $worker_data['role'] . "\n";
    echo "  is_verified: 1\n";
    
    $result = $stmt->execute([
        $user['shop_id'],
        $worker_data['name'],
        $worker_data['email'],
        $hashedPassword,
        $worker_data['role'],
        1
    ]);
    
    if ($result) {
        echo "\n✓ Worker created successfully!\n";
        echo "Worker ID: " . $conn->lastInsertId() . "\n";
    } else {
        echo "\n✗ Execute returned false\n";
        print_r($stmt->errorInfo());
    }
    
} catch (Exception $e) {
    echo "\n✗ Exception occurred:\n";
    echo "Message: " . $e->getMessage() . "\n";
    echo "Code: " . $e->getCode() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}

// Now check if we can fetch workers
echo "\n\n✓ Fetching all workers for shop 1...\n";
try {
    $stmt = $conn->prepare(
        "SELECT id, name, email, role, is_verified, created_at
         FROM users
         WHERE shop_id = 1 AND role <> 'shop_admin'
         ORDER BY created_at DESC"
    );
    $stmt->execute([]);
    $workers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Found " . count($workers) . " workers\n";
    echo json_encode($workers, JSON_PRETTY_PRINT) . "\n";
} catch (Exception $e) {
    echo "✗ Failed to fetch workers: " . $e->getMessage() . "\n";
}

?>
