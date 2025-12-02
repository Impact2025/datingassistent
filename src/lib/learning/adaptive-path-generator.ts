/**
 * Personalized Learning Path Generator
 * Sprint 5.5: Adaptive learning sequences based on user profile
 *
 * Creates custom learning paths that adapt to:
 * - Current skill level
 * - Learning goals
 * - Weaknesses/knowledge gaps
 * - Learning pace and patterns
 * - Past performance
 */

import { sql } from '@vercel/postgres';

export interface LearningPathStep {
  step_number: number;
  type: 'lesson' | 'assessment' | 'practice' | 'review';
  content_id: number;
  content_title: string;
  estimated_duration_minutes: number;
  difficulty_level: string;
  reason: string; // Why this step is recommended
  prerequisites_met: boolean;
}

export interface PersonalizedLearningPath {
  path_id: string;
  user_id: number;
  goal: string;
  total_steps: number;
  estimated_completion_days: number;
  difficulty_progression: 'gradual' | 'steep' | 'adaptive';
  steps: LearningPathStep[];
  created_at: Date;
}

export interface UserLearningProfile {
  userId: number;
  currentLevel: 'beginner' | 'intermediate' | 'advanced';
  learningPace: 'slow' | 'medium' | 'fast';
  strongTopics: string[];
  weakTopics: string[];
  preferredDifficulty: string;
  completedLessons: number[];
  averageQuizScore: number;
}

/**
 * Build user learning profile
 */
async function buildLearningProfile(userId: number): Promise<UserLearningProfile> {
  try {
    // Get completed lessons
    const completedResult = await sql`
      SELECT lesson_id
      FROM user_lesson_progress
      WHERE user_id = ${userId} AND is_completed = true
    `;
    const completedLessons = completedResult.rows.map(r => parseInt(r.lesson_id));

    // Get average quiz score
    const quizResult = await sql`
      SELECT AVG(quiz_score) as avg_score
      FROM user_lesson_progress ulp
      JOIN lessons l ON l.id = ulp.lesson_id
      WHERE ulp.user_id = ${userId}
        AND l.content_type = 'quiz'
        AND ulp.quiz_score IS NOT NULL
    `;
    const avgQuizScore = parseFloat(quizResult.rows[0]?.avg_score || '0');

    // Determine current level based on completed lessons and quiz scores
    let currentLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
    if (completedLessons.length > 10 && avgQuizScore > 70) {
      currentLevel = 'intermediate';
    }
    if (completedLessons.length > 20 && avgQuizScore > 85) {
      currentLevel = 'advanced';
    }

    // Get learning pace from progress predictor
    const paceResult = await sql`
      SELECT
        COALESCE(AVG(ulp.watch_time_seconds), 0) as avg_time
      FROM user_lesson_progress ulp
      WHERE ulp.user_id = ${userId} AND ulp.is_completed = true
    `;
    const avgTime = parseInt(paceResult.rows[0]?.avg_time || 600);
    const learningPace = avgTime < 600 ? 'fast' : avgTime > 1200 ? 'slow' : 'medium';

    // Get strong topics (high quiz scores)
    const strongResult = await sql`
      SELECT DISTINCT pm.title as topic
      FROM user_lesson_progress ulp
      JOIN lessons l ON l.id = ulp.lesson_id
      JOIN program_modules pm ON pm.id = l.module_id
      WHERE ulp.user_id = ${userId}
        AND l.content_type = 'quiz'
        AND ulp.quiz_score >= 80
      LIMIT 3
    `;
    const strongTopics = strongResult.rows.map(r => r.topic);

    // Get weak topics (low quiz scores)
    const weakResult = await sql`
      SELECT DISTINCT pm.title as topic
      FROM user_lesson_progress ulp
      JOIN lessons l ON l.id = ulp.lesson_id
      JOIN program_modules pm ON pm.id = l.module_id
      WHERE ulp.user_id = ${userId}
        AND l.content_type = 'quiz'
        AND ulp.quiz_score < 70
      LIMIT 3
    `;
    const weakTopics = weakResult.rows.map(r => r.topic);

    // Preferred difficulty (based on completion rate at different levels)
    const preferredDifficulty = currentLevel === 'advanced' ? 'advanced' :
                                currentLevel === 'intermediate' ? 'intermediate' : 'beginner';

    return {
      userId,
      currentLevel,
      learningPace,
      strongTopics,
      weakTopics,
      preferredDifficulty,
      completedLessons,
      averageQuizScore: Math.round(avgQuizScore)
    };
  } catch (error) {
    console.error('Error building learning profile:', error);
    return {
      userId,
      currentLevel: 'beginner',
      learningPace: 'medium',
      strongTopics: [],
      weakTopics: [],
      preferredDifficulty: 'beginner',
      completedLessons: [],
      averageQuizScore: 0
    };
  }
}

/**
 * Generate personalized learning path
 */
