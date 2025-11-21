import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    // Test database connection
    const result = await sql`SELECT 1 as test`;
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      result: result.rows
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { success: false, error: 'Database connection failed', details: String(error) },
      { status: 500 }
    );
  }
}