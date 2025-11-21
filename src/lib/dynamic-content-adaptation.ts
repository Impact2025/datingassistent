/**
 * DYNAMIC CONTENT ADAPTATION SYSTEM
 * Real-time content personalization and adaptive UI experiences
 * Created: 2025-11-21
 * Author: UX Personalization Engineer
 */

import { advancedPersonalizationEngine } from './advanced-personalization-engine';
import { predictiveUserModeling } from './predictive-user-modeling';
import type { UserProfile } from './types';

interface ContentTemplate {
  id: string;
  baseContent: string;
  contentType: 'text' | 'ui' | 'tutorial' | 'feedback' | 'recommendation';
  adaptability: {
    toneAdaptable: boolean;
    pacingAdaptable: boolean;
    complexityAdaptable: boolean;
    lengthAdaptable: boolean;
    culturalAdaptable: boolean;
  };
  variables: Record<string, string>;
  constraints: {
    minLength?: number;
    maxLength?: number;
    requiredElements?: string[];
    forbiddenElements?: string[];
  };
}

interface AdaptationContext {
  userId: string;
  contentTemplate: ContentTemplate;
  personalizationContext: any;
  predictionModel: any;
  userPreferences: {
    language: string;
    formality: number;
    detailLevel: number;
    interactionStyle: string;
  };
  environmentalFactors: {
    timeOfDay: number;
    deviceType: string;
    sessionLength: number;
    previousInteractions: number;
  };
}

interface AdaptedContent {
  content: string;
  metadata: {
    adaptationScore: number;
    appliedAdaptations: string[];
    predictedEngagement: number;
    processingTime: number;
    contentLength: number;
  };
  alternatives?: AdaptedContent[];
}

export class DynamicContentAdaptation {
  private static instance: DynamicContentAdaptation;
  private contentTemplates = new Map<string, ContentTemplate>();
  private adaptationCache = new Map<string, AdaptedContent>();

  // ============================================================================
  // SINGLETON PATTERN
  // ============================================================================

  public static getInstance(): DynamicContentAdaptation {
    if (!DynamicContentAdaptation.instance) {
      DynamicContentAdaptation.instance = new DynamicContentAdaptation();
    }
    return DynamicContentAdaptation.instance;
  }

  // ============================================================================
  // CONTENT TEMPLATE MANAGEMENT
  // ============================================================================

  registerTemplate(template: ContentTemplate): void {
    this.contentTemplates.set(template.id, template);
  }

  getTemplate(templateId: string): ContentTemplate | undefined {
    return this.contentTemplates.get(templateId);
  }

  // ============================================================================
  // DYNAMIC ADAPTATION ENGINE
  // ============================================================================

  async adaptContent(
    templateId: string,
    userId: string,
    variables: Record<string, any> = {},
    userProfile?: UserProfile
  ): Promise<AdaptedContent> {
    const startTime = Date.now();

    // Get template
    const template = this.contentTemplates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    // Create adaptation context
    const personalizationContext = await advancedPersonalizationEngine.createPersonalizationContext(userId, templateId);
    const predictionModel = await predictiveUserModeling.generatePredictionModel(userId, userProfile);

    const adaptationContext: AdaptationContext = {
      userId,
      contentTemplate: template,
      personalizationContext,
      predictionModel,
      userPreferences: await this.extractUserPreferences(userId),
      environmentalFactors: await this.extractEnvironmentalFactors(userId)
    };

    // Check cache first
    const cacheKey = this.generateCacheKey(templateId, userId, variables, adaptationContext);
    const cached = this.adaptationCache.get(cacheKey);
    if (cached && Date.now() - startTime < 5000) { // Cache valid for 5 seconds
      return cached;
    }

    // Apply adaptations
    let adaptedContent = template.baseContent;

    // Replace variables
    adaptedContent = this.replaceVariables(adaptedContent, { ...template.variables, ...variables });

    // Apply content adaptations
    const appliedAdaptations: string[] = [];

    if (template.adaptability.toneAdaptable) {
      adaptedContent = await this.adaptTone(adaptedContent, adaptationContext);
      appliedAdaptations.push('tone_adaptation');
    }

    if (template.adaptability.pacingAdaptable) {
      adaptedContent = this.adaptPacing(adaptedContent, adaptationContext);
      appliedAdaptations.push('pacing_adaptation');
    }

    if (template.adaptability.complexityAdaptable) {
      adaptedContent = this.adaptComplexity(adaptedContent, adaptationContext);
      appliedAdaptations.push('complexity_adaptation');
    }

    if (template.adaptability.lengthAdaptable) {
      adaptedContent = this.adaptLength(adaptedContent, adaptationContext);
      appliedAdaptations.push('length_adaptation');
    }

    if (template.adaptability.culturalAdaptable) {
      adaptedContent = this.adaptCulturalContext(adaptedContent, adaptationContext);
      appliedAdaptations.push('cultural_adaptation');
    }

    // Apply behavioral adaptations
    adaptedContent = await this.applyBehavioralAdaptations(adaptedContent, adaptationContext);
    appliedAdaptations.push('behavioral_adaptation');

    // Apply motivational adaptations
    adaptedContent = this.applyMotivationalAdaptations(adaptedContent, adaptationContext);
    appliedAdaptations.push('motivational_adaptation');

    // Validate constraints
    adaptedContent = this.validateAndAdjustConstraints(adaptedContent, template);

    // Calculate adaptation quality
    const adaptationScore = this.calculateAdaptationScore(adaptedContent, adaptationContext);
    const predictedEngagement = predictionModel.engagementTrajectory[0] || 50; // Use first day prediction
    const processingTime = Date.now() - startTime;

    const result: AdaptedContent = {
      content: adaptedContent,
      metadata: {
        adaptationScore,
        appliedAdaptations,
        predictedEngagement,
        processingTime,
        contentLength: adaptedContent.length
      }
    };

    // Cache result
    this.adaptationCache.set(cacheKey, result);

    // Generate alternatives if engagement prediction is low
    if (predictedEngagement < 60) {
      result.alternatives = await this.generateAlternatives(template, adaptationContext, variables);
    }

    return result;
  }

