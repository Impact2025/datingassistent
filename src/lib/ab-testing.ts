/**
 * A/B Testing Framework for AI Profile Builder
 * Professional implementation with statistical significance tracking
 */

import { sql } from '@vercel/postgres';

export interface ABTestVariant {
  id: string;
  name: string;
  weight: number; // Percentage weight (0-100)
  config: Record<string, any>;
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  variants: ABTestVariant[];
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
  targetMetric: string; // e.g., 'profile_completion_rate', 'copy_rate'
}

export interface ABTestResult {
  variantId: string;
  participants: number;
  conversions: number;
  conversionRate: number;
  confidence: number;
}

class ABTestingService {
  private tests: Map<string, ABTest> = new Map();

  constructor() {
    this.initializeTests();
  }

  private initializeTests() {
    // Profile Builder A/B Tests
    this.tests.set('quiz_flow', {
      id: 'quiz_flow',
      name: 'Quiz Flow Optimization',
      description: 'Test different question orders and UI flows',
      isActive: true,
      startDate: new Date(),
      targetMetric: 'profile_completion_rate',
      variants: [
        {
          id: 'original_flow',
          name: 'Original Flow',
          weight: 50,
          config: {
            questionOrder: 'original',
            showProgress: true,
            validationMode: 'strict'
          }
        },
        {
          id: 'optimized_flow',
          name: 'Optimized Flow',
          weight: 50,
          config: {
            questionOrder: 'optimized',
            showProgress: true,
            validationMode: 'lenient',
            personalityFirst: true
          }
        }
      ]
    });

    this.tests.set('ai_prompts', {
      id: 'ai_prompts',
      name: 'AI Prompt Optimization',
      description: 'Test different AI prompt strategies for profile generation',
      isActive: true,
      startDate: new Date(),
      targetMetric: 'profile_copy_rate',
      variants: [
        {
          id: 'generic_prompt',
          name: 'Generic Dutch',
          weight: 33,
          config: {
            promptStyle: 'generic',
            includeCulture: false,
            temperature: 0.7
          }
        },
        {
          id: 'cultural_prompt',
          name: 'Culture-Aware',
          weight: 33,
          config: {
            promptStyle: 'cultural',
            includeCulture: true,
            dutchReferences: true,
            temperature: 0.8
          }
        },
        {
          id: 'personalized_prompt',
          name: 'Hyper-Personalized',
          weight: 34,
          config: {
            promptStyle: 'personalized',
            includeCulture: true,
            userSpecific: true,
            temperature: 0.6
          }
        }
      ]
    });

    this.tests.set('profile_variants', {
      id: 'profile_variants',
      name: 'Profile Variant Testing',
      description: 'Test different numbers and types of profile variants',
      isActive: true,
      startDate: new Date(),
      targetMetric: 'profile_selection_rate',
      variants: [
        {
          id: 'three_variants',
          name: '3 Variants',
          weight: 70,
          config: {
            variantCount: 3,
            variantTypes: ['luchtig', 'serieus', 'mysterieus']
          }
        },
        {
          id: 'five_variants',
          name: '5 Variants',
          weight: 30,
          config: {
            variantCount: 5,
            variantTypes: ['luchtig', 'serieus', 'mysterieus', 'ambitieus', 'kreatief']
          }
        }
      ]
    });
  }

  /**
   * Get variant for user based on consistent hashing
   */
  getVariantForUser(testId: string, userId: string): ABTestVariant | null {
    const test = this.tests.get(testId);
    if (!test || !test.isActive) return null;

    // Simple hash-based assignment for consistency
    const hash = this.simpleHash(userId + testId);
    const random = (hash % 100) / 100;

    let cumulativeWeight = 0;
    for (const variant of test.variants) {
      cumulativeWeight += variant.weight / 100;
      if (random <= cumulativeWeight) {
        return variant;
      }
    }

    // Fallback to first variant
    return test.variants[0];
  }

  /**
   * Track conversion event
   */
  async trackConversion(testId: string, variantId: string, userId: string, event: string) {
    try {
      await sql`
        INSERT INTO ab_test_conversions (test_id, variant_id, user_id, event_type, created_at)
        VALUES (${testId}, ${variantId}, ${userId}, ${event}, NOW())
        ON CONFLICT (test_id, variant_id, user_id, event_type)
        DO NOTHING
      `;
    } catch (error) {
      console.error('Failed to track A/B test conversion:', error);
    }
  }

  /**
   * Get test results with statistical significance
   */
  async getTestResults(testId: string): Promise<ABTestResult[]> {
    try {
      const results = await sql`
        SELECT
          variant_id,
          COUNT(DISTINCT user_id) as participants,
          COUNT(CASE WHEN event_type = 'conversion' THEN 1 END) as conversions
        FROM ab_test_conversions
        WHERE test_id = ${testId}
        GROUP BY variant_id
      `;

      return results.rows.map(row => ({
        variantId: row.variant_id,
        participants: parseInt(row.participants),
        conversions: parseInt(row.conversions),
        conversionRate: row.participants > 0 ? (row.conversions / row.participants) * 100 : 0,
        confidence: this.calculateConfidence(parseInt(row.conversions), parseInt(row.participants))
      }));
    } catch (error) {
      console.error('Failed to get A/B test results:', error);
      return [];
    }
  }

  /**
   * Simple hash function for consistent user assignment
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Calculate statistical confidence (simplified)
   */
  private calculateConfidence(conversions: number, participants: number): number {
    if (participants === 0) return 0;

    const rate = conversions / participants;
    const standardError = Math.sqrt((rate * (1 - rate)) / participants);

    // Return confidence as percentage (simplified approximation)
    if (participants < 30) return 0; // Too small sample
    if (standardError === 0) return 100;

    // Approximate confidence interval
    const zScore = 1.96; // 95% confidence
    const margin = zScore * standardError;
    const confidence = Math.max(0, Math.min(100, (1 - margin / rate) * 100));

    return Math.round(confidence);
  }

  /**
   * Get all active tests
   */
  getActiveTests(): ABTest[] {
    return Array.from(this.tests.values()).filter(test => test.isActive);
  }

  /**
   * Check if test exists and is active
   */
  isTestActive(testId: string): boolean {
    const test = this.tests.get(testId);
    return test?.isActive ?? false;
  }
}

// Singleton instance
export const abTesting = new ABTestingService();

// React hook for A/B testing
export function useABTest(testId: string) {
  const getVariant = (userId: string) => abTesting.getVariantForUser(testId, userId);
  const trackConversion = (variantId: string, userId: string, event: string) =>
    abTesting.trackConversion(testId, variantId, userId, event);

  return { getVariant, trackConversion };
}