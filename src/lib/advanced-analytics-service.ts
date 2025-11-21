import { sql } from '@vercel/postgres';

export interface ClientAnalytics {
  clientId: number;
  clientName: string;
  patterns: ClientPattern[];
  predictions: ClientPrediction[];
  insights: ClientInsight[];
  riskScore: number;
  engagementScore: number;
  successProbability: number;
}

export interface ClientPattern {
  type: 'engagement' | 'progress' | 'communication' | 'goal_achievement';
  pattern: string;
  confidence: number;
  description: string;
  trend: 'improving' | 'declining' | 'stable';
  data: any[];
}

export interface ClientPrediction {
  type: 'goal_completion' | 'engagement_drop' | 'success_probability' | 'churn_risk';
  probability: number;
  timeframe: string;
  description: string;
  recommendedActions: string[];
}

export interface ClientInsight {
  category: 'strength' | 'opportunity' | 'warning' | 'success';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  suggestedAction?: string;
}

export class AdvancedAnalyticsService {
  /**
   * Generate comprehensive analytics for a specific client
   */
  static async generateClientAnalytics(clientId: number): Promise<ClientAnalytics> {
    try {
      // Get client basic info
      const clientInfo = await this.getClientInfo(clientId);

      // Analyze patterns
      const patterns = await this.analyzeClientPatterns(clientId);

      // Generate predictions
      const predictions = await this.generatePredictions(clientId, patterns);

      // Create insights
      const insights = await this.generateInsights(clientId, patterns, predictions);

      // Calculate scores
      const riskScore = this.calculateRiskScore(patterns, predictions);
      const engagementScore = this.calculateEngagementScore(patterns);
      const successProbability = this.calculateSuccessProbability(patterns, predictions);

      return {
        clientId,
        clientName: clientInfo.name,
        patterns,
        predictions,
        insights,
        riskScore,
        engagementScore,
        successProbability
      };
    } catch (error) {
      console.error('Error generating client analytics:', error);
      throw error;
    }
  }

  /**
   * Analyze patterns in client behavior and progress
   */
  private static async analyzeClientPatterns(clientId: number): Promise<ClientPattern[]> {
    const patterns: ClientPattern[] = [];

    try {
      // Engagement pattern analysis
      const engagementPattern = await this.analyzeEngagementPattern(clientId);
      if (engagementPattern) patterns.push(engagementPattern);

      // Progress pattern analysis
      const progressPattern = await this.analyzeProgressPattern(clientId);
      if (progressPattern) patterns.push(progressPattern);

      // Communication pattern analysis
      const communicationPattern = await this.analyzeCommunicationPattern(clientId);
      if (communicationPattern) patterns.push(communicationPattern);

      // Goal achievement pattern analysis
      const goalPattern = await this.analyzeGoalAchievementPattern(clientId);
      if (goalPattern) patterns.push(goalPattern);

    } catch (error) {
      console.error('Error analyzing patterns:', error);
    }

    return patterns;
  }

  /**
   * Analyze engagement patterns
   */
  private static async analyzeEngagementPattern(clientId: number): Promise<ClientPattern | null> {
    try {
      // Get activity data for the last 30 days
      const activityData = await sql`
        SELECT
          DATE(created_at) as date,
          COUNT(*) as activities
        FROM user_activity_tracking
        WHERE user_id = ${clientId}
        AND created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date
      `;

      if (activityData.rows.length < 7) {
        return null; // Not enough data
      }

      const activities = activityData.rows.map(row => ({
        date: row.date,
        count: parseInt(row.activities)
      }));

      // Calculate trend
      const recentAvg = activities.slice(-7).reduce((sum, a) => sum + a.count, 0) / 7;
      const earlierAvg = activities.slice(-14, -7).reduce((sum, a) => sum + a.count, 0) / 7;

      let trend: 'improving' | 'declining' | 'stable' = 'stable';
      if (recentAvg > earlierAvg * 1.2) trend = 'improving';
      if (recentAvg < earlierAvg * 0.8) trend = 'declining';

      // Calculate consistency
      const avgActivities = activities.reduce((sum, a) => sum + a.count, 0) / activities.length;
      const variance = activities.reduce((sum, a) => sum + Math.pow(a.count - avgActivities, 2), 0) / activities.length;
      const consistency = Math.max(0, 100 - (variance / avgActivities) * 20);

      return {
        type: 'engagement',
        pattern: `Consistentie: ${consistency.toFixed(0)}%`,
        confidence: Math.min(consistency / 100, 0.9),
        description: `Cliënt toont ${trend} engagement patroon met gemiddelde van ${avgActivities.toFixed(1)} activiteiten per dag`,
        trend,
        data: activities
      };
    } catch (error) {
      console.error('Error analyzing engagement pattern:', error);
      return null;
    }
  }

