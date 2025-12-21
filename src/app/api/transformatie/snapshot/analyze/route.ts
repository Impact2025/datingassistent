/**
 * API Route: Dating Snapshot AI Analysis
 *
 * POST - Generate AI-powered analysis of completed Dating Snapshot
 *
 * Features:
 * - Streaming SSE response for real-time progress
 * - Non-streaming fallback option
 * - 7-day result caching
 * - Graceful error handling with fallback
 */

import { NextRequest } from 'next/server';
import { sql } from '@vercel/postgres';
import { getCurrentUser } from '@/lib/auth';
import {
  generateSnapshotAnalysis,
  streamSnapshotAnalysis,
} from '@/lib/ai/snapshot-analysis';
import type { SnapshotAnswers, SnapshotScores } from '@/lib/ai/snapshot-analysis-types';
import type { EnergyProfile, AttachmentStyle, PainPoint } from '@/types/dating-snapshot.types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60; // Allow up to 60 seconds for AI generation

// =====================================================
// POST - Generate AI Analysis
// =====================================================

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userId = user.id;

    // Get user's completed snapshot data
    const snapshotResult = await sql`
      SELECT
        answers_json,
        introvert_score,
        energy_profile,
        attachment_style_predicted,
        attachment_confidence,
        primary_pain_point,
        secondary_pain_point,
        is_complete
      FROM user_onboarding_profiles
      WHERE user_id = ${userId}
      ORDER BY completed_at DESC NULLS LAST, created_at DESC
      LIMIT 1
    `;

    if (snapshotResult.rows.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No snapshot found', message: 'Voltooi eerst de Dating Snapshot' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const row = snapshotResult.rows[0];

    if (!row.is_complete) {
      return new Response(
        JSON.stringify({ error: 'Snapshot incomplete', message: 'De Dating Snapshot is nog niet voltooid' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse answers
    const answers: SnapshotAnswers =
      typeof row.answers_json === 'string'
        ? JSON.parse(row.answers_json)
        : row.answers_json || {};

    // Build scores object
    const scores: SnapshotScores = {
      introvertScore: row.introvert_score || 50,
      energyProfile: (row.energy_profile || 'ambivert') as EnergyProfile,
      attachmentStyle: (row.attachment_style_predicted || 'secure') as AttachmentStyle,
      attachmentConfidence: row.attachment_confidence || 70,
      primaryPainPoint: (row.primary_pain_point || 'conversations_die') as PainPoint,
      secondaryPainPoint: row.secondary_pain_point as PainPoint | undefined,
    };

    // Check for streaming preference
    let streaming = true;
    try {
      const body = await request.json();
      streaming = body.streaming !== false;
    } catch {
      // Default to streaming if no body
    }

    // Non-streaming response
    if (!streaming) {
      console.log(`🤖 Generating non-streaming AI analysis for user ${userId}`);
      const analysis = await generateSnapshotAnalysis(answers, scores, userId);
      return new Response(JSON.stringify({ success: true, analysis }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Streaming SSE response
    console.log(`🤖 Starting streaming AI analysis for user ${userId}`);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamSnapshotAnalysis(answers, scores, userId)) {
            const data = `data: ${JSON.stringify(chunk)}\n\n`;
            controller.enqueue(encoder.encode(data));

            // Log progress
            if (chunk.type === 'phase') {
              console.log(`📊 Analysis progress: ${chunk.phase} (${chunk.progress}%)`);
            }
          }

          // Send done event
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          const errorChunk = {
            type: 'error',
            message: error instanceof Error ? error.message : 'Analysis failed',
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorChunk)}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
      },
    });
  } catch (error) {
    console.error('Error in snapshot analyze:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: 'Er ging iets mis bij het analyseren',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// =====================================================
// GET - Get existing analysis (if cached)
// =====================================================

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userId = user.id;

    // Check for cached analysis
    const cacheResult = await sql`
      SELECT content_data, created_at, expires_at
      FROM ai_content_cache
      WHERE user_id = ${userId}
        AND content_type = 'snapshot_analysis'
        AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (cacheResult.rows.length === 0) {
      return new Response(
        JSON.stringify({
          found: false,
          message: 'Geen bestaande analyse gevonden'
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const row = cacheResult.rows[0];
    const analysis =
      typeof row.content_data === 'string'
        ? JSON.parse(row.content_data)
        : row.content_data;

    return new Response(
      JSON.stringify({
        found: true,
        analysis: { ...analysis, cached: true },
        cachedAt: row.created_at,
        expiresAt: row.expires_at,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error getting cached analysis:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
