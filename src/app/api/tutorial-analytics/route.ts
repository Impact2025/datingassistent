import { NextRequest, NextResponse } from 'next/server';

// POST: Track tutorial events
export async function POST(request: NextRequest) {
  try {
    const event = await request.json();

    // In a real implementation, this would save to database
    console.log('📊 Tutorial Event Tracked:', {
      eventType: event.eventType,
      tutorialId: event.tutorialId,
      userId: event.userId,
      timestamp: event.timestamp,
      metadata: event.metadata
    });

    // For now, just return success
    return NextResponse.json({
      success: true,
      eventId: `event_${Date.now()}`
    });

  } catch (error: any) {
    console.error('Error tracking tutorial event:', error);
    return NextResponse.json({
      error: 'Failed to track event',
      message: error.message
    }, { status: 500 });
  }
}

// GET: Get tutorial metrics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tutorialId = searchParams.get('tutorialId');
    const userId = searchParams.get('userId');

    if (tutorialId) {
      // Return mock metrics for the tutorial
      const mockMetrics = {
        tutorialId,
        completionRate: 0.85,
        averageTime: 180, // seconds
        dropOffPoints: [2, 5], // step indices where users drop off
        userSatisfaction: 4.5,
        totalStarts: 150,
        totalCompletions: 128,
        averageCompletionTime: 165
      };

      return NextResponse.json(mockMetrics);
    }

    if (userId) {
      // Return user's tutorial history
      const mockHistory = [
        {
          tutorialId: 'emotional-readiness-intro',
          startedAt: new Date(Date.now() - 86400000), // 1 day ago
          completedAt: new Date(Date.now() - 82800000), // 23 hours ago
          timeSpent: 180,
          completed: true
        }
      ];

      return NextResponse.json(mockHistory);
    }

    return NextResponse.json({ error: 'Missing tutorialId or userId' }, { status: 400 });

  } catch (error: any) {
    console.error('Error fetching tutorial analytics:', error);
    return NextResponse.json({
      error: 'Failed to fetch analytics',
      message: error.message
    }, { status: 500 });
  }
}