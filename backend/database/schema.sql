-- ─────────────────────────────────────────────────────────────────────────────
-- POS System – Phase 1 Database Schema
-- Run this file in MySQL / phpMyAdmin before starting the backend.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE DATABASE IF NOT EXISTS pos_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE pos_db;

-- ── shops ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shops (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(150)  NOT NULL,
    email      VARCHAR(150)  NULL,
    phone      VARCHAR(20)   NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── users ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    shop_id    INT           NULL,
    name       VARCHAR(150)  NOT NULL,
    email      VARCHAR(150)  UNIQUE NOT NULL,
    password   VARCHAR(255)  NOT NULL,
    role       ENUM('superadmin','shop_admin','manager','sales_worker','account_worker','stock_manager','cashier') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── Seed: default superadmin (password: superadmin123) ───────────────────────
-- You can change the email/password after setup.
INSERT IGNORE INTO users (shop_id, name, email, password, role)
VALUES (
    NULL,
    'Super Admin',
    'superadmin@pos.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password
    'superadmin'
);
