/**
 * SHARED CONTEXT MANAGER
 * Cross-tool learning and personalization system
 * Created: 2025-11-21
 * Author: AI Architecture Specialist
 */

import { AIContextManager } from './ai-context-manager';

interface ToolUsage {
  toolId: string;
  timestamp: Date;
  action: string;
  data?: any;
  success: boolean;
}

interface UserLearningProfile {
  userId: string;
  personalityInsights: {
    communicationStyle?: string;
    relationshipGoals?: string[];
    confidenceLevel?: number;
    socialEnergy?: number;
  };
  toolUsagePatterns: {
    preferredTools: string[];
    successRate: Record<string, number>;
    learningProgress: Record<string, number>;
  };
  contentPreferences: {
    writingStyle?: string;
    humorLevel?: number;
    formalityLevel?: number;
    topics?: string[];
  };
  behavioralPatterns: {
    completionRate: number;
    consistencyScore: number;
    adaptationSpeed: number;
  };
  lastUpdated: Date;
}

interface ContextEnrichment {
  personalizedTips: string[];
  recommendedNextSteps: string[];
  adaptiveDifficulty: number;
  contextualReminders: string[];
}

export class SharedContextManager {
  private static instance: SharedContextManager;
  private learningProfiles: Map<string, UserLearningProfile> = new Map();
  private toolUsageHistory: Map<string, ToolUsage[]> = new Map();

  // ============================================================================
  // SINGLETON PATTERN
  // ============================================================================

  public static getInstance(): SharedContextManager {
    if (!SharedContextManager.instance) {
      SharedContextManager.instance = new SharedContextManager();
    }
    return SharedContextManager.instance;
  }

  // ============================================================================
  // LEARNING PROFILE MANAGEMENT
  // ============================================================================

  async getOrCreateLearningProfile(userId: string): Promise<UserLearningProfile> {
    if (this.learningProfiles.has(userId)) {
      return this.learningProfiles.get(userId)!;
    }

    // Try to load from AI context manager
    let aiContext;
    try {
      aiContext = await AIContextManager.getUserContext(parseInt(userId));
    } catch (error) {
      console.warn('Could not load AI context:', error);
      aiContext = null;
    }

    const profile: UserLearningProfile = {
      userId,
      personalityInsights: {
        communicationStyle: aiContext?.communicationStyle,
        relationshipGoals: aiContext?.relationshipGoals,
        confidenceLevel: (aiContext as any)?.confidenceLevel,
        socialEnergy: (aiContext as any)?.socialEnergy
      },
      toolUsagePatterns: {
        preferredTools: [],
        successRate: {},
        learningProgress: {}
      },
      contentPreferences: {
        writingStyle: aiContext?.writingStyle,
        humorLevel: (aiContext as any)?.humorLevel || 5,
        formalityLevel: (aiContext as any)?.formalityLevel || 5,
        topics: aiContext?.preferredTopics || []
      },
      behavioralPatterns: {
        completionRate: 0,
        consistencyScore: 0,
        adaptationSpeed: 0
      },
      lastUpdated: new Date()
    };

    this.learningProfiles.set(userId, profile);
    return profile;
  }

  // ============================================================================
  // TOOL USAGE TRACKING
  // ============================================================================

  async trackToolUsage(userId: string, toolUsage: ToolUsage): Promise<void> {
    if (!this.toolUsageHistory.has(userId)) {
      this.toolUsageHistory.set(userId, []);
    }

    const history = this.toolUsageHistory.get(userId)!;
    history.push(toolUsage);

    // Keep only last 100 usages for memory efficiency
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }

