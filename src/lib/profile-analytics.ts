/**
 * Advanced Profile Analytics Service
 * Professional tracking and analysis for AI Profile Builder
 */

import { sql } from '@vercel/postgres';

export interface ProfileAnalyticsEvent {
  userId: string;
  sessionId: string;
  eventType: 'quiz_start' | 'quiz_complete' | 'profile_generated' | 'profile_selected' | 'profile_copied' | 'profile_shared';
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface ProfileQualityMetrics {
  length: number;
  readabilityScore: number;
  uniquenessScore: number;
  engagementPotential: number;
  culturalRelevance: number;
  overallScore: number;
}

export interface UserJourneyMetrics {
  totalSessions: number;
  averageCompletionTime: number;
  dropOffPoints: Record<string, number>;
  conversionFunnel: {
    started: number;
    completed_quiz: number;
    generated_profiles: number;
    selected_profile: number;
    copied_profile: number;
  };
}

class ProfileAnalyticsService {
  /**
   * Track profile-related events
   */
  async trackEvent(event: ProfileAnalyticsEvent) {
    try {
      await sql`
        INSERT INTO profile_analytics_events (
          user_id, session_id, event_type, metadata, created_at
        ) VALUES (
          ${event.userId}, ${event.sessionId}, ${event.eventType},
          ${JSON.stringify(event.metadata || {})}, ${event.timestamp.toISOString()}
        )
      `;
    } catch (error) {
      console.error('Failed to track profile analytics event:', error);
    }
  }

  /**
   * Calculate profile quality metrics
   */
  calculateProfileQuality(profileText: string): ProfileQualityMetrics {
    const words = profileText.split(/\s+/).filter(word => word.length > 0);
    const sentences = profileText.split(/[.!?]+/).filter(s => s.trim().length > 0);

    // Length score (optimal: 80-150 words for Tinder)
    const lengthScore = Math.max(0, Math.min(100,
      100 - Math.abs(words.length - 120) * 2
    ));

    // Readability score (average words per sentence)
    const avgWordsPerSentence = words.length / Math.max(1, sentences.length);
    const readabilityScore = Math.max(0, Math.min(100,
      100 - Math.abs(avgWordsPerSentence - 12) * 5
    ));

    // Uniqueness score (placeholder - would need comparison database)
    const uniquenessScore = 85; // Mock for now

    // Engagement potential (based on question marks, emojis, personality words)
    const questionCount = (profileText.match(/\?/g) || []).length;
    const emojiCount = (profileText.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu) || []).length;
    const personalityWords = ['ik', 'mijn', 'hou', 'ben', 'vind', 'doe'].filter(word =>
      profileText.toLowerCase().includes(word)
    ).length;

    const engagementScore = Math.min(100,
      (questionCount * 10) + (emojiCount * 5) + (personalityWords * 8)
    );

    // Cultural relevance (Dutch dating culture indicators)
    const dutchIndicators = ['gezellig', 'lekker', 'lekkerbek', 'borrel', 'uitgaan', 'feestje', 'vakantie']
      .filter(word => profileText.toLowerCase().includes(word)).length;
    const culturalScore = Math.min(100, dutchIndicators * 15 + 40);

    // Overall weighted score
    const overallScore = Math.round(
      (lengthScore * 0.2) +
      (readabilityScore * 0.15) +
      (uniquenessScore * 0.15) +
      (engagementScore * 0.3) +
      (culturalScore * 0.2)
    );

    return {
      length: words.length,
      readabilityScore: Math.round(readabilityScore),
      uniquenessScore,
      engagementPotential: engagementScore,
      culturalRelevance: culturalScore,
      overallScore
    };
  }

  /**
   * Get user journey metrics
   */
  async getUserJourneyMetrics(userId: string): Promise<UserJourneyMetrics> {
    try {
      const events = await sql`
        SELECT event_type, COUNT(*) as count
        FROM profile_analytics_events
        WHERE user_id = ${userId}
        GROUP BY event_type
      `;

      const eventCounts = events.rows.reduce((acc, row) => {
        acc[row.event_type] = parseInt(row.count);
        return acc;
      }, {} as Record<string, number>);

      // Calculate completion times
      const completionTimes = await sql`
        SELECT
          session_id,
          EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) as duration_seconds
        FROM profile_analytics_events
        WHERE user_id = ${userId} AND event_type IN ('quiz_start', 'profile_generated')
        GROUP BY session_id
        HAVING COUNT(*) >= 2
      `;

      const avgCompletionTime = completionTimes.rows.length > 0
        ? completionTimes.rows.reduce((sum, row) => sum + parseFloat(row.duration_seconds), 0) / completionTimes.rows.length
        : 0;

      // Calculate drop-off points
      const dropOffData = await sql`
        SELECT
          CASE
            WHEN event_type = 'quiz_start' THEN 'started'
            WHEN event_type = 'quiz_complete' THEN 'quiz_completed'
            WHEN event_type = 'profile_generated' THEN 'profiles_generated'
            WHEN event_type = 'profile_selected' THEN 'profile_selected'
            WHEN event_type = 'profile_copied' THEN 'profile_copied'
          END as stage,
          COUNT(*) as count
        FROM profile_analytics_events
        WHERE user_id = ${userId}
        GROUP BY stage
      `;

      const dropOffPoints = dropOffData.rows.reduce((acc, row) => {
        acc[row.stage] = parseInt(row.count);
        return acc;
      }, {} as Record<string, number>);

      return {
        totalSessions: eventCounts.quiz_start || 0,
        averageCompletionTime: Math.round(avgCompletionTime),
        dropOffPoints,
        conversionFunnel: {
          started: eventCounts.quiz_start || 0,
          completed_quiz: eventCounts.quiz_complete || 0,
          generated_profiles: eventCounts.profile_generated || 0,
          selected_profile: eventCounts.profile_selected || 0,
          copied_profile: eventCounts.profile_copied || 0
        }
      };
    } catch (error) {
      console.error('Failed to get user journey metrics:', error);
      return {
        totalSessions: 0,
        averageCompletionTime: 0,
        dropOffPoints: {},
        conversionFunnel: {
          started: 0,
          completed_quiz: 0,
          generated_profiles: 0,
          selected_profile: 0,
          copied_profile: 0
        }
      };
    }
  }

