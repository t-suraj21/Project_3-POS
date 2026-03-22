-- Add signature field to shops table for owner signature on invoices

ALTER TABLE shops
ADD COLUMN signature VARCHAR(255) NULL COMMENT 'Path to shop owner signature image' AFTER favicon;
