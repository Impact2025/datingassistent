import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST() {
  try {
    console.log('Creating self-image tables...');

    // Create tables one by one to avoid Turbopack issues with sql.unsafe()
    await sql`
      CREATE TABLE IF NOT EXISTS zelfbeeld_assessments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE,
        status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'uploading', 'analysing', 'completed', 'abandoned')),
        total_time_seconds INTEGER,
        confidence_score DECIMAL(3,1),
        -- Content uploads
        photo_urls TEXT[], -- Array of uploaded photo URLs
        bio_text TEXT,
        chat_example TEXT,
        voice_sample_url TEXT, -- Optional voice recording
        social_handle VARCHAR(100), -- Optional Instagram/TikTok handle
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created zelfbeeld_assessments table');

    await sql`
      CREATE TABLE IF NOT EXISTS zelfbeeld_vibe_meters (
        id SERIAL PRIMARY KEY,
        assessment_id INTEGER NOT NULL REFERENCES zelfbeeld_assessments(id) ON DELETE CASCADE,
        -- 12 vibe dimensions (0-100 scores)
        warmte_score DECIMAL(5,2) CHECK (warmte_score BETWEEN 0 AND 100),
        charisma_score DECIMAL(5,2) CHECK (charisma_score BETWEEN 0 AND 100),
        stabiliteit_score DECIMAL(5,2) CHECK (stabiliteit_score BETWEEN 0 AND 100),
        speelsheid_score DECIMAL(5,2) CHECK (speelsheid_score BETWEEN 0 AND 100),
        emotionele_openheid_score DECIMAL(5,2) CHECK (emotionele_openheid_score BETWEEN 0 AND 100),
        mystery_factor_score DECIMAL(5,2) CHECK (mystery_factor_score BETWEEN 0 AND 100),
        sociale_energie_score DECIMAL(5,2) CHECK (sociale_energie_score BETWEEN 0 AND 100),
        high_value_presence_score DECIMAL(5,2) CHECK (high_value_presence_score BETWEEN 0 AND 100),
        authentieke_vibe_score DECIMAL(5,2) CHECK (authentieke_vibe_score BETWEEN 0 AND 100),
        verbinding_score DECIMAL(5,2) CHECK (verbinding_score BETWEEN 0 AND 100),
        dominantie_score DECIMAL(5,2) CHECK (dominantie_score BETWEEN 0 AND 100),
        sensitiviteit_score DECIMAL(5,2) CHECK (sensitiviteit_score BETWEEN 0 AND 100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created zelfbeeld_vibe_meters table');

    await sql`
      CREATE TABLE IF NOT EXISTS zelfbeeld_results (
        id SERIAL PRIMARY KEY,
        assessment_id INTEGER NOT NULL REFERENCES zelfbeeld_assessments(id) ON DELETE CASCADE UNIQUE,

        -- First impression analysis
        instant_impression TEXT, -- How you come across in 2 seconds
        persona_title VARCHAR(100), -- e.g., "De Warme Intellectueel"
        thirty_second_impression TEXT[], -- How you come across after 30 seconds (3 bullets)
        visual_tags TEXT[], -- Semantic tags for photos

        -- Self-image vs reality comparison
        self_image_summary TEXT, -- How you see yourself
        actual_impression TEXT, -- How you actually come across
        discrepancy_score DECIMAL(5,2) CHECK (discrepancy_score BETWEEN 0 AND 100), -- 0=perfect alignment, 100=huge mismatch
        discrepancy_level VARCHAR(20) CHECK (discrepancy_level IN ('perfect_aligned', 'licht_verschoven', 'medium_mismatch', 'grote_mismatch')),

        -- Energy signature (radar chart data)
        energie_handtekening JSONB, -- 12-dimensional radar data

        -- Unique attractiveness
        unieke_aantrekkingskracht JSONB, -- Title, explanation, 3 core qualities, signature sentence

        -- Sabotage signals
        saboteer_signalen JSONB, -- Array of warning tiles with what/why/how

        -- Optimization plan
        optimalisatie_plan JSONB, -- Bio, photos, communication recommendations

        -- AI-generated content
        nieuwe_bio_varianten TEXT[], -- 3 new bio suggestions
        versterkende_zinnen TEXT[], -- 5 sentences that enhance your vibe
        verwijder_zinnen TEXT[], -- 3 sentences to remove
        foto_aanbevelingen JSONB, -- Photo analysis and recommendations
        eerste_48_uur_strategie JSONB, -- Opening strategy and communication tips

        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created zelfbeeld_results table');

    // Photo analysis table
    await sql`
      CREATE TABLE IF NOT EXISTS zelfbeeld_photo_analysis (
        id SERIAL PRIMARY KEY,
        assessment_id INTEGER NOT NULL REFERENCES zelfbeeld_assessments(id) ON DELETE CASCADE,
        photo_url TEXT NOT NULL,
        photo_index INTEGER NOT NULL, -- 1, 2, or 3
        -- AI analysis results
        overall_score DECIMAL(5,2) CHECK (overall_score BETWEEN 0 AND 100),
        semantic_tags TEXT[], -- e.g., ["toegankelijk", "veilig", "avontuurlijk"]
        color_emotion VARCHAR(50), -- Overall emotional tone
        composition_feedback TEXT,
        lighting_analysis TEXT,
        expression_analysis TEXT,
        vibe_alignment_score DECIMAL(5,2), -- How well it matches your overall vibe
        improvement_suggestions TEXT[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created zelfbeeld_photo_analysis table');

    // User progress tracking
    await sql`
      CREATE TABLE IF NOT EXISTS zelfbeeld_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        total_assessments INTEGER DEFAULT 0,
        average_vibe_score DECIMAL(5,2),
        strongest_vibe_dimension VARCHAR(50),
        area_for_improvement VARCHAR(50),
        vibe_evolution JSONB, -- How vibe scores have changed over time
        common_sabotage_patterns TEXT[],
        learned_optimizations TEXT[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id)
      );
    `;
    console.log('✅ Created zelfbeeld_progress table');

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_zelfbeeld_assessments_user_id ON zelfbeeld_assessments(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_zelfbeeld_assessments_status ON zelfbeeld_assessments(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_zelfbeeld_vibe_meters_assessment_id ON zelfbeeld_vibe_meters(assessment_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_zelfbeeld_results_assessment_id ON zelfbeeld_results(assessment_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_zelfbeeld_photo_analysis_assessment_id ON zelfbeeld_photo_analysis(assessment_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_zelfbeeld_progress_user_id ON zelfbeeld_progress(user_id);`;
    console.log('✅ Created indexes');

    return NextResponse.json({
      success: true,
      message: 'Zelfbeeld database tables initialized successfully!',
      details: {
        timestamp: new Date().toISOString(),
        tables: [
          'zelfbeeld_assessments',
          'zelfbeeld_vibe_meters',
          'zelfbeeld_results',
          'zelfbeeld_photo_analysis',
          'zelfbeeld_progress'
        ],
        vibeDimensions: 12,
        photoAnalysis: 'enabled'
      },
    });
  } catch (error: any) {
    console.error('Error initializing zelfbeeld tables:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to initialize zelfbeeld database tables',
        details: error.message,
      },
      { status: 500 }
    );
  }
}