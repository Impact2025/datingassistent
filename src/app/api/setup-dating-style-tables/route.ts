import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import fs from 'fs';
import path from 'path';

export async function POST() {
  try {
    console.log('📊 Setting up dating style tables...');

    // Create tables one by one
    await sql`
      CREATE TABLE IF NOT EXISTS dating_style_assessments (
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
    console.log('✅ Created dating_style_assessments table');

    await sql`
      CREATE TABLE IF NOT EXISTS dating_style_responses (
        id SERIAL PRIMARY KEY,
        assessment_id INTEGER NOT NULL REFERENCES dating_style_assessments(id) ON DELETE CASCADE,
        question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('statement', 'scenario', 'open')),
        question_id INTEGER NOT NULL,
        response_value INTEGER,
        response_text TEXT,
        response_time_ms INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created dating_style_responses table');

    await sql`
      CREATE TABLE IF NOT EXISTS dating_style_results (
        id SERIAL PRIMARY KEY,
        assessment_id INTEGER NOT NULL REFERENCES dating_style_assessments(id) ON DELETE CASCADE UNIQUE,
        initiator_score DECIMAL(5,2) NOT NULL CHECK (initiator_score BETWEEN 0 AND 100),
        planner_score DECIMAL(5,2) NOT NULL CHECK (planner_score BETWEEN 0 AND 100),
        adventurer_score DECIMAL(5,2) NOT NULL CHECK (adventurer_score BETWEEN 0 AND 100),
        pleaser_score DECIMAL(5,2) NOT NULL CHECK (pleaser_score BETWEEN 0 AND 100),
        selector_score DECIMAL(5,2) NOT NULL CHECK (selector_score BETWEEN 0 AND 100),
        distant_score DECIMAL(5,2) NOT NULL CHECK (distant_score BETWEEN 0 AND 100),
        over_sharer_score DECIMAL(5,2) NOT NULL CHECK (over_sharer_score BETWEEN 0 AND 100),
        ghost_prone_score DECIMAL(5,2) NOT NULL CHECK (ghost_prone_score BETWEEN 0 AND 100),
        primary_style VARCHAR(50) NOT NULL,
        secondary_styles JSONB,
        blindspot_index DECIMAL(5,2) NOT NULL CHECK (blindspot_index BETWEEN 0 AND 100),
        top_blindspots TEXT[],
        validity_warnings TEXT[],
        completion_rate DECIMAL(3,1),
        response_variance DECIMAL(5,2),
        ai_headline TEXT,
        ai_one_liner TEXT,
        strong_points TEXT[],
        blind_spots TEXT[],
        chat_scripts JSONB,
        micro_exercises JSONB,
        match_filters JSONB,
        recommended_dates JSONB,
        avoid_dates JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created dating_style_results table');

    await sql`
      CREATE TABLE IF NOT EXISTS dating_style_questions (
        id SERIAL PRIMARY KEY,
        question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('statement', 'scenario')),
        question_text TEXT NOT NULL,
        category VARCHAR(30) NOT NULL,
        is_reverse_scored BOOLEAN DEFAULT FALSE,
        weight DECIMAL(3,2) DEFAULT 1.0,
        order_position INTEGER NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created dating_style_questions table');

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
      ('statement', 'Ik stuur meestal het eerste bericht.', 'initiator', false, 1.0, 1),
      ('statement', 'Ik ga snel van online chat naar daten in het echt.', 'adventurer', false, 1.0, 2),
      ('statement', 'Ik houd vast aan een checklist van "must-haves".', 'selector', false, 1.0, 3),
      ('statement', 'Ik laat vaak gesprekken uitdoven als ze niet mijn onmiddellijke interesse wekken.', 'distant', false, 1.0, 4),
      ('statement', 'Ik deel snel veel persoonlijke informatie.', 'over_sharer', false, 1.0, 5),
      ('statement', 'Ik heb moeite met lachen of lichtheid in een eerste date.', 'distant', false, 1.0, 6),
      ('statement', 'Ik check vaak profielstatistieken en wacht op reacties.', 'planner', false, 1.0, 7),
      ('statement', 'Ik reageer afwijzend als iemand te veel vraagt.', 'distant', false, 1.0, 8),
      ('statement', 'Ik pas mijn bio/gesprekken sterk aan op wat anderen leuk lijken te vinden.', 'pleaser', false, 1.0, 9),
      ('statement', 'Ik geef snel complimenten om interesse te tonen.', 'pleaser', false, 1.0, 10),
      ('statement', 'Ik stel vaak tests/questions om iemands intenties te checken.', 'selector', false, 1.0, 11),
      ('statement', 'Ik heb een vaste routine/ritueel voor dates (ruimte, tempo, activiteiten).', 'planner', false, 1.0, 12),
      ('scenario', 'Je match reageert traag de eerste week. Wat doe je?', 'distant', false, 1.0, 13),
      ('scenario', 'Op de eerste date blijkt de ander andere plannen te hebben. Jij:', 'adventurer', false, 1.0, 14)
      ON CONFLICT (order_position) DO NOTHING;
    `;
    console.log('✅ Inserted questions');

    // Insert scenario options
    await sql`
      INSERT INTO dating_style_scenarios (question_id, option_text, associated_styles, weight, order_position) VALUES
      ((SELECT id FROM dating_style_questions WHERE order_position = 13), 'Ik stop en zoek iets anders.', ARRAY['distant', 'ghost_prone'], 1.0, 1),
      ((SELECT id FROM dating_style_questions WHERE order_position = 13), 'Ik stuur een vriendelijke check-in.', ARRAY['initiator', 'pleaser'], 1.0, 2),
      ((SELECT id FROM dating_style_questions WHERE order_position = 13), 'Ik ga ervan uit dat die persoon druk is en laat meer tijd.', ARRAY['planner', 'selector'], 1.0, 3),
      ((SELECT id FROM dating_style_questions WHERE order_position = 14), 'Ik verander meteen mijn verwachtingen en vertrek misschien vroeg.', ARRAY['adventurer', 'distant'], 1.0, 1),
      ((SELECT id FROM dating_style_questions WHERE order_position = 14), 'Ik blijf, maar voel me ongemakkelijk en laat dat blijken.', ARRAY['pleaser', 'over_sharer'], 1.0, 2),
      ((SELECT id FROM dating_style_questions WHERE order_position = 14), 'Ik bespreek het en zoek een compromis.', ARRAY['planner', 'selector'], 1.0, 3)
      ON CONFLICT (question_id, order_position) DO NOTHING;
    `;
    console.log('✅ Inserted scenario options');

    return NextResponse.json({
      success: true,
      message: 'Dating style tables created successfully'
    });

  } catch (error) {
    console.error('Error setting up dating style tables:', error);
    return NextResponse.json(
      { error: 'Failed to create dating style tables' },
      { status: 500 }
    );
  }
}