import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db-schema';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    logger.log('Initializing database...');
    
    const result = await initializeDatabase();
    
    if (result.success) {
      logger.log('Database initialized successfully');
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