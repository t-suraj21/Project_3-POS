-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Add missing columns to products table
-- Adds support for: unit types, brand, description, price type, and image
-- Run this once against your pos_db database.
-- ─────────────────────────────────────────────────────────────────────────────

USE pos_db;

-- Add columns to products table (will skip if they already exist, depending on your MySQL version)
-- For MySQL 5.7+, use IF NOT EXISTS. For older versions, uncomment specific ALTER statements.

ALTER TABLE products ADD brand VARCHAR(100) NULL COMMENT 'Product brand/manufacturer';
ALTER TABLE products ADD description TEXT NULL COMMENT 'Product description';
ALTER TABLE products ADD image VARCHAR(255) NULL COMMENT 'Path to product image';
ALTER TABLE products ADD unit_type VARCHAR(50) DEFAULT 'pcs' COMMENT 'Unit of measurement (pcs, kg, ltr, etc)';
ALTER TABLE products ADD price_type ENUM('exclusive', 'inclusive') DEFAULT 'exclusive' COMMENT 'Whether sell_price includes GST or not';
ALTER TABLE products ADD is_available TINYINT(1) DEFAULT 1 COMMENT '1 = available, 0 = unavailable';
