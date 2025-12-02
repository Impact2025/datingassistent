/**
 * Progress Insights & Prediction System
 * Sprint 5.3: Predictive analytics for learning progress
 *
 * Features:
 * - Completion date predictions
 * - Learning pattern analysis
 * - Optimal study schedule suggestions
 * - Milestone projections
 * - Personalized learning tips
 */

import { sql } from '@vercel/postgres';

export interface ProgressPrediction {
  program_id: number;
  program_title: string;
  current_progress_percentage: number;
  lessons_completed: number;
  lessons_remaining: number;
  estimated_completion_date: string;
  days_until_completion: number;
  confidence_level: 'high' | 'medium' | 'low';
}

export interface LearningPattern {
  best_time_of_day: string; // 'morning' | 'afternoon' | 'evening' | 'night'
  most_productive_day: string; // 'Monday' | 'Tuesday' | etc.
  average_session_duration_minutes: number;
  preferred_content_type: string; // 'video' | 'text' | 'quiz' | 'mixed'
  consistency_score: number; // 0-100
  streak_potential: number; // 0-100, likelihood of maintaining streak
}

export interface OptimalSchedule {
  recommended_study_times: Array<{
    day: string;
    time: string;
    duration_minutes: number;
    reason: string;
  }>;
  weekly_goal_minutes: number;
  lessons_per_week: number;
}

export interface MilestoneProjection {
  milestone: string;
  estimated_date: string;
  confidence: number;
  description: string;
}

export interface LearningTip {
  category: 'motivation' | 'efficiency' | 'retention' | 'engagement';
  tip: string;
  priority: 'high' | 'medium' | 'low';
}

/**
 * Predict completion dates for active programs
 */
export async function predictProgramCompletion(userId: number): Promise<ProgressPrediction[]> {
  try {
    // Get active program enrollments with progress
    const programsResult = await sql`
      SELECT
        p.id,
        p.title,
        COUNT(DISTINCT l.id) as total_lessons,
        COUNT(DISTINCT CASE WHEN ulp.is_completed = true THEN l.id END) as completed_lessons,
        COALESCE(AVG(ulp.watch_time_seconds), 0) as avg_lesson_time_seconds,
        COUNT(DISTINCT DATE(ulp.completed_at)) as days_active
      FROM programs p
      JOIN program_enrollments pe ON pe.program_id = p.id
      JOIN program_modules pm ON pm.program_id = p.id
      JOIN lessons l ON l.module_id = pm.id
      LEFT JOIN user_lesson_progress ulp ON ulp.lesson_id = l.id AND ulp.user_id = ${userId}
      WHERE pe.user_id = ${userId}
        AND pe.status = 'active'
        AND l.is_published = true
      GROUP BY p.id, p.title
      HAVING COUNT(DISTINCT l.id) > 0
    `;

    const predictions: ProgressPrediction[] = [];

    for (const program of programsResult.rows) {
      const totalLessons = parseInt(program.total_lessons);
      const completedLessons = parseInt(program.completed_lessons);
      const lessonsRemaining = totalLessons - completedLessons;
      const progressPercentage = Math.round((completedLessons / totalLessons) * 100);

      if (lessonsRemaining === 0) continue; // Already completed

      // Calculate average time per lesson (in days)
      const daysActive = parseInt(program.days_active) || 1;
      const lessonsPerDay = completedLessons / daysActive;

      // Predict days until completion
      let daysUntilCompletion = lessonsRemaining / Math.max(lessonsPerDay, 0.2); // Min 0.2 lessons/day
      daysUntilCompletion = Math.ceil(daysUntilCompletion);

      // Calculate completion date
      const estimatedCompletionDate = new Date();
      estimatedCompletionDate.setDate(estimatedCompletionDate.getDate() + daysUntilCompletion);

      // Determine confidence level
      let confidenceLevel: 'high' | 'medium' | 'low' = 'medium';
      if (completedLessons >= 5 && daysActive >= 3) {
        confidenceLevel = 'high';
      } else if (completedLessons < 2 || daysActive < 2) {
        confidenceLevel = 'low';
      }

      predictions.push({
        program_id: parseInt(program.id),
        program_title: program.title,
        current_progress_percentage: progressPercentage,
        lessons_completed: completedLessons,
        lessons_remaining: lessonsRemaining,
        estimated_completion_date: estimatedCompletionDate.toISOString().split('T')[0],
        days_until_completion: daysUntilCompletion,
        confidence_level: confidenceLevel
      });
    }

    return predictions;

  } catch (error) {
    console.error('Error predicting program completion:', error);
    return [];
  }
}

/**
 * Analyze learning patterns
 */
