-- Add customer email and name fields to orders table
-- This allows us to auto-create accounts from paid orders

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);

SELECT 'Customer fields added to orders table successfully!' AS status;
