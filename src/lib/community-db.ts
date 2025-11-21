import { sql } from '@vercel/postgres';
import { ExtendedUserProfile, Badge, UserBadge, ForumCategory, ForumPost, ForumReply } from '@/lib/types';

/**
 * Community Database Operations
 */

function normalizeInterests(input: unknown): string[] {
  if (!input) return [];

  if (Array.isArray(input)) {
    return input
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter((item) => item.length > 0);
  }

  if (typeof input === 'string') {
    return input
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  return [];
}

function parseInterests(value: unknown): string[] {
  if (!value) return [];

  // If it's already an array (from database query), return it
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item : ''))
      .filter((item) => item.length > 0);
  }

  // If it's a string, try to parse as JSON
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed)
        ? parsed.filter((item: unknown): item is string => typeof item === 'string')
        : [];
    } catch (error) {
      console.warn('Failed to parse interests string:', error);
      return [];
    }
  }

  return [];
}

// User Profile Operations
export async function createUserProfileExtended(userId: number, profileData: Partial<ExtendedUserProfile>) {
  try {
    console.log('Creating extended profile for user:', userId, 'with data:', profileData);

    const interestsArray = normalizeInterests(profileData.interests);

    const result = await sql`
      INSERT INTO user_profiles_extended (
        user_id, bio, location, interests, profile_picture_url, cover_photo_url, join_date, last_active, reputation_points
      )
      VALUES (
        ${userId},
        ${profileData.bio ?? null},
        ${profileData.location ?? null},
        ${JSON.stringify(interestsArray)}::jsonb,
        ${profileData.profilePictureUrl ?? null},
        ${profileData.coverPhotoUrl ?? null},
        NOW(),
        NOW(),
        ${profileData.reputationPoints ?? 0}
      )
      RETURNING *
    `;

    console.log('Created extended profile result:', result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating extended user profile for user', userId, ':', error);
    throw error;
  }
}

export async function getUserProfileExtended(userId: number): Promise<ExtendedUserProfile | null> {
  try {
    console.log('Fetching extended profile for user:', userId);
    const result = await sql`
      SELECT * FROM user_profiles_extended
      WHERE user_id = ${userId}
    `;

    console.log('Profile query result:', result.rows);

    if (result.rows.length === 0) {
      console.log('No extended profile found, creating basic one for user:', userId);
      const userProfileResult = await sql`
        SELECT name, email FROM users WHERE id = ${userId}
      `;

      console.log('User query result:', userProfileResult.rows);

      if (userProfileResult.rows.length === 0) {
        console.log('No user found with id:', userId);
        return null;
      }

      const basicProfile = await createUserProfileExtended(userId, {
        name: userProfileResult.rows[0].name,
        email: userProfileResult.rows[0].email
      });

      return {
        id: basicProfile.id,
        userId: basicProfile.user_id,
        bio: basicProfile.bio,
        location: basicProfile.location,
        interests: parseInterests(basicProfile.interests),
        profilePictureUrl: basicProfile.profile_picture_url,
        coverPhotoUrl: basicProfile.cover_photo_url,
        joinDate: basicProfile.join_date,
        lastActive: basicProfile.last_active,
        reputationPoints: basicProfile.reputation_points,
        createdAt: basicProfile.created_at,
        updatedAt: basicProfile.updated_at,
        name: userProfileResult.rows[0].name,
        email: userProfileResult.rows[0].email,
        age: null,
        gender: null,
        lookingFor: null,
        photos: [],
        datingExperience: undefined,
        strengths: [],
        areasForImprovement: []
      };
    }

    const row = result.rows[0];
    const userProfileResult = await sql`
      SELECT name, email FROM users WHERE id = ${userId}
    `;

    const userData = userProfileResult.rows[0] || { name: '', email: null };

    console.log('Returning profile for user:', userId);

    const interests = parseInterests(row.interests);

    return {
      id: row.id,
      userId: row.user_id,
      bio: row.bio,
      location: row.location,
      interests,
      profilePictureUrl: row.profile_picture_url,
      coverPhotoUrl: row.cover_photo_url,
      joinDate: row.join_date,
      lastActive: row.last_active,
      reputationPoints: row.reputation_points,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      name: userData.name,
      email: userData.email,
      age: null,
      gender: null,
      lookingFor: null,
      photos: [],
      datingExperience: undefined,
      strengths: [],
      areasForImprovement: []
    };
  } catch (error) {
    console.error('Error fetching extended user profile for user', userId, ':', error);
    return null;
  }
}

export async function updateUserProfileExtended(userId: number, profileData: Partial<ExtendedUserProfile>) {
  try {
    console.log('Updating profile for user:', userId, 'with data:', profileData);
    const existingProfile = await sql`
      SELECT id FROM user_profiles_extended WHERE user_id = ${userId}
    `;

    if (existingProfile.rows.length === 0) {
      console.log('No existing profile found, creating new one');
      await createUserProfileExtended(userId, profileData);
      return;
    }

    const updates = [] as any[];

    if (profileData.bio !== undefined) {
      updates.push(sql`bio = ${profileData.bio}`);
    }

    if (profileData.location !== undefined) {
      updates.push(sql`location = ${profileData.location}`);
    }

    if (profileData.interests !== undefined) {
      const interestsArray = normalizeInterests(profileData.interests);
      updates.push(sql`interests = ${JSON.stringify(interestsArray)}::jsonb`);
    }

    if (profileData.profilePictureUrl !== undefined) {
      updates.push(sql`profile_picture_url = ${profileData.profilePictureUrl}`);
    }

    if (profileData.coverPhotoUrl !== undefined) {
      updates.push(sql`cover_photo_url = ${profileData.coverPhotoUrl}`);
    }

    if (profileData.reputationPoints !== undefined) {
      updates.push(sql`reputation_points = ${profileData.reputationPoints}`);
    }

    updates.push(sql`last_active = NOW()`);
    updates.push(sql`updated_at = NOW()`);

    if (updates.length === 0) {
      console.log('No profile fields provided for update. Skipping.');
      return null;
    }

    // Build the SET clause manually
    const setClause = updates.join(', ');

    const result = await sql`
      UPDATE user_profiles_extended
      SET ${setClause}
      WHERE user_id = ${userId}
      RETURNING *
    `;

    console.log('Updated profile:', result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.error('Error updating extended user profile:', error);
    throw error;
  }
}

// Badge Operations
export async function getAllBadges(): Promise<Badge[]> {
  try {
    const result = await sql`
      SELECT * FROM badges
      ORDER BY id
    `;
    
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      iconUrl: row.icon_url,
      criteria: row.criteria,
      createdAt: row.created_at
    }));
  } catch (error) {
    console.error('Error fetching badges:', error);
    return [];
  }
}

