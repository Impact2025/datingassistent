-- ============================================
-- DatingAssistent Email Engagement System
-- Database Schema voor Email Tracking & Automation
-- ============================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS email_tracking CASCADE;
DROP TABLE IF EXISTS email_preferences CASCADE;
DROP TABLE IF EXISTS email_queue CASCADE;
DROP TABLE IF EXISTS email_templates CASCADE;
DROP TABLE IF EXISTS user_milestones CASCADE;

-- ============================================
-- 1. EMAIL TRACKING TABLE
-- Track alle verzonden emails en user interacties
-- ============================================
CREATE TABLE email_tracking (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Email identificatie
  email_type VARCHAR(50) NOT NULL, -- 'welcome', 'weekly_digest', 'course_unlock', etc.
  email_category VARCHAR(30) NOT NULL, -- 'onboarding', 'engagement', 'retention', 'upsell', etc.
  template_id INT, -- Reference to template used

  -- Timing
  sent_at TIMESTAMP NOT NULL DEFAULT NOW(),
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  converted_at TIMESTAMP, -- User nam gewenste actie
  unsubscribed_at TIMESTAMP,
  bounced_at TIMESTAMP,

  -- A/B Testing
  variant VARCHAR(10) DEFAULT 'A', -- A/B test variant
  test_group VARCHAR(50), -- Voor gesegmenteerde tests

  -- Performance
  subject_line TEXT,
  cta_clicked VARCHAR(100), -- Which CTA was clicked
  conversion_type VARCHAR(50), -- What action: 'upgrade', 'feature_use', 'course_start', etc.
  conversion_value DECIMAL(10, 2), -- Revenue if applicable

  -- Metadata
  metadata JSONB, -- Extra context per email
  user_tier VARCHAR(20), -- User's tier at send time (voor analyse)

  -- Status
  delivery_status VARCHAR(20) DEFAULT 'sent', -- 'sent', 'delivered', 'bounced', 'failed'
  error_message TEXT,

  created_at TIMESTAMP DEFAULT NOW(),

  -- Indexes voor performance
  INDEX idx_email_tracking_user (user_id),
  INDEX idx_email_tracking_type (email_type),
  INDEX idx_email_tracking_sent (sent_at),
  INDEX idx_email_tracking_category (email_category),
  INDEX idx_email_tracking_conversion (converted_at)
);

COMMENT ON TABLE email_tracking IS 'Tracks all sent emails and user interactions for analytics';

