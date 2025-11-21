import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db-schema';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    console.log('Initializing database...');
    
    const result = await initializeDatabase();
    
    if (result.success) {
      console.log('Database initialized successfully');
      return NextResponse.json({
        success: true,
        message: 'Database initialized successfully'
      });
    } else {
      console.error('Database initialization failed');
      return NextResponse.json({
        success: false,
        message: 'Database initialization failed'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json({
      success: false,
      message: 'Database initialization failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}