  /**
   * Analyze progress patterns
   */
  private static async analyzeProgressPattern(clientId: number): Promise<ClientPattern | null> {
    try {
      // Get goal progress over time
      const goalData = await sql`
        SELECT
          DATE(created_at) as date,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
          COUNT(*) as total
        FROM user_goals
        WHERE user_id = ${clientId}
        AND created_at >= CURRENT_DATE - INTERVAL '60 days'
        GROUP BY DATE(created_at)
        ORDER BY date
      `;

      if (goalData.rows.length < 7) {
        return null;
      }

      const progressData = goalData.rows.map(row => ({
        date: row.date,
        completionRate: row.total > 0 ? (row.completed / row.total) * 100 : 0
      }));

      // Calculate trend
      const recentRates = progressData.slice(-7).map(d => d.completionRate);
      const earlierRates = progressData.slice(-14, -7).map(d => d.completionRate);

      const recentAvg = recentRates.reduce((sum, r) => sum + r, 0) / recentRates.length;
      const earlierAvg = earlierRates.length > 0 ? earlierRates.reduce((sum, r) => sum + r, 0) / earlierRates.length : recentAvg;

      let trend: 'improving' | 'declining' | 'stable' = 'stable';
      if (recentAvg > earlierAvg * 1.15) trend = 'improving';
      if (recentAvg < earlierAvg * 0.85) trend = 'declining';

      return {
        type: 'progress',
        pattern: `${trend} voortgang`,
        confidence: 0.8,
        description: `Doel completion rate is ${trend} van ${earlierAvg.toFixed(1)}% naar ${recentAvg.toFixed(1)}%`,
        trend,
        data: progressData
      };
    } catch (error) {
      console.error('Error analyzing progress pattern:', error);
      return null;
    }
  }

  /**
   * Analyze communication patterns
   */
  private static async analyzeCommunicationPattern(clientId: number): Promise<ClientPattern | null> {
    try {
      // This would analyze message patterns, response times, etc.
      // For now, return a basic pattern
      return {
        type: 'communication',
        pattern: 'Regelmatige communicatie',
        confidence: 0.7,
        description: 'Cliënt communiceert consistent met het platform',
        trend: 'stable',
        data: []
      };
    } catch (error) {
      console.error('Error analyzing communication pattern:', error);
      return null;
    }
  }

  /**
   * Analyze goal achievement patterns
   */
  private static async analyzeGoalAchievementPattern(clientId: number): Promise<ClientPattern | null> {
    try {
      const goalStats = await sql`
        SELECT
          status,
          COUNT(*) as count
        FROM user_goals
        WHERE user_id = ${clientId}
        GROUP BY status
      `;

      const stats = goalStats.rows.reduce((acc, row) => {
        acc[row.status] = parseInt(row.count);
        return acc;
      }, {} as Record<string, number>);

      const completed = stats.completed || 0;
      const total = Object.values(stats).reduce((sum, count) => sum + count, 0);

      if (total === 0) return null;

      const completionRate = (completed / total) * 100;

      let pattern = 'Gemiddelde prestaties';
      if (completionRate > 75) pattern = 'Hoge doelgerichtheid';
      else if (completionRate < 25) pattern = 'Behoefte aan ondersteuning';

      return {
        type: 'goal_achievement',
        pattern,
        confidence: 0.85,
        description: `${completed} van ${total} doelen voltooid (${completionRate.toFixed(1)}% success rate)`,
        trend: completionRate > 50 ? 'improving' : 'stable',
        data: [stats]
      };
    } catch (error) {
      console.error('Error analyzing goal achievement pattern:', error);
      return null;
    }
  }

