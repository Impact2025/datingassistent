import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// Test endpoint to verify podcast table exists and works
export async function GET() {
  try {
    // Test creating a podcast entry
    const result = await sql`
      INSERT INTO podcasts (title, description, file_url, published)
      VALUES ('Test Podcast', 'This is a test podcast', '/podcasts/test.m4a', false)
      RETURNING *
    `;
    
    // Clean up - delete the test entry
    await sql`
      DELETE FROM podcasts WHERE id = ${result.rows[0].id}
    `;
    
    return NextResponse.json({ 
      success: true, 
      message: 'Podcast table is working correctly',
      testEntry: result.rows[0]
    });
  } catch (error) {
    console.error('Error testing podcast table:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to test podcast table', details: String(error) },
      { status: 500 }
    );
  }
}