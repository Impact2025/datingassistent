-- Performance optimization: Add database indexes for better query performance
-- Run this after the web vitals table creation

-- Indexes for courses table
CREATE INDEX IF NOT EXISTS idx_courses_is_published ON courses(is_published);
CREATE INDEX IF NOT EXISTS idx_courses_position ON courses(position);
CREATE INDEX IF NOT EXISTS idx_courses_created_at ON courses(created_at DESC);

-- Indexes for course modules
CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_course_modules_position ON course_modules(position);

-- Indexes for course lessons
CREATE INDEX IF NOT EXISTS idx_course_lessons_module_id ON course_lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_position ON course_lessons(position);
CREATE INDEX IF NOT EXISTS idx_course_lessons_lesson_type ON course_lessons(lesson_type);

-- Indexes for forum posts (for search performance)
CREATE INDEX IF NOT EXISTS idx_forum_posts_category_id ON forum_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_user_id ON forum_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at ON forum_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_posts_views ON forum_posts(views DESC);
CREATE INDEX IF NOT EXISTS idx_forum_posts_replies_count ON forum_posts(replies_count DESC);

-- Full-text search index for forum posts
CREATE INDEX IF NOT EXISTS idx_forum_posts_title_content_gin ON forum_posts USING gin(to_tsvector('dutch', title || ' ' || COALESCE(content, '')));

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Indexes for user profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_extended_user_id ON user_profiles_extended(user_id);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_courses_published_position ON courses(is_published, position ASC);
CREATE INDEX IF NOT EXISTS idx_course_modules_course_position ON course_modules(course_id, position ASC);
CREATE INDEX IF NOT EXISTS idx_course_lessons_module_position ON course_lessons(module_id, position ASC);

-- Index for web vitals performance monitoring
CREATE INDEX IF NOT EXISTS idx_web_vitals_timestamp_metric ON web_vitals_metrics(timestamp DESC, metric_name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp_type ON performance_metrics(timestamp DESC, metric_type);