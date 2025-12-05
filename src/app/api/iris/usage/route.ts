// ============================================================================
// API ROUTE: GET /api/iris/usage
//
// Get current Iris chat usage status for the logged-in user
// Returns tier info, current usage, limits, and reset time
// ============================================================================

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { checkIrisLimit } from '@/lib/neon-usage-tracking';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Niet ingelogd' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);

    // Get usage status
    const usageStatus = await checkIrisLimit(userId);

    return NextResponse.json({
      success: true,
      ...usageStatus,
    });
  } catch (error) {
    console.error('Error getting Iris usage:', error);
    return NextResponse.json(
      { error: 'Kon usage niet ophalen' },
      { status: 500 }
    );
  }
}
