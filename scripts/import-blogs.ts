// Import blog posts from blog_list.json into the database
// Run: npx tsx scripts/import-blogs.ts
import { sql } from '@vercel/postgres';
import * as fs from 'fs';
import * as path from 'path';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  published: boolean;
  publish_date?: string;
  created_at?: string;
  image?: string;
  category?: string;
  tags?: string[];
  keywords?: string[];
  author?: string;
  cover_image_url?: string;
  cover_image_alt?: string;
  seo_title?: string;
  seo_description?: string;
}

async function importBlogs() {
  console.log('🔄 Blog import started...');
  
  // Read UTF-16LE encoded JSON
  const rawBuffer = fs.readFileSync(path.join(process.cwd(), 'blog_list.json'));
  // Strip BOM (0xFEFF) and parse UTF-16LE
  let rawText = rawBuffer.toString('utf16le');
  if (rawText.charCodeAt(0) === 0xFEFF) {
    rawText = rawText.slice(1);
  }
  const data = JSON.parse(rawText);
  
  if (!data.success || !Array.isArray(data.blogs)) {
    console.error('❌ Invalid blog_list.json format');
    process.exit(1);
  }
  
  const blogs: BlogPost[] = data.blogs;
  console.log(`📦 ${blogs.length} blogs found in blog_list.json`);
  
  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const blog of blogs) {
    try {
      // Check if slug already exists
      const existing = await sql`SELECT id FROM blogs WHERE slug = ${blog.slug} LIMIT 1`;
      
      if (existing.rows.length > 0) {
        // Update existing
        await sql`
          UPDATE blogs SET
            title = ${blog.title},
            excerpt = ${blog.excerpt},
            content = ${blog.content},
            published = ${blog.published !== false},
            image = ${blog.image || null},
            category = ${blog.category || null},
            tags = ${blog.tags ? JSON.stringify(blog.tags) : null},
            keywords = ${blog.keywords ? JSON.stringify(blog.keywords) : null},
            author = ${blog.author || 'DatingAssistent'},
            cover_image_url = ${blog.cover_image_url || blog.image || null},
            cover_image_alt = ${blog.cover_image_alt || null},
            seo_title = ${blog.seo_title || null},
            seo_description = ${blog.seo_description || null},
            publish_date = ${blog.publish_date ? new Date(blog.publish_date) : new Date()},
            updated_at = NOW()
          WHERE slug = ${blog.slug}
        `;
        updated++;
        console.log(`  📝 Updated: ${blog.slug}`);
      } else {
        // Insert new
        await sql`
          INSERT INTO blogs (
            slug, title, excerpt, content, published,
            image, category, tags, keywords, author,
            cover_image_url, cover_image_alt,
            seo_title, seo_description,
            publish_date, created_at, updated_at
          ) VALUES (
            ${blog.slug},
            ${blog.title},
            ${blog.excerpt || ''},
            ${blog.content},
            ${blog.published !== false},
            ${blog.image || null},
            ${blog.category || 'Dating Tips'},
            ${blog.tags ? JSON.stringify(blog.tags) : '[]'},
            ${blog.keywords ? JSON.stringify(blog.keywords) : '[]'},
            ${blog.author || 'DatingAssistent'},
            ${blog.cover_image_url || blog.image || null},
            ${blog.cover_image_alt || null},
            ${blog.seo_title || null},
            ${blog.seo_description || null},
            ${blog.publish_date ? new Date(blog.publish_date) : new Date()},
            NOW(), NOW()
          )
        `;
        inserted++;
        console.log(`  ✅ Inserted: ${blog.slug}`);
      }
    } catch (err: any) {
      errors++;
      console.error(`  ❌ Error for ${blog.slug}:`, err.message);
    }
  }
  
  console.log(`\n📊 Result: ${inserted} inserted, ${updated} updated, ${skipped} skipped, ${errors} errors`);
  process.exit(0);
}

importBlogs();
