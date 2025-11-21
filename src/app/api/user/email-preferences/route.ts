/**
 * API: User Email Preferences
 * GET: Fetch current preferences
 * PUT: Update preferences
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get user from auth token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get email preferences
    const result = await sql`
      SELECT
        onboarding_emails,
        engagement_emails,
        educational_emails,
        marketing_emails,
        milestone_emails,
        digest_emails,
        frequency,
        max_emails_per_week,
        digest_day,
        digest_time,
        unsubscribed_all,
        unsubscribed_at,
        last_email_sent_at,
        emails_sent_this_week
      FROM email_preferences
      WHERE user_id = ${user.id}
    `;

    if (result.rows.length === 0) {
      // Create default preferences
      await sql`
        INSERT INTO email_preferences (user_id)
        VALUES (${user.id})
      `;

      // Return defaults
      return NextResponse.json({
        onboarding_emails: true,
        engagement_emails: true,
        educational_emails: true,
        marketing_emails: true,
        milestone_emails: true,
        digest_emails: true,
        frequency: 'normal',
        max_emails_per_week: 5,
        digest_day: 'monday',
        digest_time: '08:00:00',
        unsubscribed_all: false,
        emails_sent_this_week: 0,
      });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching email preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get user from auth token
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();

    const {
      onboarding_emails,
      engagement_emails,
      educational_emails,
      marketing_emails,
      milestone_emails,
      digest_emails,
      frequency,
      max_emails_per_week,
      digest_day,
      unsubscribed_all,
    } = body;

    // Update preferences
    await sql`
      UPDATE email_preferences
      SET
        onboarding_emails = ${onboarding_emails},
        engagement_emails = ${engagement_emails},
        educational_emails = ${educational_emails},
        marketing_emails = ${marketing_emails},
        milestone_emails = ${milestone_emails},
        digest_emails = ${digest_emails},
        frequency = ${frequency},
        max_emails_per_week = ${max_emails_per_week},
        digest_day = ${digest_day},
        unsubscribed_all = ${unsubscribed_all},
        unsubscribed_at = CASE
          WHEN ${unsubscribed_all} AND unsubscribed_all = false THEN NOW()
          WHEN NOT ${unsubscribed_all} THEN NULL
          ELSE unsubscribed_at
        END,
        updated_at = NOW()
      WHERE user_id = ${user.id}
    `;

    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully',
    });
  } catch (error) {
    console.error('Error updating email preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}
