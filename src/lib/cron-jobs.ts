/**
 * Cron Jobs - Automated task scheduler for the journey system
 * Handles daily engagement, weekly reflections, monthly reports, and maintenance tasks
 */

import { sql } from '@vercel/postgres';
import { DailyEngagementService } from './daily-engagement-service';
import { WeeklyReflectionService } from './weekly-reflection-service';
import { BadgeSystem } from './badge-system';
import { JourneyService } from './journey-service';
// import { PerformanceTracker } from './performance-tracker'; // TODO: Create this file or remove usage

export interface CronJobResult {
  jobName: string;
  success: boolean;
  processed: number;
  errors: number;
  duration: number;
  timestamp: Date;
}

export class CronJobsService {
  private static jobHistory: CronJobResult[] = [];
  private static readonly MAX_HISTORY = 100;

  /**
   * Daily jobs - run every morning at 6 AM
   */
  static async runDailyJobs(): Promise<CronJobResult> {
    const startTime = Date.now();
    const jobName = 'daily_jobs';
    let processed = 0;
    let errors = 0;

    try {
      console.log('🚀 Starting daily cron jobs...');

      // 1. Schedule daily engagements for all active users
      const engagementResult = await this.scheduleDailyEngagements();
      processed += engagementResult.processed;
      errors += engagementResult.errors;

      // 2. Deliver scheduled engagements
      const deliveryResult = await this.deliverScheduledEngagements();
      processed += deliveryResult.processed;
      errors += deliveryResult.errors;

      // 3. Check and award badges
      const badgeResult = await this.checkAndAwardBadges();
      processed += badgeResult.processed;
      errors += badgeResult.errors;

      // 4. Update performance metrics
      const metricsResult = await this.updatePerformanceMetrics();
      processed += metricsResult.processed;
      errors += metricsResult.errors;

      // 5. Clean up old data
      const cleanupResult = await this.cleanupOldData();
      processed += cleanupResult.processed;
      errors += cleanupResult.errors;

      console.log(`✅ Daily jobs completed: ${processed} processed, ${errors} errors`);

      const result: CronJobResult = {
        jobName,
        success: errors === 0,
        processed,
        errors,
        duration: Date.now() - startTime,
        timestamp: new Date()
      };

      this.addToHistory(result);
      return result;

    } catch (error) {
      console.error('❌ Error in daily jobs:', error);

      const result: CronJobResult = {
        jobName,
        success: false,
        processed,
        errors: errors + 1,
        duration: Date.now() - startTime,
        timestamp: new Date()
      };

      this.addToHistory(result);
      return result;
    }
  }

  /**
   * Weekly jobs - run every Monday at 7 AM
   */
  static async runWeeklyJobs(): Promise<CronJobResult> {
    const startTime = Date.now();
    const jobName = 'weekly_jobs';
    let processed = 0;
    let errors = 0;

    try {
      console.log('📅 Starting weekly cron jobs...');

      // 1. Generate weekly reflections for all users
      const reflectionResult = await this.generateWeeklyReflections();
      processed += reflectionResult.processed;
      errors += reflectionResult.errors;

      // 2. Schedule weekly reflection reminders
      const reminderResult = await this.scheduleWeeklyReminders();
      processed += reminderResult.processed;
      errors += reminderResult.errors;

      // 3. Update weekly performance analytics
      const analyticsResult = await this.updateWeeklyAnalytics();
      processed += analyticsResult.processed;
      errors += analyticsResult.errors;

      // 4. Generate weekly AI insights
      const insightsResult = await this.generateWeeklyInsights();
      processed += insightsResult.processed;
      errors += insightsResult.errors;

      console.log(`✅ Weekly jobs completed: ${processed} processed, ${errors} errors`);

      const result: CronJobResult = {
        jobName,
        success: errors === 0,
        processed,
        errors,
        duration: Date.now() - startTime,
        timestamp: new Date()
      };

      this.addToHistory(result);
      return result;

    } catch (error) {
      console.error('❌ Error in weekly jobs:', error);

      const result: CronJobResult = {
        jobName,
        success: false,
        processed,
        errors: errors + 1,
        duration: Date.now() - startTime,
        timestamp: new Date()
      };

      this.addToHistory(result);
      return result;
    }
  }

