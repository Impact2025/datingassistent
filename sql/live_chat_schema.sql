-- Live Chat System Database Schema
-- Phase 1: Core Infrastructure

-- =========================================
-- AGENT MANAGEMENT SYSTEM
-- =========================================

-- Agent roles and permissions
CREATE TABLE IF NOT EXISTS chat_agent_roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL, -- admin, senior_agent, agent, junior_agent
  description TEXT,
  permissions JSONB DEFAULT '{}', -- granular permissions
  max_concurrent_chats INTEGER DEFAULT 3,
  priority INTEGER DEFAULT 1, -- for routing decisions
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default roles
INSERT INTO chat_agent_roles (name, description, max_concurrent_chats, priority) VALUES
('admin', 'Full system access, agent management, analytics', 5, 10),
('senior_agent', 'Experienced agent with mentoring capabilities', 4, 8),
('agent', 'Standard customer support agent', 3, 5),
('junior_agent', 'New agent under supervision', 2, 3)
ON CONFLICT (name) DO NOTHING;

-- Agent profiles
CREATE TABLE IF NOT EXISTS chat_agents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role_id INTEGER REFERENCES chat_agent_roles(id) DEFAULT 3, -- default to 'agent'
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  avatar_url VARCHAR(500),
  status VARCHAR(20) DEFAULT 'offline', -- online, offline, busy, away, break
  status_message TEXT,
  department VARCHAR(50) DEFAULT 'general', -- sales, support, technical, billing
  skills TEXT[] DEFAULT '{}', -- ['dating_advice', 'technical', 'billing', 'sales']
  languages TEXT[] DEFAULT '{nl}', -- supported languages
  max_concurrent_chats INTEGER DEFAULT 3,
  total_chats_handled INTEGER DEFAULT 0,
  avg_response_time INTEGER DEFAULT 0, -- in seconds
  satisfaction_score DECIMAL(3,2) DEFAULT 0, -- 0.00 to 5.00
  is_available BOOLEAN DEFAULT FALSE,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent working hours
