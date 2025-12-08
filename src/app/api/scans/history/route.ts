/**
 * Unified Scan History API
 * GET /api/scans/history?userId={id}&scanType={type}&limit={n}
 *
 * Returns complete scan history for a user
 * Used by: My Assessments page, Comparison view, Timeline
 *
 * Query Parameters:
 * - userId (required): User ID
 * - scanType (optional): Filter by specific scan type
 * - limit (optional): Limit number of results (default: 50)
 * - includeFullResults (optional): Include complete AI analysis (default: false)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ScanHistoryEntry {
  id: number;
  userId: number;
  scanType: string;
  assessmentId: number;
  completedAt: string;
  totalTimeSeconds: number | null;
  confidenceScore: number | null;
  primaryResult: string | null;
  scores: Record<string, number>;
  fullResults?: any; // Only included if requested
  improvementPercentage: number | null;
  trendsDetected: string[] | null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const scanType = searchParams.get('scanType');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const includeFullResults = searchParams.get('includeFullResults') === 'true';

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

    // Build query
    let query = `
      SELECT
        id,
        user_id,
        scan_type,
        assessment_id,
        completed_at,
        total_time_seconds,
        confidence_score,
        primary_result,
        scores_json,
        ${includeFullResults ? 'full_results,' : ''}
        improvement_percentage,
        trends_detected
      FROM user_scan_history
      WHERE user_id = $1
    `;

    const params: any[] = [userIdNum];

    if (scanType) {
      query += ` AND scan_type = $${params.length + 1}`;
      params.push(scanType);
    }

    query += ` ORDER BY completed_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await db.query(query, params);

    const history: ScanHistoryEntry[] = result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      scanType: row.scan_type,
      assessmentId: row.assessment_id,
      completedAt: row.completed_at,
      totalTimeSeconds: row.total_time_seconds,
      confidenceScore: row.confidence_score,
      primaryResult: row.primary_result,
      scores: row.scores_json || {},
      ...(includeFullResults && { fullResults: row.full_results }),
      improvementPercentage: row.improvement_percentage,
      trendsDetected: row.trends_detected
    }));

    // Group by scan type for easier consumption
    const groupedHistory: Record<string, ScanHistoryEntry[]> = {};
    history.forEach(entry => {
      if (!groupedHistory[entry.scanType]) {
        groupedHistory[entry.scanType] = [];
      }
      groupedHistory[entry.scanType].push(entry);
    });

    return NextResponse.json({
      success: true,
      userId: userIdNum,
      total: history.length,
      history,
      groupedHistory
    }, {
      headers: {
        'Cache-Control': 'private, max-age=600', // Cache for 10 minutes
      }
    });

  } catch (error: any) {
    console.error('Error fetching scan history:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch scan history',
        message: error.message
      },
      { status: 500 }
    );
  }
}
