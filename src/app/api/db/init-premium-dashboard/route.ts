import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST() {
  try {
    console.log('Creating premium coaching dashboard tables...');

    // Create tables one by one to avoid Turbopack issues with sql.unsafe()
    await sql`
      CREATE TABLE IF NOT EXISTS premium_dashboard_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'vip')),
        subscription_active BOOLEAN DEFAULT FALSE,
        subscription_expires_at TIMESTAMP WITH TIME ZONE,
        onboarding_completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

        -- Overall progress metrics
        overall_readiness_score INTEGER DEFAULT 0 CHECK (overall_readiness_score BETWEEN 0 AND 100),
        tools_completed_count INTEGER DEFAULT 0,
        total_assessments_taken INTEGER DEFAULT 0,
        current_streak_days INTEGER DEFAULT 0,
        longest_streak_days INTEGER DEFAULT 0,

        -- Premium features access
        premium_coaching_sessions_remaining INTEGER DEFAULT 0,
        advanced_analytics_unlocked BOOLEAN DEFAULT FALSE,
        priority_support_access BOOLEAN DEFAULT FALSE,
        custom_coaching_plan_active BOOLEAN DEFAULT FALSE,

        UNIQUE(user_id)
      );
    `;
    console.log('✅ Created premium_dashboard_profiles table');

    await sql`
      CREATE TABLE IF NOT EXISTS premium_tool_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        tool_name VARCHAR(50) NOT NULL,
        tool_category VARCHAR(30) NOT NULL CHECK (tool_category IN ('emotional', 'behavioral', 'communication', 'future', 'presentation', 'integrated', 'advanced')),

        -- Completion status
        is_completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP WITH TIME ZONE,
        last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

        -- Tool-specific scores
        tool_score INTEGER CHECK (tool_score BETWEEN 0 AND 100),
        confidence_level INTEGER CHECK (confidence_level BETWEEN 0 AND 100),
        improvement_potential INTEGER CHECK (improvement_potential BETWEEN 0 AND 100),

        -- Progress tracking
        times_accessed INTEGER DEFAULT 0,
        total_time_spent_minutes INTEGER DEFAULT 0,
        last_result_summary TEXT,

        -- Premium features
        premium_insights_unlocked BOOLEAN DEFAULT FALSE,
        advanced_recommendations JSONB,
        custom_action_items JSONB,

        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

        UNIQUE(user_id, tool_name)
      );
    `;
    console.log('✅ Created premium_tool_progress table');

    await sql`
      CREATE TABLE IF NOT EXISTS premium_success_metrics (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        metric_period VARCHAR(20) NOT NULL CHECK (metric_period IN ('daily', 'weekly', 'monthly', 'quarterly')),

        -- Dating activity metrics
        dates_planned INTEGER DEFAULT 0,
        dates_completed INTEGER DEFAULT 0,
        conversations_started INTEGER DEFAULT 0,
        matches_converted INTEGER DEFAULT 0,

        -- Quality metrics
        average_date_rating DECIMAL(3,1) CHECK (average_date_rating BETWEEN 1 AND 5),
        communication_quality_score INTEGER CHECK (communication_quality_score BETWEEN 0 AND 100),
        self_reported_happiness INTEGER CHECK (self_reported_happiness BETWEEN 1 AND 10),

        -- Relationship outcomes
        relationships_started INTEGER DEFAULT 0,
        relationships_ended INTEGER DEFAULT 0,
        long_term_relationships INTEGER DEFAULT 0,
        relationship_satisfaction DECIMAL(3,1) CHECK (relationship_satisfaction BETWEEN 1 AND 5),

        -- Personal growth metrics
        self_awareness_score INTEGER CHECK (self_awareness_score BETWEEN 0 AND 100),
        emotional_regulation_score INTEGER CHECK (emotional_regulation_score BETWEEN 0 AND 100),
        communication_skill_improvement INTEGER CHECK (communication_skill_improvement BETWEEN 0 AND 100),

        -- Tool effectiveness
        tools_used_this_period INTEGER DEFAULT 0,
        average_tool_engagement_time INTEGER DEFAULT 0, -- minutes
        tool_recommendation_adoption_rate DECIMAL(5,2) CHECK (tool_recommendation_adoption_rate BETWEEN 0 AND 1),

        metric_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created premium_success_metrics table');

    await sql`
      CREATE TABLE IF NOT EXISTS premium_coaching_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        coach_id INTEGER, -- For future 1-on-1 coaching assignment
        session_type VARCHAR(30) NOT NULL CHECK (session_type IN ('strategy_review', 'progress_check', 'crisis_support', 'goal_setting', 'celebration', 'vip_personalized')),

        -- Session details
        session_title TEXT NOT NULL,
        session_description TEXT,
        scheduled_at TIMESTAMP WITH TIME ZONE,
        completed_at TIMESTAMP WITH TIME ZONE,
        session_duration_minutes INTEGER,

        -- Session content
        pre_session_questions JSONB, -- Questions to answer before session
        session_notes TEXT,
        key_takeaways TEXT[],
        action_items JSONB,
        homework_assignments JSONB,

        -- AI-generated content
        ai_session_summary TEXT,
        ai_recommendations TEXT[],
        ai_follow_up_questions TEXT[],

        -- Session quality
        user_satisfaction_rating INTEGER CHECK (user_satisfaction_rating BETWEEN 1 AND 5),
        coach_effectiveness_rating INTEGER CHECK (coach_effectiveness_rating BETWEEN 1 AND 5),
        session_helpfulness_score INTEGER CHECK (session_helpfulness_score BETWEEN 1 AND 5),

        -- Premium features
        is_vip_session BOOLEAN DEFAULT FALSE,
        custom_session_content JSONB,
        follow_up_session_scheduled TIMESTAMP WITH TIME ZONE,

        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created premium_coaching_sessions table');

    await sql`
      CREATE TABLE IF NOT EXISTS premium_user_goals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        goal_category VARCHAR(30) NOT NULL CHECK (goal_category IN ('dating_frequency', 'relationship_quality', 'personal_growth', 'communication', 'self_confidence', 'long_term_relationship')),

        -- Goal definition
        goal_title TEXT NOT NULL,
        goal_description TEXT,
        goal_type VARCHAR(20) NOT NULL CHECK (goal_type IN ('short_term', 'medium_term', 'long_term', 'lifetime')),

        -- Goal metrics
        target_value INTEGER NOT NULL,
        current_value INTEGER DEFAULT 0,
        unit VARCHAR(20) NOT NULL, -- e.g., 'dates', 'score', 'sessions', 'days'

        -- Timeline
        start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        target_date TIMESTAMP WITH TIME ZONE NOT NULL,
        completed_at TIMESTAMP WITH TIME ZONE,

        -- Progress tracking
        is_completed BOOLEAN DEFAULT FALSE,
        completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
        last_progress_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

        -- Supporting tools and actions
        recommended_tools TEXT[],
        supporting_actions TEXT[],
        milestone_checkpoints JSONB,

        -- AI insights
        ai_goal_insights TEXT,
        ai_progress_predictions TEXT,
        ai_adjustment_recommendations TEXT[],

        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created premium_user_goals table');

    await sql`
      CREATE TABLE IF NOT EXISTS premium_achievements (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        achievement_type VARCHAR(30) NOT NULL CHECK (achievement_type IN ('tool_completion', 'streak', 'score_milestone', 'relationship_milestone', 'personal_growth', 'consistency')),

        -- Achievement details
        achievement_name TEXT NOT NULL,
        achievement_description TEXT,
        achievement_icon VARCHAR(50),
        achievement_rarity VARCHAR(20) DEFAULT 'common' CHECK (achievement_rarity IN ('common', 'rare', 'epic', 'legendary')),

        -- Unlocking criteria
        unlock_criteria JSONB, -- Flexible criteria for unlocking
        unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

        -- Achievement value
        points_value INTEGER DEFAULT 0,
        badge_title TEXT,
        special_perks JSONB, -- Special features unlocked

        -- Display
        is_displayed BOOLEAN DEFAULT TRUE,
        display_order INTEGER DEFAULT 0,

        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created premium_achievements table');

    await sql`
      CREATE TABLE IF NOT EXISTS premium_notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        notification_type VARCHAR(30) NOT NULL CHECK (notification_type IN ('goal_reminder', 'tool_suggestion', 'progress_update', 'achievement_unlocked', 'coaching_session', 'streak_celebration', 'milestone_reached')),

        -- Notification content
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        action_url TEXT,
        action_text TEXT,

        -- Timing and delivery
        scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        delivered_at TIMESTAMP WITH TIME ZONE,
        is_read BOOLEAN DEFAULT FALSE,

        -- Priority and persistence
        priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
        expires_at TIMESTAMP WITH TIME ZONE,

        -- Metadata
        related_tool VARCHAR(50),
        related_goal_id INTEGER REFERENCES premium_user_goals(id),
        related_achievement_id INTEGER REFERENCES premium_achievements(id),

        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created premium_notifications table');

    await sql`
      CREATE TABLE IF NOT EXISTS premium_subscription_features (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        feature_name VARCHAR(50) NOT NULL,
        feature_category VARCHAR(30) NOT NULL CHECK (feature_category IN ('analytics', 'coaching', 'tools', 'support', 'customization')),

        -- Feature access
        is_unlocked BOOLEAN DEFAULT FALSE,
        unlocked_at TIMESTAMP WITH TIME ZONE,
        expires_at TIMESTAMP WITH TIME ZONE,

        -- Usage tracking
        usage_count INTEGER DEFAULT 0,
        last_used_at TIMESTAMP WITH TIME ZONE,
        usage_limit INTEGER, -- NULL for unlimited

        -- Feature configuration
        feature_settings JSONB,
        custom_configuration JSONB,

        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

        UNIQUE(user_id, feature_name)
      );
    `;
    console.log('✅ Created premium_subscription_features table');

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_premium_dashboard_profiles_user_id ON premium_dashboard_profiles(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_premium_tool_progress_user_id ON premium_tool_progress(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_premium_success_metrics_user_id ON premium_success_metrics(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_premium_coaching_sessions_user_id ON premium_coaching_sessions(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_premium_user_goals_user_id ON premium_user_goals(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_premium_achievements_user_id ON premium_achievements(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_premium_notifications_user_id ON premium_notifications(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_premium_subscription_features_user_id ON premium_subscription_features(user_id);`;
    console.log('✅ Created indexes');

    return NextResponse.json({
      success: true,
      message: 'Premium Coaching Dashboard database tables initialized successfully!',
      details: {
        timestamp: new Date().toISOString(),
        tables: [
          'premium_dashboard_profiles',
          'premium_tool_progress',
          'premium_success_metrics',
          'premium_coaching_sessions',
          'premium_user_goals',
          'premium_achievements',
          'premium_notifications',
          'premium_subscription_features'
        ],
        features: [
          'comprehensive_progress_tracking',
          'premium_coaching_integration',
          'advanced_success_metrics',
          'goal_setting_system',
          'achievement_badges',
          'smart_notifications',
          'subscription_management'
        ]
      },
    });
  } catch (error: any) {
    console.error('Error initializing premium dashboard tables:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to initialize premium coaching dashboard database tables',
        details: error.message,
      },
      { status: 500 }
    );
  }
}