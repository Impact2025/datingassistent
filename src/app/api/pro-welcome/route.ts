import { NextRequest, NextResponse } from 'next/server';
import { AIContextManager } from '@/lib/ai-context-manager';
import { verifyToken } from '@/lib/auth';
import { trackFeatureUsage } from '@/lib/neon-usage-tracking';

export async function POST(request: NextRequest) {
  try {
    // Get user from authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { writingStyle, datingApps, genderPreference, reminderPreference } = await request.json();

    // Validate required fields
    if (!writingStyle || !datingApps || !genderPreference || !reminderPreference) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate writing style
    const validWritingStyles = ['informeel_speels', 'warm_empathisch', 'zelfverzekerd_direct', 'rustig_duidelijk', 'neutraal'];
    if (!validWritingStyles.includes(writingStyle)) {
      return NextResponse.json(
        { error: 'Invalid writing style' },
        { status: 400 }
      );
    }

    // Validate gender preference
    const validGenderPreferences = ['mannen', 'vrouwen', 'iedereen'];
    if (!validGenderPreferences.includes(genderPreference)) {
      return NextResponse.json(
        { error: 'Invalid gender preference' },
        { status: 400 }
      );
    }

    // Validate reminder preference
    const validReminderPreferences = ['ja_graag', 'nee', 'later_beslissen'];
    if (!validReminderPreferences.includes(reminderPreference)) {
      return NextResponse.json(
        { error: 'Invalid reminder preference' },
        { status: 400 }
      );
    }

    // Validate dating apps
    if (!Array.isArray(datingApps) || datingApps.length === 0) {
      return NextResponse.json(
        { error: 'At least one dating app must be selected' },
        { status: 400 }
      );
    }

    const validDatingApps = ['tinder', 'bumble', 'hinge', 'inner_circle', 'lexa', 'andere'];
    const invalidApps = datingApps.filter(app => !validDatingApps.includes(app));
    if (invalidApps.length > 0) {
      return NextResponse.json(
        { error: 'Invalid dating apps selected' },
        { status: 400 }
      );
    }

    // Save to AI context
    await AIContextManager.saveUserContext(user.id, {
      writingStyle,
      datingApps,
      genderPreference,
      reminderPreference,
      proWelcomeCompleted: true,
      proWelcomeCompletedAt: new Date()
    });

    console.log(`✅ Pro welcome data saved for user ${user.id}`);

    return NextResponse.json({
      success: true,
      message: 'Pro welcome data saved successfully'
    });

  } catch (error: any) {
    console.error('❌ Error saving pro welcome data:', error);
    return NextResponse.json(
      {
        error: 'Failed to save pro welcome data',
        message: error.message
      },
      { status: 500 }
    );
  }
}