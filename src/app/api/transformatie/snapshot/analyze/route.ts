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
          // Send a fallback complete event instead of error
          // The streamSnapshotAnalysis should already handle errors gracefully,
          // but if something goes wrong here, we still want to complete
          const fallbackComplete = {
            type: 'complete',
            data: {
              id: `fallback_${userId}_${Date.now()}`,
              userId,
              generatedAt: new Date(),
              model: 'fallback',
              energyProfileAnalysis: {
                profile: scores.energyProfile,
                score: scores.introvertScore,
                nuancedInterpretation: `Met een introvert score van ${scores.introvertScore}% ben je ${scores.energyProfile === 'introvert' ? 'iemand die energie haalt uit rustige momenten' : scores.energyProfile === 'extrovert' ? 'iemand die energie krijgt van sociale interactie' : 'flexibel in hoe je energie opdoet'}.`,
                datingImplications: ['Je energie niveau bepaalt hoeveel dates je kunt plannen'],
                strengthsInDating: ['Je kent jezelf goed'],
                watchOuts: ['Let op je energieniveau'],
              },
              attachmentStyleAnalysis: {
                style: scores.attachmentStyle,
                confidence: scores.attachmentConfidence,
                interpretation: 'Je hechtingsstijl geeft inzicht in hoe je relaties aangaat.',
                triggerPatterns: ['Onzekerheid in nieuwe situaties'],
                relationshipPatterns: ['Je zoekt verbinding'],
                growthAreas: ['Bewustwording van je patronen'],
                isProvisional: true,
              },
              painPointAnalysis: {
                primary: scores.primaryPainPoint,
                rootCauseAnalysis: 'Dit is een veelvoorkomende uitdaging waar veel mensen mee worstelen.',
                connectionToProfile: 'Je profiel helpt ons begrijpen waar de focus moet liggen.',
                immediateActionSteps: ['Start met Module 1', 'Gebruik de Iris coach', 'Reflecteer dagelijks'],
                howProgramHelps: 'Het programma is afgestemd op jouw specifieke uitdagingen.',
              },
              crossCorrelationInsights: [],
              coachingPreview: {
                personalizedGreeting: `Hoi ${answers.display_name || 'daar'}! Welkom bij je persoonlijke dating transformatie.`,
                whatIrisNoticed: ['Je bent gemotiveerd om te groeien', 'Je kent je uitdagingen'],
                focusAreasForProgram: ['Zelfvertrouwen opbouwen', 'Gesprekstechnieken', 'Energie management'],
                expectedBreakthroughs: ['Meer zelfvertrouwen', 'Betere gesprekken'],
                firstWeekFocus: 'We beginnen met de basis: wie ben jij en wat zoek je?',
              },
              confidenceScore: 50,
              processingTimeMs: 0,
              cached: false,
            },
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(fallbackComplete)}\n\n`));
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
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
    // Even on fatal errors, try to return a valid streaming response
    // so the frontend doesn't get stuck
    const encoder = new TextEncoder();
    const errorStream = new ReadableStream({
      start(controller) {
        // Send minimal fallback analysis
        const fallback = {
          type: 'complete',
          data: {
            id: `error_fallback_${Date.now()}`,
            model: 'fallback',
            energyProfileAnalysis: { profile: 'ambivert', score: 50, nuancedInterpretation: '', datingImplications: [], strengthsInDating: [], watchOuts: [] },
            attachmentStyleAnalysis: { style: 'secure', confidence: 50, interpretation: '', triggerPatterns: [], relationshipPatterns: [], growthAreas: [], isProvisional: true },
            painPointAnalysis: { primary: 'conversations_die', rootCauseAnalysis: '', connectionToProfile: '', immediateActionSteps: [], howProgramHelps: '' },
            crossCorrelationInsights: [],
            coachingPreview: { personalizedGreeting: 'Welkom!', whatIrisNoticed: [], focusAreasForProgram: [], expectedBreakthroughs: [], firstWeekFocus: '' },
            confidenceScore: 0,
            processingTimeMs: 0,
            cached: false,
          },
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(fallback)}\n\n`));
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    });

    return new Response(errorStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
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
