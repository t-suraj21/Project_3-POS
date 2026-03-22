<?php
/**
 * Database Clear Script
 * This script truncates all tables in the pos_db database
 * WARNING: This will permanently delete all data!
 */

require_once __DIR__ . '/config/database.php';

echo "╔════════════════════════════════════════════════════════════╗\n";
echo "║          POS Database Clear Script                         ║\n";
echo "╚════════════════════════════════════════════════════════════╝\n\n";

try {
    // Disable foreign key checks to allow truncating tables with relationships
    echo "[1/4] Disabling foreign key checks...\n";
    $conn->exec("SET FOREIGN_KEY_CHECKS = 0");

    // Get all tables in the database
    echo "[2/4] Fetching all tables...\n";
    $stmt = $conn->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

    if (empty($tables)) {
        echo "✓ No tables found in database.\n";
        exit(0);
    }

    echo "   Found " . count($tables) . " tables.\n\n";

    // Truncate each table
    echo "[3/4] Truncating tables...\n";
    foreach ($tables as $table) {
        try {
            $conn->exec("TRUNCATE TABLE `$table`");
            echo "   ✓ Cleared: $table\n";
        } catch (PDOException $e) {
            echo "   ✗ Failed to clear $table: " . $e->getMessage() . "\n";
        }
    }

    // Re-enable foreign key checks
    echo "\n[4/4] Re-enabling foreign key checks...\n";
    $conn->exec("SET FOREIGN_KEY_CHECKS = 1");

    echo "\n╔════════════════════════════════════════════════════════════╗\n";
    echo "║  ✓ Database cleared successfully!                          ║\n";
    echo "║                                                            ║\n";
    echo "║  All data has been removed from all tables.                ║\n";
    echo "║  Table structures remain intact.                           ║\n";
    echo "╚════════════════════════════════════════════════════════════╝\n\n";

} catch (PDOException $e) {
    echo "\n✗ Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
