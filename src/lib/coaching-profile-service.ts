/**
 * Coaching Profile Service - Unified coaching context for users
 * Integrates personality scan, goals, progress, and recommendations
 *
 * @author DatingAssistent
 * @version 1.0.0
 */

import { sql } from '@vercel/postgres';

// ============================================
// TYPES & INTERFACES
// ============================================

export type CoachingPhase = 'intake' | 'foundation' | 'skills' | 'mastery' | 'maintenance';
export type LearningStyle = 'visual' | 'hands-on' | 'reading' | 'mixed';
export type PacePreference = 'slow' | 'medium' | 'fast';

export interface CoachingProfile {
  // Identification
  id: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;

  // Personality & Assessment Data
  personalityType: string | null; // e.g. "Authentieke Charmeur"
  comfortLevel: number; // 1-10 from scan
  primaryGoal: string | null; // 'relationship', 'confidence', etc
  mainChallenge: string | null;
  strengths: string[]; // From scan + detected
  growthAreas: string[]; // Areas to improve

  // Current Journey Status
  currentPhase: CoachingPhase;
  journeyDay: number;
  completedSteps: string[]; // ['personality_scan', 'coach_advice', 'first_tool']
  activeGoals: number[]; // Goal IDs

  // Coach Recommendations
  recommendedTools: string[]; // ['profiel-coach', 'foto-advies']
  nextAction: string | null; // "Update je profielfoto's"
  weeklyFocus: string | null; // "Profiel optimaliseren"
  coachAdviceGiven: boolean;

  // Progress & Engagement Metrics
  toolsUsed: Record<string, number>; // { 'profiel-coach': 5, 'chat-coach': 12 }
  skillLevels: Record<string, number>; // { 'profile_writing': 7, 'photo_selection': 5 }
  badges: string[]; // Badge IDs earned
  currentStreak: number;
  longestStreak: number;

  // Personalization Preferences
  learningStyle: LearningStyle;
  pacePreference: PacePreference;
  timeCommitment: string; // '1-2h', '3-5h', '5h_plus'

  // Metadata
  lastActiveAt: Date;
  totalTimeSpent: number; // minutes
}

export interface CreateCoachingProfileData {
  userId: number;
  personalityType?: string;
  comfortLevel?: number;
  primaryGoal?: string;
  mainChallenge?: string;
  timeCommitment?: string;
}

export interface UpdateCoachingProfileData {
  personalityType?: string;
  comfortLevel?: number;
  primaryGoal?: string;
  mainChallenge?: string;
  strengths?: string[];
  growthAreas?: string[];
  currentPhase?: CoachingPhase;
  completedSteps?: string[];
  recommendedTools?: string[];
  nextAction?: string;
  weeklyFocus?: string;
  coachAdviceGiven?: boolean;
  toolsUsed?: Record<string, number>;
  skillLevels?: Record<string, number>;
  learningStyle?: LearningStyle;
  pacePreference?: PacePreference;
  timeCommitment?: string;
}

// ============================================
// MAIN SERVICE CLASS
// ============================================

export class CoachingProfileService {

  /**
   * Get or create coaching profile for user
   */
  static async getOrCreateProfile(userId: number): Promise<CoachingProfile | null> {
    try {
      // Try to get existing profile
      const existing = await this.getProfile(userId);
      if (existing) {
        return existing;
      }

      // Create new profile
      return await this.createProfile({ userId });
    } catch (error) {
      console.error('Error in getOrCreateProfile:', error);
      return null;
    }
  }

  /**
   * Get coaching profile by user ID
   */
  static async getProfile(userId: number): Promise<CoachingProfile | null> {
    try {
      const result = await sql`
        SELECT * FROM coaching_profiles WHERE user_id = ${userId}
      `;

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToProfile(result.rows[0]);
    } catch (error) {
      console.error('Error getting coaching profile:', error);
      return null;
    }
  }

