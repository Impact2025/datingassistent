/**
 * API: OTO Analytics for Admin Dashboard
 *
 * GET /api/admin/oto-analytics - Get OTO funnel stats
 * POST /api/admin/oto-analytics - Track OTO event (internal use)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getOTOStats, getOTOFunnel, getDailyOTOStats, trackOTOEvent } from '@/lib/oto-analytics';

export const dynamic = 'force-dynamic';

// GET: Fetch OTO analytics stats
export async function GET(request: NextRequest) {
  try {
    // Check admin auth
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const type = searchParams.get('type') || 'stats';

    let data;

    switch (type) {
      case 'funnel':
        data = await getOTOFunnel(days);
        break;
      case 'daily':
        data = await getDailyOTOStats(days);
        break;
      case 'stats':
      default:
        data = await getOTOStats(days);
        break;
    }

    return NextResponse.json({
      success: true,
      type,
      days,
      data,
    });
  } catch (error) {
    console.error('OTO Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch OTO analytics' },
      { status: 500 }
    );
  }
}

// POST: Track OTO event (internal use)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { userId, eventType, otoProduct, photoScore, sessionId, source } = body;

    if (!userId || !eventType) {
      return NextResponse.json(
        { error: 'userId and eventType are required' },
        { status: 400 }
      );
    }

    await trackOTOEvent({
      userId,
      eventType,
      otoProduct: otoProduct || null,
      photoScore,
      sessionId,
      source,
    });

    return NextResponse.json({
      success: true,
      message: 'OTO event tracked',
    });
  } catch (error) {
    console.error('OTO Analytics POST error:', error);
    return NextResponse.json(
      { error: 'Failed to track OTO event' },
      { status: 500 }
    );
  }
}
