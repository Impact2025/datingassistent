import 'dotenv/config';
import { sql } from '@vercel/postgres';
import * as fs from 'fs';
import * as path from 'path';

async function runSchemaUpgrade() {
  try {
    console.log('🔧 Reading SQL upgrade script...');

    const sqlFilePath = path.join(__dirname, 'upgrade-neon-schema.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');

    console.log('🚀 Executing schema upgrade...');

    // Execute the SQL (note: sql`` doesn't support multi-statement, so we need to split)
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.includes('SELECT') && statement.includes('status')) {
        // This is the final status message
        const result = await sql.query(statement + ';');
        console.log('✅', result.rows[0]?.status || 'Done');
      } else {
        try {
          await sql.query(statement + ';');
        } catch (error: any) {
          // Ignore "already exists" errors
          if (error.message.includes('already exists')) {
            console.log('ℹ️  Skipping (already exists):', statement.substring(0, 60) + '...');
          } else {
            console.error('⚠️  Error executing:', statement.substring(0, 60) + '...');
            console.error('   Error:', error.message);
          }
        }
      }
    }

    console.log('\n✅ Schema upgrade completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Schema upgrade failed:', error);
    process.exit(1);
  }
}

runSchemaUpgrade();
