/**
 * Expert Coaching Marketplace
 * Sprint 6.6: Connect with real dating coaches
 */

import { sql } from '@vercel/postgres';

export interface ExpertCoach {
  id: number;
  name: string;
  bio: string;
  specialties: string[];
  rating: number;
  reviews_count: number;
  hourly_rate: number;
  availability: 'available' | 'busy' | 'unavailable';
  certifications: string[];
  years_experience: number;
}

export interface CoachingSession {
  id: number;
  user_id: number;
  coach_id: number;
  scheduled_at: Date;
  duration_minutes: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  rating?: number;
}

export async function getExpertCoaches(specialty?: string, limit: number = 10): Promise<ExpertCoach[]> {
  const result = specialty
    ? await sql`SELECT * FROM expert_coaches WHERE ${specialty} = ANY(specialties) AND availability = 'available' ORDER BY rating DESC LIMIT ${limit}`
    : await sql`SELECT * FROM expert_coaches WHERE availability = 'available' ORDER BY rating DESC LIMIT ${limit}`;

  return result.rows.map(r => ({ ...r, id: parseInt(r.id) }));
}

export async function bookSession(
  userId: number,
  coachId: number,
  scheduledAt: Date,
  duration: number
): Promise<number> {
  const result = await sql`
    INSERT INTO coaching_sessions (user_id, coach_id, scheduled_at, duration_minutes, status)
    VALUES (${userId}, ${coachId}, ${scheduledAt.toISOString()}, ${duration}, 'scheduled')
    RETURNING id
  `;
  return parseInt(result.rows[0].id);
}

export async function rateSession(sessionId: number, rating: number, notes: string): Promise<void> {
  await sql`UPDATE coaching_sessions SET rating = ${rating}, notes = ${notes}, status = 'completed' WHERE id = ${sessionId}`;

  // Update coach rating
  await sql`
    UPDATE expert_coaches
    SET rating = (SELECT AVG(rating) FROM coaching_sessions WHERE coach_id = expert_coaches.id AND rating IS NOT NULL),
        reviews_count = (SELECT COUNT(*) FROM coaching_sessions WHERE coach_id = expert_coaches.id AND rating IS NOT NULL)
    WHERE id = (SELECT coach_id FROM coaching_sessions WHERE id = ${sessionId})
  `;
}

export async function getUserSessions(userId: number): Promise<CoachingSession[]> {
  const result = await sql`SELECT * FROM coaching_sessions WHERE user_id = ${userId} ORDER BY scheduled_at DESC`;
  return result.rows.map(r => ({ ...r, id: parseInt(r.id), user_id: parseInt(r.user_id), coach_id: parseInt(r.coach_id) }));
}
