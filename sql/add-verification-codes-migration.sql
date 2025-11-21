-- Migration: Add verification codes and trial columns to users table
-- Run this to add the new columns needed for code-based email verification and trial system

-- Add verification code columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_code VARCHAR(6);
ALTER TABLE users ADD COLUMN IF NOT EXISTS code_expires_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS code_attempts INTEGER DEFAULT 0;

-- Add trial system columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_status VARCHAR(20) DEFAULT 'not_started';
ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_day INTEGER DEFAULT 0;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_verification_code ON users(verification_code);
CREATE INDEX IF NOT EXISTS idx_code_expires_at ON users(code_expires_at);
CREATE INDEX IF NOT EXISTS idx_trial_status ON users(trial_status);
CREATE INDEX IF NOT EXISTS idx_trial_dates ON users(trial_start_date, trial_end_date);

-- Update existing users to have trial status
UPDATE users
SET trial_status = 'active',
    trial_start_date = created_at,
    trial_end_date = created_at + INTERVAL '3 days'
WHERE trial_status = 'not_started' OR trial_status IS NULL;

COMMENT ON COLUMN users.verification_code IS '6-digit code for email verification';
COMMENT ON COLUMN users.code_expires_at IS 'When the verification code expires';
COMMENT ON COLUMN users.code_attempts IS 'Number of failed verification attempts';
COMMENT ON COLUMN users.trial_status IS 'Trial status: not_started, active, expired, converted';
COMMENT ON COLUMN users.trial_start_date IS 'When the trial started';
COMMENT ON COLUMN users.trial_end_date IS 'When the trial ends';
COMMENT ON COLUMN users.trial_day IS 'Current day in trial (1-3)';