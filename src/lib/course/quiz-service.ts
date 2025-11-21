import { sql } from '@vercel/postgres';

// Types
export interface QuizQuestion {
  id: number;
  lesson_id: number;
  question: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  position: number;
  points: number;
  created_at: string;
}

export interface QuizOption {
  id: number;
  question_id: number;
  option_text: string;
  is_correct: boolean;
  position: number;
}

export interface QuizResult {
  id: number;
  user_id: number;
  lesson_id: number;
  score: number;
  max_score: number;
  answers: Record<string, any>; // JSON object with question_id -> answer
  completed_at: string;
}

export interface QuizAttempt {
  question: QuizQuestion;
  options?: QuizOption[];
  user_answer?: any;
  is_correct?: boolean;
}

export interface CreateQuestionData {
  lesson_id: number;
  question: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  position?: number;
  points?: number;
}

export interface CreateOptionData {
  question_id: number;
  option_text: string;
  is_correct: boolean;
  position?: number;
}

export interface SubmitQuizData {
  answers: Record<string, any>; // question_id -> answer
}

/**
 * Quiz Service - Handles all quiz-related operations
 */
export class QuizService {

  /**
   * Get all quiz questions for a lesson
   */
  static async getQuizQuestions(lessonId: number): Promise<QuizQuestion[]> {
    try {
      const result = await sql`
        SELECT * FROM course_quiz_questions
        WHERE lesson_id = ${lessonId}
        ORDER BY position ASC
      `;

      return result.rows as QuizQuestion[];
    } catch (error) {
      console.error('Error fetching quiz questions:', error);
      return [];
    }
  }

  /**
   * Get complete quiz data for a lesson (questions + options)
   */
  static async getQuizData(lessonId: number): Promise<{
    questions: QuizQuestion[];
    options: QuizOption[];
  }> {
    try {
      const [questionsResult, optionsResult] = await Promise.all([
        sql`
          SELECT * FROM course_quiz_questions
          WHERE lesson_id = ${lessonId}
          ORDER BY position ASC
        `,
        sql`
          SELECT * FROM course_quiz_options
          WHERE question_id IN (
            SELECT id FROM course_quiz_questions WHERE lesson_id = ${lessonId}
          )
          ORDER BY question_id, position ASC
        `
      ]);

      return {
        questions: questionsResult.rows as QuizQuestion[],
        options: optionsResult.rows as QuizOption[]
      };
    } catch (error) {
      console.error('Error fetching quiz data:', error);
      return { questions: [], options: [] };
    }
  }

  /**
   * Create a new quiz question
   */
  static async createQuestion(data: CreateQuestionData): Promise<QuizQuestion | null> {
    try {
      const result = await sql`
        INSERT INTO course_quiz_questions (
          lesson_id, question, question_type, position, points
        ) VALUES (
          ${data.lesson_id},
          ${data.question},
          ${data.question_type},
          ${data.position || 0},
          ${data.points || 1}
        )
        RETURNING *
      `;

      return result.rows[0] as QuizQuestion;
    } catch (error) {
      console.error('Error creating quiz question:', error);
      return null;
    }
  }

  /**
   * Create a quiz option for multiple choice questions
   */
  static async createOption(data: CreateOptionData): Promise<QuizOption | null> {
    try {
      const result = await sql`
        INSERT INTO course_quiz_options (
          question_id, option_text, is_correct, position
        ) VALUES (
          ${data.question_id},
          ${data.option_text},
          ${data.is_correct},
          ${data.position || 0}
        )
        RETURNING *
      `;

      return result.rows[0] as QuizOption;
    } catch (error) {
      console.error('Error creating quiz option:', error);
      return null;
    }
  }

