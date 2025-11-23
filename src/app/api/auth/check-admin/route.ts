/**
 * CHECK ADMIN STATUS API
 * Returns admin status for the currently authenticated user
 * Created: 2025-11-23
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, isAdmin } from '@/lib/auth';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated
    const user = await verifyAuth(request);

    if (!user) {
      return NextResponse.json(
        { isAdmin: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check admin status from database
    const adminStatus = await isAdmin(user.id);

    return NextResponse.json({
      isAdmin: adminStatus,
      userId: user.id,
      email: user.email
    });
  } catch (error) {
    console.error('Admin check error:', error);
    return NextResponse.json(
      { isAdmin: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
