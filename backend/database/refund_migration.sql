-- ─────────────────────────────────────────────────────────────────────────────
-- POS System – Refund & Return Tracking Migration
-- Run once: mysql -u root pos_db < backend/database/refund_migration.sql
-- ─────────────────────────────────────────────────────────────────────────────

USE pos_db;

-- ── refunds ────────────────────────────────────────────────────────────────────
-- Track all refunds with reason and notes
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

-- ── refund_items ──────────────────────────────────────────────────────────────
-- Track individual items being refunded
CREATE TABLE IF NOT EXISTS refund_items (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    refund_id       INT NOT NULL,
    sale_item_id    INT NOT NULL,
    product_id      INT NOT NULL,
    product_name    VARCHAR(200) NOT NULL,
    quantity        INT NOT NULL,
    unit_price      DECIMAL(12,2) NOT NULL,
    total_price     DECIMAL(12,2) NOT NULL,
    reason          VARCHAR(255) NULL,
    FOREIGN KEY (refund_id)    REFERENCES refunds(id) ON DELETE CASCADE,
    FOREIGN KEY (sale_item_id) REFERENCES sale_items(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id)   REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ── Add refund tracking columns to sales table (if not exists) ─────────────────
ALTER TABLE sales 
ADD COLUMN IF NOT EXISTS refund_status ENUM('none','partial','full') DEFAULT 'none',
ADD COLUMN IF NOT EXISTS refund_id INT NULL DEFAULT NULL,
ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMP NULL DEFAULT NULL,
ADD FOREIGN KEY (refund_id) REFERENCES refunds(id) ON DELETE SET NULL;

-- ── Add is_available and description columns to products if needed ──────────────
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_available TINYINT DEFAULT 1,
ADD COLUMN IF NOT EXISTS description TEXT NULL,
ADD COLUMN IF NOT EXISTS brand VARCHAR(100) NULL,
ADD COLUMN IF NOT EXISTS unit VARCHAR(50) NULL,
ADD COLUMN IF NOT EXISTS image VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS price_type VARCHAR(50) DEFAULT 'fixed';

-- ── Create index for faster queries ────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_refunds_shop_id ON refunds(shop_id);
CREATE INDEX IF NOT EXISTS idx_refunds_sale_id ON refunds(sale_id);
CREATE INDEX IF NOT EXISTS idx_refund_items_refund_id ON refund_items(refund_id);
CREATE INDEX IF NOT EXISTS idx_sales_refund_status ON sales(refund_status);
