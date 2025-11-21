-- Monthly Reports Schema
-- Stores comprehensive monthly progress reports with AI insights

CREATE TABLE IF NOT EXISTS monthly_reports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month_number INTEGER NOT NULL CHECK (month_number BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Metrics data (stored as JSONB for flexibility)
  metrics_data JSONB NOT NULL,

  -- AI-generated insights
  insights_data JSONB NOT NULL,

  -- Overall score for quick reference
  overall_score INTEGER CHECK (overall_score BETWEEN 0 AND 100),

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Ensure one report per month per user
  UNIQUE(user_id, month_number, year)
);

-- User goals table (if not exists)
CREATE TABLE IF NOT EXISTS user_goals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_type VARCHAR(50) NOT NULL, -- 'yearly', 'monthly', 'weekly'
  title TEXT NOT NULL,
  description TEXT,
  category VARCHAR(30), -- 'social', 'practical', 'mindset'
  target_value INTEGER,
  current_value INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'abandoned')),
  deadline DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Performance tracking table for detailed metrics
CREATE TABLE IF NOT EXISTS performance_metrics (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  metric_type VARCHAR(50) NOT NULL, -- 'match', 'conversation', 'date', 'profile_view', etc.
  metric_value INTEGER DEFAULT 1,
  quality_score INTEGER CHECK (quality_score BETWEEN 1 AND 10),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),

  -- Index for quick lookups
  INDEX idx_performance_user_date (user_id, metric_date DESC),
  INDEX idx_performance_type (metric_type)
);

-- Create indexes for monthly reports
CREATE INDEX IF NOT EXISTS idx_monthly_reports_user ON monthly_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_reports_date ON monthly_reports(year DESC, month_number DESC);
CREATE INDEX IF NOT EXISTS idx_user_goals_user ON user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_status ON user_goals(status);
CREATE INDEX IF NOT EXISTS idx_user_goals_deadline ON user_goals(deadline);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_monthly_reports_updated_at
  BEFORE UPDATE ON monthly_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
