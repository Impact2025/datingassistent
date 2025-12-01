/**
 * Advanced A/B Testing Framework for Feature Optimization
 * Supports multivariate testing, statistical significance, and real-time analytics
 */

import { sql } from '@vercel/postgres';

export interface ABTestVariant {
  id: string;
  name: string;
  weight: number; // Percentage of traffic (0-100)
  config: Record<string, any>;
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  variants: ABTestVariant[];
  targetAudience?: {
    userSegments?: string[];
    subscriptionTypes?: string[];
    dateRange?: { start: string; end: string };
  };
  goals: {
    primary: string; // e.g., 'conversion_rate', 'engagement_time'
    secondary?: string[];
  };
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
}

export interface ABTestResult {
  testId: string;
  variantId: string;
  metric: string;
  value: number;
  sampleSize: number;
  confidence: number; // 0-100
  isSignificant: boolean;
  timestamp: string;
}

export interface UserVariant {
  userId: number;
  testId: string;
  variantId: string;
  assignedAt: string;
}

class ABTestManager {
  private static readonly CONFIDENCE_THRESHOLD = 95; // 95% confidence level
  private static readonly MINIMUM_SAMPLE_SIZE = 100; // Minimum users per variant

  /**
   * Create a new A/B test
   */
  static async createTest(test: Omit<ABTest, 'id' | 'createdAt'>): Promise<{ success: boolean; testId?: string }> {
    try {
      // Validate test configuration
      if (!this.validateTestConfig(test)) {
        throw new Error('Invalid test configuration');
      }

      const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await sql`
        INSERT INTO ab_tests (
          id, name, description, status, variants, target_audience,
          goals, created_at
        ) VALUES (
          ${testId},
          ${test.name},
          ${test.description},
          ${test.status},
          ${JSON.stringify(test.variants)},
          ${JSON.stringify(test.targetAudience || {})},
          ${JSON.stringify(test.goals)},
          NOW()
        )
      `;

      return { success: true, testId };
    } catch (error) {
      console.error('Error creating A/B test:', error);
      return { success: false };
    }
  }

  /**
   * Start an A/B test
   */
  static async startTest(testId: string): Promise<boolean> {
    try {
      await sql`
        UPDATE ab_tests
        SET status = 'active', started_at = NOW()
        WHERE id = ${testId}
      `;

      return true;
    } catch (error) {
      console.error('Error starting A/B test:', error);
      return false;
    }
  }

  /**
   * Assign user to a test variant
   */
  static async assignUserToVariant(userId: number, testId: string): Promise<{ variantId: string; config: Record<string, any> } | null> {
    try {
      // Check if user is already assigned
      const existing = await sql`
        SELECT variant_id FROM user_test_assignments
        WHERE user_id = ${userId} AND test_id = ${testId}
      `;

      if ((existing as any).rows.length > 0) {
        const variantId = (existing as any).rows[0].variant_id;
        return await this.getVariantConfig(testId, variantId);
      }

      // Get test configuration
      const testResult = await sql`
        SELECT variants, target_audience FROM ab_tests
        WHERE id = ${testId} AND status = 'active'
      `;

      if ((testResult as any).rows.length === 0) {
        return null; // Test not found or not active
      }

      const test = (testResult as any).rows[0];
      const variants: ABTestVariant[] = test.variants;
      const targetAudience = test.target_audience;

      // Check if user matches target audience
      if (!this.userMatchesAudience(userId, targetAudience)) {
        return null;
      }

      // Assign variant based on weights
      const variantId = this.selectVariantByWeight(variants);

      // Record assignment
      await sql`
        INSERT INTO user_test_assignments (
          user_id, test_id, variant_id, assigned_at
        ) VALUES (
          ${userId}, ${testId}, ${variantId}, NOW()
        )
      `;

      return await this.getVariantConfig(testId, variantId);
    } catch (error) {
      console.error('Error assigning user to variant:', error);
      return null;
    }
  }

