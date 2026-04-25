// ============================================================================
// API ROUTE: GET /api/iris/usage
//
// Get current Iris chat usage status for the logged-in user
// Returns tier info, current usage, limits, and reset time
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { checkIrisLimit } from '@/lib/neon-usage-tracking';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await requireAuth(request);
    const userId = user.id;

    // Get usage status
    const usageStatus = await checkIrisLimit(userId);

    return NextResponse.json({
      success: true,
      ...usageStatus,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }
    console.error('Error getting Iris usage:', error);
    return NextResponse.json(
      { error: 'Kon usage niet ophalen' },
      { status: 500 }
    );
  }
}
