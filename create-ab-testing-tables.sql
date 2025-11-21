-- A/B Testing Tables for AI Profile Builder
-- Professional database schema for statistical testing

-- A/B Test Conversions Table
CREATE TABLE IF NOT EXISTS ab_test_conversions (
    id SERIAL PRIMARY KEY,
    test_id VARCHAR(50) NOT NULL,
    variant_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- 'conversion', 'engagement', etc.
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure one conversion per user per test/variant/event combination
    UNIQUE(test_id, variant_id, user_id, event_type)
);

-- Profile Analytics Events Table
CREATE TABLE IF NOT EXISTS profile_analytics_events (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    session_id VARCHAR(100) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profile Quality Scores Table
CREATE TABLE IF NOT EXISTS profile_quality_scores (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    session_id VARCHAR(100) NOT NULL,
    profile_text TEXT NOT NULL,
    quality_metrics JSONB NOT NULL,
    ab_test_variant VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Journey Metrics Table (for caching)
CREATE TABLE IF NOT EXISTS user_journey_metrics (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE NOT NULL,
    metrics JSONB NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ab_test_conversions_test_id ON ab_test_conversions(test_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_conversions_variant_id ON ab_test_conversions(variant_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_conversions_user_id ON ab_test_conversions(user_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_conversions_created_at ON ab_test_conversions(created_at);

CREATE INDEX IF NOT EXISTS idx_profile_analytics_user_id ON profile_analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_analytics_session_id ON profile_analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_profile_analytics_event_type ON profile_analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_profile_analytics_created_at ON profile_analytics_events(created_at);

CREATE INDEX IF NOT EXISTS idx_profile_quality_user_id ON profile_quality_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_quality_session_id ON profile_quality_scores(session_id);
CREATE INDEX IF NOT EXISTS idx_profile_quality_created_at ON profile_quality_scores(created_at);

-- Views for analytics
CREATE OR REPLACE VIEW ab_test_results AS
SELECT
    test_id,
    variant_id,
    COUNT(DISTINCT user_id) as participants,
    COUNT(CASE WHEN event_type = 'conversion' THEN 1 END) as conversions,
    ROUND(
        (COUNT(CASE WHEN event_type = 'conversion' THEN 1 END)::decimal /
         NULLIF(COUNT(DISTINCT user_id), 0)) * 100, 2
    ) as conversion_rate
FROM ab_test_conversions
GROUP BY test_id, variant_id;

CREATE OR REPLACE VIEW profile_analytics_summary AS
SELECT
    DATE(created_at) as date,
    event_type,
    COUNT(*) as event_count,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT session_id) as unique_sessions
FROM profile_analytics_events
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at), event_type
ORDER BY date DESC, event_count DESC;

-- Function to calculate statistical significance
CREATE OR REPLACE FUNCTION calculate_ab_significance(
    conversions_a INTEGER,
    participants_a INTEGER,
    conversions_b INTEGER,
    participants_b INTEGER
) RETURNS DECIMAL AS $$
DECLARE
    rate_a DECIMAL;
    rate_b DECIMAL;
    se DECIMAL;
    z_score DECIMAL;
BEGIN
    -- Avoid division by zero
    IF participants_a = 0 OR participants_b = 0 THEN
        RETURN 0;
    END IF;

    rate_a := conversions_a::DECIMAL / participants_a;
    rate_b := conversions_b::DECIMAL / participants_b;

    -- Pooled standard error
    se := SQRT(
        (rate_a * (1 - rate_a) / participants_a) +
        (rate_b * (1 - rate_b) / participants_b)
    );

    IF se = 0 THEN
        RETURN 100;
    END IF;

    -- Z-score
    z_score := ABS(rate_a - rate_b) / se;

    -- Return confidence level (simplified)
    -- Z-score > 1.96 = 95% confidence, > 2.58 = 99% confidence
    IF z_score > 2.58 THEN
        RETURN 99.0;
    ELSIF z_score > 1.96 THEN
        RETURN 95.0;
    ELSE
        RETURN 0.0;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE ab_test_conversions IS 'Tracks conversions for A/B testing variants';
COMMENT ON TABLE profile_analytics_events IS 'Detailed event tracking for profile builder analytics';
COMMENT ON TABLE profile_quality_scores IS 'Quality metrics for generated profiles';
COMMENT ON TABLE user_journey_metrics IS 'Cached user journey analytics';

COMMENT ON VIEW ab_test_results IS 'Aggregated A/B test results with conversion rates';
COMMENT ON VIEW profile_analytics_summary IS 'Daily summary of profile analytics events';

COMMENT ON FUNCTION calculate_ab_significance IS 'Calculates statistical significance between two A/B test variants';