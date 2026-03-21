USE pos_db;

-- Create refunds table if it doesn't exist
CREATE TABLE IF NOT EXISTS refunds (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    shop_id         INT NOT NULL,
    sale_id         INT NOT NULL,
    original_total  DECIMAL(12,2) NOT NULL,
    refund_amount   DECIMAL(12,2) NOT NULL,
    reason          VARCHAR(255) NULL,
    refund_mode     ENUM('cash','upi','card','credit') DEFAULT 'cash',
    status          ENUM('pending','completed','failed') DEFAULT 'completed',
    processed_by    INT NULL,
    note            TEXT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id)      REFERENCES shops(id) ON DELETE CASCADE,
    FOREIGN KEY (sale_id)      REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Create refund_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS refund_items (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    refund_id       INT NOT NULL,
    sale_item_id    INT NOT NULL,
    product_id      INT NULL,
    product_name    VARCHAR(200) NOT NULL,
    quantity        INT NOT NULL,
    unit_price      DECIMAL(12,2) NOT NULL,
    total_price     DECIMAL(12,2) NOT NULL,
    reason          VARCHAR(255) NULL,
    FOREIGN KEY (refund_id)    REFERENCES refunds(id) ON DELETE CASCADE,
    FOREIGN KEY (sale_item_id) REFERENCES sale_items(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id)   REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Add refund columns to sales table (one at a time to avoid IF NOT EXISTS issues)
ALTER TABLE sales ADD COLUMN IF NOT EXISTS refund_status ENUM('none','partial','full') DEFAULT 'none';
ALTER TABLE sales ADD COLUMN IF NOT EXISTS refund_id INT NULL;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMP NULL;

-- Add foreign key constraint
SET FOREIGN_KEY_CHECKS=0;
ALTER TABLE sales ADD CONSTRAINT IF NOT EXISTS fk_sales_refund FOREIGN KEY (refund_id) REFERENCES refunds(id) ON DELETE SET NULL;
SET FOREIGN_KEY_CHECKS=1;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_refunds_shop_id ON refunds(shop_id);
CREATE INDEX IF NOT EXISTS idx_refunds_sale_id ON refunds(sale_id);
CREATE INDEX IF NOT EXISTS idx_refund_items_refund_id ON refund_items(refund_id);
CREATE INDEX IF NOT EXISTS idx_sales_refund_status ON sales(refund_status);

