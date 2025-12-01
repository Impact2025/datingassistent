import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST() {
  try {
    console.log('Creating life vision tables...');

    // Create tables one by one to avoid Turbopack issues with sql.unsafe()
    await sql`
      CREATE TABLE IF NOT EXISTS levensvisie_assessments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE,
        status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
        total_time_seconds INTEGER,
        confidence_score DECIMAL(3,1),
        -- Horizon scan data
        horizon_scan JSONB, -- User's future vision responses
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created levensvisie_assessments table');

    await sql`
      CREATE TABLE IF NOT EXISTS levensvisie_responses (
        id SERIAL PRIMARY KEY,
        assessment_id INTEGER NOT NULL REFERENCES levensvisie_assessments(id) ON DELETE CASCADE,
        question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('horizon_scan', 'values_mapping', 'future_partner')),
        question_id INTEGER NOT NULL,
        response_value TEXT, -- Can be text, json, or multiple choice
        response_metadata JSONB, -- Additional data like importance ratings
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created levensvisie_responses table');

    await sql`
      CREATE TABLE IF NOT EXISTS levensvisie_results (
        id SERIAL PRIMARY KEY,
        assessment_id INTEGER NOT NULL REFERENCES levensvisie_assessments(id) ON DELETE CASCADE UNIQUE,

        -- Life vision profile
        levensvisie_profiel JSONB, -- Complete life vision blueprint
        toekomst_kompas JSONB, -- Future compass values and directions
        levensrichting_analyse TEXT, -- AI analysis of life direction

        -- 12 domain scores (0-100)
        carrière_betekenis_score DECIMAL(5,2) CHECK (carrière_betekenis_score BETWEEN 0 AND 100),
        vrijheid_lifestyle_score DECIMAL(5,2) CHECK (vrijheid_lifestyle_score BETWEEN 0 AND 100),
        familie_relaties_score DECIMAL(5,2) CHECK (familie_relaties_score BETWEEN 0 AND 100),
        groei_ritme_score DECIMAL(5,2) CHECK (groei_ritme_score BETWEEN 0 AND 100),
        emotionele_stabiliteit_score DECIMAL(5,2) CHECK (emotionele_stabiliteit_score BETWEEN 0 AND 100),
        spiritualiteit_ontwikkeling_score DECIMAL(5,2) CHECK (spiritualiteit_ontwikkeling_score BETWEEN 0 AND 100),
        sociale_energie_score DECIMAL(5,2) CHECK (sociale_energie_score BETWEEN 0 AND 100),
        financiële_visie_score DECIMAL(5,2) CHECK (financiële_visie_score BETWEEN 0 AND 100),
        gezondheid_welzijn_score DECIMAL(5,2) CHECK (gezondheid_welzijn_score BETWEEN 0 AND 100),
        avontuur_verkenning_score DECIMAL(5,2) CHECK (avontuur_verkenning_score BETWEEN 0 AND 100),
        stabiliteit_zekerheid_score DECIMAL(5,2) CHECK (stabiliteit_zekerheid_score BETWEEN 0 AND 100),
        maatschappelijke_bijdrage_score DECIMAL(5,2) CHECK (maatschappelijke_bijdrage_score BETWEEN 0 AND 100),

        -- Future partner profile
        toekomst_partner_profiel JSONB, -- 5-7 core qualities for future-fit partner
        niet_onderhandelbare_punten TEXT[], -- Non-negotiable future points
        partner_behoeften TEXT[], -- What partner needs to thrive in your world
        valkuilen TEXT[], -- Warning signs for mismatched partners

        -- Compatibility predictions
        lifestyle_match_predictie DECIMAL(5,2) CHECK (lifestyle_match_predictie BETWEEN 0 AND 100),
        ambitie_match_predictie DECIMAL(5,2) CHECK (ambitie_match_predictie BETWEEN 0 AND 100),
        relatie_ritme_match_predictie DECIMAL(5,2) CHECK (relatie_ritme_match_predictie BETWEEN 0 AND 100),
        gezin_visie_match_predictie DECIMAL(5,2) CHECK (gezin_visie_match_predictie BETWEEN 0 AND 100),
        energie_niveau_match_predictie DECIMAL(5,2) CHECK (energie_niveau_match_predictie BETWEEN 0 AND 100),
        groei_richting_match_predictie DECIMAL(5,2) CHECK (groei_richting_match_predictie BETWEEN 0 AND 100),

        -- Dating strategy
        beste_date_types TEXT[], -- Best date types for your future vision
        toekomst_delen_guidelines JSONB, -- When and how to share future vision
        levensvisie_bespreken_timing TEXT, -- When to discuss life vision
        profiel_aandachtspunten TEXT[], -- What to look for in profiles
        gedeelde_visie_signalen TEXT[], -- Signs someone shares your direction

        -- Risk assessment
        mismatch_risicos TEXT[], -- Areas where relationships might clash
        onbespreekbare_dealbreakers TEXT[], -- Dealbreakers you didn't know you had

        -- AI-generated content
        toekomst_routekaart JSONB, -- Personal dating roadmap
        communicatie_scripts JSONB, -- Scripts for sharing vision authentically
        zelfreflectie_prompts TEXT[], -- Prompts for ongoing reflection

        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created levensvisie_results table');

    // Assessment questions table (static data)
    await sql`
      CREATE TABLE IF NOT EXISTS levensvisie_questions (
        id SERIAL PRIMARY KEY,
        phase VARCHAR(20) NOT NULL CHECK (phase IN ('horizon_scan', 'values_mapping', 'future_partner')),
        question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('open_text', 'multiple_choice', 'scale', 'ranking')),
        question_text TEXT NOT NULL,
        domain VARCHAR(30), -- Which of the 12 domains this relates to
        options JSONB, -- For multiple choice questions
        order_position INTEGER NOT NULL UNIQUE,
        is_required BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created levensvisie_questions table');

    // User progress and evolution tracking
    await sql`
      CREATE TABLE IF NOT EXISTS levensvisie_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        last_assessment_id INTEGER REFERENCES levensvisie_assessments(id),
        assessment_count INTEGER DEFAULT 0,
        visie_clarity_score DECIMAL(5,2), -- How clear user's vision has become
        partner_criteria_evolution JSONB, -- How partner criteria have evolved
        life_changes_since_last JSONB, -- Major life changes affecting vision
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id)
      );
    `;
    console.log('✅ Created levensvisie_progress table');

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_levensvisie_assessments_user_id ON levensvisie_assessments(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_levensvisie_assessments_status ON levensvisie_assessments(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_levensvisie_responses_assessment_id ON levensvisie_responses(assessment_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_levensvisie_results_assessment_id ON levensvisie_results(assessment_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_levensvisie_progress_user_id ON levensvisie_progress(user_id);`;
    console.log('✅ Created indexes');

    // Insert the assessment questions for all 3 phases
    await sql`
      INSERT INTO levensvisie_questions (phase, question_type, question_text, domain, options, order_position, is_required) VALUES
      -- Horizon Scan Phase (2-3 min)
      ('horizon_scan', 'open_text', 'Waar zie jij jezelf wonen over 5 jaar? Beschrijf het zo levendig mogelijk.', 'vrijheid_lifestyle', NULL, 1, true),
      ('horizon_scan', 'open_text', 'Hoe ziet jouw ideale week eruit? Wat doe je van maandag tot zondag?', 'sociale_energie', NULL, 2, true),
      ('horizon_scan', 'multiple_choice', 'Welke drie woorden beschrijven het beste hoe jij je toekomst ziet?', NULL, '["Avontuurlijk", "Stabiel", "Groeiend", "Harmonieus", "Ambitieus", "Vrij", "Verbindend", "Spiritueel", "Financieel onafhankelijk", "Familiegericht", "Solistisch", "Maatschappelijk"]', 3, true),
      ('horizon_scan', 'scale', 'Hoe belangrijk is persoonlijke groei en ontwikkeling in jouw leven?', 'groei_ritme', NULL, 4, true),
      ('horizon_scan', 'scale', 'Hoe belangrijk is stabiliteit en zekerheid voor jou?', 'stabiliteit_zekerheid', NULL, 5, true),
      ('horizon_scan', 'scale', 'Hoe belangrijk is avontuur en nieuwe ervaringen?', 'avontuur_verkenning', NULL, 6, true),
      ('horizon_scan', 'scale', 'Hoe belangrijk is maatschappelijke bijdrage en impact?', 'maatschappelijke_bijdrage', NULL, 7, true),

      -- Values & Direction Mapping (12 domains)
      ('values_mapping', 'ranking', 'Rangschik deze levensgebieden op belangrijkheid voor jouw toekomst (1=meest belangrijk): carrière, gezondheid, relaties, vrije tijd, financiën, persoonlijke ontwikkeling', NULL, NULL, 8, true),
      ('values_mapping', 'open_text', 'Wat geeft jou het gevoel van betekenis en purpose in het leven?', 'carrière_betekenis', NULL, 9, true),
      ('values_mapping', 'multiple_choice', 'Wat is jouw ideale balans tussen alleen-tijd en sociale tijd?', 'sociale_energie', '["Veel alleen-tijd nodig", "Evenwicht tussen alleen en sociaal", "Veel sociale energie en mensen om me heen"]', 10, true),
      ('values_mapping', 'scale', 'Hoe belangrijk is spirituele of persoonlijke ontwikkeling voor jou?', 'spiritualiteit_ontwikkeling', NULL, 11, true),
      ('values_mapping', 'open_text', 'Hoe zie jij de rol van familie en relaties in jouw toekomst?', 'familie_relaties', NULL, 12, true),
      ('values_mapping', 'multiple_choice', 'Wat is jouw natuurlijke tempo van verandering en groei?', 'groei_ritme', '["Langzaam en geleidelijk", "Balans tussen stabiliteit en groei", "Snel en voortdurend in beweging"]', 13, true),

      -- Future Partner Profile
      ('future_partner', 'open_text', 'Wat heeft jouw ideale partner nodig om zich volledig thuis te voelen in jouw wereld?', NULL, NULL, 14, true),
      ('future_partner', 'multiple_choice', 'Welke eigenschappen moet jouw partner absoluut hebben om jouw leven te versterken?', NULL, '["Deel dezelfde levensrichting", "Brengt balans in mijn leven", "Uitdaagt me te groeien", "Deel dezelfde waarden", "Begrijpt mijn behoeften", "Heeft eigen passies en doelen"]', 15, true),
      ('future_partner', 'open_text', 'Welke "onbespreekbare dealbreakers" heb je voor een levenspartner?', NULL, NULL, 16, true),
      ('future_partner', 'scale', 'Hoe belangrijk is het dat jullie dezelfde energie en tempo hebben?', NULL, NULL, 17, true),
      ('future_partner', 'open_text', 'Beschrijf een dag uit het leven van jullie samen over 5 jaar.', NULL, NULL, 18, true)
      ON CONFLICT (order_position) DO NOTHING;
    `;
    console.log('✅ Inserted questions');

    return NextResponse.json({
      success: true,
      message: 'Levensvisie database tables initialized successfully!',
      details: {
        timestamp: new Date().toISOString(),
        tables: [
          'levensvisie_assessments',
          'levensvisie_responses',
          'levensvisie_results',
          'levensvisie_questions',
          'levensvisie_progress'
        ],
        questionsInserted: 18,
        domainsCovered: 12
      },
    });
  } catch (error: any) {
    console.error('Error initializing levensvisie tables:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to initialize levensvisie database tables',
        details: error.message,
      },
      { status: 500 }
    );
  }
}