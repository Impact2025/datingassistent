import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export interface TransformatieOnboardingData {
  // Stap 1: Waar sta je nu?
  currentSituation: 'single_searching' | 'single_break' | 'dating_struggling' | 'relationship_issues';

  // Stap 2: Wat is je grootste uitdaging?
  biggestChallenge: 'no_matches' | 'conversations_die' | 'no_dates' | 'wrong_people' | 'confidence' | 'past_trauma';

  // Stap 3: Wat wil je bereiken?
  goals: string[];

  // Stap 4: Commitment
  commitmentLevel: 'casual' | 'serious' | 'all_in';

  // Stap 5: Persoonlijke info voor AI
  firstName: string;
  ageRange: '18-25' | '26-35' | '36-45' | '46-55' | '55+';
}

/**
 * GET /api/transformatie/onboarding
 * Get current onboarding status/data
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    // Ensure table exists
    await sql`
      CREATE TABLE IF NOT EXISTS transformatie_onboarding (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE,
        data JSONB,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    const result = await sql`
      SELECT data, completed_at, created_at
      FROM transformatie_onboarding
      WHERE user_id = ${user.id}
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({
        completed: false,
        data: null,
      });
    }

    return NextResponse.json({
      completed: !!result.rows[0].completed_at,
      data: result.rows[0].data,
      completedAt: result.rows[0].completed_at,
    });
  } catch (error) {
    console.error('Get onboarding error:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/transformatie/onboarding
 * Save onboarding data
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    const { data } = await request.json() as { data: TransformatieOnboardingData };

    if (!data) {
      return NextResponse.json({ error: 'Data is verplicht' }, { status: 400 });
    }

    // Ensure table exists
    await sql`
      CREATE TABLE IF NOT EXISTS transformatie_onboarding (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE,
        data JSONB,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Upsert onboarding data
    const result = await sql`
      INSERT INTO transformatie_onboarding (user_id, data, completed_at, updated_at)
      VALUES (${user.id}, ${JSON.stringify(data)}, NOW(), NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET
        data = ${JSON.stringify(data)},
        completed_at = NOW(),
        updated_at = NOW()
      RETURNING id, completed_at
    `;

    console.log(`✅ Transformatie onboarding saved for user ${user.id}`);

    return NextResponse.json({
      success: true,
      completedAt: result.rows[0].completed_at,
    });
  } catch (error) {
    console.error('Save onboarding error:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het opslaan' },
      { status: 500 }
    );
  }
}