  /**
   * Generate predictions based on patterns
   */
  private static async generatePredictions(clientId: number, patterns: ClientPattern[]): Promise<ClientPrediction[]> {
    const predictions: ClientPrediction[] = [];

    try {
      // Goal completion prediction
      const goalCompletionPrediction = this.predictGoalCompletion(patterns);
      if (goalCompletionPrediction) predictions.push(goalCompletionPrediction);

      // Engagement drop prediction
      const engagementPrediction = this.predictEngagementDrop(patterns);
      if (engagementPrediction) predictions.push(engagementPrediction);

      // Success probability prediction
      const successPrediction = this.predictSuccessProbability(patterns);
      if (successPrediction) predictions.push(successPrediction);

      // Churn risk prediction
      const churnPrediction = this.predictChurnRisk(patterns);
      if (churnPrediction) predictions.push(churnPrediction);

    } catch (error) {
      console.error('Error generating predictions:', error);
    }

    return predictions;
  }

  /**
   * Predict goal completion
   */
  private static predictGoalCompletion(patterns: ClientPattern[]): ClientPrediction | null {
    const progressPattern = patterns.find(p => p.type === 'progress');

    if (!progressPattern) return null;

    let probability = 0.5; // Base probability
    const recommendedActions: string[] = [];

    if (progressPattern.trend === 'improving') {
      probability += 0.3;
      recommendedActions.push('Blijf huidige strategie voortzetten');
    } else if (progressPattern.trend === 'declining') {
      probability -= 0.2;
      recommendedActions.push('Heroverweeg doelstellingen');
      recommendedActions.push('Bied extra ondersteuning aan');
    }

    return {
      type: 'goal_completion',
      probability: Math.max(0, Math.min(1, probability)),
      timeframe: 'volgende maand',
      description: `${(probability * 100).toFixed(0)}% kans dat cliënt doelen haalt`,
      recommendedActions
    };
  }

  /**
   * Predict engagement drop
   */
  private static predictEngagementDrop(patterns: ClientPattern[]): ClientPrediction | null {
    const engagementPattern = patterns.find(p => p.type === 'engagement');

    if (!engagementPattern) return null;

    let probability = 0.2; // Base low probability

    if (engagementPattern.trend === 'declining') {
      probability += 0.4;
    }

    if (probability < 0.3) return null; // Only return if significant risk

    return {
      type: 'engagement_drop',
      probability,
      timeframe: 'komende 2 weken',
      description: `${(probability * 100).toFixed(0)}% kans op engagement daling`,
      recommendedActions: [
        'Stuur reminder bericht',
        'Vraag naar voortgang',
        'Bied hulp aan bij problemen'
      ]
    };
  }

  /**
   * Predict success probability
   */
  private static predictSuccessProbability(patterns: ClientPattern[]): ClientPrediction | null {
    let successScore = 0.5; // Base score

    patterns.forEach(pattern => {
      if (pattern.trend === 'improving') successScore += 0.1;
      if (pattern.trend === 'declining') successScore -= 0.1;
      if (pattern.confidence > 0.8) successScore += 0.05;
    });

    successScore = Math.max(0, Math.min(1, successScore));

    return {
      type: 'success_probability',
      probability: successScore,
      timeframe: 'volgende 3 maanden',
      description: `${(successScore * 100).toFixed(0)}% kans op succesvolle afronding`,
      recommendedActions: successScore > 0.7 ?
        ['Blijf ondersteunen', 'Focus op advanced topics'] :
        ['Bied extra begeleiding aan', 'Heroverweeg aanpak']
    };
  }

