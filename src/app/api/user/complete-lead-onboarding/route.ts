import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { notifyAdminNewLead } from '@/lib/admin-notifications';

export const dynamic = 'force-dynamic';

interface LeadIntakeData {
  lookingFor?: string;
  datingStatus?: string;
  mainObstacle?: string;
}

interface CompleteOnboardingRequest {
  userId: number;
  otoShown?: boolean;
  otoAccepted?: boolean;
  photoScore?: number;
  intakeData?: LeadIntakeData;
}

/**
 * Mark lead onboarding as completed
 * Called when user finishes the lead activation flow
 * Also sends admin notification with full lead details
 */
export async function POST(request: NextRequest) {
  try {
    const body: CompleteOnboardingRequest = await request.json();
    const { userId, otoShown, otoAccepted, photoScore, intakeData } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    console.log('✅ Completing lead onboarding for user:', userId, {
      otoShown,
      otoAccepted,
      photoScore,
      hasIntakeData: !!intakeData,
    });

    // Update user record
    await sql`
      UPDATE users
      SET lead_onboarding_completed = TRUE,
          lead_oto_shown = ${otoShown === true},
          updated_at = NOW()
      WHERE id = ${userId}
    `;

    console.log('✅ Lead onboarding marked as completed for user:', userId);

    // Fetch user data for admin notification
    const userResult = await sql`
      SELECT id, name, email, initial_photo_score
      FROM users
      WHERE id = ${userId}
    `;

    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];

      // Fetch intake data from user_profiles if not provided
      let finalIntakeData = intakeData;
      if (!finalIntakeData) {
        const profileResult = await sql`
          SELECT lead_intake
          FROM user_profiles
          WHERE user_id = ${userId}
        `;
        if (profileResult.rows.length > 0 && profileResult.rows[0].lead_intake) {
          finalIntakeData = profileResult.rows[0].lead_intake;
        }
      }

      // Send admin notification with full lead details (non-blocking)
      notifyAdminNewLead({
        userId: user.id,
        name: user.name || 'Onbekend',
        email: user.email,
        registrationSource: 'lead_wizard',
        photoScore: photoScore ?? user.initial_photo_score ?? null,
        intakeData: finalIntakeData ?? null,
        otoShown: otoShown ?? false,
        otoAccepted: otoAccepted ?? false,
      }).catch(err => console.error('Failed to notify admin:', err));
    }

    return NextResponse.json({
      success: true,
      message: 'Lead onboarding completed',
      adminNotified: true,
    });

  } catch (error) {
    console.error('❌ Failed to complete lead onboarding:', error);
    return NextResponse.json(
      { error: 'Failed to complete lead onboarding' },
      { status: 500 }
    );
  }
}