  // ============================================================================
  // ADAPTATION STRATEGIES
  // ============================================================================

  private async adaptTone(content: string, context: AdaptationContext): Promise<string> {
    const { personalizationContext } = context;
    let adaptedContent = content;

    const emotionalState = personalizationContext.userState.emotionalState;
    const motivationLevel = personalizationContext.userState.motivationLevel;

    // Adapt based on emotional state
    switch (emotionalState) {
      case 'frustrated':
        adaptedContent = adaptedContent
          .replace(/Probeer/g, 'Laten we samen proberen')
          .replace(/Je moet/g, 'Je kunt')
          .replace(/!/g, '... maar geen zorgen!');
        break;

      case 'confident':
        adaptedContent = adaptedContent
          .replace(/goed/g, 'geweldig')
          .replace(/interessant/g, 'fascinerend');
        break;

      case 'overwhelmed':
        adaptedContent = adaptedContent
          .replace(/alles tegelijk/g, 'stap voor stap')
          .replace(/snel/g, 'in je eigen tempo')
          .replace(/complex/g, 'simpel');
        break;

      case 'engaged':
        adaptedContent = adaptedContent
          .replace(/leuk/g, 'superleuk')
          .replace(/goed/g, 'uitstekend');
        break;
    }

    // Adapt based on motivation level
    if (motivationLevel > 7) {
      adaptedContent = adaptedContent
        .replace(/💪/g, '🚀')
        .replace(/goed gedaan/g, 'fantastisch werk');
    } else if (motivationLevel < 4) {
      adaptedContent = adaptedContent
        .replace(/🎯/g, '💪')
        .replace(/uitdaging/g, 'stapje');
    }

    return adaptedContent;
  }

  private adaptPacing(content: string, context: AdaptationContext): string {
    const pacing = context.personalizationContext.predictiveModel.personalizedContent.pacing;
    const learningVelocity = context.personalizationContext.userState.learningVelocity;

    if (pacing === 'slow' || learningVelocity < 4) {
      // Add more breaks and slower pacing
      return content
        .replace(/([.!?])\s+/g, '$1\n\n')
        .replace(/(\w{50})\s+/g, '$1\n');
    } else if (pacing === 'fast' || learningVelocity > 7) {
      // Remove unnecessary breaks for faster pacing
      return content
        .replace(/\n\n/g, '\n')
        .replace(/\n/g, ' ');
    }

    return content;
  }

  private adaptComplexity(content: string, context: AdaptationContext): string {
    const difficulty = context.personalizationContext.predictiveModel.optimalDifficulty;
    const successRate = context.personalizationContext.userState.successPatterns;

    let adaptedContent = content;

    if (difficulty < 4 || Object.values(successRate).some(rate => (rate as number) < 0.4)) {
      // Simplify for beginners/struggling users
      adaptedContent = adaptedContent
        .replace(/technisch/g, 'simpel')
        .replace(/geavanceerd/g, 'gemakkelijk')
        .replace(/optimaliseren/g, 'verbeteren')
        .replace(/strategisch/g, 'slim')
        .replace(/analyseren/g, 'bekijken');
    } else if (difficulty > 7) {
      // Add complexity for advanced users
      adaptedContent = adaptedContent
        .replace(/simpel/g, 'technisch')
        .replace(/gemakkelijk/g, 'geavanceerd')
        .replace(/verbeteren/g, 'optimaliseren')
        .replace(/slim/g, 'strategisch');
    }

    return adaptedContent;
  }

