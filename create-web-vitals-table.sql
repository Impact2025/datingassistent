-- Create web vitals metrics table for performance monitoring
CREATE TABLE IF NOT EXISTS web_vitals_metrics (
  id SERIAL PRIMARY KEY,
  metric_name VARCHAR(50) NOT NULL,
  metric_value DECIMAL(10,4) NOT NULL,
  metric_id VARCHAR(100),
  metric_delta DECIMAL(10,4) DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  user_agent TEXT,
  page_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_web_vitals_metric_name ON web_vitals_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_web_vitals_timestamp ON web_vitals_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_web_vitals_page_url ON web_vitals_metrics(page_url);

-- Create performance metrics table for additional performance data
CREATE TABLE IF NOT EXISTS performance_metrics (
  id SERIAL PRIMARY KEY,
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(15,4) NOT NULL,
  metric_type VARCHAR(50),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  user_agent TEXT,
  page_url TEXT,
  additional_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance metrics
CREATE INDEX IF NOT EXISTS idx_performance_metric_name ON performance_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_performance_timestamp ON performance_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_type ON performance_metrics(metric_type);