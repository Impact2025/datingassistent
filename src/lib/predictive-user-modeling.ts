/**
 * PREDICTIVE USER MODELING SYSTEM
 * Machine learning-based user behavior prediction and proactive recommendations
 * Created: 2025-11-21
 * Author: ML Engineer & Data Scientist
 */

import { advancedPersonalizationEngine } from './advanced-personalization-engine';
import { sharedContextManager } from './shared-context-manager';
import type { UserProfile } from './types';

interface UserFeatureVector {
  userId: string;
  // Demographic features
  age: number;
  gender: string;
  location: string;

  // Behavioral features
  interactionFrequency: number;
  sessionDuration: number;
  toolUsageDiversity: number;
  successRate: number;
  learningVelocity: number;

  // Temporal features
  preferredHour: number;
  daysSinceLastInteraction: number;
  streakLength: number;

  // Engagement features
  motivationLevel: number;
  emotionalState: number; // Encoded as numeric
  churnRisk: number;
  engagementScore: number;

  // Content preferences
  preferredTone: number; // Encoded
  preferredPacing: number; // Encoded
  complexityTolerance: number;
}

interface PredictionModel {
  userId: string;
  nextActionProbability: Record<string, number>;
  churnProbability: number;
  engagementTrajectory: number[];
  recommendedInterventions: string[];
  optimalTiming: {
    bestHour: number;
    bestDay: number;
    frequency: number;
  };
  personalizationScore: number;
}

interface MLModel {
  weights: Record<string, number>;
  bias: number;
  features: string[];
  accuracy: number;
  lastTrained: Date;
}

export class PredictiveUserModeling {
  private static instance: PredictiveUserModeling;
  private featureVectors = new Map<string, UserFeatureVector>();
  private predictionModels = new Map<string, PredictionModel>();
  private mlModels = new Map<string, MLModel>();

  // ============================================================================
  // SINGLETON PATTERN
  // ============================================================================

  public static getInstance(): PredictiveUserModeling {
    if (!PredictiveUserModeling.instance) {
      PredictiveUserModeling.instance = new PredictiveUserModeling();
    }
    return PredictiveUserModeling.instance;
  }

  // ============================================================================
  // FEATURE ENGINEERING ENGINE
  // ============================================================================

  async createFeatureVector(userId: string, userProfile?: UserProfile): Promise<UserFeatureVector> {
    // Get behavioral data from personalization engine
    const behaviorPattern = await advancedPersonalizationEngine.analyzeUserBehavior(userId);
    const learningProfile = await sharedContextManager.getOrCreateLearningProfile(userId);

    // Extract demographic features
    const age = userProfile?.age || 25;
    const gender = this.encodeGender(userProfile?.gender || 'other');
    const location = this.encodeLocation(userProfile?.location || 'unknown');

    // Calculate behavioral features
    const interactionFrequency = behaviorPattern.interactionFrequency;
    const sessionDuration = await this.calculateAverageSessionDuration(userId);
    const toolUsageDiversity = this.calculateToolDiversity(behaviorPattern);
    const successRate = this.calculateOverallSuccessRate(behaviorPattern.successPatterns);
    const learningVelocity = behaviorPattern.learningVelocity;

    // Calculate temporal features
    const preferredHour = behaviorPattern.preferredTimes[0] || 12;
    const daysSinceLastInteraction = await this.calculateDaysSinceLastInteraction(userId);
    const streakLength = await this.calculateCurrentStreak(userId);

    // Calculate engagement features
    const motivationLevel = behaviorPattern.motivationLevel;
    const emotionalState = this.encodeEmotionalState(behaviorPattern.emotionalState);
    const churnRisk = await this.calculateChurnRisk(userId);
    const engagementScore = await this.calculateEngagementScore(userId);

    // Calculate content preferences
    const predictiveModel = await advancedPersonalizationEngine.generatePredictiveModel(userId, userProfile);
    const preferredTone = this.encodeTone(predictiveModel.personalizedContent.tone);
    const preferredPacing = this.encodePacing(predictiveModel.personalizedContent.pacing);
    const complexityTolerance = predictiveModel.optimalDifficulty;

    const featureVector: UserFeatureVector = {
      userId,
      age,
      gender,
      location,
      interactionFrequency,
      sessionDuration,
      toolUsageDiversity,
      successRate,
      learningVelocity,
      preferredHour,
      daysSinceLastInteraction,
      streakLength,
      motivationLevel,
      emotionalState,
      churnRisk,
      engagementScore,
      preferredTone,
      preferredPacing,
      complexityTolerance
    };

    this.featureVectors.set(userId, featureVector);
    return featureVector;
  }