-- ============================================
-- 2. EMAIL PREFERENCES TABLE
-- User email instellingen en voorkeuren
-- ============================================
CREATE TABLE email_preferences (
  user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

  -- Email categorieën (opt-in/opt-out)
  onboarding_emails BOOLEAN DEFAULT true,
  engagement_emails BOOLEAN DEFAULT true,
  educational_emails BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT true,
  milestone_emails BOOLEAN DEFAULT true,
  digest_emails BOOLEAN DEFAULT true,

  -- Specifieke email types uitschakelen
  disabled_email_types TEXT[], -- Array van email_type strings

  -- Frequentie controle
  frequency VARCHAR(20) DEFAULT 'normal', -- 'none', 'minimal', 'normal', 'all'
  max_emails_per_week INT DEFAULT 5,

  -- Digest preferences
  digest_day VARCHAR(10) DEFAULT 'monday', -- Preferred day for weekly digest
  digest_time TIME DEFAULT '08:00:00', -- Preferred time

  -- Global unsubscribe
  unsubscribed_all BOOLEAN DEFAULT false,
  unsubscribed_at TIMESTAMP,
  unsubscribe_reason TEXT,

  -- Last email sent (om flooding te voorkomen)
  last_email_sent_at TIMESTAMP,
  emails_sent_this_week INT DEFAULT 0,
  week_start DATE, -- Voor weekly counter reset

  -- Preferences
  timezone VARCHAR(50) DEFAULT 'Europe/Amsterdam',
  language VARCHAR(10) DEFAULT 'nl',

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE email_preferences IS 'User email preferences and opt-in/opt-out settings';

-- ============================================
-- 3. EMAIL QUEUE TABLE
-- Queue voor scheduled en retry emails
-- ============================================
CREATE TABLE email_queue (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Email info
  email_type VARCHAR(50) NOT NULL,
  email_category VARCHAR(30) NOT NULL,
  template_id INT,

  -- Scheduling
  scheduled_for TIMESTAMP NOT NULL,
  priority INT DEFAULT 5, -- 1 = highest, 10 = lowest

  -- Processing
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'sent', 'failed', 'cancelled'
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  last_attempt_at TIMESTAMP,

  -- Error handling
  error_message TEXT,
  error_count INT DEFAULT 0,

  -- Data
  email_data JSONB, -- Template variables
  metadata JSONB,

  -- Deduplication
  dedup_key VARCHAR(100), -- Unique key to prevent duplicates

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,

  -- Indexes
  INDEX idx_email_queue_scheduled (scheduled_for),
  INDEX idx_email_queue_status (status),
  INDEX idx_email_queue_user (user_id),
  INDEX idx_email_queue_dedup (dedup_key),
  UNIQUE (dedup_key)
);

COMMENT ON TABLE email_queue IS 'Queue for scheduled emails with retry logic';

-- ============================================
-- 4. EMAIL TEMPLATES TABLE
-- Store email templates en varianten
-- ============================================
CREATE TABLE email_templates (
  id SERIAL PRIMARY KEY,

  -- Template identificatie
  template_key VARCHAR(50) NOT NULL UNIQUE, -- 'welcome_v1', 'weekly_digest_v2', etc.
  email_type VARCHAR(50) NOT NULL,
  email_category VARCHAR(30) NOT NULL,
  variant VARCHAR(10) DEFAULT 'A',

  -- Content
  subject_line TEXT NOT NULL,
  preview_text TEXT,
  html_body TEXT NOT NULL,
  text_body TEXT NOT NULL,

  -- Variables/Placeholders
  required_vars TEXT[], -- Array van required variable names
  optional_vars TEXT[],

  -- A/B Testing
  is_active BOOLEAN DEFAULT true,
  test_weight INT DEFAULT 50, -- Voor A/B test traffic split

  -- Performance tracking
  sent_count INT DEFAULT 0,
  open_count INT DEFAULT 0,
  click_count INT DEFAULT 0,
  conversion_count INT DEFAULT 0,

  -- Metadata
  description TEXT,
  notes TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(100),

  INDEX idx_email_templates_key (template_key),
  INDEX idx_email_templates_type (email_type)
);

COMMENT ON TABLE email_templates IS 'Email templates with A/B test variants';

-- ============================================
-- 5. USER MILESTONES TABLE
-- Track user achievements voor milestone emails
-- ============================================
CREATE TABLE user_milestones (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Milestone info
  milestone_type VARCHAR(50) NOT NULL, -- 'first_chat', '10_chats', 'course_complete', etc.
  milestone_category VARCHAR(30), -- 'usage', 'education', 'streak', 'anniversary'

  -- Achievement details
  achieved_at TIMESTAMP DEFAULT NOW(),
  milestone_value INT, -- Numerical value (10 for '10_chats', 30 for '30_day_streak')

  -- Email sent tracking
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMP,

  -- Rewards
  reward_given BOOLEAN DEFAULT false,
  reward_type VARCHAR(50), -- 'credits', 'badge', 'discount', etc.
  reward_value INT,

  -- Metadata
  metadata JSONB,

  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_user_milestones_user (user_id),
  INDEX idx_user_milestones_type (milestone_type),
  INDEX idx_user_milestones_email (email_sent, achieved_at),
  UNIQUE (user_id, milestone_type, milestone_value)
);

COMMENT ON TABLE user_milestones IS 'User milestone achievements for celebration emails';

-- ============================================
-- 6. EMAIL CAMPAIGNS TABLE
-- Voor bulk marketing campaigns
-- ============================================
CREATE TABLE email_campaigns (
  id SERIAL PRIMARY KEY,

  -- Campaign info
  campaign_name VARCHAR(100) NOT NULL,
  campaign_type VARCHAR(50), -- 'seasonal', 'upgrade', 'reactivation', 'referral'
  email_type VARCHAR(50) NOT NULL,
  template_id INT REFERENCES email_templates(id),

  -- Targeting
  target_segment JSONB, -- User segment criteria
  target_tiers TEXT[], -- ['sociaal', 'core'] etc.
  exclude_recent_senders BOOLEAN DEFAULT true, -- Don't send if user received email recently

  -- Scheduling
  scheduled_start TIMESTAMP,
  scheduled_end TIMESTAMP,
  send_immediately BOOLEAN DEFAULT false,

  -- Status
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'completed', 'paused'

  -- Performance
  total_recipients INT DEFAULT 0,
  emails_sent INT DEFAULT 0,
  emails_opened INT DEFAULT 0,
  emails_clicked INT DEFAULT 0,
  conversions INT DEFAULT 0,
  revenue_generated DECIMAL(10, 2) DEFAULT 0,

  -- Metadata
  notes TEXT,
  created_by VARCHAR(100),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_campaigns_status (status),
  INDEX idx_campaigns_scheduled (scheduled_start)
);

COMMENT ON TABLE email_campaigns IS 'Bulk email marketing campaigns';

-- ============================================
-- 7. USER ENGAGEMENT SCORES TABLE
-- Track overall engagement voor targeting
-- ============================================
CREATE TABLE user_engagement_scores (
  user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

  -- Engagement metrics
  engagement_score INT DEFAULT 0, -- 0-100
  activity_level VARCHAR(20) DEFAULT 'new', -- 'new', 'low', 'medium', 'high', 'power'

  -- Activity tracking
  last_login_at TIMESTAMP,
  login_streak INT DEFAULT 0,
  total_logins INT DEFAULT 0,

  -- Feature usage
  features_used INT DEFAULT 0,
  ai_messages_sent INT DEFAULT 0,
  courses_completed INT DEFAULT 0,

  -- Email engagement
  email_open_rate DECIMAL(5, 2) DEFAULT 0.00, -- Percentage
  email_click_rate DECIMAL(5, 2) DEFAULT 0.00,
  last_email_opened_at TIMESTAMP,

  -- Churn risk
  churn_risk VARCHAR(20) DEFAULT 'low', -- 'low', 'medium', 'high', 'critical'
  churn_score INT DEFAULT 0, -- 0-100, higher = more risk
  days_inactive INT DEFAULT 0,

  -- Upsell potential
  upsell_score INT DEFAULT 0, -- 0-100, likelihood to upgrade
  feature_limit_hits INT DEFAULT 0, -- Times they hit their tier limits

  -- Recalculation
  last_calculated_at TIMESTAMP DEFAULT NOW(),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_engagement_level (activity_level),
  INDEX idx_engagement_churn (churn_risk),
  INDEX idx_engagement_score (engagement_score)
);

COMMENT ON TABLE user_engagement_scores IS 'User engagement metrics for targeted email campaigns';

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function: Update email preferences weekly counter
CREATE OR REPLACE FUNCTION reset_weekly_email_counter()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.week_start IS NULL OR NEW.week_start < CURRENT_DATE - INTERVAL '7 days' THEN
    NEW.emails_sent_this_week := 0;
    NEW.week_start := CURRENT_DATE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_reset_weekly_email_counter
BEFORE UPDATE ON email_preferences
FOR EACH ROW
EXECUTE FUNCTION reset_weekly_email_counter();

-- Function: Update engagement score when email opened
CREATE OR REPLACE FUNCTION update_engagement_on_email_open()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.opened_at IS NOT NULL AND OLD.opened_at IS NULL THEN
    UPDATE user_engagement_scores
    SET
      last_email_opened_at = NEW.opened_at,
      engagement_score = LEAST(100, engagement_score + 2),
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_engagement_on_open
AFTER UPDATE ON email_tracking
FOR EACH ROW
EXECUTE FUNCTION update_engagement_on_email_open();

-- Function: Track email conversions
CREATE OR REPLACE FUNCTION track_email_conversion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.converted_at IS NOT NULL AND OLD.converted_at IS NULL THEN
    -- Update template performance
    UPDATE email_templates
    SET conversion_count = conversion_count + 1
    WHERE id = NEW.template_id;

    -- Update engagement score
    UPDATE user_engagement_scores
    SET
      engagement_score = LEAST(100, engagement_score + 5),
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_track_email_conversion
AFTER UPDATE ON email_tracking
FOR EACH ROW
EXECUTE FUNCTION track_email_conversion();

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Composite indexes voor common queries
CREATE INDEX idx_tracking_user_type_sent
ON email_tracking(user_id, email_type, sent_at DESC);

CREATE INDEX idx_queue_status_scheduled
ON email_queue(status, scheduled_for)
WHERE status IN ('pending', 'processing');

CREATE INDEX idx_milestones_unsent
ON user_milestones(achieved_at)
WHERE email_sent = false;

-- ============================================
-- INITIAL DATA
-- ============================================

-- Create default email preferences for existing users
INSERT INTO email_preferences (user_id)
SELECT id FROM users
WHERE id NOT IN (SELECT user_id FROM email_preferences);

-- Create engagement scores for existing users
INSERT INTO user_engagement_scores (user_id, last_login_at)
SELECT id, last_login_at FROM users
WHERE id NOT IN (SELECT user_id FROM user_engagement_scores);

-- ============================================
-- UTILITY VIEWS
-- ============================================

-- View: Email performance dashboard
CREATE OR REPLACE VIEW email_performance_summary AS
SELECT
  email_type,
  email_category,
  COUNT(*) as total_sent,
  COUNT(opened_at) as total_opened,
  COUNT(clicked_at) as total_clicked,
  COUNT(converted_at) as total_conversions,
  ROUND(COUNT(opened_at)::NUMERIC / COUNT(*) * 100, 2) as open_rate,
  ROUND(COUNT(clicked_at)::NUMERIC / COUNT(*) * 100, 2) as click_rate,
  ROUND(COUNT(converted_at)::NUMERIC / COUNT(*) * 100, 2) as conversion_rate,
  SUM(conversion_value) as total_revenue
FROM email_tracking
WHERE sent_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY email_type, email_category
ORDER BY total_sent DESC;

-- View: Users needing engagement emails
CREATE OR REPLACE VIEW users_needing_engagement AS
SELECT
  u.id,
  u.email,
  u.first_name,
  u.subscription_type,
  ues.days_inactive,
  ues.churn_risk,
  ues.last_login_at,
  ep.frequency,
  ep.last_email_sent_at,
  ep.emails_sent_this_week
FROM users u
JOIN user_engagement_scores ues ON u.id = ues.user_id
JOIN email_preferences ep ON u.id = ep.user_id
WHERE
  ues.days_inactive > 3
  AND ep.engagement_emails = true
  AND ep.unsubscribed_all = false
  AND (ep.last_email_sent_at IS NULL OR ep.last_email_sent_at < NOW() - INTERVAL '2 days')
  AND ep.emails_sent_this_week < ep.max_emails_per_week
ORDER BY ues.churn_risk DESC, ues.days_inactive DESC;

-- View: High upsell potential users
CREATE OR REPLACE VIEW users_upsell_potential AS
SELECT
  u.id,
  u.email,
  u.first_name,
  u.subscription_type,
  ues.upsell_score,
  ues.feature_limit_hits,
  ues.engagement_score
FROM users u
JOIN user_engagement_scores ues ON u.id = ues.user_id
JOIN email_preferences ep ON u.id = ep.user_id
WHERE
  ues.upsell_score > 70
  AND u.subscription_type IN ('sociaal', 'core', 'pro')
  AND ep.marketing_emails = true
  AND ep.unsubscribed_all = false
ORDER BY ues.upsell_score DESC;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant permissions to application role
GRANT SELECT, INSERT, UPDATE, DELETE ON email_tracking TO app_user;
GRANT SELECT, INSERT, UPDATE ON email_preferences TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON email_queue TO app_user;
GRANT SELECT ON email_templates TO app_user;
GRANT SELECT, INSERT, UPDATE ON user_milestones TO app_user;
GRANT SELECT ON email_campaigns TO app_user;
GRANT SELECT, UPDATE ON user_engagement_scores TO app_user;

-- Grant sequence usage
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON COLUMN email_tracking.variant IS 'A/B test variant identifier';
COMMENT ON COLUMN email_tracking.conversion_type IS 'Type of conversion: upgrade, feature_use, course_start, etc.';
COMMENT ON COLUMN email_preferences.frequency IS 'Email frequency: none, minimal, normal, all';
COMMENT ON COLUMN email_queue.dedup_key IS 'Unique key to prevent duplicate emails (e.g., user_id + email_type + date)';
COMMENT ON COLUMN user_engagement_scores.engagement_score IS 'Overall engagement score 0-100, higher = more engaged';
COMMENT ON COLUMN user_engagement_scores.churn_risk IS 'Churn risk level: low, medium, high, critical';

-- ============================================
-- MAINTENANCE QUERIES
-- ============================================

-- Clean old email tracking data (older than 1 year)
-- Run monthly
-- DELETE FROM email_tracking WHERE sent_at < NOW() - INTERVAL '1 year';

-- Clean processed email queue (older than 30 days)
-- Run weekly
-- DELETE FROM email_queue WHERE status IN ('sent', 'failed') AND created_at < NOW() - INTERVAL '30 days';

COMMIT;
