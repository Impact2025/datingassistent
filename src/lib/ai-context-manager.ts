/**
 * AI Context Manager - Cross-tool memory system
 * Manages user preferences, personality data, and AI insights across all tools
 */

import { sql } from '@vercel/postgres';

export interface UserAIContext {
  // Basic user info
  userId: number;
  name?: string;
  age?: number;
  gender?: string;

  // Personality & preferences
  personalityType?: string;
  communicationStyle?: 'casual' | 'formal' | 'flirty' | 'intellectual' | 'funny';
  energyLevel?: 'low' | 'medium' | 'high';
  humorStyle?: string;

  // Dating preferences
  lookingFor?: string;
  relationshipGoals?: string[];
  dealBreakers?: string[];

  // Interests & hobbies
  interests?: string[];
  hobbies?: string[];

  // Communication patterns
  preferredTopics?: string[];
  conversationStarters?: string[];
  successfulOpeners?: string[];

  // AI tool usage history
  toolUsage?: {
    chatCoach: number;
    openers: number;
    icebreakers: number;
    safetyCheck: number;
    profileBuilder: number;
    photoAnalysis: number;
    platformMatch: number;
  };

  // Success metrics
  matchRate?: number;
  responseRate?: number;
  dateSuccessRate?: number;

  // Date analysis history
  dateAnalysisHistory?: {
    totalAnalyses: number;
    lastAnalysisDate?: Date;
    commonThemes?: string[];
    improvementAreas?: string[];
    strengths?: string[];
    datePatterns?: {
      successfulElements?: string[];
      challenges?: string[];
      preferences?: string[];
    };
  };

  // Pro Welcome Data
  proWelcomeCompleted?: boolean;
  writingStyle?: 'informeel_speels' | 'warm_empathisch' | 'zelfverzekerd_direct' | 'rustig_duidelijk' | 'neutraal';
  datingApps?: string[];
  genderPreference?: 'mannen' | 'vrouwen' | 'iedereen';
  reminderPreference?: 'ja_graag' | 'nee' | 'later_beslissen';
  proWelcomeCompletedAt?: Date;

  // Last updated
  lastUpdated: Date;
}

export class AIContextManager {
  /**
   * Get user's AI context from database
   */
  static async getUserContext(userId: number): Promise<UserAIContext | null> {
    try {
      // For development, return a basic context if database is not available
      if (process.env.NODE_ENV === 'development' && !process.env.POSTGRES_URL) {
        console.log('⚠️ Database not configured in development, returning basic context');
        return {
          userId,
          communicationStyle: 'casual',
          energyLevel: 'medium',
          toolUsage: {
            chatCoach: 0,
            openers: 0,
            icebreakers: 0,
            safetyCheck: 0,
            profileBuilder: 0,
            photoAnalysis: 0,
            platformMatch: 0
          },
          lastUpdated: new Date()
        };
      }

      const result = await sql`
        SELECT ai_context FROM users WHERE id = ${userId}
      `;

      if (result.rows.length === 0 || !result.rows[0].ai_context) {
        return null;
      }

      const contextData = result.rows[0].ai_context;
      // Handle case where ai_context might be stored as JSON object instead of string
      if (typeof contextData === 'object') {
        return contextData as UserAIContext;
      }

      return JSON.parse(contextData);
    } catch (error) {
      console.error('Error getting user AI context:', error);
      // Return basic context as fallback
      return {
        userId,
        communicationStyle: 'casual',
        energyLevel: 'medium',
        toolUsage: {
          chatCoach: 0,
          openers: 0,
          icebreakers: 0,
          safetyCheck: 0,
          profileBuilder: 0,
          photoAnalysis: 0,
          platformMatch: 0
        },
        lastUpdated: new Date()
      };
    }
  }

  /**
   * Save user's AI context to database
   */
  static async saveUserContext(userId: number, context: Partial<UserAIContext>): Promise<void> {
    try {
      // For development, skip database save if not configured
      if (process.env.NODE_ENV === 'development' && !process.env.POSTGRES_URL) {
        console.log(`⚠️ Database not configured in development, skipping AI context save for user ${userId}`);
        return;
      }

      // Get existing context
      const existingContext = await this.getUserContext(userId) || {
        userId,
        lastUpdated: new Date()
      };

      // Merge with new data
      const updatedContext: UserAIContext = {
        ...existingContext,
        ...context,
        userId,
        lastUpdated: new Date()
      };

      await sql`
        UPDATE users
        SET ai_context = ${JSON.stringify(updatedContext)}
        WHERE id = ${userId}
      `;

      console.log(`✅ AI context saved for user ${userId}`);
    } catch (error) {
      console.error('Error saving user AI context:', error);
      // Don't throw error in development to prevent breaking functionality
      if (process.env.NODE_ENV !== 'development') {
        throw error;
      }
    }
  }

