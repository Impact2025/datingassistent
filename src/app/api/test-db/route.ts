import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    // Test database connection
    const result = await sql`SELECT NOW() as current_time`;
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      currentTime: result.rows[0].current_time
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}