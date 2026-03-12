-- ─────────────────────────────────────────────────────────────────────────────
-- Inventory Migration — Stock History Table
--
-- Run this file once against your pos_db to add the stock_history table.
-- This table records every stock change (restocks, manual adjustments, sales
-- deductions) so the shop owner has a full audit trail of inventory movement.
-- ─────────────────────────────────────────────────────────────────────────────

USE pos_db;

CREATE TABLE IF NOT EXISTS stock_history (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    shop_id          INT           NOT NULL,
    product_id       INT           NOT NULL,
    change_type      ENUM('restock', 'manual', 'sale', 'adjustment', 'return')
                                   NOT NULL DEFAULT 'manual',
    quantity_change  INT           NOT NULL,           -- positive = added, negative = removed
    quantity_before  INT           NOT NULL DEFAULT 0,
    quantity_after   INT           NOT NULL DEFAULT 0,
    note             VARCHAR(255)  NULL,
    created_by       INT           NULL,               -- user.id who made the change
    created_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (shop_id)    REFERENCES shops(id)    ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)    ON DELETE SET NULL,

    INDEX idx_sh_shop    (shop_id),
    INDEX idx_sh_product (product_id),
    INDEX idx_sh_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
