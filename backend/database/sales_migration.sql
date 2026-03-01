-- ─────────────────────────────────────────────────────────────────────────────
-- POS System – Sales Tables Migration
-- Run once: mysql -u root pos_db < backend/database/sales_migration.sql
-- ─────────────────────────────────────────────────────────────────────────────

USE pos_db;

-- ── sales ──────────────────────────────────────────────────────────────────
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
    payment_mode   ENUM('cash','upi','card','credit') DEFAULT 'cash',
    note           VARCHAR(255) NULL,
    status         ENUM('paid','partial','credit')    DEFAULT 'paid',
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── sale_items ────────────────────────────────────────────────────────────
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
