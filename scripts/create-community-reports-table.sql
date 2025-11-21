-- Create community reports table for moderation
CREATE TABLE IF NOT EXISTS community_reports (
  id SERIAL PRIMARY KEY,
  reporter_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  target_type VARCHAR(50) NOT NULL, -- 'post' or 'reply'
  target_id INTEGER NOT NULL,
  reason VARCHAR(100) NOT NULL, -- 'spam', 'inappropriate', 'harassment', etc.
  content TEXT, -- Additional context about the report
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved', 'dismissed'
  moderator_id INTEGER REFERENCES users(id), -- Who reviewed it
  moderator_notes TEXT, -- Notes from moderator
  created_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_community_reports_status ON community_reports(status);
CREATE INDEX IF NOT EXISTS idx_community_reports_target ON community_reports(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_community_reports_created ON community_reports(created_at DESC);

-- Add some sample reports for testing
INSERT INTO community_reports (reporter_id, target_type, target_id, reason, content, status)
SELECT
  u.id,
  'post',
  fp.id,
  'spam',
  'Deze post lijkt op spam',
  'pending'
FROM users u
CROSS JOIN forum_posts fp
WHERE u.name = 'Sophie'
LIMIT 1;

-- Grant permissions
GRANT ALL PRIVILEGES ON TABLE community_reports TO neon;
GRANT USAGE, SELECT ON SEQUENCE community_reports_id_seq TO neon;