import { NextRequest, NextResponse } from 'next/server';
import { CoachingProfileService } from '@/lib/coaching-profile-service';
import { trackUserActivity } from '@/lib/progress-tracker';

export async function POST(request: NextRequest) {
  try {
    const { userId, toolName, metadata } = await request.json();

    if (!userId || !toolName) {
      return NextResponse.json(
        { error: 'userId and toolName are required' },
        { status: 400 }
      );
    }

    console.log(`📊 Tracking tool usage for user ${userId}: ${toolName}`);

    // Track tool usage in coaching profile
    const success = await CoachingProfileService.trackToolUsage(userId, toolName);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to track tool usage' },
        { status: 500 }
      );
    }

    // Track activity for progress system
    try {
      await trackUserActivity(userId, {
        type: `tool_used_${toolName.replace(/-/g, '_')}`,
        data: metadata || {},
        points: getPointsForTool(toolName)
      });
    } catch (error) {
      console.error('Failed to track activity:', error);
      // Non-blocking error - continue even if tracking fails
    }

    // Check if this is the first tool use
    try {
      const profile = await CoachingProfileService.getProfile(userId);
      if (profile && Object.keys(profile.toolsUsed).length === 1) {
        // This is the first tool use, mark the step as completed
        await CoachingProfileService.completeStep(userId, 'first_tool_use');
      }
    } catch (error) {
      console.error('Failed to check first tool use:', error);
      // Non-blocking error - continue even if this fails
    }

    return NextResponse.json({
      success: true,
      message: `Tool usage of ${toolName} tracked successfully`
    });

  } catch (error) {
    console.error('Error tracking tool usage:', error);
    return NextResponse.json(
      { error: 'Failed to track tool usage' },
      { status: 500 }
    );
  }
}

// Helper function to determine points for different tools
function getPointsForTool(toolName: string): number {
  const pointsMap: Record<string, number> = {
    'profiel-coach': 10,
    'foto-advies': 8,
    'gesprek-starter': 7,
    'chat-coach': 8,
    'dateplanner': 6,
    'skills-assessment': 15,
    'online-cursus': 12
  };

  return pointsMap[toolName] || 5; // Default 5 points for other tools
}