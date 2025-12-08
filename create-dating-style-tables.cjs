// Script to create Dating Style Scan database tables
const { sql } = require('@vercel/postgres');

async function createTables() {
  try {
    console.log('🚀 Creating Dating Style Scan tables...\n');

    // Create dating_style_assessments table
    await sql`
      CREATE TABLE IF NOT EXISTS dating_style_assessments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE,
        status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
        total_time_seconds INTEGER,
        confidence_score DECIMAL(3,1),
        huidige_dating_status VARCHAR(50),
        gewenste_relatie_type VARCHAR(50),
        app_gebruik VARCHAR(20),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created dating_style_assessments table');

    // Create dating_style_responses table
    await sql`
      CREATE TABLE IF NOT EXISTS dating_style_responses (
        id SERIAL PRIMARY KEY,
        assessment_id INTEGER NOT NULL REFERENCES dating_style_assessments(id) ON DELETE CASCADE,
        question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('statement', 'scenario')),
        question_id INTEGER NOT NULL,
        response_value INTEGER,
        response_text TEXT,
        response_time_ms INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created dating_style_responses table');

    // Create dating_style_results table
    await sql`
      CREATE TABLE IF NOT EXISTS dating_style_results (
        id SERIAL PRIMARY KEY,
        assessment_id INTEGER NOT NULL REFERENCES dating_style_assessments(id) ON DELETE CASCADE UNIQUE,
        primary_style VARCHAR(50) NOT NULL CHECK (primary_style IN ('initiator', 'planner', 'adventurer', 'selector', 'pleaser', 'distant', 'over_sharer', 'ghost_prone')),
        initiator_score DECIMAL(5,2) NOT NULL CHECK (initiator_score BETWEEN 0 AND 100),
        planner_score DECIMAL(5,2) NOT NULL CHECK (planner_score BETWEEN 0 AND 100),
        adventurer_score DECIMAL(5,2) NOT NULL CHECK (adventurer_score BETWEEN 0 AND 100),
        selector_score DECIMAL(5,2) NOT NULL CHECK (selector_score BETWEEN 0 AND 100),
        pleaser_score DECIMAL(5,2) NOT NULL CHECK (pleaser_score BETWEEN 0 AND 100),
        distant_score DECIMAL(5,2) NOT NULL CHECK (distant_score BETWEEN 0 AND 100),
        over_sharer_score DECIMAL(5,2) NOT NULL CHECK (over_sharer_score BETWEEN 0 AND 100),
        ghost_prone_score DECIMAL(5,2) NOT NULL CHECK (ghost_prone_score BETWEEN 0 AND 100),
        validity_warnings TEXT[],
        completion_rate DECIMAL(3,1),
        response_variance DECIMAL(5,2),
        ai_stijl_profiel TEXT,
        moderne_dating_analyse TEXT,
        sterke_punten TEXT[],
        aandachtspunten TEXT[],
        date_voorkeuren TEXT[],
        vermijd_dates TEXT[],
        chat_scripts JSONB,
        micro_exercises JSONB,
        match_filters JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created dating_style_results table');

    // Create dating_style_questions table
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

    // Create dating_style_scenarios table
    await sql`
      CREATE TABLE IF NOT EXISTS dating_style_scenarios (
        id SERIAL PRIMARY KEY,
        question_id INTEGER NOT NULL REFERENCES dating_style_questions(id) ON DELETE CASCADE,
        option_text TEXT NOT NULL,
        associated_styles TEXT[],
        weight DECIMAL(3,2) DEFAULT 1.0,
        order_position INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(question_id, order_position)
      );
    `;
    console.log('✅ Created dating_style_scenarios table');

    // Create dating_style_progress table
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

    // Insert questions
    await sql`
      INSERT INTO dating_style_questions (question_type, question_text, category, is_reverse_scored, weight, order_position) VALUES
      ('statement', 'Ik stuur meestal het eerste bericht in een chat.', 'communicatie_stijl', false, 1.0, 1),
      ('statement', 'Ik deel snel veel persoonlijke informatie online.', 'communicatie_stijl', false, 1.0, 2),
      ('statement', 'Ik vind het moeilijk om mijn gevoelens te uiten.', 'communicatie_stijl', false, 1.0, 3),
      ('statement', 'Ik plan dates altijd van tevoren met een duidelijk doel.', 'date_aanpak', false, 1.0, 4),
      ('statement', 'Ik ga graag mee in spontane date-uitnodigingen.', 'date_aanpak', false, 1.0, 5),
      ('statement', 'Ik heb een lijst met eisen waaraan dates moeten voldoen.', 'date_aanpak', false, 1.0, 6),
      ('statement', 'Ik wil graag de leiding nemen in een relatie.', 'relatie_verwachtingen', false, 1.0, 7),
      ('statement', 'Ik pas me gemakkelijk aan aan wat de ander wil.', 'relatie_verwachtingen', false, 1.0, 8),
      ('statement', 'Ik houd afstand totdat ik zeker weet dat het serieus is.', 'relatie_verwachtingen', false, 1.0, 9),
      ('statement', 'Ik probeer conflicten meteen op te lossen.', 'conflict_afhandeling', false, 1.0, 10),
      ('statement', 'Ik vermijd confrontaties waar mogelijk.', 'conflict_afhandeling', false, 1.0, 11),
      ('statement', 'Ik maak gemakkelijk complimenten aan anderen.', 'zelfvertrouwen', false, 1.0, 12),
      ('statement', 'Ik twijfel vaak aan mijn eigen aantrekkelijkheid.', 'zelfvertrouwen', false, 1.0, 13),
      ('statement', 'Ik stel duidelijke grenzen als iets niet goed voelt.', 'grenzen', false, 1.0, 14),
      ('statement', 'Ik zeg soms ja tegen dingen die ik eigenlijk niet wil.', 'grenzen', false, 1.0, 15),
      ('statement', 'Ik gebruik dating apps meerdere keren per week.', 'modern_dating', false, 1.0, 16),
      ('scenario', 'Je hebt een leuke chat, maar de ander stelt een spontane date voor. Wat doe je?', 'date_aanpak', false, 1.0, 17),
      ('scenario', 'Tijdens een date loopt het gesprek niet soepel. Hoe reageer je?', 'communicatie_stijl', false, 1.0, 18)
      ON CONFLICT (order_position) DO NOTHING;
    `;
    console.log('✅ Inserted questions');

    // Insert scenario options
    await sql`
      INSERT INTO dating_style_scenarios (question_id, option_text, associated_styles, weight, order_position) VALUES
      ((SELECT id FROM dating_style_questions WHERE order_position = 17), 'Ik ga mee — spontaniteit is leuk!', ARRAY['adventurer'], 1.0, 1),
      ((SELECT id FROM dating_style_questions WHERE order_position = 17), 'Ik vraag om meer details en plan het dan.', ARRAY['planner'], 1.0, 2),
      ((SELECT id FROM dating_style_questions WHERE order_position = 17), 'Ik bedank — ik hou van planning.', ARRAY['selector'], 1.0, 3),
      ((SELECT id FROM dating_style_questions WHERE order_position = 18), 'Ik stel veel vragen om het gesprek op gang te brengen.', ARRAY['initiator', 'over_sharer'], 1.0, 1),
      ((SELECT id FROM dating_style_questions WHERE order_position = 18), 'Ik probeer de ander op zijn gemak te stellen.', ARRAY['pleaser'], 1.0, 2),
      ((SELECT id FROM dating_style_questions WHERE order_position = 18), 'Ik trek me terug en laat het loslopen.', ARRAY['distant', 'ghost_prone'], 1.0, 3)
      ON CONFLICT (question_id, order_position) DO NOTHING;
    `;
    console.log('✅ Inserted scenario options\n');

    console.log('🎉 Dating Style Scan tables created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    process.exit(1);
  }
}

createTables();