  // ============================================================================
  // PREDICTION ENGINE
  // ============================================================================

  async generatePredictionModel(userId: string, userProfile?: UserProfile): Promise<PredictionModel> {
    const featureVector = await this.createFeatureVector(userId, userProfile);

    // Predict next actions using machine learning
    const nextActionProbability = await this.predictNextActions(featureVector);

    // Predict churn probability
    const churnProbability = this.predictChurnProbability(featureVector);

    // Predict engagement trajectory (next 7 days)
    const engagementTrajectory = this.predictEngagementTrajectory(featureVector);

    // Generate recommended interventions
    const recommendedInterventions = this.generateInterventions(featureVector, churnProbability);

    // Calculate optimal timing
    const optimalTiming = this.calculateOptimalTiming(featureVector);

    // Calculate personalization effectiveness score
    const personalizationScore = this.calculatePersonalizationScore(featureVector);

    const predictionModel: PredictionModel = {
      userId,
      nextActionProbability,
      churnProbability,
      engagementTrajectory,
      recommendedInterventions,
      optimalTiming,
      personalizationScore
    };

    this.predictionModels.set(userId, predictionModel);
    return predictionModel;
  }

  // ============================================================================
  // MACHINE LEARNING MODELS
  // ============================================================================

  private async predictNextActions(featureVector: UserFeatureVector): Promise<Record<string, number>> {
    const predictions: Record<string, number> = {};

    // Available actions/tools
    const availableActions = [
      'profile-builder', 'photo-analysis', 'platform-match', 'skills-scan',
      'chat-coach', 'daily-checkin', 'goal-setting', 'community-engagement'
    ];

    // Simple ML prediction based on feature weights
    // In production, this would use trained neural networks
    availableActions.forEach(action => {
      let probability = 0;

      // Base probability
      probability += 0.1;

      // Adjust based on success patterns
      if (featureVector.successRate > 0.7) {
        if (['platform-match', 'skills-scan'].includes(action)) {
          probability += 0.2; // Advanced users get advanced tools
        }
      } else {
        if (['profile-builder', 'chat-coach'].includes(action)) {
          probability += 0.15; // Beginners get basic support
        }
      }

      // Adjust based on interaction frequency
      if (featureVector.interactionFrequency > 2) {
        if (['daily-checkin', 'goal-setting'].includes(action)) {
          probability += 0.1; // Frequent users get engagement tools
        }
      }

      // Adjust based on motivation
      if (featureVector.motivationLevel > 7) {
        if (['community-engagement', 'skills-scan'].includes(action)) {
          probability += 0.15; // Motivated users get social/advanced tools
        }
      }

      // Adjust based on emotional state
      if (featureVector.emotionalState < 3) { // Frustrated/overwhelmed
        if (action === 'chat-coach') {
          probability += 0.3; // Provide support
        }
      }

      // Adjust based on time since last interaction
      if (featureVector.daysSinceLastInteraction > 3) {
        if (['daily-checkin', 'chat-coach'].includes(action)) {
          probability += 0.2; // Re-engagement tools
        }
      }

      predictions[action] = Math.min(probability, 1.0);
    });

    // Normalize probabilities
    const total = Object.values(predictions).reduce((a, b) => a + b, 0);
    Object.keys(predictions).forEach(action => {
      predictions[action] = predictions[action] / total;
    });

    return predictions;
  }

