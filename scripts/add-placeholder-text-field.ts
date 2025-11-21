import { sql } from '@vercel/postgres';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function addPlaceholderTextField() {
  try {
    console.log('🔄 Adding placeholder_text column to blogs table...');

    // Add placeholder_text column if it doesn't exist
    await sql`
      ALTER TABLE blogs
      ADD COLUMN IF NOT EXISTS placeholder_text VARCHAR(50)
    `;

    console.log('✅ Successfully added placeholder_text column to blogs table');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding placeholder_text column:', error);
    process.exit(1);
  }
}

addPlaceholderTextField();
