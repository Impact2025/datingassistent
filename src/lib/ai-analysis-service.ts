import { sql } from '@vercel/postgres';
import { AICoachService } from './ai-coach-service';

export class AIAnalysisService {
  /**
   * Generate monthly reports for all active clients
   */
  static async generateMonthlyReports(): Promise<void> {
    try {
      console.log('Starting monthly AI report generation...');

      // Get all active clients
      const clientsResult = await sql`
        SELECT DISTINCT u.id, u.name
        FROM users u
        JOIN coach_client_assignments cca ON u.id = cca.client_user_id
        WHERE cca.status = 'active'
      `;

      for (const client of clientsResult.rows) {
        try {
          await this.generateMonthlyReportForClient(client.id);
          console.log(`Generated monthly report for ${client.name}`);
        } catch (error) {
          console.error(`Failed to generate report for ${client.name}:`, error);
        }
      }

      console.log('Monthly AI report generation completed');
    } catch (error) {
      console.error('Error in monthly report generation:', error);
    }
  }

  /**
   * Generate weekly reviews for all active clients
   */
  static async generateWeeklyReviews(): Promise<void> {
    try {
      console.log('Starting weekly AI review generation...');

      // Get all active clients
      const clientsResult = await sql`
        SELECT DISTINCT u.id, u.name
        FROM users u
        JOIN coach_client_assignments cca ON u.id = cca.client_user_id
        WHERE cca.status = 'active'
      `;

      for (const client of clientsResult.rows) {
        try {
          await this.generateWeeklyReviewForClient(client.id);
          console.log(`Generated weekly review for ${client.name}`);
        } catch (error) {
          console.error(`Failed to generate review for ${client.name}:`, error);
        }
      }

      console.log('Weekly AI review generation completed');
    } catch (error) {
      console.error('Error in weekly review generation:', error);
    }
  }

  /**
   * Generate coach notifications based on user activity
   */
  static async generateCoachNotifications(): Promise<void> {
    try {
      console.log('Starting coach notification generation...');

      // Get all coaches with their clients
      const coachesResult = await sql`
        SELECT DISTINCT cca.coach_user_id, u.name as coach_name
        FROM coach_client_assignments cca
        JOIN users u ON cca.coach_user_id = u.id
        WHERE cca.status = 'active'
      `;

      for (const coach of coachesResult.rows) {
        try {
          // Get all clients for this coach
          const clientsResult = await sql`
            SELECT client_user_id
            FROM coach_client_assignments
            WHERE coach_user_id = ${coach.coach_user_id}
            AND status = 'active'
          `;

          for (const client of clientsResult.rows) {
            const notifications = await AICoachService.generateCoachNotifications(client.client_user_id);

            // Save notifications to database
            for (const notification of notifications) {
              await sql`
                INSERT INTO ai_coach_notifications (
                  user_id, notification_type, priority, title, message,
                  ai_insights, suggested_actions
                )
                VALUES (
                  ${client.client_user_id}, ${notification.type}, ${notification.priority},
                  ${notification.title}, ${notification.message},
                  ${JSON.stringify(notification)}, ${JSON.stringify(notification.suggestedActions)}
                )
                ON CONFLICT DO NOTHING
              `;
            }
          }

          console.log(`Generated notifications for coach ${coach.coach_name}`);
        } catch (error) {
          console.error(`Failed to generate notifications for coach ${coach.coach_name}:`, error);
        }
      }

      console.log('Coach notification generation completed');
    } catch (error) {
      console.error('Error in coach notification generation:', error);
    }
  }

  /**
   * Analyze user content and store results
   */
  static async analyzeUserContent(userId: number, contentType: string, content: string, contentId?: string): Promise<void> {
    try {
      const analysis = await AICoachService.analyzeContent({
        userId,
        contentType: contentType as any,
        content,
        contentId
      });

      // Store analysis in database
      await sql`
        INSERT INTO ai_content_analyses (
          user_id, content_type, content_id, analysis_type,
          ai_score, ai_feedback, improvement_suggestions,
          risk_warnings, positive_aspects, alternative_suggestions
        )
        VALUES (
          ${userId}, ${contentType}, ${contentId || null}, 'comprehensive',
          ${analysis.aiScore}, ${analysis.aiFeedback},
          ${JSON.stringify(analysis.improvementSuggestions)},
          ${JSON.stringify(analysis.riskWarnings)},
          ${JSON.stringify(analysis.positiveAspects)},
          ${JSON.stringify(analysis.alternativeSuggestions)}
        )
      `;

      console.log(`Analyzed ${contentType} content for user ${userId}`);
    } catch (error) {
      console.error(`Error analyzing content for user ${userId}:`, error);
    }
  }

  /**
   * Track user activity for AI analysis
   */
  static async trackUserActivity(
    userId: number,
    activityType: string,
    activityData: any = {},
    sentimentScore?: number,
    engagementScore?: number,
    riskIndicators: string[] = []
  ): Promise<void> {
    try {
      await sql`
        INSERT INTO user_activity_tracking (
          user_id, activity_type, activity_data,
          sentiment_score, engagement_score, risk_indicators
        )
        VALUES (
          ${userId}, ${activityType}, ${JSON.stringify(activityData)},
          ${sentimentScore || null}, ${engagementScore || null}, ${JSON.stringify(riskIndicators)}
        )
      `;
    } catch (error) {
      console.error('Error tracking user activity:', error);
    }
  }

