const { sql } = require('@vercel/postgres');

async function insertTestReview() {
  try {
    // Insert a test review
    const result = await sql`
      INSERT INTO reviews (name, role, content, avatar, rating)
      VALUES (
        'Jan Jansen',
        'Premium lid sinds 3 maanden',
        'De DatingAssistent heeft mijn liefdesleven volledig veranderd! Ik heb dankzij de AI-gebaseerde tips mijn perfecte match gevonden.',
        'https://placehold.co/100x100/1c1c2e/e0e0e0?text=J',
        5
      )
      RETURNING *
    `;
    
    console.log('Test review inserted:', result.rows[0]);
    
    // Fetch all reviews to verify
    const reviews = await sql`
      SELECT * FROM reviews ORDER BY created_at DESC
    `;
    
    console.log('All reviews:', reviews.rows);
  } catch (error) {
    console.error('Error inserting test review:', error);
  }
}

insertTestReview();