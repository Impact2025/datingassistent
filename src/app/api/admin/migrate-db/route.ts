import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST() {
  try {
    console.log('🚀 Starting comprehensive database migration...');

    // 1. Add activity tracking columns to user_profiles
    console.log('📊 Adding activity tracking columns...');
    await sql`
      ALTER TABLE user_profiles
      ADD COLUMN IF NOT EXISTS activity_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    `;

    // 2. Create coaching_profiles table
    console.log('👨‍🏫 Creating coaching_profiles table...');
    await sql`
      CREATE TABLE IF NOT EXISTS coaching_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

        -- Personality & Assessment Data
        personality_type TEXT,
        comfort_level INTEGER DEFAULT 5,
        primary_goal TEXT,
        main_challenge TEXT,
        strengths JSONB DEFAULT '[]'::jsonb,
        growth_areas JSONB DEFAULT '[]'::jsonb,

        -- Current Journey Status
        current_phase TEXT DEFAULT 'intake',
        journey_day INTEGER DEFAULT 1,
        completed_steps JSONB DEFAULT '[]'::jsonb,
        active_goals JSONB DEFAULT '[]'::jsonb,

        -- Coach Recommendations
        recommended_tools JSONB DEFAULT '[]'::jsonb,
        next_action TEXT,
        weekly_focus TEXT,
        coach_advice_given BOOLEAN DEFAULT FALSE,

        -- Progress & Engagement Metrics
        tools_used JSONB DEFAULT '{}'::jsonb,
        skill_levels JSONB DEFAULT '{}'::jsonb,
        badges JSONB DEFAULT '[]'::jsonb,
        current_streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,

        -- Personalization Preferences
        learning_style TEXT DEFAULT 'mixed',
        pace_preference TEXT DEFAULT 'medium',
        time_commitment TEXT DEFAULT '3-5h',

        -- Metadata
        last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        total_time_spent INTEGER DEFAULT 0,

        UNIQUE(user_id)
      )
    `;

    // 3. Create personality_scans table
    console.log('🧠 Creating personality_scans table...');
    await sql`
      CREATE TABLE IF NOT EXISTS personality_scans (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

        -- Scan answers
        current_situation TEXT,
        dating_feeling INTEGER,
        main_obstacles TEXT[],
        goal_30_90_days TEXT,
        social_strengths TEXT,
        dating_difficulty TEXT,
        weekly_commitment TEXT,

        -- AI analysis
        ai_generated_profile JSONB,
        strength_self TEXT,
        weakness_self TEXT,

        -- Metadata
        completed_at TIMESTAMP WITH TIME ZONE,
        analysis_version TEXT DEFAULT '1.0',

        UNIQUE(user_id)
      )
    `;

    // 4. Create activity_log table for detailed tracking
    console.log('📈 Creating activity_log table...');
    await sql`
      CREATE TABLE IF NOT EXISTS activity_log (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        activity_type TEXT NOT NULL,
        data JSONB DEFAULT '{}'::jsonb,
        points_earned INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // 5. Create goals table
    console.log('🎯 Creating goals table...');
    await sql`
      CREATE TABLE IF NOT EXISTS goals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        target_value INTEGER,
        current_value INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        category TEXT,
        priority TEXT DEFAULT 'medium',
        deadline DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE
      )
    `;

    // 6. Create user_progress table
    console.log('📊 Creating user_progress table...');
    await sql`
      CREATE TABLE IF NOT EXISTS user_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        metric_name TEXT NOT NULL,
        metric_value INTEGER DEFAULT 0,
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

        UNIQUE(user_id, metric_name)
      )
    `;

    // 7. Create indexes for performance
    console.log('⚡ Creating performance indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_activity_user_type ON activity_log(user_id, activity_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log(created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_goals_user_status ON goals(user_id, status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_goals_category ON goals(category)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_progress_user ON user_progress(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_created ON users(created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_user_profiles_user ON user_profiles(user_id)`;

    console.log('✅ Database migration completed successfully!');

    return NextResponse.json({
      success: true,
      message: 'Comprehensive database migration completed successfully',
      tables_created: [
        'coaching_profiles',
        'personality_scans',
        'activity_log',
        'goals',
        'user_progress'
      ],
      indexes_created: [
        'idx_activity_user_type',
        'idx_activity_created',
        'idx_goals_user_status',
        'idx_goals_category',
        'idx_progress_user',
        'idx_users_email',
        'idx_users_created',
        'idx_user_profiles_user'
      ]
    });
  } catch (error) {
    console.error('❌ Database migration failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}