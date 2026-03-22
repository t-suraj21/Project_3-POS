<?php
/**
 * Setup Billing Layouts
 * 
 * This script populates the billing_layouts table with all available layout options.
 * Run from command line: php backend/setup_billing_layouts.php
 */

require_once __DIR__ . "/config/database.php";

try {
    // Check if table exists
    $checkTable = $conn->query("SHOW TABLES LIKE 'billing_layouts'");
    if ($checkTable->rowCount() == 0) {
        echo "❌ Error: billing_layouts table doesn't exist.\n";
        echo "Please run: mysql -u root pos_db < backend/database/billing_layout_migration.sql\n";
        exit(1);
    }

    // Clear existing layouts
    $conn->exec("TRUNCATE TABLE billing_layouts");
    echo "✅ Cleared existing layouts.\n";

    // Insert all layout options
    $layouts = [
        ['Classic', 'classic', 'Traditional layout with logo at top and details below'],
        ['Modern', 'modern', 'Clean, minimalist design with centered logo and modern styling'],
        ['Detailed', 'detailed', 'Comprehensive layout with all transaction details prominently displayed'],
        ['Compact', 'compact', 'Space-efficient layout designed for small receipts and thermal printers'],
        ['Professional', 'professional', 'Business-style layout with company branding and formal structure'],
        ['Teal Adventure', 'teal-adventure', 'Modern teal-themed design with gradient header, perfect for service businesses'],
        ['Purple Gradient', 'purple-gradient', 'Elegant purple to red gradient design ideal for creative studios and shops'],
        ['Corporate Blue', 'corporate-blue', 'Professional blue-themed layout with clean structure for corporate businesses'],
    ];

    $stmt = $conn->prepare("
        INSERT INTO billing_layouts (name, code, description, is_active) 
        VALUES (?, ?, ?, 1)
    ");

    foreach ($layouts as [$name, $code, $desc]) {
        $stmt->execute([$name, $code, $desc]);
        echo "✅ Added: {$name}\n";
    }

    // Verify insertion
    $result = $conn->query("SELECT COUNT(*) as total FROM billing_layouts WHERE is_active = 1");
    $count = $result->fetch(PDO::FETCH_ASSOC)['total'];

    echo "\n✅ SUCCESS! Inserted {$count} billing layouts.\n\n";
    
    // Display all layouts
    $layouts = $conn->query("SELECT id, name, code FROM billing_layouts ORDER BY id ASC");
    foreach ($layouts as $layout) {
        echo "  [{$layout['id']}] {$layout['name']} ({$layout['code']})\n";
    }

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
