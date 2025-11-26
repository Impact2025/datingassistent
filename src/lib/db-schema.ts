import { sql } from '@vercel/postgres';

/**
 * Database schema initialization
 * Run this to create all necessary tables
 */
export async function initializeDatabase() {
  try {
    // Users table - main user authentication and data
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        display_name VARCHAR(255),
        profile JSONB,
        subscription JSONB,
        subscription_type VARCHAR(50) DEFAULT 'free',
        subscription_status VARCHAR(50) DEFAULT 'inactive',
        subscription_start_date TIMESTAMP,
        subscription_end_date TIMESTAMP,
        email_verified BOOLEAN DEFAULT false,
        verification_token VARCHAR(255),
        verification_expires_at TIMESTAMP,
        verification_code VARCHAR(6),
        code_expires_at TIMESTAMP,
        code_attempts INTEGER DEFAULT 0,
        trial_status VARCHAR(20) DEFAULT 'none', -- 'none', 'active', 'expired', 'converted'
        trial_start_date TIMESTAMP,
        trial_end_date TIMESTAMP,
        trial_day INTEGER DEFAULT 0, -- 1, 2, or 3
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      )
    `;

    // User profiles table - dating profile information
    await sql`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255),
        age INTEGER,
        gender VARCHAR(50),
        looking_for VARCHAR(50),
        interests JSONB DEFAULT '[]'::jsonb,
        bio TEXT,
        location VARCHAR(255),
        dating_goals TEXT,
        photos TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Conversations table - store chat history
    await sql`
      CREATE TABLE IF NOT EXISTS conversations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        conversation_type VARCHAR(50), -- 'coach', 'profile_advice', etc.
        title VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Messages table - individual messages in conversations
    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
        role VARCHAR(50), -- 'user' or 'assistant'
        content TEXT NOT NULL,
        metadata JSONB, -- for storing additional data
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Photo analysis table - store photo feedback history
    await sql`
      CREATE TABLE IF NOT EXISTS photo_analyses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        photo_url TEXT,
        analysis_result JSONB,
        score INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Usage tracking table - track API usage per user
    await sql`
      CREATE TABLE IF NOT EXISTS usage_tracking (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        feature_type VARCHAR(100), -- 'chat', 'photo_analysis', 'profile_review', etc.
        tokens_used INTEGER DEFAULT 0,
        cost DECIMAL(10, 6) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Subscription history table
    await sql`
      CREATE TABLE IF NOT EXISTS subscription_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        subscription_type VARCHAR(50),
        payment_id VARCHAR(255),
        payment_provider VARCHAR(50),
        amount DECIMAL(10, 2),
        currency VARCHAR(10),
        status VARCHAR(50),
        started_at TIMESTAMP,
        ended_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Blog posts table
    await sql`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(500) NOT NULL,
        excerpt TEXT,
        content TEXT NOT NULL,
        featured_image TEXT,
        author VARCHAR(255),
        published BOOLEAN DEFAULT false,
        published_at TIMESTAMP,
        seo_title VARCHAR(255),
        seo_description TEXT,
        keywords TEXT[],
        view_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Reviews table
    await sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(255),
        content TEXT NOT NULL,
        avatar TEXT,
        rating INTEGER DEFAULT 5,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Orders table - payment orders
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(255) PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        package_type VARCHAR(50),
        billing_period VARCHAR(50),
        amount DECIMAL(10, 2),
        currency VARCHAR(10) DEFAULT 'EUR',
        status VARCHAR(50),
        payment_provider VARCHAR(50),
        linked_to_user BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Password reset tokens table
    await sql`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Coupons table - for discount codes
    await sql`
      CREATE TABLE IF NOT EXISTS coupons (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        package_type VARCHAR(50) NOT NULL,
        discount_type VARCHAR(20) NOT NULL, -- 'percentage' or 'fixed'
        discount_value DECIMAL(10, 2) NOT NULL,
        max_uses INTEGER,
        used_count INTEGER DEFAULT 0,
        valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        valid_until TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Coupon usage table - tracks which users have used which coupons
    await sql`
      CREATE TABLE IF NOT EXISTS coupon_usage (
        id SERIAL PRIMARY KEY,
        coupon_id INTEGER REFERENCES coupons(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        order_id VARCHAR(255), -- Reference to the order where coupon was used
        used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(coupon_id, user_id) -- One use per user per coupon
      )
    `;

    // Podcasts table - for storing podcast information
    await sql`
      CREATE TABLE IF NOT EXISTS podcasts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        file_url TEXT NOT NULL,
        file_size INTEGER,
        duration INTEGER, -- in seconds
        published BOOLEAN DEFAULT false,
        published_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Coupons table - for discount codes
    await sql`
      CREATE TABLE IF NOT EXISTS coupons (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        package_type VARCHAR(50) NOT NULL, -- 'sociaal', 'core', 'pro', 'premium'
        discount_type VARCHAR(20) NOT NULL, -- 'percentage' or 'fixed'
        discount_value DECIMAL(10, 2) NOT NULL,
        max_uses INTEGER,
        used_count INTEGER DEFAULT 0,
        valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        valid_until TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // User behavior table - for tracking user interactions for recommendations
    await sql`
      CREATE TABLE IF NOT EXISTS user_behavior (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        module_id INTEGER, -- REFERENCES modules(id) ON DELETE SET NULL,
        course_id INTEGER, -- REFERENCES courses(id) ON DELETE SET NULL,
        action VARCHAR(20) NOT NULL, -- 'view', 'start', 'complete', 'bookmark', 'skip'
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // User profiles table - extended for community features
    await sql`
      CREATE TABLE IF NOT EXISTS user_profiles_extended (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        bio TEXT,
        location VARCHAR(255),
        interests TEXT[],
        profile_picture_url TEXT,
        cover_photo_url TEXT,
        join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reputation_points INTEGER DEFAULT 0,
        badges JSONB, -- Store earned badges as JSON
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Badges table - predefined badges that users can earn
    await sql`
      CREATE TABLE IF NOT EXISTS badges (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        icon_url TEXT,
        criteria TEXT, -- JSON describing how to earn this badge
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // User badges table - track which badges each user has earned
    await sql`
      CREATE TABLE IF NOT EXISTS user_badges (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        badge_id INTEGER REFERENCES badges(id) ON DELETE CASCADE,
        badge_type VARCHAR(50),
        badge_name VARCHAR(100) NOT NULL,
        badge_description TEXT,
        badge_icon VARCHAR(50),
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // User activity log table - track all user activities for gamification
    await sql`
      CREATE TABLE IF NOT EXISTS user_activity_log (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        activity_type VARCHAR(50) NOT NULL,
        activity_data JSONB DEFAULT '{}',
        points_earned INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // User streaks table - track user engagement streaks
    await sql`
      CREATE TABLE IF NOT EXISTS user_streaks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        streak_type VARCHAR(50) NOT NULL,
        current_streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        last_activity_date DATE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, streak_type)
      )
    `;

    // User progress metrics table - weekly progress tracking
    await sql`
      CREATE TABLE IF NOT EXISTS user_progress_metrics (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        metric_type VARCHAR(50) NOT NULL,
        metric_value DECIMAL(5,2) NOT NULL,
        week_start DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, metric_type, week_start)
      )
    `;

    // Weekly insights table - personalized weekly insights
    await sql`
      CREATE TABLE IF NOT EXISTS weekly_insights (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        week_start DATE NOT NULL,
        insight_type VARCHAR(20) NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        actionable BOOLEAN DEFAULT false,
        priority INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Forum categories table
    await sql`
      CREATE TABLE IF NOT EXISTS forum_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        icon VARCHAR(50),
        color VARCHAR(20),
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Forum posts table
    await sql`
      CREATE TABLE IF NOT EXISTS forum_posts (
        id SERIAL PRIMARY KEY,
        category_id INTEGER REFERENCES forum_categories(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(500) NOT NULL,
        content TEXT NOT NULL,
        views INTEGER DEFAULT 0,
        replies_count INTEGER DEFAULT 0,
        is_pinned BOOLEAN DEFAULT false,
        is_locked BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Forum replies table
    await sql`
      CREATE TABLE IF NOT EXISTS forum_replies (
        id SERIAL PRIMARY KEY,
        post_id INTEGER REFERENCES forum_posts(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        is_solution BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // User goals table - main goal setting system
    await sql`
      CREATE TABLE IF NOT EXISTS user_goals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        goal_type VARCHAR(50) NOT NULL, -- 'yearly', 'monthly', 'weekly'
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100), -- 'profile', 'messages', 'dates', 'mindset', 'confidence', 'attachment'
        target_value INTEGER, -- for measurable goals
        current_value INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'paused', 'cancelled'
        priority INTEGER DEFAULT 1, -- 1-5 scale
        due_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP
      )
    `;

    // Goal progress tracking table
    await sql`
      CREATE TABLE IF NOT EXISTS goal_progress (
        id SERIAL PRIMARY KEY,
        goal_id INTEGER REFERENCES user_goals(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        progress_date DATE NOT NULL,
        progress_value INTEGER DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Weekly reflections table
    await sql`
      CREATE TABLE IF NOT EXISTS weekly_reflections (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        week_start DATE NOT NULL,
        what_done TEXT, -- JSON array of completed activities
        what_went_well TEXT,
        what_needs_help TEXT,
        ai_feedback TEXT,
        ai_new_goals JSONB, -- AI-generated suggestions
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Monthly AI reviews table
    await sql`
      CREATE TABLE IF NOT EXISTS monthly_reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        review_month DATE NOT NULL, -- first day of the month
        overall_progress INTEGER, -- 1-10 scale
        strengths TEXT[],
        challenges TEXT[],
        recommendations TEXT[],
        next_month_goals JSONB,
        ai_insights TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Goal templates table - predefined goal suggestions
    await sql`
      CREATE TABLE IF NOT EXISTS goal_templates (
        id SERIAL PRIMARY KEY,
        category VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        difficulty VARCHAR(50) DEFAULT 'medium', -- 'easy', 'medium', 'hard'
        estimated_weeks INTEGER DEFAULT 4,
        target_value INTEGER,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Coach-client assignments table - links coaches to their clients
    await sql`
      CREATE TABLE IF NOT EXISTS coach_client_assignments (
        id SERIAL PRIMARY KEY,
        coach_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        client_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'completed'
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        notes TEXT,
        UNIQUE(coach_user_id, client_user_id)
      )
    `;

    // Coach-client messages table - communication between coaches and clients
    await sql`
      CREATE TABLE IF NOT EXISTS coach_client_messages (
        id SERIAL PRIMARY KEY,
        coach_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        client_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL, -- 'email', 'sms', 'in_app', 'scheduled'
        subject VARCHAR(500),
        content TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'sent', 'scheduled', 'failed', 'delivered', 'read'
        scheduled_for TIMESTAMP,
        sent_at TIMESTAMP,
        delivered_at TIMESTAMP,
        read_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata JSONB DEFAULT '{}' -- for tracking delivery info, etc.
      )
    `;

    // Communication templates table - reusable message templates
    await sql`
      CREATE TABLE IF NOT EXISTS communication_templates (
        id SERIAL PRIMARY KEY,
        coach_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL, -- 'motivation', 'feedback', 'reminder', 'celebration', 'follow_up'
        subject VARCHAR(500),
        content TEXT NOT NULL,
        variables TEXT[], -- array of variable names like ['clientName', 'recentSuccesses']
        is_active BOOLEAN DEFAULT true,
        usage_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Client communication preferences table
    await sql`
      CREATE TABLE IF NOT EXISTS client_communication_preferences (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        preferred_channel VARCHAR(50) DEFAULT 'email', -- 'email', 'sms', 'in_app'
        email_enabled BOOLEAN DEFAULT true,
        sms_enabled BOOLEAN DEFAULT false,
        in_app_enabled BOOLEAN DEFAULT true,
        frequency_limit INTEGER DEFAULT 5, -- max messages per week
        quiet_hours_start TIME, -- e.g., '22:00'
        quiet_hours_end TIME, -- e.g., '08:00'
        timezone VARCHAR(50) DEFAULT 'Europe/Amsterdam',
        unsubscribed BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Automated sequences table - for drip campaigns and follow-ups
    await sql`
      CREATE TABLE IF NOT EXISTS communication_sequences (
        id SERIAL PRIMARY KEY,
        coach_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        trigger_event VARCHAR(100), -- 'goal_completed', 'course_started', 'inactive_3_days', etc.
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Sequence steps table - individual messages in a sequence
    await sql`
      CREATE TABLE IF NOT EXISTS sequence_steps (
        id SERIAL PRIMARY KEY,
        sequence_id INTEGER REFERENCES communication_sequences(id) ON DELETE CASCADE,
        step_order INTEGER NOT NULL,
        delay_days INTEGER DEFAULT 0, -- days to wait after trigger
        delay_hours INTEGER DEFAULT 0, -- additional hours
        template_id INTEGER REFERENCES communication_templates(id) ON DELETE SET NULL,
        custom_subject VARCHAR(500),
        custom_content TEXT,
        channel VARCHAR(50) DEFAULT 'email', -- 'email', 'sms', 'in_app'
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Client sequence enrollments table - tracks which clients are in which sequences
    await sql`
      CREATE TABLE IF NOT EXISTS client_sequence_enrollments (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        sequence_id INTEGER REFERENCES communication_sequences(id) ON DELETE CASCADE,
        step_completed INTEGER DEFAULT 0, -- last completed step
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'paused'
        UNIQUE(client_id, sequence_id)
      )
    `;

    // Message analytics table - tracks engagement and performance
    await sql`
      CREATE TABLE IF NOT EXISTS message_analytics (
        id SERIAL PRIMARY KEY,
        message_id INTEGER REFERENCES coach_client_messages(id) ON DELETE CASCADE,
        event_type VARCHAR(50) NOT NULL, -- 'sent', 'delivered', 'opened', 'clicked', 'replied'
        event_data JSONB DEFAULT '{}',
        occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip_address INET,
        user_agent TEXT
      )
    `;

    // In-app notifications table
    await sql`
      CREATE TABLE IF NOT EXISTS in_app_notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
        action_url TEXT, -- optional link
        action_text VARCHAR(100), -- button text
        is_read BOOLEAN DEFAULT false,
        read_at TIMESTAMP,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Progress events table - tracks client progress for automation
    await sql`
      CREATE TABLE IF NOT EXISTS progress_events (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        event_type VARCHAR(50) NOT NULL, -- 'goal_completed', 'course_started', etc.
        event_data JSONB DEFAULT '{}',
        occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processed BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // ============================================
    // NEW MEMBER JOURNEY SYSTEM TABLES
    // ============================================

    // Onboarding journeys table - main journey tracking
    await sql`
      CREATE TABLE IF NOT EXISTS onboarding_journeys (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        journey_version VARCHAR(20) DEFAULT 'v1.0',
        current_phase VARCHAR(20) DEFAULT 'welcome', -- 'welcome', 'scan', 'goals', 'optimization', 'week1', 'ongoing'
        current_step INTEGER DEFAULT 1,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'paused', 'abandoned'
        metadata JSONB DEFAULT '{}',
        UNIQUE(user_id)
      )
    `;

    // Personality scans table - dating style analysis results
    await sql`
      CREATE TABLE IF NOT EXISTS personality_scans (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        scan_version VARCHAR(20) DEFAULT 'v1.0',
        current_situation VARCHAR(50), -- 'single', 'recent_breakup', 'active_dating', 'new_to_apps'
        comfort_level INTEGER CHECK (comfort_level >= 1 AND comfort_level <= 10),
        main_challenge VARCHAR(100), -- 'no_matches', 'no_conversations', 'low_confidence', 'bad_photos', 'bad_openers'
        desired_outcome VARCHAR(100), -- 'serious_relationship', 'more_dating', 'better_social_skills', 'higher_confidence'
        strength_self VARCHAR(255),
        weakness_self VARCHAR(255),
        weekly_commitment VARCHAR(20), -- '1-2h', '3-5h', '5h_plus'
        ai_generated_profile JSONB DEFAULT '{}', -- personality DNA results
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      )
    `;

    // Goal hierarchies table - year/month/week goal system
    await sql`
      CREATE TABLE IF NOT EXISTS goal_hierarchies (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        goal_type VARCHAR(20) NOT NULL, -- 'year', 'month', 'week'
        goal_period DATE NOT NULL, -- year start, month start, week start
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(50), -- 'relationship', 'confidence', 'profile', 'social_skills', 'consistency'
        target_value INTEGER, -- measurable goals
        current_value INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'paused', 'cancelled'
        priority INTEGER DEFAULT 1, -- 1-5 scale
        ai_generated BOOLEAN DEFAULT false,
        ai_confidence DECIMAL(3,2), -- AI confidence in goal suitability
        parent_goal_id INTEGER REFERENCES goal_hierarchies(id), -- links week to month, month to year
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Journey progress table - detailed step tracking
    await sql`
      CREATE TABLE IF NOT EXISTS journey_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        journey_phase VARCHAR(50) NOT NULL,
        step_number INTEGER NOT NULL,
        step_name VARCHAR(100) NOT NULL,
        step_type VARCHAR(50) NOT NULL, -- 'screen', 'quiz', 'task', 'reflection', 'celebration'
        status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'skipped'
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        time_spent_seconds INTEGER,
        user_response JSONB DEFAULT '{}',
        ai_feedback JSONB DEFAULT '{}',
        score INTEGER, -- for quizzes/tasks
        max_score INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, journey_phase, step_number)
      )
    `;

    // AI content cache table - personalized content storage
    await sql`
      CREATE TABLE IF NOT EXISTS ai_content_cache (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content_type VARCHAR(50) NOT NULL, -- 'motivation', 'reflection', 'goal_suggestion', 'profile_feedback'
        content_key VARCHAR(100) NOT NULL, -- unique identifier for content type
        content_data JSONB NOT NULL,
        ai_model VARCHAR(50),
        ai_version VARCHAR(20),
        expires_at TIMESTAMP,
        usage_count INTEGER DEFAULT 0,
        last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, content_type, content_key)
      )
    `;

    // Engagement schedules table - automated content delivery
    await sql`
      CREATE TABLE IF NOT EXISTS engagement_schedules (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        schedule_type VARCHAR(50) NOT NULL, -- 'daily_motivation', 'weekly_review', 'monthly_report', 'goal_reminder'
        scheduled_for TIMESTAMP NOT NULL,
        delivered_at TIMESTAMP,
        status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'delivered', 'failed', 'cancelled'
        content_type VARCHAR(50), -- 'email', 'sms', 'in_app', 'push'
        content_id VARCHAR(100), -- reference to content
        priority INTEGER DEFAULT 5, -- 1-10, higher = more important
        ab_test_variant VARCHAR(20),
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Performance metrics table - 24/7 tracking
    await sql`
      CREATE TABLE IF NOT EXISTS performance_metrics (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        metric_type VARCHAR(50) NOT NULL, -- 'matches', 'conversations', 'dates', 'profile_views', 'response_rate'
        metric_value DECIMAL(10,2) NOT NULL,
        metric_date DATE NOT NULL,
        time_period VARCHAR(20) DEFAULT 'daily', -- 'daily', 'weekly', 'monthly'
        data_source VARCHAR(50), -- 'app_usage', 'user_input', 'calculated'
        confidence_score DECIMAL(3,2), -- AI confidence in metric accuracy
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, metric_type, metric_date, time_period)
      )
    `;

    // Badge system table - achievements and gamification
    await sql`
      CREATE TABLE IF NOT EXISTS badge_system (
        id SERIAL PRIMARY KEY,
        badge_key VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        category VARCHAR(50) NOT NULL, -- 'consistency', 'performance', 'milestone', 'social'
        icon VARCHAR(100),
        rarity VARCHAR(20) DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
        criteria JSONB NOT NULL, -- achievement requirements
        points_value INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // User badges table - earned achievements
    await sql`
      CREATE TABLE IF NOT EXISTS user_badges (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        badge_id INTEGER REFERENCES badge_system(id) ON DELETE CASCADE,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        progress_value DECIMAL(5,2) DEFAULT 100.00, -- percentage progress
        metadata JSONB DEFAULT '{}',
        UNIQUE(user_id, badge_id)
      )
    `;

    // Reflection responses table - user feedback and reflections
    await sql`
      CREATE TABLE IF NOT EXISTS reflection_responses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        reflection_type VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly', 'annual'
        reflection_period DATE NOT NULL, -- date the reflection is for
        question_key VARCHAR(100) NOT NULL,
        response_text TEXT,
        response_value INTEGER, -- for scale questions (1-10, emoji selections)
        ai_analysis JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, reflection_type, reflection_period, question_key)
      )
    `;

    // Journey analytics table - conversion and engagement tracking
    await sql`
      CREATE TABLE IF NOT EXISTS journey_analytics (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        event_type VARCHAR(50) NOT NULL, -- 'journey_started', 'phase_completed', 'goal_set', 'abandoned'
        event_data JSONB DEFAULT '{}',
        occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        session_id VARCHAR(100),
        user_agent TEXT,
        ip_address INET,
        conversion_value DECIMAL(10,2), -- monetary value of conversion
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // A/B test experiments table - optimization framework
    await sql`
      CREATE TABLE IF NOT EXISTS ab_test_experiments (
        id SERIAL PRIMARY KEY,
        experiment_key VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'active', 'completed', 'paused'
        test_type VARCHAR(50) NOT NULL, -- 'content', 'timing', 'flow', 'ui'
        variants JSONB NOT NULL, -- array of variant configurations
        target_audience JSONB DEFAULT '{}', -- user segment criteria
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        winner_variant VARCHAR(50),
        confidence_level DECIMAL(5,4), -- statistical confidence
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // A/B test assignments table - user variant assignments
    await sql`
      CREATE TABLE IF NOT EXISTS ab_test_assignments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        experiment_id INTEGER REFERENCES ab_test_experiments(id) ON DELETE CASCADE,
        assigned_variant VARCHAR(50) NOT NULL,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        metadata JSONB DEFAULT '{}',
        UNIQUE(user_id, experiment_id)
      )
    `;

    // Create indexes for better query performance - DISABLED FOR NOW DUE TO ISSUES
    // await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon_user ON coupon_usage(coupon_id, user_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_coupon_usage_user ON coupon_usage(user_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_coupon_usage_order ON coupon_usage(order_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_podcasts_published ON podcasts(published)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_user_behavior_user_id ON user_behavior(user_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_user_behavior_module_id ON user_behavior(module_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_user_behavior_course_id ON user_behavior(course_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_user_behavior_action ON user_behavior(action)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_user_behavior_timestamp ON user_behavior(timestamp)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_user_profiles_extended_user_id ON user_profiles_extended(user_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_user_badges_badge_type ON user_badges(badge_type)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_forum_posts_category_id ON forum_posts(category_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_forum_posts_user_id ON forum_posts(user_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_forum_replies_post_id ON forum_replies(post_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_forum_replies_user_id ON forum_replies(user_id)`;

    // Indexes for new gamification tables - DISABLED FOR NOW
    // await sql`CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_user_activity_log_type ON user_activity_log(activity_type)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON user_activity_log(created_at)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_user_streaks_type ON user_streaks(streak_type)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_user_progress_metrics_user_id ON user_progress_metrics(user_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_user_progress_metrics_week ON user_progress_metrics(week_start)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_weekly_insights_user_id ON weekly_insights(user_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_weekly_insights_week ON weekly_insights(week_start)`;

    // Indexes for goal-setting system - DISABLED FOR NOW
    // await sql`CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals(user_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_user_goals_type ON user_goals(goal_type)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_user_goals_category ON user_goals(category)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_user_goals_status ON user_goals(status)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_user_goals_due_date ON user_goals(due_date)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_goal_progress_goal_id ON goal_progress(goal_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_goal_progress_user_id ON goal_progress(user_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_goal_progress_progress_date ON goal_progress(progress_date)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_weekly_reflections_user_id ON weekly_reflections(user_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_weekly_reflections_week ON weekly_reflections(week_start)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_monthly_reviews_user_id ON monthly_reviews(user_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_monthly_reviews_month ON monthly_reviews(review_month)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_goal_templates_category ON goal_templates(category)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_goal_templates_active ON goal_templates(is_active)`;

    // Indexes for client communication system - DISABLED FOR NOW
    // await sql`CREATE INDEX IF NOT EXISTS idx_coach_client_assignments_coach ON coach_client_assignments(coach_user_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_coach_client_assignments_client ON coach_client_assignments(client_user_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_coach_client_assignments_status ON coach_client_assignments(status)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_coach_client_messages_coach ON coach_client_messages(coach_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_coach_client_messages_client ON coach_client_messages(client_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_coach_client_messages_status ON coach_client_messages(status)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_coach_client_messages_type ON coach_client_messages(type)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_coach_client_messages_scheduled ON coach_client_messages(scheduled_for)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_coach_client_messages_created ON coach_client_messages(created_at)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_communication_templates_coach ON communication_templates(coach_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_communication_templates_category ON communication_templates(category)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_communication_templates_active ON communication_templates(is_active)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_client_comm_prefs_client ON client_communication_preferences(client_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_comm_sequences_coach ON communication_sequences(coach_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_comm_sequences_trigger ON communication_sequences(trigger_event)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_sequence_steps_sequence ON sequence_steps(sequence_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_sequence_steps_order ON sequence_steps(step_order)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_client_sequence_enrollments_client ON client_sequence_enrollments(client_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_client_sequence_enrollments_sequence ON client_sequence_enrollments(sequence_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_client_sequence_enrollments_status ON client_sequence_enrollments(status)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_message_analytics_message ON message_analytics(message_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_message_analytics_event ON message_analytics(event_type)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_message_analytics_time ON message_analytics(occurred_at)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_in_app_notifications_user ON in_app_notifications(user_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_in_app_notifications_read ON in_app_notifications(is_read)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_in_app_notifications_expires ON in_app_notifications(expires_at)`;

    // Indexes for progress automation - DISABLED FOR NOW
    // await sql`CREATE INDEX IF NOT EXISTS idx_progress_events_user ON progress_events(user_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_progress_events_type ON progress_events(event_type)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_progress_events_occurred ON progress_events(occurred_at)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_progress_events_processed ON progress_events(processed)`;

    // Indexes for new member journey system - DISABLED FOR NOW
    // await sql`CREATE INDEX IF NOT EXISTS idx_onboarding_journeys_user ON onboarding_journeys(user_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_onboarding_journeys_phase ON onboarding_journeys(current_phase)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_onboarding_journeys_status ON onboarding_journeys(status)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_onboarding_journeys_activity ON onboarding_journeys(last_activity)`;

    // await sql`CREATE INDEX IF NOT EXISTS idx_personality_scans_user ON personality_scans(user_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_personality_scans_completed ON personality_scans(completed_at)`;

    // await sql`CREATE INDEX IF NOT EXISTS idx_goal_hierarchies_user ON goal_hierarchies(user_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_goal_hierarchies_type ON goal_hierarchies(goal_type)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_goal_hierarchies_period ON goal_hierarchies(goal_period)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_goal_hierarchies_status ON goal_hierarchies(status)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_goal_hierarchies_parent ON goal_hierarchies(parent_goal_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_goal_hierarchies_category ON goal_hierarchies(category)`;

    // await sql`CREATE INDEX IF NOT EXISTS idx_journey_progress_user ON journey_progress(user_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_journey_progress_phase ON journey_progress(journey_phase)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_journey_progress_status ON journey_progress(status)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_journey_progress_completed ON journey_progress(completed_at)`;

    // await sql`CREATE INDEX IF NOT EXISTS idx_ai_content_cache_user ON ai_content_cache(user_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_ai_content_cache_type ON ai_content_cache(content_type)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_ai_content_cache_key ON ai_content_cache(content_key)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_ai_content_cache_expires ON ai_content_cache(expires_at)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_ai_content_cache_used ON ai_content_cache(last_used)`;

    // await sql`CREATE INDEX IF NOT EXISTS idx_engagement_schedules_user ON engagement_schedules(user_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_engagement_schedules_type ON engagement_schedules(schedule_type)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_engagement_schedules_scheduled ON engagement_schedules(scheduled_for)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_engagement_schedules_status ON engagement_schedules(status)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_engagement_schedules_priority ON engagement_schedules(priority)`;

    // await sql`CREATE INDEX IF NOT EXISTS idx_performance_metrics_user ON performance_metrics(user_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_performance_metrics_type ON performance_metrics(metric_type)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_performance_metrics_date ON performance_metrics(metric_date)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_performance_metrics_period ON performance_metrics(time_period)`;

    // await sql`CREATE INDEX IF NOT EXISTS idx_badge_system_key ON badge_system(badge_key)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_badge_system_category ON badge_system(category)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_badge_system_rarity ON badge_system(rarity)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_badge_system_active ON badge_system(is_active)`;

    // await sql`CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_user_badges_badge ON user_badges(badge_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_user_badges_earned ON user_badges(earned_at)`;

    // await sql`CREATE INDEX IF NOT EXISTS idx_reflection_responses_user ON reflection_responses(user_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_reflection_responses_type ON reflection_responses(reflection_type)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_reflection_responses_period ON reflection_responses(reflection_period)`;

    // await sql`CREATE INDEX IF NOT EXISTS idx_journey_analytics_user ON journey_analytics(user_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_journey_analytics_event ON journey_analytics(event_type)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_journey_analytics_occurred ON journey_analytics(occurred_at)`;

    // await sql`CREATE INDEX IF NOT EXISTS idx_ab_test_experiments_key ON ab_test_experiments(experiment_key)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_ab_test_experiments_status ON ab_test_experiments(status)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_ab_test_experiments_type ON ab_test_experiments(test_type)`;

    // await sql`CREATE INDEX IF NOT EXISTS idx_ab_test_assignments_user ON ab_test_assignments(user_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_ab_test_assignments_experiment ON ab_test_assignments(experiment_id)`;
    // await sql`CREATE INDEX IF NOT EXISTS idx_ab_test_assignments_variant ON ab_test_assignments(assigned_variant)`;

    // ============================================
    // WAARDEN KOMPAS SYSTEM TABLES
    // ============================================

    try {
      // Waarden Kompas sessions table
      await sql`
        CREATE TABLE IF NOT EXISTS waarden_kompas_sessions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          completed_at TIMESTAMP WITH TIME ZONE,
          current_phase VARCHAR(20) DEFAULT 'intake',
          intake_goal VARCHAR(50),
          intake_values_importance VARCHAR(20),
          intake_dating_style VARCHAR(20),
          ai_calibration JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id)
        )
      `;

      // Waarden onderzoek responses table
      await sql`
        CREATE TABLE IF NOT EXISTS waarden_kompas_responses (
          id SERIAL PRIMARY KEY,
          session_id INTEGER NOT NULL REFERENCES waarden_kompas_sessions(id) ON DELETE CASCADE,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          category VARCHAR(50) NOT NULL,
          value_key VARCHAR(50) NOT NULL,
          value_name VARCHAR(100) NOT NULL,
          importance_rating INTEGER NOT NULL CHECK (importance_rating >= 1 AND importance_rating <= 4),
          responded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(session_id, value_key)
        )
      `;

      // AI synthesis results table
      await sql`
        CREATE TABLE IF NOT EXISTS waarden_kompas_results (
          id SERIAL PRIMARY KEY,
          session_id INTEGER NOT NULL REFERENCES waarden_kompas_sessions(id) ON DELETE CASCADE,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          core_values JSONB NOT NULL,
          values_meaning JSONB NOT NULL,
          red_flags JSONB NOT NULL,
          green_flags JSONB NOT NULL,
          dating_strategies JSONB NOT NULL,
          ai_confidence_score DECIMAL(3,2),
          ai_analysis_notes TEXT,
          generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;

      // Integration tracking table
      await sql`
        CREATE TABLE IF NOT EXISTS waarden_kompas_integrations (
          id SERIAL PRIMARY KEY,
          session_id INTEGER NOT NULL REFERENCES waarden_kompas_sessions(id) ON DELETE CASCADE,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          integration_type VARCHAR(50) NOT NULL,
          applied_suggestions JSONB,
          effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
          user_feedback TEXT,
          applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(session_id, integration_type)
        )
      `;

      // Waarden Kompas indexes
      await sql`CREATE INDEX IF NOT EXISTS idx_waarden_sessions_user_id ON waarden_kompas_sessions(user_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_waarden_sessions_phase ON waarden_kompas_sessions(current_phase)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_waarden_responses_session ON waarden_kompas_responses(session_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_waarden_responses_user ON waarden_kompas_responses(user_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_waarden_results_session ON waarden_kompas_results(session_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_waarden_integrations_session ON waarden_kompas_integrations(session_id)`;

      // Waarden Kompas triggers
      await sql`
        CREATE OR REPLACE FUNCTION update_waarden_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql'
      `;

      await sql`CREATE TRIGGER update_waarden_sessions_updated_at BEFORE UPDATE ON waarden_kompas_sessions FOR EACH ROW EXECUTE FUNCTION update_waarden_updated_at_column()`;
      await sql`CREATE TRIGGER update_waarden_results_updated_at BEFORE UPDATE ON waarden_kompas_results FOR EACH ROW EXECUTE FUNCTION update_waarden_updated_at_column()`;
      await sql`CREATE TRIGGER update_waarden_integrations_updated_at BEFORE UPDATE ON waarden_kompas_integrations FOR EACH ROW EXECUTE FUNCTION update_waarden_updated_at_column()`;

      console.log('Waarden Kompas tables created successfully');
    } catch (waardenError) {
      console.error('Error creating Waarden Kompas tables:', waardenError);
      // Continue with other tables even if Waarden Kompas fails
    }

    console.log('Database schema initialized successfully');
    return { success: true };
  } catch (error) {
    console.error('Error initializing database schema:', error);
    throw error;
  }
}

/**
 * Drop all tables (use with caution!)
 */
export async function dropAllTables() {
  try {
    await sql`DROP TABLE IF EXISTS orders CASCADE`;
    await sql`DROP TABLE IF EXISTS blog_posts CASCADE`;
    await sql`DROP TABLE IF EXISTS subscription_history CASCADE`;
    await sql`DROP TABLE IF EXISTS usage_tracking CASCADE`;
    await sql`DROP TABLE IF EXISTS photo_analyses CASCADE`;
    await sql`DROP TABLE IF EXISTS messages CASCADE`;
    await sql`DROP TABLE IF EXISTS conversations CASCADE`;
    await sql`DROP TABLE IF EXISTS user_profiles CASCADE`;
    await sql`DROP TABLE IF EXISTS users CASCADE`;

    console.log('All tables dropped successfully');
    return { success: true };
  } catch (error) {
    console.error('Error dropping tables:', error);
    throw error;
  }
}