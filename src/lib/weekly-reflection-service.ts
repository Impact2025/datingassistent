/**
 * Weekly Reflection Service - AI-powered progress reviews and goal adjustments
 * Helps users reflect on their week, celebrate wins, and plan ahead
 */

import { sql } from '@vercel/postgres';
import { chatCompletion } from './ai-service';
import { createNotification } from './in-app-notification-service';

export interface WeeklyReflection {
  userId: number;
  weekStart: Date;
  weekEnd: Date;
  whatWentWell: string[];
  whatChallenged: string[];
  keyLearnings: string[];
  goalProgress: {
    goalId: number;
    goalTitle: string;
    progress: number;
    target: number;
    status: 'on_track' | 'behind' | 'ahead' | 'completed';
  }[];
  nextWeekFocus: string[];
  aiInsights: string[];
  aiRecommendations: string[];
  overallSentiment: 'very_positive' | 'positive' | 'neutral' | 'challenging' | 'difficult';
  completedAt?: Date;
}

export interface WeeklyReviewData {
  userId: number;
  weekStart: string;
  weekEnd: string;
  activitiesCompleted: number;
  goalsWorkedOn: number;
  newConnections: number;
  messagesSent: number;
  datesScheduled: number;
  profileViews: number;
  responseRate: number;
  averageSentiment: number;
}

export class WeeklyReflectionService {
  /**
   * Generate weekly review data from user activity
   */
  static async generateWeeklyReviewData(userId: number, weekStart: Date): Promise<WeeklyReviewData> {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    try {
      // Get activity data for the week
      const activityResult = await sql`
        SELECT
          COUNT(CASE WHEN activity_type IN ('goal_progress', 'course_completed', 'profile_updated') THEN 1 END) as activities_completed,
          COUNT(CASE WHEN activity_type = 'goal_progress' THEN 1 END) as goals_worked_on,
          COUNT(CASE WHEN activity_type = 'message_sent' THEN 1 END) as messages_sent,
          COUNT(CASE WHEN activity_type = 'date_scheduled' THEN 1 END) as dates_scheduled
        FROM user_activity_log
        WHERE user_id = ${userId}
          AND created_at >= ${weekStart}
          AND created_at <= ${weekEnd}
      `;

      // Mock additional data (would come from actual tracking)
      const reviewData: WeeklyReviewData = {
        userId,
        weekStart: weekStart.toISOString().split('T')[0],
        weekEnd: weekEnd.toISOString().split('T')[0],
        activitiesCompleted: parseInt(activityResult.rows[0].activities_completed),
        goalsWorkedOn: parseInt(activityResult.rows[0].goals_worked_on),
        newConnections: Math.floor(Math.random() * 5), // Mock
        messagesSent: parseInt(activityResult.rows[0].messages_sent),
        datesScheduled: parseInt(activityResult.rows[0].dates_scheduled),
        profileViews: Math.floor(Math.random() * 20) + 5, // Mock
        responseRate: Math.random() * 0.4 + 0.3, // 30-70%
        averageSentiment: Math.random() * 0.6 + 0.4 // 0.4-1.0
      };

      return reviewData;
    } catch (error) {
      console.error('Error generating weekly review data:', error);
      // Return minimal data on error
      return {
        userId,
        weekStart: weekStart.toISOString().split('T')[0],
        weekEnd: weekEnd.toISOString().split('T')[0],
        activitiesCompleted: 0,
        goalsWorkedOn: 0,
        newConnections: 0,
        messagesSent: 0,
        datesScheduled: 0,
        profileViews: 0,
        responseRate: 0,
        averageSentiment: 0.5
      };
    }
  }

