import { sql } from '@vercel/postgres';
import { fixInternalLinks } from './blog-utils';

// User operations
export async function getUserByEmail(email: string) {
  try {
    const result = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
}

export async function getUserById(userId: number) {
  try {
    const result = await sql`
      SELECT
        u.*,
        up.name as profile_name,
        up.age,
        up.gender,
        up.looking_for,
        up.interests,
        up.bio,
        up.location,
        up.dating_goals,
        up.photos
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u.id = ${userId}
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
}

export async function updateUserLastLogin(userId: number) {
  try {
    await sql`
      UPDATE users
      SET last_login = CURRENT_TIMESTAMP
      WHERE id = ${userId}
    `;
  } catch (error) {
    console.error('Error updating last login:', error);
    throw error;
  }
}

export async function updateUserSubscription(
  userId: number,
  data: {
    subscriptionType: string;
    subscriptionStatus: string;
    subscriptionStartDate?: Date;
    subscriptionEndDate?: Date;
  }
) {
  try {
    await sql`
      UPDATE users
      SET 
        subscription_type = ${data.subscriptionType},
        subscription_status = ${data.subscriptionStatus},
        subscription_start_date = ${data.subscriptionStartDate ? data.subscriptionStartDate.toISOString() : null},
        subscription_end_date = ${data.subscriptionEndDate ? data.subscriptionEndDate.toISOString() : null},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}
    `;
  } catch (error) {
    console.error('Error updating user subscription:', error);
    throw error;
  }
}

export async function updateUserPassword(userId: number, newPasswordHash: string) {
  try {
    await sql`
      UPDATE users
      SET 
        password_hash = ${newPasswordHash},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}
    `;
  } catch (error) {
    console.error('Error updating user password:', error);
    throw error;
  }
}

// Password reset token operations
export async function createPasswordResetToken(userId: number, token: string, expiresAt: Date) {
  try {
    // Delete any existing tokens for this user
    await sql`
      DELETE FROM password_reset_tokens WHERE user_id = ${userId}
    `;
    
    // Create new token
    const result = await sql`
      INSERT INTO password_reset_tokens (user_id, token, expires_at)
      VALUES (${userId}, ${token}, ${expiresAt.toISOString()})
      RETURNING id, token, expires_at
    `;
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating password reset token:', error);
    throw error;
  }
}

export async function getPasswordResetToken(token: string) {
  try {
    const result = await sql`
      SELECT prt.*, u.email, u.display_name
      FROM password_reset_tokens prt
      JOIN users u ON prt.user_id = u.id
      WHERE prt.token = ${token} AND prt.used = false AND prt.expires_at > NOW()
    `;
    
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting password reset token:', error);
    throw error;
  }
}

export async function markPasswordResetTokenAsUsed(tokenId: number) {
  try {
    await sql`
      UPDATE password_reset_tokens
      SET used = true
      WHERE id = ${tokenId}
    `;
  } catch (error) {
    console.error('Error marking password reset token as used:', error);
    throw error;
  }
}

// Reviews operations
export async function getReviews() {
  try {
    const result = await sql`
      SELECT 
        id,
        name,
        role,
        content,
        avatar,
        rating,
        created_at
      FROM reviews 
      ORDER BY created_at DESC
    `;
    return result.rows;
  } catch (error) {
    console.error('Error getting reviews:', error);
    throw error;
  }
}

// Blog operations - keep only one implementation of each function
/**
 * Get the most viewed blog posts
 */
export async function getMostViewedBlogPosts(limit = 3) {
  try {
    const result = await sql`
      SELECT
        id,
        slug,
        title,
        excerpt,
        image as featured_image,
        placeholder_text,
        header_type,
        header_color,
        header_title,
        category,
        COALESCE(publish_date, created_at) as published_at,
        views as view_count,
        meta_title as seo_title,
        meta_description as seo_description,
        keywords,
        author
      FROM blogs
      WHERE published = true
      ORDER BY views DESC
      LIMIT ${limit}
    `;
    return result.rows.map(row => ({
      ...row,
      keywords: typeof row.keywords === 'string' ? JSON.parse(row.keywords) : row.keywords
    }));
  } catch (error) {
    console.error('Error getting most viewed blog posts:', error);
    return [];
  }
}

/**
 * Get the latest blog posts
 */
export async function getLatestBlogPosts(limit = 5) {
  try {
    const result = await sql`
      SELECT
        id,
        slug,
        title,
        excerpt,
        image as featured_image,
        placeholder_text,
        header_type,
        header_color,
        header_title,
        category,
        COALESCE(publish_date, created_at) as published_at,
        views as view_count,
        meta_title as seo_title,
        meta_description as seo_description,
        keywords,
        author
      FROM blogs
      WHERE published = true
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return result.rows.map(row => ({
      ...row,
      keywords: typeof row.keywords === 'string' ? JSON.parse(row.keywords) : row.keywords
    }));
  } catch (error) {
    console.error('Error getting latest blog posts:', error);
    return [];
  }
}

