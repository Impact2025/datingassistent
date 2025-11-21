/**
 * Journey Service - Core orchestration engine for new member onboarding
 * Manages the complete 5-phase journey from welcome to annual reflection
 */

import { sql } from '@vercel/postgres';
import { trackProgressEvent } from './progress-automation-service';

export interface JourneyProgress {
  userId: number;
  currentPhase: string;
  currentStep: number;
  completedSteps: number;
  totalSteps: number;
  lastActivity: Date;
  status: 'active' | 'completed' | 'paused' | 'abandoned';
  journeyVersion: string;
}

export interface JourneyStep {
  phase: string;
  stepNumber: number;
  name: string;
  type: 'screen' | 'quiz' | 'task' | 'reflection' | 'celebration';
  required: boolean;
  estimatedTime: number; // in minutes
  prerequisites?: string[];
  nextSteps?: string[];
}

export class JourneyService {
  // Define the complete journey structure
  private static readonly JOURNEY_STRUCTURE: JourneyStep[] = [
    // Phase 1: Onboarding (Day 1)
    { phase: 'welcome', stepNumber: 1, name: 'Welcome Screen', type: 'screen', required: true, estimatedTime: 1 },
    { phase: 'scan', stepNumber: 1, name: 'Current Situation', type: 'quiz', required: true, estimatedTime: 2 },
    { phase: 'scan', stepNumber: 2, name: 'Comfort Level', type: 'quiz', required: true, estimatedTime: 1 },
    { phase: 'scan', stepNumber: 3, name: 'Main Challenge', type: 'quiz', required: true, estimatedTime: 1 },
    { phase: 'scan', stepNumber: 4, name: 'Desired Outcome', type: 'quiz', required: true, estimatedTime: 1 },
    { phase: 'scan', stepNumber: 5, name: 'Self Strengths', type: 'quiz', required: true, estimatedTime: 2 },
    { phase: 'scan', stepNumber: 6, name: 'Self Weaknesses', type: 'quiz', required: true, estimatedTime: 2 },
    { phase: 'scan', stepNumber: 7, name: 'Weekly Commitment', type: 'quiz', required: true, estimatedTime: 1 },
    { phase: 'scan', stepNumber: 8, name: 'AI Profile Analysis', type: 'celebration', required: true, estimatedTime: 3 },
    { phase: 'goals', stepNumber: 1, name: 'Year Goal Selection', type: 'task', required: true, estimatedTime: 5 },
    { phase: 'goals', stepNumber: 2, name: 'Month Goal Mapping', type: 'task', required: true, estimatedTime: 3 },
    { phase: 'goals', stepNumber: 3, name: 'Week Goals Generation', type: 'task', required: true, estimatedTime: 2 },
    { phase: 'optimization', stepNumber: 1, name: 'Profile Upload', type: 'task', required: true, estimatedTime: 5 },
    { phase: 'optimization', stepNumber: 2, name: 'AI Analysis', type: 'celebration', required: true, estimatedTime: 3 },
    { phase: 'optimization', stepNumber: 3, name: 'Results Celebration', type: 'celebration', required: true, estimatedTime: 2 },

    // Phase 2: Week 1 (Activation)
    { phase: 'week1', stepNumber: 1, name: 'Day 2 Motivation', type: 'reflection', required: false, estimatedTime: 2 },
    { phase: 'week1', stepNumber: 2, name: 'Progress Check', type: 'reflection', required: false, estimatedTime: 1 },
    { phase: 'week1', stepNumber: 3, name: 'AI Task Day 4', type: 'task', required: false, estimatedTime: 10 },
    { phase: 'week1', stepNumber: 4, name: 'Mid-week Reflection', type: 'reflection', required: false, estimatedTime: 3 },
    { phase: 'week1', stepNumber: 5, name: 'Week 1 Review', type: 'reflection', required: false, estimatedTime: 5 },

    // Phase 3: Monthly Flow (Ongoing)
    { phase: 'monthly', stepNumber: 1, name: 'Monthly Report Generation', type: 'celebration', required: false, estimatedTime: 5 },
    { phase: 'monthly', stepNumber: 2, name: 'Progress Analysis', type: 'reflection', required: false, estimatedTime: 3 },
    { phase: 'monthly', stepNumber: 3, name: 'Goal Adjustment', type: 'task', required: false, estimatedTime: 5 },

    // Phase 4: Performance Tracking (24/7)
    { phase: 'tracking', stepNumber: 1, name: 'Badge System', type: 'celebration', required: false, estimatedTime: 1 },
    { phase: 'tracking', stepNumber: 2, name: 'Performance Dashboard', type: 'screen', required: false, estimatedTime: 3 },

    // Phase 5: Annual Reflection
    { phase: 'annual', stepNumber: 1, name: 'Year Review', type: 'reflection', required: false, estimatedTime: 15 },
    { phase: 'annual', stepNumber: 2, name: 'Success Highlights', type: 'celebration', required: false, estimatedTime: 5 },
    { phase: 'annual', stepNumber: 3, name: 'Next Year Planning', type: 'task', required: false, estimatedTime: 10 }
  ];