  /**
   * Generate AI-powered weekly reflection insights
   */
  static async generateWeeklyInsights(userId: number, reviewData: WeeklyReviewData): Promise<{
    insights: string[];
    recommendations: string[];
    sentiment: WeeklyReflection['overallSentiment'];
  }> {
    try {
      const prompt = `Analyseer deze weekly review data en geef inzichten en aanbevelingen:

WEEK DATA:
- Activiteiten voltooid: ${reviewData.activitiesCompleted}
- Doelen gewerkt aan: ${reviewData.goalsWorkedOn}
- Nieuwe connecties: ${reviewData.newConnections}
- Berichten verstuurd: ${reviewData.messagesSent}
- Dates gepland: ${reviewData.datesScheduled}
- Profiel views: ${reviewData.profileViews}
- Response rate: ${(reviewData.responseRate * 100).toFixed(1)}%
- Gemiddelde sentiment: ${reviewData.averageSentiment.toFixed(2)}

Geef een analyse in JSON format:
{
  "insights": ["3-5 key insights about their progress"],
  "recommendations": ["3-5 specific recommendations for next week"],
  "sentiment": "very_positive|positive|neutral|challenging|difficult"
}

Maak het persoonlijk, motiverend en actionable. Focus op patronen en volgende stappen.`;

      const response = await chatCompletion([
        {
          role: 'system',
          content: 'Je bent een dating coach die wekelijkse reviews analyseert en motiverende inzichten geeft.'
        },
        {
          role: 'user',
          content: prompt
        }
      ], { maxTokens: 800, temperature: 0.7 });

      const parsed = JSON.parse(response);
      return {
        insights: parsed.insights || [],
        recommendations: parsed.recommendations || [],
        sentiment: parsed.sentiment || 'neutral'
      };

    } catch (error) {
      console.error('Error generating weekly insights:', error);
      return {
        insights: [
          'Je bent consistent actief geweest deze week',
          'Focus op kwaliteit boven kwantiteit bij berichten',
          'Bouw voort op je sterke punten'
        ],
        recommendations: [
          'Stuur deze week 3 berichten naar matches',
          'Update je profiel foto',
          'Plan 1 date voor volgende week'
        ],
        sentiment: 'positive'
      };
    }
  }

  /**
   * Save weekly reflection
   */
  static async saveWeeklyReflection(
    userId: number,
    reflection: Omit<WeeklyReflection, 'userId'>
  ): Promise<boolean> {
    try {
      await sql`
        INSERT INTO weekly_reflections (
          user_id, week_start, week_end, what_went_well, what_challenged,
          key_learnings, goal_progress, next_week_focus, ai_insights,
          ai_recommendations, overall_sentiment, completed_at
        )
        VALUES (
          ${userId}, ${reflection.weekStart}, ${reflection.weekEnd},
          ${reflection.whatWentWell}, ${reflection.whatChallenged},
          ${reflection.keyLearnings}, ${JSON.stringify(reflection.goalProgress)},
          ${reflection.nextWeekFocus}, ${reflection.aiInsights},
          ${reflection.aiRecommendations}, ${reflection.overallSentiment},
          ${reflection.completedAt || new Date()}
        )
        ON CONFLICT (user_id, week_start)
        DO UPDATE SET
          what_went_well = ${reflection.whatWentWell},
          what_challenged = ${reflection.whatChallenged},
          key_learnings = ${reflection.keyLearnings},
          goal_progress = ${JSON.stringify(reflection.goalProgress)},
          next_week_focus = ${reflection.nextWeekFocus},
          ai_insights = ${reflection.aiInsights},
          ai_recommendations = ${reflection.aiRecommendations},
          overall_sentiment = ${reflection.overallSentiment},
          completed_at = ${reflection.completedAt || new Date()}
      `;

      return true;
    } catch (error) {
      console.error('Error saving weekly reflection:', error);
      return false;
    }
  }