export async function getUserBadges(userId: number): Promise<UserBadge[]> {
  try {
    const result = await sql`
      SELECT ub.*, b.name, b.description, b.icon_url, b.criteria, b.created_at as badge_created_at
      FROM user_badges ub
      JOIN badges b ON ub.badge_id = b.id
      WHERE ub.user_id = ${userId}
      ORDER BY ub.earned_at DESC
    `;
    
    return result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      badgeId: row.badge_id,
      badge: {
        id: row.badge_id,
        name: row.name,
        description: row.description,
        iconUrl: row.icon_url,
        criteria: row.criteria,
        createdAt: row.badge_created_at
      },
      earnedAt: row.earned_at
    }));
  } catch (error) {
    console.error('Error fetching user badges:', error);
    return [];
  }
}

export async function awardBadgeToUser(userId: number, badgeId: number) {
  try {
    // First check if user already has this badge
    const existing = await sql`
      SELECT id FROM user_badges 
      WHERE user_id = ${userId} AND badge_id = ${badgeId}
    `;
    
    if (existing.rows.length > 0) {
      // User already has this badge
      return existing.rows[0];
    }
    
    const result = await sql`
      INSERT INTO user_badges (user_id, badge_id, earned_at)
      VALUES (${userId}, ${badgeId}, NOW())
      RETURNING *
    `;
    
    return result.rows[0];
  } catch (error) {
    console.error('Error awarding badge to user:', error);
    throw error;
  }
}

