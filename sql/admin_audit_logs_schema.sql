/**
 * ADMIN AUDIT LOGS SCHEMA
 * Enterprise-grade audit logging for admin actions
 * Created: 2025-11-21
 * Author: Security & Compliance Specialist
 */

-- Create admin audit logs table
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(200) NOT NULL,
    success BOOLEAN NOT NULL DEFAULT false,
    ip_address INET,
    user_agent TEXT,
    details JSONB,
    session_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Indexes for performance and security monitoring
    INDEX idx_admin_audit_user_id (user_id),
    INDEX idx_admin_audit_action (action),
    INDEX idx_admin_audit_resource (resource),
    INDEX idx_admin_audit_created_at (created_at),
    INDEX idx_admin_audit_success (success),
    INDEX idx_admin_audit_ip_address (ip_address),
    INDEX idx_admin_audit_session_id (session_id),

    -- Composite indexes for common queries
    INDEX idx_admin_audit_user_action (user_id, action),
    INDEX idx_admin_audit_resource_success (resource, success),
    INDEX idx_admin_audit_date_range (created_at, success),

    -- Foreign key constraint (optional, depending on user table structure)
    CONSTRAINT fk_admin_audit_user_id
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Create security events table for critical incidents
CREATE TABLE IF NOT EXISTS security_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL, -- 'sql_injection_attempt', 'rate_limit_exceeded', 'suspicious_input', etc.
    severity VARCHAR(20) NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    user_id INTEGER,
    ip_address INET NOT NULL,
    user_agent TEXT,
    details JSONB NOT NULL,
    resolved BOOLEAN NOT NULL DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Indexes
    INDEX idx_security_events_type (event_type),
    INDEX idx_security_events_severity (severity),
    INDEX idx_security_events_ip (ip_address),
    INDEX idx_security_events_created (created_at),
    INDEX idx_security_events_resolved (resolved),

    -- Foreign keys
    CONSTRAINT fk_security_events_user_id
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_security_events_resolved_by
        FOREIGN KEY (resolved_by)
        REFERENCES users(id)
        ON DELETE SET NULL
);

-- Create rate limiting table for distributed rate limiting
CREATE TABLE IF NOT EXISTS rate_limit_entries (
    id SERIAL PRIMARY KEY,
    identifier VARCHAR(255) NOT NULL, -- IP + User Agent hash
    requests_count INTEGER NOT NULL DEFAULT 0,
    window_start TIMESTAMP WITH TIME ZONE NOT NULL,
    window_end TIMESTAMP WITH TIME ZONE NOT NULL,
    blocked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Indexes
    INDEX idx_rate_limit_identifier (identifier),
    INDEX idx_rate_limit_window (window_start, window_end),
    INDEX idx_rate_limit_blocked (blocked_until),

    -- Unique constraint to prevent duplicates
    UNIQUE KEY uk_rate_limit_identifier_window (identifier, window_start)
);

-- Create admin sessions table for session tracking
CREATE TABLE IF NOT EXISTS admin_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    session_token_hash VARCHAR(128) NOT NULL, -- SHA-256 hash of session token
    ip_address INET NOT NULL,
    user_agent TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    terminated BOOLEAN NOT NULL DEFAULT false,
    termination_reason VARCHAR(100),

    -- Indexes
    INDEX idx_admin_sessions_user_id (user_id),
    INDEX idx_admin_sessions_token (session_token_hash),
    INDEX idx_admin_sessions_expires (expires_at),
    INDEX idx_admin_sessions_activity (last_activity),

    -- Foreign key
    CONSTRAINT fk_admin_sessions_user_id
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Create security configuration table
CREATE TABLE IF NOT EXISTS security_config (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value JSONB NOT NULL,
    description TEXT,
    updated_by INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Indexes
    INDEX idx_security_config_key (config_key),

    -- Foreign key
    CONSTRAINT fk_security_config_updated_by
        FOREIGN KEY (updated_by)
        REFERENCES users(id)
        ON DELETE SET NULL
);

