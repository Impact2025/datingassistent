import 'dotenv/config';
import { sql } from '@vercel/postgres';

async function checkPublishedBlogs() {
  console.log('📊 Checking published status of blogs...\n');

  // Check blogs table
  const blogsResult = await sql`
    SELECT id, title, slug, published, created_at
    FROM blogs
    ORDER BY created_at DESC
  `;

  console.log('=== BLOGS TABLE ===');
  console.log(`Total blogs: ${blogsResult.rows.length}\n`);

  blogsResult.rows.forEach((blog) => {
    console.log(`ID: ${blog.id}`);
    console.log(`Title: ${blog.title}`);
    console.log(`Slug: ${blog.slug}`);
    console.log(`Published: ${blog.published ? '✅ YES' : '❌ NO'}`);
    console.log(`Created: ${blog.created_at}`);
    console.log('---');
  });

  // Check blog_posts table
  const blogPostsResult = await sql`
    SELECT id, title, slug, published, created_at
    FROM blog_posts
    ORDER BY created_at DESC
  `;

  console.log('\n=== BLOG_POSTS TABLE ===');
  console.log(`Total blog_posts: ${blogPostsResult.rows.length}\n`);

  blogPostsResult.rows.forEach((post) => {
    console.log(`ID: ${post.id}`);
    console.log(`Title: ${post.title}`);
    console.log(`Slug: ${post.slug}`);
    console.log(`Published: ${post.published ? '✅ YES' : '❌ NO'}`);
    console.log(`Created: ${post.created_at}`);
    console.log('---');
  });

  // Count published vs unpublished
  const publishedBlogs = blogsResult.rows.filter(b => b.published).length;
  const unpublishedBlogs = blogsResult.rows.filter(b => !b.published).length;
  const publishedPosts = blogPostsResult.rows.filter(b => b.published).length;
  const unpublishedPosts = blogPostsResult.rows.filter(b => !b.published).length;

  console.log('\n=== SUMMARY ===');
  console.log(`blogs table: ${publishedBlogs} published, ${unpublishedBlogs} unpublished`);
  console.log(`blog_posts table: ${publishedPosts} published, ${unpublishedPosts} unpublished`);
}

checkPublishedBlogs().then(() => process.exit(0)).catch(console.error);
