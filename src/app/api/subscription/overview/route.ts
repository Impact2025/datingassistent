import { NextRequest, NextResponse } from 'next/server';
import { getUserSubscription, getFeatureLimits } from '@/lib/subscription';
import { getUsageStats } from '@/lib/usage-tracking';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const userIdParam = req.nextUrl.searchParams.get('userId');
  const userId = userIdParam ? Number(userIdParam) : NaN;

  if (!userIdParam || Number.isNaN(userId)) {
    return NextResponse.json({ error: 'Invalid userId supplied' }, { status: 400 });
  }

  try {
    const [subscription, features, usage] = await Promise.all([
      getUserSubscription(userId),
      getFeatureLimits(userId),
      getUsageStats(userId),
    ]);

    return NextResponse.json({
      subscription,
      features,
      usage,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error while loading subscription overview';

    if (message.includes('missing_connection_string')) {
      console.warn('⚠️ Subscription overview requested without database connection string set.');
      return NextResponse.json({
        subscription: null,
        features: null,
        usage: null,
        warning: 'missing_connection_string',
      });
    }

    console.error('❌ Failed to load subscription overview:', error);
    return NextResponse.json({ error: 'Failed to load subscription data' }, { status: 500 });
  }
}
