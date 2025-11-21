import 'dotenv/config';
import { sql } from '@vercel/postgres';

async function publishBlog() {
  const blogId = 5; // The unpublished blog

  console.log(`📝 Publishing blog ID ${blogId}...`);

  await sql`
    UPDATE blogs
    SET published = true,
        updated_at = NOW()
    WHERE id = ${blogId}
  `;

  console.log('✅ Blog published!');

  // Verify
  const result = await sql`
    SELECT id, title, slug, published
    FROM blogs
    WHERE id = ${blogId}
  `;

  console.log('\nVerification:');
  console.log(result.rows[0]);
}

publishBlog().then(() => process.exit(0)).catch(console.error);
