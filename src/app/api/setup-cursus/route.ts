import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    console.log('Setting up cursus tables...');

    // Create cursus_exercise_answers table
    await sql`
      CREATE TABLE IF NOT EXISTS cursus_exercise_answers (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        module_slug VARCHAR(100) NOT NULL,
        les_slug VARCHAR(100) NOT NULL,
        exercise_id INTEGER NOT NULL,
        answer_text TEXT NOT NULL,
        answer_type VARCHAR(20) DEFAULT 'tekst',
        ai_feedback TEXT,
        ai_score INTEGER CHECK (ai_score >= 0 AND ai_score <= 100),
        ai_insights JSONB,
        submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, module_slug, les_slug, exercise_id)
      )
    `;

    // Create cursus_progress table
    await sql`
      CREATE TABLE IF NOT EXISTS cursus_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        module_slug VARCHAR(100) NOT NULL,
        les_slug VARCHAR(100) NOT NULL,
        completed_exercises INTEGER DEFAULT 0,
        total_exercises INTEGER NOT NULL,
        completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
        status VARCHAR(20) DEFAULT 'niet_gestart',
        started_at TIMESTAMP WITH TIME ZONE,
        completed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, module_slug, les_slug)
      )
    `;

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_cursus_answers_user_id ON cursus_exercise_answers(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_cursus_answers_module ON cursus_exercise_answers(module_slug)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_cursus_answers_submitted ON cursus_exercise_answers(submitted_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_cursus_progress_user_id ON cursus_progress(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_cursus_progress_status ON cursus_progress(status)`;

    // Create gebruiker_profielen table first
    await sql`
      CREATE TABLE IF NOT EXISTS gebruiker_profielen (
        id SERIAL PRIMARY KEY,
        gebruiker_id VARCHAR(100) UNIQUE NOT NULL,
        dating_intentie VARCHAR(100),
        relatievorm VARCHAR(50),
        kernkwaliteiten JSONB,
        sterktepunten JSONB,
        werkpunten JSONB,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Add Module 1 Pro fields to gebruiker_profielen
    await sql`
      ALTER TABLE gebruiker_profielen
      ADD COLUMN IF NOT EXISTS kernverlangen VARCHAR(50),
      ADD COLUMN IF NOT EXISTS datingPatroon TEXT[],
      ADD COLUMN IF NOT EXISTS grootsteAngst VARCHAR(100),
      ADD COLUMN IF NOT EXISTS hechtingsstijl VARCHAR(50),
      ADD COLUMN IF NOT EXISTS hechtingScoreAngst DECIMAL(3,2),
      ADD COLUMN IF NOT EXISTS hechtingScoreVermijding DECIMAL(3,2),
      ADD COLUMN IF NOT EXISTS magneetkrachten JSONB,
      ADD COLUMN IF NOT EXISTS topMagneetkrachten TEXT[],
      ADD COLUMN IF NOT EXISTS kernkwaliteiten TEXT[],
      ADD COLUMN IF NOT EXISTS kernkwaliteitenWaarom JSONB,
      ADD COLUMN IF NOT EXISTS gereerdheidsScore INTEGER CHECK (gereerdheidsScore >= 4 AND gereerdheidsScore <= 40),
      ADD COLUMN IF NOT EXISTS gereerdheidsPerPilaar JSONB,
      ADD COLUMN IF NOT EXISTS gekozenPlatforms TEXT[],
      ADD COLUMN IF NOT EXISTS triggers TEXT[],
      ADD COLUMN IF NOT EXISTS datingIntentie TEXT
    `;

    // Create indexes for Module 1 Pro
    await sql`CREATE INDEX IF NOT EXISTS idx_gebruiker_profielen_kernverlangen ON gebruiker_profielen(kernverlangen)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_gebruiker_profielen_hechtingsstijl ON gebruiker_profielen(hechtingsstijl)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_gebruiker_profielen_gereerdheidsScore ON gebruiker_profielen(gereerdheidsScore)`;

    console.log('✅ Cursus tables and Module 1 Pro schema created successfully!');

    return NextResponse.json({
      success: true,
      message: 'Cursus tables and Module 1 Pro schema created successfully'
    });

  } catch (error) {
    console.error('Error setting up cursus tables:', error);
    return NextResponse.json(
      { error: 'Failed to create cursus tables', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}