/**
 * AI-Powered Content Recommendation Engine
 * Sprint 5.2: Intelligent content recommendations
 *
 * Strategies:
 * 1. Sequential: Next lessons in enrolled programs
 * 2. Knowledge Gap: Lessons to improve weak areas (low quiz scores)
 * 3. Content-Based: Similar programs to completed ones
 * 4. Collaborative: Popular content among similar users
 * 5. Engagement-Based: Content similar to highly-engaged lessons
 */

import { sql } from '@vercel/postgres';

export interface Recommendation {
  id: string;
  type: 'lesson' | 'program' | 'module';
  title: string;
  description?: string;
  reason: string; // Why this is recommended
  confidence: number; // 0-100
  metadata?: {
    program_slug?: string;
    module_id?: number;
    lesson_id?: number;
    estimated_time?: number;
    difficulty?: string;
  };
}

interface UserProfile {
  userId: number;
  completedLessons: number[];
  enrolledPrograms: number[];
  avgQuizScore: number;
  weakTopics: string[];
  learningSpeed: 'fast' | 'average' | 'slow';
  lastActiveDate: Date;
}

/**
 * Get user profile for recommendations
 */
async function getUserProfile(userId: number): Promise<UserProfile> {
  // Get completed lessons
  const completedLessonsResult = await sql`
    SELECT lesson_id
    FROM user_lesson_progress
    WHERE user_id = ${userId} AND is_completed = true
  `;
  const completedLessons = completedLessonsResult.rows.map(r => parseInt(r.lesson_id));

  // Get enrolled programs
  const enrolledProgramsResult = await sql`
    SELECT program_id
    FROM program_enrollments
    WHERE user_id = ${userId} AND status = 'active'
  `;
  const enrolledPrograms = enrolledProgramsResult.rows.map(r => parseInt(r.program_id));

  // Get average quiz score
  const quizScoreResult = await sql`
    SELECT AVG(quiz_score) as avg_score
    FROM user_lesson_progress ulp
    JOIN lessons l ON l.id = ulp.lesson_id
    WHERE ulp.user_id = ${userId}
      AND l.content_type = 'quiz'
      AND ulp.quiz_score IS NOT NULL
  `;
  const avgQuizScore = quizScoreResult.rows[0]?.avg_score || 0;

  // Get weak topics (quiz scores < 70)
  const weakTopicsResult = await sql`
    SELECT DISTINCT pm.title as topic
    FROM user_lesson_progress ulp
    JOIN lessons l ON l.id = ulp.lesson_id
    JOIN program_modules pm ON pm.id = l.module_id
    WHERE ulp.user_id = ${userId}
      AND l.content_type = 'quiz'
      AND ulp.quiz_score < 70
    LIMIT 5
  `;
  const weakTopics = weakTopicsResult.rows.map(r => r.topic);

  // Calculate learning speed
  const speedResult = await sql`
    SELECT
      COALESCE(AVG(ulp.watch_time_seconds), 0) as avg_time
    FROM user_lesson_progress ulp
    WHERE ulp.user_id = ${userId} AND ulp.is_completed = true
  `;
  const avgTime = parseInt(speedResult.rows[0]?.avg_time || 600);
  let learningSpeed: 'fast' | 'average' | 'slow' = 'average';
  if (avgTime < 600) learningSpeed = 'fast';
  else if (avgTime > 1200) learningSpeed = 'slow';

  // Get last active date
  const lastActiveResult = await sql`
    SELECT MAX(completed_at) as last_active
    FROM user_lesson_progress
    WHERE user_id = ${userId}
  `;
  const lastActiveDate = lastActiveResult.rows[0]?.last_active || new Date();

  return {
    userId,
    completedLessons,
    enrolledPrograms,
    avgQuizScore: parseFloat(avgQuizScore),
    weakTopics,
    learningSpeed,
    lastActiveDate: new Date(lastActiveDate)
  };
}

/**
 * Strategy 1: Sequential Recommendations
 * Recommend next lessons in enrolled programs
 */
