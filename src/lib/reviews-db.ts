import { sql } from '@vercel/postgres';

let publishedColumnEnsured = false;

export async function ensureReviewPublishedColumn() {
  if (publishedColumnEnsured) {
    return;
  }

  try {
    // Check if column exists
    const result = await sql`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'reviews' AND column_name = 'published'
    `;

    // Add column if it doesn't exist
    if (result.rows.length === 0) {
      await sql.query('ALTER TABLE reviews ADD COLUMN published boolean DEFAULT true');
      console.log('✅ Added published column to reviews table');
    }

    // Update existing records
    await sql`
      UPDATE reviews
      SET published = true
      WHERE published IS NULL
    `;

  } catch (error) {
    console.error('Error ensuring published column:', error);
    // Continue anyway - the API might still work
  }

  publishedColumnEnsured = true;
}

