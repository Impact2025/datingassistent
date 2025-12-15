/**
 * WEB VITALS ANALYTICS ENDPOINT
 * Receives and logs Core Web Vitals metrics
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const metric = await req.json();
    
    // Log to console (or send to your analytics service)
    console.log('[Web Vitals]', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      navigationType: metric.navigationType,
    });

    // TODO: Send to your analytics service
    // await sendToAnalytics(metric);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Web Vitals logging error:', error);
    return NextResponse.json({ error: 'Failed to log metric' }, { status: 500 });
  }
}
