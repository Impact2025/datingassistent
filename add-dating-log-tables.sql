-- Dating Log PRO - Database Schema
-- Weekly dating logs and user matches management

-- Weekly dating logs table
CREATE TABLE IF NOT EXISTS weekly_dating_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  activities JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of activity objects
  iris_insight TEXT, -- AI-generated insight
  total_matches INTEGER DEFAULT 0,
  total_conversations INTEGER DEFAULT 0,
  total_dates INTEGER DEFAULT 0,
  average_match_quality DECIMAL(3,1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, week_start) -- One log per user per week
);

-- User matches registry for auto-fill and tracking
CREATE TABLE IF NOT EXISTS user_matches (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  platform VARCHAR(50) CHECK (platform IN ('Bumble', 'Hinge', 'Tinder', 'Rela', 'Overig')),
  match_date DATE,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'dated', 'ghosted')),
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 10),
  vibe VARCHAR(50) CHECK (vibe IN ('leuk', 'twijfelachtig', 'topmatch', 'moet_nog_zien')),
  last_conversation_date DATE,
  conversation_status VARCHAR(50) CHECK (conversation_status IN ('nieuw', 'leuk_gesprek', 'stilgevallen', 'niet_zeker')),
  conversation_feeling TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_weekly_dating_logs_user_week ON weekly_dating_logs(user_id, week_start);
CREATE INDEX IF NOT EXISTS idx_weekly_dating_logs_created_at ON weekly_dating_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_matches_user_id ON user_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_user_matches_status ON user_matches(status);
CREATE INDEX IF NOT EXISTS idx_user_matches_platform ON user_matches(platform);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- User notification preferences for dating log reminders
CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  monday_reminders_enabled BOOLEAN DEFAULT true,
  reminder_time TIME DEFAULT '09:00:00', -- Default 9 AM
  last_reminder_sent DATE,
  reminder_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add triggers for updated_at
CREATE TRIGGER update_weekly_dating_logs_updated_at
    BEFORE UPDATE ON weekly_dating_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_matches_updated_at
    BEFORE UPDATE ON user_matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_notification_preferences_updated_at
    BEFORE UPDATE ON user_notification_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();