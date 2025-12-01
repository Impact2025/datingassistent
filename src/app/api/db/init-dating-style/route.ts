import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST() {
  try {
    console.log('Creating dating style tables...');

    // Create tables one by one to avoid Turbopack issues with sql.unsafe()
    await sql`
      CREATE TABLE IF NOT EXISTS dating_style_assessments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE,
        status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
        total_time_seconds INTEGER,
        confidence_score DECIMAL(3,1),
        -- Micro-intake data
        huidige_dating_status VARCHAR(50), -- single, dating, relationship, etc.
        gewenste_relatie_type VARCHAR(50), -- casual, serious, marriage, etc.
        app_gebruik VARCHAR(20), -- frequent, occasional, never
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created dating_style_assessments table');

    await sql`
      CREATE TABLE IF NOT EXISTS dating_style_responses (
        id SERIAL PRIMARY KEY,
        assessment_id INTEGER NOT NULL REFERENCES dating_style_assessments(id) ON DELETE CASCADE,
        question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('statement', 'scenario')),
        question_id INTEGER NOT NULL,
        response_value INTEGER, -- For Likert scale 1-5, or scenario choice A/B/C
        response_text TEXT, -- For open-ended responses
        response_time_ms INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created dating_style_responses table');

    await sql`
      CREATE TABLE IF NOT EXISTS dating_style_results (
        id SERIAL PRIMARY KEY,
        assessment_id INTEGER NOT NULL REFERENCES dating_style_assessments(id) ON DELETE CASCADE UNIQUE,

        -- Overall dating style
        primary_style VARCHAR(50) NOT NULL CHECK (primary_style IN ('initiator', 'planner', 'adventurer', 'selector', 'pleaser', 'distant', 'over_sharer', 'ghost_prone')),

        -- Style scores (0-100)
        initiator_score DECIMAL(5,2) NOT NULL CHECK (initiator_score BETWEEN 0 AND 100),
        planner_score DECIMAL(5,2) NOT NULL CHECK (planner_score BETWEEN 0 AND 100),
        adventurer_score DECIMAL(5,2) NOT NULL CHECK (adventurer_score BETWEEN 0 AND 100),
        selector_score DECIMAL(5,2) NOT NULL CHECK (selector_score BETWEEN 0 AND 100),
        pleaser_score DECIMAL(5,2) NOT NULL CHECK (pleaser_score BETWEEN 0 AND 100),
        distant_score DECIMAL(5,2) NOT NULL CHECK (distant_score BETWEEN 0 AND 100),
        over_sharer_score DECIMAL(5,2) NOT NULL CHECK (over_sharer_score BETWEEN 0 AND 100),
        ghost_prone_score DECIMAL(5,2) NOT NULL CHECK (ghost_prone_score BETWEEN 0 AND 100),

        -- Validity and quality metrics
        validity_warnings TEXT[],
        completion_rate DECIMAL(3,1),
        response_variance DECIMAL(5,2),

        -- AI-generated content
        ai_stijl_profiel TEXT, -- Main style description
        moderne_dating_analyse TEXT, -- How style plays out in modern dating
        sterke_punten TEXT[], -- Strengths in dating
        aandachtspunten TEXT[], -- Areas for improvement
        date_voorkeuren TEXT[], -- Preferred date types
        vermijd_dates TEXT[], -- Dates to avoid
        chat_scripts JSONB, -- Communication scripts
        micro_exercises JSONB, -- Small exercises to improve
        match_filters JSONB, -- What to look for in matches

        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created dating_style_results table');

    // Assessment questions table (static data)
    await sql`
      CREATE TABLE IF NOT EXISTS dating_style_questions (
        id SERIAL PRIMARY KEY,
        question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('statement', 'scenario')),
        question_text TEXT NOT NULL,
        category VARCHAR(30) NOT NULL CHECK (category IN ('communicatie_stijl', 'date_aanpak', 'relatie_verwachtingen', 'conflict_afhandeling', 'zelfvertrouwen', 'grenzen', 'modern_dating')),
        is_reverse_scored BOOLEAN DEFAULT FALSE,
        weight DECIMAL(3,2) DEFAULT 1.0,
        order_position INTEGER NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created dating_style_questions table');

    // Scenario options for scenario-type questions
    await sql`
      CREATE TABLE IF NOT EXISTS dating_style_scenarios (
        id SERIAL PRIMARY KEY,
        question_id INTEGER NOT NULL REFERENCES dating_style_questions(id) ON DELETE CASCADE,
        option_text TEXT NOT NULL,
        associated_styles TEXT[], -- Array of style names this option indicates
        weight DECIMAL(3,2) DEFAULT 1.0,
        order_position INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(question_id, order_position)
      );
    `;
    console.log('✅ Created dating_style_scenarios table');

    // User progress tracking
    await sql`
      CREATE TABLE IF NOT EXISTS dating_style_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        last_assessment_id INTEGER REFERENCES dating_style_assessments(id),
        assessment_count INTEGER DEFAULT 0,
        can_retake_after TIMESTAMP WITH TIME ZONE,
        life_events_since_last JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id)
      );
    `;
    console.log('✅ Created dating_style_progress table');

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_dating_style_assessments_user_id ON dating_style_assessments(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_dating_style_assessments_status ON dating_style_assessments(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_dating_style_responses_assessment_id ON dating_style_responses(assessment_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_dating_style_results_assessment_id ON dating_style_results(assessment_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_dating_style_progress_user_id ON dating_style_progress(user_id);`;
    console.log('✅ Created indexes');

    // Insert the 16 core questions + 2 scenarios
    await sql`
      INSERT INTO dating_style_questions (question_type, question_text, category, is_reverse_scored, weight, order_position) VALUES
      -- Communicatie Stijl
      ('statement', 'Ik stuur meestal het eerste bericht in een chat.', 'communicatie_stijl', false, 1.0, 1),
      ('statement', 'Ik deel snel veel persoonlijke informatie online.', 'communicatie_stijl', false, 1.0, 2),
      ('statement', 'Ik vind het moeilijk om mijn gevoelens te uiten.', 'communicatie_stijl', false, 1.0, 3),

      -- Date Aanpak
      ('statement', 'Ik plan dates altijd van tevoren met een duidelijk doel.', 'date_aanpak', false, 1.0, 4),
      ('statement', 'Ik ga graag mee in spontane date-uitnodigingen.', 'date_aanpak', false, 1.0, 5),
      ('statement', 'Ik heb een lijst met eisen waaraan dates moeten voldoen.', 'date_aanpak', false, 1.0, 6),

      -- Relatie Verwachtingen
      ('statement', 'Ik wil graag de leiding nemen in een relatie.', 'relatie_verwachtingen', false, 1.0, 7),
      ('statement', 'Ik pas me gemakkelijk aan aan wat de ander wil.', 'relatie_verwachtingen', false, 1.0, 8),
      ('statement', 'Ik houd afstand totdat ik zeker weet dat het serieus is.', 'relatie_verwachtingen', false, 1.0, 9),

      -- Conflict Afhandeling
      ('statement', 'Ik probeer conflicten meteen op te lossen.', 'conflict_afhandeling', false, 1.0, 10),
      ('statement', 'Ik vermijd confrontaties waar mogelijk.', 'conflict_afhandeling', false, 1.0, 11),

      -- Zelfvertrouwen
      ('statement', 'Ik maak gemakkelijk complimenten aan anderen.', 'zelfvertrouwen', false, 1.0, 12),
      ('statement', 'Ik twijfel vaak aan mijn eigen aantrekkelijkheid.', 'zelfvertrouwen', false, 1.0, 13),

      -- Grenzen
      ('statement', 'Ik stel duidelijke grenzen als iets niet goed voelt.', 'grenzen', false, 1.0, 14),
      ('statement', 'Ik zeg soms ja tegen dingen die ik eigenlijk niet wil.', 'grenzen', false, 1.0, 15),

      -- Modern Dating
      ('statement', 'Ik gebruik dating apps meerdere keren per week.', 'modern_dating', false, 1.0, 16),

      -- Scenario questions
      ('scenario', 'Je hebt een leuke chat, maar de ander stelt een spontane date voor. Wat doe je?', 'date_aanpak', false, 1.0, 17),
      ('scenario', 'Tijdens een date loopt het gesprek niet soepel. Hoe reageer je?', 'communicatie_stijl', false, 1.0, 18)
      ON CONFLICT (order_position) DO NOTHING;
    `;
    console.log('✅ Inserted questions');

    // Insert scenario options
    await sql`
      INSERT INTO dating_style_scenarios (question_id, option_text, associated_styles, weight, order_position) VALUES
      -- Scenario 1: Spontane date
      ((SELECT id FROM dating_style_questions WHERE order_position = 17), 'Ik ga mee — spontaniteit is leuk!', ARRAY['adventurer'], 1.0, 1),
      ((SELECT id FROM dating_style_questions WHERE order_position = 17), 'Ik vraag om meer details en plan het dan.', ARRAY['planner'], 1.0, 2),
      ((SELECT id FROM dating_style_questions WHERE order_position = 17), 'Ik bedank — ik hou van planning.', ARRAY['selector'], 1.0, 3),

      -- Scenario 2: Slecht lopend gesprek
      ((SELECT id FROM dating_style_questions WHERE order_position = 18), 'Ik stel veel vragen om het gesprek op gang te brengen.', ARRAY['initiator', 'over_sharer'], 1.0, 1),
      ((SELECT id FROM dating_style_questions WHERE order_position = 18), 'Ik probeer de ander op zijn gemak te stellen.', ARRAY['pleaser'], 1.0, 2),
      ((SELECT id FROM dating_style_questions WHERE order_position = 18), 'Ik trek me terug en laat het loslopen.', ARRAY['distant', 'ghost_prone'], 1.0, 3)
      ON CONFLICT (question_id, order_position) DO NOTHING;
    `;
    console.log('✅ Inserted scenario options');

    return NextResponse.json({
      success: true,
      message: 'Dating style database tables initialized successfully!',
      details: {
        timestamp: new Date().toISOString(),
        tables: [
          'dating_style_assessments',
          'dating_style_responses',
          'dating_style_results',
          'dating_style_questions',
          'dating_style_scenarios',
          'dating_style_progress'
        ],
        questionsInserted: 18,
        scenariosInserted: 6
      },
    });
  } catch (error: any) {
    console.error('Error initializing dating style tables:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to initialize dating style database tables',
        details: error.message,
      },
      { status: 500 }
    );
  }
}