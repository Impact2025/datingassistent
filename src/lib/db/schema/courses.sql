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
    graded_by INTEGER REFERENCES users(id)
);

-- Gebruiker quiz resultaten
CREATE TABLE IF NOT EXISTS user_quiz_results (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id INTEGER NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    answers JSONB, -- Opgeslagen antwoorden
    completed_at TIMESTAMP DEFAULT NOW()
);

-- Indexen voor betere performance
CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_module_id ON course_lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_course_assignments_lesson_id ON course_assignments(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_course_progress_user_id ON user_course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_course_progress_course_id ON user_course_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user_id ON user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_lesson_id ON user_lesson_progress(lesson_id);
