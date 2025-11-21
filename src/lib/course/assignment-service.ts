import { sql } from '@vercel/postgres';

// Types
export interface Assignment {
  id: number;
  lesson_id: number;
  title: string;
  description: string;
  instructions?: string;
  submission_type: 'text' | 'file' | 'url';
  max_points: number;
  created_at: string;
  updated_at: string;
}

export interface AssignmentSubmission {
  id: number;
  user_id: number;
  assignment_id: number;
  submission_text?: string;
  submission_url?: string;
  submission_file_url?: string;
  score?: number;
  feedback?: string;
  submitted_at: string;
  graded_at?: string;
  graded_by?: number;
}

export interface CreateAssignmentData {
  lesson_id: number;
  title: string;
  description: string;
  instructions?: string;
  submission_type?: 'text' | 'file' | 'url';
  max_points?: number;
}

export interface SubmitAssignmentData {
  submission_text?: string;
  submission_url?: string;
  submission_file_url?: string;
}

/**
 * Assignment Service - Handles all assignment-related operations
 */
export class AssignmentService {

  /**
   * Create a new assignment for a lesson
   */
  static async createAssignment(data: CreateAssignmentData): Promise<Assignment | null> {
    try {
      const result = await sql`
        INSERT INTO course_assignments (
          lesson_id, title, description, instructions, submission_type, max_points
        ) VALUES (
          ${data.lesson_id},
          ${data.title},
          ${data.description},
          ${data.instructions || null},
          ${data.submission_type || 'text'},
          ${data.max_points || 100}
        )
        RETURNING *
      `;

      return result.rows[0] as Assignment;
    } catch (error) {
      console.error('Error creating assignment:', error);
      return null;
    }
  }

  /**
   * Get assignment by ID with lesson info
   */
  static async getAssignmentById(id: number): Promise<Assignment | null> {
    try {
      const result = await sql`
        SELECT ca.*,
               cl.title as lesson_title,
               cm.title as module_title,
               c.title as course_title
        FROM course_assignments ca
        JOIN course_lessons cl ON ca.lesson_id = cl.id
        JOIN course_modules cm ON cl.module_id = cm.id
        JOIN courses c ON cm.course_id = c.id
        WHERE ca.id = ${id}
      `;

      return result.rows[0] as Assignment || null;
    } catch (error) {
      console.error('Error fetching assignment:', error);
      return null;
    }
  }

  /**
   * Get all assignments for a lesson
   */
  static async getAssignmentsByLessonId(lessonId: number): Promise<Assignment[]> {
    try {
      const result = await sql`
        SELECT * FROM course_assignments
        WHERE lesson_id = ${lessonId}
        ORDER BY created_at ASC
      `;

      return result.rows as Assignment[];
    } catch (error) {
      console.error('Error fetching assignments for lesson:', error);
      return [];
    }
  }

