/**
 * Engagement Metrics Tracking System
 * Sprint 5.4: Track user interactions and engagement patterns
 *
 * Features:
 * - Event tracking (clicks, views, interactions)
 * - Session analytics
 * - Feature usage tracking
 * - Engagement scoring
 * - Retention signals
 */

import { sql } from '@vercel/postgres';

export type EngagementEventType =
  | 'page_view'
  | 'lesson_start'
  | 'lesson_complete'
  | 'video_play'
  | 'video_pause'
  | 'quiz_start'
  | 'quiz_submit'
  | 'feature_click'
  | 'navigation'
  | 'search'
  | 'chat_message'
  | 'tool_use'
  | 'assessment_start'
  | 'assessment_complete';

export interface EngagementEvent {
  user_id: number;
  event_type: EngagementEventType;
  event_data?: {
    page?: string;
    lesson_id?: number;
    program_id?: number;
    feature_name?: string;
    duration_seconds?: number;
    score?: number;
    metadata?: Record<string, any>;
  };
  session_id: string;
  timestamp: Date;
}

export interface EngagementMetrics {
  total_events: number;
  unique_sessions: number;
  avg_session_duration_minutes: number;
  most_used_features: Array<{ feature: string; count: number }>;
  engagement_score: number; // 0-100
  retention_signals: {
    days_active_last_week: number;
    avg_daily_events: number;
    feature_diversity_score: number; // How many different features used
  };
}

export interface ContentEngagement {
  content_id: number;
  content_type: 'lesson' | 'program' | 'assessment';
  content_title: string;
  views: number;
  completions: number;
  avg_time_spent_seconds: number;
  engagement_rate: number; // completions / views * 100
  drop_off_rate: number; // (views - completions) / views * 100
}

/**
 * Track an engagement event
 */
export async function trackEngagementEvent(event: EngagementEvent): Promise<void> {
  try {
    await sql`
      INSERT INTO engagement_events (
        user_id,
        event_type,
        event_data,
        session_id,
        created_at
      ) VALUES (
        ${event.user_id},
        ${event.event_type},
        ${JSON.stringify(event.event_data || {})},
        ${event.session_id},
        NOW()
      )
    `;
  } catch (error) {
    console.error('Error tracking engagement event:', error);
    // Don't throw - tracking should never break the app
  }
}

/**
 * Get engagement metrics for a user
 */
export async function getUserEngagementMetrics(
  userId: number,
  days: number = 30
): Promise<EngagementMetrics> {
  try {
    // Total events
    const eventsResult = await sql`
      SELECT COUNT(*) as total_events
      FROM engagement_events
      WHERE user_id = ${userId}
        AND created_at >= NOW() - INTERVAL '${days} days'
    `;
    const totalEvents = parseInt(eventsResult.rows[0]?.total_events || '0');

    // Unique sessions
    const sessionsResult = await sql`
      SELECT COUNT(DISTINCT session_id) as unique_sessions
      FROM engagement_events
      WHERE user_id = ${userId}
        AND created_at >= NOW() - INTERVAL '${days} days'
    `;
    const uniqueSessions = parseInt(sessionsResult.rows[0]?.unique_sessions || '0');

    // Average session duration (estimated from first to last event in each session)
    const sessionDurationResult = await sql`
      SELECT
        AVG(duration_seconds) as avg_duration
      FROM (
        SELECT
          session_id,
          EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) as duration_seconds
        FROM engagement_events
        WHERE user_id = ${userId}
          AND created_at >= NOW() - INTERVAL '${days} days'
        GROUP BY session_id
        HAVING COUNT(*) > 1
      ) as session_durations
    `;
    const avgSessionDuration = parseFloat(sessionDurationResult.rows[0]?.avg_duration || '0') / 60;

    // Most used features (feature_click events)
    const featuresResult = await sql`
      SELECT
        event_data->>'feature_name' as feature,
        COUNT(*) as count
      FROM engagement_events
      WHERE user_id = ${userId}
        AND event_type = 'feature_click'
        AND created_at >= NOW() - INTERVAL '${days} days'
        AND event_data->>'feature_name' IS NOT NULL
      GROUP BY event_data->>'feature_name'
      ORDER BY count DESC
      LIMIT 5
    `;
    const mostUsedFeatures = featuresResult.rows.map(row => ({
      feature: row.feature,
      count: parseInt(row.count)
    }));

    // Days active in last week
    const daysActiveResult = await sql`
      SELECT COUNT(DISTINCT DATE(created_at)) as days_active
      FROM engagement_events
      WHERE user_id = ${userId}
        AND created_at >= NOW() - INTERVAL '7 days'
    `;
    const daysActiveLastWeek = parseInt(daysActiveResult.rows[0]?.days_active || '0');

    // Feature diversity (how many unique event types used)
    const diversityResult = await sql`
      SELECT COUNT(DISTINCT event_type) as unique_event_types
      FROM engagement_events
      WHERE user_id = ${userId}
        AND created_at >= NOW() - INTERVAL '${days} days'
    `;
    const uniqueEventTypes = parseInt(diversityResult.rows[0]?.unique_event_types || '0');
    const featureDiversityScore = Math.min((uniqueEventTypes / 10) * 100, 100); // Max 10 event types

    // Calculate engagement score (0-100)
    // Based on: activity level (40%), feature diversity (30%), session quality (30%)
    const activityScore = Math.min((totalEvents / days) * 10, 40); // Target: 1 event/day
    const diversityScore = (featureDiversityScore / 100) * 30;
    const sessionQualityScore = Math.min((avgSessionDuration / 15) * 30, 30); // Target: 15min avg
    const engagementScore = Math.round(activityScore + diversityScore + sessionQualityScore);

    return {
      total_events: totalEvents,
      unique_sessions: uniqueSessions,
      avg_session_duration_minutes: Math.round(avgSessionDuration),
      most_used_features: mostUsedFeatures,
      engagement_score: engagementScore,
      retention_signals: {
        days_active_last_week: daysActiveLastWeek,
        avg_daily_events: totalEvents / days,
        feature_diversity_score: Math.round(featureDiversityScore)
      }
    };
  } catch (error) {
    console.error('Error getting user engagement metrics:', error);
    return {
      total_events: 0,
      unique_sessions: 0,
      avg_session_duration_minutes: 0,
      most_used_features: [],
      engagement_score: 0,
      retention_signals: {
        days_active_last_week: 0,
        avg_daily_events: 0,
        feature_diversity_score: 0
      }
    };
  }
}

