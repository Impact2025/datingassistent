/**
 * API USAGE TRACKING SCHEMA
 * Track AI API usage for cost monitoring and analytics
 * Created: 2025-11-21
 * Author: Analytics & Cost Tracking Specialist
 */

-- Create API usage tracking table
CREATE TABLE IF NOT EXISTS api_usage (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    provider VARCHAR(50) NOT NULL, -- 'openai', 'anthropic', 'google', etc.
    model VARCHAR(100) NOT NULL, -- 'gpt-4', 'claude-3', 'gemini-pro', etc.
    operation VARCHAR(100) NOT NULL, -- 'chat', 'completion', 'embedding', etc.
    tokens_used INTEGER NOT NULL DEFAULT 0,
    tokens_input INTEGER NOT NULL DEFAULT 0,
    tokens_output INTEGER NOT NULL DEFAULT 0,
    cost_cents INTEGER NOT NULL DEFAULT 0, -- Cost in cents (USD)
    request_duration_ms INTEGER, -- Response time in milliseconds
    status_code INTEGER, -- HTTP status code
    error_message TEXT,
    endpoint VARCHAR(200), -- API endpoint used
    request_size_bytes INTEGER, -- Size of request payload
    response_size_bytes INTEGER, -- Size of response payload
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Indexes for performance
    INDEX idx_api_usage_user_id (user_id),
    INDEX idx_api_usage_provider (provider),
    INDEX idx_api_usage_model (model),
    INDEX idx_api_usage_created_at (created_at),
    INDEX idx_api_usage_cost (cost_cents),
    INDEX idx_api_usage_status (status_code),

    -- Composite indexes for common queries
    INDEX idx_api_usage_user_provider (user_id, provider),
    INDEX idx_api_usage_provider_model (provider, model),
    INDEX idx_api_usage_date_range (created_at, provider),
    INDEX idx_api_usage_cost_analysis (provider, model, cost_cents),

    -- Foreign key constraint
    CONSTRAINT fk_api_usage_user_id
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
);

-- Create API cost configuration table
CREATE TABLE IF NOT EXISTS api_cost_config (
    id SERIAL PRIMARY KEY,
    provider VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    cost_per_1k_input_tokens INTEGER NOT NULL, -- Cost in cents per 1000 input tokens
    cost_per_1k_output_tokens INTEGER NOT NULL, -- Cost in cents per 1000 output tokens
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    effective_from TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    effective_until TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    UNIQUE KEY uk_api_cost_provider_model_active (provider, model, is_active),
    INDEX idx_api_cost_provider_model (provider, model),
    INDEX idx_api_cost_active (is_active, effective_from)
);

-- Insert default cost configurations (as of November 2025)
INSERT INTO api_cost_config (provider, model, cost_per_1k_input_tokens, cost_per_1k_output_tokens, currency) VALUES
-- OpenAI models
('openai', 'gpt-4o', 250, 1000, 'USD'), -- $2.50/1k input, $10.00/1k output
('openai', 'gpt-4o-mini', 15, 60, 'USD'), -- $0.15/1k input, $0.60/1k output
('openai', 'gpt-4-turbo', 1000, 3000, 'USD'), -- $10.00/1k input, $30.00/1k output
('openai', 'gpt-4', 3000, 6000, 'USD'), -- $30.00/1k input, $60.00/1k output
('openai', 'gpt-3.5-turbo', 50, 150, 'USD'), -- $0.50/1k input, $1.50/1k output

-- Anthropic models
('anthropic', 'claude-3-5-sonnet-20241022', 300, 1500, 'USD'), -- $3.00/1k input, $15.00/1k output
('anthropic', 'claude-3-5-haiku-20241022', 80, 400, 'USD'), -- $0.80/1k input, $4.00/1k output
('anthropic', 'claude-3-opus-20240229', 1500, 7500, 'USD'), -- $15.00/1k input, $75.00/1k output
('anthropic', 'claude-3-sonnet-20240229', 300, 1500, 'USD'), -- $3.00/1k input, $15.00/1k output
('anthropic', 'claude-3-haiku-20240307', 25, 125, 'USD'), -- $0.25/1k input, $1.25/1k output

