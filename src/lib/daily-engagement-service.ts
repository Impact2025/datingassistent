/**
 * Daily Engagement Service - Automated personalized content delivery
 * Keeps users engaged with daily motivation, check-ins, and progress tracking
 */

import { sql } from '@vercel/postgres';
import { chatCompletion } from './ai-service';
import { createNotification } from './in-app-notification-service';
import { sendSMSToUser } from './sms-service';
import { sendTemplatedEmail } from './email-sender';

export interface DailyEngagement {
  userId: number;
  engagementType: 'morning_motivation' | 'evening_checkin' | 'progress_reminder' | 'success_celebration' | 'streak_milestone';
  content: string;
  scheduledFor: Date;
  deliveredAt?: Date;
  status: 'scheduled' | 'delivered' | 'failed';
  channel: 'email' | 'sms' | 'in_app' | 'push';
  metadata: Record<string, any>;
}

export interface UserEngagementStats {
  currentStreak: number;
  longestStreak: number;
  totalEngagements: number;
  lastEngagementDate: Date;
  preferredTimeOfDay: 'morning' | 'afternoon' | 'evening';
  engagementRate: number; // percentage of delivered content that gets engagement
}

export class DailyEngagementService {
  // Content templates for different engagement types
  private static readonly CONTENT_TEMPLATES = {
    morning_motivation: [
      "🌅 Goedemorgen! Vandaag is een nieuw begin. Wat is één kleine stap die je vandaag gaat zetten?",
      "☀️ Nieuwe dag, nieuwe kansen! Onthoud: consistentie verslaat perfectie.",
      "🌞 Goedemorgen kampioen! Jouw dating journey begint vandaag weer.",
      "🌅 Elke dag is een kans om beter te worden. Wat ga jij vandaag verbeteren?"
    ],
    evening_checkin: [
      "🌙 Hoe was je dag? Welke kleine winst heb je vandaag behaald?",
      "✨ Avond reflectie: Wat ging goed vandaag en wat leer je daarvan?",
      "🌆 Dag evaluatie: Hoe voelde je je vandaag in je dating journey?",
      "🌙 Bedtijd check-in: Wat neem je mee naar morgen?"
    ],
    progress_reminder: [
      "⏰ Tijd voor actie! Wat is je volgende stap vandaag?",
      "🎯 Je doelen wachten op je. Wat ga je vandaag doen?",
      "🚀 Momentum opbouwen begint met kleine stappen. Wat doe je nu?",
      "💪 Jouw toekomstige zelf rekent op je. Begin vandaag!"
    ],
    success_celebration: [
      "🎉 Gefeliciteerd! Je hebt weer een stap gezet - dat is geweldig!",
      "🏆 Success! Elke stap brengt je dichterbij je doel.",
      "⭐ Uitstekend werk! Blijf dit momentum vasthouden.",
      "🎊 Bravo! Je bent op de goede weg - ga zo door!"
    ],
    streak_milestone: [
      "🔥 {streak} dagen op rij actief! Je bent on fire!",
      "⚡ {streak} dagen consistentie! Dit is hoe kampioenen worden gemaakt.",
      "💎 {streak} dagen streak! Je commitment is inspirerend.",
      "🚀 {streak} dagen momentum! De resultaten komen eraan."
    ]
  };

  /**
   * Schedule daily engagements for a user
   */
  static async scheduleDailyEngagements(userId: number): Promise<void> {
    try {
      // Get user's timezone and preferences
      const userPrefs = await sql`
        SELECT timezone, quiet_hours_start, quiet_hours_end
        FROM client_communication_preferences
        WHERE client_id = ${userId}
      `;

      const timezone = userPrefs.rows[0]?.timezone || 'Europe/Amsterdam';
      const quietStart = userPrefs.rows[0]?.quiet_hours_start;
      const quietEnd = userPrefs.rows[0]?.quiet_hours_end;

      // Schedule morning motivation (9 AM user time)
      const morningTime = this.getUserTime(9, 0, timezone);
      await this.scheduleEngagement(userId, 'morning_motivation', morningTime, 'in_app');

      // Schedule evening check-in (8 PM user time, if not in quiet hours)
      const eveningTime = this.getUserTime(20, 0, timezone);
      if (!this.isInQuietHours(eveningTime, quietStart, quietEnd)) {
        await this.scheduleEngagement(userId, 'evening_checkin', eveningTime, 'in_app');
      }

      // Schedule progress reminder (2 PM user time)
      const afternoonTime = this.getUserTime(14, 0, timezone);
      await this.scheduleEngagement(userId, 'progress_reminder', afternoonTime, 'in_app');

    } catch (error) {
      console.error('Error scheduling daily engagements:', error);
    }
  }

