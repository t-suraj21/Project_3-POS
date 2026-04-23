<?php
require_once __DIR__ . '/../config/database.php';

$sql = file_get_contents(__DIR__ . '/suppliers_migration.sql');
if (!$sql) {
    die("Could not read migration file.");
}

try {
    global $conn;
    $conn->exec($sql);
    echo "Migration completed successfully!\n";
} catch (PDOException $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}
