-- ─────────────────────────────────────────────────────────────────────────────
-- POS SYSTEM - COMPLETE DATABASE SCHEMA
-- Consolidated from all database migrations and setup files
-- Version: Complete v1.0
-- ─────────────────────────────────────────────────────────────────────────────
-- This file contains the complete database structure including:
-- • Base tables (shops, users, categories, products)
-- • Account management (credit/udhar system)
-- • Sales and refund management
-- • Inventory tracking
-- • Subscription system
-- • Billing layouts
-- • Password reset and user verification
-- • Razorpay payment integration
-- ─────────────────────────────────────────────────────────────────────────────

-- ═════════════════════════════════════════════════════════════════════════════
-- 1. DATABASE CREATION & BASE TABLES (schema.sql)
-- ═════════════════════════════════════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS pos_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE pos_db;

-- ── shops ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shops (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(150)  NOT NULL,
    email      VARCHAR(150)  NULL,
    phone      VARCHAR(20)   NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── users ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    shop_id    INT           NULL,
    name       VARCHAR(150)  NOT NULL,
    email      VARCHAR(150)  UNIQUE NOT NULL,
    password   VARCHAR(255)  NOT NULL,
    role       ENUM('superadmin','shop_admin','manager','sales_worker','account_worker','stock_manager','cashier') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ═════════════════════════════════════════════════════════════════════════════
-- 2. CATEGORIES & PRODUCTS - PHASE 3 (phase3.sql)
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS categories (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    shop_id    INT NOT NULL,
    parent_id  INT NULL,
    name       VARCHAR(150) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id)   REFERENCES shops(id)      ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS products (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    shop_id      INT NOT NULL,
    category_id  INT NULL,
    name         VARCHAR(200) NOT NULL,
    sku          VARCHAR(100) NULL,
    barcode      VARCHAR(100) NULL,
    cost_price   DECIMAL(10,2) DEFAULT 0,
    sell_price   DECIMAL(10,2) NOT NULL,
    stock        INT DEFAULT 0,
    alert_stock  INT DEFAULT 5,
    gst_percent  DECIMAL(5,2) DEFAULT 0,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id)     REFERENCES shops(id)      ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- ═════════════════════════════════════════════════════════════════════════════
-- 3. ACCOUNT MANAGEMENT - UDHAR/CREDIT SYSTEM (account_management.sql)
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS credit_customers (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  shop_id           INT NOT NULL,
  name              VARCHAR(200) NOT NULL,
  phone             VARCHAR(30)  NOT NULL,
  address           VARCHAR(255) NULL,
  total_credit      DECIMAL(12,2) DEFAULT 0,
  total_paid        DECIMAL(12,2) DEFAULT 0,
  remaining_balance DECIMAL(12,2) DEFAULT 0,
  status            ENUM('active','cleared') DEFAULT 'active',
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS credit_transactions (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  shop_id          INT NOT NULL,
  customer_id      INT NOT NULL,
  bill_number      VARCHAR(60) NOT NULL,
  total_amount     DECIMAL(12,2) NOT NULL,
  paid_amount      DECIMAL(12,2) DEFAULT 0,
  remaining_amount DECIMAL(12,2) NOT NULL,
  note             VARCHAR(255) NULL,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id)     REFERENCES shops(id)            ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES credit_customers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS credit_transaction_items (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  transaction_id INT NOT NULL,
  product_name   VARCHAR(200) NOT NULL,
  quantity       INT NOT NULL DEFAULT 1,
  price          DECIMAL(12,2) NOT NULL,
  total          DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (transaction_id) REFERENCES credit_transactions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS credit_payments (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  shop_id      INT NOT NULL,
  customer_id  INT NOT NULL,
  amount       DECIMAL(12,2) NOT NULL,
  payment_mode ENUM('cash','upi','card') DEFAULT 'cash',
  note         VARCHAR(255) NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id)     REFERENCES shops(id)            ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES credit_customers(id) ON DELETE CASCADE
);

-- ═════════════════════════════════════════════════════════════════════════════
-- 4. BILLING LAYOUTS (billing_layout_migration.sql)
-- ═════════════════════════════════════════════════════════════════════════════

ALTER TABLE shops 
ADD COLUMN IF NOT EXISTS billing_layout VARCHAR(50) DEFAULT 'classic';

CREATE TABLE IF NOT EXISTS billing_layouts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    preview_image VARCHAR(255) NULL,
    is_active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ═════════════════════════════════════════════════════════════════════════════
-- 5. CATEGORY STATUS MIGRATION (category_status_migration.sql)
-- ═════════════════════════════════════════════════════════════════════════════

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS status     ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS description VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS image       VARCHAR(255) NULL;

-- ═════════════════════════════════════════════════════════════════════════════
-- 6. INVENTORY TRACKING (inventory_migration.sql)
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS stock_history (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    shop_id          INT           NOT NULL,
    product_id       INT           NOT NULL,
    change_type      ENUM('restock', 'manual', 'sale', 'adjustment', 'return')
                                   NOT NULL DEFAULT 'manual',
    quantity_change  INT           NOT NULL,
    quantity_before  INT           NOT NULL DEFAULT 0,
    quantity_after   INT           NOT NULL DEFAULT 0,
    note             VARCHAR(255)  NULL,
    created_by       INT           NULL,
    created_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (shop_id)    REFERENCES shops(id)    ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)    ON DELETE SET NULL,

    INDEX idx_sh_shop    (shop_id),
    INDEX idx_sh_product (product_id),
    INDEX idx_sh_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═════════════════════════════════════════════════════════════════════════════
-- 7. PASSWORD RESET & USER VERIFICATION (password_reset_migration.sql)
-- ═════════════════════════════════════════════════════════════════════════════

DROP PROCEDURE IF EXISTS _add_col_safe;

DELIMITER $$
CREATE PROCEDURE _add_col_safe(
    IN tbl     VARCHAR(64),
    IN col     VARCHAR(64),
    IN coldef  VARCHAR(255)
)
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME   = tbl
          AND COLUMN_NAME  = col
    ) THEN
        SET @sql = CONCAT('ALTER TABLE `', tbl, '` ADD COLUMN `', col, '` ', coldef);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END $$
DELIMITER ;

CALL _add_col_safe('users', 'is_verified',              'TINYINT(1) NOT NULL DEFAULT 0');
CALL _add_col_safe('users', 'verification_token',       'VARCHAR(10) NULL');
CALL _add_col_safe('users', 'token_expires_at',         'DATETIME NULL');
CALL _add_col_safe('users', 'reset_token',              'VARCHAR(64) NULL');
CALL _add_col_safe('users', 'reset_token_expires_at',   'DATETIME NULL');

DROP PROCEDURE IF EXISTS _add_col_safe;

-- ═════════════════════════════════════════════════════════════════════════════
-- 8. PRODUCT FIELDS MIGRATION (product_fields_migration.sql)
-- ═════════════════════════════════════════════════════════════════════════════

ALTER TABLE products ADD IF NOT EXISTS brand VARCHAR(100) NULL COMMENT 'Product brand/manufacturer';
ALTER TABLE products ADD IF NOT EXISTS description TEXT NULL COMMENT 'Product description';
ALTER TABLE products ADD IF NOT EXISTS image VARCHAR(255) NULL COMMENT 'Path to product image';
ALTER TABLE products ADD IF NOT EXISTS unit_type VARCHAR(50) DEFAULT 'pcs' COMMENT 'Unit of measurement (pcs, kg, ltr, etc)';
ALTER TABLE products ADD IF NOT EXISTS price_type ENUM('exclusive', 'inclusive') DEFAULT 'exclusive' COMMENT 'Whether sell_price includes GST or not';
ALTER TABLE products ADD IF NOT EXISTS is_available TINYINT(1) DEFAULT 1 COMMENT '1 = available, 0 = unavailable';

-- ═════════════════════════════════════════════════════════════════════════════
-- 9. RAZORPAY PAYMENT INTEGRATION (razorpay_migration.sql)
-- ═════════════════════════════════════════════════════════════════════════════

-- Create sales table first (will be created fully in next section)
-- These extensions prepare it for Razorpay payments

-- ═════════════════════════════════════════════════════════════════════════════
-- 10. SALES & SALE ITEMS (sales_migration.sql)
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS sales (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    shop_id        INT NOT NULL,
    bill_number    VARCHAR(60)  NOT NULL UNIQUE,
    customer_id    INT          NULL,
    customer_name  VARCHAR(200) NULL,
    customer_phone VARCHAR(30)  NULL,
    subtotal       DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount       DECIMAL(12,2)          DEFAULT 0,
    tax_amount     DECIMAL(12,2)          DEFAULT 0,
    total_amount   DECIMAL(12,2) NOT NULL DEFAULT 0,
    paid_amount    DECIMAL(12,2)          DEFAULT 0,
    change_amount  DECIMAL(12,2)          DEFAULT 0,
    payment_mode   ENUM('cash','upi','card','credit','online') DEFAULT 'cash',
    payment_type   ENUM('offline','online') NOT NULL DEFAULT 'offline',
    payment_status ENUM('pending','paid','failed') NOT NULL DEFAULT 'paid',
    razorpay_order_id   VARCHAR(100) NULL,
    razorpay_payment_id VARCHAR(100) NULL,
    razorpay_signature  VARCHAR(255) NULL,
    note           VARCHAR(255) NULL,
    status         ENUM('paid','partial','credit')    DEFAULT 'paid',
    refund_status  ENUM('none','partial','full') DEFAULT 'none',
    refund_id      INT NULL,
    refunded_at    TIMESTAMP NULL,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
    INDEX idx_razorpay_order_id (razorpay_order_id),
    INDEX idx_refund_status (refund_status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sale_items (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    sale_id         INT          NOT NULL,
    product_id      INT          NULL,
    product_name    VARCHAR(200) NOT NULL,
    sku             VARCHAR(100) NULL,
    unit            VARCHAR(50)  NULL,
    quantity        INT          NOT NULL DEFAULT 1,
    cost_price      DECIMAL(12,2)         DEFAULT 0,
    sell_price      DECIMAL(12,2) NOT NULL,
    discount_amount DECIMAL(12,2)         DEFAULT 0,
    total           DECIMAL(12,2) NOT NULL,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ═════════════════════════════════════════════════════════════════════════════
-- 11. REFUND MANAGEMENT (refund_migration.sql)
-- ═════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS refunds (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    shop_id         INT NOT NULL,
    sale_id         INT NOT NULL,
    original_total  DECIMAL(12,2) NOT NULL,
    refund_amount   DECIMAL(12,2) NOT NULL,
    reason          VARCHAR(255) NULL,
    refund_mode     ENUM('cash','upi','card','credit') DEFAULT 'cash',
    status          ENUM('pending','completed','failed') DEFAULT 'completed',
    processed_by    INT NULL,
    note            TEXT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id)      REFERENCES shops(id) ON DELETE CASCADE,
    FOREIGN KEY (sale_id)      REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS refund_items (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    refund_id       INT NOT NULL,
    sale_item_id    INT NOT NULL,
    product_id      INT NULL,
    product_name    VARCHAR(200) NOT NULL,
    quantity        INT NOT NULL,
    unit_price      DECIMAL(12,2) NOT NULL,
    total_price     DECIMAL(12,2) NOT NULL,
    reason          VARCHAR(255) NULL,
    FOREIGN KEY (refund_id)    REFERENCES refunds(id) ON DELETE CASCADE,
    FOREIGN KEY (sale_item_id) REFERENCES sale_items(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id)   REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS=0;
ALTER TABLE sales ADD CONSTRAINT IF NOT EXISTS fk_sales_refund FOREIGN KEY (refund_id) REFERENCES refunds(id) ON DELETE SET NULL;
SET FOREIGN_KEY_CHECKS=1;

CREATE INDEX IF NOT EXISTS idx_refunds_shop_id ON refunds(shop_id);
CREATE INDEX IF NOT EXISTS idx_refunds_sale_id ON refunds(sale_id);
CREATE INDEX IF NOT EXISTS idx_refund_items_refund_id ON refund_items(refund_id);

-- ═════════════════════════════════════════════════════════════════════════════
-- 12. SHOP SIGNATURE (signature_migration.sql)
-- ═════════════════════════════════════════════════════════════════════════════

ALTER TABLE shops
ADD COLUMN IF NOT EXISTS signature VARCHAR(255) NULL COMMENT 'Path to shop owner signature image';

-- ═════════════════════════════════════════════════════════════════════════════
-- 13. SUBSCRIPTION SYSTEM (subscription_migration.sql)
-- ═════════════════════════════════════════════════════════════════════════════

-- Add subscription columns to shops table
SET @shop_subscription_status = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='shops' AND COLUMN_NAME='subscription_status');
SET @sql = IF(@shop_subscription_status=0, 'ALTER TABLE shops ADD COLUMN subscription_status ENUM("active", "paused", "expired", "pending") DEFAULT "pending"', 'SELECT "Column subscription_status already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @shop_plan_name = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='shops' AND COLUMN_NAME='subscription_plan_name');
SET @sql = IF(@shop_plan_name=0, 'ALTER TABLE shops ADD COLUMN subscription_plan_name VARCHAR(50) NULL', 'SELECT "Column subscription_plan_name already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @shop_end_date = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='shops' AND COLUMN_NAME='subscription_end_date');
SET @sql = IF(@shop_end_date=0, 'ALTER TABLE shops ADD COLUMN subscription_end_date DATETIME NULL', 'SELECT "Column subscription_end_date already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS subscriptions (
    id                 INT AUTO_INCREMENT PRIMARY KEY,
    shop_id            INT NOT NULL,
    plan_name          VARCHAR(50) NOT NULL,
    plan_duration_days INT NOT NULL,
    amount             DECIMAL(10, 2) NOT NULL,
    start_date         DATETIME NOT NULL,
    end_date           DATETIME NOT NULL,
    status             ENUM('active', 'paused', 'expired', 'cancelled') DEFAULT 'active',
    paused_at          DATETIME NULL,
    paused_duration    INT DEFAULT 0,
    payment_id         VARCHAR(100) NULL,
    payment_status     ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
    INDEX idx_shop_id (shop_id),
    INDEX idx_status (status),
    INDEX idx_end_date (end_date)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS subscription_plans (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(50) NOT NULL UNIQUE,
    duration   INT NOT NULL,
    price      DECIMAL(10, 2) NOT NULL,
    active     BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Insert default subscription plans
INSERT IGNORE INTO subscription_plans (name, duration, price, active) VALUES
('3-month', 90, 2999.00, TRUE),
('6-month', 180, 5499.00, TRUE),
('12-month', 365, 9999.00, TRUE);

-- ═════════════════════════════════════════════════════════════════════════════
-- 14. BILLING LAYOUTS SETUP & CONFIGURATION (setup_billing_layouts.sql + update_billing_layouts.sql)
-- ═════════════════════════════════════════════════════════════════════════════

-- Clear existing layouts to ensure fresh data
TRUNCATE TABLE billing_layouts;

-- Insert professional billing layout options
INSERT INTO billing_layouts (name, code, description, is_active) VALUES
('Classic', 'classic', 'Traditional layout with logo at top and details below', 1),
('Modern', 'modern', 'Clean, minimalist design with centered logo and modern styling', 1),
('Detailed', 'detailed', 'Comprehensive layout with all transaction details prominently displayed', 1),
('Compact', 'compact', 'Space-efficient layout designed for small receipts and thermal printers', 1),
('Professional', 'professional', 'Business-style layout with company branding and formal structure', 1),
('Teal Adventure', 'teal-adventure', 'Modern teal-themed design with gradient header, perfect for adventure and service businesses', 1),
('Purple Gradient', 'purple-gradient', 'Elegant purple to red gradient design with modern styling for creative studios', 1),
('Corporate Blue', 'corporate-blue', 'Professional blue-themed layout with clean structure for corporate businesses', 1),
('Dark Modern', 'dark-modern', 'Contemporary dark theme with signature section, ideal for modern businesses', 1);

-- ═════════════════════════════════════════════════════════════════════════════
-- 15. VERIFICATION & FINAL CHECKS
-- ═════════════════════════════════════════════════════════════════════════════

-- Verify all tables created successfully
SELECT 'Database schema setup completed successfully!' AS status;
SELECT GROUP_CONCAT(TABLE_NAME ORDER BY TABLE_NAME) AS 'All Tables' 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'pos_db';

-- Verify subscription plans
SELECT COUNT(*) as plan_count FROM subscription_plans;

-- Verify billing layouts
SELECT COUNT(*) as layout_count FROM billing_layouts;

-- ─────────────────────────────────────────────────────────────────────────────
-- END OF CONSOLIDATED DATABASE SCHEMA
-- All tables, columns, and migrations are now integrated into a single schema
-- Ready for production use
-- ─────────────────────────────────────────────────────────────────────────────
