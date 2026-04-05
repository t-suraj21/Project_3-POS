-- ─────────────────────────────────────────────────────────────────────────────
-- MULTI-TENANT SYSTEM MIGRATION
-- Ensures all core tables have shop_id for data isolation
-- ─────────────────────────────────────────────────────────────────────────────

USE pos_db;

-- ═════════════════════════════════════════════════════════════════════════════
-- 1. EXISTING TABLES - ADD shop_id IF MISSING
-- ═════════════════════════════════════════════════════════════════════════════

-- Ensure users table has shop_id (already should exist)
ALTER TABLE users ADD COLUMN IF NOT EXISTS shop_id INT NULL;
ALTER TABLE users ADD FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_users_shop_id ON users(shop_id);

-- ── Categories ──────────────────────────────────────────────────────────────
ALTER TABLE categories ADD COLUMN IF NOT EXISTS shop_id INT NOT NULL DEFAULT 1;
ALTER TABLE categories DROP FOREIGN KEY IF EXISTS categories_ibfk_1;
ALTER TABLE categories ADD CONSTRAINT categories_ibfk_shop 
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_categories_shop_id ON categories(shop_id);

-- ── Products ───────────────────────────────────────────────────────────────
ALTER TABLE products ADD COLUMN IF NOT EXISTS shop_id INT NOT NULL DEFAULT 1;
ALTER TABLE products DROP FOREIGN KEY IF EXISTS products_ibfk_1;
ALTER TABLE products ADD CONSTRAINT products_ibfk_shop 
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_products_shop_id ON products(shop_id);

-- ── Credit Customers ───────────────────────────────────────────────────────
ALTER TABLE credit_customers ADD COLUMN IF NOT EXISTS shop_id INT NOT NULL DEFAULT 1;
ALTER TABLE credit_customers DROP FOREIGN KEY IF EXISTS credit_customers_ibfk_1;
ALTER TABLE credit_customers ADD CONSTRAINT credit_customers_ibfk_shop 
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_credit_customers_shop_id ON credit_customers(shop_id);

-- ── Sales ──────────────────────────────────────────────────────────────────
ALTER TABLE sales ADD COLUMN IF NOT EXISTS shop_id INT NOT NULL DEFAULT 1;
ALTER TABLE sales DROP FOREIGN KEY IF EXISTS sales_ibfk_1;
ALTER TABLE sales ADD CONSTRAINT sales_ibfk_shop 
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_sales_shop_id ON sales(shop_id);

-- ── Sale Items ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sale_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(12, 2) NOT NULL,
    tax_amount DECIMAL(12, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
) ENGINE=InnoDB;
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);

-- ── Inventory History ──────────────────────────────────────────────────────
ALTER TABLE stock_history ADD COLUMN IF NOT EXISTS shop_id INT NOT NULL DEFAULT 1;
ALTER TABLE stock_history DROP FOREIGN KEY IF EXISTS stock_history_ibfk_1;
ALTER TABLE stock_history ADD CONSTRAINT stock_history_ibfk_shop 
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_stock_history_shop_id ON stock_history(shop_id);

-- ── Notifications ──────────────────────────────────────────────────────────
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS shop_id INT NOT NULL DEFAULT 1;
ALTER TABLE notifications DROP FOREIGN KEY IF EXISTS notifications_ibfk_1;
ALTER TABLE notifications ADD CONSTRAINT notifications_ibfk_shop 
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_notifications_shop_id ON notifications(shop_id);

-- ── Quotations (if exists) ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quotations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    shop_id INT NOT NULL,
    customer_name VARCHAR(200) NOT NULL,
    customer_email VARCHAR(150) NULL,
    customer_phone VARCHAR(20) NULL,
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(12, 2) DEFAULT 0,
    subtotal DECIMAL(12, 2) DEFAULT 0,
    status ENUM('draft', 'sent', 'accepted', 'rejected') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
    KEY idx_quotations_shop_id (shop_id),
    KEY idx_quotations_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS quotation_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quotation_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(12, 2) NOT NULL,
    tax_amount DECIMAL(12, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL,
    FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ═════════════════════════════════════════════════════════════════════════════
-- 2. CREATE AGGREGATE VIEWS FOR REPORTS (Optional)
-- ═════════════════════════════════════════════════════════════════════════════

DROP VIEW IF EXISTS v_shop_sales_summary;
CREATE VIEW v_shop_sales_summary AS
SELECT 
    s.shop_id,
    DATE(s.created_at) as sale_date,
    COUNT(*) as total_sales,
    SUM(s.total_amount) as total_revenue,
    AVG(s.total_amount) as avg_sale_value
FROM sales s
GROUP BY s.shop_id, DATE(s.created_at);

DROP VIEW IF EXISTS v_product_inventory;
CREATE VIEW v_product_inventory AS
SELECT 
    p.id,
    p.shop_id,
    p.name,
    p.sku,
    p.stock,
    p.alert_stock,
    CASE 
        WHEN p.stock <= p.alert_stock THEN 'LOW_STOCK'
        WHEN p.stock > p.alert_stock THEN 'IN_STOCK'
        ELSE 'OUT_OF_STOCK'
    END as stock_status
FROM products p;

-- ═════════════════════════════════════════════════════════════════════════════
-- 3. DATA CLEANUP - Remove default values after migration
-- ═════════════════════════════════════════════════════════════════════════════

-- Update any existing records that have shop_id = 1 (default shop should exist)
INSERT IGNORE INTO shops (id, name, email, phone) VALUES (1, 'Default Shop', 'default@shop.local', NULL);

-- After migration, verify all necessary rows have non-default shop_id
-- ALTER TABLE categories MODIFY COLUMN shop_id INT NOT NULL;
-- ALTER TABLE products MODIFY COLUMN shop_id INT NOT NULL;
-- ... repeat for other tables

-- ═════════════════════════════════════════════════════════════════════════════
-- 4. VERIFICATION SCRIPT
-- ═════════════════════════════════════════════════════════════════════════════

-- Run this after migration to verify all tables are properly configured:
SELECT 
    'users' as table_name, 
    (SELECT COUNT(*) FROM information_schema.COLUMNS 
     WHERE TABLE_SCHEMA = 'pos_db' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'shop_id') as has_shop_id
UNION ALL
SELECT 'categories', (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'pos_db' AND TABLE_NAME = 'categories' AND COLUMN_NAME = 'shop_id')
UNION ALL
SELECT 'products', (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'pos_db' AND TABLE_NAME = 'products' AND COLUMN_NAME = 'shop_id')
UNION ALL
SELECT 'sales', (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'pos_db' AND TABLE_NAME = 'sales' AND COLUMN_NAME = 'shop_id')
UNION ALL
SELECT 'notifications', (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'pos_db' AND TABLE_NAME = 'notifications' AND COLUMN_NAME = 'shop_id');
