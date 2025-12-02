-- ============================================
-- KICKSTART 21-DAGEN SCHEMA
-- Wereldklasse dag-voor-dag programma structuur
-- ============================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS user_day_progress CASCADE;
DROP TABLE IF EXISTS program_days CASCADE;
DROP TABLE IF EXISTS program_weeks CASCADE;

-- ============================================
-- 1. PROGRAM WEEKS TABLE
-- ============================================
CREATE TABLE program_weeks (
  id SERIAL PRIMARY KEY,
  program_id INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  week_nummer INTEGER NOT NULL,
  titel VARCHAR(255) NOT NULL,
  thema TEXT NOT NULL,
  kpi TEXT NOT NULL,  -- Key Performance Indicator voor de week
  emoji VARCHAR(10),
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(program_id, week_nummer)
);

-- ============================================
-- 2. PROGRAM DAYS TABLE - Het hart van de content
-- ============================================
CREATE TABLE program_days (
  id SERIAL PRIMARY KEY,
  week_id INTEGER NOT NULL REFERENCES program_weeks(id) ON DELETE CASCADE,
  program_id INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  dag_nummer INTEGER NOT NULL,  -- 1-21
  titel VARCHAR(255) NOT NULL,
  emoji VARCHAR(10),
  dag_type VARCHAR(20) NOT NULL CHECK (dag_type IN ('VIDEO', 'LIVE', 'EXERCISE', 'REVIEW')),
  duur_minuten INTEGER NOT NULL,

  -- AI Tool koppeling
  ai_tool VARCHAR(100),  -- bijv. "AI Foto Check", "Profiel Coach", "IJsbreker Generator"
  ai_tool_slug VARCHAR(100),  -- bijv. "ai-foto-check", "profiel-coach"

  -- Video Content
  video_url VARCHAR(500),
  video_thumbnail VARCHAR(500),
  video_script JSONB,  -- { hook, intro, secties[], opdracht, outro }

  -- Quiz Content
  quiz JSONB,  -- { vragen: [{ vraag, opties[], feedback_correct, feedback_incorrect }] }

  -- Reflectie
  reflectie JSONB,  -- { vraag, doel }

  -- Werkboek
  werkboek JSONB,  -- { titel, stappen[] }

  -- Upsell (alleen dag 21)
  upsell JSONB,  -- { programma, korting_cents, boodschap }

  -- Metadata
  unlock_na_dag INTEGER,  -- Welke dag moet eerst voltooid zijn
  is_preview BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(program_id, dag_nummer)
);

-- ============================================
-- 3. USER DAY PROGRESS TABLE
-- ============================================
CREATE TABLE user_day_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  program_id INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  day_id INTEGER NOT NULL REFERENCES program_days(id) ON DELETE CASCADE,

  -- Progress status
  status VARCHAR(20) DEFAULT 'locked' CHECK (status IN ('locked', 'available', 'in_progress', 'completed')),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,

  -- Video progress
  video_watched_seconds INTEGER DEFAULT 0,
  video_completed BOOLEAN DEFAULT false,

  -- Quiz progress
  quiz_completed BOOLEAN DEFAULT false,
  quiz_score INTEGER,
  quiz_answers JSONB,

  -- Reflectie progress
  reflectie_completed BOOLEAN DEFAULT false,
  reflectie_antwoord TEXT,

  -- Werkboek progress
  werkboek_completed BOOLEAN DEFAULT false,
  werkboek_antwoorden JSONB,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, day_id)
);

-- ============================================
-- 4. USER WEEKLY METRICS (voor KPI tracking)
-- ============================================
CREATE TABLE user_weekly_metrics (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  program_id INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  week_nummer INTEGER NOT NULL,

  -- Meetbare KPIs
  matches_count INTEGER,
  gesprekken_count INTEGER,
  dates_count INTEGER,
  foto_score INTEGER,  -- AI score 0-100
  bio_score INTEGER,   -- AI score 0-100

  -- Notes
  notities TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, program_id, week_nummer)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_program_weeks_program_id ON program_weeks(program_id);
CREATE INDEX idx_program_days_week_id ON program_days(week_id);
CREATE INDEX idx_program_days_program_id ON program_days(program_id);
CREATE INDEX idx_program_days_dag_nummer ON program_days(dag_nummer);
CREATE INDEX idx_user_day_progress_user_id ON user_day_progress(user_id);
CREATE INDEX idx_user_day_progress_day_id ON user_day_progress(day_id);
CREATE INDEX idx_user_day_progress_status ON user_day_progress(status);
CREATE INDEX idx_user_weekly_metrics_user_id ON user_weekly_metrics(user_id);

-- ============================================
-- TRIGGER: Update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_program_days_updated_at
    BEFORE UPDATE ON program_days
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_day_progress_updated_at
    BEFORE UPDATE ON user_day_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT '✅ Kickstart 21-dagen schema aangemaakt!' as status;
