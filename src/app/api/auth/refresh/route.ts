import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, createToken } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the existing token
    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get userId from request body for additional validation
    const body = await request.json();
    const { userId } = body;

    if (!userId || parseInt(userId) !== user.id) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    logger.info('Token refreshed', { userId: user.id, category: 'auth' });

    // Create new token with fresh expiration
    const newToken = await createToken(user);

    return NextResponse.json({
      token: newToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName
      }
    });

  } catch (error) {
    logger.error('Token refresh error', error instanceof Error ? error : undefined);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}