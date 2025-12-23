/**
 * OTO (One-Time-Offer) Analytics Service
 *
 * Tracks OTO funnel performance:
 * - OTO shown vs accepted/declined
 * - Transformatie vs Kickstart conversion rates
 * - Revenue per OTO
 * - Downsell effectiveness
 */

import { sql } from '@vercel/postgres';

export interface OTOEvent {
  userId: number;
  eventType: 'oto_shown' | 'oto_accepted' | 'oto_declined' | 'downsell_shown' | 'downsell_accepted' | 'downsell_declined';
  otoProduct: 'transformatie' | 'kickstart' | null;
  photoScore?: number;
  sessionId?: string;
  source?: string;
}

export interface OTOStats {
  period: string;
  otoShown: number;
  transformatieAccepted: number;
  transformatieDeclined: number;
  kickstartAccepted: number;
  kickstartDeclined: number;
  noConversion: number;
  transformatieRevenue: number;
  kickstartRevenue: number;
  totalRevenue: number;
  transformatieConversionRate: number;
  kickstartConversionRate: number;
  overallConversionRate: number;
  averagePhotoScore: number;
}

/**
 * Track an OTO funnel event
 */
export async function trackOTOEvent(event: OTOEvent): Promise<void> {
  try {
    await sql`
      INSERT INTO oto_analytics (
        user_id,
        event_type,
        oto_product,
        photo_score,
        session_id,
        source,
        created_at
      )
      VALUES (
        ${event.userId},
        ${event.eventType},
        ${event.otoProduct},
        ${event.photoScore || null},
        ${event.sessionId || null},
        ${event.source || 'direct'},
        NOW()
      )
    `;

    console.log(`📊 OTO Event tracked: ${event.eventType} for user ${event.userId}`);
  } catch (error) {
    console.error('Failed to track OTO event:', error);
    // Don't throw - analytics should not break the flow
  }
}

/**
 * Get OTO stats for admin dashboard
 */
export async function getOTOStats(days: number = 30): Promise<OTOStats> {
  try {
    const result = await sql`
      WITH oto_events AS (
        SELECT
          user_id,
          event_type,
          oto_product,
          photo_score,
          created_at
        FROM oto_analytics
        WHERE created_at >= NOW() - INTERVAL '${days} days'
      ),
      aggregated AS (
        SELECT
          COUNT(DISTINCT CASE WHEN event_type = 'oto_shown' THEN user_id END) as oto_shown,
          COUNT(DISTINCT CASE WHEN event_type = 'oto_accepted' AND oto_product = 'transformatie' THEN user_id END) as transformatie_accepted,
          COUNT(DISTINCT CASE WHEN event_type = 'oto_declined' AND oto_product = 'transformatie' THEN user_id END) as transformatie_declined,
          COUNT(DISTINCT CASE WHEN event_type IN ('oto_accepted', 'downsell_accepted') AND oto_product = 'kickstart' THEN user_id END) as kickstart_accepted,
          COUNT(DISTINCT CASE WHEN event_type = 'downsell_declined' THEN user_id END) as no_conversion,
          AVG(photo_score) FILTER (WHERE event_type = 'oto_shown') as avg_photo_score
        FROM oto_events
      )
      SELECT * FROM aggregated
    `;

    const stats = result.rows[0] || {};

    // Calculate revenue (Transformatie = €147, Kickstart = €47)
    const transformatieRevenue = (stats.transformatie_accepted || 0) * 147;
    const kickstartRevenue = (stats.kickstart_accepted || 0) * 47;

    const otoShown = stats.oto_shown || 1; // Prevent division by zero

    return {
      period: `Last ${days} days`,
      otoShown: stats.oto_shown || 0,
      transformatieAccepted: stats.transformatie_accepted || 0,
      transformatieDeclined: stats.transformatie_declined || 0,
      kickstartAccepted: stats.kickstart_accepted || 0,
      kickstartDeclined: stats.no_conversion || 0,
      noConversion: stats.no_conversion || 0,
      transformatieRevenue,
      kickstartRevenue,
      totalRevenue: transformatieRevenue + kickstartRevenue,
      transformatieConversionRate: Math.round(((stats.transformatie_accepted || 0) / otoShown) * 100),
      kickstartConversionRate: Math.round(((stats.kickstart_accepted || 0) / otoShown) * 100),
      overallConversionRate: Math.round((((stats.transformatie_accepted || 0) + (stats.kickstart_accepted || 0)) / otoShown) * 100),
      averagePhotoScore: parseFloat((stats.avg_photo_score || 0).toFixed(1)),
    };
  } catch (error) {
    console.error('Failed to get OTO stats:', error);
    return {
      period: `Last ${days} days`,
      otoShown: 0,
      transformatieAccepted: 0,
      transformatieDeclined: 0,
      kickstartAccepted: 0,
      kickstartDeclined: 0,
      noConversion: 0,
      transformatieRevenue: 0,
      kickstartRevenue: 0,
      totalRevenue: 0,
      transformatieConversionRate: 0,
      kickstartConversionRate: 0,
      overallConversionRate: 0,
      averagePhotoScore: 0,
    };
  }
}

