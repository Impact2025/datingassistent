-- ============================================
-- SPRINT 3: CONTENT DELIVERY SYSTEM
-- Database Schema voor Premium Program Content
-- ============================================

-- ============================================
-- 1. PROGRAM MODULES
-- ============================================
-- Modules binnen een programma (bijv. Module 1: Fundament, Module 2: Actie, etc.)
CREATE TABLE IF NOT EXISTS program_modules (
  id SERIAL PRIMARY KEY,
  program_id INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  module_number INTEGER NOT NULL, -- 1, 2, 3, etc.
  title VARCHAR(255) NOT NULL,
  description TEXT,
  learning_objectives TEXT[], -- Array van leerdoelen

  -- Sequential Unlocking Logic
  unlock_after_module_id INTEGER REFERENCES program_modules(id),
  unlock_immediately BOOLEAN DEFAULT false, -- Module 1 altijd unlocked

  -- Metadata
  estimated_duration_minutes INTEGER,
  icon_emoji VARCHAR(10) DEFAULT '📚',
  cover_image_url TEXT,

  -- Ordering
  display_order INTEGER NOT NULL,
  is_published BOOLEAN DEFAULT true,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(program_id, module_number),
  UNIQUE(program_id, display_order)
);

CREATE INDEX idx_modules_program ON program_modules(program_id);
CREATE INDEX idx_modules_order ON program_modules(program_id, display_order);

-- ============================================
-- 2. LESSONS
-- ============================================
-- Individuele lessen binnen modules
CREATE TABLE IF NOT EXISTS lessons (
  id SERIAL PRIMARY KEY,
  module_id INTEGER NOT NULL REFERENCES program_modules(id) ON DELETE CASCADE,
  lesson_number INTEGER NOT NULL, -- 1, 2, 3, etc. binnen module

  -- Content
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content_type VARCHAR(50) NOT NULL, -- 'video', 'text', 'quiz', 'exercise', 'download'

  -- Video Content (if content_type = 'video')
  video_provider VARCHAR(50), -- 'cloudflare', 'vimeo', 'youtube', 'custom'
  video_id TEXT, -- Provider-specific ID
  video_url TEXT, -- Direct URL
  video_thumbnail_url TEXT,
  duration_seconds INTEGER,

  -- Text Content (if content_type = 'text')
  text_content TEXT,

  -- Quiz/Exercise (if content_type = 'quiz' or 'exercise')
  quiz_data JSONB, -- Flexible JSON structure for quiz questions

  -- Download (if content_type = 'download')
  download_url TEXT,
  download_filename VARCHAR(255),
  download_size_bytes BIGINT,

  -- Transcript (for accessibility)
  transcript TEXT,

  -- Sequential Unlocking
  unlock_after_lesson_id INTEGER REFERENCES lessons(id),
  requires_previous_completion BOOLEAN DEFAULT true,

  -- Metadata
  is_preview BOOLEAN DEFAULT false, -- Free preview lessons
  estimated_duration_minutes INTEGER,
  difficulty_level VARCHAR(50), -- 'beginner', 'intermediate', 'advanced'
  tags TEXT[],

  -- Ordering
  display_order INTEGER NOT NULL,
  is_published BOOLEAN DEFAULT true,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(module_id, lesson_number),
  UNIQUE(module_id, display_order)
);

CREATE INDEX idx_lessons_module ON lessons(module_id);
CREATE INDEX idx_lessons_order ON lessons(module_id, display_order);
CREATE INDEX idx_lessons_type ON lessons(content_type);
CREATE INDEX idx_lessons_preview ON lessons(is_preview) WHERE is_preview = true;

-- ============================================
-- 3. LESSON CONTENT BLOCKS (Advanced)
-- ============================================
-- Flexible content blocks binnen lessons (voor toekomstige uitbreiding)
CREATE TABLE IF NOT EXISTS lesson_content_blocks (
  id SERIAL PRIMARY KEY,
  lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,

  block_type VARCHAR(50) NOT NULL, -- 'paragraph', 'heading', 'video', 'image', 'callout', 'code', 'bullet_list'
  content TEXT,
  metadata JSONB, -- Flexible data per block type

  display_order INTEGER NOT NULL,

  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(lesson_id, display_order)
);

