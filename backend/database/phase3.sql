CREATE TABLE IF NOT EXISTS categories (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    shop_id    INT NOT NULL,
    parent_id  INT NULL,
    name       VARCHAR(150) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id)   REFERENCES shops(id)      ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS products (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    shop_id      INT NOT NULL,
    category_id  INT NULL,
    name         VARCHAR(200) NOT NULL,
    sku          VARCHAR(100) NULL,
    barcode      VARCHAR(100) NULL,
    cost_price   DECIMAL(10,2) DEFAULT 0,
    sell_price   DECIMAL(10,2) NOT NULL,
    stock        INT DEFAULT 0,
    alert_stock  INT DEFAULT 5,
    gst_percent  DECIMAL(5,2) DEFAULT 0,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id)     REFERENCES shops(id)      ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);