  /**
   * Update specific context fields
   */
  static async updateContextField(
    userId: number,
    field: keyof UserAIContext,
    value: any
  ): Promise<void> {
    try {
      const context = await this.getUserContext(userId) || {
        userId,
        lastUpdated: new Date()
      };

      (context as any)[field] = value;
      context.lastUpdated = new Date();

      await this.saveUserContext(userId, context);
    } catch (error) {
      console.error(`Error updating context field ${field}:`, error);
      throw error;
    }
  }

  /**
   * Track tool usage
   */
  static async trackToolUsage(userId: number, toolName: string): Promise<void> {
    try {
      // For development, skip tracking if database is not configured
      if (process.env.NODE_ENV === 'development' && !process.env.POSTGRES_URL) {
        console.log(`⚠️ Database not configured in development, skipping tool usage tracking for ${toolName}`);
        return;
      }

      const context = await this.getUserContext(userId) || {
        userId,
        toolUsage: {
          chatCoach: 0,
          openers: 0,
          icebreakers: 0,
          safetyCheck: 0,
          profileBuilder: 0,
          photoAnalysis: 0,
          platformMatch: 0
        },
        lastUpdated: new Date()
      };

      if (!context.toolUsage) {
        context.toolUsage = {
          chatCoach: 0,
          openers: 0,
          icebreakers: 0,
          safetyCheck: 0,
          profileBuilder: 0,
          photoAnalysis: 0,
          platformMatch: 0
        };
      }

      // Map tool names to context fields
      const toolMapping: { [key: string]: keyof typeof context.toolUsage } = {
        'chat-coach': 'chatCoach',
        'openingszinnen-generator': 'openers',
        'ijsbreker-generator': 'icebreakers',
        'veiligheidscheck': 'safetyCheck',
        'interactive-profile-coach': 'profileBuilder',
        'photo-analysis-tab': 'photoAnalysis',
        'platform-match-tool': 'platformMatch'
      };

      const contextField = toolMapping[toolName];
      if (contextField && context.toolUsage[contextField] !== undefined) {
        context.toolUsage[contextField]++;
        await this.saveUserContext(userId, context);
      }
    } catch (error) {
      console.error('Error tracking tool usage:', error);
      // Don't throw error in development
      if (process.env.NODE_ENV !== 'development') {
        throw error;
      }
    }
  }

  /**
   * Get AI context summary for prompts
   */
  static getContextSummary(context: UserAIContext | null): string {
    if (!context) return '';

    let summary = '';

    if (context.personalityType) {
      summary += `Persoonlijkheid: ${context.personalityType}. `;
    }

    if (context.communicationStyle) {
      summary += `Communicatiestijl: ${context.communicationStyle}. `;
    }

    if (context.energyLevel) {
      summary += `Energie niveau: ${context.energyLevel}. `;
    }

    if (context.interests && context.interests.length > 0) {
      summary += `Interesses: ${context.interests.slice(0, 3).join(', ')}. `;
    }

    if (context.humorStyle) {
      summary += `Humor stijl: ${context.humorStyle}. `;
    }

    if (context.successfulOpeners && context.successfulOpeners.length > 0) {
      summary += `Succesvolle openers: ${context.successfulOpeners.length} opgeslagen. `;
    }

    return summary.trim();
  }

  /**
   * Initialize AI context from user profile and personality scan
   */
  static async initializeFromProfile(userId: number, userProfile: any, personalityScan?: any): Promise<void> {
    try {
      const context: Partial<UserAIContext> = {
        userId,
        name: userProfile?.name,
        age: userProfile?.age,
        gender: userProfile?.gender,
        interests: userProfile?.interests || [],
        lookingFor: userProfile?.lookingFor,
        communicationStyle: 'casual', // Default, can be updated by tools
        energyLevel: 'medium', // Default, can be updated by tools
        toolUsage: {
          chatCoach: 0,
          openers: 0,
          icebreakers: 0,
          safetyCheck: 0,
          profileBuilder: 0,
          photoAnalysis: 0,
          platformMatch: 0
        }
      };

      // Extract personality insights if available
      if (personalityScan) {
        if (personalityScan.personality_type) {
          context.personalityType = personalityScan.personality_type;
        }

        if (personalityScan.communication_style) {
          context.communicationStyle = personalityScan.communication_style;
        }

        if (personalityScan.energy_level) {
          context.energyLevel = personalityScan.energy_level;
        }

        if (personalityScan.humor_style) {
          context.humorStyle = personalityScan.humor_style;
        }
      }

      await this.saveUserContext(userId, context);
      console.log(`✅ AI context initialized for user ${userId}`);
    } catch (error) {
      console.error('Error initializing AI context:', error);
    }
  }
}