/**
 * Get conversion funnel data for visualization
 */
export async function getOTOFunnel(days: number = 30): Promise<{
  steps: Array<{ name: string; count: number; percentage: number }>;
}> {
  try {
    const result = await sql`
      SELECT
        COUNT(DISTINCT CASE WHEN event_type = 'oto_shown' THEN user_id END) as step1_oto_shown,
        COUNT(DISTINCT CASE WHEN event_type = 'oto_accepted' AND oto_product = 'transformatie' THEN user_id END) as step2_transformatie,
        COUNT(DISTINCT CASE WHEN event_type = 'downsell_shown' THEN user_id END) as step3_downsell_shown,
        COUNT(DISTINCT CASE WHEN event_type = 'downsell_accepted' AND oto_product = 'kickstart' THEN user_id END) as step4_kickstart
      FROM oto_analytics
      WHERE created_at >= NOW() - INTERVAL '${days} days'
    `;

    const data = result.rows[0] || {};
    const otoShown = data.step1_oto_shown || 1;

    return {
      steps: [
        {
          name: 'OTO Shown',
          count: data.step1_oto_shown || 0,
          percentage: 100,
        },
        {
          name: 'Transformatie Accepted',
          count: data.step2_transformatie || 0,
          percentage: Math.round(((data.step2_transformatie || 0) / otoShown) * 100),
        },
        {
          name: 'Downsell Shown',
          count: data.step3_downsell_shown || 0,
          percentage: Math.round(((data.step3_downsell_shown || 0) / otoShown) * 100),
        },
        {
          name: 'Kickstart Accepted',
          count: data.step4_kickstart || 0,
          percentage: Math.round(((data.step4_kickstart || 0) / otoShown) * 100),
        },
      ],
    };
  } catch (error) {
    console.error('Failed to get OTO funnel:', error);
    return { steps: [] };
  }
}

/**
 * Get daily OTO stats for charts
 */
export async function getDailyOTOStats(days: number = 30): Promise<Array<{
  date: string;
  otoShown: number;
  conversions: number;
  revenue: number;
}>> {
  try {
    const result = await sql`
      SELECT
        DATE(created_at) as date,
        COUNT(DISTINCT CASE WHEN event_type = 'oto_shown' THEN user_id END) as oto_shown,
        COUNT(DISTINCT CASE WHEN event_type IN ('oto_accepted', 'downsell_accepted') THEN user_id END) as conversions,
        (COUNT(DISTINCT CASE WHEN event_type = 'oto_accepted' AND oto_product = 'transformatie' THEN user_id END) * 147) +
        (COUNT(DISTINCT CASE WHEN event_type IN ('oto_accepted', 'downsell_accepted') AND oto_product = 'kickstart' THEN user_id END) * 47) as revenue
      FROM oto_analytics
      WHERE created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;

    return result.rows.map(row => ({
      date: row.date.toISOString().split('T')[0],
      otoShown: parseInt(row.oto_shown) || 0,
      conversions: parseInt(row.conversions) || 0,
      revenue: parseInt(row.revenue) || 0,
    }));
  } catch (error) {
    console.error('Failed to get daily OTO stats:', error);
    return [];
  }
}
