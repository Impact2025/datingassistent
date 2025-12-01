import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST() {
  try {
    console.log('Creating emotional readiness tables...');

    // Drop existing tables first to ensure schema updates
    await sql`DROP TABLE IF EXISTS emotionele_readiness_results CASCADE;`;
    await sql`DROP TABLE IF EXISTS emotionele_readiness_responses CASCADE;`;
    await sql`DROP TABLE IF EXISTS emotionele_readiness_assessments CASCADE;`;

    // Create tables one by one to avoid Turbopack issues with sql.unsafe()
    await sql`
      CREATE TABLE emotionele_readiness_assessments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        laatste_relatie VARCHAR(50),
        emotioneel_herstel INTEGER CHECK (emotioneel_herstel BETWEEN 1 AND 5),
        stress_niveau INTEGER CHECK (stress_niveau BETWEEN 1 AND 5),
        status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created emotionele_readiness_assessments table');

    await sql`
      CREATE TABLE emotionele_readiness_responses (
        id SERIAL PRIMARY KEY,
        assessment_id INTEGER NOT NULL REFERENCES emotionele_readiness_assessments(id) ON DELETE CASCADE,
        question_type VARCHAR(20) NOT NULL,
        question_id INTEGER NOT NULL,
        response_value INTEGER,
        response_time_ms INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created emotionele_readiness_responses table');

    await sql`
      CREATE TABLE emotionele_readiness_results (
        id SERIAL PRIMARY KEY,
        assessment_id INTEGER NOT NULL REFERENCES emotionele_readiness_assessments(id) ON DELETE CASCADE UNIQUE,

        -- Readiness scores (0-100)
        readiness_score INTEGER NOT NULL CHECK (readiness_score BETWEEN 0 AND 100),
        readiness_level VARCHAR(50) NOT NULL,

        -- Sub-scores
        emotionele_draagkracht INTEGER CHECK (emotionele_draagkracht BETWEEN 0 AND 100),
        intenties_score INTEGER CHECK (intenties_score BETWEEN 0 AND 100),
        restlading_score INTEGER CHECK (restlading_score BETWEEN 0 AND 100),
        self_esteem_score INTEGER CHECK (self_esteem_score BETWEEN 0 AND 100),
        stress_score INTEGER CHECK (stress_score BETWEEN 0 AND 100),
        rebound_risico INTEGER CHECK (rebound_risico BETWEEN 0 AND 100),

        -- AI-generated content
        ai_conclusie TEXT,
        readiness_analyse TEXT,
        wat_werkt_nu JSONB, -- JSON data
        wat_lastig_kan_zijn JSONB, -- JSON data
        directe_aanbevelingen JSONB, -- JSON data
        micro_interventies JSONB, -- JSON data
        scripts JSONB, -- JSON data
        recommended_tools JSONB, -- JSON data

        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created emotionele_readiness_results table');

    // Create indexes for performance
    await sql`CREATE INDEX idx_emotionele_readiness_assessments_user_id ON emotionele_readiness_assessments(user_id);`;
    await sql`CREATE INDEX idx_emotionele_readiness_assessments_status ON emotionele_readiness_assessments(status);`;
    await sql`CREATE INDEX idx_emotionele_readiness_responses_assessment_id ON emotionele_readiness_responses(assessment_id);`;
    await sql`CREATE INDEX idx_emotionele_readiness_results_assessment_id ON emotionele_readiness_results(assessment_id);`;
    console.log('✅ Created indexes');

    return NextResponse.json({
      success: true,
      message: 'Emotional readiness database tables initialized successfully!',
      details: {
        timestamp: new Date().toISOString(),
        tables: [
          'emotionele_readiness_assessments',
          'emotionele_readiness_responses',
          'emotionele_readiness_results'
        ],
        features: [
          'assessment_tracking',
          'response_storage',
          'ai_analysis_results'
        ]
      },
    });
  } catch (error: any) {
    console.error('Error initializing emotional readiness tables:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to initialize emotional readiness database tables',
        details: error.message,
      },
      { status: 500 }
    );
  }
}