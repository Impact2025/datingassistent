-- Create user follows table for forum bookmarks/following
CREATE TABLE IF NOT EXISTS user_follows (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  target_type VARCHAR(50) NOT NULL, -- 'post', 'category', 'user'
  target_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, target_type, target_id)
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_user_follows_user ON user_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_target ON user_follows(target_type, target_id);

-- Grant permissions
GRANT ALL PRIVILEGES ON TABLE user_follows TO neon;
GRANT USAGE, SELECT ON SEQUENCE user_follows_id_seq TO neon;