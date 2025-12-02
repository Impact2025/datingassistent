/**
 * Success Stories System
 * Sprint 6.5: User testimonials & social proof
 */

import { sql } from '@vercel/postgres';

export interface SuccessStory {
  id: number;
  user_id: number;
  title: string;
  story: string;
  outcome: 'relationship' | 'confidence' | 'dating_skills' | 'other';
  is_verified: boolean;
  is_featured: boolean;
  likes_count: number;
  created_at: Date;
}

export async function submitSuccessStory(
  userId: number,
  title: string,
  story: string,
  outcome: string
): Promise<number> {
  const result = await sql`
    INSERT INTO success_stories (user_id, title, story, outcome, is_verified, created_at)
    VALUES (${userId}, ${title}, ${story}, ${outcome}, false, NOW())
    RETURNING id
  `;
  return parseInt(result.rows[0].id);
}

export async function getSuccessStories(featured: boolean = false, limit: number = 10): Promise<SuccessStory[]> {
  const result = featured
    ? await sql`SELECT * FROM success_stories WHERE is_verified = true AND is_featured = true ORDER BY created_at DESC LIMIT ${limit}`
    : await sql`SELECT * FROM success_stories WHERE is_verified = true ORDER BY likes_count DESC, created_at DESC LIMIT ${limit}`;

  return result.rows.map(r => ({ ...r, id: parseInt(r.id), user_id: parseInt(r.user_id) }));
}

export async function likeStory(storyId: number, userId: number): Promise<void> {
  await sql`INSERT INTO story_likes (story_id, user_id) VALUES (${storyId}, ${userId}) ON CONFLICT DO NOTHING`;
  await sql`UPDATE success_stories SET likes_count = likes_count + 1 WHERE id = ${storyId}`;
}