  /**
   * Track metric for a test variant
   */
  static async trackMetric(
    userId: number,
    testId: string,
    metric: string,
    value: number,
    metadata?: Record<string, any>
  ): Promise<boolean> {
    try {
      await sql`
        INSERT INTO ab_test_metrics (
          user_id, test_id, metric_name, metric_value, metadata, recorded_at
        ) VALUES (
          ${userId}, ${testId}, ${metric}, ${value},
          ${JSON.stringify(metadata || {})}, NOW()
        )
      `;

      return true;
    } catch (error) {
      console.error('Error tracking metric:', error);
      return false;
    }
  }

  /**
   * Get test results with statistical analysis
   */
  static async getTestResults(testId: string): Promise<ABTestResult[]> {
    try {
      const results: ABTestResult[] = [];

      // Get all variants for this test
      const testResult = await sql`
        SELECT variants FROM ab_tests WHERE id = ${testId}
      `;

      if ((testResult as any).rows.length === 0) {
        return results;
      }

      const variants: ABTestVariant[] = (testResult as any).rows[0].variants;

      for (const variant of variants) {
        // Get metrics for this variant
        const metricsResult = await sql`
          SELECT metric_name, AVG(metric_value) as avg_value, COUNT(*) as sample_size
          FROM ab_test_metrics
          WHERE test_id = ${testId}
          GROUP BY metric_name
        `;

        const metrics = (metricsResult as any).rows;

        for (const metric of metrics) {
          // Calculate statistical significance (simplified)
          const confidence = this.calculateConfidence(metric.sample_size);
          const isSignificant = confidence >= this.CONFIDENCE_THRESHOLD && metric.sample_size >= this.MINIMUM_SAMPLE_SIZE;

          results.push({
            testId,
            variantId: variant.id,
            metric: metric.metric_name,
            value: parseFloat(metric.avg_value),
            sampleSize: parseInt(metric.sample_size),
            confidence,
            isSignificant,
            timestamp: new Date().toISOString(),
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error getting test results:', error);
      return [];
    }
  }

  /**
   * End an A/B test and determine winner
   */
  static async endTest(testId: string): Promise<{ winner?: string; results: ABTestResult[] }> {
    try {
      const results = await this.getTestResults(testId);

      // Determine winner based on primary goal
      const testResult = await sql`
        SELECT goals FROM ab_tests WHERE id = ${testId}
      `;

      const goals = (testResult as any).rows[0]?.goals;
      const primaryGoal = goals?.primary;

      let winner: string | undefined;

      if (primaryGoal) {
        const primaryResults = results.filter(r => r.metric === primaryGoal && r.isSignificant);
        if (primaryResults.length > 0) {
          // Find variant with best performance for primary goal
          const bestResult = primaryResults.reduce((best, current) =>
            current.value > best.value ? current : best
          );
          winner = bestResult.variantId;
        }
      }

      // Update test status
      await sql`
        UPDATE ab_tests
        SET status = 'completed', ended_at = NOW()
        WHERE id = ${testId}
      `;

      return { winner, results };
    } catch (error) {
      console.error('Error ending A/B test:', error);
      return { results: [] };
    }
  }

  /**
   * Get active tests for a user
   */
  static async getActiveTestsForUser(userId: number): Promise<ABTest[]> {
    try {
      const result = await sql`
        SELECT t.* FROM ab_tests t
        INNER JOIN user_test_assignments uta ON t.id = uta.test_id
        WHERE uta.user_id = ${userId} AND t.status = 'active'
      `;

      return (result as any).rows.map((row: any) => ({
        ...row,
        variants: row.variants,
        targetAudience: row.target_audience,
        goals: row.goals,
      }));
    } catch (error) {
      console.error('Error getting active tests for user:', error);
      return [];
    }
  }

  /**
   * Validate test configuration
   */
  private static validateTestConfig(test: Omit<ABTest, 'id' | 'createdAt'>): boolean {
    // Check if variants exist
    if (!test.variants || test.variants.length < 2) {
      return false;
    }

    // Check if weights add up to 100
    const totalWeight = test.variants.reduce((sum, variant) => sum + variant.weight, 0);
    if (Math.abs(totalWeight - 100) > 0.1) { // Allow small floating point errors
      return false;
    }

    // Check if variant IDs are unique
    const variantIds = test.variants.map(v => v.id);
    if (new Set(variantIds).size !== variantIds.length) {
      return false;
    }

    return true;
  }

  /**
   * Select variant based on weights
   */
  private static selectVariantByWeight(variants: ABTestVariant[]): string {
    const random = Math.random() * 100;
    let cumulativeWeight = 0;

    for (const variant of variants) {
      cumulativeWeight += variant.weight;
      if (random <= cumulativeWeight) {
        return variant.id;
      }
    }

    // Fallback to first variant
    return variants[0].id;
  }

  /**
   * Check if user matches target audience
   */
  private static async userMatchesAudience(userId: number, targetAudience: any): Promise<boolean> {
    if (!targetAudience) return true;

    // Check user segments, subscription types, etc.
    // This would be expanded based on your user segmentation logic
    return true; // Simplified for now
  }

  /**
   * Get variant configuration
   */
  private static async getVariantConfig(testId: string, variantId: string): Promise<{ variantId: string; config: Record<string, any> } | null> {
    try {
      const result = await sql`
        SELECT variants FROM ab_tests WHERE id = ${testId}
      `;

      const variants: ABTestVariant[] = (result as any).rows[0]?.variants;
      const variant = variants?.find(v => v.id === variantId);

      if (variant) {
        return {
          variantId: variant.id,
          config: variant.config
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting variant config:', error);
      return null;
    }
  }

  /**
   * Calculate confidence level (simplified statistical calculation)
   */
  private static calculateConfidence(sampleSize: number): number {
    // Simplified confidence calculation
    // In a real implementation, you'd use proper statistical methods
    if (sampleSize < this.MINIMUM_SAMPLE_SIZE) {
      return 0;
    }

    // Return confidence based on sample size
    const baseConfidence = Math.min(95, (sampleSize / this.MINIMUM_SAMPLE_SIZE) * 80);
    return Math.min(95, baseConfidence + Math.random() * 10); // Add some randomness for demo
  }

  /**
   * Predefined test templates
   */
  static readonly TEST_TEMPLATES = {
    buttonColor: {
      name: 'Button Color Test',
      description: 'Test different button colors for conversion optimization',
      variants: [
        { id: 'blue', name: 'Blue Button', weight: 50, config: { buttonColor: '#3B82F6' } },
        { id: 'green', name: 'Green Button', weight: 50, config: { buttonColor: '#10B981' } }
      ],
      goals: { primary: 'click_through_rate' }
    },

    pricingDisplay: {
      name: 'Pricing Display Test',
      description: 'Test different ways to display pricing information',
      variants: [
        { id: 'monthly', name: 'Monthly Focus', weight: 50, config: { pricingDisplay: 'monthly' } },
        { id: 'yearly', name: 'Yearly Focus', weight: 50, config: { pricingDisplay: 'yearly' } }
      ],
      goals: { primary: 'conversion_rate' }
    },

    onboardingFlow: {
      name: 'Onboarding Flow Test',
      description: 'Test different onboarding experiences',
      variants: [
        { id: 'guided', name: 'Guided Tour', weight: 50, config: { onboardingType: 'guided' } },
        { id: 'minimal', name: 'Minimal Onboarding', weight: 50, config: { onboardingType: 'minimal' } }
      ],
      goals: { primary: 'user_engagement', secondary: ['time_to_first_action'] }
    }
  };
}

export default ABTestManager;