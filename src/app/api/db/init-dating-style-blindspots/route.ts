import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST() {
  try {
    console.log('Creating dating style & blind spots tables...');

    // Create tables one by one to avoid Turbopack issues with sql.unsafe()
    await sql`
      CREATE TABLE IF NOT EXISTS dating_blindspots_assessments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE,
        status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'uploading', 'analysing', 'completed', 'abandoned')),
        total_time_seconds INTEGER,
        confidence_score DECIMAL(3,1),
        -- Micro-intake data
        relatiestatus VARCHAR(50), -- single, dating, relationship, etc.
        grootste_frustratie TEXT, -- biggest frustration with dating
        doel_meten_daten TEXT, -- goal with dating
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created dating_blindspots_assessments table');

    await sql`
      CREATE TABLE IF NOT EXISTS dating_blindspots_responses (
        id SERIAL PRIMARY KEY,
        assessment_id INTEGER NOT NULL REFERENCES dating_blindspots_assessments(id) ON DELETE CASCADE,
        question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('statement', 'scenario', 'open')),
        question_id INTEGER NOT NULL,
        response_value INTEGER, -- For Likert scale 1-5, or scenario choice A/B/C
        response_text TEXT, -- For open-ended responses
        response_time_ms INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created dating_blindspots_responses table');

    await sql`
      CREATE TABLE IF NOT EXISTS dating_blindspots_results (
        id SERIAL PRIMARY KEY,
        assessment_id INTEGER NOT NULL REFERENCES dating_blindspots_assessments(id) ON DELETE CASCADE UNIQUE,

        -- Primary dating style
        primary_style VARCHAR(50) NOT NULL CHECK (primary_style IN ('initiator', 'voorzichtige_planner', 'spontane_avonturier', 'pleaser', 'strategische_selector', 'afstandelijke', 'overdeler', 'ghost_prone')),
        secondary_styles JSONB, -- Array of {style, percentage} objects

        -- Style scores (0-100)
        initiator_score DECIMAL(5,2) NOT NULL CHECK (initiator_score BETWEEN 0 AND 100),
        voorzichtige_planner_score DECIMAL(5,2) NOT NULL CHECK (voorzichtige_planner_score BETWEEN 0 AND 100),
        spontane_avonturier_score DECIMAL(5,2) NOT NULL CHECK (spontane_avonturier_score BETWEEN 0 AND 100),
        pleaser_score DECIMAL(5,2) NOT NULL CHECK (pleaser_score BETWEEN 0 AND 100),
        strategische_selector_score DECIMAL(5,2) NOT NULL CHECK (strategische_selector_score BETWEEN 0 AND 100),
        afstandelijke_score DECIMAL(5,2) NOT NULL CHECK (afstandelijke_score BETWEEN 0 AND 100),
        overdeler_score DECIMAL(5,2) NOT NULL CHECK (overdeler_score BETWEEN 0 AND 100),
        ghost_prone_score DECIMAL(5,2) NOT NULL CHECK (ghost_prone_score BETWEEN 0 AND 100),

        -- Blind spot analysis
        blindspot_index DECIMAL(5,2) NOT NULL CHECK (blindspot_index BETWEEN 0 AND 100),
        top_blindspots TEXT[], -- Top 3 blind spots with examples
        blindspot_level VARCHAR(20) CHECK (blindspot_level IN ('perfect_aligned', 'licht_verschoven', 'medium_mismatch', 'grote_mismatch')),

        -- Validity and quality metrics
        validity_warnings TEXT[],
        completion_rate DECIMAL(3,1),
        response_variance DECIMAL(5,2),

        -- AI-generated content
        headline TEXT, -- "Jouw datingstijl: De Initiator (88% confidence)"
        one_liner TEXT, -- Short characterization
        sterke_punten TEXT[], -- Top 3 strengths
        aandachtspunten TEXT[], -- Areas for improvement
        chat_scripts JSONB, -- 6 scripts (2 openers, 2 boundaries, 2 follow-ups)
        micro_interventies JSONB, -- 3 micro-interventions (7-14 days)
        match_filters JSONB, -- What to look for in profiles/conversations
        date_voorkeuren TEXT[], -- Preferred date types
        vermijd_dates TEXT[], -- Dates to avoid

        -- Tool integrations
        recommended_tools JSONB, -- Links to related tools

        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created dating_blindspots_results table');

    // Assessment questions table (static data)
    await sql`
      CREATE TABLE IF NOT EXISTS dating_blindspots_questions (
        id SERIAL PRIMARY KEY,
        question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('statement', 'scenario', 'open')),
        question_text TEXT NOT NULL,
        category VARCHAR(30) NOT NULL CHECK (category IN ('communicatie_stijl', 'date_aanpak', 'relatie_verwachtingen', 'conflict_afhandeling', 'zelfvertrouwen', 'grenzen', 'modern_dating')),
        is_reverse_scored BOOLEAN DEFAULT FALSE,
        weight DECIMAL(3,2) DEFAULT 1.0,
        order_position INTEGER NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created dating_blindspots_questions table');

    // Scenario options for scenario-type questions
    await sql`
      CREATE TABLE IF NOT EXISTS dating_blindspots_scenarios (
        id SERIAL PRIMARY KEY,
        question_id INTEGER NOT NULL REFERENCES dating_blindspots_questions(id) ON DELETE CASCADE,
        option_text TEXT NOT NULL,
        associated_styles TEXT[], -- Array of style names this option indicates
        weight DECIMAL(3,2) DEFAULT 1.0,
        order_position INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(question_id, order_position)
      );
    `;
    console.log('✅ Created dating_blindspots_scenarios table');

    // User progress tracking
    await sql`
      CREATE TABLE IF NOT EXISTS dating_blindspots_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        last_assessment_id INTEGER REFERENCES dating_blindspots_assessments(id),
        assessment_count INTEGER DEFAULT 0,
        can_retake_after TIMESTAMP WITH TIME ZONE,
        life_events_since_last JSONB,
        blindspot_improvement_over_time JSONB, -- Track how blind spots change
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id)
      );
    `;
    console.log('✅ Created dating_blindspots_progress table');

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_dating_blindspots_assessments_user_id ON dating_blindspots_assessments(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_dating_blindspots_assessments_status ON dating_blindspots_assessments(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_dating_blindspots_responses_assessment_id ON dating_blindspots_responses(assessment_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_dating_blindspots_results_assessment_id ON dating_blindspots_results(assessment_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_dating_blindspots_progress_user_id ON dating_blindspots_progress(user_id);`;
    console.log('✅ Created indexes');

    // Insert the 12 core questions + 2 scenarios + 1 open question
    await sql`
      INSERT INTO dating_blindspots_questions (question_type, question_text, category, is_reverse_scored, weight, order_position) VALUES
      -- Gedragsstatements
      ('statement', 'Ik stuur meestal het eerste bericht.', 'communicatie_stijl', false, 1.0, 1),
      ('statement', 'Ik ga snel van online chat naar daten in het echt.', 'date_aanpak', false, 1.0, 2),
      ('statement', 'Ik houd vast aan een checklist van "must-haves".', 'relatie_verwachtingen', false, 1.0, 3),
      ('statement', 'Ik laat vaak gesprekken uitdoven als ze niet mijn onmiddellijke interesse wekken.', 'communicatie_stijl', false, 1.0, 4),
      ('statement', 'Ik deel snel veel persoonlijke informatie.', 'communicatie_stijl', false, 1.0, 5),
      ('statement', 'Ik heb moeite met lachen of lichtheid in een eerste date.', 'zelfvertrouwen', false, 1.0, 6),
      ('statement', 'Ik check vaak profielstatistieken en wacht op reacties.', 'modern_dating', false, 1.0, 7),
      ('statement', 'Ik reageer afwijzend als iemand te veel vraagt.', 'grenzen', false, 1.0, 8),
      ('statement', 'Ik pas mijn bio/gesprekken sterk aan op wat anderen leuk lijken te vinden.', 'zelfvertrouwen', false, 1.0, 9),
      ('statement', 'Ik geef snel complimenten om interesse te tonen.', 'communicatie_stijl', false, 1.0, 10),
      ('statement', 'Ik stel vaak tests/questions om iemands intenties te checken.', 'relatie_verwachtingen', false, 1.0, 11),
      ('statement', 'Ik heb een vaste routine/ritueel voor dates (ruimte, tempo, activiteiten).', 'date_aanpak', false, 1.0, 12),

      -- Scenario oefeningen
      ('scenario', 'Je match reageert drie uur niet op een belangrijk appje. Wat gebeurt er van binnen?', 'communicatie_stijl', false, 1.0, 13),
      ('scenario', 'Tijdens een kleine miscommunicatie op date 2 zegt iemand: "Laat maar, maakt niet uit."', 'conflict_afhandeling', false, 1.0, 14),

      -- Open prompt
      ('open', 'Wat is het terugkerende probleem dat je het meest frustreert aan daten?', 'modern_dating', false, 1.0, 15)
      ON CONFLICT (order_position) DO NOTHING;
    `;
    console.log('✅ Inserted questions');

    // Insert scenario options
    await sql`
      INSERT INTO dating_blindspots_scenarios (question_id, option_text, associated_styles, weight, order_position) VALUES
      -- Scenario A: App gedrag
      ((SELECT id FROM dating_blindspots_questions WHERE order_position = 13), 'Ik raak onrustig en probeer te analyseren wat er misgaat.', ARRAY['voorzichtige_planner', 'pleaser'], 1.0, 1),
      ((SELECT id FROM dating_blindspots_questions WHERE order_position = 13), 'Ik denk: "Prima, iedereen is druk."', ARRAY['afstandelijke'], 1.0, 2),
      ((SELECT id FROM dating_blindspots_questions WHERE order_position = 13), 'Ik trek me emotioneel terug: "Dit is waarom ik niet te close moet worden."', ARRAY['ghost_prone'], 1.0, 3),

      -- Scenario B: Conflict
      ((SELECT id FROM dating_blindspots_questions WHERE order_position = 14), 'Ik wil het meteen oplossen.', ARRAY['initiator'], 1.0, 1),
      ((SELECT id FROM dating_blindspots_questions WHERE order_position = 14), 'Ik laat het rusten, maar voel me wel minder zeker.', ARRAY['pleaser'], 1.0, 2),
      ((SELECT id FROM dating_blindspots_questions WHERE order_position = 14), 'Ik sluit me af en praat over iets anders.', ARRAY['afstandelijke'], 1.0, 3)
      ON CONFLICT (question_id, order_position) DO NOTHING;
    `;
    console.log('✅ Inserted scenario options');

    return NextResponse.json({
      success: true,
      message: 'Dating style & blind spots database tables initialized successfully!',
      details: {
        timestamp: new Date().toISOString(),
        tables: [
          'dating_blindspots_assessments',
          'dating_blindspots_responses',
          'dating_blindspots_results',
          'dating_blindspots_questions',
          'dating_blindspots_scenarios',
          'dating_blindspots_progress'
        ],
        questionsInserted: 15,
        scenariosInserted: 6,
        features: [
          'blind_spot_analysis',
          'micro_interventions',
          'tool_integrations',
          'progress_tracking'
        ]
      },
    });
  } catch (error: any) {
    console.error('Error initializing dating blindspots tables:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to initialize dating style & blind spots database tables',
        details: error.message,
      },
      { status: 500 }
    );
  }
}