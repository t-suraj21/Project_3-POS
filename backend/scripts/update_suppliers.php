<?php
require_once __DIR__ . '/../config/database.php';

$sql = "
CREATE PROCEDURE _add_col()
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'suppliers' AND COLUMN_NAME = 'email') THEN
        ALTER TABLE suppliers ADD COLUMN email VARCHAR(255) NULL AFTER phone;
    END IF;
END;
";

try {
    global $conn;
    $conn->exec("DROP PROCEDURE IF EXISTS _add_col;");
    $conn->exec($sql);
    $conn->exec("CALL _add_col();");
    $conn->exec("DROP PROCEDURE _add_col;");
    echo "Migration completed successfully!\n";
} catch (PDOException $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}
