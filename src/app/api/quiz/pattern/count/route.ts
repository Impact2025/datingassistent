import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

/**
 * Pattern Quiz Count API
 *
 * Returns the total number of completed pattern quiz submissions.
 * Used for social proof on the landing page.
 */

export async function GET() {
  try {
    const result = await sql`
      SELECT COUNT(*) as count FROM pattern_quiz_results
    `;

    const count = parseInt(result.rows[0].count, 10) || 0;

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error fetching pattern quiz count:', error);
    // Return a fallback count on error to not break the UI
    return NextResponse.json({ count: 163 });
  }
}
