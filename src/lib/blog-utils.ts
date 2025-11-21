/**
 * Increment the view count for a blog post
 */
export async function incrementBlogViewCountUtil(slug: string) {
  try {
    const response = await fetch(`/api/blogs/${slug}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'increment-views' }),
    });

    if (!response.ok) {
      throw new Error('Failed to increment view count');
    }

    const data = await response.json();
    return data.viewCount > 0;
  } catch (error) {
    console.error('Error incrementing blog view count:', error);
    return false;
  }
}

/**
 * Fix internal links in blog content to use anchor links
 */
export function fixInternalLinks(content: string): string {
  if (!content) return content;
  
  // Replace absolute internal links with anchor links
  // For example: http://localhost:9002/features -> /#features
  // And: https://datingassistent.nl/features -> /#features
  
  return content
    // Replace localhost links
    .replace(/http:\/\/localhost:9002\/(features|prijzen|reviews|over-ons|blog|faq|contact)/g, '/#$1')
    // Replace production links
    .replace(/https:\/\/datingassistent\.nl\/(features|prijzen|reviews|over-ons|blog|faq|contact)/g, '/#$1')
    // Also handle links without protocol
    .replace(/datingassistent\.nl\/(features|prijzen|reviews|over-ons|blog|faq|contact)/g, '/#$1');
}

/**
 * Get the most viewed blog posts
 */
export async function getMostViewedBlogPostsUtil(limitCount = 3) {
  try {
    const response = await fetch(`/api/blogs?type=most-viewed&limit=${limitCount}`);

    if (!response.ok) {
      throw new Error('Failed to fetch most viewed posts');
    }

    const posts = await response.json();
    return posts;
  } catch (error) {
    console.error('Error getting most viewed blog posts:', error);
    // Fallback to getting recent posts if error occurs
    return await getLatestBlogPostsUtil(limitCount);
  }
}

/**
 * Get the latest blog posts
 */
export async function getLatestBlogPostsUtil(limitCount = 2) {
  try {
    const response = await fetch(`/api/blogs?type=latest&limit=${limitCount}`);

    if (!response.ok) {
      throw new Error('Failed to fetch latest posts');
    }

    const posts = await response.json();
    return posts;
  } catch (error) {
    console.error('Error getting latest blog posts:', error);
    return [];
  }
}

/**
 * Get a blog post by slug
 */
export async function getBlogPostBySlugUtil(slug: string) {
  try {
    const response = await fetch(`/api/blogs/${slug}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch blog post');
    }

    const post = await response.json();
    
    // Fix internal links in the blog content
    if (post && post.content) {
      post.content = fixInternalLinks(post.content);
    }
    
    return post;
  } catch (error) {
    console.error('Error getting blog post by slug:', error);
    return null;
  }
}