  /**
   * Monthly jobs - run on the 1st of each month at 8 AM
   */
  static async runMonthlyJobs(): Promise<CronJobResult> {
    const startTime = Date.now();
    const jobName = 'monthly_jobs';
    let processed = 0;
    let errors = 0;

    try {
      console.log('📊 Starting monthly cron jobs...');

      // 1. Generate monthly progress reports
      const reportResult = await this.generateMonthlyReports();
      processed += reportResult.processed;
      errors += reportResult.errors;

      // 2. Update monthly analytics
      const analyticsResult = await this.updateMonthlyAnalytics();
      processed += analyticsResult.processed;
      errors += analyticsResult.errors;

      // 3. Check milestone achievements
      const milestoneResult = await this.checkMilestoneAchievements();
      processed += milestoneResult.processed;
      errors += milestoneResult.errors;

      // 4. Generate monthly AI summaries
      const summaryResult = await this.generateMonthlySummaries();
      processed += summaryResult.processed;
      errors += summaryResult.errors;

      console.log(`✅ Monthly jobs completed: ${processed} processed, ${errors} errors`);

      const result: CronJobResult = {
        jobName,
        success: errors === 0,
        processed,
        errors,
        duration: Date.now() - startTime,
        timestamp: new Date()
      };

      this.addToHistory(result);
      return result;

    } catch (error) {
      console.error('❌ Error in monthly jobs:', error);

      const result: CronJobResult = {
        jobName,
        success: false,
        processed,
        errors: errors + 1,
        duration: Date.now() - startTime,
        timestamp: new Date()
      };

      this.addToHistory(result);
      return result;
    }
  }

  /**
   * Hourly jobs - run every hour for real-time tasks
   */
  static async runHourlyJobs(): Promise<CronJobResult> {
    const startTime = Date.now();
    const jobName = 'hourly_jobs';
    let processed = 0;
    let errors = 0;

    try {
      console.log('⏰ Starting hourly cron jobs...');

      // 1. Process any missed deliveries
      const deliveryResult = await this.processMissedDeliveries();
      processed += deliveryResult.processed;
      errors += deliveryResult.errors;

      // 2. Update real-time metrics
      const metricsResult = await this.updateRealTimeMetrics();
      processed += metricsResult.processed;
      errors += metricsResult.errors;

      console.log(`✅ Hourly jobs completed: ${processed} processed, ${errors} errors`);

      const result: CronJobResult = {
        jobName,
        success: errors === 0,
        processed,
        errors,
        duration: Date.now() - startTime,
        timestamp: new Date()
      };

      this.addToHistory(result);
      return result;

    } catch (error) {
      console.error('❌ Error in hourly jobs:', error);

      const result: CronJobResult = {
        jobName,
        success: false,
        processed,
        errors: errors + 1,
        duration: Date.now() - startTime,
        timestamp: new Date()
      };

      this.addToHistory(result);
      return result;
    }
  }

  // Private helper methods for daily jobs

  private static async scheduleDailyEngagements(): Promise<{ processed: number; errors: number }> {
    try {
      const usersResult = await sql`
        SELECT id FROM users
        WHERE subscription_status = 'active'
        LIMIT 1000
      `;

      let processed = 0;
      let errors = 0;

      for (const user of usersResult.rows) {
        try {
          await DailyEngagementService.scheduleDailyEngagements(user.id);
          processed++;
        } catch (error) {
          console.error(`Error scheduling engagements for user ${user.id}:`, error);
          errors++;
        }
      }

      return { processed, errors };
    } catch (error) {
      console.error('Error scheduling daily engagements:', error);
      return { processed: 0, errors: 1 };
    }
  }

  private static async deliverScheduledEngagements(): Promise<{ processed: number; errors: number }> {
    try {
      const processed = await DailyEngagementService.deliverScheduledEngagements();
      return { processed, errors: 0 };
    } catch (error) {
      console.error('Error delivering scheduled engagements:', error);
      return { processed: 0, errors: 1 };
    }
  }

  private static async checkAndAwardBadges(): Promise<{ processed: number; errors: number }> {
    try {
      const usersResult = await sql`
        SELECT id FROM users
        WHERE subscription_status = 'active'
        LIMIT 1000
      `;

      let processed = 0;
      let errors = 0;

      for (const user of usersResult.rows) {
        try {
          const badges = await BadgeSystem.checkAndAwardBadges(user.id);
          processed += badges.length;
        } catch (error) {
          console.error(`Error checking badges for user ${user.id}:`, error);
          errors++;
        }
      }

      return { processed, errors };
    } catch (error) {
      console.error('Error checking and awarding badges:', error);
      return { processed: 0, errors: 1 };
    }
  }

  private static async updatePerformanceMetrics(): Promise<{ processed: number; errors: number }> {
    try {
      const processed = await PerformanceTracker.updateDailyMetrics();
      return { processed, errors: 0 };
    } catch (error) {
      console.error('Error updating performance metrics:', error);
      return { processed: 0, errors: 1 };
    }
  }

