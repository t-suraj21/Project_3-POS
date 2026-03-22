-- Update billing_layouts table with 4 new professional templates

-- First, clear existing layouts
TRUNCATE TABLE billing_layouts;

-- Insert 4 new professional billing layouts based on modern invoice designs
INSERT INTO billing_layouts (name, code, description, is_active) VALUES
('Teal Adventure', 'teal-adventure', 'Modern teal-themed design with gradient header, perfect for adventure and service businesses', 1),
('Purple Gradient', 'purple-gradient', 'Elegant purple to red gradient design with modern styling for creative studios', 1),
('Corporate Blue', 'corporate-blue', 'Professional blue-themed layout with clean structure for corporate businesses', 1),
('Dark Modern', 'dark-modern', 'Contemporary dark theme with signature section, ideal for modern businesses', 1);
