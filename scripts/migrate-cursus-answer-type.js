/**
 * Migrate cursus answer_type column to VARCHAR(30)
 * This fixes the issue where long exercise type names exceed VARCHAR(20) limit
 */

const { sql } = require('@vercel/postgres');

async function migrateCursusAnswerType() {
  try {
    console.log('🔄 Starting cursus answer_type migration...');

    // Check current column size
    const result = await sql`
      SELECT character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'cursus_exercise_answers'
      AND column_name = 'answer_type'
    `;

    const currentSize = result.rows[0]?.character_maximum_length;

    if (currentSize >= 30) {
      console.log('✅ Column already has sufficient size (VARCHAR(30) or larger)');
      return;
    }

    console.log(`📏 Current column size: VARCHAR(${currentSize}), upgrading to VARCHAR(30)...`);

    // Alter the column
    await sql`
      ALTER TABLE cursus_exercise_answers
      ALTER COLUMN answer_type TYPE VARCHAR(30)
    `;

    console.log('✅ Successfully migrated answer_type column to VARCHAR(30)');
    console.log('🎯 Now supports exercise types like:');
    console.log('   - psychometric-test');
    console.log('   - multi-scale-test');
    console.log('   - pilaren-score');
    console.log('   - kernkwaliteiten-selector');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateCursusAnswerType()
  .then(() => {
    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });