-- ─────────────────────────────────────────────────────────────────────────────
-- Password Reset Migration
-- Safe for MySQL 5.7 and 8.x – adds columns only if they don't exist yet.
-- ─────────────────────────────────────────────────────────────────────────────

USE pos_db;

-- Add each column via a stored procedure that checks information_schema first
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
