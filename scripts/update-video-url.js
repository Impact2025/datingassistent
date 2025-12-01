const { sql } = require('@vercel/postgres');

async function updateVideoUrl() {
  try {
    console.log('🎬 Updating video URL for les 1...');

    // Update de video sectie van les 1
    const result = await sql`
      UPDATE cursus_secties
      SET inhoud = jsonb_set(
        COALESCE(inhoud, '{}'::jsonb),
        '{videoUrl}',
        '"/videos/les-1-fotofouten.mp4"'
      )
      WHERE les_id = 1
        AND sectie_type = 'video'
        AND slug = 'video'
      RETURNING *;
    `;

    console.log('✅ Video URL updated!');
    console.log('Updated section:', result.rows[0]);
    console.log('Inhoud:', result.rows[0].inhoud);

  } catch (error) {
    console.error('❌ Error updating video URL:', error);
  }
}

updateVideoUrl();
