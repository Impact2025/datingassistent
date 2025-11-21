/**
 * Goals Wizard Service - Hierarchical goal setting system
 * Creates year goals → month goals → week goals with AI assistance
 */

import { sql } from '@vercel/postgres';
import { chatCompletion } from './ai-service';

export interface YearGoal {
  id: number;
  userId: number;
  title: string;
  description?: string;
  category: 'relationship' | 'confidence' | 'profile' | 'social_skills' | 'consistency';
  targetValue?: number;
  aiGenerated: boolean;
  aiConfidence: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MonthGoal {
  id: number;
  userId: number;
  yearGoalId: number;
  period: string; // '2025-01' format
  title: string;
  description?: string;
  category: string;
  targetValue?: number;
  currentValue: number;
  aiGenerated: boolean;
  aiConfidence: number;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface WeekGoal {
  id: number;
  userId: number;
  monthGoalId: number;
  period: string; // '2025-W01' format
  title: string;
  description?: string;
  category: string;
  targetValue?: number;
  currentValue: number;
  aiGenerated: boolean;
  aiConfidence: number;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoalSuggestions {
  yearGoals: Array<{
    title: string;
    description: string;
    category: string;
    reasoning: string;
  }>;
  monthGoals: Array<{
    title: string;
    description: string;
    category: string;
    targetValue?: number;
    reasoning: string;
  }>;
  weekGoals: Array<{
    title: string;
    description: string;
    category: string;
    targetValue?: number;
    reasoning: string;
  }>;
}

export class GoalsWizardService {
  // Predefined goal templates for common scenarios
  private static readonly YEAR_GOAL_TEMPLATES = [
    {
      title: 'Ik wil een serieuze relatie vinden',
      category: 'relationship' as const,
      description: 'Focus op het vinden van een betekenisvolle, langdurige relatie'
    },
    {
      title: 'Ik wil beter worden in flirten & daten',
      category: 'social_skills' as const,
      description: 'Ontwikkel natuurlijke flirtvaardigheden en dating confidence'
    },
    {
      title: 'Ik wil mijn zelfvertrouwen vergroten',
      category: 'confidence' as const,
      description: 'Bouw zelfvertrouwen op in dating en sociale situaties'
    },
    {
      title: 'Ik wil mijn profiel eindelijk op orde hebben',
      category: 'profile' as const,
      description: 'Creeer een profiel dat matches aantrekt'
    },
    {
      title: 'Ik wil 2 dates per maand kunnen krijgen',
      category: 'consistency' as const,
      description: 'Consistent dating momentum opbouwen'
    }
  ];

  /**
   * Get year goal suggestions based on personality scan
   */
  static async getYearGoalSuggestions(userId: number): Promise<GoalSuggestions['yearGoals']> {
    try {
      // Get personality scan data
      const scanResult = await sql`
        SELECT * FROM personality_scans WHERE user_id = ${userId}
      `;

      if (scanResult.rows.length === 0) {
        return this.YEAR_GOAL_TEMPLATES.map(template => ({
          ...template,
          reasoning: 'Standaard doel gebaseerd op veelvoorkomende dating wensen'
        }));
      }

      const scan = scanResult.rows[0];

      // Generate AI-powered suggestions
      const suggestions = await this.generateAISuggestions(scan, 'year');

      return suggestions.yearGoals;
    } catch (error) {
      console.error('Error getting year goal suggestions:', error);
      return this.YEAR_GOAL_TEMPLATES.map(template => ({
        ...template,
        reasoning: 'Standaard doel gebaseerd op veelvoorkomende dating wensen'
      }));
    }
  }

  /**
   * Create a year goal
   */
  static async createYearGoal(
    userId: number,
    goalData: {
      title: string;
      description?: string;
      category: YearGoal['category'];
      targetValue?: number;
      aiGenerated?: boolean;
      aiConfidence?: number;
    }
  ): Promise<YearGoal> {
    try {
      const result = await sql`
        INSERT INTO goal_hierarchies (
          user_id, goal_type, title, description, category, target_value,
          ai_generated, ai_confidence
        )
        VALUES (
          ${userId}, 'year', ${goalData.title}, ${goalData.description},
          ${goalData.category}, ${goalData.targetValue},
          ${goalData.aiGenerated || false}, ${goalData.aiConfidence || 0}
        )
        RETURNING *
      `;

      const row = result.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        title: row.title,
        description: row.description,
        category: row.category,
        targetValue: row.target_value,
        aiGenerated: row.ai_generated,
        aiConfidence: row.ai_confidence,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    } catch (error) {
      console.error('Error creating year goal:', error);
      throw error;
    }
  }

  /**
   * Generate month goals based on year goal
   */
  static async generateMonthGoals(userId: number, yearGoalId: number): Promise<MonthGoal[]> {
    try {
      // Get year goal
      const yearGoalResult = await sql`
        SELECT * FROM goal_hierarchies WHERE id = ${yearGoalId} AND user_id = ${userId}
      `;

      if (yearGoalResult.rows.length === 0) {
        throw new Error('Year goal not found');
      }

      const yearGoal = yearGoalResult.rows[0];

      // Get personality scan for personalization
      const scanResult = await sql`
        SELECT * FROM personality_scans WHERE user_id = ${userId}
      `;

      const scan = scanResult.rows[0];

      // Generate AI month goals
      const monthGoals = await this.generateMonthGoalsFromYear(yearGoal, scan);

      // Save month goals
      const savedGoals: MonthGoal[] = [];
      const currentDate = new Date();

      for (let i = 0; i < 3; i++) { // Next 3 months
        const monthDate = new Date(currentDate);
        monthDate.setMonth(currentDate.getMonth() + i);

        const period = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;

        if (monthGoals[i]) {
          const goalData = monthGoals[i];
          const result = await sql`
            INSERT INTO goal_hierarchies (
              user_id, goal_type, goal_period, title, description, category,
              target_value, parent_goal_id, ai_generated, ai_confidence
            )
            VALUES (
              ${userId}, 'month', ${period}, ${goalData.title}, ${goalData.description},
              ${goalData.category}, ${goalData.targetValue}, ${yearGoalId},
              true, ${goalData.aiConfidence || 0.8}
            )
            RETURNING *
          `;

          const row = result.rows[0];
          savedGoals.push({
            id: row.id,
            userId: row.user_id,
            yearGoalId: row.parent_goal_id,
            period: row.goal_period,
            title: row.title,
            description: row.description,
            category: row.category,
            targetValue: row.target_value,
            currentValue: row.current_value,
            aiGenerated: row.ai_generated,
            aiConfidence: row.ai_confidence,
            createdAt: row.created_at,
            updatedAt: row.updated_at
          });
        }
      }

      return savedGoals;
    } catch (error) {
      console.error('Error generating month goals:', error);
      throw error;
    }
  }

  /**
   * Generate week goals based on month goal
   */
  static async generateWeekGoals(userId: number, monthGoalId: number): Promise<WeekGoal[]> {
    try {
      // Get month goal
      const monthGoalResult = await sql`
        SELECT * FROM goal_hierarchies WHERE id = ${monthGoalId} AND user_id = ${userId}
      `;

      if (monthGoalResult.rows.length === 0) {
        throw new Error('Month goal not found');
      }

      const monthGoal = monthGoalResult.rows[0];

      // Get personality scan for personalization
      const scanResult = await sql`
        SELECT * FROM personality_scans WHERE user_id = ${userId}
      `;

      const scan = scanResult.rows[0];

      // Generate AI week goals
      const weekGoals = await this.generateWeekGoalsFromMonth(monthGoal, scan);

      // Save week goals
      const savedGoals: WeekGoal[] = [];
      const currentDate = new Date();

      for (let i = 0; i < 4; i++) { // Next 4 weeks
        const weekDate = new Date(currentDate);
        weekDate.setDate(currentDate.getDate() + (i * 7));

        const year = weekDate.getFullYear();
        const month = weekDate.getMonth() + 1;
        const day = weekDate.getDate();
        const weekNum = Math.ceil((day - weekDate.getDay() + 1) / 7);
        const period = `${year}-W${String(weekNum).padStart(2, '0')}`;

        if (weekGoals[i]) {
          const goalData = weekGoals[i];
          const result = await sql`
            INSERT INTO goal_hierarchies (
              user_id, goal_type, goal_period, title, description, category,
              target_value, parent_goal_id, ai_generated, ai_confidence
            )
            VALUES (
              ${userId}, 'week', ${period}, ${goalData.title}, ${goalData.description},
              ${goalData.category}, ${goalData.targetValue}, ${monthGoalId},
              true, ${goalData.aiConfidence || 0.8}
            )
            RETURNING *
          `;

          const row = result.rows[0];
          savedGoals.push({
            id: row.id,
            userId: row.user_id,
            monthGoalId: row.parent_goal_id,
            period: row.goal_period,
            title: row.title,
            description: row.description,
            category: row.category,
            targetValue: row.target_value,
            currentValue: row.current_value,
            aiGenerated: row.ai_generated,
            aiConfidence: row.ai_confidence,
            createdAt: row.created_at,
            updatedAt: row.updated_at
          });
        }
      }

      return savedGoals;
    } catch (error) {
      console.error('Error generating week goals:', error);
      throw error;
    }
  }

  /**
   * Get user's goal hierarchy
   */
  static async getGoalHierarchy(userId: number): Promise<{
    yearGoals: YearGoal[];
    monthGoals: MonthGoal[];
    weekGoals: WeekGoal[];
  }> {
    try {
      // Get year goals
      const yearResult = await sql`
        SELECT * FROM goal_hierarchies
        WHERE user_id = ${userId} AND goal_type = 'year'
        ORDER BY created_at DESC
      `;

      const yearGoals: YearGoal[] = yearResult.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        title: row.title,
        description: row.description,
        category: row.category,
        targetValue: row.target_value,
        aiGenerated: row.ai_generated,
        aiConfidence: row.ai_confidence,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));

      // Get month goals
      const monthResult = await sql`
        SELECT * FROM goal_hierarchies
        WHERE user_id = ${userId} AND goal_type = 'month'
        ORDER BY goal_period DESC
      `;

      const monthGoals: MonthGoal[] = monthResult.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        yearGoalId: row.parent_goal_id,
        period: row.goal_period,
        title: row.title,
        description: row.description,
        category: row.category,
        targetValue: row.target_value,
        currentValue: row.current_value,
        aiGenerated: row.ai_generated,
        aiConfidence: row.ai_confidence,
        completedAt: row.completed_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));

      // Get week goals
      const weekResult = await sql`
        SELECT * FROM goal_hierarchies
        WHERE user_id = ${userId} AND goal_type = 'week'
        ORDER BY goal_period DESC
      `;

      const weekGoals: WeekGoal[] = weekResult.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        monthGoalId: row.parent_goal_id,
        period: row.goal_period,
        title: row.title,
        description: row.description,
        category: row.category,
        targetValue: row.target_value,
        currentValue: row.current_value,
        aiGenerated: row.ai_generated,
        aiConfidence: row.ai_confidence,
        completedAt: row.completed_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));

      return {
        yearGoals,
        monthGoals,
        weekGoals
      };
    } catch (error) {
      console.error('Error getting goal hierarchy:', error);
      return {
        yearGoals: [],
        monthGoals: [],
        weekGoals: []
      };
    }
  }

  /**
   * Update goal progress
   */
  static async updateGoalProgress(
    goalId: number,
    userId: number,
    newValue: number,
    notes?: string
  ): Promise<boolean> {
    try {
      // Update goal
      await sql`
        UPDATE goal_hierarchies
        SET current_value = ${newValue}, updated_at = NOW()
        WHERE id = ${goalId} AND user_id = ${userId}
      `;

      // Add progress entry
      await sql`
        INSERT INTO goal_progress (goal_id, user_id, progress_value, notes)
        VALUES (${goalId}, ${userId}, ${newValue}, ${notes})
      `;

      // Check if goal is completed
      const goalResult = await sql`
        SELECT * FROM goal_hierarchies WHERE id = ${goalId} AND user_id = ${userId}
      `;

      if (goalResult.rows.length > 0) {
        const goal = goalResult.rows[0];
        if (goal.target_value && goal.current_value >= goal.target_value) {
          await sql`
            UPDATE goal_hierarchies
            SET status = 'completed', completed_at = NOW()
            WHERE id = ${goalId}
          `;
        }
      }

      return true;
    } catch (error) {
      console.error('Error updating goal progress:', error);
      return false;
    }
  }

  /**
   * Generate AI suggestions for all goal levels
   */
  private static async generateAISuggestions(scan: any, level: 'year' | 'month' | 'week'): Promise<GoalSuggestions> {
    try {
      const prompt = this.buildGoalSuggestionPrompt(scan, level);

      const response = await chatCompletion([
        {
          role: 'system',
          content: 'Je bent een expert dating coach die helpt met het stellen van realistische, motiverende doelen. Focus op haalbare stappen die leiden tot echte verandering.'
        },
        {
          role: 'user',
          content: prompt
        }
      ], { maxTokens: 1500, temperature: 0.7 });

      return this.parseGoalSuggestions(response);
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      return this.getFallbackSuggestions(level);
    }
  }

  /**
   * Build AI prompt for goal suggestions
   */
  private static buildGoalSuggestionPrompt(scan: any, level: string): string {
    const baseInfo = `
Gebruiker profiel:
- Huidige situatie: ${scan.current_situation}
- Comfort level: ${scan.comfort_level}/10
- Hoofd uitdaging: ${scan.main_challenge}
- Gewenst resultaat: ${scan.desired_outcome}
- Sterkte zelf: ${scan.strength_self}
- Zwakte zelf: ${scan.weakness_self}
- Wekelijks commitment: ${scan.weekly_commitment}
`;

    switch (level) {
      case 'year':
        return `${baseInfo}

Stel 5 gepersonaliseerde jaar doelen voor die aansluiten bij deze persoon. Elk doel moet:
- Specifiek en meetbaar zijn
- Realistisch voor hun situatie
- Motiverend en positief
- Categorie: relationship, confidence, profile, social_skills, of consistency

Format: JSON array met objecten {title, description, category, reasoning}
`;

      case 'month':
        return `${baseInfo}

Gegeven het jaar doel, stel 3 maandelijkse mijlpalen voor die haalbaar zijn binnen 30 dagen.

Format: JSON array met objecten {title, description, category, targetValue?, reasoning}
`;

      case 'week':
        return `${baseInfo}

Stel 4 wekelijkse acties voor die direct impact hebben. Mix van sociaal, praktisch en mindset.

Format: JSON array met objecten {title, description, category, targetValue?, reasoning}
`;
    }

    // Default fallback
    return `${baseInfo}

Stel 3 algemene doelen voor die aansluiten bij deze persoon.

Format: JSON array met objecten {title, description, category, reasoning}
`;
  }

  /**
   * Parse AI response into structured suggestions
   */
  private static parseGoalSuggestions(response: string): GoalSuggestions {
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('No JSON found');

      const suggestions = JSON.parse(jsonMatch[0]);

      return {
        yearGoals: suggestions.filter((s: any) => s.category),
        monthGoals: suggestions.filter((s: any) => s.category),
        weekGoals: suggestions.filter((s: any) => s.category)
      };
    } catch (error) {
      console.error('Error parsing goal suggestions:', error);
      return this.getFallbackSuggestions('year');
    }
  }

  /**
   * Generate month goals from year goal
   */
  private static async generateMonthGoalsFromYear(yearGoal: any, scan: any): Promise<any[]> {
    // Simplified implementation - in production this would use AI
    const goals = [];

    switch (yearGoal.category) {
      case 'relationship':
        goals.push(
          { title: 'Profiel optimaliseren voor kwaliteit matches', category: 'profile', targetValue: 1, aiConfidence: 0.9 },
          { title: '5 betekenisvolle gesprekken voeren', category: 'social_skills', targetValue: 5, aiConfidence: 0.8 },
          { title: '2 dates plannen en uitvoeren', category: 'consistency', targetValue: 2, aiConfidence: 0.7 }
        );
        break;
      case 'confidence':
        goals.push(
          { title: 'Dagelijks 1 compliment geven/ontvangen', category: 'confidence', targetValue: 30, aiConfidence: 0.9 },
          { title: 'Profiel foto\'s vernieuwen', category: 'profile', targetValue: 1, aiConfidence: 0.8 },
          { title: '3 nieuwe mensen aanspreken', category: 'social_skills', targetValue: 3, aiConfidence: 0.7 }
        );
        break;
      default:
        goals.push(
          { title: 'Profiel basis op orde', category: 'profile', targetValue: 1, aiConfidence: 0.8 },
          { title: 'Eerste berichten oefenen', category: 'social_skills', targetValue: 5, aiConfidence: 0.7 },
          { title: 'Wekelijks actief zijn', category: 'consistency', targetValue: 4, aiConfidence: 0.6 }
        );
    }

    return goals;
  }

  /**
   * Generate week goals from month goal
   */
  private static async generateWeekGoalsFromMonth(monthGoal: any, scan: any): Promise<any[]> {
    // Simplified implementation
    const goals = [
      { title: 'Stuur 3 berichten naar matches', category: 'social_skills', targetValue: 3, aiConfidence: 0.8 },
      { title: 'Update 2 profiel foto\'s', category: 'profile', targetValue: 2, aiConfidence: 0.9 },
      { title: 'Oefen dagelijks zelfvertrouwen', category: 'confidence', targetValue: 7, aiConfidence: 0.7 },
      { title: 'Lees 1 artikel over dating', category: 'consistency', targetValue: 1, aiConfidence: 0.6 }
    ];

    return goals;
  }

  /**
   * Get fallback suggestions when AI fails
   */
  private static getFallbackSuggestions(level: string): GoalSuggestions {
    const fallbacks = {
      yearGoals: this.YEAR_GOAL_TEMPLATES.map(t => ({ ...t, reasoning: 'Standaard doel voor de meeste singles' })),
      monthGoals: [
        { title: 'Profiel foto\'s verbeteren', category: 'profile', reasoning: 'Basis voor goede matches' },
        { title: 'Bio tekst schrijven', category: 'profile', reasoning: 'Vertel je verhaal' },
        { title: 'Eerste berichten oefenen', category: 'social_skills', reasoning: 'Start gesprekken' }
      ],
      weekGoals: [
        { title: 'Maak 3 nieuwe foto\'s', category: 'profile', reasoning: 'Betere eerste indruk' },
        { title: 'Schrijf je profiel tekst', category: 'profile', reasoning: 'Laat zien wie je bent' },
        { title: 'Stuur 2 berichten', category: 'social_skills', reasoning: 'Begin met oefenen' },
        { title: 'Wees 3 dagen actief', category: 'consistency', reasoning: 'Bouw momentum op' }
      ]
    };

    return fallbacks as GoalSuggestions;
  }

  /**
   * Get goal completion statistics
   */
  static async getGoalStatistics(userId: number): Promise<{
    totalGoals: number;
    completedGoals: number;
    completionRate: number;
    goalsByCategory: Record<string, number>;
    averageCompletionTime: number;
  }> {
    try {
      const result = await sql`
        SELECT
          COUNT(*) as total_goals,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_goals,
          category
        FROM goal_hierarchies
        WHERE user_id = ${userId}
        GROUP BY category
      `;

      const totalGoals = result.rows.reduce((sum, row) => sum + parseInt(row.total_goals), 0);
      const completedGoals = result.rows.reduce((sum, row) => sum + parseInt(row.completed_goals), 0);
      const completionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

      const goalsByCategory: Record<string, number> = {};
      result.rows.forEach(row => {
        goalsByCategory[row.category] = parseInt(row.completed_goals);
      });

      return {
        totalGoals,
        completedGoals,
        completionRate: Math.round(completionRate * 100) / 100,
        goalsByCategory,
        averageCompletionTime: 0 // Would need more complex calculation
      };
    } catch (error) {
      console.error('Error getting goal statistics:', error);
      return {
        totalGoals: 0,
        completedGoals: 0,
        completionRate: 0,
        goalsByCategory: {},
        averageCompletionTime: 0
      };
    }
  }
}