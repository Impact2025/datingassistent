import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { calculateDatingStyle, DATING_STYLES } from '@/lib/quiz/dating-styles';

/**
 * Quiz Submission API - Wereldklasse Edition
 * Saves quiz results and returns enhanced analysis with 5 dating styles
 */

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { answers, email, acceptsMarketing, timestamp } = body;

    // Validate
    if (!answers || !email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid data' },
        { status: 400 }
      );
    }

    // Analyze dating style using enhanced algorithm
    const styleKey = calculateDatingStyle(answers);
    const datingStyle = DATING_STYLES[styleKey];

    if (!datingStyle) {
      return NextResponse.json(
        { error: 'Invalid dating style calculated' },
        { status: 500 }
      );
    }

    // Save to database
    const result = await sql`
      INSERT INTO quiz_results (
        email,
        answers,
        dating_style,
        accepts_marketing,
        completed_at
      ) VALUES (
        ${email},
        ${JSON.stringify(answers)},
        ${styleKey},
        ${acceptsMarketing},
        ${timestamp}
      )
      RETURNING id
    `;

    const resultId = result.rows[0].id;

    // TODO: Send email with results via email service
    // await sendQuizResultEmail(email, datingStyle, resultId);

    return NextResponse.json({
      success: true,
      resultId,
      datingStyle
    });

  } catch (error: any) {
    console.error('Error submitting quiz:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