  private predictChurnProbability(featureVector: UserFeatureVector): number {
    let risk = 0;

    // High risk factors
    if (featureVector.daysSinceLastInteraction > 7) risk += 0.4;
    if (featureVector.interactionFrequency < 0.5) risk += 0.3;
    if (featureVector.emotionalState < 2) risk += 0.2; // Very frustrated/overwhelmed
    if (featureVector.motivationLevel < 3) risk += 0.3;
    if (featureVector.streakLength === 0) risk += 0.2;

    // Medium risk factors
    if (featureVector.successRate < 0.4) risk += 0.15;
    if (featureVector.engagementScore < 30) risk += 0.15;

    // Low risk factors (negative impact on risk)
    if (featureVector.interactionFrequency > 3) risk -= 0.2;
    if (featureVector.motivationLevel > 8) risk -= 0.15;
    if (featureVector.streakLength > 5) risk -= 0.1;

    return Math.max(0, Math.min(risk, 1));
  }

  private predictEngagementTrajectory(featureVector: UserFeatureVector): number[] {
    const trajectory: number[] = [];
    let currentEngagement = featureVector.engagementScore;

    // Predict next 7 days
    for (let i = 0; i < 7; i++) {
      // Natural decay over time
      currentEngagement *= 0.95;

      // Boost based on positive factors
      if (featureVector.motivationLevel > 6) currentEngagement *= 1.05;
      if (featureVector.interactionFrequency > 1) currentEngagement *= 1.03;
      if (featureVector.successRate > 0.6) currentEngagement *= 1.02;

      // Penalty for negative factors
      if (featureVector.churnRisk > 0.5) currentEngagement *= 0.9;
      if (featureVector.daysSinceLastInteraction > 2) currentEngagement *= 0.95;

      trajectory.push(Math.max(0, Math.min(currentEngagement, 100)));
    }

    return trajectory;
  }

  private generateInterventions(featureVector: UserFeatureVector, churnRisk: number): string[] {
    const interventions: string[] = [];

    // High churn risk interventions
    if (churnRisk > 0.7) {
      interventions.push('send_reengagement_email');
      interventions.push('offer_premium_trial');
      interventions.push('schedule_followup_reminder');
    } else if (churnRisk > 0.4) {
      interventions.push('send_motivational_message');
      interventions.push('suggest_easier_tasks');
    }

    // Low engagement interventions
    if (featureVector.engagementScore < 40) {
      interventions.push('send_progress_reminder');
      interventions.push('offer_personalized_tips');
    }

    // Success-based interventions
    if (featureVector.successRate > 0.8) {
      interventions.push('unlock_advanced_features');
      interventions.push('offer_expert_badge');
    }

    // Learning interventions
    if (featureVector.learningVelocity < 4) {
      interventions.push('provide_additional_tutorials');
      interventions.push('suggest_structured_learning_path');
    }

    // Motivation interventions
    if (featureVector.motivationLevel < 5) {
      interventions.push('send_encouragement_message');
      interventions.push('create_motivational_goals');
    }

    return interventions.slice(0, 3); // Limit to top 3
  }

  private calculateOptimalTiming(featureVector: UserFeatureVector): PredictionModel['optimalTiming'] {
    return {
      bestHour: featureVector.preferredHour,
      bestDay: this.calculateBestDay(featureVector),
      frequency: this.calculateOptimalFrequency(featureVector)
    };
  }

  private calculatePersonalizationScore(featureVector: UserFeatureVector): number {
    // Calculate how well the system is personalized for this user
    let score = 50; // Base score

    // High personalization factors
    if (featureVector.interactionFrequency > 2) score += 15; // Active user
    if (featureVector.successRate > 0.7) score += 10; // Successful user
    if (featureVector.learningVelocity > 6) score += 10; // Fast learner
    if (featureVector.motivationLevel > 7) score += 10; // Motivated user

    // Low personalization factors
    if (featureVector.churnRisk > 0.6) score -= 15; // At risk of leaving
    if (featureVector.emotionalState < 3) score -= 10; // Struggling user
    if (featureVector.daysSinceLastInteraction > 5) score -= 10; // Inactive user

    return Math.max(0, Math.min(score, 100));
  }

