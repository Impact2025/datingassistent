-- Add trial management columns to users table
-- This script adds the missing columns needed for the trial management system

ALTER TABLE users
ADD COLUMN IF NOT EXISTS trial_status VARCHAR(20) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS trial_day INTEGER DEFAULT 0;

-- Add comment to document the columns
COMMENT ON COLUMN users.trial_status IS 'Trial status: none, active, expired, converted';
COMMENT ON COLUMN users.trial_start_date IS 'When the trial started';
COMMENT ON COLUMN users.trial_end_date IS 'When the trial ends';
COMMENT ON COLUMN users.trial_day IS 'Current day in the trial (1-3)';