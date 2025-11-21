-- Create AI cost tracking table for monitoring AI service usage and costs
-- This table tracks all AI operations and their associated costs for billing and monitoring

CREATE TABLE IF NOT EXISTS ai_cost_tracking (
    id SERIAL PRIMARY KEY,
    service VARCHAR(100) NOT NULL, -- e.g., 'openrouter', 'google-gemini', 'anthropic'
    operation VARCHAR(200) NOT NULL, -- e.g., 'chat_completion', 'image_analysis', 'text_generation'
    cost DECIMAL(10,6) NOT NULL DEFAULT 0, -- Cost in euros (e.g., 0.002500)
    tokens INTEGER, -- Number of tokens used (for text models)
    user_id INTEGER REFERENCES users(id), -- User who triggered the operation (nullable for system operations)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Indexes for efficient querying
    INDEX idx_ai_cost_tracking_service (service),
    INDEX idx_ai_cost_tracking_user_id (user_id),
    INDEX idx_ai_cost_tracking_created_at (created_at),
    INDEX idx_ai_cost_tracking_service_created_at (service, created_at)
);

-- Add comment to table
COMMENT ON TABLE ai_cost_tracking IS 'Tracks AI service usage and costs for monitoring and billing purposes';
COMMENT ON COLUMN ai_cost_tracking.service IS 'AI service provider (openrouter, google-gemini, etc.)';
COMMENT ON COLUMN ai_cost_tracking.operation IS 'Specific operation performed (chat_completion, image_analysis, etc.)';
COMMENT ON COLUMN ai_cost_tracking.cost IS 'Cost in euros for this operation';
COMMENT ON COLUMN ai_cost_tracking.tokens IS 'Number of tokens used (for text-based models)';
COMMENT ON COLUMN ai_cost_tracking.user_id IS 'User who triggered this operation (nullable for system operations)';