  /**
   * Initialize a new journey for a user
   */
  static async initializeJourney(userId: number): Promise<JourneyProgress | null> {
    try {
      // Check if journey already exists
      const existing = await sql`
        SELECT * FROM onboarding_journeys WHERE user_id = ${userId}
      `;

      if (existing.rows.length > 0) {
        return this.getJourneyProgress(userId);
      }

      // Create new journey
      await sql`
        INSERT INTO onboarding_journeys (user_id, journey_version, current_phase, current_step, status)
        VALUES (${userId}, 'v1.0', 'welcome', 1, 'active')
      `;

      // Track journey start event
      await trackProgressEvent({
        userId,
        eventType: 'journey_started',
        eventData: { journeyVersion: 'v1.0' },
        occurredAt: new Date()
      });

      return this.getJourneyProgress(userId);
    } catch (error) {
      console.error('Error initializing journey:', error);
      throw error;
    }
  }

  /**
   * Get current journey progress for a user
   */
  static async getJourneyProgress(userId: number): Promise<JourneyProgress | null> {
    try {
      const result = await sql`
        SELECT * FROM onboarding_journeys WHERE user_id = ${userId}
      `;

      if (result.rows.length === 0) {
        return null;
      }

      const journey = result.rows[0];

      // Calculate completed steps
      const progressResult = await sql`
        SELECT COUNT(*) as completed_steps
        FROM journey_progress
        WHERE user_id = ${userId} AND status = 'completed'
      `;

      const completedSteps = parseInt(progressResult.rows[0].completed_steps);
      const totalSteps = this.JOURNEY_STRUCTURE.length;

      return {
        userId,
        currentPhase: journey.current_phase,
        currentStep: journey.current_step,
        completedSteps,
        totalSteps,
        lastActivity: new Date(journey.last_activity),
        status: journey.status,
        journeyVersion: journey.journey_version
      };
    } catch (error) {
      console.error('Error getting journey progress:', error);
      return null;
    }
  }

  /**
   * Complete a journey step
   */
  static async completeStep(
    userId: number,
    phase: string,
    stepNumber: number,
    response?: any,
    timeSpentSeconds?: number
  ): Promise<boolean> {
    try {
      // Update or insert progress record
      await sql`
        INSERT INTO journey_progress (
          user_id, journey_phase, step_number, step_name, step_type, status,
          completed_at, user_response, time_spent_seconds
        )
        VALUES (
          ${userId}, ${phase}, ${stepNumber},
          ${this.getStepName(phase, stepNumber)},
          ${this.getStepType(phase, stepNumber)},
          'completed', NOW(), ${JSON.stringify(response || {})}, ${timeSpentSeconds || 0}
        )
        ON CONFLICT (user_id, journey_phase, step_number)
        DO UPDATE SET
          status = 'completed',
          completed_at = NOW(),
          user_response = ${JSON.stringify(response || {})},
          time_spent_seconds = ${timeSpentSeconds || 0}
      `;

      // Update journey progress
      const nextStep = this.getNextStep(phase, stepNumber);
      if (nextStep) {
        await sql`
          UPDATE onboarding_journeys
          SET current_phase = ${nextStep.phase},
              current_step = ${nextStep.stepNumber},
              last_activity = NOW()
          WHERE user_id = ${userId}
        `;
      } else {
        // Journey completed
        await sql`
          UPDATE onboarding_journeys
          SET status = 'completed',
              completed_at = NOW(),
              last_activity = NOW()
          WHERE user_id = ${userId}
        `;
      }

      // Track progress event
      await trackProgressEvent({
        userId,
        eventType: 'step_completed',
        eventData: {
          phase,
          stepNumber,
          stepName: this.getStepName(phase, stepNumber),
          response: response || {}
        },
        occurredAt: new Date()
      });

      return true;
    } catch (error) {
      console.error('Error completing step:', error);
      return false;
    }
  }

