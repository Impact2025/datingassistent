import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST() {
  try {
    console.log('Creating dating archetypes tables...');

    // Create tables one by one to avoid Turbopack issues with sql.unsafe()
    await sql`
      CREATE TABLE IF NOT EXISTS dating_archetypes_assessments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE,
        status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'analysing', 'completed', 'abandoned')),
        total_time_seconds INTEGER,
        confidence_score DECIMAL(3,1),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created dating_archetypes_assessments table');

    await sql`
      CREATE TABLE IF NOT EXISTS dating_archetypes_responses (
        id SERIAL PRIMARY KEY,
        assessment_id INTEGER NOT NULL REFERENCES dating_archetypes_assessments(id) ON DELETE CASCADE,
        question_id INTEGER NOT NULL,
        response_value INTEGER NOT NULL CHECK (response_value BETWEEN 1 AND 4), -- 4 choice options
        response_time_ms INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created dating_archetypes_responses table');

    await sql`
      CREATE TABLE IF NOT EXISTS dating_archetypes_results (
        id SERIAL PRIMARY KEY,
        assessment_id INTEGER NOT NULL REFERENCES dating_archetypes_assessments(id) ON DELETE CASCADE UNIQUE,

        -- Archetype scores (0-100)
        connector_score DECIMAL(5,2) NOT NULL CHECK (connector_score BETWEEN 0 AND 100),
        adventurer_score DECIMAL(5,2) NOT NULL CHECK (adventurer_score BETWEEN 0 AND 100),
        visionary_score DECIMAL(5,2) NOT NULL CHECK (visionary_score BETWEEN 0 AND 100),
        slow_burner_score DECIMAL(5,2) NOT NULL CHECK (slow_burner_score BETWEEN 0 AND 100),
        charmer_score DECIMAL(5,2) NOT NULL CHECK (charmer_score BETWEEN 0 AND 100),
        anchor_score DECIMAL(5,2) NOT NULL CHECK (anchor_score BETWEEN 0 AND 100),
        maverick_score DECIMAL(5,2) NOT NULL CHECK (maverick_score BETWEEN 0 AND 100),
        harmonizer_score DECIMAL(5,2) NOT NULL CHECK (harmonizer_score BETWEEN 0 AND 100),

        -- Archetype rankings
        dominant_archetype VARCHAR(20) NOT NULL CHECK (dominant_archetype IN ('connector', 'adventurer', 'visionary', 'slow_burner', 'charmer', 'anchor', 'maverick', 'harmonizer')),
        supporting_archetype VARCHAR(20) CHECK (supporting_archetype IN ('connector', 'adventurer', 'visionary', 'slow_burner', 'charmer', 'anchor', 'maverick', 'harmonizer')),
        dormant_archetype VARCHAR(20) CHECK (dormant_archetype IN ('connector', 'adventurer', 'visionary', 'slow_burner', 'charmer', 'anchor', 'maverick', 'harmonizer')),

        -- Archetype percentages
        dominant_percentage INTEGER NOT NULL CHECK (dominant_percentage BETWEEN 50 AND 70),
        supporting_percentage INTEGER NOT NULL CHECK (supporting_percentage BETWEEN 20 AND 35),
        dormant_percentage INTEGER NOT NULL CHECK (dormant_percentage BETWEEN 10 AND 25),

        -- AI-generated content
        dominant_description TEXT, -- Detailed archetype description
        supporting_description TEXT,
        dormant_description TEXT,

        -- Practical applications
        dating_style_insights TEXT[], -- How archetype affects dating behavior
        first_impression_description TEXT, -- How others perceive them initially
        match_compatibility JSONB, -- Compatible archetypes with explanations

        -- Micro-insights
        communication_style TEXT,
        energy_expression TEXT,
        relationship_approach TEXT,

        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created dating_archetypes_results table');

    // Assessment questions table (static data)
    await sql`
      CREATE TABLE IF NOT EXISTS dating_archetypes_questions (
        id SERIAL PRIMARY KEY,
        question_text TEXT NOT NULL,
        question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('behavioral', 'situational', 'preference')),
        order_position INTEGER NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created dating_archetypes_questions table');

    // Question options with archetype mappings
    await sql`
      CREATE TABLE IF NOT EXISTS dating_archetypes_options (
        id SERIAL PRIMARY KEY,
        question_id INTEGER NOT NULL REFERENCES dating_archetypes_questions(id) ON DELETE CASCADE,
        option_text TEXT NOT NULL,
        archetype_weights JSONB NOT NULL, -- e.g., {"connector": 3, "adventurer": 1, "visionary": 2}
        order_position INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(question_id, order_position)
      );
    `;
    console.log('✅ Created dating_archetypes_options table');

    // User progress tracking
    await sql`
      CREATE TABLE IF NOT EXISTS dating_archetypes_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        last_assessment_id INTEGER REFERENCES dating_archetypes_assessments(id),
        assessment_count INTEGER DEFAULT 0,
        current_archetype VARCHAR(20) CHECK (current_archetype IN ('connector', 'adventurer', 'visionary', 'slow_burner', 'charmer', 'anchor', 'maverick', 'harmonizer')),
        archetype_stability_score INTEGER CHECK (archetype_stability_score BETWEEN 0 AND 100), -- How consistent results are over time
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id)
      );
    `;
    console.log('✅ Created dating_archetypes_progress table');

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_dating_archetypes_assessments_user_id ON dating_archetypes_assessments(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_dating_archetypes_assessments_status ON dating_archetypes_assessments(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_dating_archetypes_responses_assessment_id ON dating_archetypes_responses(assessment_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_dating_archetypes_results_assessment_id ON dating_archetypes_results(assessment_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_dating_archetypes_progress_user_id ON dating_archetypes_progress(user_id);`;
    console.log('✅ Created indexes');

    // Insert the 10-12 questions
    await sql`
      INSERT INTO dating_archetypes_questions (question_text, question_type, order_position) VALUES
      ('In een eerste gesprek met iemand die je leuk vindt, begin je meestal met:', 'behavioral', 1),
      ('Als een date niet helemaal loopt zoals gepland, reageer je door:', 'situational', 2),
      ('Wat spreekt je het meest aan in een potentiële partner?', 'preference', 3),
      ('Tijdens een date voel je je het meest comfortabel wanneer:', 'situational', 4),
      ('Als je iemand al een tijdje spreekt maar het voelt niet helemaal goed, dan:', 'behavioral', 5),
      ('Je ideale eerste date activiteit zou zijn:', 'preference', 6),
      ('Als iemand je vraagt naar je toekomstplannen, vertel je:', 'behavioral', 7),
      ('In een groep mensen maak je het makkelijkst contact door:', 'behavioral', 8),
      ('Als een date vraagt wat je zoekt in een relatie, zeg je:', 'behavioral', 9),
      ('Je voelt je het meest aantrekkelijk wanneer je:', 'situational', 10),
      ('Als iemand emotioneel wordt tijdens een gesprek, reageer je door:', 'situational', 11),
      ('Je droom partner is iemand die:', 'preference', 12)
      ON CONFLICT (order_position) DO NOTHING;
    `;
    console.log('✅ Inserted questions');

    // Insert options with archetype weights for each question
    await sql`
      INSERT INTO dating_archetypes_options (question_id, option_text, archetype_weights, order_position) VALUES
      -- Question 1: In een eerste gesprek...
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 1), 'Diepgaande vragen stellen om echt te verbinden', '{"connector": 4, "visionary": 2, "harmonizer": 3}', 1),
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 1), 'Licht en speels beginnen, met humor', '{"adventurer": 4, "charmer": 3, "harmonizer": 2}', 2),
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 1), 'Direct vragen naar gedeelde interesses en waarden', '{"visionary": 4, "slow_burner": 2, "anchor": 3}', 3),
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 1), 'Rustig luisteren en afwachten wat de ander zegt', '{"slow_burner": 4, "anchor": 3, "maverick": 2}', 4),

      -- Question 2: Als een date niet loopt zoals gepland...
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 2), 'Probeer het om te buigen naar iets beters', '{"connector": 3, "harmonizer": 4, "adventurer": 2}', 1),
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 2), 'Ga mee in de flow en maak er het beste van', '{"adventurer": 4, "charmer": 3, "harmonizer": 2}', 2),
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 2), 'Stel voor om het aan te passen aan wat werkt', '{"visionary": 4, "anchor": 3, "slow_burner": 2}', 3),
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 2), 'Accepteer het en zie wel hoe het loopt', '{"slow_burner": 4, "maverick": 3, "anchor": 2}', 4),

      -- Question 3: Wat spreekt je aan...
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 3), 'Diepe emotionele connectie en empathie', '{"connector": 4, "anchor": 3, "harmonizer": 2}', 1),
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 3), 'Avontuurlijke geest en spontaniteit', '{"adventurer": 4, "charmer": 3, "maverick": 2}', 2),
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 3), 'Duidelijke richting en gedeelde doelen', '{"visionary": 4, "slow_burner": 3, "anchor": 2}', 3),
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 3), 'Betrouwbaarheid en rustige aanwezigheid', '{"slow_burner": 4, "anchor": 3, "visionary": 2}', 4),

      -- Question 4: Tijdens een date comfortabel...
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 4), 'Diepe gesprekken over gevoelens en ervaringen', '{"connector": 4, "harmonizer": 3, "anchor": 2}', 1),
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 4), 'Nieuwe dingen uitproberen en avontuur', '{"adventurer": 4, "charmer": 3, "maverick": 2}', 2),
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 4), 'Serieus praten over toekomst en waarden', '{"visionary": 4, "slow_burner": 3, "anchor": 2}', 3),
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 4), 'Rustige setting met quality time', '{"slow_burner": 4, "anchor": 3, "visionary": 2}', 4),

      -- Question 5: Als het niet goed voelt...
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 5), 'Probeer te begrijpen wat er mis is en te verbeteren', '{"connector": 3, "harmonizer": 4, "anchor": 2}', 1),
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 5), 'Licht nemen en zien wat er gebeurt', '{"adventurer": 4, "charmer": 3, "maverick": 2}', 2),
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 5), 'Eerlijk bespreken wat niet werkt', '{"visionary": 4, "slow_burner": 3, "anchor": 2}', 3),
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 5), 'Rustig afstand nemen', '{"slow_burner": 4, "maverick": 3, "anchor": 2}', 4),

      -- Question 6: Ideale eerste date...
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 6), 'Intiem diner met diep gesprek', '{"connector": 4, "harmonizer": 3, "anchor": 2}', 1),
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 6), 'Avontuurlijke activiteit zoals klimmen of stedentrip', '{"adventurer": 4, "charmer": 3, "maverick": 2}', 2),
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 6), 'Museum of cultureel uitje met betekenis', '{"visionary": 4, "slow_burner": 3, "anchor": 2}', 3),
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 6), 'Rustige wandeling of koffie in park', '{"slow_burner": 4, "anchor": 3, "visionary": 2}', 4),

      -- Question 7: Toekomstplannen...
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 7), 'Over emotionele groei en relaties', '{"connector": 4, "harmonizer": 3, "anchor": 2}', 1),
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 7), 'Over reizen, avonturen en ervaringen', '{"adventurer": 4, "charmer": 3, "maverick": 2}', 2),
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 7), 'Over carrière, doelen en impact', '{"visionary": 4, "slow_burner": 3, "anchor": 2}', 3),
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 7), 'Over stabiliteit en quality of life', '{"slow_burner": 4, "anchor": 3, "visionary": 2}', 4),

      -- Question 8: Contact maken in groep...
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 8), 'Luisteren naar anderen en verbinden op emotioneel niveau', '{"connector": 4, "harmonizer": 3, "anchor": 2}', 1),
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 8), 'Energie brengen met verhalen en humor', '{"adventurer": 4, "charmer": 3, "harmonizer": 2}', 2),
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 8), 'Betekenisvolle gesprekken voeren over ideeën', '{"visionary": 4, "slow_burner": 3, "anchor": 2}', 3),
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 8), 'Observeren en selectief deelnemen', '{"slow_burner": 4, "maverick": 3, "anchor": 2}', 4),

      -- Question 9: Wat je zoekt...
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 9), 'Diepe emotionele band en intimiteit', '{"connector": 4, "anchor": 3, "harmonizer": 2}', 1),
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 9), 'Vrijheid, plezier en gedeelde avonturen', '{"adventurer": 4, "charmer": 3, "maverick": 2}', 2),
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 9), 'Gedeelde visie en levensdoelen', '{"visionary": 4, "slow_burner": 3, "anchor": 2}', 3),
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 9), 'Rust, vertrouwen en stabiliteit', '{"slow_burner": 4, "anchor": 3, "visionary": 2}', 4),

      -- Question 10: Aantrekkelijk voelen...
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 10), 'Wanneer je echt jezelf kunt zijn', '{"connector": 4, "harmonizer": 3, "anchor": 2}', 1),
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 10), 'In spannende, nieuwe situaties', '{"adventurer": 4, "charmer": 3, "maverick": 2}', 2),
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 10), 'Wanneer je competent en capabel bent', '{"visionary": 4, "slow_burner": 3, "anchor": 2}', 3),
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 10), 'In rustige, vertrouwde settings', '{"slow_burner": 4, "anchor": 3, "visionary": 2}', 4),

      -- Question 11: Als iemand emotioneel wordt...
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 11), 'Luisteren en empathie tonen', '{"connector": 4, "harmonizer": 3, "anchor": 2}', 1),
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 11), 'Licht houden met humor of afleiding', '{"adventurer": 4, "charmer": 3, "harmonizer": 2}', 2),
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 11), 'Praktische oplossingen bieden', '{"visionary": 4, "slow_burner": 3, "anchor": 2}', 3),
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 11), 'Ruimte geven en observeren', '{"slow_burner": 4, "maverick": 3, "anchor": 2}', 4),

      -- Question 12: Droom partner...
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 12), 'Emotioneel beschikbaar en zorgzaam is', '{"connector": 4, "anchor": 3, "harmonizer": 2}', 1),
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 12), 'Spontaan en avontuurlijk leeft', '{"adventurer": 4, "charmer": 3, "maverick": 2}', 2),
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 12), 'Duidelijke doelen heeft en ambitieus is', '{"visionary": 4, "slow_burner": 3, "anchor": 2}', 3),
      ((SELECT id FROM dating_archetypes_questions WHERE order_position = 12), 'Rust en stabiliteit biedt', '{"slow_burner": 4, "anchor": 3, "visionary": 2}', 4)
      ON CONFLICT (question_id, order_position) DO NOTHING;
    `;
    console.log('✅ Inserted question options with archetype weights');

    return NextResponse.json({
      success: true,
      message: 'Dating archetypes database tables initialized successfully!',
      details: {
        timestamp: new Date().toISOString(),
        tables: [
          'dating_archetypes_assessments',
          'dating_archetypes_responses',
          'dating_archetypes_results',
          'dating_archetypes_questions',
          'dating_archetypes_options',
          'dating_archetypes_progress'
        ],
        questionsInserted: 12,
        optionsInserted: 48,
        archetypes: [
          'connector', 'adventurer', 'visionary', 'slow_burner',
          'charmer', 'anchor', 'maverick', 'harmonizer'
        ]
      },
    });
  } catch (error: any) {
    console.error('Error initializing dating archetypes tables:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to initialize dating archetypes database tables',
        details: error.message,
      },
      { status: 500 }
    );
  }
}