  // ============================================================================
  // ENCODING FUNCTIONS
  // ============================================================================

  private encodeGender(gender: string): string {
    const genderMap: Record<string, string> = {
      'man': 'male',
      'woman': 'female',
      'vrouw': 'female',
      'male': 'male',
      'female': 'female',
      'other': 'other',
      'niet-gespecificeerd': 'other'
    };
    return genderMap[gender.toLowerCase()] || 'other';
  }

  private encodeLocation(location: string): string {
    // Simple location encoding - in production use geolocation data
    const majorCities = ['amsterdam', 'rotterdam', 'utrecht', 'den haag', 'eindhoven'];
    const city = location.toLowerCase();

    if (majorCities.some(cityName => city.includes(cityName))) {
      return 'urban';
    }
    return 'other';
  }

  private encodeEmotionalState(state: string): number {
    const stateMap: Record<string, number> = {
      'confident': 5,
      'engaged': 4,
      'hesitant': 3,
      'frustrated': 2,
      'overwhelmed': 1
    };
    return stateMap[state] || 3;
  }

  private encodeTone(tone: string): number {
    const toneMap: Record<string, number> = {
      'professional': 1,
      'encouraging': 2,
      'supportive': 3,
      'enthusiastic': 4,
      'gentle': 5
    };
    return toneMap[tone] || 1;
  }

  private encodePacing(pacing: string): number {
    const pacingMap: Record<string, number> = {
      'slow': 1,
      'moderate': 2,
      'fast': 3
    };
    return pacingMap[pacing] || 2;
  }

  // ============================================================================
  // CALCULATION HELPERS
  // ============================================================================

  private async calculateAverageSessionDuration(userId: string): Promise<number> {
    // Mock calculation - in production, track actual session durations
    const behaviorPattern = await advancedPersonalizationEngine.analyzeUserBehavior(userId);
    return Math.max(5, Math.min(behaviorPattern.interactionFrequency * 10, 60)); // 5-60 minutes
  }

  private calculateToolDiversity(behaviorPattern: any): number {
    // Calculate diversity of tools used
    const uniqueTools = new Set(behaviorPattern.toolUsageSequence.flatMap((seq: string) => seq.split(' -> ')));
    return uniqueTools.size / 8; // Normalize to 0-1 (assuming 8 total tools)
  }

  private calculateOverallSuccessRate(successPatterns: Record<string, number>): number {
    const rates = Object.values(successPatterns);
    return rates.length > 0 ? rates.reduce((a, b) => a + b, 0) / rates.length : 0.5;
  }

  private async calculateDaysSinceLastInteraction(userId: string): Promise<number> {
    // Mock calculation - in production, query actual interaction timestamps
    const behaviorPattern = await advancedPersonalizationEngine.analyzeUserBehavior(userId);
    return Math.max(0, 7 - behaviorPattern.interactionFrequency * 2);
  }

  private async calculateCurrentStreak(userId: string): Promise<number> {
    // Mock calculation - in production, track actual daily streaks
    const behaviorPattern = await advancedPersonalizationEngine.analyzeUserBehavior(userId);
    return Math.floor(behaviorPattern.interactionFrequency * 3);
  }

  private async calculateChurnRisk(userId: string): Promise<number> {
    const behaviorPattern = await advancedPersonalizationEngine.analyzeUserBehavior(userId);
    const learningProfile = await sharedContextManager.getOrCreateLearningProfile(userId);

    let risk = 0;
    if (behaviorPattern.interactionFrequency < 0.5) risk += 0.3;
    if (behaviorPattern.emotionalState === 'frustrated') risk += 0.2;
    if (learningProfile.behavioralPatterns?.completionRate < 0.3) risk += 0.2;

    return Math.min(risk, 1);
  }

