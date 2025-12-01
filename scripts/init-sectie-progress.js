const { sql } = require('@vercel/postgres');

async function initSectieProgress() {
  try {
    console.log('📊 Creating user_sectie_progress table...');

    // Maak tabel voor sectie progress
    await sql`
      CREATE TABLE IF NOT EXISTS user_sectie_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        sectie_id INTEGER NOT NULL REFERENCES cursus_secties(id) ON DELETE CASCADE,
        les_id INTEGER NOT NULL,
        cursus_id INTEGER NOT NULL,

        -- Status
        status VARCHAR(50) DEFAULT 'niet-gestart',
        is_completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP WITH TIME ZONE,

        -- Sectie-specifieke data
        quiz_score INTEGER,
        quiz_antwoorden JSONB,
        reflectie_antwoord TEXT,
        opdracht_voltooide_taken JSONB,
        actieplan_voltooide_acties JSONB,

        -- Metadata
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

        -- Unieke combinatie van user en sectie
        UNIQUE(user_id, sectie_id)
      )
    `;

    console.log('✅ user_sectie_progress table created!');

    // Index voor snelle lookups
    await sql`
      CREATE INDEX IF NOT EXISTS idx_user_sectie_progress_user
      ON user_sectie_progress(user_id)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_user_sectie_progress_les
      ON user_sectie_progress(les_id, user_id)
    `;

    console.log('✅ Indexes created!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

initSectieProgress();
