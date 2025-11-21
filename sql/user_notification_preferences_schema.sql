-- User Notification Preferences Table
-- Stores user preferences for Monday dating log reminders

CREATE TABLE IF NOT EXISTS user_notification_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    monday_reminders_enabled BOOLEAN DEFAULT true,
    reminder_time TIME DEFAULT '09:00:00',
    last_reminder_sent DATE,
    reminder_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_notification_preferences_user_id
ON user_notification_preferences(user_id);

-- Create index for reminder scheduling
CREATE INDEX IF NOT EXISTS idx_user_notification_preferences_reminder_time
ON user_notification_preferences(reminder_time);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_notification_preferences_updated_at_trigger
    BEFORE UPDATE ON user_notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_user_notification_preferences_updated_at();