/**
 * Get content engagement analytics
 */
export async function getContentEngagement(
  contentType: 'lesson' | 'program' | 'assessment',
  limit: number = 10
): Promise<ContentEngagement[]> {
  try {
    if (contentType === 'lesson') {
      const result = await sql`
        SELECT
          l.id as content_id,
          'lesson' as content_type,
          l.title as content_title,
          COUNT(DISTINCT CASE WHEN ee.event_type = 'lesson_start' THEN ee.user_id END) as views,
          COUNT(DISTINCT CASE WHEN ee.event_type = 'lesson_complete' THEN ee.user_id END) as completions,
          COALESCE(AVG(
            CASE
              WHEN ee.event_type = 'lesson_complete'
              THEN (ee.event_data->>'duration_seconds')::integer
            END
          ), 0) as avg_time_spent_seconds
        FROM lessons l
        LEFT JOIN engagement_events ee ON
          ee.event_type IN ('lesson_start', 'lesson_complete')
          AND (ee.event_data->>'lesson_id')::integer = l.id
        WHERE l.is_published = true
        GROUP BY l.id, l.title
        HAVING COUNT(DISTINCT CASE WHEN ee.event_type = 'lesson_start' THEN ee.user_id END) > 0
        ORDER BY views DESC
        LIMIT ${limit}
      `;

      return result.rows.map(row => {
        const views = parseInt(row.views) || 1;
        const completions = parseInt(row.completions) || 0;
        return {
          content_id: parseInt(row.content_id),
          content_type: 'lesson',
          content_title: row.content_title,
          views,
          completions,
          avg_time_spent_seconds: Math.round(parseFloat(row.avg_time_spent_seconds)),
          engagement_rate: Math.round((completions / views) * 100),
          drop_off_rate: Math.round(((views - completions) / views) * 100)
        };
      });
    }

    return [];
  } catch (error) {
    console.error('Error getting content engagement:', error);
    return [];
  }
}

/**
 * Get recent user activity timeline
 */
export async function getUserActivityTimeline(
  userId: number,
  limit: number = 20
): Promise<Array<{
  event_type: string;
  description: string;
  timestamp: Date;
  metadata?: any;
}>> {
  try {
    const result = await sql`
      SELECT
        event_type,
        event_data,
        created_at
      FROM engagement_events
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    return result.rows.map(row => {
      const eventData = typeof row.event_data === 'string'
        ? JSON.parse(row.event_data)
        : row.event_data;

      let description = '';
      switch (row.event_type) {
        case 'lesson_complete':
          description = `Completed a lesson`;
          break;
        case 'quiz_submit':
          description = `Submitted a quiz (score: ${eventData?.score || 'N/A'})`;
          break;
        case 'feature_click':
          description = `Used feature: ${eventData?.feature_name || 'Unknown'}`;
          break;
        case 'page_view':
          description = `Viewed page: ${eventData?.page || 'Unknown'}`;
          break;
        default:
          description = row.event_type.replace(/_/g, ' ');
      }

      return {
        event_type: row.event_type,
        description,
        timestamp: new Date(row.created_at),
        metadata: eventData
      };
    });
  } catch (error) {
    console.error('Error getting user activity timeline:', error);
    return [];
  }
}

/**
 * Initialize engagement tracking table (migration helper)
 */
export async function initEngagementTable(): Promise<void> {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS engagement_events (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        event_type VARCHAR(50) NOT NULL,
        event_data JSONB DEFAULT '{}',
        session_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        INDEX idx_user_events (user_id, created_at),
        INDEX idx_session (session_id),
        INDEX idx_event_type (event_type)
      )
    `;
    console.log('Engagement events table initialized');
  } catch (error) {
    console.error('Error initializing engagement table:', error);
  }
}
