import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user information
    const userResult = await sql`
      SELECT name, email, subscription_type FROM users WHERE id = ${userId}
    `;

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];

    // Schedule welcome email
    const welcomeEmailResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/emails/welcome`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        userName: user.name,
        userEmail: user.email,
        subscriptionType: user.subscription_type
      }),
    });

    // Create welcome in-app notification
    const notificationResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/notifications/welcome`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        userName: user.name,
        subscriptionType: user.subscription_type
      }),
    });

    // Initialize user journey progress
    // First, ensure the table exists
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS user_journey_progress (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          current_step VARCHAR(50) DEFAULT 'welcome',
          completed_steps JSONB DEFAULT '[]'::jsonb,
          journey_started_at TIMESTAMP DEFAULT NOW(),
          journey_completed_at TIMESTAMP,
          scan_data JSONB,
          dna_results JSONB,
          goals_data JSONB,
          profile_data JSONB,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(user_id)
        )
      `;

      // Create index if not exists
      await sql`
        CREATE INDEX IF NOT EXISTS idx_journey_user_id ON user_journey_progress(user_id)
      `;

      console.log('✅ user_journey_progress table ensured');
    } catch (tableError) {
      console.log('ℹ️ Table might already exist:', tableError);
    }

    // Now insert/update journey progress
    await sql`
      INSERT INTO user_journey_progress (
        user_id,
        current_step,
        completed_steps,
        journey_started_at
      ) VALUES (
        ${userId},
        'welcome',
        '["account_created"]'::jsonb,
        NOW()
      )
      ON CONFLICT (user_id)
      DO UPDATE SET
        current_step = EXCLUDED.current_step,
        journey_started_at = COALESCE(user_journey_progress.journey_started_at, EXCLUDED.journey_started_at),
        updated_at = NOW()
    `;

    console.log(`✅ Journey initialized for user ${userId}`);

    // Award welcome badge
    await sql`
      INSERT INTO user_badges (user_id, badge_type, badge_name, badge_description, badge_icon, earned_at)
      VALUES (${userId}, 'achievement', 'Welkom bij DatingAssistent', 'Account succesvol aangemaakt', '🎉', NOW())
      ON CONFLICT DO NOTHING
    `;

    console.log(`✅ Welcome automation completed for user ${userId}`);

    return NextResponse.json({
      success: true,
      message: 'Welcome automation completed',
      emailSent: welcomeEmailResponse.ok,
      notificationCreated: notificationResponse.ok
    });

  } catch (error) {
    console.error('Welcome automation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}