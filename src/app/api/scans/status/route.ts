/**
 * Unified Scan Status API
 * GET /api/scans/status?userId={id}
 *
 * Returns completion status, retake eligibility, and latest results for all scans
 * Used by: Dashboard, ScanCard components, My Assessments page
 *
 * Response includes:
 * - Completion status for each scan type
 * - Latest result preview (primary result, score, date)
 * - Retake eligibility (can retake, days until available)
 * - Overall progress (X of Y scans completed)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ScanStatus {
  scanType: string;
  isCompleted: boolean;
  lastCompletedAt: string | null;
  totalAttempts: number;
  canRetake: boolean;
  daysUntilRetake: number;
  canRetakeAt: string | null;
  latestResult: {
    primaryResult: string | null;
    confidenceScore: number | null;
    assessmentId: number | null;
  };
}

interface StatusResponse {
  success: boolean;
  userId: number;
  scans: ScanStatus[];
  progress: {
    completed: number;
    total: number;
    percentage: number;
    nextRecommended: string | null;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Validation
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    const userIdNum = parseInt(userId, 10);
    if (isNaN(userIdNum)) {
      return NextResponse.json(
        { error: 'Invalid userId - must be a number' },
        { status: 400 }
      );
    }

    // Query scan status directly (without PL/pgSQL function)
    const result = await db.query`
      SELECT
        s.scan_type,
        (h.id IS NOT NULL) as is_completed,
        h.completed_at as last_completed_at,
        COALESCE(srs.total_attempts, 0) as total_attempts,
        (srs.can_retake_after IS NULL OR srs.can_retake_after <= NOW()) as can_retake,
        CASE
          WHEN srs.can_retake_after IS NULL OR srs.can_retake_after <= NOW() THEN 0
          ELSE CEIL(EXTRACT(EPOCH FROM (srs.can_retake_after - NOW())) / 86400)::INTEGER
        END as days_until_retake,
        h.primary_result as latest_primary_result,
        h.confidence_score as latest_confidence_score,
        h.id as assessment_id
      FROM (
        VALUES
          ('hechtingsstijl'),
          ('dating-style'),
          ('emotional-readiness'),
          ('levensvisie'),
          ('relatiepatronen')
      ) AS s(scan_type)
      LEFT JOIN LATERAL (
        SELECT * FROM user_scan_history
        WHERE user_id = ${userIdNum} AND scan_type = s.scan_type
        ORDER BY completed_at DESC
        LIMIT 1
      ) h ON TRUE
      LEFT JOIN scan_retake_status srs ON srs.user_id = ${userIdNum} AND srs.scan_type = s.scan_type
    `;

    const scans: ScanStatus[] = result.rows.map(row => ({
      scanType: row.scan_type,
      isCompleted: row.is_completed,
      lastCompletedAt: row.last_completed_at,
      totalAttempts: row.total_attempts,
      canRetake: row.can_retake,
      daysUntilRetake: row.days_until_retake || 0,
      canRetakeAt: row.can_retake ? null : new Date(
        Date.now() + (row.days_until_retake || 0) * 24 * 60 * 60 * 1000
      ).toISOString(),
      latestResult: {
        primaryResult: row.latest_primary_result,
        confidenceScore: row.latest_confidence_score,
        assessmentId: row.assessment_id
      }
    }));

    // Calculate overall progress
    const completedScans = scans.filter(s => s.isCompleted).length;
    const totalScans = scans.length;
    const percentage = totalScans > 0 ? Math.round((completedScans / totalScans) * 100) : 0;

    // Determine next recommended scan
    let nextRecommended: string | null = null;
    const incompleteScan = scans.find(s => !s.isCompleted);
    if (incompleteScan) {
      nextRecommended = incompleteScan.scanType;
    } else {
      // All completed - recommend first available retake
      const availableRetake = scans.find(s => s.canRetake);
      if (availableRetake) {
        nextRecommended = availableRetake.scanType;
      }
    }

    const response: StatusResponse = {
      success: true,
      userId: userIdNum,
      scans,
      progress: {
        completed: completedScans,
        total: totalScans,
        percentage,
        nextRecommended
      }
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'private, max-age=300', // Cache for 5 minutes
      }
    });

  } catch (error: any) {
    console.error('Error fetching scan status:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch scan status',
        message: error.message
      },
      { status: 500 }
    );
  }
}
