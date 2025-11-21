import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { AdvancedAnalyticsService } from '@/lib/advanced-analytics-service';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

async function getCoachIdFromToken(request: NextRequest): Promise<number | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (payload.userId) {
      return payload.userId as number;
    }

    return null;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const coachId = await getCoachIdFromToken(request);
    if (!coachId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (clientId) {
      // Generate analytics for specific client
      const clientAnalytics = await AdvancedAnalyticsService.generateClientAnalytics(parseInt(clientId));
      return NextResponse.json(clientAnalytics);
    } else {
      // Generate coach overview analytics
      const coachAnalytics = await AdvancedAnalyticsService.generateCoachAnalyticsReport(coachId);
      return NextResponse.json(coachAnalytics);
    }
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const coachId = await getCoachIdFromToken(request);
    if (!coachId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, clientId } = body;

    switch (action) {
      case 'generate-client-analytics':
        if (!clientId) {
          return NextResponse.json({ error: 'Client ID required' }, { status: 400 });
        }
        const clientAnalytics = await AdvancedAnalyticsService.generateClientAnalytics(clientId);
        return NextResponse.json({
          success: true,
          analytics: clientAnalytics
        });

      case 'generate-coach-report':
        const coachReport = await AdvancedAnalyticsService.generateCoachAnalyticsReport(coachId);
        return NextResponse.json({
          success: true,
          report: coachReport
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Available: generate-client-analytics, generate-coach-report' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing analytics request:', error);
    return NextResponse.json(
      { error: 'Failed to process analytics request' },
      { status: 500 }
    );
  }
}