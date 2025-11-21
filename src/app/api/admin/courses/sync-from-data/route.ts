import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { syncCoursesFromStaticData } from '@/lib/course-sync';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // 🔒 SECURITY: Verify user is admin
    await requireAdmin(request);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized: Please login' }, { status: 401 });
      }
      if (error.message.includes('Forbidden')) {
        return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
      }
    }
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }

  try {
    console.log('🔄 Starting course synchronization...');
    await syncCoursesFromStaticData();
    console.log('✅ Course synchronization completed successfully');
    return NextResponse.json({ success: true, message: 'Courses synchronized successfully' });
  } catch (error) {
    console.error('❌ Failed to sync courses:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      error: 'Failed to sync courses',
      details: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
