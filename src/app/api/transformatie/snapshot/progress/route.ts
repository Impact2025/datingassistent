/**
 * API Route: Dating Snapshot Progress
 *
 * POST - Save progress during onboarding
 */

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getServerSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { sectionId, answers } = body;

    // Check if profile exists
    const existing = await sql`
      SELECT id, completed_sections, answers_json
      FROM user_onboarding_profiles
      WHERE user_id = ${userId}
    `;

    if (existing.rows.length === 0) {
      // Create new profile with progress
      const completedSections = [sectionId];
      await sql`
        INSERT INTO user_onboarding_profiles (
          user_id,
          current_section,
          completed_sections,
          answers_json,
          completion_percentage
        ) VALUES (
          ${userId},
          ${sectionId + 1},
          ${JSON.stringify(completedSections)}::jsonb,
          ${JSON.stringify(answers)}::jsonb,
          ${Math.round((completedSections.length / 7) * 100)}
        )
      `;
    } else {
      // Update existing profile
      const currentCompletedSections = existing.rows[0].completed_sections || [];
      const currentAnswers = existing.rows[0].answers_json || {};

      // Merge answers
      const mergedAnswers = { ...currentAnswers, ...answers };

      // Add section to completed if not already there
      const updatedCompletedSections = currentCompletedSections.includes(sectionId)
        ? currentCompletedSections
        : [...currentCompletedSections, sectionId];

      await sql`
        UPDATE user_onboarding_profiles
        SET
          current_section = ${sectionId + 1},
          completed_sections = ${JSON.stringify(updatedCompletedSections)}::jsonb,
          answers_json = ${JSON.stringify(mergedAnswers)}::jsonb,
          completion_percentage = ${Math.round((updatedCompletedSections.length / 7) * 100)},
          last_updated = NOW()
        WHERE user_id = ${userId}
      `;
    }

    return NextResponse.json({
      success: true,
      sectionId,
      completionPercentage: Math.round(((sectionId) / 7) * 100),
    });
  } catch (error) {
    console.error('Error saving progress:', error);
    return NextResponse.json(
      { error: 'Failed to save progress' },
      { status: 500 }
    );
  }
}
