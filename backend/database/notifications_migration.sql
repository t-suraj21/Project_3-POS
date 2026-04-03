-- ─────────────────────────────────────────────────────────────────────────────
-- NOTIFICATIONS SYSTEM MIGRATION
-- Version: 1.0
-- ─────────────────────────────────────────────────────────────────────────────

USE pos_db;

-- ─────────────────────────────────────────────────────────────────────────────
-- Notifications table - for storing all shop-related notifications
-- Tracks: stock alerts, refunds, and other important events
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS notifications (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    shop_id         INT NOT NULL,
    type            ENUM(
        'stock_alert',
        'low_stock',
        'refund',
        'refund_completed',
        'refund_failed',
        'payment_pending',
        'order_completed',
        'general'
    ) NOT NULL DEFAULT 'general',
    title           VARCHAR(255) NOT NULL,
    message         VARCHAR(500) NOT NULL,
    related_entity_type VARCHAR(50) NULL COMMENT 'e.g., "product", "sale", "refund"',
    related_entity_id   INT NULL COMMENT 'e.g., product_id, sale_id, refund_id',
    is_read         TINYINT(1) NOT NULL DEFAULT 0,
    action_url      VARCHAR(255) NULL COMMENT 'URL to navigate when clicked',
    priority        ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at         TIMESTAMP NULL,
    
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
    INDEX idx_shop_unread (shop_id, is_read),
    INDEX idx_created (created_at),
    INDEX idx_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
