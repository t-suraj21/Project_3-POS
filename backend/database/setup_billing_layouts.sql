-- Setup Billing Layouts for POS System
-- This script ensures all billing layout options are available for shop owners

USE pos_db;

-- Check if billing_layouts table exists, create if not
CREATE TABLE IF NOT EXISTS billing_layouts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    preview_image VARCHAR(255) NULL,
    is_active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Clear existing layouts to ensure fresh data
TRUNCATE TABLE billing_layouts;

-- Insert 8 professional billing layout options
INSERT INTO billing_layouts (name, code, description, is_active) VALUES
('Classic', 'classic', 'Traditional layout with logo at top and details below', 1),
('Modern', 'modern', 'Clean, minimalist design with centered logo and modern styling', 1),
('Detailed', 'detailed', 'Comprehensive layout with all transaction details prominently displayed', 1),
('Compact', 'compact', 'Space-efficient layout designed for small receipts and thermal printers', 1),
('Professional', 'professional', 'Business-style layout with company branding and formal structure', 1),
('Teal Adventure', 'teal-adventure', 'Modern teal-themed design with gradient header, perfect for service businesses', 1),
('Purple Gradient', 'purple-gradient', 'Elegant purple to red gradient design ideal for creative studios and shops', 1),
('Corporate Blue', 'corporate-blue', 'Professional blue-themed layout with clean structure for corporate businesses', 1);

-- Verify the layouts were inserted
SELECT id, name, code, is_active FROM billing_layouts ORDER BY id ASC;
