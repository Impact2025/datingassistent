/**
 * Admin A/B Tests API
 * Manage email A/B tests
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminSession } from '@/lib/admin-auth';
import {
  createABTest,
  getAllABTests,
  getABTestResults,
  activateABTest,
  pauseABTest,
  completeABTest,
  ABTestVariant
} from '@/lib/email-ab-testing';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify admin session
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await verifyAdminSession(sessionToken);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get test ID from query params (if specific test requested)
    const { searchParams } = new URL(request.url);
    const testId = searchParams.get('id');

    if (testId) {
      // Get specific test results
      const results = await getABTestResults(testId);
      return NextResponse.json({ success: true, results });
    }

    // Get all tests
    const tests = await getAllABTests();
    return NextResponse.json({ success: true, tests });

  } catch (error) {
    console.error('A/B tests API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch A/B tests', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin session
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await verifyAdminSession(sessionToken);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'create': {
        const { name, description, emailType, variants, goalMetric, minimumSampleSize } = body;

        if (!name || !emailType || !variants || variants.length < 2) {
          return NextResponse.json(
            { error: 'Name, emailType, and at least 2 variants are required' },
            { status: 400 }
          );
        }

        // Validate variant weights sum to 100
        const totalWeight = variants.reduce((sum: number, v: ABTestVariant) => sum + v.weight, 0);
        if (totalWeight !== 100) {
          return NextResponse.json(
            { error: 'Variant weights must sum to 100' },
            { status: 400 }
          );
        }

        const testId = await createABTest(
          name,
          description || '',
          emailType,
          variants,
          goalMetric || 'open_rate',
          minimumSampleSize || 100
        );

        return NextResponse.json({ success: true, testId });
      }

      case 'activate': {
        const { testId } = body;
        if (!testId) {
          return NextResponse.json({ error: 'testId is required' }, { status: 400 });
        }
        await activateABTest(testId);
        return NextResponse.json({ success: true, message: 'Test activated' });
      }

      case 'pause': {
        const { testId } = body;
        if (!testId) {
          return NextResponse.json({ error: 'testId is required' }, { status: 400 });
        }
        await pauseABTest(testId);
        return NextResponse.json({ success: true, message: 'Test paused' });
      }

      case 'complete': {
        const { testId, winnerVariantId } = body;
        if (!testId || !winnerVariantId) {
          return NextResponse.json(
            { error: 'testId and winnerVariantId are required' },
            { status: 400 }
          );
        }
        await completeABTest(testId, winnerVariantId);
        return NextResponse.json({ success: true, message: 'Test completed' });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('A/B tests API error:', error);
    return NextResponse.json(
      { error: 'Failed to manage A/B test', details: String(error) },
      { status: 500 }
    );
  }
}
