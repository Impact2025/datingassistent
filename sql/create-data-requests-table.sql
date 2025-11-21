-- Create data requests table for GDPR compliance
-- Tracks all data export, modification, and deletion requests

CREATE TABLE IF NOT EXISTS data_requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('export', 'delete', 'modify')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  data JSONB, -- Store request details, metadata, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_data_requests_user_id ON data_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_data_requests_type ON data_requests(request_type);
CREATE INDEX IF NOT EXISTS idx_data_requests_status ON data_requests(status);
CREATE INDEX IF NOT EXISTS idx_data_requests_requested_at ON data_requests(requested_at);

-- Add data retention fields to users table if they don't exist
ALTER TABLE users
ADD COLUMN IF NOT EXISTS data_consent JSONB,
ADD COLUMN IF NOT EXISTS data_retention_until DATE;

-- Create a view for admin oversight
CREATE OR REPLACE VIEW data_requests_overview AS
SELECT
  dr.id,
  dr.user_id,
  u.email,
  u.name,
  dr.request_type,
  dr.status,
  dr.requested_at,
  dr.completed_at,
  dr.data
FROM data_requests dr
JOIN users u ON dr.user_id = u.id
ORDER BY dr.requested_at DESC;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT ON data_requests_overview TO your_admin_role;