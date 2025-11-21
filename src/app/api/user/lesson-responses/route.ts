import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// GET - Fetch all responses for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const result = await sql`
      SELECT * FROM user_lesson_responses
      WHERE user_id = ${userId}
      ORDER BY updated_at DESC
    `;

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching responses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch responses' },
      { status: 500 }
    );
  }
}

// POST - Save or update a response
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, lessonId, responseText } = body;

    if (!userId || !lessonId) {
      return NextResponse.json(
        { error: 'userId and lessonId are required' },
        { status: 400 }
      );
    }

    // Upsert: insert or update if exists
    const result = await sql`
      INSERT INTO user_lesson_responses (user_id, lesson_id, response_text, updated_at)
      VALUES (${userId}, ${lessonId}, ${responseText || ''}, NOW())
      ON CONFLICT (user_id, lesson_id)
      DO UPDATE SET
        response_text = ${responseText || ''},
        updated_at = NOW()
      RETURNING *
    `;

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error saving response:', error);
    return NextResponse.json(
      { error: 'Failed to save response' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a response
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const lessonId = searchParams.get('lessonId');

    if (!userId || !lessonId) {
      return NextResponse.json(
        { error: 'userId and lessonId are required' },
        { status: 400 }
      );
    }

    await sql`
      DELETE FROM user_lesson_responses
      WHERE user_id = ${userId} AND lesson_id = ${lessonId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting response:', error);
    return NextResponse.json(
      { error: 'Failed to delete response' },
      { status: 500 }
    );
  }
}
