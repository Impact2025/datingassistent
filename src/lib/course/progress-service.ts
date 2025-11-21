import { sql } from '@vercel/postgres';

// Types
export interface CourseProgress {
  id: number;
  user_id: number;
  course_id: number;
  enrolled_at: string;
  completed_at?: string;
  progress_percentage: number;
  last_accessed_at: string;
}

export interface LessonProgress {
  id: number;
  user_id: number;
  lesson_id: number;
  is_completed: boolean;
  completed_at?: string;
  watch_time_seconds: number;
  created_at: string;
  updated_at: string;
}

export interface CourseEnrollment {
  course_id: number;
  enrolled_at: string;
  progress_percentage: number;
  completed_at?: string;
}

export interface ProgressOverview {
  total_courses: number;
  completed_courses: number;
  in_progress_courses: number;
  total_progress_percentage: number;
  recent_activity: Array<{
    course_title: string;
    last_accessed: string;
    progress: number;
  }>;
}

/**
 * Progress Service - Handles all course progress tracking operations
 */
export class ProgressService {

  /**
   * Enroll user in a course
   */
  static async enrollUserInCourse(userId: number, courseId: number): Promise<CourseProgress | null> {
    try {
      // Check if already enrolled
      const existing = await sql`
        SELECT * FROM user_course_progress
        WHERE user_id = ${userId} AND course_id = ${courseId}
      `;

      if (existing.rows.length > 0) {
        return existing.rows[0] as CourseProgress;
      }

      // Create new enrollment
      const result = await sql`
        INSERT INTO user_course_progress (user_id, course_id)
        VALUES (${userId}, ${courseId})
        RETURNING *
      `;

      return result.rows[0] as CourseProgress;
    } catch (error) {
      console.error('Error enrolling user in course:', error);
      return null;
    }
  }

  /**
   * Get user's progress for a specific course
   */
  static async getCourseProgress(userId: number, courseId: number): Promise<CourseProgress | null> {
    try {
      const result = await sql`
        SELECT ucp.*,
               c.title as course_title,
               c.description as course_description,
               c.level,
               c.duration_hours
        FROM user_course_progress ucp
        JOIN courses c ON ucp.course_id = c.id
        WHERE ucp.user_id = ${userId} AND ucp.course_id = ${courseId}
      `;

      return result.rows[0] as CourseProgress || null;
    } catch (error) {
      console.error('Error fetching course progress:', error);
      return null;
    }
  }

  /**
   * Update lesson progress
   */
  static async updateLessonProgress(
    userId: number,
    lessonId: number,
    updates: {
      is_completed?: boolean;
      watch_time_seconds?: number;
    }
  ): Promise<LessonProgress | null> {
    try {
      // Check if progress record exists
      const existing = await sql`
        SELECT * FROM user_lesson_progress
        WHERE user_id = ${userId} AND lesson_id = ${lessonId}
      `;

      let result;
      if (existing.rows.length > 0) {
        // Update existing
        const updateFields: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (updates.is_completed !== undefined) {
          updateFields.push(`is_completed = $${paramIndex++}`);
          values.push(updates.is_completed);
          if (updates.is_completed) {
            updateFields.push(`completed_at = $${paramIndex++}`);
            values.push(new Date());
          }
        }

        if (updates.watch_time_seconds !== undefined) {
          updateFields.push(`watch_time_seconds = $${paramIndex++}`);
          values.push(updates.watch_time_seconds);
        }

        updateFields.push(`updated_at = NOW()`);
        values.push(userId, lessonId);

        const query = `
          UPDATE user_lesson_progress
          SET ${updateFields.join(', ')}
          WHERE user_id = $${paramIndex} AND lesson_id = $${paramIndex + 1}
          RETURNING *
        `;

        result = await sql.query(query, values);
      } else {
        // Create new
        const completedAt = updates.is_completed ? new Date().toISOString() : null;
        result = await sql`
          INSERT INTO user_lesson_progress (
            user_id, lesson_id, is_completed, watch_time_seconds,
            completed_at
          ) VALUES (
            ${userId}, ${lessonId},
            ${updates.is_completed || false},
            ${updates.watch_time_seconds || 0},
            ${completedAt}
          )
          RETURNING *
        `;
      }

      return result.rows[0] as LessonProgress;
    } catch (error) {
      console.error('Error updating lesson progress:', error);
      return null;
    }
  }

