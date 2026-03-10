-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Add is_available status column to products table
-- Run this once against your pos_db database.
-- ─────────────────────────────────────────────────────────────────────────────

USE pos_db;

ALTER TABLE products
    ADD COLUMN is_available TINYINT(1) NOT NULL DEFAULT 1
        COMMENT '1 = available in shop, 0 = unavailable';
-- Note: skip this if the column already exists (run once only)
