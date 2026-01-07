/**
 * TEST: Blog Schema Verification
 * Verify all 13 new columns are present in the blogs table
 */

import { neon } from '@neondatabase/serverless';

async function testBlogSchema() {
  const sql = neon(process.env.DATABASE_URL);

  console.log('🔍 Testing Blog Schema...\n');

  try {
    // Get table schema
    const columns = await sql`
      SELECT column_name, data_type, column_default, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'blogs'
      ORDER BY ordinal_position;
    `;

    console.log('✅ Blogs table columns:\n');

    const newColumns = [
      'category',
      'tags',
      'cover_image_url',
      'cover_image_alt',
      'cover_image_blob_id',
      'header_type',
      'header_color',
      'header_title',
      'social_title',
      'social_description',
      'reading_time',
      'content_json',
      'author_bio',
      'author_avatar',
      'last_optimized_at',
      'ai_optimization_count',
    ];

    const foundColumns = columns.map(c => c.column_name);

    columns.forEach((col, idx) => {
      const isNew = newColumns.includes(col.column_name);
      const marker = isNew ? '🆕' : '  ';
      console.log(`${marker} ${idx + 1}. ${col.column_name.padEnd(25)} | ${col.data_type.padEnd(20)} | Nullable: ${col.is_nullable}`);
    });

    console.log('\n📊 New Columns Check:');
    newColumns.forEach(colName => {
      const exists = foundColumns.includes(colName);
      console.log(`${exists ? '✅' : '❌'} ${colName}`);
    });

    // Check indexes
    const indexes = await sql`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'blogs'
      ORDER BY indexname;
    `;

    console.log('\n🔑 Indexes:');
    indexes.forEach(idx => {
      console.log(`  - ${idx.indexname}`);
    });

    // Get sample blog with new fields
    const sampleBlog = await sql`
      SELECT id, title, category, tags, header_type, header_color,
             reading_time, cover_image_url, social_title
      FROM blogs
      ORDER BY created_at DESC
      LIMIT 1;
    `;

    if (sampleBlog.length > 0) {
      console.log('\n📝 Sample Blog (latest):');
      console.log(JSON.stringify(sampleBlog[0], null, 2));
    }

    console.log('\n✅ Schema verification complete!');

  } catch (error) {
    console.error('❌ Schema test failed:', error);
    process.exit(1);
  }
}

testBlogSchema();