  private static async cleanupOldData(): Promise<{ processed: number; errors: number }> {
    try {
      // Clean up old engagement schedules (older than 30 days)
      const oldSchedules = await sql`
        DELETE FROM engagement_schedules
        WHERE scheduled_for < NOW() - INTERVAL '30 days'
        AND status IN ('delivered', 'failed')
      `;

      // Clean up old notifications (older than 7 days)
      const oldNotifications = await sql`
        DELETE FROM in_app_notifications
        WHERE created_at < NOW() - INTERVAL '7 days'
        AND is_read = true
      `;

      const processed = oldSchedules.rowCount + oldNotifications.rowCount;
      return { processed, errors: 0 };
    } catch (error) {
      console.error('Error cleaning up old data:', error);
      return { processed: 0, errors: 1 };
    }
  }

  // Private helper methods for weekly jobs

  private static async generateWeeklyReflections(): Promise<{ processed: number; errors: number }> {
    try {
      const processed = await WeeklyReflectionService.scheduleWeeklyReflections();
      return { processed, errors: 0 };
    } catch (error) {
      console.error('Error generating weekly reflections:', error);
      return { processed: 0, errors: 1 };
    }
  }

  private static async scheduleWeeklyReminders(): Promise<{ processed: number; errors: number }> {
    try {
      // This is handled by the WeeklyReflectionService.scheduleWeeklyReflections method
      return { processed: 0, errors: 0 };
    } catch (error) {
      console.error('Error scheduling weekly reminders:', error);
      return { processed: 0, errors: 1 };
    }
  }

  private static async updateWeeklyAnalytics(): Promise<{ processed: number; errors: number }> {
    try {
      const processed = await PerformanceTracker.updateWeeklyMetrics();
      return { processed, errors: 0 };
    } catch (error) {
      console.error('Error updating weekly analytics:', error);
      return { processed: 0, errors: 1 };
    }
  }

  private static async generateWeeklyInsights(): Promise<{ processed: number; errors: number }> {
    try {
      // Generate insights for users who completed reflections this week
      const reflectionsResult = await sql`
        SELECT DISTINCT user_id
        FROM weekly_reflections
        WHERE completed_at >= NOW() - INTERVAL '7 days'
      `;

      let processed = 0;
      for (const reflection of reflectionsResult.rows) {
        try {
          // Generate next week goals based on reflection
          const lastReflection = await sql`
            SELECT * FROM weekly_reflections
            WHERE user_id = ${reflection.user_id}
            ORDER BY week_start DESC
            LIMIT 1
          `;

          if (lastReflection.rows.length > 0) {
            await WeeklyReflectionService.generateNextWeekGoals(
              reflection.user_id,
              lastReflection.rows[0]
            );
            processed++;
          }
        } catch (error) {
          console.error(`Error generating insights for user ${reflection.user_id}:`, error);
        }
      }

      return { processed, errors: 0 };
    } catch (error) {
      console.error('Error generating weekly insights:', error);
      return { processed: 0, errors: 1 };
    }
  }

  // Private helper methods for monthly jobs

  private static async generateMonthlyReports(): Promise<{ processed: number; errors: number }> {
    try {
      const usersResult = await sql`
        SELECT id FROM users
        WHERE subscription_status = 'active'
        LIMIT 1000
      `;

      let processed = 0;
      let errors = 0;

      for (const user of usersResult.rows) {
        try {
          await JourneyService.generateMonthlyReport(user.id);
          processed++;
        } catch (error) {
          console.error(`Error generating monthly report for user ${user.id}:`, error);
          errors++;
        }
      }

      return { processed, errors };
    } catch (error) {
      console.error('Error generating monthly reports:', error);
      return { processed: 0, errors: 1 };
    }
  }

  private static async updateMonthlyAnalytics(): Promise<{ processed: number; errors: number }> {
    try {
      const processed = await PerformanceTracker.updateMonthlyMetrics();
      return { processed, errors: 0 };
    } catch (error) {
      console.error('Error updating monthly analytics:', error);
      return { processed: 0, errors: 1 };
    }
  }

  private static async checkMilestoneAchievements(): Promise<{ processed: number; errors: number }> {
    try {
      const usersResult = await sql`
        SELECT id FROM users
        WHERE subscription_status = 'active'
        LIMIT 1000
      `;

      let processed = 0;
      let errors = 0;

      for (const user of usersResult.rows) {
        try {
          // Check for milestone badges (monthly check)
          const badges = await BadgeSystem.checkAndAwardBadges(user.id);
          processed += badges.length;
        } catch (error) {
          console.error(`Error checking milestones for user ${user.id}:`, error);
          errors++;
        }
      }

      return { processed, errors };
    } catch (error) {
      console.error('Error checking milestone achievements:', error);
      return { processed: 0, errors: 1 };
    }
  }

