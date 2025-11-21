-- Add activity_count column to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS activity_count INTEGER DEFAULT 0;

-- Add last_activity_at column if it doesn't exist
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();