  private adaptLength(content: string, context: AdaptationContext): string {
    const attentionSpan = this.estimateAttentionSpan(context);
    const currentLength = content.length;

    if (currentLength > attentionSpan * 100) { // Rough character estimate
      // Shorten content
      const sentences = content.split(/[.!?]+/);
      const targetSentences = Math.max(3, Math.floor(attentionSpan / 20));
      return sentences.slice(0, targetSentences).join('. ') + '.';
    } else if (currentLength < attentionSpan * 50 && context.personalizationContext.userState.motivationLevel > 6) {
      // Add more detail for engaged users
      return content + '\n\n💡 Extra tip: Neem je tijd om dit goed te doen.';
    }

    return content;
  }

  private adaptCulturalContext(content: string, context: AdaptationContext): string {
    // Dutch cultural adaptations
    let adaptedContent = content;

    // Time preferences (Dutch people value punctuality)
    adaptedContent = adaptedContent.replace(
      /op tijd/g,
      'precies op tijd'
    );

    // Direct communication style
    adaptedContent = adaptedContent.replace(
      /misschien/g,
      'waarschijnlijk'
    );

    // Work-life balance emphasis
    if (context.environmentalFactors.timeOfDay > 18) {
      adaptedContent = adaptedContent.replace(
        /werken/g,
        'ontspannen'
      );
    }

    return adaptedContent;
  }

  private async applyBehavioralAdaptations(content: string, context: AdaptationContext): Promise<string> {
    const { personalizationContext } = context;
    let adaptedContent = content;

    // Adapt based on usage patterns
    const frustrationPoints = personalizationContext.userState.frustrationPoints;
    if (frustrationPoints.length > 0) {
      adaptedContent = adaptedContent.replace(
        /Probeer dit/g,
        'Laten we dit samen proberen'
      );
    }

    // Adapt based on tool sequence
    const lastSequence = personalizationContext.userState.toolUsageSequence[0];
    if (lastSequence?.includes('profile-builder')) {
      adaptedContent = adaptedContent.replace(
        /nieuw/g,
        'vervolg op je profiel'
      );
    }

    return adaptedContent;
  }

  private applyMotivationalAdaptations(content: string, context: AdaptationContext): string {
    const motivationLevel = context.personalizationContext.userState.motivationLevel;
    let adaptedContent = content;

    if (motivationLevel > 8) {
      // High motivation - add stretch goals
      adaptedContent += '\n\n🎯 Bonus uitdaging: Kun je dit in de helft van de tijd doen?';
    } else if (motivationLevel < 4) {
      // Low motivation - add encouragement
      adaptedContent += '\n\n💪 Onthoud: Elke expert begon als beginner!';
    } else if (motivationLevel > 6) {
      // Medium-high motivation - add progress indicators
      adaptedContent = adaptedContent.replace(
        /goed/g,
        'goed - je bent al halverwege!'
      );
    }

    return adaptedContent;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private replaceVariables(content: string, variables: Record<string, any>): string {
    let result = content;
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }
    return result;
  }

  private validateAndAdjustConstraints(content: string, template: ContentTemplate): string {
    let adjustedContent = content;

    // Length constraints
    if (template.constraints.minLength && adjustedContent.length < template.constraints.minLength) {
      adjustedContent += '\n\nExtra informatie: Dit is een belangrijk onderdeel van je dating succes.';
    }

    if (template.constraints.maxLength && adjustedContent.length > template.constraints.maxLength) {
      adjustedContent = adjustedContent.substring(0, template.constraints.maxLength - 3) + '...';
    }

    // Required elements
    if (template.constraints.requiredElements) {
      for (const element of template.constraints.requiredElements) {
        if (!adjustedContent.includes(element)) {
          adjustedContent += `\n\n${element}`;
        }
      }
    }

    // Forbidden elements
    if (template.constraints.forbiddenElements) {
      for (const element of template.constraints.forbiddenElements) {
        adjustedContent = adjustedContent.replace(new RegExp(element, 'g'), '');
      }
    }

    return adjustedContent;
  }

  private calculateAdaptationScore(content: string, context: AdaptationContext): number {
    let score = 50; // Base score

    // Content quality factors
    if (content.length > 100) score += 10;
    if (content.includes('💪') || content.includes('🎯')) score += 5;
    if (content.includes('\n\n')) score += 5; // Good formatting

    // Personalization factors
    if (context.personalizationContext.predictiveModel.personalizationScore > 70) score += 15;
    if (context.userPreferences.detailLevel > 3) score += 5;

    // User state factors
    if (context.personalizationContext.userState.motivationLevel > 6) score += 10;
    if (context.personalizationContext.userState.emotionalState === 'engaged') score += 10;

    return Math.min(score, 100);
  }

