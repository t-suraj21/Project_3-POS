<?php
$host     = "localhost";
$db_name  = "pos_db";
$username = "root";
$password = "";

try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8mb4", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    // Set MySQL session to IST so DATE(created_at) matches the local calendar date
    // JWT expiry uses Unix timestamps (time()) which are timezone-independent, so this is safe.
    $conn->exec("SET time_zone = '+05:30'");
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["message" => "Database connection failed: " . $e->getMessage()]);
    exit;
}
?>