  /**
   * Generate personalized content for engagement
   */
  static async generatePersonalizedContent(
    userId: number,
    engagementType: DailyEngagement['engagementType'],
    context?: Record<string, any>
  ): Promise<string> {
    try {
      // Get user personality data for personalization
      const personalityData = await sql`
        SELECT * FROM personality_scans WHERE user_id = ${userId}
      `;

      const scan = personalityData.rows[0];
      if (!scan) {
        // Fallback to generic content
        return this.getFallbackContent(engagementType, context);
      }

      // Generate AI personalized content
      const prompt = this.buildPersonalizationPrompt(engagementType, scan, context);
      const aiContent = await chatCompletion([
        {
          role: 'system',
          content: 'Je bent een motiverende dating coach die persoonlijke, bemoedigende berichten schrijft. Gebruik een warme, ondersteunende toon. Maximaal 2 zinnen per bericht.'
        },
        {
          role: 'user',
          content: prompt
        }
      ], { maxTokens: 150, temperature: 0.8 });

      return aiContent.trim();

    } catch (error) {
      console.error('Error generating personalized content:', error);
      return this.getFallbackContent(engagementType, context);
    }
  }

  /**
   * Deliver scheduled engagements
   */
  static async deliverScheduledEngagements(): Promise<number> {
    try {
      // Get engagements due for delivery
      const dueEngagements = await sql`
        SELECT * FROM engagement_schedules
        WHERE status = 'scheduled'
          AND scheduled_for <= NOW()
          AND scheduled_for > NOW() - INTERVAL '1 hour' -- Prevent old deliveries
        ORDER BY scheduled_for ASC
        LIMIT 50
      `;

      let delivered = 0;

      for (const engagement of dueEngagements.rows) {
        try {
          await this.deliverEngagement(engagement);
          delivered++;
        } catch (error) {
          console.error(`Error delivering engagement ${engagement.id}:`, error);
          await this.markEngagementFailed(engagement.id);
        }
      }

      console.log(`Delivered ${delivered} scheduled engagements`);
      return delivered;

    } catch (error) {
      console.error('Error delivering scheduled engagements:', error);
      return 0;
    }
  }

  /**
   * Track user engagement with delivered content
   */
  static async trackEngagementInteraction(
    userId: number,
    engagementId: number,
    interactionType: 'viewed' | 'responded' | 'completed' | 'dismissed',
    responseData?: any
  ): Promise<void> {
    try {
      await sql`
        UPDATE engagement_schedules
        SET metadata = metadata || ${JSON.stringify({
          interaction_type: interactionType,
          interaction_time: new Date(),
          response_data: responseData
        })}
        WHERE id = ${engagementId} AND user_id = ${userId}
      `;

      // Update user engagement stats
      await this.updateUserEngagementStats(userId, interactionType);

    } catch (error) {
      console.error('Error tracking engagement interaction:', error);
    }
  }