  /**
   * Create new coaching profile
   */
  static async createProfile(data: CreateCoachingProfileData): Promise<CoachingProfile | null> {
    try {
      const result = await sql`
        INSERT INTO coaching_profiles (
          user_id,
          personality_type,
          comfort_level,
          primary_goal,
          main_challenge,
          strengths,
          growth_areas,
          current_phase,
          journey_day,
          completed_steps,
          active_goals,
          recommended_tools,
          next_action,
          weekly_focus,
          coach_advice_given,
          tools_used,
          skill_levels,
          badges,
          current_streak,
          longest_streak,
          learning_style,
          pace_preference,
          time_commitment,
          last_active_at,
          total_time_spent
        ) VALUES (
          ${data.userId},
          ${data.personalityType || null},
          ${data.comfortLevel || 5},
          ${data.primaryGoal || null},
          ${data.mainChallenge || null},
          ${JSON.stringify([])},
          ${JSON.stringify([])},
          ${'intake'},
          ${1},
          ${JSON.stringify([])},
          ${JSON.stringify([])},
          ${JSON.stringify([])},
          ${null},
          ${null},
          ${false},
          ${JSON.stringify({})},
          ${JSON.stringify({})},
          ${JSON.stringify([])},
          ${0},
          ${0},
          ${'mixed'},
          ${'medium'},
          ${data.timeCommitment || '3-5h'},
          ${new Date().toISOString()},
          ${0}
        )
        RETURNING *
      `;

      return this.mapRowToProfile(result.rows[0]);
    } catch (error) {
      console.error('Error creating coaching profile:', error);
      return null;
    }
  }

  /**
   * Update coaching profile
   */
  static async updateProfile(
    userId: number,
    updates: UpdateCoachingProfileData
  ): Promise<CoachingProfile | null> {
    try {
      // Build update query dynamically
      const updateFields: string[] = [];
      const values: any[] = [];
      let paramCounter = 1;

      if (updates.personalityType !== undefined) {
        updateFields.push(`personality_type = $${paramCounter++}`);
        values.push(updates.personalityType);
      }
      if (updates.comfortLevel !== undefined) {
        updateFields.push(`comfort_level = $${paramCounter++}`);
        values.push(updates.comfortLevel);
      }
      if (updates.primaryGoal !== undefined) {
        updateFields.push(`primary_goal = $${paramCounter++}`);
        values.push(updates.primaryGoal);
      }
      if (updates.mainChallenge !== undefined) {
        updateFields.push(`main_challenge = $${paramCounter++}`);
        values.push(updates.mainChallenge);
      }
      if (updates.strengths !== undefined) {
        updateFields.push(`strengths = $${paramCounter++}`);
        values.push(JSON.stringify(updates.strengths));
      }
      if (updates.growthAreas !== undefined) {
        updateFields.push(`growth_areas = $${paramCounter++}`);
        values.push(JSON.stringify(updates.growthAreas));
      }
      if (updates.currentPhase !== undefined) {
        updateFields.push(`current_phase = $${paramCounter++}`);
        values.push(updates.currentPhase);
      }
      if (updates.completedSteps !== undefined) {
        updateFields.push(`completed_steps = $${paramCounter++}`);
        values.push(JSON.stringify(updates.completedSteps));
      }
      if (updates.recommendedTools !== undefined) {
        updateFields.push(`recommended_tools = $${paramCounter++}`);
        values.push(JSON.stringify(updates.recommendedTools));
      }
      if (updates.nextAction !== undefined) {
        updateFields.push(`next_action = $${paramCounter++}`);
        values.push(updates.nextAction);
      }
      if (updates.weeklyFocus !== undefined) {
        updateFields.push(`weekly_focus = $${paramCounter++}`);
        values.push(updates.weeklyFocus);
      }
      if (updates.coachAdviceGiven !== undefined) {
        updateFields.push(`coach_advice_given = $${paramCounter++}`);
        values.push(updates.coachAdviceGiven);
      }
      if (updates.toolsUsed !== undefined) {
        updateFields.push(`tools_used = $${paramCounter++}`);
        values.push(JSON.stringify(updates.toolsUsed));
      }
      if (updates.skillLevels !== undefined) {
        updateFields.push(`skill_levels = $${paramCounter++}`);
        values.push(JSON.stringify(updates.skillLevels));
      }
      if (updates.learningStyle !== undefined) {
        updateFields.push(`learning_style = $${paramCounter++}`);
        values.push(updates.learningStyle);
      }
      if (updates.pacePreference !== undefined) {
        updateFields.push(`pace_preference = $${paramCounter++}`);
        values.push(updates.pacePreference);
      }
      if (updates.timeCommitment !== undefined) {
        updateFields.push(`time_commitment = $${paramCounter++}`);
        values.push(updates.timeCommitment);
      }

      // Always update updated_at and last_active_at
      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      updateFields.push(`last_active_at = CURRENT_TIMESTAMP`);

      if (updateFields.length === 2) {
        // No fields to update except timestamps
        return await this.getProfile(userId);
      }

      values.push(userId);

      const query = `
        UPDATE coaching_profiles
        SET ${updateFields.join(', ')}
        WHERE user_id = $${paramCounter}
        RETURNING *
      `;

      const result = await sql.query(query, values);

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToProfile(result.rows[0]);
    } catch (error) {
      console.error('Error updating coaching profile:', error);
      return null;
    }
  }

