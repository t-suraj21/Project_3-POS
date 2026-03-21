USE pos_db;

-- Add billing layout column to shops table
ALTER TABLE shops 
ADD COLUMN billing_layout VARCHAR(50) DEFAULT 'classic';

-- Create a reference table for available billing layouts
CREATE TABLE IF NOT EXISTS billing_layouts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    preview_image VARCHAR(255) NULL,
    is_active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Insert default billing layouts
INSERT IGNORE INTO billing_layouts (name, code, description, is_active) VALUES
('Classic', 'classic', 'Traditional layout with logo at top and details below', 1),
('Modern', 'modern', 'Clean, minimalist design with centered logo and modern styling', 1),
('Detailed', 'detailed', 'Comprehensive layout with all transaction details prominently displayed', 1),
('Compact', 'compact', 'Space-efficient layout designed for small receipts', 1),
('Professional', 'professional', 'Business-style layout with company branding at top', 1);
