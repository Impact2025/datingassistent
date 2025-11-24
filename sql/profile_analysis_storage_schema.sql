-- Profile Analysis Storage Schema
-- Stores comprehensive profile analysis results for historical tracking and progress monitoring

CREATE TABLE IF NOT EXISTS profile_analyses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Analysis metadata
    analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    analysis_version VARCHAR(10) DEFAULT '1.0',
    analysis_type VARCHAR(20) DEFAULT 'comprehensive', -- 'comprehensive', 'quick', 'targeted'

    -- Profile data snapshot (for historical comparison)
    profile_data JSONB,

    -- Overall results
    overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),

    -- Category scores (stored as JSON for flexibility)
    category_scores JSONB NOT NULL,

    -- Analysis components
    optimization_suggestions JSONB,
    competitor_analysis JSONB,
    predicted_performance JSONB,

    -- User feedback and actions
    user_feedback TEXT,
    implemented_suggestions JSONB, -- Track which suggestions were implemented
    improvement_score INTEGER CHECK (improvement_score >= 0 AND improvement_score <= 100),

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profile_analyses_user_id ON profile_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_analyses_date ON profile_analyses(analysis_date DESC);
CREATE INDEX IF NOT EXISTS idx_profile_analyses_score ON profile_analyses(overall_score);

-- Profile optimization tracking
CREATE TABLE IF NOT EXISTS profile_optimization_actions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    analysis_id INTEGER REFERENCES profile_analyses(id) ON DELETE CASCADE,

    -- Action details
    action_type VARCHAR(50) NOT NULL, -- 'bio_update', 'photo_add', 'interests_update', etc.
    action_description TEXT NOT NULL,
    priority VARCHAR(10) DEFAULT 'medium', -- 'high', 'medium', 'low'

    -- Implementation tracking
    implemented BOOLEAN DEFAULT FALSE,
    implemented_date TIMESTAMP WITH TIME ZONE,
    effectiveness_score INTEGER CHECK (effectiveness_score >= 0 AND effectiveness_score <= 100),

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for optimization actions
CREATE INDEX IF NOT EXISTS idx_optimization_actions_user_id ON profile_optimization_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_optimization_actions_analysis_id ON profile_optimization_actions(analysis_id);
CREATE INDEX IF NOT EXISTS idx_optimization_actions_implemented ON profile_optimization_actions(implemented);

-- Profile progress milestones
CREATE TABLE IF NOT EXISTS profile_milestones (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    milestone_type VARCHAR(50) NOT NULL, -- 'first_analysis', 'score_80', 'complete_profile', etc.
    milestone_name VARCHAR(100) NOT NULL,
    milestone_description TEXT,

    achieved BOOLEAN DEFAULT FALSE,
    achieved_date TIMESTAMP WITH TIME ZONE,

    -- Associated data
    analysis_score INTEGER,
    profile_completeness INTEGER,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for milestones
CREATE INDEX IF NOT EXISTS idx_profile_milestones_user_id ON profile_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_milestones_achieved ON profile_milestones(achieved);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profile_analyses_updated_at
    BEFORE UPDATE ON profile_analyses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_optimization_actions_updated_at
    BEFORE UPDATE ON profile_optimization_actions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing (optional)
-- INSERT INTO profile_milestones (user_id, milestone_type, milestone_name, milestone_description)
-- VALUES (1, 'first_analysis', 'Eerste Analyse', 'Je eerste profiel analyse voltooid!');

COMMENT ON TABLE profile_analyses IS 'Stores comprehensive profile analysis results for historical tracking';
COMMENT ON TABLE profile_optimization_actions IS 'Tracks implementation of profile optimization suggestions';
COMMENT ON TABLE profile_milestones IS 'User achievements and milestones in profile optimization journey';