-- Journey System Schema
-- This creates all the tables needed for the onboarding journey system

-- User Journey Progress Table
CREATE TABLE IF NOT EXISTS user_journey_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  current_step VARCHAR(50) NOT NULL DEFAULT 'welcome',
  completed_steps JSONB DEFAULT '[]'::jsonb,
  journey_started_at TIMESTAMP DEFAULT NOW(),
  journey_completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Personality Scans Table
CREATE TABLE IF NOT EXISTS personality_scans (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scan_version VARCHAR(20) DEFAULT 'v1.0',
  current_situation TEXT,
  comfort_level INTEGER,
  main_challenge TEXT,
  desired_outcome TEXT,
  strength_self TEXT,
  weakness_self TEXT,
  weekly_commitment VARCHAR(50),
  ai_generated_profile JSONB,
  completed_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Goal Hierarchies Table (if not exists)
CREATE TABLE IF NOT EXISTS goal_hierarchies (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_type VARCHAR(20) NOT NULL CHECK (goal_type IN ('year', 'month', 'week')),
  title TEXT NOT NULL,
  description TEXT,
  category VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  parent_goal_id INTEGER REFERENCES goal_hierarchies(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- In-App Notifications Table
CREATE TABLE IF NOT EXISTS in_app_notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'achievement')),
  action_url TEXT,
  action_text VARCHAR(100),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  read_at TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_journey_progress_user_id ON user_journey_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_journey_progress_current_step ON user_journey_progress(current_step);
CREATE INDEX IF NOT EXISTS idx_personality_scans_user_id ON personality_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_hierarchies_user_id ON goal_hierarchies(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_hierarchies_goal_type ON goal_hierarchies(goal_type);
CREATE INDEX IF NOT EXISTS idx_goal_hierarchies_parent_goal_id ON goal_hierarchies(parent_goal_id);
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_user_id ON in_app_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_is_read ON in_app_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_created_at ON in_app_notifications(created_at DESC);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_user_journey_progress_updated_at
  BEFORE UPDATE ON user_journey_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_goal_hierarchies_updated_at
  BEFORE UPDATE ON goal_hierarchies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Journey system schema created successfully';
END
$$;
