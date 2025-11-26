/**
 * Progress utilities for DatingAssistent
 * Contains functions for tracking and updating user progress in courses
 */

import { sql } from '@vercel/postgres';
import { getLessonExerciseCount } from './course-utils';

/**
 * Update cursus progress for a user after completing an exercise
 * @param userId - The user ID
 * @param moduleSlug - The module slug
 * @param lesSlug - The lesson slug
 */
export async function updateCursusProgress(userId: number, moduleSlug: string, lesSlug: string): Promise<void> {
  try {
    // Dynamically count total exercises for this lesson
    const totalExercises = getLessonExerciseCount(moduleSlug, lesSlug);

    if (totalExercises === 0) {
      console.warn(`No exercises found for lesson ${lesSlug} in module ${moduleSlug}`);
      return;
    }

    // Count completed exercises
    const result = await sql`
      SELECT COUNT(*) as completed
      FROM cursus_exercise_answers
      WHERE user_id = ${userId} AND module_slug = ${moduleSlug} AND les_slug = ${lesSlug}
    `;

    const completedExercises = parseInt(result.rows[0].completed);
    const completionPercentage = Math.round((completedExercises / totalExercises) * 100);

    const status = completedExercises === 0 ? 'niet_gestart' :
                   completedExercises === totalExercises ? 'voltooid' : 'bezig';

    // Upsert progress
    await sql`
      INSERT INTO cursus_progress
      (user_id, module_slug, les_slug, completed_exercises, total_exercises, completion_percentage, status, started_at, completed_at)
      VALUES (${userId}, ${moduleSlug}, ${lesSlug}, ${completedExercises}, ${totalExercises}, ${completionPercentage}, ${status},
              CASE WHEN ${status} != 'niet_gestart' AND NOT EXISTS (
                SELECT 1 FROM cursus_progress WHERE user_id = ${userId} AND module_slug = ${moduleSlug} AND les_slug = ${lesSlug}
              ) THEN NOW() ELSE (SELECT started_at FROM cursus_progress WHERE user_id = ${userId} AND module_slug = ${moduleSlug} AND les_slug = ${lesSlug}) END,
              CASE WHEN ${status} = 'voltooid' THEN NOW() ELSE NULL END)
      ON CONFLICT (user_id, module_slug, les_slug)
      DO UPDATE SET
        completed_exercises = EXCLUDED.completed_exercises,
        completion_percentage = EXCLUDED.completion_percentage,
        status = EXCLUDED.status,
        completed_at = EXCLUDED.completed_at,
        updated_at = NOW()
    `;

  } catch (error) {
    console.error('Error updating cursus progress:', error);
    // Don't throw error - progress update failure shouldn't break answer saving
  }
}

/**
 * Get progress summary for a user in a specific module
 * @param userId - The user ID
 * @param moduleSlug - The module slug
 * @returns Progress summary object
 */
export async function getModuleProgress(userId: number, moduleSlug: string) {
  try {
    const result = await sql`
      SELECT
        module_slug,
        COUNT(*) as total_lessons,
        COUNT(CASE WHEN status = 'voltooid' THEN 1 END) as completed_lessons,
        AVG(completion_percentage) as avg_completion
      FROM cursus_progress
      WHERE user_id = ${userId} AND module_slug = ${moduleSlug}
      GROUP BY module_slug
    `;

    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting module progress:', error);
    return null;
  }
}