  // Private helper methods
  private static async generateMonthlyReportForClient(userId: number): Promise<void> {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

    // Gather data for the report
    const goalsData = await this.getUserGoalsData(userId);
    const weeklyReviews = await this.getUserWeeklyReviews(userId);
    const communityPosts = await this.getUserCommunityPosts(userId);
    const profileUpdates = await this.getUserProfileUpdates(userId);
    const photoChanges = await this.getUserPhotoChanges(userId);
    const messagePractice = await this.getUserMessagePractice(userId);
    const successes = await this.getUserSuccesses(userId);

    const reportData = {
      userId,
      goals: goalsData,
      weeklyReviews,
      communityPosts,
      profileUpdates,
      photoChanges,
      messagePractice,
      successes
    };

    const report = await AICoachService.generateMonthlyReport(reportData);

    // Save report to database
    await sql`
      INSERT INTO monthly_ai_reports (
        user_id, report_month, goals_achieved, goals_missed,
        actions_completed, consistency_score, avoidance_patterns,
        ai_insights, success_highlights, improvement_areas,
        recommended_focus, suggested_next_goal
      )
      VALUES (
        ${userId}, ${currentMonth + '-01'}, ${JSON.stringify(report.goalsAchieved)},
        ${JSON.stringify(report.goalsMissed)}, ${report.actionsCompleted},
        ${report.consistencyScore}, ${JSON.stringify(report.avoidancePatterns)},
        ${report.aiInsights}, ${JSON.stringify(report.successHighlights)},
        ${JSON.stringify(report.improvementAreas)}, ${report.recommendedFocus},
        ${report.suggestedNextGoal}
      )
      ON CONFLICT (user_id, report_month) DO UPDATE SET
        goals_achieved = EXCLUDED.goals_achieved,
        goals_missed = EXCLUDED.goals_missed,
        actions_completed = EXCLUDED.actions_completed,
        consistency_score = EXCLUDED.consistency_score,
        avoidance_patterns = EXCLUDED.avoidance_patterns,
        ai_insights = EXCLUDED.ai_insights,
        success_highlights = EXCLUDED.success_highlights,
        improvement_areas = EXCLUDED.improvement_areas,
        recommended_focus = EXCLUDED.recommended_focus,
        suggested_next_goal = EXCLUDED.suggested_next_goal,
        updated_at = NOW()
    `;
  }

  private static async generateWeeklyReviewForClient(userId: number): Promise<void> {
    const currentWeek = this.getCurrentWeekStart();

    // Get the most recent weekly reflection from the user
    const reflectionResult = await sql`
      SELECT * FROM weekly_ai_reviews
      WHERE user_id = ${userId}
      AND review_week >= ${currentWeek}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (reflectionResult.rows.length === 0) {
      return; // No reflection to analyze
    }

    const reflection = reflectionResult.rows[0];

    const reviewData = {
      userId,
      reflection: reflection.user_reflection || '',
      challenges: reflection.challenges_faced || [],
      achievements: reflection.achievements || [],
      energyLevel: reflection.energy_level,
      motivationLevel: reflection.motivation_level
    };

    const review = await AICoachService.generateWeeklyReview(reviewData);

    // Update the review with AI insights
    await sql`
      UPDATE weekly_ai_reviews
      SET
        ai_summary = ${review.aiSummary},
        ai_suggestions = ${JSON.stringify(review.aiSuggestions)},
        micro_goals = ${JSON.stringify(review.microGoals)},
        encouragement_message = ${review.encouragementMessage},
        risk_flags = ${JSON.stringify(review.riskFlags)}
      WHERE id = ${reflection.id}
    `;
  }

  // Helper methods to gather user data
  private static async getUserGoalsData(userId: number): Promise<any[]> {
    const result = await sql`
      SELECT title, status, progress_percentage
      FROM user_goals
      WHERE user_id = ${userId}
      AND created_at >= NOW() - INTERVAL '30 days'
    `;
    return result.rows;
  }

  private static async getUserWeeklyReviews(userId: number): Promise<any[]> {
    const result = await sql`
      SELECT * FROM weekly_ai_reviews
      WHERE user_id = ${userId}
      AND created_at >= NOW() - INTERVAL '30 days'
    `;
    return result.rows;
  }

  private static async getUserCommunityPosts(userId: number): Promise<any[]> {
    const result = await sql`
      SELECT * FROM forum_posts
      WHERE user_id = ${userId}
      AND created_at >= NOW() - INTERVAL '30 days'
    `;
    return result.rows;
  }

  private static async getUserProfileUpdates(userId: number): Promise<any[]> {
    const result = await sql`
      SELECT * FROM user_activity_tracking
      WHERE user_id = ${userId}
      AND activity_type = 'profile_update'
      AND created_at >= NOW() - INTERVAL '30 days'
    `;
    return result.rows;
  }

  private static async getUserPhotoChanges(userId: number): Promise<any[]> {
    const result = await sql`
      SELECT * FROM user_activity_tracking
      WHERE user_id = ${userId}
      AND activity_type = 'photo_upload'
      AND created_at >= NOW() - INTERVAL '30 days'
    `;
    return result.rows;
  }

  private static async getUserMessagePractice(userId: number): Promise<any[]> {
    const result = await sql`
      SELECT * FROM user_activity_tracking
      WHERE user_id = ${userId}
      AND activity_type = 'message_practice'
      AND created_at >= NOW() - INTERVAL '30 days'
    `;
    return result.rows;
  }

  private static async getUserSuccesses(userId: number): Promise<any[]> {
    const result = await sql`
      SELECT * FROM user_activity_tracking
      WHERE user_id = ${userId}
      AND activity_type IN ('goal_completed', 'date_scheduled', 'match_success')
      AND created_at >= NOW() - INTERVAL '30 days'
    `;
    return result.rows;
  }

  private static getCurrentWeekStart(): string {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(now.setDate(diff));
    return monday.toISOString().split('T')[0];
  }
}