CREATE INDEX idx_blocks_lesson ON lesson_content_blocks(lesson_id, display_order);

-- ============================================
-- 4. USER LESSON PROGRESS
-- ============================================
-- Track gebruiker progress per individuele les
CREATE TABLE IF NOT EXISTS user_lesson_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,

  -- Progress Tracking
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  is_completed BOOLEAN DEFAULT false,

  -- Video Progress (if lesson is video)
  watch_time_seconds INTEGER DEFAULT 0,
  last_position_seconds INTEGER DEFAULT 0, -- Resume point
  watched_percentage INTEGER DEFAULT 0, -- Calculated: (watch_time / duration) * 100

  -- Quiz/Exercise Results (if lesson is quiz/exercise)
  quiz_score INTEGER, -- Percentage score
  quiz_attempts INTEGER DEFAULT 0,
  quiz_passed BOOLEAN DEFAULT false,
  quiz_answers JSONB, -- Store user answers

  -- Engagement Metrics
  time_spent_seconds INTEGER DEFAULT 0,
  revisit_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_user_lesson_progress_user ON user_lesson_progress(user_id);
CREATE INDEX idx_user_lesson_progress_lesson ON user_lesson_progress(lesson_id);
CREATE INDEX idx_user_lesson_progress_completed ON user_lesson_progress(user_id, is_completed);

-- ============================================
-- 5. USER MODULE PROGRESS
-- ============================================
-- Aggregate progress per module (calculated from lessons)
CREATE TABLE IF NOT EXISTS user_module_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  module_id INTEGER NOT NULL REFERENCES program_modules(id) ON DELETE CASCADE,

  -- Progress Tracking
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  is_completed BOOLEAN DEFAULT false,

  -- Calculated Progress
  total_lessons INTEGER DEFAULT 0,
  completed_lessons INTEGER DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0, -- (completed_lessons / total_lessons) * 100

  -- Time Tracking
  total_time_spent_seconds INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, module_id)
);

CREATE INDEX idx_user_module_progress_user ON user_module_progress(user_id);
CREATE INDEX idx_user_module_progress_module ON user_module_progress(module_id);

-- ============================================
-- 6. USER PROGRAM PROGRESS (Overall)
-- ============================================
-- Overall program progress (calculated from modules)
CREATE TABLE IF NOT EXISTS user_program_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  program_id INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,

  -- Progress Tracking
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  is_completed BOOLEAN DEFAULT false,

  -- Calculated Progress
  total_modules INTEGER DEFAULT 0,
  completed_modules INTEGER DEFAULT 0,
  total_lessons INTEGER DEFAULT 0,
  completed_lessons INTEGER DEFAULT 0,
  overall_progress_percentage INTEGER DEFAULT 0,

  -- Current Position
  current_module_id INTEGER REFERENCES program_modules(id),
  current_lesson_id INTEGER REFERENCES lessons(id),

  -- Time Tracking
  total_time_spent_seconds INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP,

  -- Certificate (when completed)
  certificate_issued BOOLEAN DEFAULT false,
  certificate_issued_at TIMESTAMP,
  certificate_url TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, program_id)
);

CREATE INDEX idx_user_program_progress_user ON user_program_progress(user_id);
CREATE INDEX idx_user_program_progress_program ON user_program_progress(program_id);

-- ============================================
-- 7. ACHIEVEMENTS & BADGES
-- ============================================
-- Gamification achievements
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,

  achievement_key VARCHAR(100) UNIQUE NOT NULL, -- 'first_lesson', 'module_1_complete', 'speed_learner'
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon_emoji VARCHAR(10),
  badge_image_url TEXT,

  -- Unlock Criteria
  criteria_type VARCHAR(50), -- 'lesson_count', 'module_complete', 'time_based', 'streak'
  criteria_value INTEGER, -- e.g., 5 lessons, 7 day streak

  points INTEGER DEFAULT 0,
  rarity VARCHAR(50) DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,

  unlocked_at TIMESTAMP DEFAULT NOW(),
  is_viewed BOOLEAN DEFAULT false, -- For "new badge" notifications

  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_viewed ON user_achievements(user_id, is_viewed);

