<?php
/**
 * Debug Route - Verify Suppliers Table and Data
 * This is for testing/troubleshooting only
 */
require_once __DIR__ . "/../config/database.php";
require_once __DIR__ . "/../middleware/authMiddleware.php";

try {
    $user = AuthMiddleware::verifyToken();
    $shopId = (int) $user['shop_id'];
    
    global $conn;
    
    // 1. Check if table exists
    $tableCheck = $conn->prepare("
        SELECT COUNT(*) as cnt FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'suppliers'
    ");
    $tableCheck->execute();
    $tableExists = (bool) $tableCheck->fetchColumn();
    
    // 2. Check suppliers in this shop
    $suppliersCheck = $conn->prepare("SELECT COUNT(*) as cnt FROM suppliers WHERE shop_id = ?");
    $suppliersCheck->execute([$shopId]);
    $supplierCount = $suppliersCheck->fetchColumn();
    
    // 3. Get all suppliers for this shop with details
    $suppliersQuery = $conn->prepare("
        SELECT id, name, email, phone, address, total_purchased, total_paid, remaining_balance, status, created_at, shop_id
        FROM suppliers 
        WHERE shop_id = ? 
        ORDER BY created_at DESC
    ");
    $suppliersQuery->execute([$shopId]);
    $suppliers = $suppliersQuery->fetchAll(PDO::FETCH_ASSOC);
    
    // 4. Get all suppliers (all shops) for admin
    $allSuppliersQuery = $conn->prepare("SELECT COUNT(*) as cnt FROM suppliers");
    $allSuppliersQuery->execute();
    $totalSupplierCount = $allSuppliersQuery->fetchColumn();
    
    echo json_encode([
        "status" => "success",
        "debug_info" => [
            "table_exists" => $tableExists,
            "total_suppliers_all_shops" => $totalSupplierCount,
            "suppliers_in_your_shop" => $supplierCount,
            "your_shop_id" => $shopId,
            "user_role" => $user['role'],
            "user_name" => $user['name'] ?? 'N/A'
        ],
        "suppliers" => $suppliers
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
