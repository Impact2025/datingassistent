-- ============================================================================
-- TOOL COMPLETION TRACKING SYSTEM - SPRINT 2 PHASE 3
-- ============================================================================
-- Purpose: Track user progress through coaching tools with persistent storage
-- Version: 1.0
-- Created: November 16, 2025
-- ============================================================================

-- ============================================================================
-- 1. TOOL COMPLETIONS TABLE
-- ============================================================================
-- Tracks individual completion actions for each tool
CREATE TABLE IF NOT EXISTS tool_completions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tool_name VARCHAR(100) NOT NULL,
  action_name VARCHAR(100) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',

  -- Prevent duplicate completions
  UNIQUE(user_id, tool_name, action_name)
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_tool_completions_user_id ON tool_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_tool_completions_tool_name ON tool_completions(tool_name);
CREATE INDEX IF NOT EXISTS idx_tool_completions_user_tool ON tool_completions(user_id, tool_name);
CREATE INDEX IF NOT EXISTS idx_tool_completions_completed_at ON tool_completions(completed_at);

COMMENT ON TABLE tool_completions IS 'Tracks individual completion milestones for each coaching tool';
COMMENT ON COLUMN tool_completions.user_id IS 'Reference to users table';
COMMENT ON COLUMN tool_completions.tool_name IS 'Tool identifier (profiel-coach, foto-advies, chat-coach, gesprek-starter, date-planner)';
COMMENT ON COLUMN tool_completions.action_name IS 'Specific action completed (bio_generated, photo_uploaded, etc)';
COMMENT ON COLUMN tool_completions.metadata IS 'Additional context about completion (scores, timestamps, etc)';

-- ============================================================================
-- 2. TOOL PROGRESS VIEW
-- ============================================================================
-- Aggregated view of user progress per tool
CREATE OR REPLACE VIEW tool_progress AS
SELECT
  user_id,
  tool_name,
  COUNT(DISTINCT action_name) as completed_actions,
  ARRAY_AGG(DISTINCT action_name ORDER BY action_name) as actions_completed,
  MIN(completed_at) as first_completion,
  MAX(completed_at) as last_completion,
  -- Calculate progress percentage based on expected actions per tool
  CASE tool_name
    WHEN 'profiel-coach' THEN (COUNT(DISTINCT action_name)::FLOAT / 3 * 100)
    WHEN 'foto-advies' THEN (COUNT(DISTINCT action_name)::FLOAT / 3 * 100)
    WHEN 'chat-coach' THEN (COUNT(DISTINCT action_name)::FLOAT / 3 * 100)
    WHEN 'gesprek-starter' THEN (COUNT(DISTINCT action_name)::FLOAT / 3 * 100)
    WHEN 'date-planner' THEN (COUNT(DISTINCT action_name)::FLOAT / 3 * 100)
    ELSE 0
  END as progress_percentage
FROM tool_completions
GROUP BY user_id, tool_name;

COMMENT ON VIEW tool_progress IS 'Aggregated progress statistics per user per tool';

-- ============================================================================
-- 3. USER OVERALL PROGRESS VIEW
-- ============================================================================
-- Overall coaching profile completion across all tools
CREATE OR REPLACE VIEW user_coaching_progress AS
SELECT
  user_id,
  COUNT(DISTINCT tool_name) as tools_used,
  COUNT(*) as total_completions,
  ROUND(AVG(progress_percentage), 1) as overall_progress,
  MIN(first_completion) as started_at,
  MAX(last_completion) as last_activity
FROM tool_progress
GROUP BY user_id;

COMMENT ON VIEW user_coaching_progress IS 'Overall coaching profile completion across all 5 tools';

-- ============================================================================
-- 4. HELPER FUNCTIONS
-- ============================================================================

-- Mark an action as completed (upsert)
CREATE OR REPLACE FUNCTION mark_action_completed(
  p_user_id INTEGER,
  p_tool_name VARCHAR(100),
  p_action_name VARCHAR(100),
  p_metadata JSONB DEFAULT '{}'
) RETURNS BOOLEAN AS $$
DECLARE
  v_inserted BOOLEAN;
BEGIN
  INSERT INTO tool_completions (user_id, tool_name, action_name, metadata)
  VALUES (p_user_id, p_tool_name, p_action_name, p_metadata)
  ON CONFLICT (user_id, tool_name, action_name) DO NOTHING
  RETURNING TRUE INTO v_inserted;

  RETURN COALESCE(v_inserted, FALSE);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION mark_action_completed IS 'Marks a specific action as completed for a user (idempotent)';

-- Check if action is completed
CREATE OR REPLACE FUNCTION is_action_completed(
  p_user_id INTEGER,
  p_tool_name VARCHAR(100),
  p_action_name VARCHAR(100)
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM tool_completions
    WHERE user_id = p_user_id
    AND tool_name = p_tool_name
    AND action_name = p_action_name
  );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION is_action_completed IS 'Checks if a specific action has been completed';

-- Get all completed actions for a tool
CREATE OR REPLACE FUNCTION get_tool_completions(
  p_user_id INTEGER,
  p_tool_name VARCHAR(100)
) RETURNS TABLE(
  action_name VARCHAR(100),
  completed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT tc.action_name, tc.completed_at, tc.metadata
  FROM tool_completions tc
  WHERE tc.user_id = p_user_id
  AND tc.tool_name = p_tool_name
  ORDER BY tc.completed_at ASC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_tool_completions IS 'Returns all completed actions for a specific tool';

-- Reset tool progress (for testing/debugging)
CREATE OR REPLACE FUNCTION reset_tool_progress(
  p_user_id INTEGER,
  p_tool_name VARCHAR(100)
) RETURNS INTEGER AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM tool_completions
  WHERE user_id = p_user_id
  AND tool_name = p_tool_name;

  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION reset_tool_progress IS 'Resets all progress for a specific tool (useful for testing)';

-- ============================================================================
-- 5. SAMPLE DATA (for development/testing)
-- ============================================================================

-- Example: Mark some completions for user 87
-- SELECT mark_action_completed(87, 'profiel-coach', 'quiz_completed', '{"questions_answered": 5}');
-- SELECT mark_action_completed(87, 'profiel-coach', 'bio_generated', '{"profiles_generated": 3}');
-- SELECT mark_action_completed(87, 'foto-advies', 'photo_uploaded', '{"file_size": 2048}');

-- Example queries:
-- SELECT * FROM tool_progress WHERE user_id = 87;
-- SELECT * FROM user_coaching_progress WHERE user_id = 87;
-- SELECT * FROM get_tool_completions(87, 'profiel-coach');

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