  private static async generateMonthlySummaries(): Promise<{ processed: number; errors: number }> {
    try {
      // Generate monthly AI summaries for user journeys
      const processed = await JourneyService.generateMonthlyAISummaries();
      return { processed, errors: 0 };
    } catch (error) {
      console.error('Error generating monthly summaries:', error);
      return { processed: 0, errors: 1 };
    }
  }

  // Private helper methods for hourly jobs

  private static async processMissedDeliveries(): Promise<{ processed: number; errors: number }> {
    try {
      // Process any engagements that should have been delivered but weren't
      const missedResult = await sql`
        SELECT * FROM engagement_schedules
        WHERE status = 'scheduled'
          AND scheduled_for < NOW() - INTERVAL '1 hour'
          AND scheduled_for > NOW() - INTERVAL '24 hours'
        LIMIT 100
      `;

      let processed = 0;
      for (const engagement of missedResult.rows) {
        try {
          // Attempt to deliver missed engagement
          await DailyEngagementService.deliverScheduledEngagements();
          processed++;
        } catch (error) {
          console.error(`Error processing missed delivery ${engagement.id}:`, error);
        }
      }

      return { processed, errors: 0 };
    } catch (error) {
      console.error('Error processing missed deliveries:', error);
      return { processed: 0, errors: 1 };
    }
  }

  private static async updateRealTimeMetrics(): Promise<{ processed: number; errors: number }> {
    try {
      const processed = await PerformanceTracker.updateRealTimeMetrics();
      return { processed, errors: 0 };
    } catch (error) {
      console.error('Error updating real-time metrics:', error);
      return { processed: 0, errors: 1 };
    }
  }

  // Utility methods

  private static addToHistory(result: CronJobResult): void {
    this.jobHistory.unshift(result);
    if (this.jobHistory.length > this.MAX_HISTORY) {
      this.jobHistory = this.jobHistory.slice(0, this.MAX_HISTORY);
    }
  }

  /**
   * Get cron job execution history
   */
  static getJobHistory(limit: number = 50): CronJobResult[] {
    return this.jobHistory.slice(0, limit);
  }

  /**
   * Get cron job statistics
   */
  static getJobStats(): {
    totalJobs: number;
    successRate: number;
    averageDuration: number;
    lastExecution: Date | null;
    jobsByType: Record<string, { count: number; successRate: number; averageDuration: number }>;
  } {
    if (this.jobHistory.length === 0) {
      return {
        totalJobs: 0,
        successRate: 0,
        averageDuration: 0,
        lastExecution: null,
        jobsByType: {}
      };
    }

    const totalJobs = this.jobHistory.length;
    const successfulJobs = this.jobHistory.filter(job => job.success).length;
    const successRate = (successfulJobs / totalJobs) * 100;

    const totalDuration = this.jobHistory.reduce((sum, job) => sum + job.duration, 0);
    const averageDuration = totalDuration / totalJobs;

    const lastExecution = this.jobHistory[0]?.timestamp || null;

    // Group by job type
    const jobsByType: Record<string, { count: number; successRate: number; averageDuration: number }> = {};

    this.jobHistory.forEach(job => {
      if (!jobsByType[job.jobName]) {
        jobsByType[job.jobName] = { count: 0, successRate: 0, averageDuration: 0 };
      }

      jobsByType[job.jobName].count++;
      if (job.success) {
        jobsByType[job.jobName].successRate =
          ((jobsByType[job.jobName].successRate * (jobsByType[job.jobName].count - 1)) + 100) / jobsByType[job.jobName].count;
      }
      jobsByType[job.jobName].averageDuration =
        ((jobsByType[job.jobName].averageDuration * (jobsByType[job.jobName].count - 1)) + job.duration) / jobsByType[job.jobName].count;
    });

    return {
      totalJobs,
      successRate: Math.round(successRate * 100) / 100,
      averageDuration: Math.round(averageDuration),
      lastExecution,
      jobsByType
    };
  }

  /**
   * Manual trigger for testing (admin only)
   */
  static async triggerJob(jobType: 'daily' | 'weekly' | 'monthly' | 'hourly'): Promise<CronJobResult> {
    switch (jobType) {
      case 'daily':
        return await this.runDailyJobs();
      case 'weekly':
        return await this.runWeeklyJobs();
      case 'monthly':
        return await this.runMonthlyJobs();
      case 'hourly':
        return await this.runHourlyJobs();
      default:
        throw new Error(`Unknown job type: ${jobType}`);
    }
  }
}