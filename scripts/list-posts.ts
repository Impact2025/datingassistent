import 'dotenv/config';
import { sql } from '@vercel/postgres';

async function listPosts() {
  const result = await sql`
    SELECT id, slug, LENGTH(content) as content_length
    FROM blog_posts
    ORDER BY content_length DESC
  `;

  console.log('Blog posts by content length:');
  result.rows.forEach(r => {
    console.log(`  ${r.slug}: ${r.content_length} chars`);
  });
}

listPosts().then(() => process.exit(0)).catch(console.error);