-- ============================================
-- 8. BOOKMARKS & NOTES
-- ============================================
-- Allow users to bookmark lessons and add notes
CREATE TABLE IF NOT EXISTS user_lesson_bookmarks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,

  note TEXT,
  video_timestamp_seconds INTEGER, -- Bookmark at specific timestamp

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_bookmarks_user ON user_lesson_bookmarks(user_id);

-- ============================================
-- 9. HELPER FUNCTIONS
-- ============================================

-- Function to update module progress when lesson is completed
CREATE OR REPLACE FUNCTION update_module_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Only run when lesson is marked as completed
  IF NEW.is_completed = true AND (OLD.is_completed IS NULL OR OLD.is_completed = false) THEN

    -- Get module_id from lesson
    DECLARE
      v_module_id INTEGER;
      v_total_lessons INTEGER;
      v_completed_lessons INTEGER;
      v_progress_percentage INTEGER;
    BEGIN
      SELECT module_id INTO v_module_id FROM lessons WHERE id = NEW.lesson_id;

      -- Count total and completed lessons in module
      SELECT COUNT(*) INTO v_total_lessons
      FROM lessons
      WHERE module_id = v_module_id AND is_published = true;

      SELECT COUNT(*) INTO v_completed_lessons
      FROM user_lesson_progress ulp
      JOIN lessons l ON ulp.lesson_id = l.id
      WHERE l.module_id = v_module_id
        AND ulp.user_id = NEW.user_id
        AND ulp.is_completed = true;

      -- Calculate progress percentage
      v_progress_percentage := ROUND((v_completed_lessons::DECIMAL / v_total_lessons::DECIMAL) * 100);

      -- Update or insert module progress
      INSERT INTO user_module_progress (
        user_id, module_id, total_lessons, completed_lessons,
        progress_percentage, started_at, last_accessed_at,
        is_completed, completed_at
      ) VALUES (
        NEW.user_id, v_module_id, v_total_lessons, v_completed_lessons,
        v_progress_percentage, NOW(), NOW(),
        v_completed_lessons = v_total_lessons,
        CASE WHEN v_completed_lessons = v_total_lessons THEN NOW() ELSE NULL END
      )
      ON CONFLICT (user_id, module_id) DO UPDATE SET
        completed_lessons = v_completed_lessons,
        progress_percentage = v_progress_percentage,
        is_completed = v_completed_lessons = v_total_lessons,
        completed_at = CASE WHEN v_completed_lessons = v_total_lessons THEN NOW() ELSE user_module_progress.completed_at END,
        last_accessed_at = NOW(),
        updated_at = NOW();
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update module progress
DROP TRIGGER IF EXISTS trigger_update_module_progress ON user_lesson_progress;
CREATE TRIGGER trigger_update_module_progress
  AFTER INSERT OR UPDATE ON user_lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_module_progress();

-- ============================================
-- 10. SAMPLE DATA STRUCTURE COMMENT
-- ============================================
/*
Example Program Structure:

Program: "Kickstart" (90 days)
├── Module 1: Dating Fundament (Week 1-2)
│   ├── Lesson 1: Welkom + Mindset (Video 15min)
│   ├── Lesson 2: Jouw Dating DNA Assessment (Quiz)
│   ├── Lesson 3: Profielstrategie Fundamenten (Video 20min)
│   ├── Lesson 4: Oefening: Jouw Unique Value Proposition (Exercise)
│   └── Lesson 5: Actieplan Week 1 (Download PDF)
│
├── Module 2: Profiel Optimalisatie (Week 3-4)
│   ├── Lesson 1: Foto Psychologie (Video 25min)
│   ├── Lesson 2: Bio Writing Formula (Video 18min)
│   ├── Lesson 3: Praktijk: Review je profiel (Exercise)
│   └── ...
│
└── Module 3: Match & Messaging Meesterschap (Week 5-6)
    └── ...

This schema supports this entire structure + progress tracking!
*/

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Content Delivery System schema created successfully!';
  RAISE NOTICE '📚 Ready for: Modules, Lessons, Progress Tracking, Achievements';
  RAISE NOTICE '🎯 Next step: Seed with Kickstart program content';
END $$;