  /**
   * Mark a step as completed
   */
  static async completeStep(userId: number, stepName: string): Promise<boolean> {
    try {
      const profile = await this.getProfile(userId);
      if (!profile) return false;

      if (profile.completedSteps.includes(stepName)) {
        return true; // Already completed
      }

      const updatedSteps = [...profile.completedSteps, stepName];

      await this.updateProfile(userId, {
        completedSteps: updatedSteps
      });

      // Check if we should advance phase
      await this.checkPhaseAdvancement(userId, updatedSteps);

      return true;
    } catch (error) {
      console.error('Error completing step:', error);
      return false;
    }
  }

  /**
   * Track tool usage
   */
  static async trackToolUsage(userId: number, toolName: string): Promise<boolean> {
    try {
      const profile = await this.getProfile(userId);
      if (!profile) return false;

      const updatedToolsUsed = { ...profile.toolsUsed };
      updatedToolsUsed[toolName] = (updatedToolsUsed[toolName] || 0) + 1;

      await this.updateProfile(userId, {
        toolsUsed: updatedToolsUsed
      });

      return true;
    } catch (error) {
      console.error('Error tracking tool usage:', error);
      return false;
    }
  }

  /**
   * Update skill level
   */
  static async updateSkillLevel(
    userId: number,
    skillName: string,
    newLevel: number
  ): Promise<boolean> {
    try {
      const profile = await this.getProfile(userId);
      if (!profile) return false;

      const updatedSkills = { ...profile.skillLevels };
      updatedSkills[skillName] = Math.max(0, Math.min(10, newLevel)); // Clamp 0-10

      await this.updateProfile(userId, {
        skillLevels: updatedSkills
      });

      return true;
    } catch (error) {
      console.error('Error updating skill level:', error);
      return false;
    }
  }

  /**
   * Populate profile from personality scan
   */
  static async populateFromPersonalityScan(userId: number): Promise<CoachingProfile | null> {
    try {
      // Get personality scan data
      const scanResult = await sql`
        SELECT * FROM personality_scans WHERE user_id = ${userId}
      `;

      if (scanResult.rows.length === 0) {
        console.log('No personality scan found for user:', userId);
        return null;
      }

      const scan = scanResult.rows[0];

      // Map scan data to coaching profile
      const updates: UpdateCoachingProfileData = {
        comfortLevel: scan.comfort_level || 5,
        primaryGoal: scan.desired_outcome,
        mainChallenge: scan.main_challenge,
        timeCommitment: scan.weekly_commitment,
        strengths: scan.strength_self ? [scan.strength_self] : [],
        growthAreas: scan.weakness_self ? [scan.weakness_self] : []
      };

      // If AI profile was generated, use that too
      if (scan.ai_generated_profile) {
        const aiProfile = typeof scan.ai_generated_profile === 'string'
          ? JSON.parse(scan.ai_generated_profile)
          : scan.ai_generated_profile;

        if (aiProfile.personalityType) {
          updates.personalityType = aiProfile.personalityType;
        }
        if (aiProfile.coreStrengths) {
          updates.strengths = aiProfile.coreStrengths;
        }
        if (aiProfile.growthAreas) {
          updates.growthAreas = aiProfile.growthAreas;
        }
      }

      return await this.updateProfile(userId, updates);
    } catch (error) {
      console.error('Error populating from personality scan:', error);
      return null;
    }
  }

  /**
   * Set coach recommendations (from coach advice)
   */
  static async setCoachRecommendations(
    userId: number,
    recommendations: {
      tools: string[];
      nextAction: string;
      weeklyFocus: string;
    }
  ): Promise<boolean> {
    try {
      await this.updateProfile(userId, {
        recommendedTools: recommendations.tools,
        nextAction: recommendations.nextAction,
        weeklyFocus: recommendations.weeklyFocus,
        coachAdviceGiven: true
      });

      await this.completeStep(userId, 'coach_advice');

      return true;
    } catch (error) {
      console.error('Error setting coach recommendations:', error);
      return false;
    }
  }

