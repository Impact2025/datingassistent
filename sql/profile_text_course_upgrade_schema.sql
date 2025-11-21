-- ============================================
-- PROFIELTEKST CURSUS UPGRADE - DATABASE SCHEMA
-- ============================================
-- Date: 2025-11-17
-- Purpose: Support interactive components for upgraded profile text course
-- ============================================

-- ============================================
-- 1. BIO VERSIONS & ANALYSIS
-- ============================================

-- Track all bio versions user creates
CREATE TABLE IF NOT EXISTS user_bio_versions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id INTEGER REFERENCES course_lessons(id),

  version_number INTEGER DEFAULT 1,
  bio_text TEXT NOT NULL,

  -- Analysis scores
  health_score INTEGER, -- 0-100 overall
  specificity_score INTEGER, -- 0-10
  cliche_score INTEGER, -- 0-10 (10 = no cliches)
  hooks_score INTEGER, -- 0-10
  length_score INTEGER, -- 0-10
  tone_score INTEGER, -- 0-10
  authenticity_score INTEGER, -- 0-10

  -- Detailed analysis results
  analysis_data JSONB DEFAULT '{}'::jsonb,

  -- Source tracking
  source_type VARCHAR(50), -- 'user_written', 'ai_generated', 'template', 'community_feedback'
  source_id VARCHAR(100),

  is_active BOOLEAN DEFAULT TRUE, -- Current version

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bio_versions_user ON user_bio_versions(user_id, created_at DESC);
CREATE INDEX idx_bio_versions_active ON user_bio_versions(user_id, is_active) WHERE is_active = TRUE;

-- ============================================
-- 2. CLICHÉ TRANSFORMATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS user_cliche_transformations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id INTEGER REFERENCES course_lessons(id),

  cliche_id VARCHAR(50) NOT NULL, -- 'travel', 'foodie', 'spontaneous', etc.
  cliche_text TEXT NOT NULL, -- Original cliché

  -- Transformation steps
  user_meaning TEXT, -- What they really meant
  user_detail TEXT, -- Specific example they added
  transformed_text TEXT NOT NULL, -- Final version

  -- AI feedback
  ai_score INTEGER, -- 0-100
  ai_feedback TEXT,

  -- Community engagement
  community_votes INTEGER DEFAULT 0,
  is_showcased BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cliche_transformations_user ON user_cliche_transformations(user_id);
CREATE INDEX idx_cliche_showcased ON user_cliche_transformations(is_showcased, community_votes DESC) WHERE is_showcased = TRUE;

-- ============================================
-- 3. PERSONALITY PROFILES
-- ============================================

CREATE TABLE IF NOT EXISTS user_personality_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id INTEGER REFERENCES course_lessons(id),

  -- 5 Dimension scores (0-100 each)
  social_energy INTEGER, -- Introvert (0) <-> Extrovert (100)
  adventure_comfort INTEGER, -- Homebody (0) <-> Explorer (100)
  communication_style INTEGER, -- Listener (0) <-> Talker (100)
  planning_style INTEGER, -- Spontaneous (0) <-> Planner (100)
  expression_mode INTEGER, -- Doer (0) <-> Talker (100)

  -- Derived profile
  profile_type VARCHAR(100), -- 'Thoughtful Explorer', 'Social Planner', etc.
  profile_description TEXT,

  -- Template selection
  selected_template_id VARCHAR(50),
  customized_bio TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_personality_profiles_user ON user_personality_profiles(user_id);
CREATE INDEX idx_personality_type ON user_personality_profiles(profile_type);

-- ============================================
-- 4. AI BIO COACH SESSIONS
-- ============================================

CREATE TABLE IF NOT EXISTS ai_bio_coach_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id INTEGER REFERENCES course_lessons(id),

  session_started TIMESTAMP DEFAULT NOW(),
  session_completed TIMESTAMP,

  questions_answered INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 8,

  -- Session data
  responses JSONB DEFAULT '[]'::jsonb, -- Array of {questionId, answer, insights}
  generated_bios JSONB DEFAULT '[]'::jsonb, -- Array of bio versions
  selected_bio_id VARCHAR(50),
  final_bio_text TEXT,

  -- Metrics
  time_spent_seconds INTEGER,
  satisfaction_rating INTEGER, -- 1-5 stars

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bio_coach_sessions_user ON ai_bio_coach_sessions(user_id);
CREATE INDEX idx_bio_coach_completed ON ai_bio_coach_sessions(session_completed) WHERE session_completed IS NOT NULL;

