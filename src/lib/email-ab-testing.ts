/**
 * Email A/B Testing Framework
 * Enables split testing for email campaigns
 */

import { sql } from '@vercel/postgres';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface ABTestVariant {
  id: string;
  name: string;
  subject?: string;
  templateOverrides?: Record<string, any>;
  weight: number; // 0-100 percentage
}

export interface ABTest {
  id: string;
  name: string;
  description?: string;
  emailType: string;
  variants: ABTestVariant[];
  status: 'draft' | 'active' | 'paused' | 'completed';
  startDate: Date;
  endDate?: Date;
  winnerVariantId?: string;
  goalMetric: 'open_rate' | 'click_rate' | 'conversion_rate';
  minimumSampleSize: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ABTestResult {
  variantId: string;
  variantName: string;
  sent: number;
  opened: number;
  clicked: number;
  converted: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  confidence: number; // Statistical confidence level
}

// ============================================
// A/B TEST ASSIGNMENT
// ============================================

/**
 * Assign a user to an A/B test variant
 * Uses consistent hashing to ensure same user always gets same variant
 */
export async function assignUserToVariant(
  userId: number,
  emailType: string
): Promise<{ testId: string; variantId: string; variant: ABTestVariant } | null> {
  try {
    // Get active A/B test for this email type
    const testResult = await sql`
      SELECT * FROM email_ab_tests
      WHERE email_type = ${emailType}
        AND status = 'active'
        AND start_date <= NOW()
        AND (end_date IS NULL OR end_date > NOW())
      LIMIT 1
    `;

    if (testResult.rows.length === 0) {
      return null; // No active test
    }

    const test = testResult.rows[0];
    const variants: ABTestVariant[] = JSON.parse(test.variants);

    // Check if user already assigned to this test
    const existingAssignment = await sql`
      SELECT variant_id FROM email_ab_assignments
      WHERE user_id = ${userId} AND test_id = ${test.id}
    `;

    let assignedVariantId: string;

    if (existingAssignment.rows.length > 0) {
      assignedVariantId = existingAssignment.rows[0].variant_id;
    } else {
      // Assign new user using weighted random selection
      assignedVariantId = selectWeightedVariant(userId, variants);

      // Store assignment
      await sql`
        INSERT INTO email_ab_assignments (user_id, test_id, variant_id, assigned_at)
        VALUES (${userId}, ${test.id}, ${assignedVariantId}, NOW())
        ON CONFLICT (user_id, test_id) DO NOTHING
      `;
    }

    const variant = variants.find(v => v.id === assignedVariantId);

    return {
      testId: test.id,
      variantId: assignedVariantId,
      variant: variant!
    };
  } catch (error) {
    console.error('Error assigning user to A/B variant:', error);
    return null;
  }
}

/**
 * Select variant based on weights using consistent hashing
 */
function selectWeightedVariant(userId: number, variants: ABTestVariant[]): string {
  // Use user ID for consistent assignment
  const hash = simpleHash(userId.toString());
  const roll = hash % 100;

  let cumulative = 0;
  for (const variant of variants) {
    cumulative += variant.weight;
    if (roll < cumulative) {
      return variant.id;
    }
  }

  // Fallback to last variant
  return variants[variants.length - 1].id;
}

/**
 * Simple hash function for consistent user assignment
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// ============================================
// A/B TEST TRACKING
// ============================================

/**
 * Track A/B test event (open, click, conversion)
 */
export async function trackABTestEvent(
  testId: string,
  variantId: string,
  userId: number,
  eventType: 'sent' | 'opened' | 'clicked' | 'converted'
): Promise<void> {
  try {
    await sql`
      INSERT INTO email_ab_events (
        test_id,
        variant_id,
        user_id,
        event_type,
        created_at
      )
      VALUES (
        ${testId},
        ${variantId},
        ${userId},
        ${eventType},
        NOW()
      )
    `;
  } catch (error) {
    console.error('Error tracking A/B test event:', error);
  }
}

// ============================================
// A/B TEST RESULTS
// ============================================

/**
 * Get A/B test results with statistical analysis
 */
export async function getABTestResults(testId: string): Promise<ABTestResult[]> {
  try {
    const results = await sql`
      SELECT
        variant_id,
        COUNT(CASE WHEN event_type = 'sent' THEN 1 END) as sent,
        COUNT(CASE WHEN event_type = 'opened' THEN 1 END) as opened,
        COUNT(CASE WHEN event_type = 'clicked' THEN 1 END) as clicked,
        COUNT(CASE WHEN event_type = 'converted' THEN 1 END) as converted
      FROM email_ab_events
      WHERE test_id = ${testId}
      GROUP BY variant_id
    `;

    // Get test info for variant names
    const testResult = await sql`
      SELECT variants FROM email_ab_tests WHERE id = ${testId}
    `;

    const variants: ABTestVariant[] = testResult.rows.length > 0
      ? JSON.parse(testResult.rows[0].variants)
      : [];

    return results.rows.map(row => {
      const sent = parseInt(row.sent) || 0;
      const opened = parseInt(row.opened) || 0;
      const clicked = parseInt(row.clicked) || 0;
      const converted = parseInt(row.converted) || 0;

      const variant = variants.find(v => v.id === row.variant_id);

      return {
        variantId: row.variant_id,
        variantName: variant?.name || row.variant_id,
        sent,
        opened,
        clicked,
        converted,
        openRate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
        clickRate: opened > 0 ? Math.round((clicked / opened) * 100) : 0,
        conversionRate: sent > 0 ? Math.round((converted / sent) * 100) : 0,
        confidence: calculateConfidence(sent, opened),
      };
    });
  } catch (error) {
    console.error('Error getting A/B test results:', error);
    return [];
  }
}

/**
 * Calculate statistical confidence using simple approximation
 */
function calculateConfidence(sampleSize: number, successes: number): number {
  if (sampleSize < 30) return 0; // Need minimum sample size

  const p = successes / sampleSize;
  const standardError = Math.sqrt((p * (1 - p)) / sampleSize);
  const zScore = p / standardError;

  // Simplified confidence calculation
  if (zScore > 2.58) return 99;
  if (zScore > 1.96) return 95;
  if (zScore > 1.65) return 90;
  if (zScore > 1.28) return 80;
  return Math.round(zScore * 30); // Rough approximation
}

// ============================================
// A/B TEST MANAGEMENT
// ============================================

/**
 * Create a new A/B test
 */
export async function createABTest(
  name: string,
  description: string,
  emailType: string,
  variants: ABTestVariant[],
  goalMetric: 'open_rate' | 'click_rate' | 'conversion_rate',
  minimumSampleSize: number = 100
): Promise<string> {
  const testId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  await sql`
    INSERT INTO email_ab_tests (
      id,
      name,
      description,
      email_type,
      variants,
      status,
      goal_metric,
      minimum_sample_size,
      start_date,
      created_at,
      updated_at
    )
    VALUES (
      ${testId},
      ${name},
      ${description},
      ${emailType},
      ${JSON.stringify(variants)},
      'draft',
      ${goalMetric},
      ${minimumSampleSize},
      NOW(),
      NOW(),
      NOW()
    )
  `;

  return testId;
}

/**
 * Activate an A/B test
 */
export async function activateABTest(testId: string): Promise<void> {
  await sql`
    UPDATE email_ab_tests
    SET status = 'active', start_date = NOW(), updated_at = NOW()
    WHERE id = ${testId}
  `;
}

/**
 * Pause an A/B test
 */
export async function pauseABTest(testId: string): Promise<void> {
  await sql`
    UPDATE email_ab_tests
    SET status = 'paused', updated_at = NOW()
    WHERE id = ${testId}
  `;
}

/**
 * Complete an A/B test and declare winner
 */
export async function completeABTest(testId: string, winnerVariantId: string): Promise<void> {
  await sql`
    UPDATE email_ab_tests
    SET
      status = 'completed',
      end_date = NOW(),
      winner_variant_id = ${winnerVariantId},
      updated_at = NOW()
    WHERE id = ${testId}
  `;
}

/**
 * Get all A/B tests
 */
export async function getAllABTests(): Promise<ABTest[]> {
  const result = await sql`
    SELECT * FROM email_ab_tests
    ORDER BY created_at DESC
  `;

  return result.rows.map(row => ({
    id: row.id,
    name: row.name,
    description: row.description,
    emailType: row.email_type,
    variants: JSON.parse(row.variants),
    status: row.status,
    startDate: new Date(row.start_date),
    endDate: row.end_date ? new Date(row.end_date) : undefined,
    winnerVariantId: row.winner_variant_id,
    goalMetric: row.goal_metric,
    minimumSampleSize: row.minimum_sample_size,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }));
}

// ============================================
// HELPER: Apply A/B Test to Email
// ============================================

/**
 * Apply A/B test variant overrides to email data
 */
export function applyVariantOverrides(
  emailData: Record<string, any>,
  variant: ABTestVariant
): Record<string, any> {
  const modifiedData = { ...emailData };

  // Apply subject override
  if (variant.subject) {
    modifiedData.subject = variant.subject;
  }

  // Apply template overrides
  if (variant.templateOverrides) {
    Object.assign(modifiedData, variant.templateOverrides);
  }

  return modifiedData;
}