  /**
   * Get next recommended action for user
   */
  static async getNextAction(userId: number): Promise<{
    action: string;
    tool?: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
  } | null> {
    try {
      const profile = await this.getProfile(userId);
      if (!profile) return null;

      // Check if personality scan not completed
      if (!profile.completedSteps.includes('personality_scan')) {
        return {
          action: 'Voltooi je persoonlijkheidsscan',
          tool: 'skills-assessment',
          reason: 'We hebben deze informatie nodig om je te kunnen helpen',
          priority: 'high'
        };
      }

      // Check if coach advice not seen
      if (!profile.coachAdviceGiven) {
        return {
          action: 'Bekijk je persoonlijke coach advies',
          tool: 'coach-advice',
          reason: 'Je coach heeft een plan voor je klaar staan',
          priority: 'high'
        };
      }

      // Check if recommended tools not used
      if (profile.recommendedTools.length > 0) {
        const unusedTools = profile.recommendedTools.filter(
          tool => !profile.toolsUsed[tool] || profile.toolsUsed[tool] === 0
        );

        if (unusedTools.length > 0) {
          return {
            action: profile.nextAction || `Start met ${unusedTools[0]}`,
            tool: unusedTools[0],
            reason: 'Je coach raadt aan om hiermee te starten',
            priority: 'high'
          };
        }
      }

      // Check active goals
      if (profile.activeGoals.length > 0) {
        return {
          action: 'Werk aan je actieve doelen',
          tool: 'doelen',
          reason: 'Je hebt doelen die aandacht nodig hebben',
          priority: 'medium'
        };
      }

      // Default: explore tools
      return {
        action: 'Verken de beschikbare tools',
        tool: 'dashboard',
        reason: 'Je bent klaar voor de volgende stap',
        priority: 'low'
      };
    } catch (error) {
      console.error('Error getting next action:', error);
      return null;
    }
  }

  /**
   * Check if user should advance to next phase
   */
  private static async checkPhaseAdvancement(
    userId: number,
    completedSteps: string[]
  ): Promise<void> {
    try {
      const profile = await this.getProfile(userId);
      if (!profile) return;

      let newPhase: CoachingPhase | null = null;

      // Intake → Foundation: After coach advice and first tool use
      if (profile.currentPhase === 'intake') {
        if (
          completedSteps.includes('coach_advice') &&
          Object.keys(profile.toolsUsed).length > 0
        ) {
          newPhase = 'foundation';
        }
      }

      // Foundation → Skills: After using 3 different tools
      if (profile.currentPhase === 'foundation') {
        if (Object.keys(profile.toolsUsed).length >= 3) {
          newPhase = 'skills';
        }
      }

      // Skills → Mastery: After 7 days and using 5+ tools
      if (profile.currentPhase === 'skills') {
        if (
          profile.journeyDay >= 7 &&
          Object.keys(profile.toolsUsed).length >= 5
        ) {
          newPhase = 'mastery';
        }
      }

      // Mastery → Maintenance: After 30 days
      if (profile.currentPhase === 'mastery') {
        if (profile.journeyDay >= 30) {
          newPhase = 'maintenance';
        }
      }

      if (newPhase) {
        await this.updateProfile(userId, { currentPhase: newPhase });
      }
    } catch (error) {
      console.error('Error checking phase advancement:', error);
    }
  }

  /**
   * Increment journey day (should be called daily via cron)
   */
  static async incrementJourneyDay(userId: number): Promise<boolean> {
    try {
      await sql`
        UPDATE coaching_profiles
        SET journey_day = journey_day + 1
        WHERE user_id = ${userId}
      `;
      return true;
    } catch (error) {
      console.error('Error incrementing journey day:', error);
      return false;
    }
  }

  /**
   * Map database row to CoachingProfile interface
   */
  private static mapRowToProfile(row: any): CoachingProfile {
    return {
      id: row.id,
      userId: row.user_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      personalityType: row.personality_type,
      comfortLevel: row.comfort_level,
      primaryGoal: row.primary_goal,
      mainChallenge: row.main_challenge,
      strengths: this.parseJSON(row.strengths, []),
      growthAreas: this.parseJSON(row.growth_areas, []),
      currentPhase: row.current_phase,
      journeyDay: row.journey_day,
      completedSteps: this.parseJSON(row.completed_steps, []),
      activeGoals: this.parseJSON(row.active_goals, []),
      recommendedTools: this.parseJSON(row.recommended_tools, []),
      nextAction: row.next_action,
      weeklyFocus: row.weekly_focus,
      coachAdviceGiven: row.coach_advice_given,
      toolsUsed: this.parseJSON(row.tools_used, {}),
      skillLevels: this.parseJSON(row.skill_levels, {}),
      badges: this.parseJSON(row.badges, []),
      currentStreak: row.current_streak,
      longestStreak: row.longest_streak,
      learningStyle: row.learning_style,
      pacePreference: row.pace_preference,
      timeCommitment: row.time_commitment,
      lastActiveAt: new Date(row.last_active_at),
      totalTimeSpent: row.total_time_spent
    };
  }

  /**
   * Safely parse JSON field
   */
  private static parseJSON(value: any, defaultValue: any): any {
    if (!value) return defaultValue;
    if (typeof value === 'object') return value;
    try {
      return JSON.parse(value);
    } catch {
      return defaultValue;
    }
  }
}