-- Google models
('google', 'gemini-1.5-pro', 125, 500, 'USD'), -- $1.25/1k input, $5.00/1k output
('google', 'gemini-1.5-flash', 7, 30, 'USD'), -- $0.07/1k input, $0.30/1k output
('google', 'gemini-1.0-pro', 50, 150, 'USD'), -- $0.50/1k input, $1.50/1k output

-- OpenRouter models (using approximate costs)
('openrouter', 'anthropic/claude-3.5-sonnet', 300, 1500, 'USD'),
('openrouter', 'openai/gpt-4o', 250, 1000, 'USD'),
('openrouter', 'openai/gpt-4o-mini', 15, 60, 'USD'),
('openrouter', 'google/gemini-pro-1.5', 125, 500, 'USD')
ON CONFLICT (provider, model, is_active) DO NOTHING;

-- Create API usage summary table for faster analytics
CREATE TABLE IF NOT EXISTS api_usage_daily_summary (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    provider VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    total_requests INTEGER NOT NULL DEFAULT 0,
    total_tokens INTEGER NOT NULL DEFAULT 0,
    total_input_tokens INTEGER NOT NULL DEFAULT 0,
    total_output_tokens INTEGER NOT NULL DEFAULT 0,
    total_cost_cents INTEGER NOT NULL DEFAULT 0,
    avg_response_time_ms INTEGER,
    error_count INTEGER NOT NULL DEFAULT 0,
    unique_users INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Constraints and indexes
    UNIQUE KEY uk_api_usage_summary_date_provider_model (date, provider, model),
    INDEX idx_api_usage_summary_date (date),
    INDEX idx_api_usage_summary_provider (provider),
    INDEX idx_api_usage_summary_model (model)
);

-- ============================================================================
-- FUNCTIONS FOR API USAGE TRACKING
-- ============================================================================

-- Function to calculate cost for API usage
CREATE OR REPLACE FUNCTION calculate_api_cost(
    p_provider VARCHAR(50),
    p_model VARCHAR(100),
    p_input_tokens INTEGER,
    p_output_tokens INTEGER
)
RETURNS INTEGER AS $$
DECLARE
    cost_config RECORD;
    total_cost INTEGER := 0;
BEGIN
    -- Get the active cost configuration
    SELECT * INTO cost_config
    FROM api_cost_config
    WHERE provider = p_provider
      AND model = p_model
      AND is_active = true
      AND (effective_until IS NULL OR effective_until > CURRENT_TIMESTAMP)
    ORDER BY effective_from DESC
    LIMIT 1;

    IF NOT FOUND THEN
        -- Return 0 if no cost configuration found (will be logged)
        RETURN 0;
    END IF;

    -- Calculate cost: (input_tokens / 1000) * input_cost + (output_tokens / 1000) * output_cost
    total_cost := ROUND(
        (p_input_tokens::DECIMAL / 1000) * cost_config.cost_per_1k_input_tokens +
        (p_output_tokens::DECIMAL / 1000) * cost_config.cost_per_1k_output_tokens
    );

    RETURN total_cost;
END;
$$ LANGUAGE plpgsql;

