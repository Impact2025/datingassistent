-- System Monitoring Tables for Production Monitoring
-- These tables track system health, errors, and performance metrics

-- System monitoring events table
CREATE TABLE IF NOT EXISTS system_monitoring (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('error', 'warning', 'info', 'performance')),
    service VARCHAR(100) NOT NULL,
    operation VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    user_id INTEGER REFERENCES users(id),
    severity VARCHAR(10) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_system_monitoring_type (event_type),
    INDEX idx_system_monitoring_service (service),
    INDEX idx_system_monitoring_severity (severity),
    INDEX idx_system_monitoring_created_at (created_at),
    INDEX idx_system_monitoring_user_id (user_id)
);

-- System alerts table for critical issues
CREATE TABLE IF NOT EXISTS system_alerts (
    id SERIAL PRIMARY KEY,
    alert_type VARCHAR(100) NOT NULL,
    severity VARCHAR(10) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP,
    resolved_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_system_alerts_type (alert_type),
    INDEX idx_system_alerts_severity (severity),
    INDEX idx_system_alerts_resolved (resolved),
    INDEX idx_system_alerts_created_at (created_at)
);

-- System health checks table
CREATE TABLE IF NOT EXISTS system_health_checks (
    id SERIAL PRIMARY KEY,
    status VARCHAR(20) NOT NULL CHECK (status IN ('healthy', 'degraded', 'unhealthy')),
    uptime_seconds INTEGER NOT NULL,
    response_time_ms INTEGER NOT NULL,
    error_rate DECIMAL(5,2) NOT NULL,
    active_users INTEGER NOT NULL,
    database_response_time_ms INTEGER,
    memory_usage_mb INTEGER,
    cpu_usage_percent DECIMAL(5,2),
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_system_health_status (status),
    INDEX idx_system_health_checked_at (checked_at)
);

-- Performance metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id SERIAL PRIMARY KEY,
    metric_type VARCHAR(50) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    value DECIMAL(10,4) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    tags JSONB DEFAULT '{}',
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_performance_metrics_type (metric_type),
    INDEX idx_performance_metrics_name (metric_name),
    INDEX idx_performance_metrics_recorded_at (recorded_at)
);

-- Add comments
COMMENT ON TABLE system_monitoring IS 'Tracks all system events, errors, and performance metrics for monitoring';
COMMENT ON TABLE system_alerts IS 'Stores critical system alerts that require immediate attention';
COMMENT ON TABLE system_health_checks IS 'Records periodic health checks of system components';
COMMENT ON TABLE performance_metrics IS 'Stores detailed performance metrics for analysis';

-- Create a view for monitoring dashboard
CREATE OR REPLACE VIEW monitoring_dashboard AS
SELECT
    'events_last_hour' as metric,
    COUNT(*) as value
FROM system_monitoring
WHERE created_at >= NOW() - INTERVAL '1 hour'

UNION ALL

SELECT
    'errors_last_hour' as metric,
    COUNT(*) as value
FROM system_monitoring
WHERE event_type = 'error'
  AND created_at >= NOW() - INTERVAL '1 hour'

UNION ALL

SELECT
    'critical_alerts_unresolved' as metric,
    COUNT(*) as value
FROM system_alerts
WHERE resolved = false
  AND severity = 'critical'

UNION ALL

SELECT
    'avg_response_time_last_hour' as metric,
    COALESCE(AVG((metadata->>'duration')::float), 0) as value
FROM system_monitoring
WHERE event_type = 'performance'
  AND created_at >= NOW() - INTERVAL '1 hour'
  AND metadata->>'duration' IS NOT NULL

UNION ALL

SELECT
    'current_health_status' as metric,
    CASE
        WHEN status = 'healthy' THEN 1
        WHEN status = 'degraded' THEN 2
        WHEN status = 'unhealthy' THEN 3
        ELSE 0
    END as value
FROM system_health_checks
ORDER BY checked_at DESC
LIMIT 1;