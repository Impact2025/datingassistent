/**
 * Admin API: Run Dating Snapshot Migration
 *
 * POST - Execute database migration for Dating Snapshot tables
 */

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getCurrentUser, isAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // Check admin authentication
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const adminAccess = await isAdmin(user.id);
    if (!adminAccess) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    console.log('🚀 Starting Dating Snapshot migration...\n');

    const logs: string[] = [];

    // Step 1: Create main profiles table
    logs.push('📊 Creating user_onboarding_profiles table...');
    await sql`
      CREATE TABLE IF NOT EXISTS user_onboarding_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        course_id INTEGER,
        display_name VARCHAR(100),
        age INTEGER,
        location_city VARCHAR(100),
        occupation VARCHAR(200),
        single_since VARCHAR(50),
        longest_relationship_months INTEGER,
        apps_used JSONB DEFAULT '[]',
        primary_app VARCHAR(50),
        app_experience_months INTEGER,
        matches_per_week INTEGER,
        matches_to_conversations_pct INTEGER,
        conversations_to_dates_pct INTEGER,
        dates_last_3_months INTEGER,
        last_date_recency VARCHAR(50),
        energy_after_social INTEGER,
        conversation_preference VARCHAR(20),
        call_preparation INTEGER,
        post_date_need VARCHAR(20),
        recharge_method VARCHAR(50),
        social_battery_capacity INTEGER,
        social_media_fatigue INTEGER,
        introvert_score INTEGER,
        energy_profile VARCHAR(20),
        pain_points_ranked JSONB DEFAULT '[]',
        primary_pain_point VARCHAR(50),
        secondary_pain_point VARCHAR(50),
        pain_point_severity INTEGER,
        biggest_frustration TEXT,
        tried_solutions JSONB DEFAULT '[]',
        attachment_q1_abandonment INTEGER,
        attachment_q2_trust INTEGER,
        attachment_q3_intimacy INTEGER,
        attachment_q4_validation INTEGER,
        attachment_q5_withdraw INTEGER,
        attachment_q6_independence INTEGER,
        attachment_q7_closeness INTEGER,
        attachment_style_predicted VARCHAR(30),
        attachment_confidence INTEGER,
        relationship_goal VARCHAR(30),
        timeline_preference VARCHAR(30),
        one_year_vision TEXT,
        success_definition TEXT,
        commitment_level INTEGER,
        weekly_time_available INTEGER,
        has_been_ghosted BOOLEAN DEFAULT false,
        ghosting_frequency VARCHAR(20),
        ghosting_impact INTEGER,
        has_experienced_burnout BOOLEAN DEFAULT false,
        burnout_severity INTEGER,
        previous_coaching BOOLEAN DEFAULT false,
        how_found_us VARCHAR(50),
        dating_readiness_score INTEGER,
        urgency_score INTEGER,
        complexity_score INTEGER,
        enable_introvert_mode BOOLEAN DEFAULT false,
        needs_extra_ghosting_support BOOLEAN DEFAULT false,
        needs_burnout_prevention BOOLEAN DEFAULT false,
        needs_confidence_building BOOLEAN DEFAULT false,
        needs_extra_validation BOOLEAN DEFAULT false,
        recommended_pace VARCHAR(20) DEFAULT 'normal',
        current_section INTEGER DEFAULT 1,
        completed_sections JSONB DEFAULT '[]',
        answers_json JSONB DEFAULT '{}',
        started_at TIMESTAMP DEFAULT NOW(),
        completed_at TIMESTAMP,
        completion_time_seconds INTEGER,
        completion_percentage INTEGER DEFAULT 0,
        is_complete BOOLEAN DEFAULT false,
        last_updated TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id)
      )
    `;
    logs.push('✅ user_onboarding_profiles table created');

    // Step 2: Create indexes
    logs.push('🔍 Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_onboarding_profiles_user ON user_onboarding_profiles(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_onboarding_profiles_complete ON user_onboarding_profiles(is_complete)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_onboarding_profiles_energy ON user_onboarding_profiles(energy_profile)`;
    logs.push('✅ Indexes created');

    // Step 3: Create answers table
    logs.push('📝 Creating user_onboarding_answers table...');
    await sql`
      CREATE TABLE IF NOT EXISTS user_onboarding_answers (
        id SERIAL PRIMARY KEY,
        onboarding_id INTEGER REFERENCES user_onboarding_profiles(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL,
        section_id INTEGER NOT NULL,
        section_name VARCHAR(50) NOT NULL,
        question_id VARCHAR(50) NOT NULL,
        question_text TEXT,
        answer_type VARCHAR(20) NOT NULL,
        answer_value TEXT,
        answer_numeric INTEGER,
        answer_json JSONB,
        answered_at TIMESTAMP DEFAULT NOW(),
        time_spent_seconds INTEGER
      )
    `;
    logs.push('✅ user_onboarding_answers table created');

    // Step 4: Create welcome templates table
    logs.push('💌 Creating onboarding_welcome_templates table...');
    await sql`
      CREATE TABLE IF NOT EXISTS onboarding_welcome_templates (
        id SERIAL PRIMARY KEY,
        template_name VARCHAR(100) NOT NULL,
        template_type VARCHAR(50) NOT NULL,
        condition_json JSONB,
        subject_line VARCHAR(255),
        message_body TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        priority INTEGER DEFAULT 100,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    logs.push('✅ onboarding_welcome_templates table created');

    // Step 5: Migrate existing data
    logs.push('🔄 Checking for existing data to migrate...');
    const existingOnboarding = await sql`
      SELECT user_id, data, completed_at
      FROM transformatie_onboarding
      WHERE completed_at IS NOT NULL
    `;

    let migratedCount = 0;
    for (const row of existingOnboarding.rows) {
      const data = row.data as any;
      if (!data) continue;

      const existing = await sql`
        SELECT id FROM user_onboarding_profiles WHERE user_id = ${row.user_id}
      `;

      if (existing.rows.length === 0) {
        await sql`
          INSERT INTO user_onboarding_profiles (
            user_id,
            display_name,
            primary_pain_point,
            relationship_goal,
            commitment_level,
            is_complete,
            completed_at,
            completion_percentage
          ) VALUES (
            ${row.user_id},
            ${data.preferredName || data.firstName || null},
            ${data.biggestChallenge || null},
            ${data.goals?.[0] || null},
            ${data.commitmentLevel === 'all_in' ? 10 : data.commitmentLevel === 'serious' ? 7 : 5},
            true,
            ${row.completed_at},
            100
          )
        `;
        migratedCount++;
      }
    }
    logs.push(`✅ Migrated ${migratedCount} existing profiles`);

    logs.push('🎉 Migration completed successfully!');

    return NextResponse.json({
      success: true,
      logs,
      migratedCount,
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: error.message || 'Migration failed' },
      { status: 500 }
    );
  }
}
