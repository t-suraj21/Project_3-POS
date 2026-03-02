-- ─────────────────────────────────────────────────────────────────────────────
-- Razorpay Integration Migration
-- Run once: mysql -u root pos_db < backend/database/razorpay_migration.sql
-- ─────────────────────────────────────────────────────────────────────────────

USE pos_db;

-- 1. Extend payment_mode to include 'online' (Razorpay gateway)
ALTER TABLE sales
    MODIFY COLUMN payment_mode
        ENUM('cash','upi','card','credit','online') DEFAULT 'cash';

-- 2. Add Razorpay-specific columns
ALTER TABLE sales
    ADD COLUMN payment_type       ENUM('offline','online') NOT NULL DEFAULT 'offline'
        AFTER payment_mode,
    ADD COLUMN payment_status     ENUM('pending','paid','failed') NOT NULL DEFAULT 'paid'
        AFTER payment_type,
    ADD COLUMN razorpay_order_id   VARCHAR(100) NULL
        AFTER payment_status,
    ADD COLUMN razorpay_payment_id VARCHAR(100) NULL
        AFTER razorpay_order_id,
    ADD COLUMN razorpay_signature  VARCHAR(255) NULL
        AFTER razorpay_payment_id;

-- 3. Index for fast lookup by Razorpay order id
ALTER TABLE sales
    ADD INDEX idx_razorpay_order_id (razorpay_order_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Backfill: existing offline sales set payment_status = 'paid' where applicable
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE sales
SET payment_status = 'paid'
WHERE payment_type = 'offline'
  AND status IN ('paid', 'partial', 'credit', 'refunded');
