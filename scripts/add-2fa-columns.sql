-- Add 2FA columns to users table
-- Run this script to add Two-Factor Authentication support for admin users

ALTER TABLE users
ADD COLUMN IF NOT EXISTS two_factor_secret TEXT,
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS two_factor_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS two_factor_last_verified TIMESTAMP WITH TIME ZONE;

-- Add comment to document the columns
COMMENT ON COLUMN users.two_factor_secret IS 'TOTP secret for 2FA (encrypted/base64)';
COMMENT ON COLUMN users.two_factor_enabled IS 'Whether 2FA is enabled for this user';
COMMENT ON COLUMN users.two_factor_verified_at IS 'When 2FA was first verified/enabled';
COMMENT ON COLUMN users.two_factor_last_verified IS 'Last time 2FA was successfully verified';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_users_two_factor_enabled ON users(two_factor_enabled) WHERE two_factor_enabled = true;