-- ============================================================================
-- COURSE SYSTEM DATABASE MIGRATION - PRO PHASE 1
-- ============================================================================
-- Purpose: Ensure all course-related tables exist for PRO implementation
-- Version: 1.0
-- Created: November 17, 2025
-- ============================================================================

-- Cursussen tabel
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    is_published BOOLEAN DEFAULT false,
    price DECIMAL(10, 2) DEFAULT 0,
    is_free BOOLEAN DEFAULT false,
    level VARCHAR(50) DEFAULT 'beginner', -- beginner, intermediate, advanced
    duration_hours INTEGER DEFAULT 0,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Modules tabel (hoofdstukken binnen een cursus)
CREATE TABLE IF NOT EXISTS course_modules (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT, -- URL naar afbeelding voor de module
    video_url TEXT, -- URL naar video voor de module
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Lessen tabel (individuele lessen binnen een module)
CREATE TABLE IF NOT EXISTS course_lessons (
    id SERIAL PRIMARY KEY,
    module_id INTEGER NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT, -- Tekstuele inhoud van de les
    lesson_type VARCHAR(50) DEFAULT 'video', -- video, text, quiz, assignment
    image_url TEXT, -- URL naar afbeelding voor de les
    video_url TEXT, -- URL naar video (YouTube, Vimeo, etc.)
    video_duration INTEGER, -- Duur in seconden
    is_preview BOOLEAN DEFAULT false, -- Gratis preview beschikbaar?
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Opdrachten tabel
CREATE TABLE IF NOT EXISTS course_assignments (
    id SERIAL PRIMARY KEY,
    lesson_id INTEGER NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    instructions TEXT,
    submission_type VARCHAR(50) DEFAULT 'text', -- text, file, url
    max_points INTEGER DEFAULT 100,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Quiz vragen tabel
CREATE TABLE IF NOT EXISTS course_quiz_questions (
    id SERIAL PRIMARY KEY,
    lesson_id INTEGER NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    question_type VARCHAR(50) DEFAULT 'multiple_choice', -- multiple_choice, true_false, short_answer
    position INTEGER DEFAULT 0,
    points INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Quiz antwoord opties (voor multiple choice)
CREATE TABLE IF NOT EXISTS course_quiz_options (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL REFERENCES course_quiz_questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    position INTEGER DEFAULT 0
);

-- Gebruiker cursus voortgang
CREATE TABLE IF NOT EXISTS user_course_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    progress_percentage INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- Gebruiker les voortgang
CREATE TABLE IF NOT EXISTS user_lesson_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id INTEGER NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP,
    watch_time_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- Gebruiker opdracht inzendingen
CREATE TABLE IF NOT EXISTS user_assignment_submissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assignment_id INTEGER NOT NULL REFERENCES course_assignments(id) ON DELETE CASCADE,
    submission_text TEXT,
    submission_url TEXT,
    submission_file_url TEXT,
    score INTEGER,
    feedback TEXT,
    submitted_at TIMESTAMP DEFAULT NOW(),
    graded_at TIMESTAMP,
    graded_by INTEGER REFERENCES users(id),
    UNIQUE(user_id, assignment_id)
);

-- Gebruiker quiz resultaten
CREATE TABLE IF NOT EXISTS user_quiz_results (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id INTEGER NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    answers JSONB, -- Opgeslagen antwoorden
    completed_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- Course completion achievements
CREATE TABLE IF NOT EXISTS course_achievements (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    achievement_type VARCHAR(50) NOT NULL, -- 'completion', 'perfect_score', 'speed_run', etc.
    title VARCHAR(255) NOT NULL,
    description TEXT,
    badge_icon VARCHAR(50),
    criteria JSONB NOT NULL, -- Achievement requirements
    points_value INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User achievement unlocks
CREATE TABLE IF NOT EXISTS user_course_achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id INTEGER NOT NULL REFERENCES course_achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Course certificates
CREATE TABLE IF NOT EXISTS course_certificates (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    issued_at TIMESTAMP DEFAULT NOW(),
    pdf_url TEXT,
    is_downloaded BOOLEAN DEFAULT false,
    UNIQUE(user_id, course_id)
);

-- Email notifications for course events
CREATE TABLE IF NOT EXISTS course_email_sends (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
    email_type VARCHAR(50) NOT NULL, -- 'enrolled', 'completed', 'certificate_ready', 'reminder'
    sent_at TIMESTAMP DEFAULT NOW(),
    opened_at TIMESTAMP,
    clicked_at TIMESTAMP
);

-- ============================================================================
-- INDEXES VOOR PERFORMANCE
-- ============================================================================

-- Core course indexes
CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_module_id ON course_lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_course_assignments_lesson_id ON course_assignments(lesson_id);
CREATE INDEX IF NOT EXISTS idx_course_quiz_questions_lesson_id ON course_quiz_questions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_course_quiz_options_question_id ON course_quiz_options(question_id);

-- User progress indexes
CREATE INDEX IF NOT EXISTS idx_user_course_progress_user_id ON user_course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_course_progress_course_id ON user_course_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user_id ON user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_lesson_id ON user_lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_assignment_submissions_user_id ON user_assignment_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_assignment_submissions_assignment_id ON user_assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_results_user_id ON user_quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_results_lesson_id ON user_quiz_results(lesson_id);

-- Achievement indexes
CREATE INDEX IF NOT EXISTS idx_course_achievements_course_id ON course_achievements(course_id);
CREATE INDEX IF NOT EXISTS idx_user_course_achievements_user_id ON user_course_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_course_achievements_achievement_id ON user_course_achievements(achievement_id);

-- Certificate indexes
CREATE INDEX IF NOT EXISTS idx_course_certificates_user_id ON course_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_course_certificates_course_id ON course_certificates(course_id);
CREATE INDEX IF NOT EXISTS idx_course_certificates_number ON course_certificates(certificate_number);

-- Email tracking indexes
CREATE INDEX IF NOT EXISTS idx_course_email_sends_user_id ON course_email_sends(user_id);
CREATE INDEX IF NOT EXISTS idx_course_email_sends_course_id ON course_email_sends(course_id);
CREATE INDEX IF NOT EXISTS idx_course_email_sends_type ON course_email_sends(email_type);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to calculate course progress
CREATE OR REPLACE FUNCTION calculate_course_progress(p_user_id INTEGER, p_course_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
    total_lessons INTEGER;
    completed_lessons INTEGER;
    progress_percentage INTEGER;
BEGIN
    -- Count total lessons in course
    SELECT COUNT(*) INTO total_lessons
    FROM course_lessons cl
    JOIN course_modules cm ON cl.module_id = cm.id
    WHERE cm.course_id = p_course_id;

    -- Count completed lessons for user
    SELECT COUNT(*) INTO completed_lessons
    FROM user_lesson_progress ulp
    JOIN course_lessons cl ON ulp.lesson_id = cl.id
    JOIN course_modules cm ON cl.module_id = cm.id
    WHERE ulp.user_id = p_user_id
    AND cm.course_id = p_course_id
    AND ulp.is_completed = true;

    -- Calculate percentage
    IF total_lessons = 0 THEN
        progress_percentage := 0;
    ELSE
        progress_percentage := ROUND((completed_lessons::DECIMAL / total_lessons::DECIMAL) * 100);
    END IF;

    RETURN progress_percentage;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user is enrolled in course
CREATE OR REPLACE FUNCTION is_user_enrolled(p_user_id INTEGER, p_course_id INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1 FROM user_course_progress
        WHERE user_id = p_user_id AND course_id = p_course_id
    );
END;
$$ LANGUAGE plpgsql;

-- Function to auto-update course progress
CREATE OR REPLACE FUNCTION update_course_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- Update course progress when lesson progress changes
    UPDATE user_course_progress
    SET progress_percentage = calculate_course_progress(NEW.user_id, (
        SELECT cm.course_id
        FROM course_lessons cl
        JOIN course_modules cm ON cl.module_id = cm.id
        WHERE cl.id = NEW.lesson_id
    )),
    last_accessed_at = NOW(),
    updated_at = NOW()
    WHERE user_id = NEW.user_id
    AND course_id = (
        SELECT cm.course_id
        FROM course_lessons cl
        JOIN course_modules cm ON cl.module_id = cm.id
        WHERE cl.id = NEW.lesson_id
    );

    -- Check for course completion
    IF calculate_course_progress(NEW.user_id, (
        SELECT cm.course_id
        FROM course_lessons cl
        JOIN course_modules cm ON cl.module_id = cm.id
        WHERE cl.id = NEW.lesson_id
    )) = 100 THEN
        UPDATE user_course_progress
        SET completed_at = NOW()
        WHERE user_id = NEW.user_id
        AND course_id = (
            SELECT cm.course_id
            FROM course_lessons cl
            JOIN course_modules cm ON cl.module_id = cm.id
            WHERE cl.id = NEW.lesson_id
        )
        AND completed_at IS NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic progress updates
DROP TRIGGER IF EXISTS trigger_update_course_progress ON user_lesson_progress;
CREATE TRIGGER trigger_update_course_progress
    AFTER INSERT OR UPDATE ON user_lesson_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_course_progress();

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE 'Course system database migration completed successfully at %', NOW();
END $$;