  /**
   * Get lesson progress for user
   */
  static async getLessonProgress(userId: number, lessonId: number): Promise<LessonProgress | null> {
    try {
      const result = await sql`
        SELECT ulp.*,
               cl.title as lesson_title,
               cl.lesson_type,
               cl.video_duration,
               cm.title as module_title,
               c.title as course_title
        FROM user_lesson_progress ulp
        JOIN course_lessons cl ON ulp.lesson_id = cl.id
        JOIN course_modules cm ON cl.module_id = cm.id
        JOIN courses c ON cm.course_id = c.id
        WHERE ulp.user_id = ${userId} AND ulp.lesson_id = ${lessonId}
      `;

      return result.rows[0] as LessonProgress || null;
    } catch (error) {
      console.error('Error fetching lesson progress:', error);
      return null;
    }
  }

  /**
   * Calculate and update course progress percentage
   */
  static async calculateCourseProgress(userId: number, courseId: number): Promise<number> {
    try {
      // Use the database function we created
      const result = await sql`
        SELECT calculate_course_progress(${userId}, ${courseId}) as progress
      `;

      const progress = result.rows[0].progress || 0;

      // Update the progress in the database
      await sql`
        UPDATE user_course_progress
        SET progress_percentage = ${progress},
            last_accessed_at = NOW()
        WHERE user_id = ${userId} AND course_id = ${courseId}
      `;

      return progress;
    } catch (error) {
      console.error('Error calculating course progress:', error);
      return 0;
    }
  }

