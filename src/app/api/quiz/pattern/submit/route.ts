import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { calculatePatternScore } from '@/lib/quiz/pattern/pattern-scoring';
import { getPatternResult } from '@/lib/quiz/pattern/pattern-results';
import type {
  PatternQuizSubmitRequest,
  PatternQuizSubmitResponse,
} from '@/lib/quiz/pattern/pattern-types';

/**
 * Pattern Quiz Submission API
 *
 * Calculates attachment pattern from quiz answers and saves to database.
 * Returns pattern result for immediate display.
 */

export async function POST(request: Request) {
  try {
    const body: PatternQuizSubmitRequest = await request.json();
    const {
      answers,
      email,
      firstName,
      acceptsMarketing,
      utmSource,
      utmMedium,
      utmCampaign,
    } = body;

    // Validate required fields
    if (!answers || Object.keys(answers).length < 10) {
      return NextResponse.json(
        { error: 'Incomplete quiz answers' },
        { status: 400 }
      );
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    if (!firstName || firstName.trim().length === 0) {
      return NextResponse.json(
        { error: 'First name is required' },
        { status: 400 }
      );
    }

    // Calculate attachment pattern
    const scoringResult = calculatePatternScore(answers);

    // Validate pattern result
    const patternConfig = getPatternResult(scoringResult.attachmentPattern);
    if (!patternConfig) {
      console.error(
        'Invalid pattern calculated:',
        scoringResult.attachmentPattern
      );
      return NextResponse.json(
        { error: 'Invalid pattern calculated' },
        { status: 500 }
      );
    }

    // Save to database
    const completedAt = new Date().toISOString();

    const result = await sql`
      INSERT INTO pattern_quiz_results (
        email,
        first_name,
        answers,
        anxiety_score,
        avoidance_score,
        attachment_pattern,
        pattern_confidence,
        accepts_marketing,
        utm_source,
        utm_medium,
        utm_campaign,
        completed_at
      ) VALUES (
        ${email},
        ${firstName.trim()},
        ${JSON.stringify(answers)},
        ${scoringResult.anxietyScore},
        ${scoringResult.avoidanceScore},
        ${scoringResult.attachmentPattern},
        ${scoringResult.confidence},
        ${acceptsMarketing ?? false},
        ${utmSource ?? null},
        ${utmMedium ?? null},
        ${utmCampaign ?? null},
        ${completedAt}
      )
      RETURNING id
    `;

    const resultId = result.rows[0].id;

    // TODO: Queue follow-up email
    // await queuePatternQuizEmail(email, firstName, scoringResult.attachmentPattern, resultId);

    const response: PatternQuizSubmitResponse = {
      success: true,
      resultId: resultId.toString(),
      attachmentPattern: scoringResult.attachmentPattern,
      anxietyScore: scoringResult.anxietyScore,
      avoidanceScore: scoringResult.avoidanceScore,
      confidence: scoringResult.confidence,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('Error submitting pattern quiz:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Internal server error', details: message },
      { status: 500 }
    );
  }
}
