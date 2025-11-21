-- Engagement System Schema
-- Tracks user engagement, daily activities, and progress throughout their journey

-- User Engagement Tracking Table
CREATE TABLE IF NOT EXISTS user_engagement (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  journey_day INTEGER NOT NULL DEFAULT 1, -- Day since journey started
  last_activity_date DATE DEFAULT CURRENT_DATE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_logins INTEGER DEFAULT 0,
  weekly_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Daily Check-ins Table
CREATE TABLE IF NOT EXISTS daily_checkins (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  journey_day INTEGER NOT NULL,
  mood_rating INTEGER CHECK (mood_rating BETWEEN 1 AND 10),
  progress_rating INTEGER CHECK (progress_rating BETWEEN 1 AND 10),
  challenges TEXT,
  wins TEXT,
  notes TEXT,
  completed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, checkin_date)
);

-- Daily Tasks/Missions Table
CREATE TABLE IF NOT EXISTS daily_tasks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_date DATE NOT NULL DEFAULT CURRENT_DATE,
  journey_day INTEGER NOT NULL,
  task_type VARCHAR(50) NOT NULL, -- 'profile_update', 'send_messages', 'photo_review', etc.
  task_title TEXT NOT NULL,
  task_description TEXT,
  task_category VARCHAR(20) CHECK (task_category IN ('social', 'practical', 'mindset')),
  target_value INTEGER DEFAULT 1,
  current_value INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Weekly Reflections Table
CREATE TABLE IF NOT EXISTS weekly_reflections (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  reflection_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Metrics
  matches_count INTEGER DEFAULT 0,
  conversations_count INTEGER DEFAULT 0,
  dates_count INTEGER DEFAULT 0,
  profile_updates INTEGER DEFAULT 0,

  -- Scores
  consistency_score INTEGER CHECK (consistency_score BETWEEN 0 AND 100),
  social_activity_score INTEGER CHECK (social_activity_score BETWEEN 0 AND 100),
  overall_progress_score INTEGER CHECK (overall_progress_score BETWEEN 0 AND 100),

  -- Qualitative
  biggest_win TEXT,
  biggest_challenge TEXT,
  lessons_learned TEXT,
  next_week_goals JSONB,

  -- AI Insights
  ai_analysis JSONB,

  completed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, week_number)
);

-- User Actions/Events Log
CREATE TABLE IF NOT EXISTS user_actions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL, -- 'message_sent', 'match_received', 'profile_updated', etc.
  action_category VARCHAR(30),
  action_data JSONB,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Progress Milestones Table
CREATE TABLE IF NOT EXISTS progress_milestones (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  milestone_type VARCHAR(50) NOT NULL,
  milestone_title TEXT NOT NULL,
  milestone_description TEXT,
  achieved_at TIMESTAMP DEFAULT NOW(),
  points_awarded INTEGER DEFAULT 0,
  badge_id INTEGER,
  celebrated BOOLEAN DEFAULT FALSE
);

-- Badges/Achievements Table
CREATE TABLE IF NOT EXISTS user_badges (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_type VARCHAR(50) NOT NULL,
  badge_name VARCHAR(100) NOT NULL,
  badge_description TEXT,
  badge_icon VARCHAR(10),
  tier VARCHAR(20), -- 'bronze', 'silver', 'gold', 'platinum'
  earned_at TIMESTAMP DEFAULT NOW(),
  displayed BOOLEAN DEFAULT TRUE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_engagement_user_id ON user_engagement(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_id ON daily_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_date ON daily_checkins(checkin_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_user_id ON daily_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_date ON daily_tasks(task_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_status ON daily_tasks(status);
CREATE INDEX IF NOT EXISTS idx_weekly_reflections_user_id ON weekly_reflections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_actions_user_id ON user_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_actions_type ON user_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_user_actions_created ON user_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_progress_milestones_user_id ON progress_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);

-- Trigger to update updated_at
CREATE TRIGGER update_user_engagement_updated_at
  BEFORE UPDATE ON user_engagement
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