export async function generatePersonalizedPath(
  userId: number,
  goal: string = 'complete_program',
  programId?: number
): Promise<PersonalizedLearningPath> {
  try {
    const profile = await buildLearningProfile(userId);
    const steps: LearningPathStep[] = [];

    // Strategy 1: Fill knowledge gaps (weak topics)
    if (profile.weakTopics.length > 0) {
      const gapLessonsResult = await sql`
        SELECT
          l.id,
          l.title,
          l.estimated_duration_minutes,
          l.difficulty_level,
          pm.title as module_title,
          l.order_index
        FROM lessons l
        JOIN program_modules pm ON pm.id = l.module_id
        WHERE l.is_published = true
          AND l.id NOT IN (${profile.completedLessons.length > 0 ? profile.completedLessons : [0]})
          AND pm.title ILIKE '%' || ${profile.weakTopics[0]} || '%'
        ORDER BY l.order_index ASC
        LIMIT 3
      `;

      gapLessonsResult.rows.forEach((lesson, idx) => {
        steps.push({
          step_number: steps.length + 1,
          type: 'lesson',
          content_id: parseInt(lesson.id),
          content_title: lesson.title,
          estimated_duration_minutes: parseInt(lesson.estimated_duration_minutes) || 15,
          difficulty_level: lesson.difficulty_level,
          reason: `Strengthen your knowledge in ${lesson.module_title}`,
          prerequisites_met: true
        });
      });
    }

    // Strategy 2: Progressive learning (next lessons in program)
    if (programId) {
      const nextLessonsResult = await sql`
        SELECT
          l.id,
          l.title,
          l.estimated_duration_minutes,
          l.difficulty_level,
          pm.title as module_title,
          pm.order_index as module_order,
          l.order_index as lesson_order
        FROM lessons l
        JOIN program_modules pm ON pm.id = l.module_id
        WHERE pm.program_id = ${programId}
          AND l.is_published = true
          AND l.id NOT IN (${profile.completedLessons.length > 0 ? profile.completedLessons : [0]})
        ORDER BY pm.order_index ASC, l.order_index ASC
        LIMIT 5
      `;

      nextLessonsResult.rows.forEach((lesson) => {
        // Avoid duplicates
        if (!steps.find(s => s.content_id === parseInt(lesson.id))) {
          steps.push({
            step_number: steps.length + 1,
            type: 'lesson',
            content_id: parseInt(lesson.id),
            content_title: lesson.title,
            estimated_duration_minutes: parseInt(lesson.estimated_duration_minutes) || 15,
            difficulty_level: lesson.difficulty_level,
            reason: `Continue your progress in ${lesson.module_title}`,
            prerequisites_met: true
          });
        }
      });
    }

    // Strategy 3: Spaced repetition (review strong topics)
    if (profile.strongTopics.length > 0 && steps.length < 8) {
      const reviewLessonsResult = await sql`
        SELECT
          l.id,
          l.title,
          l.estimated_duration_minutes,
          l.difficulty_level,
          pm.title as module_title
        FROM lessons l
        JOIN program_modules pm ON pm.id = l.module_id
        WHERE l.is_published = true
          AND l.content_type = 'quiz'
          AND pm.title ILIKE '%' || ${profile.strongTopics[0]} || '%'
          AND l.id IN (${profile.completedLessons.length > 0 ? profile.completedLessons : [0]})
        ORDER BY RANDOM()
        LIMIT 2
      `;

      reviewLessonsResult.rows.forEach((lesson) => {
        if (!steps.find(s => s.content_id === parseInt(lesson.id))) {
          steps.push({
            step_number: steps.length + 1,
            type: 'review',
            content_id: parseInt(lesson.id),
            content_title: lesson.title,
            estimated_duration_minutes: parseInt(lesson.estimated_duration_minutes) || 10,
            difficulty_level: lesson.difficulty_level,
            reason: `Review and reinforce ${lesson.module_title}`,
            prerequisites_met: true
          });
        }
      });
    }

    // Calculate estimated completion days based on learning pace
    const totalMinutes = steps.reduce((sum, step) => sum + step.estimated_duration_minutes, 0);
    const dailyCapacity = profile.learningPace === 'fast' ? 30 :
                         profile.learningPace === 'medium' ? 20 : 15;
    const estimatedDays = Math.ceil(totalMinutes / dailyCapacity);

    // Determine difficulty progression
    const difficulties = steps.map(s => s.difficulty_level);
    const hasProgression = difficulties.some((d, i) => i > 0 && d !== difficulties[i-1]);
    const difficultyProgression = hasProgression ? 'gradual' : 'adaptive';

    return {
      path_id: `path_${userId}_${Date.now()}`,
      user_id: userId,
      goal,
      total_steps: steps.length,
      estimated_completion_days: estimatedDays,
      difficulty_progression: difficultyProgression,
      steps,
      created_at: new Date()
    };
  } catch (error) {
    console.error('Error generating personalized path:', error);
    return {
      path_id: `path_${userId}_error`,
      user_id: userId,
      goal,
      total_steps: 0,
      estimated_completion_days: 0,
      difficulty_progression: 'gradual',
      steps: [],
      created_at: new Date()
    };
  }
}

/**
 * Get recommended next steps for user
 */
export async function getNextRecommendedSteps(
  userId: number,
  limit: number = 3
): Promise<LearningPathStep[]> {
  const path = await generatePersonalizedPath(userId);
  return path.steps.slice(0, limit);
}
