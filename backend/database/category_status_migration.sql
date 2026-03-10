-- Migration: add status column to categories table
-- Run once against your POS database

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS status     ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS description VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS image       VARCHAR(255) NULL;

-- If description / image columns already exist MySQL will error on ADD COLUMN (not IF NOT EXISTS).
-- Use the safer version below if needed:
-- ALTER TABLE categories MODIFY COLUMN status ENUM('active','inactive') NOT NULL DEFAULT 'active';