export async function analyzeLearningPatterns(userId: number): Promise<LearningPattern | null> {
  try {
    // Get lesson completion data with timestamps
    const activityResult = await sql`
      SELECT
        ulp.completed_at,
        ulp.watch_time_seconds,
        l.content_type,
        EXTRACT(HOUR FROM ulp.completed_at) as hour_of_day,
        TO_CHAR(ulp.completed_at, 'Day') as day_of_week,
        DATE(ulp.completed_at) as completion_date
      FROM user_lesson_progress ulp
      JOIN lessons l ON l.id = ulp.lesson_id
      WHERE ulp.user_id = ${userId}
        AND ulp.is_completed = true
        AND ulp.completed_at >= NOW() - INTERVAL '30 days'
      ORDER BY ulp.completed_at DESC
      LIMIT 100
    `;

    if (activityResult.rows.length === 0) return null;

    // Analyze time of day
    const timeOfDayCount: { [key: string]: number } = {
      morning: 0,   // 6-12
      afternoon: 0, // 12-18
      evening: 0,   // 18-22
      night: 0      // 22-6
    };

    // Analyze day of week
    const dayCount: { [key: string]: number } = {};

    // Analyze content type
    const contentTypeCount: { [key: string]: number } = {};

    // Analyze session duration
    let totalWatchTime = 0;
    const uniqueDates = new Set<string>();

    for (const row of activityResult.rows) {
      const hour = parseInt(row.hour_of_day);
      const day = row.day_of_week.trim();
      const contentType = row.content_type;
      const watchTime = parseInt(row.watch_time_seconds) || 0;
      const date = row.completion_date;

      // Time of day
      if (hour >= 6 && hour < 12) timeOfDayCount.morning++;
      else if (hour >= 12 && hour < 18) timeOfDayCount.afternoon++;
      else if (hour >= 18 && hour < 22) timeOfDayCount.evening++;
      else timeOfDayCount.night++;

      // Day of week
      dayCount[day] = (dayCount[day] || 0) + 1;

      // Content type
      contentTypeCount[contentType] = (contentTypeCount[contentType] || 0) + 1;

      // Watch time and unique dates
      totalWatchTime += watchTime;
      uniqueDates.add(date);
    }

    // Find best time of day
    const bestTimeOfDay = Object.entries(timeOfDayCount).reduce((a, b) =>
      a[1] > b[1] ? a : b
    )[0];

    // Find most productive day
    const mostProductiveDay = Object.entries(dayCount).reduce((a, b) =>
      a[1] > b[1] ? a : b
    )[0];

    // Calculate average session duration
    const avgSessionDuration = Math.round(totalWatchTime / activityResult.rows.length / 60);

    // Determine preferred content type
    const preferredContentType = Object.entries(contentTypeCount).reduce((a, b) =>
      a[1] > b[1] ? a : b
    )[0];

    // Calculate consistency score (0-100)
    const daysWithActivity = uniqueDates.size;
    const totalDaysInPeriod = 30;
    const consistencyScore = Math.min(Math.round((daysWithActivity / totalDaysInPeriod) * 100), 100);

    // Calculate streak potential (based on recent activity)
    const recentDays = Array.from(uniqueDates).sort().reverse().slice(0, 7);
    let consecutiveDays = 0;
    for (let i = 0; i < recentDays.length - 1; i++) {
      const diff = Math.abs(
        new Date(recentDays[i]).getTime() - new Date(recentDays[i + 1]).getTime()
      ) / (1000 * 60 * 60 * 24);
      if (diff <= 1) consecutiveDays++;
      else break;
    }
    const streakPotential = Math.min(Math.round((consecutiveDays / 7) * 100), 100);

    return {
      best_time_of_day: bestTimeOfDay,
      most_productive_day: mostProductiveDay,
      average_session_duration_minutes: avgSessionDuration,
      preferred_content_type: preferredContentType,
      consistency_score: consistencyScore,
      streak_potential: streakPotential
    };

  } catch (error) {
    console.error('Error analyzing learning patterns:', error);
    return null;
  }
}

/**
 * Generate optimal study schedule
 */
