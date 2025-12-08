import { sql } from '@vercel/postgres';

async function setupDatabase() {
  try {
    console.log('Setting up hechtingsstijl database tables...\n');

    // Create assessment table
    await sql`
      CREATE TABLE IF NOT EXISTS hechtingsstijl_assessments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE,
        status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
        total_time_seconds INTEGER,
        confidence_score DECIMAL(3,1),
        dating_fase VARCHAR(50),
        laatste_relatie_recent BOOLEAN,
        stress_niveau INTEGER CHECK (stress_niveau BETWEEN 1 AND 5),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created hechtingsstijl_assessments table');

    // Create responses table
    await sql`
      CREATE TABLE IF NOT EXISTS hechtingsstijl_responses (
        id SERIAL PRIMARY KEY,
        assessment_id INTEGER NOT NULL REFERENCES hechtingsstijl_assessments(id) ON DELETE CASCADE,
        question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('statement', 'scenario')),
        question_id INTEGER NOT NULL,
        response_value INTEGER,
        response_text TEXT,
        response_time_ms INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created hechtingsstijl_responses table');

    // Create results table
    await sql`
      CREATE TABLE IF NOT EXISTS hechtingsstijl_results (
        id SERIAL PRIMARY KEY,
        assessment_id INTEGER NOT NULL REFERENCES hechtingsstijl_assessments(id) ON DELETE CASCADE UNIQUE,
        primary_style VARCHAR(50) NOT NULL CHECK (primary_style IN ('veilig', 'angstig', 'vermijdend', 'angstig_vermijdend')),
        secondary_style VARCHAR(50) CHECK (secondary_style IN ('veilig', 'angstig', 'vermijdend', 'angstig_vermijdend')),
        veilig_score DECIMAL(5,2) NOT NULL CHECK (veilig_score BETWEEN 0 AND 100),
        angstig_score DECIMAL(5,2) NOT NULL CHECK (angstig_score BETWEEN 0 AND 100),
        vermijdend_score DECIMAL(5,2) NOT NULL CHECK (vermijdend_score BETWEEN 0 AND 100),
        angstig_vermijdend_score DECIMAL(5,2) NOT NULL CHECK (angstig_vermijdend_score BETWEEN 0 AND 100),
        validity_warnings TEXT[],
        completion_rate DECIMAL(3,1),
        response_variance DECIMAL(5,2),
        ai_profiel TEXT,
        toekomstgerichte_interpretatie TEXT,
        dating_voorbeelden TEXT[],
        triggers TEXT[],
        herstel_strategieen TEXT[],
        micro_interventies JSONB,
        gesprek_scripts JSONB,
        recommended_tools JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created hechtingsstijl_results table');

    // Create questions table
    await sql`
      CREATE TABLE IF NOT EXISTS hechtingsstijl_questions (
        id SERIAL PRIMARY KEY,
        question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('statement', 'scenario')),
        question_text TEXT NOT NULL,
        category VARCHAR(30) NOT NULL CHECK (category IN ('nabijheid_afstand', 'communicatie_triggers', 'intimiteit_veiligheid', 'moderne_dating')),
        is_reverse_scored BOOLEAN DEFAULT FALSE,
        weight DECIMAL(3,2) DEFAULT 1.0,
        order_position INTEGER NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    console.log('✅ Created hechtingsstijl_questions table');

    // Create scenarios table
    await sql`
      CREATE TABLE IF NOT EXISTS hechtingsstijl_scenarios (
        id SERIAL PRIMARY KEY,
        question_id INTEGER NOT NULL REFERENCES hechtingsstijl_questions(id) ON DELETE CASCADE,
        option_text TEXT NOT NULL,
        associated_styles TEXT[],
        weight DECIMAL(3,2) DEFAULT 1.0,
        order_position INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(question_id, order_position)
      );
    `;
    console.log('✅ Created hechtingsstijl_scenarios table');

    // Create progress table
    await sql`
      CREATE TABLE IF NOT EXISTS hechtingsstijl_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        last_assessment_id INTEGER REFERENCES hechtingsstijl_assessments(id),
        assessment_count INTEGER DEFAULT 0,
        can_retake_after TIMESTAMP WITH TIME ZONE,
        life_events_since_last JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id)
      );
    `;
    console.log('✅ Created hechtingsstijl_progress table');

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_hechtingsstijl_assessments_user_id ON hechtingsstijl_assessments(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_hechtingsstijl_assessments_status ON hechtingsstijl_assessments(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_hechtingsstijl_responses_assessment_id ON hechtingsstijl_responses(assessment_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_hechtingsstijl_results_assessment_id ON hechtingsstijl_results(assessment_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_hechtingsstijl_progress_user_id ON hechtingsstijl_progress(user_id);`;
    console.log('✅ Created indexes');

    // Check if questions already exist
    const existingQuestions = await sql`SELECT COUNT(*) FROM hechtingsstijl_questions`;
    if (parseInt(existingQuestions.rows[0].count) > 0) {
      console.log(`\n⚠️  Questions already exist (${existingQuestions.rows[0].count} found). Skipping insert.`);
    } else {
      // Insert questions
      await sql`
        INSERT INTO hechtingsstijl_questions (question_type, question_text, category, is_reverse_scored, weight, order_position) VALUES
        ('statement', 'Ik voel me snel overweldigd als iemand te dichtbij komt.', 'nabijheid_afstand', false, 1.0, 1),
        ('statement', 'Ik hecht me pas echt als ik zeker weet dat iemand blijft.', 'nabijheid_afstand', false, 1.0, 2),
        ('statement', 'Ik heb tijd alleen nodig om me weer kalm te voelen.', 'nabijheid_afstand', false, 1.0, 3),
        ('statement', 'Als iemand traag reageert, denk ik snel dat ik iets verkeerd heb gedaan.', 'communicatie_triggers', false, 1.0, 4),
        ('statement', 'Ik vind het moeilijk om te zeggen wat ik nodig heb.', 'communicatie_triggers', false, 1.0, 5),
        ('statement', 'In conflicten trek ik me terug of sluit ik me mentaal af.', 'communicatie_triggers', false, 1.0, 6),
        ('statement', 'Ik voel me veilig wanneer iemand voorspelbaar en consistent is.', 'intimiteit_veiligheid', false, 1.0, 7),
        ('statement', 'Ik raak gespannen als iemand te afhankelijk van mij wordt.', 'intimiteit_veiligheid', false, 1.0, 8),
        ('statement', 'Ik raak snel emotioneel betrokken bij messaging en app-contact.', 'moderne_dating', false, 1.0, 9),
        ('statement', 'Ik verlies interesse als iemand té beschikbaar is.', 'moderne_dating', false, 1.0, 10),
        ('scenario', 'Je date reageert drie uur niet op een belangrijk appje. Wat gebeurt er van binnen?', 'communicatie_triggers', false, 1.0, 11),
        ('scenario', 'Tijdens een kleine miscommunicatie op date 2 zegt iemand: "Laat maar, maakt niet uit."', 'communicatie_triggers', false, 1.0, 12)
        ON CONFLICT (order_position) DO NOTHING;
      `;
      console.log('✅ Inserted 12 questions');

      // Insert scenario options
      await sql`
        INSERT INTO hechtingsstijl_scenarios (question_id, option_text, associated_styles, weight, order_position) VALUES
        ((SELECT id FROM hechtingsstijl_questions WHERE order_position = 11), 'Ik raak onrustig en probeer te analyseren wat er misgaat.', ARRAY['angstig'], 1.0, 1),
        ((SELECT id FROM hechtingsstijl_questions WHERE order_position = 11), 'Ik denk: "Prima, iedereen is druk."', ARRAY['veilig'], 1.0, 2),
        ((SELECT id FROM hechtingsstijl_questions WHERE order_position = 11), 'Ik trek me emotioneel terug: "Dit is waarom ik niet te close moet worden."', ARRAY['vermijdend'], 1.0, 3),
        ((SELECT id FROM hechtingsstijl_questions WHERE order_position = 12), 'Ik wil het meteen oplossen.', ARRAY['veilig'], 1.0, 1),
        ((SELECT id FROM hechtingsstijl_questions WHERE order_position = 12), 'Ik laat het rusten, maar voel me wel minder zeker.', ARRAY['angstig'], 1.0, 2),
        ((SELECT id FROM hechtingsstijl_questions WHERE order_position = 12), 'Ik sluit me af en praat over iets anders.', ARRAY['vermijdend'], 1.0, 3)
        ON CONFLICT (question_id, order_position) DO NOTHING;
      `;
      console.log('✅ Inserted 6 scenario options');
    }

    // Verify questions were inserted
    const finalCount = await sql`SELECT COUNT(*) FROM hechtingsstijl_questions`;
    const scenarioCount = await sql`SELECT COUNT(*) FROM hechtingsstijl_scenarios`;

    console.log('\n✅ Setup complete!');
    console.log(`   - ${finalCount.rows[0].count} questions in database`);
    console.log(`   - ${scenarioCount.rows[0].count} scenario options in database`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error setting up database:', error.message);
    console.error('   Stack:', error.stack);
    process.exit(1);
  }
}

setupDatabase();