  /**
   * Get user's weekly reflections
   */
  static async getWeeklyReflections(
    userId: number,
    limit: number = 12
  ): Promise<WeeklyReflection[]> {
    try {
      const result = await sql`
        SELECT * FROM weekly_reflections
        WHERE user_id = ${userId}
        ORDER BY week_start DESC
        LIMIT ${limit}
      `;

      return result.rows.map(row => ({
        userId: row.user_id,
        weekStart: new Date(row.week_start),
        weekEnd: new Date(row.week_end),
        whatWentWell: row.what_went_well || [],
        whatChallenged: row.what_challenged || [],
        keyLearnings: row.key_learnings || [],
        goalProgress: row.goal_progress || [],
        nextWeekFocus: row.next_week_focus || [],
        aiInsights: row.ai_insights || [],
        aiRecommendations: row.ai_recommendations || [],
        overallSentiment: row.overall_sentiment,
        completedAt: row.completed_at
      }));
    } catch (error) {
      console.error('Error getting weekly reflections:', error);
      return [];
    }
  }

  /**
   * Generate weekly reflection prompt for user
   */
  static async generateReflectionPrompt(userId: number, weekStart: Date): Promise<{
    prompt: string;
    suggestedQuestions: string[];
  }> {
    try {
      const reviewData = await this.generateWeeklyReviewData(userId, weekStart);
      const insights = await this.generateWeeklyInsights(userId, reviewData);

      const prompt = `**Jouw Week Review: ${weekStart.toLocaleDateString('nl-NL')} - ${(new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000)).toLocaleDateString('nl-NL')}**

Deze week heb je:
- ${reviewData.activitiesCompleted} activiteiten voltooid
- ${reviewData.messagesSent} berichten verstuurd
- ${reviewData.datesScheduled} dates gepland
- ${reviewData.newConnections} nieuwe connecties gemaakt

**AI Inzichten:**
${insights.insights.map(insight => `• ${insight}`).join('\n')}

**Aanbevelingen voor volgende week:**
${insights.recommendations.map(rec => `• ${rec}`).join('\n')}

Neem even tijd om terug te kijken op je week. Wat ging goed? Wat heb je geleerd? Wat wil je volgende week anders doen?`;

      const suggestedQuestions = [
        'Wat ging er deze week goed in je dating journey?',
        'Welke uitdagingen heb je tegengekomen?',
        'Wat heb je geleerd over jezelf of dating?',
        'Hoe voelde je je over het algemeen deze week?',
        'Wat wil je volgende week bereiken?',
        'Welke doelen wil je aanpassen?'
      ];

      return { prompt, suggestedQuestions };
    } catch (error) {
      console.error('Error generating reflection prompt:', error);
      return {
        prompt: 'Neem tijd om terug te kijken op je week. Wat ging goed? Wat heb je geleerd?',
        suggestedQuestions: [
          'Wat ging er goed deze week?',
          'Wat was uitdagend?',
          'Wat heb je geleerd?',
          'Wat wil je volgende week doen?'
        ]
      };
    }
  }

  /**
   * Schedule weekly reflection reminders
   */
  static async scheduleWeeklyReflections(): Promise<number> {
    try {
      // Get all active users
      const usersResult = await sql`
        SELECT id FROM users
        WHERE subscription_status = 'active'
        LIMIT 1000
      `;

      let scheduled = 0;

      for (const user of usersResult.rows) {
        try {
          // Schedule for Friday evening (user timezone)
          const scheduledTime = new Date();
          scheduledTime.setDate(scheduledTime.getDate() + (5 - scheduledTime.getDay())); // Next Friday
          scheduledTime.setHours(19, 0, 0, 0); // 7 PM

          await createNotification({
            userId: user.id,
            title: '📝 Wekelijkse Reflectie',
            message: 'Tijd om terug te kijken op je week! Wat ging goed en wat wil je volgende week verbeteren?',
            type: 'info',
            actionUrl: '/journey/weekly-reflection',
            actionText: 'Start Reflectie',
            expiresAt: new Date(scheduledTime.getTime() + 2 * 24 * 60 * 60 * 1000) // Expires in 2 days
          });

          scheduled++;
        } catch (error) {
          console.error(`Error scheduling weekly reflection for user ${user.id}:`, error);
        }
      }

      console.log(`Scheduled ${scheduled} weekly reflection reminders`);
      return scheduled;
    } catch (error) {
      console.error('Error scheduling weekly reflections:', error);
      return 0;
    }
  }