async function getSequentialRecommendations(profile: UserProfile): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = [];

  for (const programId of profile.enrolledPrograms) {
    const nextLessonResult = await sql`
      SELECT
        l.id,
        l.title,
        l.description,
        l.estimated_duration_minutes,
        l.difficulty_level,
        pm.title as module_title,
        pm.order_index as module_order,
        l.order_index as lesson_order,
        p.slug as program_slug
      FROM lessons l
      JOIN program_modules pm ON pm.id = l.module_id
      JOIN programs p ON p.id = pm.program_id
      WHERE pm.program_id = ${programId}
        AND l.is_published = true
        AND l.id NOT IN (
          SELECT lesson_id
          FROM user_lesson_progress
          WHERE user_id = ${profile.userId} AND is_completed = true
        )
      ORDER BY pm.order_index ASC, l.order_index ASC
      LIMIT 3
    `;

    for (const lesson of nextLessonResult.rows) {
      recommendations.push({
        id: `lesson-${lesson.id}`,
        type: 'lesson',
        title: lesson.title,
        description: lesson.description,
        reason: `Volgende stap in ${lesson.module_title}`,
        confidence: 95,
        metadata: {
          program_slug: lesson.program_slug,
          lesson_id: parseInt(lesson.id),
          estimated_time: parseInt(lesson.estimated_duration_minutes) || 15,
          difficulty: lesson.difficulty_level
        }
      });
    }
  }

  return recommendations;
}

/**
 * Strategy 2: Knowledge Gap Recommendations
 * Recommend lessons to improve weak areas
 */
async function getKnowledgeGapRecommendations(profile: UserProfile): Promise<Recommendation[]> {
  if (profile.weakTopics.length === 0) return [];

  const recommendations: Recommendation[] = [];

  // Find review lessons or related content for weak topics
  const gapLessonsResult = await sql`
    SELECT
      l.id,
      l.title,
      l.description,
      l.estimated_duration_minutes,
      pm.title as module_title,
      p.slug as program_slug,
      p.title as program_title
    FROM lessons l
    JOIN program_modules pm ON pm.id = l.module_id
    JOIN programs p ON p.id = pm.program_id
    WHERE l.is_published = true
      AND l.id NOT IN (
        SELECT lesson_id
        FROM user_lesson_progress
        WHERE user_id = ${profile.userId} AND is_completed = true
      )
      AND (
        l.title ILIKE '%' || ${profile.weakTopics[0]} || '%'
        OR pm.title ILIKE '%' || ${profile.weakTopics[0]} || '%'
      )
    LIMIT 2
  `;

  for (const lesson of gapLessonsResult.rows) {
    recommendations.push({
      id: `gap-${lesson.id}`,
      type: 'lesson',
      title: lesson.title,
      description: lesson.description,
      reason: `Verbeter je kennis in ${lesson.module_title}`,
      confidence: 80,
      metadata: {
        program_slug: lesson.program_slug,
        lesson_id: parseInt(lesson.id),
        estimated_time: parseInt(lesson.estimated_duration_minutes) || 15
      }
    });
  }

  return recommendations;
}

/**
 * Strategy 3: Content-Based Recommendations
 * Recommend programs similar to completed/enrolled ones
 */
async function getContentBasedRecommendations(profile: UserProfile): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = [];

  if (profile.enrolledPrograms.length === 0) return recommendations;

  // Find programs with similar tags/categories
  const similarProgramsResult = await sql`
    SELECT
      p.id,
      p.title,
      p.description,
      p.slug,
      p.difficulty_level,
      COUNT(pe.user_id) as enrollment_count
    FROM programs p
    LEFT JOIN program_enrollments pe ON pe.program_id = p.id
    WHERE p.is_published = true
      AND p.id NOT IN (
        SELECT program_id
        FROM program_enrollments
        WHERE user_id = ${profile.userId}
      )
      AND p.difficulty_level = (
        SELECT difficulty_level
        FROM programs
        WHERE id = ${profile.enrolledPrograms[0]}
      )
    GROUP BY p.id, p.title, p.description, p.slug, p.difficulty_level
    ORDER BY enrollment_count DESC
    LIMIT 2
  `;

  for (const program of similarProgramsResult.rows) {
    recommendations.push({
      id: `program-${program.id}`,
      type: 'program',
      title: program.title,
      description: program.description,
      reason: 'Populair programma op jouw niveau',
      confidence: 70,
      metadata: {
        program_slug: program.slug,
        difficulty: program.difficulty_level
      }
    });
  }

  return recommendations;
}

/**
 * Strategy 4: Collaborative Filtering
 * Recommend based on what similar users completed
 */
