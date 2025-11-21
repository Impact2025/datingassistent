import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const result = await sql`SELECT version()`;
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      version: result.rows[0],
      envVars: {
        POSTGRES_URL: process.env.POSTGRES_URL ? 'SET' : 'NOT SET',
        POSTGRES_URL_LENGTH: process.env.POSTGRES_URL ? process.env.POSTGRES_URL.length : 0,
      }
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        envVars: {
          POSTGRES_URL: process.env.POSTGRES_URL ? 'SET' : 'NOT SET',
        }
      },
      { status: 500 }
    );
  }
}