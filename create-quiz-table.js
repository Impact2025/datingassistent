const { sql } = require('@vercel/postgres');

async function createQuizTable() {
  try {
    console.log('Creating quiz_results table...');

    await sql`
      CREATE TABLE IF NOT EXISTS quiz_results (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        answers JSONB NOT NULL,
        dating_style VARCHAR(100) NOT NULL,
        accepts_marketing BOOLEAN DEFAULT false,
        completed_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('✅ Table created successfully');

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_quiz_results_email ON quiz_results(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_quiz_results_style ON quiz_results(dating_style)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_quiz_results_marketing ON quiz_results(accepts_marketing) WHERE accepts_marketing = true`;

    console.log('✅ Indexes created successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error creating table:', error);
    process.exit(1);
  }
}

createQuizTable();
