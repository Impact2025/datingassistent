-- Daily Tasks AI Schema
-- Sprint 2 Phase 4 - AI-Powered Daily Tasks

CREATE TABLE IF NOT EXISTS daily_tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,

    -- Task content
    task_title VARCHAR(255) NOT NULL,
    task_description TEXT,
    task_category VARCHAR(50) NOT NULL CHECK (task_category IN ('social', 'practical', 'mindset')),

    -- Progress tracking
    target_value INTEGER NOT NULL DEFAULT 1,
    current_value INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),

    -- AI metadata
    difficulty VARCHAR(20) DEFAULT 'intermediate' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    personalization_reason TEXT,
    journey_day INTEGER NOT NULL,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,

    -- Indexes for performance
    INDEX idx_daily_tasks_user_id (user_id),
    INDEX idx_daily_tasks_status (status),
    INDEX idx_daily_tasks_journey_day (journey_day),
    INDEX idx_daily_tasks_created_at (created_at)
);

-- User engagement tracking table (if not exists)
CREATE TABLE IF NOT EXISTS user_engagement (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,

    -- Engagement metrics
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    journey_day INTEGER NOT NULL DEFAULT 1,
    total_points INTEGER NOT NULL DEFAULT 0,
    completed_tasks INTEGER NOT NULL DEFAULT 0,

    -- Weekly tracking
    weekly_active BOOLEAN NOT NULL DEFAULT false,
    last_activity_date DATE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Unique constraint
    UNIQUE KEY unique_user_engagement (user_id),

    -- Indexes
    INDEX idx_user_engagement_user_id (user_id),
    INDEX idx_user_engagement_streak (current_streak)
);

-- User coaching progress table (if not exists)
CREATE TABLE IF NOT EXISTS user_coaching_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,

    -- Overall progress
    tools_used INTEGER NOT NULL DEFAULT 0,
    total_completions INTEGER NOT NULL DEFAULT 0,
    overall_progress DECIMAL(5,2) NOT NULL DEFAULT 0.00,

    -- Journey tracking
    started_at TIMESTAMP WITH TIME ZONE,
    last_activity TIMESTAMP WITH TIME ZONE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Unique constraint
    UNIQUE KEY unique_user_coaching_progress (user_id),

    -- Indexes
    INDEX idx_user_coaching_progress_user_id (user_id)
);

-- User activity log table (if not exists)
CREATE TABLE IF NOT EXISTS user_activity_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,

    -- Activity details
    activity_type VARCHAR(100) NOT NULL,
    activity_data JSONB,

    -- Points and rewards
    points_earned INTEGER NOT NULL DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Indexes
    INDEX idx_user_activity_log_user_id (user_id),
    INDEX idx_user_activity_log_type (activity_type),
    INDEX idx_user_activity_log_created_at (created_at)
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_daily_tasks_updated_at BEFORE UPDATE ON daily_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_engagement_updated_at BEFORE UPDATE ON user_engagement
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_coaching_progress_updated_at BEFORE UPDATE ON user_coaching_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();