  /**
   * Submit quiz answers and calculate score
   */
  static async submitQuiz(
    userId: number,
    lessonId: number,
    answers: Record<string, any>
  ): Promise<QuizResult | null> {
    try {
      // Get all questions for this lesson
      const questions = await this.getQuizQuestions(lessonId);
      if (questions.length === 0) return null;

      // Calculate score
      let totalScore = 0;
      const maxScore = questions.reduce((sum, q) => sum + q.points, 0);

      // Check each answer
      for (const question of questions) {
        const userAnswer = answers[question.id.toString()];

        if (await this.isAnswerCorrect(question, userAnswer)) {
          totalScore += question.points;
        }
      }

      // Check if user already submitted this quiz
      const existing = await sql`
        SELECT id FROM user_quiz_results
        WHERE user_id = ${userId} AND lesson_id = ${lessonId}
      `;

      let result;
      if (existing.rows.length > 0) {
        // Update existing result
        result = await sql`
          UPDATE user_quiz_results
          SET score = ${totalScore},
              max_score = ${maxScore},
              answers = ${JSON.stringify(answers)},
              completed_at = NOW()
          WHERE user_id = ${userId} AND lesson_id = ${lessonId}
          RETURNING *
        `;
      } else {
        // Create new result
        result = await sql`
          INSERT INTO user_quiz_results (
            user_id, lesson_id, score, max_score, answers
          ) VALUES (
            ${userId}, ${lessonId}, ${totalScore}, ${maxScore}, ${JSON.stringify(answers)}
          )
          RETURNING *
        `;
      }

      return result.rows[0] as QuizResult;
    } catch (error) {
      console.error('Error submitting quiz:', error);
      return null;
    }
  }

  /**
   * Check if an answer is correct
   */
  private static async isAnswerCorrect(question: QuizQuestion, userAnswer: any): Promise<boolean> {
    try {
      switch (question.question_type) {
        case 'multiple_choice':
        case 'true_false':
          // Check against correct options
          const correctOpts = await sql`
            SELECT id FROM course_quiz_options
            WHERE question_id = ${question.id} AND is_correct = true
          `;

          const correctOptionIds = correctOpts.rows.map(row => row.id.toString());
          return correctOptionIds.includes(userAnswer?.toString());

        case 'short_answer':
          // For short answers, we'll need more sophisticated checking
          // For now, assume manual grading or exact match
          const correctAnswers = await sql`
            SELECT option_text FROM course_quiz_options
            WHERE question_id = ${question.id} AND is_correct = true
          `;

          if (correctAnswers.rows.length === 0) return false;

          // Simple case-insensitive exact match for now
          const userAnswerStr = userAnswer?.toString().toLowerCase().trim();
          return correctAnswers.rows.some(row =>
            row.option_text.toLowerCase().trim() === userAnswerStr
          );

        default:
          return false;
      }
    } catch (error) {
      console.error('Error checking answer:', error);
      return false;
    }
  }

  /**
   * Get user's quiz result for a lesson
   */
  static async getQuizResult(userId: number, lessonId: number): Promise<QuizResult | null> {
    try {
      const result = await sql`
        SELECT uqr.*,
               cl.title as lesson_title,
               cm.title as module_title,
               c.title as course_title
        FROM user_quiz_results uqr
        JOIN course_lessons cl ON uqr.lesson_id = cl.id
        JOIN course_modules cm ON cl.module_id = cm.id
        JOIN courses c ON cm.course_id = c.id
        WHERE uqr.user_id = ${userId} AND uqr.lesson_id = ${lessonId}
      `;

      return result.rows[0] as QuizResult || null;
    } catch (error) {
      console.error('Error fetching quiz result:', error);
      return null;
    }
  }

  /**
   * Get detailed quiz attempt with answers and correctness
   */
  static async getQuizAttempt(
    userId: number,
    lessonId: number
  ): Promise<{
    result: QuizResult | null;
    attempts: QuizAttempt[];
  }> {
    try {
      const result = await this.getQuizResult(userId, lessonId);
      const { questions, options } = await this.getQuizData(lessonId);

      const attempts: QuizAttempt[] = questions.map(question => {
        const userAnswer = result?.answers?.[question.id.toString()];
        const questionOptions = options.filter(opt => opt.question_id === question.id);

        let isCorrect = false;
        if (result && userAnswer !== undefined) {
          isCorrect = this.isAnswerCorrect(question, userAnswer) as any;
        }

        return {
          question,
          options: questionOptions,
          user_answer: userAnswer,
          is_correct: isCorrect
        };
      });

      return { result, attempts };
    } catch (error) {
      console.error('Error fetching quiz attempt:', error);
      return { result: null, attempts: [] };
    }
  }

