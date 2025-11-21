-- Dating Activities Schema
-- Tracks user dating activities for monthly reports

CREATE TABLE IF NOT EXISTS dating_activities (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  activity_type VARCHAR(50) NOT NULL, -- 'match', 'conversation', 'date', 'second_date'

  -- Match details
  match_quality INTEGER CHECK (match_quality BETWEEN 1 AND 10), -- 1-10 quality rating
  platform VARCHAR(50), -- 'tinder', 'bumble', 'hinge', etc.

  -- Conversation details (for conversation activities)
  conversation_length INTEGER, -- in minutes
  was_meaningful BOOLEAN DEFAULT FALSE,

  -- Date details (for date activities)
  date_location TEXT,
  date_rating INTEGER CHECK (date_rating BETWEEN 1 AND 10),
  notes TEXT,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_dating_activities_user_date ON dating_activities(user_id, activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_dating_activities_type ON dating_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_dating_activities_platform ON dating_activities(platform);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_dating_activities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_dating_activities_updated_at
  BEFORE UPDATE ON dating_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_dating_activities_updated_at();