    // Update learning profile
    await this.updateLearningProfile(userId, toolUsage);
  }

  private async updateLearningProfile(userId: string, toolUsage: ToolUsage): Promise<void> {
    const profile = await this.getOrCreateLearningProfile(userId);

    // Update tool usage patterns
    if (toolUsage.success) {
      if (!profile.toolUsagePatterns.successRate[toolUsage.toolId]) {
        profile.toolUsagePatterns.successRate[toolUsage.toolId] = 0;
      }
      profile.toolUsagePatterns.successRate[toolUsage.toolId] += 1;
    }

    // Update preferred tools (based on frequency)
    const toolCounts = this.getToolUsageCounts(userId);
    profile.toolUsagePatterns.preferredTools = Object.entries(toolCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([toolId]) => toolId);

    // Update learning progress
    if (!profile.toolUsagePatterns.learningProgress[toolUsage.toolId]) {
      profile.toolUsagePatterns.learningProgress[toolUsage.toolId] = 0;
    }

    // Simple learning progress calculation
    const recentUsages = this.getRecentToolUsages(userId, toolUsage.toolId, 10);
    const recentSuccessRate = recentUsages.filter(u => u.success).length / recentUsages.length;
    profile.toolUsagePatterns.learningProgress[toolUsage.toolId] = recentSuccessRate;

    // Update behavioral patterns
    const allUsages = this.toolUsageHistory.get(userId) || [];
    const completedActions = allUsages.filter(u => u.success).length;
    profile.behavioralPatterns.completionRate = allUsages.length > 0 ? completedActions / allUsages.length : 0;

    profile.lastUpdated = new Date();
  }

  // ============================================================================
  // CONTEXT ENRICHMENT
  // ============================================================================

  async enrichContext(userId: string, currentTool: string, context: any): Promise<ContextEnrichment> {
    const profile = await this.getOrCreateLearningProfile(userId);
    const toolHistory = this.toolUsageHistory.get(userId) || [];

    const enrichment: ContextEnrichment = {
      personalizedTips: [],
      recommendedNextSteps: [],
      adaptiveDifficulty: 5,
      contextualReminders: []
    };

    // Personalized tips based on learning profile
    if (profile.contentPreferences.writingStyle) {
      enrichment.personalizedTips.push(
        `Gebaseerd op je schrijfstijl: Focus op ${profile.contentPreferences.writingStyle} taalgebruik`
      );
    }

    // Success-based recommendations
    const successfulTools = Object.entries(profile.toolUsagePatterns.successRate)
      .filter(([, rate]) => rate > 0.7)
      .map(([toolId]) => toolId);

    if (successfulTools.length > 0 && !successfulTools.includes(currentTool)) {
      enrichment.recommendedNextSteps.push(
        `Je bent goed in ${successfulTools[0]} - probeer dit ook eens`
      );
    }

    // Adaptive difficulty based on success rate
    const currentToolSuccess = profile.toolUsagePatterns.successRate[currentTool] || 0;
    if (currentToolSuccess > 0.8) {
      enrichment.adaptiveDifficulty = 7; // Increase difficulty
      enrichment.personalizedTips.push('Je beheerst dit goed - probeer geavanceerdere opties');
    } else if (currentToolSuccess < 0.4) {
      enrichment.adaptiveDifficulty = 3; // Decrease difficulty
      enrichment.personalizedTips.push('Neem je tijd - we helpen je stap voor stap');
    }

    // Contextual reminders based on usage patterns
    const recentUsages = toolHistory.slice(-5);
    const hasRecentFailures = recentUsages.some(u => !u.success && u.toolId === currentTool);
    if (hasRecentFailures) {
      enrichment.contextualReminders.push(
        'Onthoud: Elke expert begon als beginner. Blijf oefenen!'
      );
    }

    // Learning progress reminders
    const learningProgress = profile.toolUsagePatterns.learningProgress[currentTool] || 0;
    if (learningProgress > 0.8) {
      enrichment.contextualReminders.push(
        'Geweldig! Je hebt veel vooruitgang geboekt in deze tool'
      );
    }

    return enrichment;
  }

  // ============================================================================
  // PREDICTIVE ANALYTICS
  // ============================================================================

  async predictUserNeeds(userId: string): Promise<{
    recommendedTools: string[];
    predictedChallenges: string[];
    optimalLearningPath: string[];
  }> {
    const profile = await this.getOrCreateLearningProfile(userId);
    const toolHistory = this.toolUsageHistory.get(userId) || [];

    // Analyze usage patterns
    const toolCounts = this.getToolUsageCounts(userId);
    const successRates = profile.toolUsagePatterns.successRate;

    // Recommend tools based on success patterns
    const recommendedTools = Object.entries(successRates)
      .filter(([, rate]) => rate > 0.6)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 2)
      .map(([toolId]) => toolId);

    // Predict challenges based on low success rates
    const predictedChallenges = Object.entries(successRates)
      .filter(([, rate]) => rate < 0.4)
      .map(([toolId]) => `Mogelijke uitdagingen met ${toolId} - extra ondersteuning beschikbaar`);

    // Create optimal learning path
    const optimalLearningPath = [
      'profile-builder', // Always start with foundation
      ...Object.entries(toolCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([toolId]) => toolId)
    ].filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates

    return {
      recommendedTools,
      predictedChallenges,
      optimalLearningPath
    };
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private getToolUsageCounts(userId: string): Record<string, number> {
    const history = this.toolUsageHistory.get(userId) || [];
    const counts: Record<string, number> = {};

    history.forEach(usage => {
      counts[usage.toolId] = (counts[usage.toolId] || 0) + 1;
    });

    return counts;
  }

  private getRecentToolUsages(userId: string, toolId: string, limit: number): ToolUsage[] {
    const history = this.toolUsageHistory.get(userId) || [];
    return history
      .filter(usage => usage.toolId === toolId)
      .slice(-limit);
  }

  // ============================================================================
  // CROSS-TOOL INSIGHTS
  // ============================================================================

  async generateCrossToolInsights(userId: string): Promise<{
    strengths: string[];
    improvementAreas: string[];
    learningRecommendations: string[];
  }> {
    const profile = await this.getOrCreateLearningProfile(userId);
    const insights = {
      strengths: [] as string[],
      improvementAreas: [] as string[],
      learningRecommendations: [] as string[]
    };

    // Analyze strengths
    Object.entries(profile.toolUsagePatterns.successRate).forEach(([toolId, rate]) => {
      if (rate > 0.8) {
        insights.strengths.push(`Uitstekend in ${toolId} (${Math.round(rate * 100)}% succes)`);
      }
    });

    // Identify improvement areas
    Object.entries(profile.toolUsagePatterns.successRate).forEach(([toolId, rate]) => {
      if (rate < 0.5) {
        insights.improvementAreas.push(`${toolId} behoeft extra aandacht (${Math.round(rate * 100)}% succes)`);
      }
    });

    // Generate learning recommendations
    if (profile.behavioralPatterns.completionRate > 0.8) {
      insights.learningRecommendations.push('Je bent zeer consistent - probeer geavanceerde features');
    }

    if (profile.contentPreferences.writingStyle) {
      insights.learningRecommendations.push(
        `Bouw voort op je ${profile.contentPreferences.writingStyle} schrijfstijl in alle tools`
      );
    }

    return insights;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const sharedContextManager = SharedContextManager.getInstance();