import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST() {
  try {
    console.log('Creating relationship patterns tables...');

    // Create tables one by one to avoid Turbopack issues with sql.unsafe()
    await sql`
      CREATE TABLE IF NOT EXISTS relationship_patterns_assessments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE,
        status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
        total_time_seconds INTEGER,
        confidence_score DECIMAL(3,1),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created relationship_patterns_assessments table');

    await sql`
      CREATE TABLE IF NOT EXISTS relationship_patterns_responses (
        id SERIAL PRIMARY KEY,
        assessment_id INTEGER NOT NULL REFERENCES relationship_patterns_assessments(id) ON DELETE CASCADE,
        question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('statement', 'scenario')),
        question_id INTEGER NOT NULL,
        response_value INTEGER,
        response_text TEXT,
        response_time_ms INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created relationship_patterns_responses table');

    await sql`
      CREATE TABLE IF NOT EXISTS relationship_patterns_results (
        id SERIAL PRIMARY KEY,
        assessment_id INTEGER NOT NULL REFERENCES relationship_patterns_assessments(id) ON DELETE CASCADE UNIQUE,
        idealize_score DECIMAL(5,2) NOT NULL CHECK (idealize_score BETWEEN 0 AND 100),
        avoid_conflict_score DECIMAL(5,2) NOT NULL CHECK (avoid_conflict_score BETWEEN 0 AND 100),
        rebound_score DECIMAL(5,2) NOT NULL CHECK (rebound_score BETWEEN 0 AND 100),
        sabotage_score DECIMAL(5,2) NOT NULL CHECK (sabotage_score BETWEEN 0 AND 100),
        boundary_deficit_score DECIMAL(5,2) NOT NULL CHECK (boundary_deficit_score BETWEEN 0 AND 100),
        role_expectation_score DECIMAL(5,2) NOT NULL CHECK (role_expectation_score BETWEEN 0 AND 100),
        unavailable_preference_score DECIMAL(5,2) NOT NULL CHECK (unavailable_preference_score BETWEEN 0 AND 100),
        validation_seeking_score DECIMAL(5,2) NOT NULL CHECK (validation_seeking_score BETWEEN 0 AND 100),
        primary_pattern VARCHAR(50) NOT NULL,
        secondary_patterns JSONB,
        blindspot_index DECIMAL(5,2) NOT NULL CHECK (blindspot_index BETWEEN 0 AND 100),
        top_blindspots TEXT[],
        validity_warnings TEXT[],
        completion_rate DECIMAL(3,1),
        response_variance DECIMAL(5,2),
        timeline_entries JSONB,
        ai_headline TEXT,
        ai_one_liner TEXT,
        pattern_examples TEXT[],
        triggers TEXT[],
        micro_interventions JSONB,
        conversation_scripts JSONB,
        stop_start_actions JSONB,
        recommended_tools JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created relationship_patterns_results table');

    await sql`
      CREATE TABLE IF NOT EXISTS relationship_patterns_questions (
        id SERIAL PRIMARY KEY,
        question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('statement', 'scenario')),
        question_text TEXT NOT NULL,
        category VARCHAR(30) NOT NULL CHECK (category IN ('idealize', 'avoid_conflict', 'rebound', 'sabotage', 'boundary_deficit', 'role_expectation', 'unavailable_preference', 'validation_seeking')),
        is_reverse_scored BOOLEAN DEFAULT FALSE,
        weight DECIMAL(3,2) DEFAULT 1.0,
        order_position INTEGER NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created relationship_patterns_questions table');

    await sql`
      CREATE TABLE IF NOT EXISTS relationship_patterns_scenarios (
        id SERIAL PRIMARY KEY,
        question_id INTEGER NOT NULL REFERENCES relationship_patterns_questions(id) ON DELETE CASCADE,
        option_text TEXT NOT NULL,
        associated_patterns TEXT[],
        weight DECIMAL(3,2) DEFAULT 1.0,
        order_position INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(question_id, order_position)
      );
    `;
    console.log('✅ Created relationship_patterns_scenarios table');

    await sql`
      CREATE TABLE IF NOT EXISTS relationship_patterns_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        last_assessment_id INTEGER REFERENCES relationship_patterns_assessments(id),
        assessment_count INTEGER DEFAULT 0,
        can_retake_after TIMESTAMP WITH TIME ZONE,
        life_events_since_last JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id)
      );
    `;
    console.log('✅ Created relationship_patterns_progress table');

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_relationship_patterns_assessments_user_id ON relationship_patterns_assessments(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_relationship_patterns_assessments_status ON relationship_patterns_assessments(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_relationship_patterns_responses_assessment_id ON relationship_patterns_responses(assessment_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_relationship_patterns_results_assessment_id ON relationship_patterns_results(assessment_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_relationship_patterns_progress_user_id ON relationship_patterns_progress(user_id);`;
    console.log('✅ Created indexes');

    // Insert questions
    await sql`
      INSERT INTO relationship_patterns_questions (question_type, question_text, category, is_reverse_scored, weight, order_position) VALUES
      ('statement', 'Ik merk dat ik vaak dezelfde "soort" partner aantrek.', 'unavailable_preference', false, 1.0, 1),
      ('statement', 'Na een paar dates idealiseer ik iemand sneller dan ik later kan volhouden.', 'idealize', false, 1.0, 2),
      ('statement', 'Ik vermijd conflicten tot het te laat is.', 'avoid_conflict', false, 1.0, 3),
      ('statement', 'Ik zoek vaak bevestiging via relaties in moeilijke periodes.', 'validation_seeking', false, 1.0, 4),
      ('statement', 'Ik saboteer relaties wanneer het te dichtbij wordt.', 'sabotage', false, 1.0, 5),
      ('statement', 'Ik blijf bij iemand hopen dat die verandert.', 'idealize', false, 1.0, 6),
      ('statement', 'Ik roep snel "het is aan mij" als iets fout gaat.', 'validation_seeking', false, 1.0, 7),
      ('statement', 'Ik heb de neiging om emotioneel te vluchten (werk, hobby''s) als het lastig wordt.', 'avoid_conflict', false, 1.0, 8),
      ('statement', 'Ik start vaak relaties snel na een vorige relatie.', 'rebound', false, 1.0, 9),
      ('statement', 'Ik negeer rode vlaggen in het begin omdat ik iets wil vasthouden.', 'idealize', false, 1.0, 10),
      ('statement', 'Ik kies partners die onafhankelijk/afstandelijk zijn.', 'unavailable_preference', false, 1.0, 11),
      ('statement', 'Ik benoem zelden wat ik nodig heb in een relatie.', 'boundary_deficit', false, 1.0, 12),
      ('scenario', 'Je partner reageert drie dagen niet op een belangrijk gesprek. Je:', 'avoid_conflict', false, 1.0, 13),
      ('scenario', 'Na een ruzie ga je direct repareren of ga je stilzwijgend afstand nemen?', 'boundary_deficit', false, 1.0, 14)
      ON CONFLICT (order_position) DO NOTHING;
    `;
    console.log('✅ Inserted questions');

    // Insert scenario options
    await sql`
      INSERT INTO relationship_patterns_scenarios (question_id, option_text, associated_patterns, weight, order_position) VALUES
      ((SELECT id FROM relationship_patterns_questions WHERE order_position = 13), 'Belt/appen meerdere keren om duidelijkheid te krijgen.', ARRAY['boundary_deficit'], 1.0, 1),
      ((SELECT id FROM relationship_patterns_questions WHERE order_position = 13), 'Wacht & bedenkt waarom dit nu gebeurt (innerlijke narratief).', ARRAY['idealize', 'validation_seeking'], 1.0, 2),
      ((SELECT id FROM relationship_patterns_questions WHERE order_position = 13), 'Trek jezelf terug en doe alsof alles oké is.', ARRAY['avoid_conflict'], 1.0, 3),
      ((SELECT id FROM relationship_patterns_questions WHERE order_position = 14), 'Direct repareren - ik ga het gesprek aan.', ARRAY['boundary_deficit'], 1.0, 1),
      ((SELECT id FROM relationship_patterns_questions WHERE order_position = 14), 'Afstand nemen - ik geef ruimte en tijd.', ARRAY['avoid_conflict'], 1.0, 2),
      ((SELECT id FROM relationship_patterns_questions WHERE order_position = 14), 'Denk en later handelen - ik neem tijd om na te denken.', ARRAY['idealize'], 1.0, 3)
      ON CONFLICT (question_id, order_position) DO NOTHING;
    `;
    console.log('✅ Inserted scenario options');

    return NextResponse.json({
      success: true,
      message: 'Relationship patterns database tables initialized successfully!',
      details: {
        timestamp: new Date().toISOString(),
        tables: [
          'relationship_patterns_assessments',
          'relationship_patterns_responses',
          'relationship_patterns_results',
          'relationship_patterns_questions',
          'relationship_patterns_scenarios',
          'relationship_patterns_progress'
        ],
        questionsInserted: 14,
        scenariosInserted: 6
      },
    });
  } catch (error: any) {
    console.error('Error initializing relationship patterns tables:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to initialize relationship patterns database tables',
        details: error.message,
      },
      { status: 500 }
    );
  }
}