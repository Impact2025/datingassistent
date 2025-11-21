import { NextResponse } from 'next/server';
import { requireAdmin, verifyAuth, getAuthCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    console.log('🔍 Testing auth...');

    // Test 1: Get cookie directly
    const cookie = await getAuthCookie();
    console.log('Cookie value:', cookie ? 'Found' : 'Not found');

    // Test 2: Verify auth
    const user = await verifyAuth(request);
    console.log('Verified user:', user);

    // Test 3: Require admin
    const admin = await requireAdmin(request);
    console.log('Admin user:', admin);

    return NextResponse.json({
      success: true,
      hasCookie: !!cookie,
      user: user,
      isAdmin: !!admin,
    });
  } catch (error) {
    console.error('Auth test error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 401 });
  }
}
