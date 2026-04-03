-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Add Subscription Management System
-- Purpose: Create subscriptions table and add subscription fields to shops
-- ─────────────────────────────────────────────────────────────────────────────

USE pos_db;

-- ── Add subscription status to shops table ──────────────────────────────────
-- Check if column exists before adding
SET @shop_subscription_status = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='shops' AND COLUMN_NAME='subscription_status');
SET @sql = IF(@shop_subscription_status=0, 'ALTER TABLE shops ADD COLUMN subscription_status ENUM("active", "paused", "expired", "pending") DEFAULT "pending" AFTER phone', 'SELECT "Column subscription_status already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @shop_plan_name = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='shops' AND COLUMN_NAME='subscription_plan_name');
SET @sql = IF(@shop_plan_name=0, 'ALTER TABLE shops ADD COLUMN subscription_plan_name VARCHAR(50) NULL AFTER subscription_status', 'SELECT "Column subscription_plan_name already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @shop_end_date = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='shops' AND COLUMN_NAME='subscription_end_date');
SET @sql = IF(@shop_end_date=0, 'ALTER TABLE shops ADD COLUMN subscription_end_date DATETIME NULL AFTER subscription_plan_name', 'SELECT "Column subscription_end_date already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ── subscriptions table ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
    id                 INT AUTO_INCREMENT PRIMARY KEY,
    shop_id            INT NOT NULL,
    plan_name          VARCHAR(50) NOT NULL,      -- '3-month', '6-month', '12-month'
    plan_duration_days INT NOT NULL,              -- 90, 180, 365
    amount             DECIMAL(10, 2) NOT NULL,   -- Price of the plan
    start_date         DATETIME NOT NULL,
    end_date           DATETIME NOT NULL,
    status             ENUM('active', 'paused', 'expired', 'cancelled') DEFAULT 'active',
    paused_at          DATETIME NULL,             -- When subscription was paused
    paused_duration    INT DEFAULT 0,             -- Total days paused
    payment_id         VARCHAR(100) NULL,         -- Razorpay payment ID
    payment_status     ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
    INDEX idx_shop_id (shop_id),
    INDEX idx_status (status),
    INDEX idx_end_date (end_date)
) ENGINE=InnoDB;

-- ── subscription_plans table (reference table) ──────────────────────────────
CREATE TABLE IF NOT EXISTS subscription_plans (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(50) NOT NULL UNIQUE,      -- '3-month', '6-month', '12-month'
    duration   INT NOT NULL,                     -- Days: 90, 180, 365
    price      DECIMAL(10, 2) NOT NULL,          -- Amount in INR
    active     BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── Insert default subscription plans ───────────────────────────────────────
INSERT IGNORE INTO subscription_plans (name, duration, price, active) VALUES
('3-month', 90, 2999.00, TRUE),
('6-month', 180, 5499.00, TRUE),
('12-month', 365, 9999.00, TRUE);

-- ── Verification ───────────────────────────────────────────────────────────
SELECT 'Subscription tables created successfully' AS status;
SELECT COUNT(*) as plan_count FROM subscription_plans;
