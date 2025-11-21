-- Fix verification columns - run this directly in database
-- Connect to your database and run these commands

ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_code VARCHAR(6);
ALTER TABLE users ADD COLUMN IF NOT EXISTS code_expires_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS code_attempts INTEGER DEFAULT 0;

-- Check if columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('verification_code', 'code_expires_at', 'code_attempts')
ORDER BY column_name;