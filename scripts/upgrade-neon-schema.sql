-- Upgrade Neon database schema to replace Firebase completely
-- This script adds missing columns and indexes needed for full Firebase replacement

-- 1. Ensure users table has all necessary columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- 2. Ensure subscription_history has all necessary columns
ALTER TABLE subscription_history ADD COLUMN IF NOT EXISTS billing_period VARCHAR(20);
ALTER TABLE subscription_history ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP;
ALTER TABLE subscription_history ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMP;

-- 3. Add usage tracking reset dates
ALTER TABLE usage_tracking ADD COLUMN IF NOT EXISTS last_week_reset TIMESTAMP DEFAULT NOW();
ALTER TABLE usage_tracking ADD COLUMN IF NOT EXISTS last_month_reset TIMESTAMP DEFAULT NOW();

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_subscription_history_user_id ON subscription_history(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_feature_type ON usage_tracking(feature_type);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- 5. Add foreign key constraints
ALTER TABLE user_profiles
  DROP CONSTRAINT IF EXISTS fk_user_profiles_user_id,
  ADD CONSTRAINT fk_user_profiles_user_id
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS fk_orders_user_id,
  ADD CONSTRAINT fk_orders_user_id
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE subscription_history
  DROP CONSTRAINT IF EXISTS fk_subscription_history_user_id,
  ADD CONSTRAINT fk_subscription_history_user_id
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE usage_tracking
  DROP CONSTRAINT IF EXISTS fk_usage_tracking_user_id,
  ADD CONSTRAINT fk_usage_tracking_user_id
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE conversations
  DROP CONSTRAINT IF EXISTS fk_conversations_user_id,
  ADD CONSTRAINT fk_conversations_user_id
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE messages
  DROP CONSTRAINT IF EXISTS fk_messages_conversation_id,
  ADD CONSTRAINT fk_messages_conversation_id
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE;

-- 6. Create user_usage_stats table for easier tracking
CREATE TABLE IF NOT EXISTS user_usage_stats (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ai_messages_this_week INTEGER DEFAULT 0,
  profile_rewrites_this_month INTEGER DEFAULT 0,
  photo_checks_this_month INTEGER DEFAULT 0,
  platform_advice_this_month INTEGER DEFAULT 0,
  last_week_reset TIMESTAMP DEFAULT NOW(),
  last_month_reset TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_usage_stats_user_id ON user_usage_stats(user_id);

-- Done!
SELECT 'Schema upgrade completed successfully!' AS status;
