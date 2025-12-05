import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { DATING_STYLES } from '@/lib/quiz/dating-styles';

/**
 * Quiz Result API - Wereldklasse Edition
 * Returns full dating style analysis with scores and personality data
 */

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch result from database
    const result = await sql`
      SELECT dating_style, email, completed_at
      FROM quiz_results
      WHERE id = ${id}
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Result not found' },
        { status: 404 }
      );
    }

    const datingStyleKey = result.rows[0].dating_style;
    const datingStyle = DATING_STYLES[datingStyleKey as keyof typeof DATING_STYLES];

    if (!datingStyle) {
      return NextResponse.json(
        { error: 'Invalid dating style' },
        { status: 500 }
      );
    }

    // Return full dating style object with all properties
    return NextResponse.json({
      datingStyle
    });

  } catch (error: any) {
    console.error('Error fetching quiz result:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
