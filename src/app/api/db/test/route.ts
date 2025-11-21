import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/db';

export async function GET() {
  try {
    const isConnected = await testConnection();

    if (isConnected) {
      return NextResponse.json({
        success: true,
        message: 'Database connection successful!',
        details: {
          timestamp: new Date().toISOString(),
          database: 'neondb',
          host: process.env.POSTGRES_HOST,
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'Database connection failed',
          details: 'Unable to connect to the database',
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'Error testing database connection',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
