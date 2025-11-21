require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function checkForumPosts() {
  try {
    console.log('🔍 Checking forum posts...\n');

    // Count posts
    const postsCount = await sql`
      SELECT COUNT(*) as count FROM forum_posts
    `;
    console.log(`📊 Total forum posts: ${postsCount.rows[0].count}`);

    // Count replies
    const repliesCount = await sql`
      SELECT COUNT(*) as count FROM forum_replies
    `;
    console.log(`📊 Total forum replies: ${repliesCount.rows[0].count}`);

    // Get recent posts
    const recentPosts = await sql`
      SELECT fp.id, fp.title, fp.created_at, u.name as user_name, fc.name as category_name
      FROM forum_posts fp
      JOIN users u ON fp.user_id = u.id
      JOIN forum_categories fc ON fp.category_id = fc.id
      ORDER BY fp.created_at DESC
      LIMIT 5
    `;

    if (recentPosts.rows.length > 0) {
      console.log('\n📋 Recent posts:');
      recentPosts.rows.forEach(post => {
        console.log(`  - ID ${post.id}: "${post.title}" by ${post.user_name} in ${post.category_name} (${new Date(post.created_at).toLocaleDateString('nl-NL')})`);
      });
    } else {
      console.log('\n📋 No posts found');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkForumPosts();