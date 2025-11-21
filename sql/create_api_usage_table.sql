-- Create API usage tracking table for admin analytics
-- This table tracks all AI API calls for cost monitoring and analytics

CREATE TABLE IF NOT EXISTS api_usage (
    id SERIAL PRIMARY KEY,
    provider VARCHAR(50) NOT NULL, -- 'openai' or 'anthropic'
    model VARCHAR(100) NOT NULL, -- Model name like 'gpt-4o', 'claude-3-5-sonnet'
    user_id INTEGER REFERENCES users(id),

    -- Token usage
    tokens_used INTEGER NOT NULL DEFAULT 0,
    tokens_input INTEGER NOT NULL DEFAULT 0,
    tokens_output INTEGER NOT NULL DEFAULT 0,

    -- Cost tracking (in cents)
    cost_cents INTEGER NOT NULL DEFAULT 0,

    -- Request metadata
    request_duration_ms INTEGER,
    status_code INTEGER DEFAULT 200,
    endpoint VARCHAR(255),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_usage_provider ON api_usage(provider);
CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON api_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON api_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_provider_created ON api_usage(provider, created_at);

-- Add some sample data for testing
INSERT INTO api_usage (provider, model, user_id, tokens_used, tokens_input, tokens_output, cost_cents, request_duration_ms, status_code, endpoint)
SELECT
    CASE WHEN random() < 0.6 THEN 'openai' ELSE 'anthropic' END,
    CASE
        WHEN random() < 0.4 THEN 'gpt-4o'
        WHEN random() < 0.7 THEN 'gpt-4o-mini'
        ELSE 'claude-3-5-sonnet-20241022'
    END,
    (SELECT id FROM users ORDER BY random() LIMIT 1),
    floor(random() * 2000 + 500)::integer,
    floor(random() * 1000 + 200)::integer,
    floor(random() * 1000 + 300)::integer,
    floor(random() * 50 + 10)::integer,
    floor(random() * 3000 + 500)::integer,
    CASE WHEN random() < 0.95 THEN 200 ELSE 400 + floor(random() * 200)::integer END,
    CASE WHEN random() < 0.5 THEN '/api/chat' ELSE '/api/profile-optimize' END
FROM generate_series(1, 100); -- Generate 100 sample records

COMMENT ON TABLE api_usage IS 'Tracks AI API usage for cost monitoring and admin analytics';
COMMENT ON COLUMN api_usage.cost_cents IS 'Cost in cents (e.g., 150 = $1.50)';
COMMENT ON COLUMN api_usage.tokens_used IS 'Total tokens used (input + output)';
COMMENT ON COLUMN api_usage.request_duration_ms IS 'API request duration in milliseconds';