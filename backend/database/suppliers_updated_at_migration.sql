-- ─────────────────────────────────────────────────────────────────────────────
-- suppliers_updated_at_migration.sql
-- Adds the missing `updated_at` column to the suppliers table.
-- Safe to run multiple times (uses IF NOT EXISTS check via procedure).
-- ─────────────────────────────────────────────────────────────────────────────

DROP PROCEDURE IF EXISTS _add_suppliers_updated_at;

DELIMITER $$
CREATE PROCEDURE _add_suppliers_updated_at()
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME   = 'suppliers'
          AND COLUMN_NAME  = 'updated_at'
    ) THEN
        ALTER TABLE suppliers
            ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ON UPDATE CURRENT_TIMESTAMP
                AFTER created_at;
    END IF;
END$$
DELIMITER ;

CALL _add_suppliers_updated_at();
DROP PROCEDURE IF EXISTS _add_suppliers_updated_at;