  /**
   * Get user's engagement statistics
   */
  static async getUserEngagementStats(userId: number): Promise<UserEngagementStats> {
    try {
      // Get streak data
      const streakData = await sql`
        SELECT current_streak, longest_streak, last_activity_date
        FROM user_streaks
        WHERE user_id = ${userId} AND streak_type = 'daily_engagement'
      `;

      // Get engagement history
      const engagementHistory = await sql`
        SELECT COUNT(*) as total_delivered,
               COUNT(CASE WHEN metadata->>'interaction_type' IS NOT NULL THEN 1 END) as total_interacted
        FROM engagement_schedules
        WHERE user_id = ${userId}
          AND status = 'delivered'
          AND scheduled_for >= NOW() - INTERVAL '30 days'
      `;

      const delivered = parseInt(engagementHistory.rows[0]?.total_delivered || '0');
      const interacted = parseInt(engagementHistory.rows[0]?.total_interacted || '0');
      const engagementRate = delivered > 0 ? (interacted / delivered) * 100 : 0;

      return {
        currentStreak: parseInt(streakData.rows[0]?.current_streak || '0'),
        longestStreak: parseInt(streakData.rows[0]?.longest_streak || '0'),
        totalEngagements: delivered,
        lastEngagementDate: streakData.rows[0]?.last_activity_date || new Date(),
        preferredTimeOfDay: 'morning', // Could be calculated from interaction times
        engagementRate: Math.round(engagementRate * 100) / 100
      };

    } catch (error) {
      console.error('Error getting user engagement stats:', error);
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalEngagements: 0,
        lastEngagementDate: new Date(),
        preferredTimeOfDay: 'morning',
        engagementRate: 0
      };
    }
  }

  /**
   * Create success celebration for goal achievement
   */
  static async createSuccessCelebration(
    userId: number,
    achievement: string,
    goalType: string
  ): Promise<void> {
    try {
      const content = await this.generatePersonalizedContent(
        userId,
        'success_celebration',
        { achievement, goalType }
      );

      // Schedule immediate delivery
      const scheduledFor = new Date();
      await this.scheduleEngagement(userId, 'success_celebration', scheduledFor, 'in_app', {
        content,
        achievement,
        goalType
      });

      // Deliver immediately for celebrations
      await this.deliverEngagement({
        user_id: userId,
        schedule_type: 'success_celebration',
        scheduled_for: scheduledFor,
        content_type: 'in_app',
        content_id: 'celebration',
        metadata: { content, achievement, goalType }
      });

    } catch (error) {
      console.error('Error creating success celebration:', error);
    }
  }

  /**
   * Handle streak milestones
   */
  static async handleStreakMilestone(userId: number, streakCount: number): Promise<void> {
    try {
      const content = this.CONTENT_TEMPLATES.streak_milestone[
        Math.floor(Math.random() * this.CONTENT_TEMPLATES.streak_milestone.length)
      ].replace('{streak}', streakCount.toString());

      const scheduledFor = new Date();
      await this.scheduleEngagement(userId, 'streak_milestone', scheduledFor, 'in_app', {
        content,
        streakCount
      });

      // Deliver immediately for milestones
      await this.deliverEngagement({
        user_id: userId,
        schedule_type: 'streak_milestone',
        scheduled_for: scheduledFor,
        content_type: 'in_app',
        content_id: 'milestone',
        metadata: { content, streakCount }
      });

    } catch (error) {
      console.error('Error handling streak milestone:', error);
    }
  }

  // Private helper methods

  private static async scheduleEngagement(
    userId: number,
    type: DailyEngagement['engagementType'],
    scheduledFor: Date,
    channel: DailyEngagement['channel'],
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await sql`
        INSERT INTO engagement_schedules (
          user_id, schedule_type, scheduled_for, status, content_type, metadata
        )
        VALUES (
          ${userId}, ${type}, ${scheduledFor}, 'scheduled', ${channel},
          ${JSON.stringify(metadata || {})}
        )
        ON CONFLICT (user_id, schedule_type, DATE(scheduled_for))
        DO NOTHING
      `;
    } catch (error) {
      console.error('Error scheduling engagement:', error);
    }
  }

  private static async deliverEngagement(engagement: any): Promise<void> {
    try {
      const content = engagement.metadata?.content ||
        await this.generatePersonalizedContent(engagement.user_id, engagement.schedule_type, engagement.metadata);

      // Deliver based on channel
      switch (engagement.content_type) {
        case 'in_app':
          await createNotification({
            userId: engagement.user_id,
            title: this.getEngagementTitle(engagement.schedule_type),
            message: content,
            type: this.getEngagementType(engagement.schedule_type),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
          });
          break;

        case 'email':
          // Would integrate with email service
          break;

        case 'sms':
          await sendSMSToUser(engagement.user_id, content);
          break;
      }

      // Mark as delivered
      await sql`
        UPDATE engagement_schedules
        SET status = 'delivered', delivered_at = NOW()
        WHERE id = ${engagement.id}
      `;

    } catch (error) {
      console.error('Error delivering engagement:', error);
      throw error;
    }
  }

  private static async markEngagementFailed(engagementId: number): Promise<void> {
    await sql`
      UPDATE engagement_schedules
      SET status = 'failed'
      WHERE id = ${engagementId}
    `;
  }

  private static getUserTime(hour: number, minute: number, timezone: string): Date {
    const now = new Date();
    // Simplified timezone handling - in production use a proper timezone library
    const userTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
    userTime.setHours(hour, minute, 0, 0);
    return userTime;
  }

  private static isInQuietHours(time: Date, quietStart?: string, quietEnd?: string): boolean {
    if (!quietStart || !quietEnd) return false;

    const [startHour, startMin] = quietStart.split(':').map(Number);
    const [endHour, endMin] = quietEnd.split(':').map(Number);

    const timeMinutes = time.getHours() * 60 + time.getMinutes();
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
  }

  private static buildPersonalizationPrompt(
    type: DailyEngagement['engagementType'],
    scan: any,
    context?: Record<string, any>
  ): string {
    const baseInfo = `Gebruiker: ${scan.strength_self || 'Geen specifieke sterkte gedeeld'}
Uitdaging: ${scan.main_challenge || 'Algemene dating uitdagingen'}
Doel: ${scan.desired_outcome || 'Betere dating ervaringen'}
Comfort level: ${scan.comfort_level}/10`;

    switch (type) {
      case 'morning_motivation':
        return `${baseInfo}

Schrijf een persoonlijke, motiverende ochtendboodschap van max 2 zinnen. Focus op hun sterke punten en moedig kleine stappen aan.`;

      case 'evening_checkin':
        return `${baseInfo}

Schrijf een reflectieve avondboodschap van max 2 zinnen. Vraag naar wat goed ging en wat ze leerden.`;

      case 'progress_reminder':
        return `${baseInfo}

Schrijf een vriendelijke herinnering van max 2 zinnen om actie te ondernemen vandaag.`;

      case 'success_celebration':
        return `${baseInfo}
Prestaties: ${context?.achievement || 'Voortgang geboekt'}

Schrijf een felicitatie van max 2 zinnen die hun succes viert en aanmoedigt door te gaan.`;

      default:
        return `${baseInfo}

Schrijf een algemene motiverende boodschap van max 2 zinnen.`;
    }
  }

  private static getFallbackContent(
    type: DailyEngagement['engagementType'],
    context?: Record<string, any>
  ): string {
    const templates = this.CONTENT_TEMPLATES[type] || this.CONTENT_TEMPLATES.morning_motivation;
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private static getEngagementTitle(type: DailyEngagement['engagementType']): string {
    const titles = {
      morning_motivation: '🌅 Goedemorgen!',
      evening_checkin: '🌙 Avond Reflectie',
      progress_reminder: '⏰ Tijd voor Actie',
      success_celebration: '🎉 Gefeliciteerd!',
      streak_milestone: '🔥 Streak Mijlpaal!'
    };
    return titles[type] || '💪 Jouw Journey';
  }

  private static getEngagementType(type: DailyEngagement['engagementType']): 'info' | 'success' | 'warning' | 'error' {
    const types = {
      morning_motivation: 'info',
      evening_checkin: 'info',
      progress_reminder: 'warning',
      success_celebration: 'success',
      streak_milestone: 'success'
    };
    return types[type] || 'info';
  }

  private static async updateUserEngagementStats(
    userId: number,
    interactionType: string
  ): Promise<void> {
    try {
      // Update streak tracking
      const today = new Date().toISOString().split('T')[0];

      await sql`
        INSERT INTO user_streaks (user_id, streak_type, current_streak, longest_streak, last_activity_date)
        VALUES (${userId}, 'daily_engagement', 1, 1, ${today})
        ON CONFLICT (user_id, streak_type)
        DO UPDATE SET
          current_streak = CASE
            WHEN user_streaks.last_activity_date = ${today} THEN user_streaks.current_streak
            WHEN user_streaks.last_activity_date = ${new Date(Date.now() - 86400000).toISOString().split('T')[0]}
              THEN user_streaks.current_streak + 1
            ELSE 1
          END,
          longest_streak = GREATEST(user_streaks.longest_streak, CASE
            WHEN user_streaks.last_activity_date = ${new Date(Date.now() - 86400000).toISOString().split('T')[0]}
              THEN user_streaks.current_streak + 1
            ELSE 1
          END),
          last_activity_date = ${today}
      `;
    } catch (error) {
      console.error('Error updating user engagement stats:', error);
    }
  }
}