-- Insert default security configuration
INSERT INTO security_config (config_key, config_value, description) VALUES
('rate_limiting', '{
  "maxRequestsPerMinute": 30,
  "maxRequestsPerHour": 200,
  "blockDurationMinutes": 15,
  "whitelist": ["127.0.0.1", "::1"]
}', 'Rate limiting configuration for admin endpoints'),
('input_validation', '{
  "maxStringLength": 10000,
  "maxArrayLength": 1000,
  "maxObjectDepth": 10,
  "suspiciousKeywords": ["script", "javascript:", "onload", "eval", "function"],
  "sqlKeywords": ["union", "select", "insert", "update", "delete", "drop", "alter"]
}', 'Input validation rules and patterns'),
('audit_retention', '{
  "adminAuditLogsDays": 730,
  "securityEventsDays": 1095,
  "rateLimitEntriesHours": 24,
  "adminSessionsDays": 30
}', 'Data retention policies for security logs'),
('authentication', '{
  "sessionTimeoutMinutes": 480,
  "maxLoginAttempts": 5,
  "lockoutDurationMinutes": 30,
  "passwordMinLength": 8,
  "requireSpecialChars": true,
  "requireNumbers": true,
  "requireUppercase": true
}', 'Authentication and session management settings')
ON CONFLICT (config_key) DO NOTHING;

-- ============================================================================
-- STORED PROCEDURES FOR SECURITY OPERATIONS
-- ============================================================================

-- Function to clean up old audit logs based on retention policy
CREATE OR REPLACE FUNCTION cleanup_security_logs()
RETURNS TABLE (
    admin_audit_deleted INTEGER,
    security_events_deleted INTEGER,
    rate_limit_deleted INTEGER,
    sessions_deleted INTEGER
) AS $$
DECLARE
    admin_audit_days INTEGER;
    security_events_days INTEGER;
    rate_limit_hours INTEGER;
    sessions_days INTEGER;
    cutoff_admin TIMESTAMP WITH TIME ZONE;
    cutoff_security TIMESTAMP WITH TIME ZONE;
    cutoff_rate_limit TIMESTAMP WITH TIME ZONE;
    cutoff_sessions TIMESTAMP WITH TIME ZONE;
    deleted_admin INTEGER := 0;
    deleted_security INTEGER := 0;
    deleted_rate_limit INTEGER := 0;
    deleted_sessions INTEGER := 0;
BEGIN
    -- Get retention settings
    SELECT (config_value->>'adminAuditLogsDays')::INTEGER INTO admin_audit_days
    FROM security_config WHERE config_key = 'audit_retention';

    SELECT (config_value->>'securityEventsDays')::INTEGER INTO security_events_days
    FROM security_config WHERE config_key = 'audit_retention';

    SELECT (config_value->>'rateLimitEntriesHours')::INTEGER INTO rate_limit_hours
    FROM security_config WHERE config_key = 'audit_retention';

    SELECT (config_value->>'adminSessionsDays')::INTEGER INTO sessions_days
    FROM security_config WHERE config_key = 'audit_retention';

    -- Set defaults if not configured
    admin_audit_days := COALESCE(admin_audit_days, 730);
    security_events_days := COALESCE(security_events_days, 1095);
    rate_limit_hours := COALESCE(rate_limit_hours, 24);
    sessions_days := COALESCE(sessions_days, 30);

    -- Calculate cutoff dates
    cutoff_admin := CURRENT_TIMESTAMP - INTERVAL '1 day' * admin_audit_days;
    cutoff_security := CURRENT_TIMESTAMP - INTERVAL '1 day' * security_events_days;
    cutoff_rate_limit := CURRENT_TIMESTAMP - INTERVAL '1 hour' * rate_limit_hours;
    cutoff_sessions := CURRENT_TIMESTAMP - INTERVAL '1 day' * sessions_days;

    -- Delete old records
    DELETE FROM admin_audit_logs WHERE created_at < cutoff_admin;
    GET DIAGNOSTICS deleted_admin = ROW_COUNT;

    DELETE FROM security_events WHERE created_at < cutoff_security;
    GET DIAGNOSTICS deleted_security = ROW_COUNT;

    DELETE FROM rate_limit_entries WHERE created_at < cutoff_rate_limit;
    GET DIAGNOSTICS deleted_rate_limit = ROW_COUNT;

    DELETE FROM admin_sessions WHERE started_at < cutoff_sessions;
    GET DIAGNOSTICS deleted_sessions = ROW_COUNT;

    -- Return results
    RETURN QUERY SELECT deleted_admin, deleted_security, deleted_rate_limit, deleted_sessions;
