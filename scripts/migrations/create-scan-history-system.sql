-- ============================================================================
-- SCAN HISTORY SYSTEM - DATABASE MIGRATION
-- Version: 1.0
-- Purpose: Create unified scan history, retake tracking, and progress system
-- Author: Claude Code
-- Date: 2024-12-08
-- ============================================================================

-- ============================================================================
-- TABLE 1: user_scan_history
-- Purpose: Unified history of all scan completions across all scan types
-- Stores: Full results, metadata, quick access data for dashboards
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_scan_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scan_type VARCHAR(50) NOT NULL,
  assessment_id INTEGER NOT NULL,

  -- Status tracking
  completed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  total_time_seconds INTEGER,
  confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),

  -- Quick access metadata (denormalized for fast dashboard queries)
  primary_result VARCHAR(200),
  scores_json JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Full results (complete scan output stored as JSONB for flexibility)
  full_results JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Comparison tracking
  previous_assessment_id INTEGER REFERENCES user_scan_history(id),
  improvement_percentage DECIMAL(5,2),
  trends_detected TEXT[],

  -- Metadata
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Indexes for performance
  CONSTRAINT unique_assessment UNIQUE (scan_type, assessment_id)
);

-- Create indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_user_scan_history_user_scan ON user_scan_history(user_id, scan_type);
CREATE INDEX IF NOT EXISTS idx_user_scan_history_completed ON user_scan_history(user_id, completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_scan_history_scan_type ON user_scan_history(scan_type);
CREATE INDEX IF NOT EXISTS idx_user_scan_history_scores ON user_scan_history USING GIN (scores_json);

-- Add comment for documentation
COMMENT ON TABLE user_scan_history IS 'Unified history of all scan completions with full results and metadata';
COMMENT ON COLUMN user_scan_history.scan_type IS 'Type: hechtingsstijl, dating-style, emotional-readiness';
COMMENT ON COLUMN user_scan_history.scores_json IS 'Quick access scores for dashboard widgets';
COMMENT ON COLUMN user_scan_history.full_results IS 'Complete scan results including AI analysis';

-- ============================================================================
-- TABLE 2: scan_retake_status
-- Purpose: Track retake eligibility, cooldowns, and remind scheduling
-- Enforces: 3-month cooldown for hechtingsstijl/dating-style, 1-month for emotional-readiness
-- ============================================================================

CREATE TABLE IF NOT EXISTS scan_retake_status (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scan_type VARCHAR(50) NOT NULL,

  -- Tracking
  total_attempts INTEGER NOT NULL DEFAULT 0,
  last_completed_at TIMESTAMP,
  can_retake_after TIMESTAMP,

  -- Cooldown policy (in days)
  cooldown_days INTEGER NOT NULL DEFAULT 90,
  max_attempts_per_year INTEGER NOT NULL DEFAULT 4,

  -- Reminder system
  next_reminder_at TIMESTAMP,
  reminder_sent BOOLEAN DEFAULT FALSE,
  reminder_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  PRIMARY KEY (user_id, scan_type)
);

-- Index for reminder queries
CREATE INDEX IF NOT EXISTS idx_scan_retake_reminders ON scan_retake_status(next_reminder_at)
  WHERE reminder_sent = FALSE AND next_reminder_at IS NOT NULL;

-- Index for retake availability queries
CREATE INDEX IF NOT EXISTS idx_scan_retake_available ON scan_retake_status(user_id, can_retake_after);

COMMENT ON TABLE scan_retake_status IS 'Tracks retake eligibility and cooldown periods for all scan types';
COMMENT ON COLUMN scan_retake_status.cooldown_days IS 'Days before retake allowed (90 for most, 30 for emotional-readiness)';

-- ============================================================================
-- TABLE 3: user_scan_progress
-- Purpose: Overall progress tracking across all scans
-- Shows: Completion status, achievements, streaks
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_scan_progress (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

  -- Completion counts
  scans_completed INTEGER NOT NULL DEFAULT 0,
  scans_total INTEGER NOT NULL DEFAULT 5,
  completion_percentage DECIMAL(5,2) GENERATED ALWAYS AS ((scans_completed::DECIMAL / scans_total::DECIMAL) * 100) STORED,

  -- Scan-specific completion flags
  hechtingsstijl_completed BOOLEAN DEFAULT FALSE,
  dating_style_completed BOOLEAN DEFAULT FALSE,
  emotional_readiness_completed BOOLEAN DEFAULT FALSE,

  -- First/last scan timestamps
  first_scan_completed_at TIMESTAMP,
  last_scan_completed_at TIMESTAMP,

  -- Achievements
  completed_all_scans BOOLEAN DEFAULT FALSE,
  completed_all_scans_at TIMESTAMP,

  -- Retake streaks (consecutive quarters with at least 1 retake)
  current_retake_streak INTEGER DEFAULT 0,
  longest_retake_streak INTEGER DEFAULT 0,

  -- Growth metrics
  average_improvement_percentage DECIMAL(5,2),
  total_retakes INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index for leaderboard queries (future feature)
CREATE INDEX IF NOT EXISTS idx_user_scan_progress_completion ON user_scan_progress(completion_percentage DESC);
CREATE INDEX IF NOT EXISTS idx_user_scan_progress_streak ON user_scan_progress(current_retake_streak DESC);

COMMENT ON TABLE user_scan_progress IS 'Overall scan completion progress and achievements per user';
COMMENT ON COLUMN user_scan_progress.completion_percentage IS 'Auto-calculated: (scans_completed / scans_total) * 100';

-- ============================================================================
-- TRIGGERS: Auto-update timestamps
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
CREATE TRIGGER update_scan_retake_status_updated_at
  BEFORE UPDATE ON scan_retake_status
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_scan_progress_updated_at
  BEFORE UPDATE ON user_scan_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check if user can retake a scan
CREATE OR REPLACE FUNCTION can_user_retake_scan(
  p_user_id INTEGER,
  p_scan_type VARCHAR(50)
)
RETURNS TABLE(
  can_retake BOOLEAN,
  reason VARCHAR(100),
  days_remaining INTEGER,
  can_retake_at TIMESTAMP
) AS $$
DECLARE
  v_status RECORD;
  v_now TIMESTAMP := NOW();
BEGIN
  -- Get retake status
  SELECT * INTO v_status
  FROM scan_retake_status
  WHERE user_id = p_user_id AND scan_type = p_scan_type;

  -- If no record, user can take for first time
  IF NOT FOUND THEN
    RETURN QUERY SELECT TRUE, 'first_attempt'::VARCHAR, 0, NULL::TIMESTAMP;
    RETURN;
  END IF;

  -- Check if cooldown has passed
  IF v_status.can_retake_after IS NULL OR v_status.can_retake_after <= v_now THEN
    RETURN QUERY SELECT TRUE, 'cooldown_passed'::VARCHAR, 0, v_status.can_retake_after;
    RETURN;
  END IF;

  -- Still in cooldown
  RETURN QUERY SELECT
    FALSE,
    'cooldown_active'::VARCHAR,
    CEIL(EXTRACT(EPOCH FROM (v_status.can_retake_after - v_now)) / 86400)::INTEGER,
    v_status.can_retake_after;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION can_user_retake_scan IS 'Check if user can retake a specific scan type';

-- Function to get user scan summary
CREATE OR REPLACE FUNCTION get_user_scan_summary(p_user_id INTEGER)
RETURNS TABLE(
  scan_type VARCHAR(50),
  is_completed BOOLEAN,
  last_completed_at TIMESTAMP,
  total_attempts INTEGER,
  can_retake BOOLEAN,
  days_until_retake INTEGER,
  latest_primary_result VARCHAR(200),
  latest_confidence_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.scan_type,
    (h.id IS NOT NULL) as is_completed,
    h.completed_at as last_completed_at,
    COALESCE(srs.total_attempts, 0) as total_attempts,
    (srs.can_retake_after IS NULL OR srs.can_retake_after <= NOW()) as can_retake,
    CASE
      WHEN srs.can_retake_after IS NULL OR srs.can_retake_after <= NOW() THEN 0
      ELSE CEIL(EXTRACT(EPOCH FROM (srs.can_retake_after - NOW())) / 86400)::INTEGER
    END as days_until_retake,
    h.primary_result as latest_primary_result,
    h.confidence_score as latest_confidence_score
  FROM (
    VALUES
      ('hechtingsstijl'::VARCHAR(50)),
      ('dating-style'::VARCHAR(50)),
      ('emotional-readiness'::VARCHAR(50))
  ) AS s(scan_type)
  LEFT JOIN LATERAL (
    SELECT * FROM user_scan_history
    WHERE user_id = p_user_id AND scan_type = s.scan_type
    ORDER BY completed_at DESC
    LIMIT 1
  ) h ON TRUE
  LEFT JOIN scan_retake_status srs ON srs.user_id = p_user_id AND srs.scan_type = s.scan_type;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_user_scan_summary IS 'Get summary of all scans for a user with completion status';

-- ============================================================================
-- INITIAL DATA MIGRATION
-- Purpose: Populate new tables with existing scan data
-- ============================================================================

-- Migrate existing hechtingsstijl assessments
INSERT INTO user_scan_history (
  user_id,
  scan_type,
  assessment_id,
  completed_at,
  total_time_seconds,
  confidence_score,
  primary_result,
  scores_json,
  full_results
)
SELECT DISTINCT ON (ha.user_id, ha.id)
  ha.user_id,
  'hechtingsstijl'::VARCHAR(50),
  ha.id,
  COALESCE(ha.completed_at, ha.created_at),
  ha.total_time_seconds,
  ha.confidence_score,
  hr.primary_style,
  jsonb_build_object(
    'veilig', hr.veilig_score,
    'angstig', hr.angstig_score,
    'vermijdend', hr.vermijdend_score,
    'angstig_vermijdend', hr.angstig_vermijdend_score
  ),
  jsonb_build_object(
    'primary_style', hr.primary_style,
    'secondary_style', hr.secondary_style,
    'scores', jsonb_build_object(
      'veilig', hr.veilig_score,
      'angstig', hr.angstig_score,
      'vermijdend', hr.vermijdend_score,
      'angstig_vermijdend', hr.angstig_vermijdend_score
    ),
    'ai_insights', jsonb_build_object(
      'profiel', hr.ai_profiel,
      'toekomstgerichte_interpretatie', hr.toekomstgerichte_interpretatie,
      'dating_voorbeelden', hr.dating_voorbeelden,
      'triggers', hr.triggers,
      'herstel_strategieen', hr.herstel_strategieen
    ),
    'confidence_score', ha.confidence_score,
    'completed_at', COALESCE(ha.completed_at, ha.created_at)
  )
FROM hechtingsstijl_assessments ha
LEFT JOIN hechtingsstijl_results hr ON hr.assessment_id = ha.id
WHERE ha.status = 'completed' AND ha.user_id IS NOT NULL
ON CONFLICT (scan_type, assessment_id) DO NOTHING;

-- Migrate existing dating style assessments
INSERT INTO user_scan_history (
  user_id,
  scan_type,
  assessment_id,
  completed_at,
  confidence_score,
  primary_result,
  scores_json,
  full_results
)
SELECT DISTINCT ON (dsa.user_id, dsa.id)
  dsa.user_id,
  'dating-style'::VARCHAR(50),
  dsa.id,
  COALESCE(dsa.completed_at, dsa.created_at),
  dsa.confidence_score,
  dsr.primary_style,
  jsonb_build_object(
    'initiator', dsr.initiator_score,
    'planner', dsr.planner_score,
    'adventurer', dsr.adventurer_score,
    'pleaser', dsr.pleaser_score,
    'selector', dsr.selector_score,
    'distant', dsr.distant_score,
    'over_sharer', dsr.over_sharer_score,
    'ghost_prone', dsr.ghost_prone_score
  ),
  jsonb_build_object(
    'primary_style', dsr.primary_style,
    'secondary_styles', dsr.secondary_styles,
    'blindspot_index', dsr.blindspot_index,
    'scores', jsonb_build_object(
      'initiator', dsr.initiator_score,
      'planner', dsr.planner_score,
      'adventurer', dsr.adventurer_score,
      'pleaser', dsr.pleaser_score,
      'selector', dsr.selector_score,
      'distant', dsr.distant_score,
      'over_sharer', dsr.over_sharer_score,
      'ghost_prone', dsr.ghost_prone_score
    ),
    'ai_insights', jsonb_build_object(
      'headline', dsr.ai_headline,
      'one_liner', dsr.ai_one_liner,
      'strong_points', dsr.strong_points,
      'blind_spots', dsr.blind_spots,
      'chat_scripts', dsr.chat_scripts
    ),
    'confidence_score', dsa.confidence_score,
    'completed_at', COALESCE(dsa.completed_at, dsa.created_at)
  )
FROM dating_style_assessments dsa
LEFT JOIN dating_style_results dsr ON dsr.assessment_id = dsa.id
WHERE dsa.status = 'completed' AND dsa.user_id IS NOT NULL
ON CONFLICT (scan_type, assessment_id) DO NOTHING;

-- Migrate existing emotional readiness assessments
INSERT INTO user_scan_history (
  user_id,
  scan_type,
  assessment_id,
  completed_at,
  confidence_score,
  primary_result,
  scores_json,
  full_results
)
SELECT DISTINCT ON (era.user_id, era.id)
  era.user_id,
  'emotional-readiness'::VARCHAR(50),
  era.id,
  COALESCE(era.completed_at, era.created_at),
  era.confidence_score,
  CONCAT(err.readiness_level, ' (', err.readiness_score, '%)'),
  jsonb_build_object(
    'readiness_score', err.readiness_score,
    'rebound_risico', err.rebound_risico,
    'emotionele_draagkracht', err.emotionele_draagkracht,
    'self_esteem', err.self_esteem
  ),
  jsonb_build_object(
    'readiness_score', err.readiness_score,
    'readiness_level', err.readiness_level,
    'rebound_risico', err.rebound_risico,
    'scores', jsonb_build_object(
      'emotionele_draagkracht', err.emotionele_draagkracht,
      'intenties', err.intenties,
      'restlading', err.restlading,
      'self_esteem', err.self_esteem,
      'stress', err.stress
    ),
    'ai_insights', jsonb_build_object(
      'conclusie', err.ai_conclusie,
      'readiness_analyse', err.readiness_analyse,
      'aanbevelingen', err.directe_aanbevelingen
    ),
    'confidence_score', era.confidence_score,
    'completed_at', COALESCE(era.completed_at, era.created_at)
  )
FROM emotionele_readiness_assessments era
LEFT JOIN emotionele_readiness_results err ON err.assessment_id = era.id
WHERE era.status = 'completed' AND era.user_id IS NOT NULL
ON CONFLICT (scan_type, assessment_id) DO NOTHING;

-- Populate scan_retake_status from existing progress tables
INSERT INTO scan_retake_status (
  user_id,
  scan_type,
  total_attempts,
  last_completed_at,
  can_retake_after,
  cooldown_days,
  max_attempts_per_year
)
SELECT
  dsp.user_id,
  'dating-style'::VARCHAR(50),
  COALESCE(dsp.assessment_count, 1),
  NOW() - INTERVAL '1 day', -- Assume recent for existing users
  dsp.can_retake_after,
  90,
  4
FROM dating_style_progress dsp
ON CONFLICT (user_id, scan_type) DO UPDATE SET
  total_attempts = EXCLUDED.total_attempts,
  can_retake_after = EXCLUDED.can_retake_after;

-- Populate initial retake status for all users who completed any scan
INSERT INTO scan_retake_status (
  user_id,
  scan_type,
  total_attempts,
  last_completed_at,
  can_retake_after,
  cooldown_days,
  max_attempts_per_year
)
SELECT DISTINCT
  user_id,
  scan_type,
  1,
  completed_at,
  CASE
    WHEN scan_type = 'emotional-readiness' THEN completed_at + INTERVAL '30 days'
    ELSE completed_at + INTERVAL '90 days'
  END,
  CASE
    WHEN scan_type = 'emotional-readiness' THEN 30
    ELSE 90
  END,
  CASE
    WHEN scan_type = 'emotional-readiness' THEN 12
    ELSE 4
  END
FROM user_scan_history
ON CONFLICT (user_id, scan_type) DO NOTHING;

-- Populate user_scan_progress
INSERT INTO user_scan_progress (
  user_id,
  scans_completed,
  hechtingsstijl_completed,
  dating_style_completed,
  emotional_readiness_completed,
  first_scan_completed_at,
  last_scan_completed_at
)
SELECT
  user_id,
  COUNT(DISTINCT scan_type) as scans_completed,
  BOOL_OR(scan_type = 'hechtingsstijl') as hechtingsstijl_completed,
  BOOL_OR(scan_type = 'dating-style') as dating_style_completed,
  BOOL_OR(scan_type = 'emotional-readiness') as emotional_readiness_completed,
  MIN(completed_at) as first_scan_completed_at,
  MAX(completed_at) as last_scan_completed_at
FROM user_scan_history
GROUP BY user_id
ON CONFLICT (user_id) DO UPDATE SET
  scans_completed = EXCLUDED.scans_completed,
  hechtingsstijl_completed = EXCLUDED.hechtingsstijl_completed,
  dating_style_completed = EXCLUDED.dating_style_completed,
  emotional_readiness_completed = EXCLUDED.emotional_readiness_completed,
  first_scan_completed_at = EXCLUDED.first_scan_completed_at,
  last_scan_completed_at = EXCLUDED.last_scan_completed_at;

-- ============================================================================
-- VERIFICATION QUERIES (commented out - for manual testing)
-- ============================================================================

-- Check migration results
-- SELECT COUNT(*) as total_scans FROM user_scan_history;
-- SELECT scan_type, COUNT(*) as count FROM user_scan_history GROUP BY scan_type;
-- SELECT * FROM get_user_scan_summary(1); -- Replace 1 with actual user_id
-- SELECT * FROM can_user_retake_scan(1, 'hechtingsstijl');

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Scan History System migration completed successfully!';
  RAISE NOTICE 'Tables created: user_scan_history, scan_retake_status, user_scan_progress';
  RAISE NOTICE 'Helper functions: can_user_retake_scan, get_user_scan_summary';
  RAISE NOTICE 'Data migrated from existing assessment tables';
END $$;
