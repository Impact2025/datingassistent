-- Voortgang Tracker Database Schema
-- Adds tables for tracking user progress, activities, and insights

-- User progress metrics table (weekly aggregated data)
CREATE TABLE IF NOT EXISTS user_progress_metrics (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  metric_type VARCHAR(50) NOT NULL, -- 'profile_score', 'conversation_quality', 'consistency', 'overall'
  metric_value DECIMAL(5,2) NOT NULL,
  week_start DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, metric_type, week_start)
);

-- User activity log table (detailed activity tracking)
CREATE TABLE IF NOT EXISTS user_activity_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL, -- 'profile_analysis', 'chat_coach', 'photo_upload', 'profile_coach', etc.
  activity_data JSONB DEFAULT '{}', -- Flexible data storage for activity details
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User badges/achievements table
CREATE TABLE IF NOT EXISTS user_badges (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_type VARCHAR(50) NOT NULL, -- 'first_week', 'profile_perfectionist', etc.
  badge_name VARCHAR(100) NOT NULL,
  badge_description TEXT,
  badge_icon VARCHAR(10),
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_type)
);

-- Weekly insights table (AI-generated insights)
CREATE TABLE IF NOT EXISTS weekly_insights (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  insight_type VARCHAR(50) DEFAULT 'general', -- 'improvement', 'celebration', 'warning', 'tip'
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  actionable BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 1, -- 1=low, 2=medium, 3=high
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User streaks table (for consistency tracking)
CREATE TABLE IF NOT EXISTS user_streaks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  streak_type VARCHAR(50) NOT NULL, -- 'daily_activity', 'weekly_progress', etc.
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, streak_type)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_progress_metrics_user_week ON user_progress_metrics(user_id, week_start);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_created ON user_activity_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_insights_user_week ON weekly_insights(user_id, week_start);
CREATE INDEX IF NOT EXISTS idx_user_streaks_user ON user_streaks(user_id);

-- Function to get week start date (Monday)
CREATE OR REPLACE FUNCTION get_week_start(target_date DATE DEFAULT CURRENT_DATE)
RETURNS DATE AS $$
BEGIN
  RETURN target_date - EXTRACT(DOW FROM target_date)::INTEGER + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_progress_metrics_updated_at
  BEFORE UPDATE ON user_progress_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_streaks_updated_at
  BEFORE UPDATE ON user_streaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();