  /**
   * Get aggregate analytics for admin dashboard
   */
  async getAggregateAnalytics(days: number = 30): Promise<{
    totalUsers: number;
    totalSessions: number;
    averageCompletionRate: number;
    averageCopyRate: number;
    topPerformingProfiles: Array<{
      profileType: string;
      copyRate: number;
      sampleCount: number;
    }>;
  }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      // Total users and sessions
      const userStats = await sql`
        SELECT
          COUNT(DISTINCT user_id) as total_users,
          COUNT(DISTINCT session_id) as total_sessions
        FROM profile_analytics_events
        WHERE created_at >= ${cutoffDate.toISOString()}
      `;

      // Completion and copy rates
      const conversionStats = await sql`
        SELECT
          AVG(CASE WHEN completed_quiz > 0 THEN 1 ELSE 0 END) as completion_rate,
          AVG(CASE WHEN copied_profile > 0 THEN 1 ELSE 0 END) as copy_rate
        FROM (
          SELECT
            session_id,
            MAX(CASE WHEN event_type = 'quiz_complete' THEN 1 ELSE 0 END) as completed_quiz,
            MAX(CASE WHEN event_type = 'profile_copied' THEN 1 ELSE 0 END) as copied_profile
          FROM profile_analytics_events
          WHERE created_at >= ${cutoffDate.toISOString()}
          GROUP BY session_id
        ) as session_stats
      `;

      // Top performing profile types (mock data for now)
      const topProfiles = [
        { profileType: 'luchtig', copyRate: 68, sampleCount: 245 },
        { profileType: 'serieus', copyRate: 72, sampleCount: 198 },
        { profileType: 'mysterieus', copyRate: 65, sampleCount: 167 }
      ];

      return {
        totalUsers: parseInt(userStats.rows[0].total_users),
        totalSessions: parseInt(userStats.rows[0].total_sessions),
        averageCompletionRate: Math.round((parseFloat(conversionStats.rows[0].completion_rate) || 0) * 100),
        averageCopyRate: Math.round((parseFloat(conversionStats.rows[0].copy_rate) || 0) * 100),
        topPerformingProfiles: topProfiles
      };
    } catch (error) {
      console.error('Failed to get aggregate analytics:', error);
      return {
        totalUsers: 0,
        totalSessions: 0,
        averageCompletionRate: 0,
        averageCopyRate: 0,
        topPerformingProfiles: []
      };
    }
  }

  /**
   * Export analytics data for external analysis
   */
  async exportAnalyticsData(startDate: Date, endDate: Date): Promise<any[]> {
    try {
      const events = await sql`
        SELECT * FROM profile_analytics_events
        WHERE created_at BETWEEN ${startDate.toISOString()} AND ${endDate.toISOString()}
        ORDER BY created_at DESC
      `;

      return events.rows.map(row => ({
        ...row,
        metadata: JSON.parse(row.metadata || '{}')
      }));
    } catch (error) {
      console.error('Failed to export analytics data:', error);
      return [];
    }
  }
}

// Singleton instance
export const profileAnalytics = new ProfileAnalyticsService();

// React hooks for analytics
export function useProfileAnalytics() {
  const trackEvent = async (event: Omit<ProfileAnalyticsEvent, 'timestamp'>) => {
    try {
      const token = localStorage.getItem('datespark_auth_token');
      await fetch('/api/profile-analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId: event.sessionId,
          eventType: event.eventType,
          metadata: event.metadata
        })
      });
    } catch (error) {
      console.error('Failed to track analytics event:', error);
      // Non-blocking error - continue even if tracking fails
    }
  };

  const calculateQuality = (profileText: string) =>
    profileAnalytics.calculateProfileQuality(profileText);

  const getJourneyMetrics = (userId: string) =>
    profileAnalytics.getUserJourneyMetrics(userId);

  return { trackEvent, calculateQuality, getJourneyMetrics };
}