export async function getAllBlogTags() {
  try {
    const result = await sql`
      SELECT DISTINCT unnest(keywords::text[]) as tag
      FROM blogs
      WHERE published = true AND keywords IS NOT NULL
    `;
    return result.rows.map(row => row.tag);
  } catch (error) {
    console.error('Error getting blog tags:', error);
    throw error;
  }
}

// Conversation operations
export async function createConversation(
  userId: number,
  conversationType: string,
  title?: string
) {
  try {
    const result = await sql`
      INSERT INTO conversations (user_id, conversation_type, title)
      VALUES (${userId}, ${conversationType}, ${title || null})
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
}

export async function addMessage(
  conversationId: number,
  role: 'user' | 'assistant',
  content: string,
  metadata?: any
) {
  try {
    const result = await sql`
      INSERT INTO messages (conversation_id, role, content, metadata)
      VALUES (${conversationId}, ${role}, ${content}, ${metadata ? JSON.stringify(metadata) : null})
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error adding message:', error);
    throw error;
  }
}

export async function getConversationMessages(conversationId: number) {
  try {
    const result = await sql`
      SELECT * FROM messages
      WHERE conversation_id = ${conversationId}
      ORDER BY created_at ASC
    `;
    return result.rows;
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
}

export async function getUserConversations(userId: number) {
  try {
    const result = await sql`
      SELECT
        c.*,
        COUNT(m.id) as message_count,
        MAX(m.created_at) as last_message_at
      FROM conversations c
      LEFT JOIN messages m ON c.id = m.conversation_id
      WHERE c.user_id = ${userId}
      GROUP BY c.id
      ORDER BY last_message_at DESC NULLS LAST
    `;
    return result.rows;
  } catch (error) {
    console.error('Error getting conversations:', error);
    throw error;
  }
}

// Photo analysis operations
export async function savePhotoAnalysis(
  userId: number,
  photoUrl: string,
  analysisResult: any,
  score?: number
) {
  try {
    const result = await sql`
      INSERT INTO photo_analyses (user_id, photo_url, analysis_result, score)
      VALUES (${userId}, ${photoUrl}, ${JSON.stringify(analysisResult)}, ${score || null})
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error saving photo analysis:', error);
    throw error;
  }
}

export async function getUserPhotoAnalyses(userId: number, limit = 10) {
  try {
    const result = await sql`
      SELECT * FROM photo_analyses
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return result.rows;
  } catch (error) {
    console.error('Error getting photo analyses:', error);
    throw error;
  }
}

// Usage tracking operations
export async function trackUsage(
  userId: number,
  featureType: string,
  tokensUsed: number,
  cost: number
) {
  try {
    const result = await sql`
      INSERT INTO usage_tracking (user_id, feature_type, tokens_used, cost)
      VALUES (${userId}, ${featureType}, ${tokensUsed}, ${cost})
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error tracking usage:', error);
    throw error;
  }
}

export async function getUserUsageStats(userId: number, days = 30) {
  try {
    const result = await sql`
      SELECT
        feature_type,
        COUNT(*) as usage_count,
        SUM(tokens_used) as total_tokens,
        SUM(cost) as total_cost
      FROM usage_tracking
      WHERE user_id = ${userId}
        AND created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY feature_type
      ORDER BY total_cost DESC
    `;
    return result.rows;
  } catch (error) {
    console.error('Error getting usage stats:', error);
    throw error;
  }
}

// Blog operations
export async function createBlogPost(data: {
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  author?: string;
  published?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  keywords?: string[];
}) {
  try {
    const result = await sql`
      INSERT INTO blog_posts (
        slug, title, excerpt, content, featured_image, author,
        published, published_at, seo_title, seo_description, keywords
      )
      VALUES (
        ${data.slug},
        ${data.title},
        ${data.excerpt || null},
        ${data.content},
        ${data.featuredImage || null},
        ${data.author || null},
        ${data.published || false},
        ${data.published ? new Date().toISOString() : null},
        ${data.seoTitle || null},
        ${data.seoDescription || null},
        ${data.keywords ? JSON.stringify(data.keywords) : null}
      )
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error creating blog post:', error);
    throw error;
  }
}

export async function getBlogPostBySlug(slug: string) {
  try {
    const result = await sql`
      SELECT
        id,
        slug,
        title,
        excerpt,
        content,
        image as featured_image,
        placeholder_text,
        created_at,
        updated_at,
        views as view_count,
        meta_title as seo_title,
        meta_description as seo_description,
        keywords,
        author,
        published,
        COALESCE(publish_date, created_at) as published_at
      FROM blogs
      WHERE slug = ${slug}
    `;

    const post = result.rows[0];
    if (!post) return null;

    // Parse keywords if it's a string and fix internal links
    const fixedPost = {
      ...post,
      content: fixInternalLinks(post.content),
      keywords: typeof post.keywords === 'string' ? JSON.parse(post.keywords) : post.keywords
    };
    
    return fixedPost;
  } catch (error) {
    console.error('Error getting blog post:', error);
    throw error;
  }
}

/**
 * Update blog post content with fixed links
 */
export async function updateBlogPostLinks(id: number, content: string) {
  try {
    const result = await sql`
      UPDATE blogs
      SET content = ${content}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error updating blog post links:', error);
    throw error;
  }
}

export async function getPublishedBlogPosts(limit = 20, offset = 0) {
  try {
    const result = await sql`
      SELECT 
        id,
        slug,
        title,
        excerpt,
        content,
        image as featured_image,
        placeholder_text,
        created_at,
        updated_at,
        views as view_count,
        meta_title as seo_title,
        meta_description as seo_description,
        keywords,
        author,
        published,
        COALESCE(publish_date, created_at) as published_at
      FROM blogs
      WHERE published = true
      ORDER BY published_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    
    // Fix internal links for all posts
    return result.rows.map(post => ({
      ...post,
      content: fixInternalLinks(post.content),
      keywords: typeof post.keywords === 'string' ? JSON.parse(post.keywords) : post.keywords
    }));
  } catch (error) {
    console.error('Error getting blog posts:', error);
    throw error;
  }
}

// Profile operations
export async function createOrUpdateUserProfile(
  userId: number,
  profileData: {
    name?: string;
    age?: number;
    gender?: string;
    lookingFor?: string;
    interests?: string[];
    bio?: string;
    location?: string;
    datingGoals?: string;
    photos?: string[];
  }
) {
  try {
    // Check if profile exists
    const existing = await sql`
      SELECT id FROM user_profiles WHERE user_id = ${userId}
    `;

    if (existing.rows.length > 0) {
      // Update existing profile
      const result = await sql`
        UPDATE user_profiles
        SET
          name = COALESCE(${profileData.name}, name),
          age = COALESCE(${profileData.age}, age),
          gender = COALESCE(${profileData.gender}, gender),
          looking_for = COALESCE(${profileData.lookingFor}, looking_for),
          interests = COALESCE(${profileData.interests ? JSON.stringify(profileData.interests) : null}, interests),
          bio = COALESCE(${profileData.bio}, bio),
          location = COALESCE(${profileData.location}, location),
          dating_goals = COALESCE(${profileData.datingGoals}, dating_goals),
          photos = COALESCE(${profileData.photos ? JSON.stringify(profileData.photos) : null}, photos),
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ${userId}
        RETURNING *
      `;
      return result.rows[0];
    } else {
      // Create new profile
      const result = await sql`
        INSERT INTO user_profiles (
          user_id, name, age, gender, looking_for, interests, bio, location, dating_goals, photos
        )
        VALUES (
          ${userId},
          ${profileData.name || null},
          ${profileData.age || null},
          ${profileData.gender || null},
          ${profileData.lookingFor || null},
          ${profileData.interests ? JSON.stringify(profileData.interests) : null},
          ${profileData.bio || null},
          ${profileData.location || null},
          ${profileData.datingGoals || null},
          ${profileData.photos ? JSON.stringify(profileData.photos) : null}
        )
        RETURNING *
      `;
      return result.rows[0];
    }
  } catch (error) {
    console.error('Error creating/updating user profile:', error);
    throw error;
  }
}

export async function getUserProfile(userId: number) {
  try {
    const result = await sql`
      SELECT * FROM user_profiles WHERE user_id = ${userId}
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
}

export async function updateBlogPost(slug: string, data: Partial<{
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author: string;
  published: boolean;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
}>) {
  try {
    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(data.title);
    }
    if (data.excerpt !== undefined) {
      updates.push(`excerpt = $${paramIndex++}`);
      values.push(data.excerpt);
    }
    if (data.content !== undefined) {
      updates.push(`content = $${paramIndex++}`);
      values.push(data.content);
    }
    if (data.featuredImage !== undefined) {
      updates.push(`featured_image = $${paramIndex++}`);
      values.push(data.featuredImage);
    }
    if (data.author !== undefined) {
      updates.push(`author = $${paramIndex++}`);
      values.push(data.author);
    }
    if (data.published !== undefined) {
      updates.push(`published = $${paramIndex++}`);
      values.push(data.published);
      if (data.published) {
        updates.push(`published_at = CURRENT_TIMESTAMP`);
      }
    }
    if (data.seoTitle !== undefined) {
      updates.push(`seo_title = $${paramIndex++}`);
      values.push(data.seoTitle);
    }
    if (data.seoDescription !== undefined) {
      updates.push(`seo_description = $${paramIndex++}`);
      values.push(data.seoDescription);
    }
    if (data.keywords !== undefined) {
      updates.push(`keywords = $${paramIndex++}`);
      values.push(JSON.stringify(data.keywords));
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(slug);

    const queryText = `
      UPDATE blog_posts
      SET ${updates.join(', ')}
      WHERE slug = $${paramIndex}
      RETURNING *
    `;

    const result = await sql.query(queryText, values);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating blog post:', error);
    throw error;
  }
}

/**
 * Increment the view count for a blog post
 */
export async function incrementBlogViewCount(slug: string) {
  try {
    const result = await sql`
      UPDATE blogs
      SET views = views + 1
      WHERE slug = ${slug}
      RETURNING views
    `;
    return result.rows[0]?.views || 0;
  } catch (error) {
    console.error('Error incrementing blog view count:', error);
    return 0;
  }
}

// Order operations
export async function createOrder(data: {
  id: string;
  userId?: number;
  packageType: string;
  billingPeriod: string;
  amount: number;
  currency?: string;
  status: string;
  paymentProvider?: string;
  linkedToUser?: boolean;
}) {
  try {
    const result = await sql`
      INSERT INTO orders (
        id, user_id, package_type, billing_period, amount, currency, status, payment_provider, linked_to_user
      )
      VALUES (
        ${data.id},
        ${data.userId || null},
        ${data.packageType},
        ${data.billingPeriod},
        ${data.amount},
        ${data.currency || 'EUR'},
        ${data.status},
        ${data.paymentProvider || null},
        ${data.linkedToUser || false}
      )
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

export async function getOrderById(orderId: string) {
  try {
    const result = await sql`
      SELECT * FROM orders WHERE id = ${orderId}
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting order:', error);
    throw error;
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const result = await sql`
      UPDATE orders
      SET status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${orderId}
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

export async function linkOrderToUser(orderId: string, userId: number) {
  try {
    const result = await sql`
      UPDATE orders
      SET user_id = ${userId}, linked_to_user = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${orderId}
      RETURNING *
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error linking order to user:', error);
    throw error;
  }
}

export async function getUserOrders(userId: number, limit = 10) {
  try {
    const result = await sql`
      SELECT * FROM orders
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return result.rows;
  } catch (error) {
    console.error('Error getting user orders:', error);
    throw error;
  }
}