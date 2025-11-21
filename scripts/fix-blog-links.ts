import { sql } from '@vercel/postgres';
import { fixInternalLinks } from '../src/lib/blog-utils';
import { updateBlogPostLinks } from '../src/lib/db-operations';

async function fixBlogLinks() {
  try {
    console.log('Starting blog link fix process...');
    
    // Fetch all blog posts
    const result = await sql`
      SELECT id, content, slug, title
      FROM blogs
    `;
    
    console.log(`Found ${result.rows.length} blog posts to process`);
    
    let updatedCount = 0;
    
    for (const blog of result.rows) {
      // Fix internal links in the content
      const fixedContent = fixInternalLinks(blog.content);
      
      // Only update if content has changed
      if (fixedContent !== blog.content) {
        // Use the database operation function to update the blog post
        await updateBlogPostLinks(blog.id, fixedContent);
        
        console.log(`Updated links in blog post: ${blog.title} (${blog.slug})`);
        updatedCount++;
      }
    }
    
    console.log(`Successfully updated ${updatedCount} blog posts with fixed links`);
  } catch (error) {
    console.error('Error fixing blog links:', error);
  }
}

// Run the script
fixBlogLinks();