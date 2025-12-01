const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

const { sql } = require('@vercel/postgres');

async function initAttachmentTables() {
  try {
    console.log('🚀 Initializing attachment style assessment tables...');

    // Execute the table creation statements one by one
    console.log('⚡ Creating attachment_assessments table...');
    await sql`
      CREATE TABLE IF NOT EXISTS attachment_assessments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE,
        status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
        total_time_seconds INTEGER,
        confidence_score DECIMAL(3,1),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    console.log('⚡ Creating attachment_responses table...');
    await sql`
      CREATE TABLE IF NOT EXISTS attachment_responses (
        id SERIAL PRIMARY KEY,
        assessment_id INTEGER NOT NULL REFERENCES attachment_assessments(id) ON DELETE CASCADE,
        question_id INTEGER NOT NULL,
        response_value INTEGER NOT NULL CHECK (response_value BETWEEN 1 AND 5),
        response_time_ms INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    console.log('⚡ Creating attachment_results table...');
    await sql`
      CREATE TABLE IF NOT EXISTS attachment_results (
        id SERIAL PRIMARY KEY,
        assessment_id INTEGER NOT NULL REFERENCES attachment_assessments(id) ON DELETE CASCADE UNIQUE,
        primary_style VARCHAR(50) NOT NULL CHECK (primary_style IN ('secure', 'anxious', 'avoidant', 'fearful_avoidant', 'mixed')),
        secondary_style VARCHAR(50) CHECK (secondary_style IN ('secure', 'anxious', 'avoidant', 'fearful_avoidant')),
        secure_score DECIMAL(5,2) NOT NULL CHECK (secure_score BETWEEN 0 AND 100),
        anxious_score DECIMAL(5,2) NOT NULL CHECK (anxious_score BETWEEN 0 AND 100),
        avoidant_score DECIMAL(5,2) NOT NULL CHECK (avoidant_score BETWEEN 0 AND 100),
        fearful_avoidant_score DECIMAL(5,2) NOT NULL CHECK (fearful_avoidant_score BETWEEN 0 AND 100),
        validity_warnings TEXT[],
        completion_rate DECIMAL(3,1),
        response_variance DECIMAL(5,2),
        ai_summary TEXT,
        key_characteristics TEXT[],
        dating_implications TEXT,
        red_flags TEXT[],
        golden_flags TEXT[],
        practical_tips TEXT[],
        micro_exercises JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    console.log('⚡ Creating attachment_questions table...');
    await sql`
      CREATE TABLE IF NOT EXISTS attachment_questions (
        id SERIAL PRIMARY KEY,
        question_text TEXT NOT NULL,
        category VARCHAR(20) NOT NULL CHECK (category IN ('anxious', 'avoidant', 'secure', 'fearful_avoidant')),
        is_reverse_scored BOOLEAN DEFAULT FALSE,
        weight DECIMAL(3,2) DEFAULT 1.0,
        order_position INTEGER NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    console.log('⚡ Creating attachment_progress table...');
    await sql`
      CREATE TABLE IF NOT EXISTS attachment_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        last_assessment_id INTEGER REFERENCES attachment_assessments(id),
        assessment_count INTEGER DEFAULT 0,
        can_retake_after TIMESTAMP WITH TIME ZONE,
        life_events_since_last JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id)
      )
    `;

    console.log('⚡ Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_attachment_assessments_user_id ON attachment_assessments(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_attachment_assessments_status ON attachment_assessments(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_attachment_responses_assessment_id ON attachment_responses(assessment_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_attachment_results_assessment_id ON attachment_results(assessment_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_attachment_progress_user_id ON attachment_progress(user_id)`;

    console.log('⚡ Inserting questions...');
    await sql`
      INSERT INTO attachment_questions (question_text, category, is_reverse_scored, weight, order_position) VALUES
      ('Ik voel me vaak onzeker of mijn partner mij wel echt leuk vindt.', 'anxious', false, 1.0, 1),
      ('Als iemand afstand neemt, denk ik vaak dat het aan mij ligt.', 'anxious', false, 1.0, 2),
      ('Ik hou ervan om veel tijd alleen te hebben en voel me opgesloten in een relatie.', 'avoidant', false, 1.0, 3),
      ('Ik vind het moeilijk om emoties te tonen, ook als ik diep voel.', 'avoidant', false, 1.0, 4),
      ('Ik geef snel veel van mezelf weg om connectie te krijgen.', 'anxious', false, 1.0, 5),
      ('Ik merk dat ik signalen van partners vaak verkeerd interpreteer.', 'anxious', false, 1.0, 6),
      ('Ik stel grenzen duidelijk, zelfs als dat ongemakkelijk voelt.', 'secure', false, 1.0, 7),
      ('Ik maak me snel zorgen dat mijn partner weg zal gaan.', 'anxious', false, 1.0, 8),
      ('Soms weet ik zelf niet wat ik wil in een relatie.', 'fearful_avoidant', false, 1.0, 9),
      ('Ik voel me opgelucht wanneer iemand mij meer ruimte geeft.', 'avoidant', false, 1.0, 10),
      ('In stressvolle momenten trek ik me terug of beëindig ik contact.', 'avoidant', false, 1.0, 11),
      ('Ik zoek veel bevestiging in gesprekken en appjes.', 'anxious', false, 1.0, 12),
      ('Ik heb moeite om hulp of steun te vragen.', 'avoidant', false, 1.0, 13),
      ('Ik wissel tussen sterk afhankelijk gedrag en meteen afstand nemen.', 'fearful_avoidant', false, 1.0, 14),
      ('Ik kan eerlijk zeggen wat ik nodig heb zonder me schuldig te voelen.', 'secure', false, 1.0, 15),
      ('Ik leg sneller dan anderen de schuld bij mezelf in conflicten.', 'anxious', false, 1.0, 16)
      ON CONFLICT (order_position) DO NOTHING
    `;

    console.log('🎉 Attachment style assessment tables initialized successfully!');
    console.log('📊 Tables created:');
    console.log('  - attachment_assessments');
    console.log('  - attachment_responses');
    console.log('  - attachment_results');
    console.log('  - attachment_questions');
    console.log('  - attachment_progress');
    console.log('  - All indexes and 16 questions inserted');

  } catch (error) {
    console.error('💥 Error initializing attachment tables:', error);
    process.exit(1);
  }
}

// Run the initialization
initAttachmentTables();