  /**
   * Get available steps for a user
   */
  static async getAvailableSteps(userId: number): Promise<JourneyStep[]> {
    try {
      const progress = await this.getJourneyProgress(userId);
      if (!progress) return [];

      // Get completed steps
      const completedResult = await sql`
        SELECT journey_phase, step_number
        FROM journey_progress
        WHERE user_id = ${userId} AND status = 'completed'
      `;

      const completedSteps = new Set(
        completedResult.rows.map(row => `${row.journey_phase}-${row.step_number}`)
      );

      // Return available steps (current phase + prerequisites met)
      return this.JOURNEY_STRUCTURE.filter(step => {
        const stepKey = `${step.phase}-${step.stepNumber}`;
        const isCompleted = completedSteps.has(stepKey);

        // Show current step if not completed
        if (step.phase === progress.currentPhase && step.stepNumber === progress.currentStep && !isCompleted) {
          return true;
        }

        // Show optional steps that haven't been completed
        if (!step.required && !isCompleted) {
          return true;
        }

        return false;
      });
    } catch (error) {
      console.error('Error getting available steps:', error);
      return [];
    }
  }

  /**
   * Get step details
   */
  static getStepDetails(phase: string, stepNumber: number): JourneyStep | null {
    return this.JOURNEY_STRUCTURE.find(
      step => step.phase === phase && step.stepNumber === stepNumber
    ) || null;
  }

  /**
   * Get step name
   */
  private static getStepName(phase: string, stepNumber: number): string {
    const step = this.getStepDetails(phase, stepNumber);
    return step?.name || `Step ${stepNumber}`;
  }

  /**
   * Get step type
   */
  private static getStepType(phase: string, stepNumber: number): string {
    const step = this.getStepDetails(phase, stepNumber);
    return step?.type || 'task';
  }

  /**
   * Get next step in journey
   */
  private static getNextStep(currentPhase: string, currentStep: number): { phase: string; stepNumber: number } | null {
    const currentIndex = this.JOURNEY_STRUCTURE.findIndex(
      step => step.phase === currentPhase && step.stepNumber === currentStep
    );

    if (currentIndex === -1 || currentIndex === this.JOURNEY_STRUCTURE.length - 1) {
      return null; // No next step or journey complete
    }

    const nextStep = this.JOURNEY_STRUCTURE[currentIndex + 1];
    return {
      phase: nextStep.phase,
      stepNumber: nextStep.stepNumber
    };
  }

  /**
   * Get journey statistics
   */
  static async getJourneyStats(): Promise<{
    totalJourneys: number;
    activeJourneys: number;
    completedJourneys: number;
    averageCompletionTime: number;
    phaseCompletionRates: Record<string, number>;
  }> {
    try {
      // Basic journey counts
      const journeyResult = await sql`
        SELECT
          COUNT(*) as total_journeys,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_journeys,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_journeys
        FROM onboarding_journeys
      `;

      // Average completion time for completed journeys
      const completionResult = await sql`
        SELECT AVG(EXTRACT(EPOCH FROM (completed_at - started_at))/86400) as avg_days
        FROM onboarding_journeys
        WHERE status = 'completed' AND completed_at IS NOT NULL
      `;

      // Phase completion rates
      const phaseResult = await sql`
        SELECT
          journey_phase,
          COUNT(*) as total_attempts,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
        FROM journey_progress
        GROUP BY journey_phase
      `;

      const phaseCompletionRates: Record<string, number> = {};
      phaseResult.rows.forEach(row => {
        const rate = row.total_attempts > 0 ? (row.completed / row.total_attempts) * 100 : 0;
        phaseCompletionRates[row.journey_phase] = Math.round(rate * 100) / 100;
      });

      return {
        totalJourneys: parseInt(journeyResult.rows[0].total_journeys),
        activeJourneys: parseInt(journeyResult.rows[0].active_journeys),
        completedJourneys: parseInt(journeyResult.rows[0].completed_journeys),
        averageCompletionTime: Math.round(parseFloat(completionResult.rows[0].avg_days || '0') * 100) / 100,
        phaseCompletionRates
      };
    } catch (error) {
      console.error('Error getting journey stats:', error);
      return {
        totalJourneys: 0,
        activeJourneys: 0,
        completedJourneys: 0,
        averageCompletionTime: 0,
        phaseCompletionRates: {}
      };
    }
  }

  /**
   * Reset journey for a user (for testing/admin purposes)
   */
  static async resetJourney(userId: number): Promise<boolean> {
    try {
      // Delete journey progress
      await sql`DELETE FROM journey_progress WHERE user_id = ${userId}`;

      // Reset journey to initial state
      await sql`
        UPDATE onboarding_journeys
        SET current_phase = 'welcome',
            current_step = 1,
            status = 'active',
            completed_at = NULL,
            last_activity = NOW()
        WHERE user_id = ${userId}
      `;

      return true;
    } catch (error) {
      console.error('Error resetting journey:', error);
      return false;
    }
  }
}