// Forum Operations
export async function getAllForumCategories(): Promise<ForumCategory[]> {
  try {
    const result = await sql`
      SELECT * FROM forum_categories
      ORDER BY sort_order, id
    `;
    
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      icon: row.icon,
      color: row.color,
      sortOrder: row.sort_order,
      createdAt: row.created_at
    }));
  } catch (error) {
    console.error('Error fetching forum categories:', error);
    return [];
  }
}

export async function getForumPostsByCategory(categoryId: number, limit = 20, offset = 0): Promise<ForumPost[]> {
  try {
    const result = await sql`
      SELECT fp.*, u.name as user_name, fc.name as category_name, fc.color as category_color,
             upe.profile_picture_url
      FROM forum_posts fp
      JOIN users u ON fp.user_id = u.id
      JOIN forum_categories fc ON fp.category_id = fc.id
      LEFT JOIN user_profiles_extended upe ON fp.user_id = upe.user_id
      WHERE fp.category_id = ${categoryId}
      ORDER BY fp.is_pinned DESC, fp.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    return result.rows.map(row => ({
      id: row.id,
      categoryId: row.category_id,
      userId: row.user_id,
      title: row.title,
      content: row.content,
      views: row.views,
      repliesCount: row.replies_count,
      isPinned: row.is_pinned,
      isLocked: row.is_locked,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      user: {
        name: row.user_name,
        profilePictureUrl: row.profile_picture_url
      },
      category: {
        id: row.category_id,
        name: row.category_name,
        color: row.category_color,
        description: '',
        icon: '',
        sortOrder: 0,
        createdAt: ''
      }
    }));
  } catch (error) {
    console.error('Error fetching forum posts:', error);
    return [];
  }
}

export async function createForumPost(userId: number, categoryId: number, title: string, content: string): Promise<ForumPost> {
  try {
    const result = await sql`
      INSERT INTO forum_posts (user_id, category_id, title, content, created_at, updated_at)
      VALUES (${userId}, ${categoryId}, ${title}, ${content}, NOW(), NOW())
      RETURNING *
    `;
    
    const row = result.rows[0];
    return {
      id: row.id,
      categoryId: row.category_id,
      userId: row.user_id,
      title: row.title,
      content: row.content,
      views: row.views,
      repliesCount: row.replies_count,
      isPinned: row.is_pinned,
      isLocked: row.is_locked,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  } catch (error) {
    console.error('Error creating forum post:', error);
    throw error;
  }
}

export async function getForumRepliesByPost(postId: number): Promise<ForumReply[]> {
  try {
    const result = await sql`
      SELECT fr.*, u.name as user_name, upe.profile_picture_url
      FROM forum_replies fr
      JOIN users u ON fr.user_id = u.id
      LEFT JOIN user_profiles_extended upe ON fr.user_id = upe.user_id
      WHERE fr.post_id = ${postId}
      ORDER BY fr.created_at ASC
    `;

    return result.rows.map(row => ({
      id: row.id,
      postId: row.post_id,
      userId: row.user_id,
      content: row.content,
      isSolution: row.is_solution,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      user: {
        name: row.user_name,
        profilePictureUrl: row.profile_picture_url
      }
    }));
  } catch (error) {
    console.error('Error fetching forum replies:', error);
    return [];
  }
}

export async function createForumReply(userId: number, postId: number, content: string): Promise<ForumReply> {
  try {
    // Create the reply
    const result = await sql`
      INSERT INTO forum_replies (user_id, post_id, content, created_at, updated_at)
      VALUES (${userId}, ${postId}, ${content}, NOW(), NOW())
      RETURNING *
    `;
    
    const reply = result.rows[0];
    
    // Update the post's reply count
    await sql`
      UPDATE forum_posts
      SET replies_count = replies_count + 1, updated_at = NOW()
      WHERE id = ${postId}
    `;
    
    return {
      id: reply.id,
      postId: reply.post_id,
      userId: reply.user_id,
      content: reply.content,
      isSolution: reply.is_solution,
      createdAt: reply.created_at,
      updatedAt: reply.updated_at
    };
  } catch (error) {
    console.error('Error creating forum reply:', error);
    throw error;
  }
}