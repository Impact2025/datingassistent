import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST() {
  try {
    console.log('Creating AI relationship coach dashboard tables...');

    // Create tables one by one to avoid Turbopack issues with sql.unsafe()
    await sql`
      CREATE TABLE IF NOT EXISTS relationship_coach_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

        -- Assessment completion status
        hechtingsstijl_completed BOOLEAN DEFAULT FALSE,
        emotionele_readiness_completed BOOLEAN DEFAULT FALSE,
        dating_style_completed BOOLEAN DEFAULT FALSE,
        chat_coach_completed BOOLEAN DEFAULT FALSE,
        levensvisie_completed BOOLEAN DEFAULT FALSE,
        zelfbeeld_completed BOOLEAN DEFAULT FALSE,

        -- Assessment scores (normalized 0-100)
        attachment_score INTEGER,
        emotional_readiness_score INTEGER,
        dating_style_maturity_score INTEGER,
        communication_skill_score INTEGER,
        future_compatibility_score INTEGER,
        first_impression_score INTEGER,

        -- Overall relationship readiness score
        overall_readiness_score INTEGER CHECK (overall_readiness_score BETWEEN 0 AND 100),

        -- Profile completeness percentage
        profile_completeness INTEGER DEFAULT 0 CHECK (profile_completeness BETWEEN 0 AND 100),

        UNIQUE(user_id)
      );
    `;
    console.log('✅ Created relationship_coach_profiles table');

    await sql`
      CREATE TABLE IF NOT EXISTS relationship_coach_insights (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

        -- Core insights
        relationship_strengths TEXT[],
        relationship_challenges TEXT[],
        growth_opportunities TEXT[],
        compatibility_factors TEXT[],

        -- Personality profile
        personality_summary TEXT,
        behavioral_patterns TEXT[],
        emotional_triggers TEXT[],
        communication_style TEXT,

        -- Dating strategy
        optimal_dating_approach TEXT,
        target_audience_description TEXT,
        success_probability_estimate INTEGER CHECK (success_probability_estimate BETWEEN 0 AND 100),

        -- Long-term potential
        relationship_timeline_prediction TEXT,
        commitment_readiness_level VARCHAR(20) CHECK (commitment_readiness_level IN ('not_ready', 'exploring', 'ready', 'actively_seeking')),
        life_stage_alignment TEXT,

        -- Action items
        immediate_actions TEXT[],
        weekly_focus_areas TEXT[],
        monthly_goals TEXT[],
        long_term_development TEXT[],

        -- Risk assessments
        potential_sabotage_patterns TEXT[],
        relationship_red_flags TEXT[],
        personal_development_needs TEXT[],

        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created relationship_coach_insights table');

    await sql`
      CREATE TABLE IF NOT EXISTS relationship_coach_plans (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        plan_type VARCHAR(20) NOT NULL CHECK (plan_type IN ('starter', 'intermediate', 'advanced', 'premium')),
        is_active BOOLEAN DEFAULT TRUE,

        -- Plan structure
        plan_title TEXT NOT NULL,
        plan_description TEXT,
        estimated_completion_time TEXT, -- e.g., "3-6 months"

        -- Phase-based structure
        phase_1_title TEXT,
        phase_1_duration TEXT,
        phase_1_focus_areas TEXT[],
        phase_1_milestones TEXT[],

        phase_2_title TEXT,
        phase_2_duration TEXT,
        phase_2_focus_areas TEXT[],
        phase_2_milestones TEXT[],

        phase_3_title TEXT,
        phase_3_duration TEXT,
        phase_3_focus_areas TEXT[],
        phase_3_milestones TEXT[],

        -- Daily/weekly activities
        daily_micro_habits TEXT[],
        weekly_practices TEXT[],
        monthly_reflections TEXT[],

        -- Tool recommendations
        recommended_tools JSONB, -- Links to specific tools with timing
        tool_usage_schedule JSONB, -- When to use which tools

        -- Success metrics
        success_indicators TEXT[],
        progress_tracking_metrics TEXT[],

        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created relationship_coach_plans table');

    await sql`
      CREATE TABLE IF NOT EXISTS relationship_coach_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        plan_id INTEGER REFERENCES relationship_coach_plans(id),

        -- Progress tracking
        current_phase INTEGER DEFAULT 1,
        phase_1_completion_percentage INTEGER DEFAULT 0 CHECK (phase_1_completion_percentage BETWEEN 0 AND 100),
        phase_2_completion_percentage INTEGER DEFAULT 0 CHECK (phase_2_completion_percentage BETWEEN 0 AND 100),
        phase_3_completion_percentage INTEGER DEFAULT 0 CHECK (phase_3_completion_percentage BETWEEN 0 AND 100),

        overall_progress_percentage INTEGER DEFAULT 0 CHECK (overall_progress_percentage BETWEEN 0 AND 100),

        -- Activity completion
        daily_habits_completed_today INTEGER DEFAULT 0,
        weekly_practices_completed_this_week INTEGER DEFAULT 0,
        monthly_reflections_completed_this_month INTEGER DEFAULT 0,

        -- Assessment retakes
        last_assessment_update TIMESTAMP WITH TIME ZONE,
        assessment_improvement_areas TEXT[],

        -- Success metrics
        relationship_success_indicators TEXT[],
        personal_growth_achievements TEXT[],

        -- Streaks and consistency
        current_streak_days INTEGER DEFAULT 0,
        longest_streak_days INTEGER DEFAULT 0,
        consistency_score INTEGER DEFAULT 0 CHECK (consistency_score BETWEEN 0 AND 100),

        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

        UNIQUE(user_id)
      );
    `;
    console.log('✅ Created relationship_coach_progress table');

    await sql`
      CREATE TABLE IF NOT EXISTS relationship_coach_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        session_type VARCHAR(30) NOT NULL CHECK (session_type IN ('assessment_review', 'progress_check', 'strategy_session', 'crisis_intervention', 'celebration')),

        -- Session content
        session_title TEXT NOT NULL,
        session_summary TEXT,
        key_insights TEXT[],
        action_items TEXT[],
        next_session_focus TEXT,

        -- AI-generated content
        ai_coaching_notes TEXT,
        personalized_encouragement TEXT,
        motivational_message TEXT,

        -- Session outcomes
        user_mood_before VARCHAR(20) CHECK (user_mood_before IN ('very_low', 'low', 'neutral', 'good', 'excellent')),
        user_mood_after VARCHAR(20) CHECK (user_mood_after IN ('very_low', 'low', 'neutral', 'good', 'excellent')),
        breakthrough_moments TEXT[],
        challenges_discussed TEXT[],

        -- Follow-up
        homework_assigned TEXT[],
        next_session_date TIMESTAMP WITH TIME ZONE,
        accountability_checkins TEXT[],

        session_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created relationship_coach_sessions table');

    await sql`
      CREATE TABLE IF NOT EXISTS relationship_coach_analytics (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        analysis_period VARCHAR(20) NOT NULL CHECK (analysis_period IN ('weekly', 'monthly', 'quarterly')),

        -- Performance metrics
        assessment_completion_rate INTEGER CHECK (assessment_completion_rate BETWEEN 0 AND 100),
        tool_usage_frequency INTEGER, -- times per week
        progress_velocity INTEGER, -- improvement rate
        consistency_score INTEGER CHECK (consistency_score BETWEEN 0 AND 100),

        -- Behavioral insights
        most_used_tools TEXT[],
        preferred_learning_style VARCHAR(20) CHECK (preferred_learning_style IN ('visual', 'auditory', 'kinesthetic', 'reading')),
        peak_engagement_times TEXT[], -- when user is most active
        motivation_patterns TEXT[],

        -- Success correlations
        tool_effectiveness_correlations JSONB, -- which tools lead to most improvement
        activity_success_rates JSONB, -- which activities work best
        breakthrough_patterns TEXT[],

        -- Predictive analytics
        predicted_success_probability INTEGER CHECK (predicted_success_probability BETWEEN 0 AND 100),
        recommended_focus_areas TEXT[],
        optimal_pacing_suggestions TEXT,

        analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created relationship_coach_analytics table');

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_relationship_coach_profiles_user_id ON relationship_coach_profiles(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_relationship_coach_insights_user_id ON relationship_coach_insights(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_relationship_coach_plans_user_id ON relationship_coach_plans(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_relationship_coach_progress_user_id ON relationship_coach_progress(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_relationship_coach_sessions_user_id ON relationship_coach_sessions(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_relationship_coach_analytics_user_id ON relationship_coach_analytics(user_id);`;
    console.log('✅ Created indexes');

    return NextResponse.json({
      success: true,
      message: 'AI Relationship Coach Dashboard database tables initialized successfully!',
      details: {
        timestamp: new Date().toISOString(),
        tables: [
          'relationship_coach_profiles',
          'relationship_coach_insights',
          'relationship_coach_plans',
          'relationship_coach_progress',
          'relationship_coach_sessions',
          'relationship_coach_analytics'
        ],
        features: [
          'integrated_assessment_tracking',
          'personalized_coaching_plans',
          'progress_analytics',
          'session_management',
          'predictive_insights'
        ]
      },
    });
  } catch (error: any) {
    console.error('Error initializing relationship coach tables:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to initialize relationship coach database tables',
        details: error.message,
      },
      { status: 500 }
    );
  }
}