async function getCollaborativeRecommendations(profile: UserProfile): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = [];

  // Find users with similar progress
  const similarUsersResult = await sql`
    SELECT DISTINCT ulp2.user_id
    FROM user_lesson_progress ulp1
    JOIN user_lesson_progress ulp2 ON ulp2.lesson_id = ulp1.lesson_id
    WHERE ulp1.user_id = ${profile.userId}
      AND ulp2.user_id != ${profile.userId}
      AND ulp1.is_completed = true
      AND ulp2.is_completed = true
    GROUP BY ulp2.user_id
    HAVING COUNT(*) >= 3
    LIMIT 10
  `;

  if (similarUsersResult.rows.length === 0) return recommendations;

  const similarUserIds = similarUsersResult.rows.map(r => parseInt(r.user_id));

  // Find lessons completed by similar users but not by current user
  const collaborativeLessonsResult = await sql`
    SELECT
      l.id,
      l.title,
      l.description,
      l.estimated_duration_minutes,
      pm.title as module_title,
      p.slug as program_slug,
      COUNT(DISTINCT ulp.user_id) as completed_by_similar_users
    FROM lessons l
    JOIN program_modules pm ON pm.id = l.module_id
    JOIN programs p ON p.id = pm.program_id
    JOIN user_lesson_progress ulp ON ulp.lesson_id = l.id
    WHERE l.is_published = true
      AND ulp.user_id = ANY(${similarUserIds})
      AND ulp.is_completed = true
      AND l.id NOT IN (
        SELECT lesson_id
        FROM user_lesson_progress
        WHERE user_id = ${profile.userId} AND is_completed = true
      )
    GROUP BY l.id, l.title, l.description, l.estimated_duration_minutes, pm.title, p.slug
    ORDER BY completed_by_similar_users DESC
    LIMIT 2
  `;

  for (const lesson of collaborativeLessonsResult.rows) {
    recommendations.push({
      id: `collab-${lesson.id}`,
      type: 'lesson',
      title: lesson.title,
      description: lesson.description,
      reason: `Populair bij gebruikers zoals jij`,
      confidence: 75,
      metadata: {
        program_slug: lesson.program_slug,
        lesson_id: parseInt(lesson.id),
        estimated_time: parseInt(lesson.estimated_duration_minutes) || 15
      }
    });
  }

  return recommendations;
}

/**
 * Main recommendation function
 * Combines all strategies and ranks recommendations
 */
export async function generateRecommendations(userId: number, limit: number = 10): Promise<Recommendation[]> {
  try {
    // Get user profile
    const profile = await getUserProfile(userId);

    // Get recommendations from all strategies
    const [sequential, knowledgeGap, contentBased, collaborative] = await Promise.all([
      getSequentialRecommendations(profile),
      getKnowledgeGapRecommendations(profile),
      getContentBasedRecommendations(profile),
      getCollaborativeRecommendations(profile)
    ]);

    // Combine all recommendations
    const allRecommendations = [
      ...sequential,
      ...knowledgeGap,
      ...contentBased,
      ...collaborative
    ];

    // Remove duplicates (same ID)
    const uniqueRecommendations = Array.from(
      new Map(allRecommendations.map(rec => [rec.id, rec])).values()
    );

    // Sort by confidence score (descending)
    uniqueRecommendations.sort((a, b) => b.confidence - a.confidence);

    // Return top N recommendations
    return uniqueRecommendations.slice(0, limit);

  } catch (error) {
    console.error('Error generating recommendations:', error);
    return [];
  }
}

/**
 * Get personalized learning insights
 */
export async function getLearningInsights(userId: number): Promise<{
  strengths: string[];
  improvements: string[];
  next_milestone: string;
}> {
  try {
    const profile = await getUserProfile(userId);

    // Identify strengths (high quiz scores)
    const strengthsResult = await sql`
      SELECT DISTINCT pm.title as topic
      FROM user_lesson_progress ulp
      JOIN lessons l ON l.id = ulp.lesson_id
      JOIN program_modules pm ON pm.id = l.module_id
      WHERE ulp.user_id = ${userId}
        AND l.content_type = 'quiz'
        AND ulp.quiz_score >= 80
      LIMIT 3
    `;
    const strengths = strengthsResult.rows.map(r => r.topic);

    // Improvements = weak topics
    const improvements = profile.weakTopics.slice(0, 3);

    // Next milestone
    const completionPercentage = Math.round(
      (profile.completedLessons.length / Math.max(profile.completedLessons.length + 10, 1)) * 100
    );
    let next_milestone = 'Voltooi je eerste les';
    if (completionPercentage >= 75) {
      next_milestone = 'Bijna klaar met je programma!';
    } else if (completionPercentage >= 50) {
      next_milestone = 'Halverwege je leertraject';
    } else if (completionPercentage >= 25) {
      next_milestone = 'Een kwart van je reis voltooid';
    }

    return {
      strengths: strengths.length > 0 ? strengths : ['Je bent net begonnen!'],
      improvements: improvements.length > 0 ? improvements : ['Blijf oefenen en groeien'],
      next_milestone
    };

  } catch (error) {
    console.error('Error getting learning insights:', error);
    return {
      strengths: [],
      improvements: [],
      next_milestone: 'Start je leerreis vandaag'
    };
  }
}
