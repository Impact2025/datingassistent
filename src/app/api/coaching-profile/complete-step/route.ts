import { NextRequest, NextResponse } from 'next/server';
import { CoachingProfileService } from '@/lib/coaching-profile-service';
import { trackUserActivity } from '@/lib/progress-tracker';

export async function POST(request: NextRequest) {
  try {
    const { userId, stepName, metadata } = await request.json();

    if (!userId || !stepName) {
      return NextResponse.json(
        { error: 'userId and stepName are required' },
        { status: 400 }
      );
    }

    console.log(`📊 Completing step for user ${userId}: ${stepName}`);

    // Mark step as completed in coaching profile
    const success = await CoachingProfileService.completeStep(userId, stepName);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to complete step' },
        { status: 500 }
      );
    }

    // Track activity for progress system
    try {
      await trackUserActivity(userId, {
        type: `step_completed_${stepName}`,
        data: metadata || {},
        points: getPointsForStep(stepName)
      });
    } catch (error) {
      console.error('Failed to track activity:', error);
      // Non-blocking error - continue even if tracking fails
    }

    // If this is the personality scan step, populate coaching profile from scan data
    if (stepName === 'personality_scan') {
      try {
        await CoachingProfileService.populateFromPersonalityScan(userId);
      } catch (error) {
        console.error('Failed to populate from personality scan:', error);
        // Non-blocking error - continue even if this fails
      }
    }

    return NextResponse.json({
      success: true,
      message: `Step ${stepName} completed successfully`
    });

  } catch (error) {
    console.error('Error completing step:', error);
    return NextResponse.json(
      { error: 'Failed to complete step' },
      { status: 500 }
    );
  }
}

// Helper function to determine points for different steps
function getPointsForStep(stepName: string): number {
  const pointsMap: Record<string, number> = {
    'personality_scan': 20,
    'coach_advice': 10,
    'profile_setup': 15,
    'first_tool_use': 10,
    'goal_setting': 15
  };

  return pointsMap[stepName] || 5; // Default 5 points for other steps
}