  /**
   * Predict churn risk
   */
  private static predictChurnRisk(patterns: ClientPattern[]): ClientPrediction | null {
    let churnRisk = 0.1; // Base low risk

    const decliningPatterns = patterns.filter(p => p.trend === 'declining').length;
    churnRisk += decliningPatterns * 0.15;

    if (churnRisk < 0.25) return null; // Only return if significant risk

    return {
      type: 'churn_risk',
      probability: churnRisk,
      timeframe: 'komende maand',
      description: `${(churnRisk * 100).toFixed(0)}% kans dat cliënt stopt`,
      recommendedActions: [
        'Contact opnemen',
        'Vraag naar tevredenheid',
        'Bied hulp aan bij obstakels'
      ]
    };
  }

  /**
   * Generate actionable insights
   */
  private static async generateInsights(
    clientId: number,
    patterns: ClientPattern[],
    predictions: ClientPrediction[]
  ): Promise<ClientInsight[]> {
    const insights: ClientInsight[] = [];

    try {
      // Generate insights based on patterns
      patterns.forEach(pattern => {
        if (pattern.trend === 'improving' && pattern.confidence > 0.7) {
          insights.push({
            category: 'success',
            title: `${pattern.type} verbetering`,
            description: pattern.description,
            impact: 'high',
            actionable: false
          });
        }

        if (pattern.trend === 'declining' && pattern.confidence > 0.6) {
          insights.push({
            category: 'warning',
            title: `${pattern.type} aandacht nodig`,
            description: pattern.description,
            impact: 'high',
            actionable: true,
            suggestedAction: 'Neem contact op om ondersteuning te bieden'
          });
        }
      });

      // Generate insights based on predictions
      predictions.forEach(prediction => {
        if (prediction.probability > 0.7) {
          insights.push({
            category: prediction.type.includes('success') ? 'strength' : 'opportunity',
            title: prediction.type.replace('_', ' '),
            description: prediction.description,
            impact: prediction.probability > 0.8 ? 'high' : 'medium',
            actionable: true,
            suggestedAction: prediction.recommendedActions[0]
          });
        }
      });

      // Add general insights
      const engagementPattern = patterns.find(p => p.type === 'engagement');
      if (engagementPattern && engagementPattern.confidence > 0.8) {
        insights.push({
          category: 'strength',
          title: 'Sterke engagement',
          description: 'Cliënt toont consistente betrokkenheid met het programma',
          impact: 'medium',
          actionable: false
        });
      }

    } catch (error) {
      console.error('Error generating insights:', error);
    }

    return insights.slice(0, 5); // Limit to top 5 insights
  }

  /**
   * Calculate risk score (0-100, higher = higher risk)
   */
  private static calculateRiskScore(patterns: ClientPattern[], predictions: ClientPrediction[]): number {
    let riskScore = 20; // Base risk

    // Increase risk based on declining patterns
    const decliningCount = patterns.filter(p => p.trend === 'declining').length;
    riskScore += decliningCount * 15;

    // Increase risk based on high-risk predictions
    const highRiskPredictions = predictions.filter(p => p.probability > 0.6 && p.type === 'churn_risk');
    riskScore += highRiskPredictions.length * 20;

    return Math.min(100, Math.max(0, riskScore));
  }

  /**
   * Calculate engagement score (0-100, higher = better engagement)
   */
  private static calculateEngagementScore(patterns: ClientPattern[]): number {
    let engagementScore = 50; // Base score

    patterns.forEach(pattern => {
      if (pattern.type === 'engagement') {
        if (pattern.trend === 'improving') engagementScore += 20;
        if (pattern.trend === 'declining') engagementScore -= 15;
        engagementScore += (pattern.confidence - 0.5) * 20;
      }
    });

    return Math.min(100, Math.max(0, engagementScore));
  }

