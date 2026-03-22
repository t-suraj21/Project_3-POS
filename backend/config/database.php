<?php
// Database configuration - load from environment variables for security
$host     = $_ENV['DB_HOST']     ?? 'localhost';
$db_name  = $_ENV['DB_NAME']     ?? 'pos_db';
$username = $_ENV['DB_USER']     ?? 'root';
$password = $_ENV['DB_PASSWORD'] ?? '';

try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8mb4", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    // Set MySQL session to IST so DATE(created_at) matches the local calendar date
    // JWT expiry uses Unix timestamps (time()) which are timezone-independent, so this is safe.
    $conn->exec("SET time_zone = '+05:30'");
} catch (PDOException $e) {
    http_response_code(500);
    // Never expose database error details to frontend in production
    $isDevelopment = ($_ENV['APP_ENV'] ?? 'production') === 'development';
    $message = $isDevelopment 
        ? "Database connection failed: " . $e->getMessage()
        : "Database connection failed. Please contact support.";
    echo json_encode(["message" => $message]);
    error_log("Database connection error: " . $e->getMessage());
    exit;
}
?>
