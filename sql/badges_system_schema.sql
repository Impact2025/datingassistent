-- Badges System Schema
-- Gamification system for user achievements and progress tracking

-- Performance Metrics Table (for tracking various user metrics)
CREATE TABLE IF NOT EXISTS performance_metrics (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  metric_type VARCHAR(50) NOT NULL, -- 'match', 'message', 'date', 'profile_update', etc.
  metric_value INTEGER NOT NULL DEFAULT 0,
  recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, metric_type, recorded_at)
);

-- Weekly Insights Table (AI-generated insights for weekly progress)
CREATE TABLE IF NOT EXISTS weekly_insights (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  insight_type VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  actionable BOOLEAN DEFAULT FALSE,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, week_start, insight_type)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id ON performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_type ON performance_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_date ON performance_metrics(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_weekly_insights_user_id ON weekly_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_insights_week ON weekly_insights(week_start DESC);