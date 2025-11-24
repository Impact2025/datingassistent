import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // For now, we'll store coaching sessions in a simple JSON format in user_responses
    // In a production app, you'd want a dedicated coaching_sessions table
    const result = await sql`
      SELECT
        id,
        response_text,
        created_at
      FROM user_lesson_responses
      WHERE user_id = ${userId}
        AND lesson_id = -999  -- Special ID for coaching sessions
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    const sessions = result.rows.map(row => {
      try {
        const data = JSON.parse(row.response_text);
        return {
          id: row.id.toString(),
          timestamp: row.created_at,
          ...data
        };
      } catch {
        return null;
      }
    }).filter(Boolean);

    return NextResponse.json({ sessions });

  } catch (error) {
    console.error('Error fetching coaching history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coaching history' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, userInput, aiResponse, coachingType, module } = await request.json();

    if (!userId || !userInput || !aiResponse) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const sessionData = {
      userInput,
      aiResponse,
      coachingType: coachingType || 'general',
      module: module || 1,
      sentiment: 'neutral' // Could be enhanced with sentiment analysis
    };

    // Store as JSON in response_text with special lesson_id
    await sql`
      INSERT INTO user_lesson_responses (
        user_id,
        lesson_id,
        response_text
      ) VALUES (
        ${userId},
        -999,  -- Special ID for coaching sessions
        ${JSON.stringify(sessionData)}
      )
    `;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error saving coaching session:', error);
    return NextResponse.json(
      { error: 'Failed to save coaching session' },
      { status: 500 }
    );
  }
}