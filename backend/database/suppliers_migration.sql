-- ═════════════════════════════════════════════════════════════════════════════
-- SUPPLIERS MANAGEMENT MIGRATION
-- ═════════════════════════════════════════════════════════════════════════════

-- 1. Add supplier_id to products table
CREATE PROCEDURE _add_supplier_id_safe()
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME   = 'products'
          AND COLUMN_NAME  = 'supplier_id'
    ) THEN
        ALTER TABLE products ADD COLUMN supplier_id INT NULL;
    END IF;
END;
CALL _add_supplier_id_safe();
DROP PROCEDURE _add_supplier_id_safe;

-- 2. Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    shop_id           INT NOT NULL,
    name              VARCHAR(200) NOT NULL,
    email             VARCHAR(100) NULL,
    phone             VARCHAR(30)  NULL,
    address           VARCHAR(255) NULL,
    total_purchased   DECIMAL(12,2) DEFAULT 0,
    total_paid        DECIMAL(12,2) DEFAULT 0,
    remaining_balance DECIMAL(12,2) DEFAULT 0,
    status            ENUM('active','cleared') DEFAULT 'active',
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
);

-- 3. Create supplier_purchases table
CREATE TABLE IF NOT EXISTS supplier_purchases (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    shop_id      INT NOT NULL,
    supplier_id  INT NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    quantity     INT NOT NULL DEFAULT 1,
    cost_price   DECIMAL(12,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    note         VARCHAR(255) NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id)     REFERENCES shops(id) ON DELETE CASCADE,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
);

-- 4. Create supplier_payments table
CREATE TABLE IF NOT EXISTS supplier_payments (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    shop_id      INT NOT NULL,
    supplier_id  INT NOT NULL,
    amount       DECIMAL(12,2) NOT NULL,
    payment_mode ENUM('cash','upi','card','bank_transfer') DEFAULT 'cash',
    note         VARCHAR(255) NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id)     REFERENCES shops(id) ON DELETE CASCADE,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
);

-- Add foreign key reference from products to suppliers
-- (Needs to be done safely to prevent duplicates)
SET @s = (SELECT IF(
    (SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE 
     WHERE TABLE_NAME = 'products' AND CONSTRAINT_NAME = 'fk_products_supplier') > 0, 
    'SELECT 1', 
    'ALTER TABLE products ADD CONSTRAINT fk_products_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL'
));
PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
