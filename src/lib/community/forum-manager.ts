/**
 * Community Forum Manager
 * Sprint 6.2: Peer support & discussions
 */

import { sql } from '@vercel/postgres';

export interface ForumPost {
  id: number;
  user_id: number;
  title: string;
  content: string;
  category: 'dating_tips' | 'success_stories' | 'challenges' | 'questions' | 'general';
  likes_count: number;
  comments_count: number;
  is_pinned: boolean;
  created_at: Date;
}

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  likes_count: number;
  created_at: Date;
}

export async function createPost(userId: number, title: string, content: string, category: string): Promise<number> {
  const result = await sql`
    INSERT INTO forum_posts (user_id, title, content, category, created_at)
    VALUES (${userId}, ${title}, ${content}, ${category}, NOW())
    RETURNING id
  `;
  return parseInt(result.rows[0].id);
}

export async function getPosts(category?: string, limit: number = 20): Promise<ForumPost[]> {
  const result = category
    ? await sql`SELECT * FROM forum_posts WHERE category = ${category} ORDER BY created_at DESC LIMIT ${limit}`
    : await sql`SELECT * FROM forum_posts ORDER BY created_at DESC LIMIT ${limit}`;
  return result.rows.map(r => ({ ...r, id: parseInt(r.id), user_id: parseInt(r.user_id) }));
}

export async function addComment(postId: number, userId: number, content: string): Promise<void> {
  await sql`INSERT INTO forum_comments (post_id, user_id, content, created_at) VALUES (${postId}, ${userId}, ${content}, NOW())`;
  await sql`UPDATE forum_posts SET comments_count = comments_count + 1 WHERE id = ${postId}`;
}
