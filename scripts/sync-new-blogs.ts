import 'dotenv/config';
import { sql } from '@vercel/postgres';
import fs from 'fs';
import path from 'path';

async function main() {
  const p = path.join(process.cwd(), 'blog_list.json');
  let raw = fs.readFileSync(p, 'utf16le');
  if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
  const data = JSON.parse(raw);
  const blogs = data.blogs.filter((b: any) => b.id >= 8); // our 3 new blogs

  console.log(`Syncing ${blogs.length} new blogs to DB...`);

  for (const blog of blogs) {
    const existing = await sql`SELECT id FROM blogs WHERE slug = ${blog.slug} LIMIT 1`;
    if (existing.rows.length > 0) {
      console.log(`  [skip] ${blog.slug} already in DB`);
      continue;
    }
    await sql`
      INSERT INTO blogs (
        slug, title, excerpt, content, published,
        image, category, tags, keywords, author,
        cover_image_url, cover_image_alt,
        seo_title, seo_description,
        publish_date, created_at, updated_at
      ) VALUES (
        ${blog.slug}, ${blog.title}, ${blog.excerpt || ''}, ${blog.content},
        ${blog.published !== false},
        ${blog.cover_image_url || null}, ${blog.category || 'Dating Tips'},
        ${JSON.stringify(blog.keywords || [])}, ${JSON.stringify(blog.keywords || [])},
        ${blog.author || 'DatingAssistent'},
        ${blog.cover_image_url || null}, ${blog.cover_image_alt || null},
        ${blog.metaTitle || null}, ${blog.metaDescription || null},
        ${new Date(blog.createdAt || Date.now())}, NOW(), NOW()
      )
    `;
    console.log(`  [inserted] ${blog.slug} (id ${blog.id})`);
  }
  console.log('Done.');
}

main().then(() => process.exit(0)).catch((e) => { console.error('ERR', e); process.exit(1); });
