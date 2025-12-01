import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * POST /api/analytics/chat
 * Track chat widget analytics events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { event, timestamp, sessionId, userAgent, pageUrl, metadata } = body;

    // Validate required fields
    if (!event || !timestamp || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields: event, timestamp, sessionId' },
        { status: 400 }
      );
    }

    // Store analytics event in database (optional - gracefully fail if not configured)
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        const { error } = await supabase
          .from('chat_analytics')
          .insert({
            event_type: event,
            session_id: sessionId,
            timestamp: new Date(timestamp).toISOString(),
            user_agent: userAgent,
            page_url: pageUrl,
            metadata: metadata || {},
            created_at: new Date().toISOString()
          });

        if (error) {
          console.error('Failed to store analytics:', error);
          // Don't throw - analytics failure shouldn't affect UX
        }
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Silently fail - analytics is non-critical
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics error:', error);
    // Don't return error to client - analytics failure shouldn't affect UX
    return NextResponse.json({ success: true });
  }
}

/**
 * GET /api/analytics/chat
 * Retrieve analytics summary
 */
export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Analytics database not configured' },
        { status: 503 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '7');
    const eventType = searchParams.get('event');

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Build query
    let query = supabase
      .from('chat_analytics')
      .select('*')
      .gte('timestamp', startDate.toISOString())
      .lte('timestamp', endDate.toISOString())
      .order('timestamp', { ascending: false });

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch analytics:', error);
      return NextResponse.json(
        { error: 'Failed to fetch analytics' },
        { status: 500 }
      );
    }

    // Calculate metrics
    const shown = data?.filter(e => e.event_type === 'proactive_invite_shown').length || 0;
    const accepted = data?.filter(e => e.event_type === 'proactive_invite_accepted').length || 0;
    const dismissed = data?.filter(e => e.event_type === 'proactive_invite_dismissed').length || 0;
    const conversionRate = shown > 0 ? ((accepted / shown) * 100).toFixed(2) : '0.00';

    return NextResponse.json({
      summary: {
        shown,
        accepted,
        dismissed,
        conversionRate: parseFloat(conversionRate),
        totalEvents: data?.length || 0
      },
      events: data || [],
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        days
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
