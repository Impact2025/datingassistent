/**
 * Scan Retake Eligibility Check API
 * POST /api/scans/retake-check
 *
 * Checks if user can retake a specific scan type
 * Enforces cooldown periods and max attempts per year
 *
 * Request Body:
 * {
 *   userId: number,
 *   scanType: 'hechtingsstijl' | 'dating-style' | 'emotional-readiness'
 * }
 *
 * Response:
 * {
 *   canRetake: boolean,
 *   reason: string,
 *   daysRemaining?: number,
 *   canRetakeAt?: string,
 *   totalAttempts: number,
 *   lastCompletedAt?: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Retake policies
const RETAKE_POLICIES: Record<string, {
  cooldownDays: number;
  maxAttemptsPerYear: number;
  name: string;
}> = {
  'hechtingsstijl': {
    cooldownDays: 90,
    maxAttemptsPerYear: 4,
    name: 'Hechtingsstijl QuickScan'
  },
  'dating-style': {
    cooldownDays: 90,
    maxAttemptsPerYear: 4,
    name: 'Dating Style & Blind Spots'
  },
  'emotional-readiness': {
    cooldownDays: 30,
    maxAttemptsPerYear: 12,
    name: 'Emotional Readiness Check'
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, scanType } = body;

    // Validation
    if (!userId || !scanType) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, scanType' },
        { status: 400 }
      );
    }

    if (!RETAKE_POLICIES[scanType]) {
      return NextResponse.json(
        { error: `Invalid scan type: ${scanType}. Must be one of: ${Object.keys(RETAKE_POLICIES).join(', ')}` },
        { status: 400 }
      );
    }

    const policy = RETAKE_POLICIES[scanType];

    // Use database function to check retake eligibility
    const result = await db.query(
      `SELECT * FROM can_user_retake_scan($1, $2)`,
      [userId, scanType]
    );

    if (result.rows.length === 0) {
      // No record - user has never taken this scan
      return NextResponse.json({
        canRetake: true,
        reason: 'first_attempt',
        message: `This is your first time taking the ${policy.name}`,
        scanType,
        policy: {
          cooldownDays: policy.cooldownDays,
          maxAttemptsPerYear: policy.maxAttemptsPerYear
        }
      });
    }

    const check = result.rows[0];

    // Get additional context
    const statusQuery = await db.query(
      `SELECT total_attempts, last_completed_at, can_retake_after
       FROM scan_retake_status
       WHERE user_id = $1 AND scan_type = $2`,
      [userId, scanType]
    );

    const status = statusQuery.rows[0] || {};

    // Build response based on eligibility
    const response: any = {
      canRetake: check.can_retake,
      reason: check.reason,
      scanType,
      totalAttempts: status.total_attempts || 0,
      lastCompletedAt: status.last_completed_at,
      policy: {
        cooldownDays: policy.cooldownDays,
        maxAttemptsPerYear: policy.maxAttemptsPerYear,
        name: policy.name
      }
    };

    if (!check.can_retake) {
      response.daysRemaining = check.days_remaining;
      response.canRetakeAt = check.can_retake_at;
      response.message = `You can retake the ${policy.name} in ${check.days_remaining} days (${new Date(check.can_retake_at).toLocaleDateString()})`;

      // Scientific reasoning
      response.reasoning = check.days_remaining > 60
        ? `For accurate measurement, we recommend waiting ${policy.cooldownDays} days between scans. This ensures meaningful changes can be detected.`
        : `Almost there! Wait ${check.days_remaining} more days for the most reliable results.`;
    } else {
      response.message = check.reason === 'first_attempt'
        ? `Ready to take your first ${policy.name}!`
        : `You're eligible to retake the ${policy.name}!`;

      // Show what they might track
      if (status.last_completed_at) {
        const daysSinceLastScan = Math.floor(
          (Date.now() - new Date(status.last_completed_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        response.daysSinceLastScan = daysSinceLastScan;
        response.reasoning = `It's been ${daysSinceLastScan} days since your last scan. Compare your growth!`;
      }
    }

    // Check max attempts per year
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const attemptsThisYear = await db.query(
      `SELECT COUNT(*) as count
       FROM user_scan_history
       WHERE user_id = $1
         AND scan_type = $2
         AND completed_at > $3`,
      [userId, scanType, oneYearAgo]
    );

    response.attemptsThisYear = parseInt(attemptsThisYear.rows[0].count, 10);

    if (response.attemptsThisYear >= policy.maxAttemptsPerYear) {
      response.canRetake = false;
      response.reason = 'max_attempts_reached';
      response.message = `You've reached the maximum of ${policy.maxAttemptsPerYear} scans per year for ${policy.name}`;
    }

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Error checking retake eligibility:', error);
    return NextResponse.json(
      {
        error: 'Failed to check retake eligibility',
        message: error.message
      },
      { status: 500 }
    );
  }
}