  /**
   * Mark course as completed
   */
  static async markCourseCompleted(userId: number, courseId: number): Promise<boolean> {
    try {
      const progress = await this.calculateCourseProgress(userId, courseId);

      if (progress >= 100) {
        await sql`
          UPDATE user_course_progress
          SET completed_at = NOW(),
              progress_percentage = 100
          WHERE user_id = ${userId} AND course_id = ${courseId}
          AND completed_at IS NULL
        `;

        // Trigger achievement system (to be implemented)
        await this.checkAndAwardAchievements(userId, courseId);

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error marking course completed:', error);
      return false;
    }
  }

  /**
   * Get user's overall progress across all courses
   */
  static async getUserProgressOverview(userId: number): Promise<ProgressOverview> {
    try {
      // Get course statistics
      const statsResult = await sql`
        SELECT
          COUNT(*) as total_courses,
          COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END) as completed_courses,
          COUNT(CASE WHEN completed_at IS NULL AND progress_percentage > 0 THEN 1 END) as in_progress_courses,
          COALESCE(AVG(progress_percentage), 0) as avg_progress
        FROM user_course_progress
        WHERE user_id = ${userId}
      `;

      const stats = statsResult.rows[0];

      // Get recent activity (last 5 courses accessed)
      const recentResult = await sql`
        SELECT
          c.title as course_title,
          ucp.last_accessed_at,
          ucp.progress_percentage as progress
        FROM user_course_progress ucp
        JOIN courses c ON ucp.course_id = c.id
        WHERE ucp.user_id = ${userId}
        ORDER BY ucp.last_accessed_at DESC
        LIMIT 5
      `;

      return {
        total_courses: parseInt(stats.total_courses) || 0,
        completed_courses: parseInt(stats.completed_courses) || 0,
        in_progress_courses: parseInt(stats.in_progress_courses) || 0,
        total_progress_percentage: Math.round(parseFloat(stats.avg_progress) || 0),
        recent_activity: recentResult.rows.map(row => ({
          course_title: row.course_title,
          last_accessed: row.last_accessed_at,
          progress: row.progress
        }))
      };
    } catch (error) {
      console.error('Error fetching user progress overview:', error);
      return {
        total_courses: 0,
        completed_courses: 0,
        in_progress_courses: 0,
        total_progress_percentage: 0,
        recent_activity: []
      };
    }
  }

  /**
   * Get all courses user is enrolled in with progress
   */
  static async getUserEnrolledCourses(userId: number): Promise<CourseEnrollment[]> {
    try {
      const result = await sql`
        SELECT
          c.id as course_id,
          ucp.enrolled_at,
          ucp.progress_percentage,
          ucp.completed_at,
          c.title,
          c.description,
          c.level,
          c.duration_hours,
          c.thumbnail_url
        FROM user_course_progress ucp
        JOIN courses c ON ucp.course_id = c.id
        WHERE ucp.user_id = ${userId}
        ORDER BY ucp.last_accessed_at DESC
      `;

      return result.rows.map(row => ({
        course_id: row.course_id,
        enrolled_at: row.enrolled_at,
        progress_percentage: row.progress_percentage,
        completed_at: row.completed_at
      }));
    } catch (error) {
      console.error('Error fetching user enrolled courses:', error);
      return [];
    }
  }

  /**
   * Get detailed progress for a course including module/lesson breakdown
   */
  static async getDetailedCourseProgress(userId: number, courseId: number): Promise<{
    course_progress: CourseProgress | null;
    modules: Array<{
      id: number;
      title: string;
      position: number;
      lessons_completed: number;
      total_lessons: number;
      progress_percentage: number;
    }>;
  }> {
    try {
      const courseProgress = await this.getCourseProgress(userId, courseId);

      // Get module progress
      const modulesResult = await sql`
        SELECT
          cm.id,
          cm.title,
          cm.position,
          COUNT(cl.id) as total_lessons,
          COUNT(ulp.id) as lessons_completed
        FROM course_modules cm
        JOIN course_lessons cl ON cm.id = cl.module_id
        LEFT JOIN user_lesson_progress ulp ON cl.id = ulp.lesson_id
          AND ulp.user_id = ${userId}
          AND ulp.is_completed = true
        WHERE cm.course_id = ${courseId}
        GROUP BY cm.id, cm.title, cm.position
        ORDER BY cm.position
      `;

      const modules = modulesResult.rows.map(module => ({
        id: module.id,
        title: module.title,
        position: module.position,
        lessons_completed: parseInt(module.lessons_completed),
        total_lessons: parseInt(module.total_lessons),
        progress_percentage: module.total_lessons > 0
          ? Math.round((module.lessons_completed / module.total_lessons) * 100)
          : 0
      }));

      return {
        course_progress: courseProgress,
        modules
      };
    } catch (error) {
      console.error('Error fetching detailed course progress:', error);
      return {
        course_progress: null,
        modules: []
      };
    }
  }

  /**
   * Check and award achievements (placeholder for future implementation)
   */
  private static async checkAndAwardAchievements(userId: number, courseId: number): Promise<void> {
    // This will be implemented in Phase 4
    // For now, just log completion
    console.log(`User ${userId} completed course ${courseId}`);
  }

  /**
   * Reset progress for a course (for testing/admin purposes)
   */
  static async resetCourseProgress(userId: number, courseId: number): Promise<boolean> {
    try {
      await sql`
        DELETE FROM user_lesson_progress
        WHERE user_id = ${userId}
        AND lesson_id IN (
          SELECT cl.id
          FROM course_lessons cl
          JOIN course_modules cm ON cl.module_id = cm.id
          WHERE cm.course_id = ${courseId}
        )
      `;

      await sql`
        UPDATE user_course_progress
        SET progress_percentage = 0,
            completed_at = NULL,
            last_accessed_at = NOW()
        WHERE user_id = ${userId} AND course_id = ${courseId}
      `;

      return true;
    } catch (error) {
      console.error('Error resetting course progress:', error);
      return false;
    }
  }
}