  /**
   * Get quiz statistics for a lesson (for instructors)
   */
  static async getQuizStatistics(lessonId: number): Promise<{
    total_attempts: number;
    average_score: number;
    pass_rate: number; // assuming 70% is passing
    question_stats: Array<{
      question_id: number;
      correct_answers: number;
      total_answers: number;
      accuracy: number;
    }>;
  }> {
    try {
      // Get all results for this quiz
      const results = await sql`
        SELECT * FROM user_quiz_results
        WHERE lesson_id = ${lessonId}
      `;

      if (results.rows.length === 0) {
        return {
          total_attempts: 0,
          average_score: 0,
          pass_rate: 0,
          question_stats: []
        };
      }

      const quizResults = results.rows as QuizResult[];
      const totalAttempts = quizResults.length;
      const averageScore = quizResults.reduce((sum, r) => sum + (r.score / r.max_score), 0) / totalAttempts;
      const passRate = quizResults.filter(r => (r.score / r.max_score) >= 0.7).length / totalAttempts;

      // Get question-level statistics
      const questions = await this.getQuizQuestions(lessonId);
      const questionStats = await Promise.all(
        questions.map(async (question) => {
          let correctAnswers = 0;
          let totalAnswers = 0;

          for (const result of quizResults) {
            const userAnswer = result.answers?.[question.id.toString()];
            if (userAnswer !== undefined) {
              totalAnswers++;
              if (await this.isAnswerCorrect(question, userAnswer)) {
                correctAnswers++;
              }
            }
          }

          return {
            question_id: question.id,
            correct_answers: correctAnswers,
            total_answers: totalAnswers,
            accuracy: totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0
          };
        })
      );

      return {
        total_attempts: totalAttempts,
        average_score: Math.round(averageScore * 100),
        pass_rate: Math.round(passRate * 100),
        question_stats: questionStats
      };
    } catch (error) {
      console.error('Error fetching quiz statistics:', error);
      return {
        total_attempts: 0,
        average_score: 0,
        pass_rate: 0,
        question_stats: []
      };
    }
  }

  /**
   * Delete a quiz question and its options
   */
  static async deleteQuestion(questionId: number): Promise<boolean> {
    try {
      await sql`DELETE FROM course_quiz_options WHERE question_id = ${questionId}`;
      await sql`DELETE FROM course_quiz_questions WHERE id = ${questionId}`;
      return true;
    } catch (error) {
      console.error('Error deleting quiz question:', error);
      return false;
    }
  }

  /**
   * Update a quiz question
   */
  static async updateQuestion(
    questionId: number,
    data: Partial<CreateQuestionData>
  ): Promise<boolean> {
    try {
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (data.question !== undefined) {
        updates.push(`question = $${paramIndex++}`);
        values.push(data.question);
      }
      if (data.question_type !== undefined) {
        updates.push(`question_type = $${paramIndex++}`);
        values.push(data.question_type);
      }
      if (data.position !== undefined) {
        updates.push(`position = $${paramIndex++}`);
        values.push(data.position);
      }
      if (data.points !== undefined) {
        updates.push(`points = $${paramIndex++}`);
        values.push(data.points);
      }

      if (updates.length === 0) return true;

      values.push(questionId);
      const query = `
        UPDATE course_quiz_questions
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
      `;

      await sql.query(query, values);
      return true;
    } catch (error) {
      console.error('Error updating quiz question:', error);
      return false;
    }
  }

  /**
   * Reset quiz result for a user (for testing)
   */
  static async resetQuizResult(userId: number, lessonId: number): Promise<boolean> {
    try {
      await sql`
        DELETE FROM user_quiz_results
        WHERE user_id = ${userId} AND lesson_id = ${lessonId}
      `;
      return true;
    } catch (error) {
      console.error('Error resetting quiz result:', error);
      return false;
    }
  }
}