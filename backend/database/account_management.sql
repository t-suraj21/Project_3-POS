-- Account Management tables for Udhar (Credit) feature

CREATE TABLE IF NOT EXISTS credit_customers (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  shop_id           INT NOT NULL,
  name              VARCHAR(200) NOT NULL,
  phone             VARCHAR(30)  NOT NULL,
  address           VARCHAR(255) NULL,
  total_credit      DECIMAL(12,2) DEFAULT 0,
  total_paid        DECIMAL(12,2) DEFAULT 0,
  remaining_balance DECIMAL(12,2) DEFAULT 0,
  status            ENUM('active','cleared') DEFAULT 'active',
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS credit_transactions (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  shop_id          INT NOT NULL,
  customer_id      INT NOT NULL,
  bill_number      VARCHAR(60) NOT NULL,
  total_amount     DECIMAL(12,2) NOT NULL,
  paid_amount      DECIMAL(12,2) DEFAULT 0,
  remaining_amount DECIMAL(12,2) NOT NULL,
  note             VARCHAR(255) NULL,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id)     REFERENCES shops(id)            ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES credit_customers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS credit_transaction_items (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  transaction_id INT NOT NULL,
  product_name   VARCHAR(200) NOT NULL,
  quantity       INT NOT NULL DEFAULT 1,
  price          DECIMAL(12,2) NOT NULL,
  total          DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (transaction_id) REFERENCES credit_transactions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS credit_payments (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  shop_id      INT NOT NULL,
  customer_id  INT NOT NULL,
  amount       DECIMAL(12,2) NOT NULL,
  payment_mode ENUM('cash','upi','card') DEFAULT 'cash',
  note         VARCHAR(255) NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id)     REFERENCES shops(id)            ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES credit_customers(id) ON DELETE CASCADE
);