  private async generateAlternatives(
    template: ContentTemplate,
    context: AdaptationContext,
    variables: Record<string, any>
  ): Promise<AdaptedContent[]> {
    const alternatives: AdaptedContent[] = [];

    // Generate 2-3 alternative versions with different adaptation strategies
    const strategies = [
      { tone: 'more_encouraging', complexity: 'simpler' },
      { tone: 'more_professional', complexity: 'detailed' },
      { tone: 'more_casual', pacing: 'faster' }
    ];

    for (const strategy of strategies) {
      let alternativeContent = template.baseContent;

      // Apply strategy-specific adaptations
      if (strategy.tone === 'more_encouraging') {
        alternativeContent = alternativeContent.replace(/goed/g, 'fantastisch');
      }
      if (strategy.complexity === 'simpler') {
        alternativeContent = alternativeContent.replace(/optimaliseren/g, 'verbeteren');
      }
      if (strategy.pacing === 'faster') {
        alternativeContent = alternativeContent.replace(/\n\n/g, '\n');
      }

      alternatives.push({
        content: alternativeContent,
        metadata: {
          adaptationScore: 60 + Math.random() * 20,
          appliedAdaptations: [strategy.tone || 'default'],
          predictedEngagement: 50 + Math.random() * 30,
          processingTime: 50 + Math.random() * 50,
          contentLength: alternativeContent.length
        }
      });
    }

    return alternatives;
  }

  private generateCacheKey(
    templateId: string,
    userId: string,
    variables: Record<string, any>,
    context: AdaptationContext
  ): string {
    const variableHash = JSON.stringify(variables);
    const contextFingerprint = `${context.personalizationContext.userState.emotionalState}_${context.predictionModel.predictedEngagement}`;
    return `${templateId}_${userId}_${variableHash}_${contextFingerprint}`;
  }

  private async extractUserPreferences(userId: string): Promise<AdaptationContext['userPreferences']> {
    const personalizationContext = await advancedPersonalizationEngine.createPersonalizationContext(userId);

    return {
      language: 'nl',
      formality: personalizationContext.predictiveModel.personalizedContent.tone === 'professional' ? 4 :
                personalizationContext.predictiveModel.personalizedContent.tone === 'casual' ? 2 : 3,
      detailLevel: personalizationContext.predictiveModel.optimalDifficulty > 6 ? 4 :
                   personalizationContext.predictiveModel.optimalDifficulty > 4 ? 3 : 2,
      interactionStyle: personalizationContext.userState.emotionalState === 'engaged' ? 'interactive' : 'supportive'
    };
  }

  private async extractEnvironmentalFactors(userId: string): Promise<AdaptationContext['environmentalFactors']> {
    return {
      timeOfDay: new Date().getHours(),
      deviceType: 'desktop', // Would be detected in production
      sessionLength: Math.random() * 60, // Mock session length
      previousInteractions: Math.floor(Math.random() * 10) // Mock interaction count
    };
  }

  private estimateAttentionSpan(context: AdaptationContext): number {
    const motivation = context.personalizationContext.userState.motivationLevel;
    const timeOfDay = context.environmentalFactors.timeOfDay;

    // Attention span in minutes
    let baseSpan = 5;

    if (motivation > 7) baseSpan += 3;
    if (timeOfDay >= 9 && timeOfDay <= 17) baseSpan += 2; // Work hours
    if (context.personalizationContext.userState.emotionalState === 'engaged') baseSpan += 2;

    return Math.min(baseSpan, 15); // Cap at 15 minutes
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const dynamicContentAdaptation = DynamicContentAdaptation.getInstance();

// Initialize with common templates
dynamicContentAdaptation.registerTemplate({
  id: 'welcome_message',
  baseContent: 'Welkom bij DatingAssistent! Klaar om je dating leven te verbeteren?',
  contentType: 'text',
  adaptability: {
    toneAdaptable: true,
    pacingAdaptable: false,
    complexityAdaptable: false,
    lengthAdaptable: true,
    culturalAdaptable: true
  },
  variables: {},
  constraints: {
    minLength: 20,
    maxLength: 100
  }
});

dynamicContentAdaptation.registerTemplate({
  id: 'progress_feedback',
  baseContent: 'Je hebt {{progress}}% voltooid. {{encouragement}}',
  contentType: 'feedback',
  adaptability: {
    toneAdaptable: true,
    pacingAdaptable: false,
    complexityAdaptable: false,
    lengthAdaptable: true,
    culturalAdaptable: false
  },
  variables: {
    progress: '50',
    encouragement: 'Goed bezig!'
  },
  constraints: {
    requiredElements: ['%']
  }
});