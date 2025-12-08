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

    // Check retake eligibility directly (without PL/pgSQL function)
    const statusQuery = await db.query`
      SELECT total_attempts, last_completed_at, can_retake_after
      FROM scan_retake_status
      WHERE user_id = ${userId} AND scan_type = ${scanType}
    `;

    if (statusQuery.rows.length === 0) {
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

    const status = statusQuery.rows[0];
    const now = new Date();
    const canRetakeAt = status.can_retake_after ? new Date(status.can_retake_after) : null;

    // Determine if user can retake
    const canRetake = !canRetakeAt || canRetakeAt <= now;
    const daysRemaining = canRetakeAt && canRetakeAt > now
      ? Math.ceil((canRetakeAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Build response based on eligibility
    const response: any = {
      canRetake: canRetake,
      reason: canRetake ? 'cooldown_passed' : 'cooldown_active',
      scanType,
      totalAttempts: status.total_attempts || 0,
      lastCompletedAt: status.last_completed_at,
      policy: {
        cooldownDays: policy.cooldownDays,
        maxAttemptsPerYear: policy.maxAttemptsPerYear,
        name: policy.name
      }
    };

    if (!canRetake) {
      response.daysRemaining = daysRemaining;
      response.canRetakeAt = canRetakeAt;
      response.message = `You can retake the ${policy.name} in ${daysRemaining} days (${canRetakeAt ? new Date(canRetakeAt).toLocaleDateString() : 'N/A'})`;

      // Scientific reasoning
      response.reasoning = daysRemaining > 60
        ? `For accurate measurement, we recommend waiting ${policy.cooldownDays} days between scans. This ensures meaningful changes can be detected.`
        : `Almost there! Wait ${daysRemaining} more days for the most reliable results.`;
    } else {
      response.message = response.reason === 'first_attempt'
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
