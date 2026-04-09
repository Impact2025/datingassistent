import { logger } from '@/lib/logger';
/**
 * Update Transformatie Video URLs
 *
 * Dit script update de video_url velden in transformatie_lessons
 * zodat ze naar de lokale video bestanden verwijzen.
 *
 * Run: npx tsx src/scripts/update-transformatie-videos.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

import { sql } from '@vercel/postgres';

async function updateVideoUrls() {
  logger.log('🎬 Transformatie Video URLs bijwerken...\n');

  try {
    // Get all lessons with their module info
    const lessons = await sql`
      SELECT
        l.id,
        l.slug as lesson_slug,
        l.lesson_order,
        m.module_order,
        m.slug as module_slug
      FROM transformatie_lessons l
      JOIN transformatie_modules m ON l.module_id = m.id
      ORDER BY m.module_order, l.lesson_order
    `;

    logger.log(`📋 Gevonden: ${lessons.rows.length} lessen\n`);

    let updatedCount = 0;

    for (const lesson of lessons.rows) {
      // Generate video URL based on naming pattern
      // Format: https://media.datingassistent.nl/videos/transformatie/module-{module_order}-les-{lesson_order}-{lesson_slug}.mp4
      const videoUrl = `https://media.datingassistent.nl/videos/transformatie/module-${lesson.module_order}-les-${lesson.lesson_order}-${lesson.lesson_slug}.mp4`;

      await sql`
        UPDATE transformatie_lessons
        SET video_url = ${videoUrl}
        WHERE id = ${lesson.id}
      `;

      logger.log(`✓ Module ${lesson.module_order}.${lesson.lesson_order}: ${videoUrl}`);
      updatedCount++;
    }

    logger.log(`\n✅ ${updatedCount} video URLs bijgewerkt!`);

    // Verify the update
    const verification = await sql`
      SELECT id, slug, video_url
      FROM transformatie_lessons
      WHERE video_url IS NOT NULL
      ORDER BY id
      LIMIT 5
    `;

    logger.log('\n📋 Verificatie (eerste 5 lessen):');
    for (const row of verification.rows) {
      logger.log(`  ${row.slug}: ${row.video_url}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }

  process.exit(0);
}

updateVideoUrls();