  /**
   * Submit an assignment
   */
  static async submitAssignment(
    userId: number,
    assignmentId: number,
    data: SubmitAssignmentData
  ): Promise<AssignmentSubmission | null> {
    try {
      // Check if user already submitted
      const existing = await sql`
        SELECT id FROM user_assignment_submissions
        WHERE user_id = ${userId} AND assignment_id = ${assignmentId}
      `;

      if (existing.rows.length > 0) {
        // Update existing submission
        const result = await sql`
          UPDATE user_assignment_submissions
          SET submission_text = ${data.submission_text || null},
              submission_url = ${data.submission_url || null},
              submission_file_url = ${data.submission_file_url || null},
              submitted_at = NOW()
          WHERE user_id = ${userId} AND assignment_id = ${assignmentId}
          RETURNING *
        `;
        return result.rows[0] as AssignmentSubmission;
      } else {
        // Create new submission
        const result = await sql`
          INSERT INTO user_assignment_submissions (
            user_id, assignment_id, submission_text, submission_url, submission_file_url
          ) VALUES (
            ${userId}, ${assignmentId},
            ${data.submission_text || null},
            ${data.submission_url || null},
            ${data.submission_file_url || null}
          )
          RETURNING *
        `;
        return result.rows[0] as AssignmentSubmission;
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
      return null;
    }
  }

  /**
   * Get user's submission for an assignment
   */
  static async getUserSubmission(userId: number, assignmentId: number): Promise<AssignmentSubmission | null> {
    try {
      const result = await sql`
        SELECT uas.*,
               u.name as user_name,
               u.email as user_email,
               grader.name as grader_name
        FROM user_assignment_submissions uas
        JOIN users u ON uas.user_id = u.id
        LEFT JOIN users grader ON uas.graded_by = grader.id
        WHERE uas.user_id = ${userId} AND uas.assignment_id = ${assignmentId}
      `;

      return result.rows[0] as AssignmentSubmission || null;
    } catch (error) {
      console.error('Error fetching user submission:', error);
      return null;
    }
  }

  /**
   * Get all submissions for an assignment (for grading)
   */
  static async getAssignmentSubmissions(assignmentId: number): Promise<AssignmentSubmission[]> {
    try {
      const result = await sql`
        SELECT uas.*,
               u.name as user_name,
               u.email as user_email,
               u.display_name,
               grader.name as grader_name
        FROM user_assignment_submissions uas
        JOIN users u ON uas.user_id = u.id
        LEFT JOIN users grader ON uas.graded_by = grader.id
        WHERE uas.assignment_id = ${assignmentId}
        ORDER BY uas.submitted_at DESC
      `;

      return result.rows as AssignmentSubmission[];
    } catch (error) {
      console.error('Error fetching assignment submissions:', error);
      return [];
    }
  }

  /**
   * Grade an assignment submission
   */
  static async gradeSubmission(
    submissionId: number,
    score: number,
    feedback: string,
    gradedBy: number
  ): Promise<boolean> {
    try {
      await sql`
        UPDATE user_assignment_submissions
        SET score = ${score},
            feedback = ${feedback},
            graded_at = NOW(),
            graded_by = ${gradedBy}
        WHERE id = ${submissionId}
      `;

      return true;
    } catch (error) {
      console.error('Error grading submission:', error);
      return false;
    }
  }

  /**
   * Get user's assignment progress for a course
   */
  static async getUserAssignmentProgress(userId: number, courseId: number): Promise<{
    total_assignments: number;
    submitted_assignments: number;
    graded_assignments: number;
    average_score: number | null;
  }> {
    try {
      const result = await sql`
        SELECT
          COUNT(DISTINCT ca.id) as total_assignments,
          COUNT(DISTINCT CASE WHEN uas.id IS NOT NULL THEN ca.id END) as submitted_assignments,
          COUNT(DISTINCT CASE WHEN uas.score IS NOT NULL THEN ca.id END) as graded_assignments,
          ROUND(AVG(uas.score), 1) as average_score
        FROM course_assignments ca
        JOIN course_lessons cl ON ca.lesson_id = cl.id
        JOIN course_modules cm ON cl.module_id = cm.id
        LEFT JOIN user_assignment_submissions uas ON ca.id = uas.assignment_id AND uas.user_id = ${userId}
        WHERE cm.course_id = ${courseId}
      `;

      return result.rows[0] as any;
    } catch (error) {
      console.error('Error fetching assignment progress:', error);
      return {
        total_assignments: 0,
        submitted_assignments: 0,
        graded_assignments: 0,
        average_score: null
      };
    }
  }

  /**
   * Delete an assignment
   */
  static async deleteAssignment(id: number): Promise<boolean> {
    try {
      await sql`DELETE FROM course_assignments WHERE id = ${id}`;
      return true;
    } catch (error) {
      console.error('Error deleting assignment:', error);
      return false;
    }
  }

  /**
   * Update an assignment
   */
  static async updateAssignment(id: number, data: Partial<CreateAssignmentData>): Promise<boolean> {
    try {
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (data.title !== undefined) {
        updates.push(`title = $${paramIndex++}`);
        values.push(data.title);
      }
      if (data.description !== undefined) {
        updates.push(`description = $${paramIndex++}`);
        values.push(data.description);
      }
      if (data.instructions !== undefined) {
        updates.push(`instructions = $${paramIndex++}`);
        values.push(data.instructions);
      }
      if (data.submission_type !== undefined) {
        updates.push(`submission_type = $${paramIndex++}`);
        values.push(data.submission_type);
      }
      if (data.max_points !== undefined) {
        updates.push(`max_points = $${paramIndex++}`);
        values.push(data.max_points);
      }

      if (updates.length === 0) return true;

      updates.push(`updated_at = NOW()`);
      values.push(id);

      const query = `
        UPDATE course_assignments
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
      `;

      await sql.query(query, values);
      return true;
    } catch (error) {
      console.error('Error updating assignment:', error);
      return false;
    }
  }
}