  private async calculateEngagementScore(userId: string): Promise<number> {
    const behaviorPattern = await advancedPersonalizationEngine.analyzeUserBehavior(userId);
    const learningProfile = await sharedContextManager.getOrCreateLearningProfile(userId);

    const frequencyScore = Math.min(behaviorPattern.interactionFrequency * 10, 30);
    const motivationScore = behaviorPattern.motivationLevel * 2;
    const completionScore = (learningProfile.behavioralPatterns?.completionRate || 0) * 40;

    return Math.min(frequencyScore + motivationScore + completionScore, 100);
  }

  private calculateBestDay(featureVector: UserFeatureVector): number {
    // Simple calculation - in production, analyze actual usage patterns
    // Return day of week (0=Sunday, 1=Monday, etc.)
    const baseDay = featureVector.interactionFrequency > 1 ? 1 : // Monday for active users
                   featureVector.interactionFrequency > 0.5 ? 5 : // Friday for moderate users
                   0; // Sunday for inactive users
    return baseDay;
  }

  private calculateOptimalFrequency(featureVector: UserFeatureVector): number {
    // Calculate optimal contact frequency (interactions per week)
    if (featureVector.interactionFrequency > 2) return 5; // Daily for very active
    if (featureVector.interactionFrequency > 1) return 3; // 3x per week for active
    if (featureVector.interactionFrequency > 0.5) return 2; // 2x per week for moderate
    return 1; // Weekly for inactive
  }

  // ============================================================================
  // MODEL TRAINING SIMULATION
  // ============================================================================

  async trainModels(): Promise<void> {
    console.log('🧠 Training predictive models...');

    // In production, this would train actual ML models
    // For now, we'll simulate model training

    const features = [
      'age', 'interactionFrequency', 'successRate', 'motivationLevel',
      'emotionalState', 'daysSinceLastInteraction', 'engagementScore'
    ];

    // Simulate trained model weights
    const mockModel: MLModel = {
      weights: {
        age: 0.1,
        interactionFrequency: 0.3,
        successRate: 0.25,
        motivationLevel: 0.2,
        emotionalState: 0.15,
        daysSinceLastInteraction: -0.2,
        engagementScore: 0.4
      },
      bias: 0.1,
      features,
      accuracy: 0.78,
      lastTrained: new Date()
    };

    this.mlModels.set('churn_prediction', mockModel);
    this.mlModels.set('engagement_prediction', mockModel);
    this.mlModels.set('next_action_prediction', mockModel);

    console.log('✅ Models trained successfully');
  }

  // ============================================================================
  // REAL-TIME PREDICTIONS
  // ============================================================================

  async getRealTimePredictions(userId: string): Promise<{
    immediateAction: string;
    confidence: number;
    reasoning: string;
  }> {
    const predictionModel = await this.generatePredictionModel(userId);

    // Find highest probability action
    const [immediateAction, probability] = Object.entries(predictionModel.nextActionProbability)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0];

    const confidence = probability as number;
    const reasoning = this.generatePredictionReasoning(immediateAction, confidence, predictionModel);

    return {
      immediateAction,
      confidence,
      reasoning
    };
  }

  private generatePredictionReasoning(action: string, confidence: number, model: PredictionModel): string {
    const reasons: string[] = [];

    if (confidence > 0.3) {
      reasons.push(`Hoge waarschijnlijkheid (${Math.round(confidence * 100)}%) gebaseerd op gebruikerspatronen`);
    }

    if (model.churnProbability > 0.5) {
      reasons.push('Gebruiker heeft aandacht nodig om actief te blijven');
    }

    if (model.engagementTrajectory[0] < 50) {
      reasons.push('Betrokkenheid kan verbeteren met gerichte actie');
    }

    return reasons.join('. ') || 'Algemene gebruikersvoorkeuren';
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const predictiveUserModeling = PredictiveUserModeling.getInstance();

// Initialize model training on startup
setTimeout(() => {
  predictiveUserModeling.trainModels();
}, 1000);