-- Track AI usage for cost monitoring
CREATE TABLE IF NOT EXISTS ai_bio_coach_usage (
  id SERIAL PRIMARY KEY,
  session_id UUID REFERENCES ai_bio_coach_sessions(id) ON DELETE CASCADE,

  api_call_type VARCHAR(50), -- 'insight', 'followup', 'bio_generation'
  tokens_used INTEGER,
  cost_usd DECIMAL(10, 6),

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bio_coach_usage_session ON ai_bio_coach_usage(session_id);

-- ============================================
-- 5. BIO TRANSFORMATIONS (Before/After Gallery)
-- ============================================

CREATE TABLE IF NOT EXISTS bio_transformations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  before_bio TEXT NOT NULL,
  after_bio TEXT NOT NULL,

  -- Optional metrics
  match_rate_before DECIMAL(5,2),
  match_rate_after DECIMAL(5,2),
  messages_per_week_before INTEGER,
  messages_per_week_after INTEGER,

  -- Context
  personality_type VARCHAR(100),
  user_testimonial TEXT,

  -- Privacy settings
  is_anonymous BOOLEAN DEFAULT TRUE,
  share_personality_type BOOLEAN DEFAULT FALSE,
  share_testimonial BOOLEAN DEFAULT FALSE,

  -- Moderation
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  reviewed_by INTEGER REFERENCES users(id),
  reviewed_at TIMESTAMP,
  rejection_reason TEXT,

  -- Engagement
  upvotes INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,

  is_featured BOOLEAN DEFAULT FALSE,
  featured_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transformations_status ON bio_transformations(status);
CREATE INDEX idx_transformations_featured ON bio_transformations(is_featured, upvotes DESC) WHERE is_featured = TRUE;
CREATE INDEX idx_transformations_type ON bio_transformations(personality_type) WHERE personality_type IS NOT NULL;

-- Track user interactions with transformations
CREATE TABLE IF NOT EXISTS bio_transformation_interactions (
  id SERIAL PRIMARY KEY,
  transformation_id INTEGER NOT NULL REFERENCES bio_transformations(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  interaction_type VARCHAR(20) NOT NULL, -- 'upvote', 'save', 'view'

  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(transformation_id, user_id, interaction_type)
);

CREATE INDEX idx_transformation_interactions ON bio_transformation_interactions(transformation_id, interaction_type);

-- ============================================
-- 6. BIO CHECKLIST RESULTS
-- ============================================

CREATE TABLE IF NOT EXISTS bio_checklist_results (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id INTEGER REFERENCES course_lessons(id),

  bio_text TEXT NOT NULL,
  overall_score INTEGER, -- 0-100

  -- Individual criteria scores (0-10 each)
  no_cliches_score INTEGER,
  specificity_score INTEGER,
  length_score INTEGER,
  hooks_score INTEGER,
  tone_score INTEGER,
  grammar_score INTEGER,
  authenticity_score INTEGER,
  visual_score INTEGER,
  future_focus_score INTEGER,
  cta_score INTEGER,

  -- Manual confirmations
  unique_selling_point_confirmed BOOLEAN DEFAULT FALSE,
  personal_comfort_score INTEGER, -- 0-100 slider

  -- Detailed results
  check_results JSONB DEFAULT '{}'::jsonb,
  issues_found JSONB DEFAULT '[]'::jsonb,

  -- Certificate
  certificate_earned BOOLEAN DEFAULT FALSE,
  certificate_generated_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_checklist_user ON bio_checklist_results(user_id);
CREATE INDEX idx_checklist_perfect ON bio_checklist_results(overall_score) WHERE overall_score = 100;

-- ============================================
-- 7. BIO REVIEW EXCHANGE (Peer Feedback)
-- ============================================

CREATE TABLE IF NOT EXISTS bio_review_submissions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id INTEGER REFERENCES course_lessons(id),

  bio_text TEXT NOT NULL,
  requested_feedback_types TEXT[] NOT NULL, -- ['tone', 'hooks', 'clarity', etc.]

  -- Context (optional)
  personality_type VARCHAR(100),
  age_range VARCHAR(20),
  platform VARCHAR(50),
  target_audience TEXT,

  -- Privacy
  is_anonymous BOOLEAN DEFAULT TRUE,
  visibility VARCHAR(20) DEFAULT 'community', -- 'community', 'public'

  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewed', 'closed'
  review_count INTEGER DEFAULT 0,
  average_score DECIMAL(3,1),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_review_submissions_status ON bio_review_submissions(status, created_at DESC);
CREATE INDEX idx_review_submissions_user ON bio_review_submissions(user_id);

-- Individual reviews
CREATE TABLE IF NOT EXISTS bio_reviews (
  id SERIAL PRIMARY KEY,
  submission_id INTEGER NOT NULL REFERENCES bio_review_submissions(id) ON DELETE CASCADE,
  reviewer_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  overall_rating INTEGER, -- 1-5 stars

  -- Detailed feedback by category
  feedback_data JSONB NOT NULL, -- { 'tone': { score: 8, comment: '...' }, ... }

  alternative_bio TEXT, -- Optional improved version

  -- Engagement
  helpful_votes INTEGER DEFAULT 0,
  not_helpful_votes INTEGER DEFAULT 0,
  was_applied BOOLEAN DEFAULT FALSE,

  -- Karma awarded
  karma_awarded INTEGER DEFAULT 5,
  bonus_karma INTEGER DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(submission_id, reviewer_user_id) -- One review per person
);

CREATE INDEX idx_reviews_submission ON bio_reviews(submission_id);
CREATE INDEX idx_reviews_reviewer ON bio_reviews(reviewer_user_id);

-- Vote tracking
CREATE TABLE IF NOT EXISTS bio_review_votes (
  id SERIAL PRIMARY KEY,
  review_id INTEGER NOT NULL REFERENCES bio_reviews(id) ON DELETE CASCADE,
  voter_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  vote_type VARCHAR(20) NOT NULL, -- 'helpful', 'not_helpful'

  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(review_id, voter_user_id)
);

CREATE INDEX idx_review_votes ON bio_review_votes(review_id);

-- ============================================
-- 8. KARMA SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS user_karma (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,

  total_karma INTEGER DEFAULT 0,
  karma_level VARCHAR(50) DEFAULT 'Beginner', -- 'Beginner', 'Active', 'Expert', 'Master'

  -- Activity counts
  reviews_given INTEGER DEFAULT 0,
  helpful_votes_received INTEGER DEFAULT 0,
  alternatives_applied INTEGER DEFAULT 0,
  transformations_shared INTEGER DEFAULT 0,

  -- Achievements
  achievements_unlocked TEXT[] DEFAULT ARRAY[]::TEXT[],

  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_karma_total ON user_karma(total_karma DESC);

-- Karma transaction log
CREATE TABLE IF NOT EXISTS karma_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  amount INTEGER NOT NULL, -- Can be positive or negative
  transaction_type VARCHAR(50) NOT NULL, -- 'review_given', 'helpful_vote', 'achievement', etc.
  description TEXT,

  -- Reference to source
  reference_type VARCHAR(50), -- 'bio_review', 'transformation', 'achievement'
  reference_id INTEGER,

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_karma_transactions_user ON karma_transactions(user_id, created_at DESC);

-- ============================================
-- 9. COURSE ACHIEVEMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS course_achievements (
  id SERIAL PRIMARY KEY,

  achievement_key VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(20), -- Emoji

  -- Unlock criteria
  unlock_condition TEXT NOT NULL, -- Description for users
  unlock_logic JSONB, -- Machine-readable criteria

  karma_reward INTEGER DEFAULT 0,

  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT NOW()
);

-- User achievement unlocks
CREATE TABLE IF NOT EXISTS user_course_achievements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id INTEGER NOT NULL REFERENCES course_achievements(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES courses(id),

  unlocked_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements ON user_course_achievements(user_id);

-- ============================================
-- 10. EMAIL AUTOMATION TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS course_email_sends (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES courses(id),

  email_type VARCHAR(50) NOT NULL, -- 'welcome', 'progress_check', 'milestone', etc.

  sent_at TIMESTAMP DEFAULT NOW(),
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,

  -- Email content snapshot
  subject VARCHAR(200),
  template_used VARCHAR(100),
  personalization_data JSONB,

  -- Engagement
  converted BOOLEAN DEFAULT FALSE, -- Did user take intended action?
  conversion_type VARCHAR(50), -- 'completed_module', 'returned_to_course', etc.

  UNIQUE(user_id, course_id, email_type, sent_at::DATE) -- One per type per day
);

CREATE INDEX idx_email_sends_user ON course_email_sends(user_id, course_id);
CREATE INDEX idx_email_performance ON course_email_sends(email_type, sent_at DESC);

-- ============================================
-- 11. HELPER FUNCTIONS
-- ============================================

-- Function to update karma
CREATE OR REPLACE FUNCTION update_user_karma(
  p_user_id INTEGER,
  p_amount INTEGER,
  p_transaction_type VARCHAR(50),
  p_description TEXT DEFAULT NULL,
  p_reference_type VARCHAR(50) DEFAULT NULL,
  p_reference_id INTEGER DEFAULT NULL
) RETURNS void AS $$
BEGIN
  -- Insert karma transaction
  INSERT INTO karma_transactions (
    user_id, amount, transaction_type, description, reference_type, reference_id
  ) VALUES (
    p_user_id, p_amount, p_transaction_type, p_description, p_reference_type, p_reference_id
  );

  -- Update user karma total
  INSERT INTO user_karma (user_id, total_karma)
  VALUES (p_user_id, p_amount)
  ON CONFLICT (user_id)
  DO UPDATE SET
    total_karma = user_karma.total_karma + p_amount,
    updated_at = NOW();

  -- Update karma level based on total
  UPDATE user_karma
  SET karma_level = CASE
    WHEN total_karma >= 250 THEN 'Master'
    WHEN total_karma >= 100 THEN 'Expert'
    WHEN total_karma >= 50 THEN 'Active'
    ELSE 'Beginner'
  END
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to mark bio version as active (deactivate others)
CREATE OR REPLACE FUNCTION set_active_bio_version(
  p_version_id INTEGER
) RETURNS void AS $$
DECLARE
  v_user_id INTEGER;
BEGIN
  -- Get user_id from the version
  SELECT user_id INTO v_user_id FROM user_bio_versions WHERE id = p_version_id;

  -- Deactivate all other versions for this user
  UPDATE user_bio_versions
  SET is_active = FALSE
  WHERE user_id = v_user_id AND id != p_version_id;

  -- Activate the selected version
  UPDATE user_bio_versions
  SET is_active = TRUE
  WHERE id = p_version_id;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate next bio version number
CREATE OR REPLACE FUNCTION get_next_bio_version_number(
  p_user_id INTEGER
) RETURNS INTEGER AS $$
DECLARE
  v_max_version INTEGER;
BEGIN
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO v_max_version
  FROM user_bio_versions
  WHERE user_id = p_user_id;

  RETURN v_max_version;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 12. SEED ACHIEVEMENTS
-- ============================================

INSERT INTO course_achievements (achievement_key, title, description, icon, unlock_condition, karma_reward) VALUES
  ('first_bio', 'Bio Beginner', 'Schrijf je eerste bio', '📝', 'Maak je eerste bio versie', 10),
  ('cliche_crusher', 'Cliché Crusher', 'Transform 8/10 clichés correct', '🔨', 'Transformeer minstens 8 clichés succesvol', 25),
  ('perfect_score', 'Perfectionist', '100% score op Bio Checklist', '💯', 'Haal 100/100 op de bio checklist', 50),
  ('ai_collaborator', 'AI Collaborator', 'Voltooi AI Bio Coach sessie', '🤖', 'Voltooi een volledige AI Bio Coach sessie', 30),
  ('community_helper', 'Community Helper', 'Geef 10 bio reviews', '🤝', 'Geef 10 reviews aan andere cursisten', 50),
  ('transformation_master', 'Transformation Master', 'Deel je before/after', '🦋', 'Deel je bio transformatie publiekelijk', 40),
  ('course_completer', 'Course Graduate', 'Voltooi alle modules', '🎓', 'Voltooi 100% van de cursus', 100),
  ('speed_learner', 'Speed Learner', 'Voltooi cursus in < 2 uur', '⚡', 'Voltooi de cursus in minder dan 2 uur', 75),
  ('bio_maintainer', 'Bio Maintainer', 'Update bio 3x', '🔄', 'Kom 3x terug om je bio te updaten', 60),
  ('match_magnet', 'Match Magnet', 'Bio score 95+, share transformatie', '🧲', 'Behaal score 95+ én deel je transformatie', 150)
ON CONFLICT (achievement_key) DO NOTHING;

-- ============================================
-- VIEWS FOR ANALYTICS
-- ============================================

-- Bio improvement overview
CREATE OR REPLACE VIEW bio_improvement_stats AS
SELECT
  u.id as user_id,
  u.email,
  COUNT(DISTINCT bv.id) as total_versions,
  MIN(bv.health_score) as first_score,
  MAX(bv.health_score) as best_score,
  MAX(bv.health_score) - MIN(bv.health_score) as improvement,
  COUNT(DISTINCT ct.id) as cliches_transformed,
  COUNT(DISTINCT br.id) as reviews_given,
  uk.total_karma
FROM users u
LEFT JOIN user_bio_versions bv ON u.id = bv.user_id
LEFT JOIN user_cliche_transformations ct ON u.id = ct.user_id
LEFT JOIN bio_reviews br ON u.id = br.reviewer_user_id
LEFT JOIN user_karma uk ON u.id = uk.user_id
GROUP BY u.id, u.email, uk.total_karma;

-- Course engagement overview
CREATE OR REPLACE VIEW profile_course_engagement AS
SELECT
  COUNT(DISTINCT bv.user_id) as users_with_bios,
  COUNT(DISTINCT abs.id) as coach_sessions_started,
  COUNT(DISTINCT abs.id) FILTER (WHERE abs.session_completed IS NOT NULL) as coach_sessions_completed,
  COUNT(DISTINCT ct.user_id) as users_transformed_cliches,
  COUNT(DISTINCT bcr.user_id) as users_used_checklist,
  COUNT(DISTINCT brs.user_id) as users_submitted_for_review,
  COUNT(DISTINCT br.reviewer_user_id) as users_gave_reviews,
  COUNT(DISTINCT bt.user_id) FILTER (WHERE bt.status = 'approved') as users_shared_transformation,
  AVG(bv.health_score) as avg_bio_score,
  COUNT(DISTINCT uca.user_id) as users_with_achievements
FROM user_bio_versions bv
FULL OUTER JOIN ai_bio_coach_sessions abs ON 1=1
FULL OUTER JOIN user_cliche_transformations ct ON 1=1
FULL OUTER JOIN bio_checklist_results bcr ON 1=1
FULL OUTER JOIN bio_review_submissions brs ON 1=1
FULL OUTER JOIN bio_reviews br ON 1=1
FULL OUTER JOIN bio_transformations bt ON 1=1
FULL OUTER JOIN user_course_achievements uca ON 1=1;

-- ============================================
-- GRANTS (if needed for specific roles)
-- ============================================

-- Grant access to web app role (adjust role name as needed)
-- GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO webapp_role;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO webapp_role;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO webapp_role;

-- ============================================
-- COMPLETION
-- ============================================

COMMENT ON TABLE user_bio_versions IS 'Stores all versions of user bios with analysis scores';
COMMENT ON TABLE ai_bio_coach_sessions IS 'Tracks conversational AI bio coaching sessions';
COMMENT ON TABLE bio_transformations IS 'Before/after bio transformations for community gallery';
COMMENT ON TABLE user_karma IS 'Gamification karma points and levels';
COMMENT ON TABLE course_achievements IS 'Available achievements for the course';

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Profile Text Course Upgrade Schema installed successfully!';
  RAISE NOTICE 'Tables created: 15';
  RAISE NOTICE 'Functions created: 3';
  RAISE NOTICE 'Views created: 2';
  RAISE NOTICE 'Achievements seeded: 10';
END $$;
