/**
 * Migration: De Dating Snapshot - Wereldklasse Onboarding
 *
 * Creates complete database schema for the new onboarding system:
 * - user_onboarding_profiles: Main profile table with 50+ fields
 * - user_onboarding_answers: Individual answer logging
 * - onboarding_personalization_rules: Configurable rules
 * - PostgreSQL functions for score calculations
 * - Triggers for automatic personalization
 */

import { sql } from '@vercel/postgres';

async function migrateDatingSnapshot() {
  console.log('🚀 Starting Dating Snapshot migration...\n');

  try {
    // =====================================================
    // STEP 1: CREATE MAIN ONBOARDING PROFILES TABLE
    // =====================================================
    console.log('📊 Creating user_onboarding_profiles table...');

    await sql`
      CREATE TABLE IF NOT EXISTS user_onboarding_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        course_id INTEGER,

        -- ===== SECTIE 1: BASIS PROFIEL =====
        display_name VARCHAR(100),
        age INTEGER,
        location_city VARCHAR(100),
        occupation VARCHAR(200),
        single_since VARCHAR(50),
        longest_relationship_months INTEGER,

        -- ===== SECTIE 2: DATING SITUATIE =====
        apps_used JSONB DEFAULT '[]',
        primary_app VARCHAR(50),
        app_experience_months INTEGER,
        matches_per_week INTEGER,
        matches_to_conversations_pct INTEGER,
        conversations_to_dates_pct INTEGER,
        dates_last_3_months INTEGER,
        last_date_recency VARCHAR(50),

        -- ===== SECTIE 3: ENERGIE PROFIEL =====
        energy_after_social INTEGER,
        conversation_preference VARCHAR(20),
        call_preparation INTEGER,
        post_date_need VARCHAR(20),
        recharge_method VARCHAR(50),
        social_battery_capacity INTEGER,
        social_media_fatigue INTEGER,
        introvert_score INTEGER,
        energy_profile VARCHAR(20),

        -- ===== SECTIE 4: PIJNPUNTEN =====
        pain_points_ranked JSONB DEFAULT '[]',
        primary_pain_point VARCHAR(50),
        secondary_pain_point VARCHAR(50),
        pain_point_severity INTEGER,
        biggest_frustration TEXT,
        tried_solutions JSONB DEFAULT '[]',

        -- ===== SECTIE 5: HECHTINGSSTIJL =====
        attachment_q1_abandonment INTEGER,
        attachment_q2_trust INTEGER,
        attachment_q3_intimacy INTEGER,
        attachment_q4_validation INTEGER,
        attachment_q5_withdraw INTEGER,
        attachment_q6_independence INTEGER,
        attachment_q7_closeness INTEGER,
        attachment_style_predicted VARCHAR(30),
        attachment_confidence INTEGER,

        -- ===== SECTIE 6: DOELEN =====
        relationship_goal VARCHAR(30),
        timeline_preference VARCHAR(30),
        one_year_vision TEXT,
        success_definition TEXT,
        commitment_level INTEGER,
        weekly_time_available INTEGER,

        -- ===== SECTIE 7: EERDERE ERVARINGEN =====
        has_been_ghosted BOOLEAN DEFAULT false,
        ghosting_frequency VARCHAR(20),
        ghosting_impact INTEGER,
        has_experienced_burnout BOOLEAN DEFAULT false,
        burnout_severity INTEGER,
        previous_coaching BOOLEAN DEFAULT false,
        how_found_us VARCHAR(50),

        -- ===== BEREKENDE SCORES =====
        dating_readiness_score INTEGER,
        urgency_score INTEGER,
        complexity_score INTEGER,

        -- ===== PERSONALISATIE FLAGS =====
        enable_introvert_mode BOOLEAN DEFAULT false,
        needs_extra_ghosting_support BOOLEAN DEFAULT false,
        needs_burnout_prevention BOOLEAN DEFAULT false,
        needs_confidence_building BOOLEAN DEFAULT false,
        needs_extra_validation BOOLEAN DEFAULT false,
        recommended_pace VARCHAR(20) DEFAULT 'normal',

        -- ===== PROGRESS TRACKING =====
        current_section INTEGER DEFAULT 1,
        completed_sections JSONB DEFAULT '[]',
        answers_json JSONB DEFAULT '{}',

        -- ===== META =====
        started_at TIMESTAMP DEFAULT NOW(),
        completed_at TIMESTAMP,
        completion_time_seconds INTEGER,
        completion_percentage INTEGER DEFAULT 0,
        is_complete BOOLEAN DEFAULT false,
        last_updated TIMESTAMP DEFAULT NOW(),

        UNIQUE(user_id)
      )
    `;
    console.log('✅ user_onboarding_profiles table created\n');

    // =====================================================
    // STEP 2: CREATE INDEXES
    // =====================================================
    console.log('🔍 Creating indexes...');

    await sql`CREATE INDEX IF NOT EXISTS idx_onboarding_profiles_user ON user_onboarding_profiles(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_onboarding_profiles_complete ON user_onboarding_profiles(is_complete)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_onboarding_profiles_energy ON user_onboarding_profiles(energy_profile)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_onboarding_profiles_attachment ON user_onboarding_profiles(attachment_style_predicted)`;

    console.log('✅ Indexes created\n');

    // =====================================================
    // STEP 3: CREATE ANSWER LOG TABLE
    // =====================================================
    console.log('📝 Creating user_onboarding_answers table...');

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

    await sql`CREATE INDEX IF NOT EXISTS idx_onboarding_answers_user ON user_onboarding_answers(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_onboarding_answers_section ON user_onboarding_answers(section_id)`;

    console.log('✅ user_onboarding_answers table created\n');

    // =====================================================
    // STEP 4: CREATE WELCOME TEMPLATES TABLE
    // =====================================================
    console.log('💌 Creating onboarding_welcome_templates table...');

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

    console.log('✅ onboarding_welcome_templates table created\n');

    // =====================================================
    // STEP 5: INSERT DEFAULT WELCOME TEMPLATES
    // =====================================================
    console.log('📨 Inserting welcome message templates...');

    // Check if templates exist
    const existingTemplates = await sql`
      SELECT COUNT(*) as count FROM onboarding_welcome_templates
    `;

    if (parseInt(existingTemplates.rows[0].count) === 0) {
      // Introvert welcome
      await sql`
        INSERT INTO onboarding_welcome_templates
        (template_name, template_type, condition_json, subject_line, message_body, priority)
        VALUES (
          'welcome_introvert',
          'full_welcome',
          '{"energy_profile": "introvert"}',
          'Welkom bij je Transformatie, {name}!',
          'Hoi {name},

Wat fijn dat je er bent. Ik heb je antwoorden bekeken en ik begrijp je situatie.

**Wat ik zie:**
Je bent een introvert die "{primary_pain_point_text}" als grootste uitdaging ervaart. Dat herken ik — en het goede nieuws is dat deze cursus speciaal is ontworpen met introverts in gedachten.

**Wat ik voor je heb ingesteld:**
✅ Introvert Modus geactiveerd — rustiger tempo, meer reflectietijd
✅ Energie Batterij afgestemd op jouw patroon
✅ Extra voorbereiding bij gespreksoefeningen

**Je hechtingsstijl lijkt:** {attachment_style_text}
In Module 2 gaan we hier dieper op in.

**Jouw doel:** {goal_text}
Over een jaar wil je: "{one_year_vision}"

Ik onthoud dit. En in Module 12 komen we hierop terug.

Klaar om te beginnen?

Iris',
          10
        )
      `;

      // Extrovert welcome
      await sql`
        INSERT INTO onboarding_welcome_templates
        (template_name, template_type, condition_json, subject_line, message_body, priority)
        VALUES (
          'welcome_extrovert',
          'full_welcome',
          '{"energy_profile": "extrovert"}',
          'Welkom bij je Transformatie, {name}!',
          'Hey {name}!

Super dat je erbij bent. Ik heb je antwoorden doorgenomen en ik ken je situatie nu.

**Wat opvalt:**
Je haalt energie uit sociale interactie — mooi! Maar je worstelt met "{primary_pain_point_text}". Dat gaan we aanpakken.

**Waar we aan werken:**
Je krijgt {matches_per_week} matches per week. We gaan focussen op kwaliteit boven kwantiteit.

**Je hechtingsstijl lijkt:** {attachment_style_text}
Module 2 duikt hier diep in.

**Jouw doel:** {goal_text}
"{one_year_vision}" — dat gaan we waarmaken.

Vol gas?

Iris',
          11
        )
      `;

      // Ambivert welcome
      await sql`
        INSERT INTO onboarding_welcome_templates
        (template_name, template_type, condition_json, subject_line, message_body, priority)
        VALUES (
          'welcome_ambivert',
          'full_welcome',
          '{"energy_profile": "ambivert"}',
          'Welkom bij je Transformatie, {name}!',
          'Hoi {name},

Goed om je te ontmoeten. Je bent een ambivert — je schakelt tussen sociale energie en rusttijd. Dat is een superkracht in dating.

**Je grootste uitdaging:** "{primary_pain_point_text}"
Daar gaan we vol op in.

**Je hechtingsstijl lijkt:** {attachment_style_text}
Herkenbaar? In Module 2 krijg je het complete plaatje.

**Jouw doel:** {goal_text}
Over een jaar: "{one_year_vision}"

Laten we beginnen!

Iris',
          12
        )
      `;

      console.log('✅ Welcome templates inserted\n');
    } else {
      console.log('⏭️ Welcome templates already exist, skipping\n');
    }

    // =====================================================
    // STEP 6: CREATE SCORE CALCULATION FUNCTIONS
    // =====================================================
    console.log('🧮 Creating score calculation functions...');

    // Drop existing functions first to avoid conflicts
    await sql`DROP FUNCTION IF EXISTS calculate_introvert_score(INTEGER, INTEGER, VARCHAR, INTEGER)`;
    await sql`DROP FUNCTION IF EXISTS determine_energy_profile(INTEGER)`;
    await sql`DROP FUNCTION IF EXISTS calculate_attachment_style(INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER)`;

    // Introvert score function
    await sql`
      CREATE OR REPLACE FUNCTION calculate_introvert_score(
        p_energy_after_social INTEGER,
        p_call_preparation INTEGER,
        p_post_date_need VARCHAR,
        p_social_battery INTEGER
      ) RETURNS INTEGER AS $$
      DECLARE
        score INTEGER := 0;
      BEGIN
        -- Energy after social (1=uitgeput=introvert, 5=energiek=extrovert)
        IF p_energy_after_social IS NOT NULL THEN
          score := score + ((6 - p_energy_after_social) * 15);
        END IF;

        -- Call preparation (1=nooit=extrovert, 5=altijd=introvert)
        IF p_call_preparation IS NOT NULL THEN
          score := score + (p_call_preparation * 5);
        END IF;

        -- Post date need
        IF p_post_date_need = 'alone_time' THEN
          score := score + 15;
        ELSIF p_post_date_need = 'depends' THEN
          score := score + 8;
        END IF;

        -- Social battery (1=laag=introvert, 10=hoog=extrovert)
        IF p_social_battery IS NOT NULL THEN
          score := score + ((11 - p_social_battery) * 2);
        END IF;

        RETURN LEAST(100, GREATEST(0, score));
      END;
      $$ LANGUAGE plpgsql
    `;

    // Energy profile function
    await sql`
      CREATE OR REPLACE FUNCTION determine_energy_profile(p_introvert_score INTEGER)
      RETURNS VARCHAR AS $$
      BEGIN
        IF p_introvert_score >= 65 THEN
          RETURN 'introvert';
        ELSIF p_introvert_score <= 35 THEN
          RETURN 'extrovert';
        ELSE
          RETURN 'ambivert';
        END IF;
      END;
      $$ LANGUAGE plpgsql
    `;

    console.log('✅ Score calculation functions created\n');

    // =====================================================
    // STEP 7: MIGRATE EXISTING TRANSFORMATIE ONBOARDING DATA
    // =====================================================
    console.log('🔄 Migrating existing transformatie_onboarding data...');

    const existingOnboarding = await sql`
      SELECT user_id, data, completed_at
      FROM transformatie_onboarding
      WHERE completed_at IS NOT NULL
    `;

    let migratedCount = 0;
    for (const row of existingOnboarding.rows) {
      const data = row.data as any;
      if (!data) continue;

      // Check if already migrated
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

    console.log(`✅ Migrated ${migratedCount} existing onboarding profiles\n`);

    // =====================================================
    // DONE
    // =====================================================
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Dating Snapshot migration completed successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\nTables created:');
    console.log('  • user_onboarding_profiles');
    console.log('  • user_onboarding_answers');
    console.log('  • onboarding_welcome_templates');
    console.log('\nFunctions created:');
    console.log('  • calculate_introvert_score()');
    console.log('  • determine_energy_profile()');
    console.log(`\nMigrated: ${migratedCount} existing profiles`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration
migrateDatingSnapshot()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
