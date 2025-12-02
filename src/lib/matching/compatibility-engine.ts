/**
 * Compatibility Matching Engine
 * Sprint 6.4: AI-powered partner matching
 */

import { sql } from '@vercel/postgres';

export interface UserProfile {
  user_id: number;
  age: number;
  gender: string;
  looking_for: string[];
  values: string[];
  interests: string[];
  relationship_goals: string[];
  attachment_style?: string;
}

export interface CompatibilityScore {
  user_id: number;
  match_user_id: number;
  score: number; // 0-100
  reasons: string[];
  shared_values: string[];
  compatibility_breakdown: {
    values: number;
    goals: number;
    interests: number;
    attachment: number;
  };
}

export async function calculateCompatibility(userId: number, matchUserId: number): Promise<CompatibilityScore> {
  // Get both user profiles
  const user1 = await getUserMatchProfile(userId);
  const user2 = await getUserMatchProfile(matchUserId);

  let score = 0;
  const reasons: string[] = [];
  const sharedValues: string[] = [];

  // Values compatibility (40%)
  const valuesScore = calculateOverlap(user1.values, user2.values) * 40;
  score += valuesScore;
  if (valuesScore > 20) {
    const shared = user1.values.filter(v => user2.values.includes(v));
    sharedValues.push(...shared);
    reasons.push(`Gedeelde waarden: ${shared.join(', ')}`);
  }

  // Goals compatibility (30%)
  const goalsScore = calculateOverlap(user1.relationship_goals, user2.relationship_goals) * 30;
  score += goalsScore;

  // Interests (20%)
  const interestsScore = calculateOverlap(user1.interests, user2.interests) * 20;
  score += interestsScore;

  // Attachment style (10%)
  const attachmentScore = user1.attachment_style === user2.attachment_style ? 10 : 5;
  score += attachmentScore;

  return {
    user_id: userId,
    match_user_id: matchUserId,
    score: Math.round(score),
    reasons,
    shared_values: sharedValues,
    compatibility_breakdown: {
      values: Math.round(valuesScore / 40 * 100),
      goals: Math.round(goalsScore / 30 * 100),
      interests: Math.round(interestsScore / 20 * 100),
      attachment: Math.round(attachmentScore / 10 * 100)
    }
  };
}

function calculateOverlap(arr1: string[], arr2: string[]): number {
  if (arr1.length === 0 || arr2.length === 0) return 0;
  const overlap = arr1.filter(item => arr2.includes(item)).length;
  return overlap / Math.max(arr1.length, arr2.length);
}

async function getUserMatchProfile(userId: number): Promise<UserProfile> {
  const result = await sql`SELECT * FROM user_profiles WHERE user_id = ${userId}`;
  return result.rows[0];
}

export async function findMatches(userId: number, limit: number = 10): Promise<CompatibilityScore[]> {
  const allUsers = await sql`SELECT user_id FROM user_profiles WHERE user_id != ${userId} LIMIT 50`;
  const matches: CompatibilityScore[] = [];

  for (const user of allUsers.rows) {
    const score = await calculateCompatibility(userId, parseInt(user.user_id));
    if (score.score > 60) matches.push(score);
  }

  return matches.sort((a, b) => b.score - a.score).slice(0, limit);
}