  /**
   * Get weekly reflection statistics
   */
  static async getWeeklyReflectionStats(): Promise<{
    totalReflections: number;
    averageSentiment: number;
    commonThemes: Record<string, number>;
    completionRate: number;
    insightsGenerated: number;
  }> {
    try {
      const statsResult = await sql`
        SELECT
          COUNT(*) as total_reflections,
          AVG(CASE
            WHEN overall_sentiment = 'very_positive' THEN 1.0
            WHEN overall_sentiment = 'positive' THEN 0.75
            WHEN overall_sentiment = 'neutral' THEN 0.5
            WHEN overall_sentiment = 'challenging' THEN 0.25
            ELSE 0.0
          END) as avg_sentiment,
          COUNT(CASE WHEN array_length(ai_insights, 1) > 0 THEN 1 END) as insights_generated
        FROM weekly_reflections
        WHERE completed_at IS NOT NULL
      `;

      // Mock additional data
      const stats = {
        totalReflections: parseInt(statsResult.rows[0].total_reflections),
        averageSentiment: parseFloat(statsResult.rows[0].avg_sentiment) || 0.5,
        commonThemes: {
          'profile_improvement': 45,
          'confidence_building': 38,
          'message_quality': 52,
          'consistency': 41,
          'goal_setting': 33
        },
        completionRate: 68.5, // Mock
        insightsGenerated: parseInt(statsResult.rows[0].insights_generated)
      };

      return stats;
    } catch (error) {
      console.error('Error getting weekly reflection stats:', error);
      return {
        totalReflections: 0,
        averageSentiment: 0.5,
        commonThemes: {},
        completionRate: 0,
        insightsGenerated: 0
      };
    }
  }

  /**
   * Generate personalized next week goals based on reflection
   */
  static async generateNextWeekGoals(
    userId: number,
    reflection: WeeklyReflection
  ): Promise<{
    suggestedGoals: string[];
    focusAreas: string[];
    motivation: string;
  }> {
    try {
      const prompt = `Gebaseerd op deze weekly reflection, stel gepersonaliseerde doelen voor volgende week:

WAT GING GOED:
${reflection.whatWentWell.join(', ')}

UITDAGINGEN:
${reflection.whatChallenged.join(', ')}

LEERPUNTEN:
${reflection.keyLearnings.join(', ')}

VOLGENDE WEEK FOCUS:
${reflection.nextWeekFocus.join(', ')}

SENTIMENT: ${reflection.overallSentiment}

Genereer 4-6 concrete, haalbare doelen voor volgende week. Focus op voortbouwen van successen en aanpakken van uitdagingen.

Format: JSON
{
  "suggestedGoals": ["concrete goal 1", "concrete goal 2", ...],
  "focusAreas": ["key area 1", "key area 2", ...],
  "motivation": "motiverende boodschap voor de gebruiker"
}`;

      const response = await chatCompletion([
        {
          role: 'system',
          content: 'Je bent een dating coach die helpt met het stellen van haalbare wekelijkse doelen gebaseerd op reflecties.'
        },
        {
          role: 'user',
          content: prompt
        }
      ], { maxTokens: 600, temperature: 0.7 });

      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating next week goals:', error);
      return {
        suggestedGoals: [
          'Stuur 3 berichten naar matches',
          'Update profiel met nieuwe foto',
          'Plan 1 date voor volgende week',
          'Lees 1 artikel over dating'
        ],
        focusAreas: ['consistentie', 'zelfvertrouwen', 'actie'],
        motivation: 'Elke stap brengt je dichterbij je doel. Blijf momentum houden!'
      };
    }
  }
}