CREATE TABLE IF NOT EXISTS chat_agent_schedule (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER REFERENCES chat_agents(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL, -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  timezone VARCHAR(50) DEFAULT 'Europe/Amsterdam',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- CONVERSATION MANAGEMENT
-- =========================================

-- Enhanced conversation tracking
CREATE TABLE IF NOT EXISTS chat_conversations (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL UNIQUE,
  channel VARCHAR(20) DEFAULT 'web', -- web, whatsapp, email, phone
  status VARCHAR(20) DEFAULT 'active', -- active, waiting, assigned, closed, transferred
  priority VARCHAR(10) DEFAULT 'normal', -- low, normal, high, urgent
  department VARCHAR(50) DEFAULT 'general',
  category VARCHAR(50), -- auto-detected or manual
  tags TEXT[] DEFAULT '{}',

  -- User information
  user_identifier VARCHAR(255), -- anonymous ID or user ID
  user_name VARCHAR(255),
  user_email VARCHAR(255),
  user_phone VARCHAR(20),
  user_ip VARCHAR(45),
  user_location JSONB, -- city, country, etc.

  -- Agent assignment
  assigned_agent_id INTEGER REFERENCES chat_agents(id),
  assigned_at TIMESTAMPTZ,
  transferred_from_agent_id INTEGER REFERENCES chat_agents(id),
  transfer_reason TEXT,

  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  first_response_at TIMESTAMPTZ,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  total_duration INTERVAL,

  -- Quality metrics
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  user_feedback TEXT,
  resolution_status VARCHAR(20) DEFAULT 'unresolved', -- resolved, unresolved, escalated
  escalated_to VARCHAR(50), -- email, phone, manager

  -- Metadata
  metadata JSONB DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- MESSAGE SYSTEM
-- =========================================

-- Enhanced message storage
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES chat_conversations(id) ON DELETE CASCADE,
  message_id VARCHAR(255) UNIQUE NOT NULL, -- UUID for external reference

  -- Sender information
  sender_type VARCHAR(20) NOT NULL, -- user, agent, system, bot
  sender_id INTEGER, -- agent ID if sender_type = 'agent'
  sender_name VARCHAR(255),
  sender_avatar VARCHAR(500),

  -- Message content
  message_type VARCHAR(20) DEFAULT 'text', -- text, file, image, system, quick_reply
  content TEXT,
  content_html TEXT, -- for rich text messages

  -- File attachments
  file_url VARCHAR(500),
  file_name VARCHAR(255),
  file_size INTEGER,
  file_type VARCHAR(100), -- mime type
  file_thumbnail_url VARCHAR(500),

  -- Message status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMPTZ,

  -- Quick replies and actions
  quick_replies JSONB DEFAULT '[]', -- array of {label, payload}
  actions JSONB DEFAULT '[]', -- buttons, links, etc.

  -- Metadata
  metadata JSONB DEFAULT '{}',
  internal_notes TEXT, -- agent-only notes

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message delivery status
CREATE TABLE IF NOT EXISTS chat_message_status (
  id SERIAL PRIMARY KEY,
  message_id INTEGER REFERENCES chat_messages(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL, -- sent, delivered, read, failed
  error_message TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- REAL-TIME FEATURES
-- =========================================

-- Typing indicators and presence
CREATE TABLE IF NOT EXISTS chat_presence (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES chat_conversations(id) ON DELETE CASCADE,
  user_type VARCHAR(20) NOT NULL, -- user, agent
  user_id INTEGER,
  user_name VARCHAR(255),
  is_typing BOOLEAN DEFAULT FALSE,
  is_online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  current_page VARCHAR(500), -- for user context
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(conversation_id, user_type, user_id)
);

-- =========================================
-- ANALYTICS & REPORTING
-- =========================================

-- Daily conversation metrics
CREATE TABLE IF NOT EXISTS chat_daily_metrics (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  total_conversations INTEGER DEFAULT 0,
  resolved_conversations INTEGER DEFAULT 0,
  avg_response_time INTEGER DEFAULT 0, -- seconds
  avg_resolution_time INTEGER DEFAULT 0, -- seconds
  avg_satisfaction DECIMAL(3,2) DEFAULT 0,
  total_messages INTEGER DEFAULT 0,
  peak_concurrent_chats INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent performance metrics
CREATE TABLE IF NOT EXISTS chat_agent_metrics (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER REFERENCES chat_agents(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  chats_handled INTEGER DEFAULT 0,
  avg_response_time INTEGER DEFAULT 0,
  satisfaction_score DECIMAL(3,2) DEFAULT 0,
  resolution_rate DECIMAL(5,2) DEFAULT 0,
  online_time INTEGER DEFAULT 0, -- minutes
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(agent_id, date)
);

-- =========================================
-- SYSTEM CONFIGURATION
-- =========================================

-- Chat widget settings
CREATE TABLE IF NOT EXISTS chat_widget_config (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default widget configuration
INSERT INTO chat_widget_config (name, config) VALUES
('default', '{
  "position": "bottom-right",
  "primaryColor": "#ec4899",
  "departments": ["general", "sales", "support"],
  "businessHours": {"start": "09:00", "end": "17:00", "timezone": "Europe/Amsterdam"},
  "offlineMessage": "We zijn momenteel offline. Laat je bericht achter!",
  "welcomeMessage": "Hoi! Hoe kunnen we je helpen?",
  "enableFileUpload": true,
  "enableTypingIndicator": true,
  "enableQuickReplies": true,
  "proactiveInvite": {"enabled": false, "delay": 30000, "message": "Kan ik je helpen?"}
}')
ON CONFLICT (name) DO NOTHING;

-- =========================================
-- INDEXES FOR PERFORMANCE
-- =========================================

-- Conversation indexes
CREATE INDEX IF NOT EXISTS idx_chat_conversations_session_id ON chat_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_status ON chat_conversations(status);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_assigned_agent ON chat_conversations(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_started_at ON chat_conversations(started_at);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_last_message ON chat_conversations(last_message_at);

-- Message indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_type, sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Agent indexes
CREATE INDEX IF NOT EXISTS idx_chat_agents_status ON chat_agents(status);
CREATE INDEX IF NOT EXISTS idx_chat_agents_department ON chat_agents(department);
CREATE INDEX IF NOT EXISTS idx_chat_agents_skills ON chat_agents USING GIN(skills);

-- Presence indexes
CREATE INDEX IF NOT EXISTS idx_chat_presence_conversation ON chat_presence(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_presence_typing ON chat_presence(is_typing) WHERE is_typing = true;

-- =========================================
-- TRIGGERS FOR AUTOMATION
-- =========================================

-- Update conversation last_message_at
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_conversations
  SET last_message_at = NEW.created_at,
      updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_last_message
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- Update agent statistics
CREATE OR REPLACE FUNCTION update_agent_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'closed' AND OLD.status != 'closed' THEN
    UPDATE chat_agents
    SET total_chats_handled = total_chats_handled + 1,
        updated_at = NOW()
    WHERE id = NEW.assigned_agent_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_agent_stats
  AFTER UPDATE ON chat_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_stats();

-- =========================================
-- SAMPLE DATA FOR TESTING
-- =========================================

-- Create a sample admin agent (you'll need to adjust the user_id)
-- INSERT INTO chat_agents (user_id, role_id, name, email, department, status)
-- VALUES (1, 1, 'Admin User', 'admin@datingassistent.nl', 'admin', 'online');

-- Sample conversation categories
CREATE TABLE IF NOT EXISTS chat_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  priority INTEGER DEFAULT 5,
  auto_assign_department VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO chat_categories (name, description, auto_assign_department) VALUES
('profiel_hulp', 'Hulp met profiel maken en optimaliseren', 'support'),
('abonnement_vragen', 'Vragen over prijzen en abonnementen', 'sales'),
('technische_problemen', 'Website/app bugs en technische issues', 'technical'),
('dating_advies', 'Algemeen dating advies', 'support'),
('account_problemen', 'Login, wachtwoord, account issues', 'support')
ON CONFLICT (name) DO NOTHING;

-- =========================================
-- CLEANUP & MAINTENANCE
-- =========================================

-- Function to clean old presence data
CREATE OR REPLACE FUNCTION cleanup_old_presence()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM chat_presence
  WHERE last_seen < NOW() - INTERVAL '1 hour';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to archive old conversations
CREATE OR REPLACE FUNCTION archive_old_conversations(days_old INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  UPDATE chat_conversations
  SET status = 'archived'
  WHERE status = 'closed'
    AND closed_at < NOW() - INTERVAL '1 day' * days_old;

  GET DIAGNOSTICS archived_count = ROW_COUNT;
  RETURN archived_count;
END;
$$ LANGUAGE plpgsql;