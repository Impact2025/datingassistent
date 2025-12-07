import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

/**
 * Save lead intake data for a user
 * Used during the lead activation onboarding flow
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, intakeData } = body;

    if (!userId || !intakeData) {
      return NextResponse.json(
        { error: 'userId and intakeData are required' },
        { status: 400 }
      );
    }

    console.log('📝 Saving lead intake for user:', userId, intakeData);

    // Check if user_profiles entry exists
    const existingProfile = await sql`
      SELECT id FROM user_profiles WHERE user_id = ${userId}
    `;

    if (existingProfile.rows.length > 0) {
      // Update existing profile
      await sql`
        UPDATE user_profiles
        SET lead_intake = ${JSON.stringify(intakeData)},
            updated_at = NOW()
        WHERE user_id = ${userId}
      `;
    } else {
      // Create new profile entry
      await sql`
        INSERT INTO user_profiles (user_id, lead_intake, created_at, updated_at)
        VALUES (${userId}, ${JSON.stringify(intakeData)}, NOW(), NOW())
      `;
    }

    console.log('✅ Lead intake saved for user:', userId);

    return NextResponse.json({
      success: true,
      message: 'Lead intake data saved'
    });

  } catch (error) {
    console.error('❌ Failed to save lead intake:', error);
    return NextResponse.json(
      { error: 'Failed to save lead intake data' },
      { status: 500 }
    );
  }
}