export async function generateOptimalSchedule(
  userId: number,
  targetHoursPerWeek: number = 3
): Promise<OptimalSchedule> {
  try {
    const patterns = await analyzeLearningPatterns(userId);

    if (!patterns) {
      // Default schedule for new users
      return {
        recommended_study_times: [
          { day: 'Monday', time: '19:00', duration_minutes: 30, reason: 'Start de week sterk' },
          { day: 'Wednesday', time: '19:00', duration_minutes: 30, reason: 'Midden van de week boost' },
          { day: 'Saturday', time: '10:00', duration_minutes: 60, reason: 'Weekend focus tijd' }
        ],
        weekly_goal_minutes: targetHoursPerWeek * 60,
        lessons_per_week: 3
      };
    }

    // Generate personalized schedule based on patterns
    const sessionsPerWeek = Math.ceil((targetHoursPerWeek * 60) / patterns.average_session_duration_minutes);
    const minutesPerSession = Math.round((targetHoursPerWeek * 60) / sessionsPerWeek);

    const timeMapping: { [key: string]: string } = {
      morning: '09:00',
      afternoon: '14:00',
      evening: '19:00',
      night: '21:00'
    };

    const recommendedTime = timeMapping[patterns.best_time_of_day] || '19:00';

    const schedule: OptimalSchedule = {
      recommended_study_times: [
        {
          day: patterns.most_productive_day,
          time: recommendedTime,
          duration_minutes: minutesPerSession,
          reason: `Jouw meest productieve dag en tijd`
        },
        {
          day: 'Wednesday',
          time: recommendedTime,
          duration_minutes: minutesPerSession,
          reason: 'Consistentie midden in de week'
        },
        {
          day: 'Saturday',
          time: recommendedTime,
          duration_minutes: minutesPerSession,
          reason: 'Weekend consolidatie'
        }
      ].slice(0, sessionsPerWeek),
      weekly_goal_minutes: targetHoursPerWeek * 60,
      lessons_per_week: sessionsPerWeek
    };

    return schedule;

  } catch (error) {
    console.error('Error generating optimal schedule:', error);
    return {
      recommended_study_times: [],
      weekly_goal_minutes: 180,
      lessons_per_week: 3
    };
  }
}

/**
 * Project future milestones
 */
export async function projectMilestones(userId: number): Promise<MilestoneProjection[]> {
  try {
    const predictions = await predictProgramCompletion(userId);
    const milestones: MilestoneProjection[] = [];

    for (const pred of predictions) {
      // 50% completion milestone
      if (pred.current_progress_percentage < 50) {
        const lessonsTo50 = Math.ceil((pred.lessons_completed + pred.lessons_remaining) * 0.5) - pred.lessons_completed;
        const daysTo50 = Math.ceil((lessonsTo50 / pred.lessons_remaining) * pred.days_until_completion);
        const date50 = new Date();
        date50.setDate(date50.getDate() + daysTo50);

        milestones.push({
          milestone: `50% van ${pred.program_title}`,
          estimated_date: date50.toISOString().split('T')[0],
          confidence: pred.confidence_level === 'high' ? 85 : pred.confidence_level === 'medium' ? 70 : 50,
          description: 'Halverwege je leertraject'
        });
      }

      // 100% completion milestone
      milestones.push({
        milestone: `Voltooien van ${pred.program_title}`,
        estimated_date: pred.estimated_completion_date,
        confidence: pred.confidence_level === 'high' ? 90 : pred.confidence_level === 'medium' ? 75 : 55,
        description: 'Programma succesvol afgerond'
      });
    }

    return milestones.sort((a, b) =>
      new Date(a.estimated_date).getTime() - new Date(b.estimated_date).getTime()
    );

  } catch (error) {
    console.error('Error projecting milestones:', error);
    return [];
  }
}

/**
 * Generate personalized learning tips
 */
export async function generateLearningTips(userId: number): Promise<LearningTip[]> {
  try {
    const patterns = await analyzeLearningPatterns(userId);
    const tips: LearningTip[] = [];

    if (!patterns) {
      // Default tips for new users
      return [
        {
          category: 'motivation',
          tip: 'Begin met kleine stappen: 15 minuten per dag is genoeg om te starten',
          priority: 'high'
        },
        {
          category: 'efficiency',
          tip: 'Kies een vaste tijd om te leren voor betere consistency',
          priority: 'high'
        }
      ];
    }

    // Consistency tips
    if (patterns.consistency_score < 50) {
      tips.push({
        category: 'engagement',
        tip: 'Probeer elke dag een klein beetje te leren, zelfs 10 minuten helpt voor consistentie',
        priority: 'high'
      });
    }

    // Streak tips
    if (patterns.streak_potential < 60) {
      tips.push({
        category: 'motivation',
        tip: 'Bouw aan je streak! Dagelijkse activiteit vergroot je kans op succes met 40%',
        priority: 'medium'
      });
    }

    // Time optimization
    if (patterns.average_session_duration_minutes < 15) {
      tips.push({
        category: 'efficiency',
        tip: 'Overweeg langere sessies (20-30 min) voor diepere focus en betere retentie',
        priority: 'medium'
      });
    } else if (patterns.average_session_duration_minutes > 60) {
      tips.push({
        category: 'retention',
        tip: 'Splits lange sessies op in kortere blokken met pauzes voor betere retentie',
        priority: 'low'
      });
    }

    // Content diversity
    if (patterns.preferred_content_type === 'video') {
      tips.push({
        category: 'retention',
        tip: 'Probeer ook quizzes te maken na video\'s om je kennis te versterken',
        priority: 'medium'
      });
    }

    // Always add a positive reinforcement tip
    tips.push({
      category: 'motivation',
      tip: `Je bent het meest productief op ${patterns.most_productive_day}. Plan je belangrijkste lessen op deze dag!`,
      priority: 'high'
    });

    return tips.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

  } catch (error) {
    console.error('Error generating learning tips:', error);
    return [];
  }
}