-- Function to log API usage
CREATE OR REPLACE FUNCTION log_api_usage(
    p_user_id INTEGER DEFAULT NULL,
    p_provider VARCHAR(50),
    p_model VARCHAR(100),
    p_operation VARCHAR(100),
    p_tokens_used INTEGER DEFAULT 0,
    p_tokens_input INTEGER DEFAULT 0,
    p_tokens_output INTEGER DEFAULT 0,
    p_request_duration_ms INTEGER DEFAULT NULL,
    p_status_code INTEGER DEFAULT NULL,
    p_error_message TEXT DEFAULT NULL,
    p_endpoint VARCHAR(200) DEFAULT NULL,
    p_request_size_bytes INTEGER DEFAULT NULL,
    p_response_size_bytes INTEGER DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    usage_id INTEGER;
    calculated_cost INTEGER;
BEGIN
    -- Calculate cost
    calculated_cost := calculate_api_cost(p_provider, p_model, p_tokens_input, p_tokens_output);

    -- Insert usage record
    INSERT INTO api_usage (
        user_id, provider, model, operation, tokens_used, tokens_input, tokens_output,
        cost_cents, request_duration_ms, status_code, error_message, endpoint,
        request_size_bytes, response_size_bytes, ip_address, user_agent
    ) VALUES (
        p_user_id, p_provider, p_model, p_operation, p_tokens_used, p_tokens_input, p_tokens_output,
        calculated_cost, p_request_duration_ms, p_status_code, p_error_message, p_endpoint,
        p_request_size_bytes, p_response_size_bytes, p_ip_address, p_user_agent
    )
    RETURNING id INTO usage_id;

    -- Update daily summary (upsert)
    INSERT INTO api_usage_daily_summary (
        date, provider, model, total_requests, total_tokens,
        total_input_tokens, total_output_tokens, total_cost_cents,
        avg_response_time_ms, error_count, unique_users
    ) VALUES (
        CURRENT_DATE,
        p_provider,
        p_model,
        1,
        p_tokens_used,
        p_tokens_input,
        p_tokens_output,
        calculated_cost,
        CASE WHEN p_request_duration_ms IS NOT NULL THEN p_request_duration_ms ELSE NULL END,
        CASE WHEN p_status_code >= 400 THEN 1 ELSE 0 END,
        CASE WHEN p_user_id IS NOT NULL THEN 1 ELSE 0 END
    )
    ON CONFLICT (date, provider, model)
    DO UPDATE SET
        total_requests = api_usage_daily_summary.total_requests + 1,
        total_tokens = api_usage_daily_summary.total_tokens + EXCLUDED.total_tokens,
        total_input_tokens = api_usage_daily_summary.total_input_tokens + EXCLUDED.total_input_tokens,
        total_output_tokens = api_usage_daily_summary.total_output_tokens + EXCLUDED.total_output_tokens,
        total_cost_cents = api_usage_daily_summary.total_cost_cents + EXCLUDED.total_cost_cents,
        avg_response_time_ms = CASE
            WHEN api_usage_daily_summary.avg_response_time_ms IS NOT NULL AND EXCLUDED.avg_response_time_ms IS NOT NULL
            THEN ROUND((api_usage_daily_summary.avg_response_time_ms + EXCLUDED.avg_response_time_ms) / 2.0)
            ELSE COALESCE(api_usage_daily_summary.avg_response_time_ms, EXCLUDED.avg_response_time_ms)
        END,
        error_count = api_usage_daily_summary.error_count + EXCLUDED.error_count,
        unique_users = api_usage_daily_summary.unique_users + CASE
            WHEN EXCLUDED.unique_users = 1 AND NOT EXISTS (
                SELECT 1 FROM api_usage
                WHERE user_id = p_user_id
                  AND provider = p_provider
                  AND model = p_model
                  AND DATE(created_at) = CURRENT_DATE
                  AND id != usage_id
            ) THEN 1
            ELSE 0
        END,
        updated_at = CURRENT_TIMESTAMP;

    RETURN usage_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEWS FOR ANALYTICS
-- ============================================================================

-- View for API usage analytics
CREATE OR REPLACE VIEW api_usage_analytics AS
SELECT
    DATE_TRUNC('day', au.created_at) as date,
    au.provider,
    au.model,
    COUNT(*) as total_requests,
    SUM(au.tokens_used) as total_tokens,
    SUM(au.tokens_input) as total_input_tokens,
    SUM(au.tokens_output) as total_output_tokens,
    SUM(au.cost_cents) as total_cost_cents,
    ROUND(AVG(au.request_duration_ms)) as avg_response_time_ms,
    COUNT(CASE WHEN au.status_code >= 400 THEN 1 END) as error_count,
    COUNT(DISTINCT au.user_id) as unique_users,
    ROUND(SUM(au.cost_cents)::DECIMAL / 100, 2) as total_cost_usd
FROM api_usage au
WHERE au.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', au.created_at), au.provider, au.model
ORDER BY date DESC, total_cost_cents DESC;

-- View for cost analysis by user
CREATE OR REPLACE VIEW api_cost_by_user AS
SELECT
    au.user_id,
    u.name as user_name,
    u.email as user_email,
    COUNT(*) as total_requests,
    SUM(au.tokens_used) as total_tokens,
    SUM(au.cost_cents) as total_cost_cents,
    ROUND(SUM(au.cost_cents)::DECIMAL / 100, 2) as total_cost_usd,
    MAX(au.created_at) as last_usage,
    COUNT(DISTINCT au.provider) as providers_used,
    COUNT(DISTINCT au.model) as models_used
FROM api_usage au
LEFT JOIN users u ON au.user_id = u.id
WHERE au.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY au.user_id, u.name, u.email
ORDER BY total_cost_cents DESC;

-- View for model performance analysis
CREATE OR REPLACE VIEW api_model_performance AS
SELECT
    provider,
    model,
    COUNT(*) as total_requests,
    ROUND(AVG(request_duration_ms)) as avg_response_time_ms,
    ROUND(AVG(tokens_used)) as avg_tokens_per_request,
    ROUND(SUM(cost_cents)::DECIMAL / SUM(tokens_used) * 1000, 2) as cost_per_1k_tokens,
    COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_count,
    ROUND(
        COUNT(CASE WHEN status_code >= 400 THEN 1 END)::DECIMAL /
        COUNT(*)::DECIMAL * 100, 2
    ) as error_rate_percent,
    MAX(created_at) as last_used
FROM api_usage
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY provider, model
ORDER BY total_requests DESC;

-- ============================================================================
-- CLEANUP FUNCTIONS
-- ============================================================================

-- Function to clean up old API usage data
CREATE OR REPLACE FUNCTION cleanup_api_usage_data()
RETURNS TABLE (
    deleted_records INTEGER,
    deleted_summaries INTEGER
) AS $$
DECLARE
    retention_days INTEGER := 90; -- Keep 90 days of detailed data
    deleted_rec INTEGER := 0;
    deleted_sum INTEGER := 0;
BEGIN
    -- Delete old detailed records
    DELETE FROM api_usage
    WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '1 day' * retention_days;
    GET DIAGNOSTICS deleted_rec = ROW_COUNT;

    -- Delete old summary records (keep 1 year)
    DELETE FROM api_usage_daily_summary
    WHERE date < CURRENT_DATE - INTERVAL '1 year';
    GET DIAGNOSTICS deleted_sum = ROW_COUNT;

    RETURN QUERY SELECT deleted_rec, deleted_sum;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INITIALIZATION
-- ============================================================================

-- Create indexes for better performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_usage_created_at_provider_model
ON api_usage (created_at DESC, provider, model);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_usage_user_cost
ON api_usage (user_id, cost_cents DESC);

-- Log schema creation
DO $$
BEGIN
    PERFORM log_security_event(
        'schema_created',
        'info',
        NULL,
        '127.0.0.1'::INET,
        'Database Migration',
        '{"schema": "api_usage_tracking", "version": "1.0.0", "tables_created": ["api_usage", "api_cost_config", "api_usage_daily_summary"]}'::JSONB
    );
END;
$$;

COMMENT ON TABLE api_usage IS 'Detailed tracking of all AI API usage for cost monitoring and analytics';
COMMENT ON TABLE api_cost_config IS 'Dynamic cost configuration for different AI providers and models';
COMMENT ON TABLE api_usage_daily_summary IS 'Aggregated daily statistics for faster analytics queries';