END;
$$ LANGUAGE plpgsql;

-- Function to check and update rate limiting
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_identifier VARCHAR(255),
    p_max_requests INTEGER,
    p_window_minutes INTEGER,
    p_block_duration_minutes INTEGER DEFAULT 15
)
RETURNS TABLE (
    allowed BOOLEAN,
    requests_remaining INTEGER,
    reset_time TIMESTAMP WITH TIME ZONE,
    blocked_until TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    window_start TIMESTAMP WITH TIME ZONE;
    window_end TIMESTAMP WITH TIME ZONE;
    current_count INTEGER;
    blocked_until TIMESTAMP WITH TIME ZONE;
BEGIN
    window_start := CURRENT_TIMESTAMP - INTERVAL '1 minute' * p_window_minutes;
    window_end := CURRENT_TIMESTAMP + INTERVAL '1 minute' * p_window_minutes;

    -- Check if currently blocked
    SELECT rle.blocked_until INTO blocked_until
    FROM rate_limit_entries rle
    WHERE rle.identifier = p_identifier
      AND rle.blocked_until > CURRENT_TIMESTAMP
    ORDER BY rle.created_at DESC
    LIMIT 1;

    IF blocked_until IS NOT NULL THEN
        RETURN QUERY SELECT false, 0, window_end, blocked_until;
        RETURN;
    END IF;

    -- Get current request count for the window
    SELECT COALESCE(SUM(rle.requests_count), 0) INTO current_count
    FROM rate_limit_entries rle
    WHERE rle.identifier = p_identifier
      AND rle.window_start <= CURRENT_TIMESTAMP
      AND rle.window_end > CURRENT_TIMESTAMP;

    -- Check if limit exceeded
    IF current_count >= p_max_requests THEN
        -- Block the identifier
        blocked_until := CURRENT_TIMESTAMP + INTERVAL '1 minute' * p_block_duration_minutes;

        INSERT INTO rate_limit_entries (
            identifier, requests_count, window_start, window_end, blocked_until
        ) VALUES (
            p_identifier, p_max_requests + 1, window_start, window_end, blocked_until
        )
        ON CONFLICT (identifier, window_start)
        DO UPDATE SET
            requests_count = EXCLUDED.requests_count,
            blocked_until = EXCLUDED.blocked_until,
            updated_at = CURRENT_TIMESTAMP;

        RETURN QUERY SELECT false, 0, window_end, blocked_until;
        RETURN;
    END IF;

    -- Update or insert request count
    INSERT INTO rate_limit_entries (
        identifier, requests_count, window_start, window_end
    ) VALUES (
        p_identifier, 1, window_start, window_end
    )
    ON CONFLICT (identifier, window_start)
    DO UPDATE SET
        requests_count = rate_limit_entries.requests_count + 1,
        updated_at = CURRENT_TIMESTAMP;

    RETURN QUERY SELECT
        true,
        p_max_requests - current_count - 1,
        window_end,
        NULL::TIMESTAMP WITH TIME ZONE;
END;
$$ LANGUAGE plpgsql;

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
    p_event_type VARCHAR(50),
    p_severity VARCHAR(20),
    p_user_id INTEGER DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_details JSONB DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    event_id INTEGER;
BEGIN
    INSERT INTO security_events (
        event_type, severity, user_id, ip_address, user_agent, details
    ) VALUES (
        p_event_type, p_severity, p_user_id, p_ip_address, p_user_agent, p_details
    )
    RETURNING id INTO event_id;

    -- Log critical events to PostgreSQL log
    IF p_severity IN ('high', 'critical') THEN
        RAISE LOG 'SECURITY EVENT [%] [%]: %', p_severity, p_event_type,
               CASE WHEN p_details IS NOT NULL THEN p_details::TEXT ELSE 'No details' END;
    END IF;

    RETURN event_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEWS FOR SECURITY MONITORING
-- ============================================================================

-- View for security dashboard
CREATE OR REPLACE VIEW security_dashboard AS
SELECT
    'total_admin_actions' as metric,
    COUNT(*) as value,
    'count' as unit
FROM admin_audit_logs
WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'

UNION ALL

SELECT
    'failed_actions' as metric,
    COUNT(*) as value,
    'count' as unit
FROM admin_audit_logs
WHERE success = false
  AND created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'

UNION ALL

SELECT
    'security_events_today' as metric,
    COUNT(*) as value,
    'count' as unit
FROM security_events
WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'

UNION ALL

SELECT
    'blocked_requests' as metric,
    COUNT(*) as value,
    'count' as unit
FROM rate_limit_entries
WHERE blocked_until > CURRENT_TIMESTAMP

UNION ALL

SELECT
    'active_admin_sessions' as metric,
    COUNT(*) as value,
    'count' as unit
FROM admin_sessions
WHERE expires_at > CURRENT_TIMESTAMP
  AND terminated = false;

-- View for suspicious activity monitoring
CREATE OR REPLACE VIEW suspicious_activity AS
SELECT
    se.*,
    u.email as user_email,
    u.name as user_name
FROM security_events se
LEFT JOIN users u ON se.user_id = u.id
WHERE se.created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
ORDER BY se.created_at DESC;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Additional performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_admin_audit_logs_composite_search
ON admin_audit_logs (user_id, action, success, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_events_composite_search
ON security_events (event_type, severity, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rate_limit_entries_cleanup
ON rate_limit_entries (created_at) WHERE blocked_until IS NULL OR blocked_until < CURRENT_TIMESTAMP;

-- ============================================================================
-- PERMISSIONS AND SECURITY
-- ============================================================================

-- Grant minimal permissions to application user
-- Note: This should be customized based on your database user setup

-- REVOKE ALL ON admin_audit_logs FROM PUBLIC;
-- REVOKE ALL ON security_events FROM PUBLIC;
-- REVOKE ALL ON rate_limit_entries FROM PUBLIC;
-- REVOKE ALL ON admin_sessions FROM PUBLIC;
-- REVOKE ALL ON security_config FROM PUBLIC;

-- GRANT SELECT, INSERT ON admin_audit_logs TO app_user;
-- GRANT SELECT, INSERT ON security_events TO app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON rate_limit_entries TO app_user;
-- GRANT SELECT, INSERT, UPDATE ON admin_sessions TO app_user;
-- GRANT SELECT ON security_config TO app_user;
-- GRANT UPDATE ON security_config TO admin_user;

-- ============================================================================
-- MAINTENANCE JOBS
-- ============================================================================

-- Create a scheduled job to clean up old security logs (run daily)
-- Note: This requires pg_cron extension or external scheduling

-- SELECT cron.schedule('cleanup-security-logs', '0 2 * * *', 'SELECT cleanup_security_logs();');

-- ============================================================================
-- INITIALIZATION COMPLETE
-- ============================================================================

-- Log schema creation
DO $$
BEGIN
    PERFORM log_security_event(
        'schema_created',
        'info',
        NULL,
        '127.0.0.1'::INET,
        'Database Migration',
        '{"schema": "admin_audit_logs", "version": "1.0.0", "tables_created": ["admin_audit_logs", "security_events", "rate_limit_entries", "admin_sessions", "security_config"]}'::JSONB
    );
END;
$$;

COMMENT ON TABLE admin_audit_logs IS 'Enterprise audit logging for all admin actions with compliance support';
COMMENT ON TABLE security_events IS 'Critical security events and incidents tracking';
COMMENT ON TABLE rate_limit_entries IS 'Distributed rate limiting with blocking capabilities';
COMMENT ON TABLE admin_sessions IS 'Admin session tracking for security monitoring';
COMMENT ON TABLE security_config IS 'Dynamic security configuration management';