  /**
   * Calculate success probability (0-100)
   */
  private static calculateSuccessProbability(patterns: ClientPattern[], predictions: ClientPrediction[]): number {
    let successProb = 50; // Base probability

    // Adjust based on patterns
    patterns.forEach(pattern => {
      if (pattern.trend === 'improving') successProb += 10;
      if (pattern.trend === 'declining') successProb -= 8;
    });

    // Adjust based on success predictions
    const successPrediction = predictions.find(p => p.type === 'success_probability');
    if (successPrediction) {
      successProb = successPrediction.probability * 100;
    }

    return Math.min(100, Math.max(0, successProb));
  }

  /**
   * Get basic client information
   */
  private static async getClientInfo(clientId: number): Promise<{ name: string }> {
    try {
      const result = await sql`
        SELECT name FROM users WHERE id = ${clientId} LIMIT 1
      `;

      return {
        name: result.rows[0]?.name || 'Onbekende Cliënt'
      };
    } catch (error) {
      console.error('Error getting client info:', error);
      return { name: 'Onbekende Cliënt' };
    }
  }

  /**
   * Generate analytics report for all clients
   */
  static async generateCoachAnalyticsReport(coachId: number): Promise<any> {
    try {
      // Get all clients for this coach
      const clientsResult = await sql`
        SELECT u.id, u.name
        FROM coach_client_assignments cca
        JOIN users u ON cca.client_user_id = u.id
        WHERE cca.coach_user_id = ${coachId}
        AND cca.status = 'active'
      `;

      const clientAnalytics = await Promise.all(
        clientsResult.rows.map(async (client: any) => {
          try {
            return await this.generateClientAnalytics(client.id);
          } catch (error) {
            console.error(`Error generating analytics for client ${client.id}:`, error);
            return null;
          }
        })
      );

      const validAnalytics = clientAnalytics.filter(analytics => analytics !== null);

      // Aggregate insights
      const aggregatedInsights = this.aggregateCoachInsights(validAnalytics);

      return {
        totalClients: validAnalytics.length,
        averageRiskScore: validAnalytics.reduce((sum, a) => sum + a.riskScore, 0) / validAnalytics.length,
        averageEngagementScore: validAnalytics.reduce((sum, a) => sum + a.engagementScore, 0) / validAnalytics.length,
        averageSuccessProbability: validAnalytics.reduce((sum, a) => sum + a.successProbability, 0) / validAnalytics.length,
        clientAnalytics: validAnalytics,
        aggregatedInsights
      };
    } catch (error) {
      console.error('Error generating coach analytics report:', error);
      throw error;
    }
  }

  /**
   * Aggregate insights across all clients for coach overview
   */
  private static aggregateCoachInsights(clientAnalytics: ClientAnalytics[]): ClientInsight[] {
    const insights: ClientInsight[] = [];

    // High risk clients
    const highRiskClients = clientAnalytics.filter(a => a.riskScore > 70);
    if (highRiskClients.length > 0) {
      insights.push({
        category: 'warning',
        title: `${highRiskClients.length} cliënten hoge risico`,
        description: `${highRiskClients.map(c => c.clientName).join(', ')} hebben aandacht nodig`,
        impact: 'high',
        actionable: true,
        suggestedAction: 'Neem contact op met deze cliënten'
      });
    }

    // Improving clients
    const improvingClients = clientAnalytics.filter(a =>
      a.patterns.some(p => p.trend === 'improving' && p.confidence > 0.7)
    );
    if (improvingClients.length > 0) {
      insights.push({
        category: 'success',
        title: `${improvingClients.length} cliënten verbeteren`,
        description: `${improvingClients.map(c => c.clientName).join(', ')} tonen positieve ontwikkelingen`,
        impact: 'medium',
        actionable: false
      });
    }

    // Success predictions
    const highSuccessClients = clientAnalytics.filter(a => a.successProbability > 80);
    if (highSuccessClients.length > 0) {
      insights.push({
        category: 'strength',
        title: `${highSuccessClients.length} cliënten op schema`,
        description: `Deze cliënten hebben hoge kans op succes`,
        impact: 'medium',
        actionable: false
      });
    }

    return insights;
  }
}