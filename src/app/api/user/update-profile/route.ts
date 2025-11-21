import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUserAccess, extractUserId } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profile, subscription, orderId, skipAuth } = body;

    // 🔒 SECURITY: Validate and extract userId
    const userId = extractUserId(body);

    // 🔒 SECURITY: For registration flow, skip auth check if explicitly requested
    // This allows profile creation during user registration before authentication is fully set up
    let authenticatedUser = null;
    if (!skipAuth) {
      authenticatedUser = await requireUserAccess(request, userId);
    }

    if (!profile) {
      return NextResponse.json(
        { error: 'profile is required' },
        { status: 400 }
      );
    }

    // Build update query based on what's provided
    if (subscription) {
      await sql`
        UPDATE users
        SET profile = ${JSON.stringify(profile)},
            subscription = ${JSON.stringify(subscription)},
            updated_at = NOW()
        WHERE id = ${userId}
      `;

      // If there's an orderId, update the order as well
      if (orderId) {
        await sql`
          UPDATE orders
          SET user_id = ${userId},
              linked_to_user = true,
              updated_at = NOW()
          WHERE id = ${orderId}
        `;
      }
    } else {
      await sql`
        UPDATE users
        SET profile = ${JSON.stringify(profile)},
            updated_at = NOW()
        WHERE id = ${userId}
      `;
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Update profile error:', error);

    // 🔒 SECURITY: Handle authentication/authorization errors separately
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json(
          { error: 'Unauthorized: Please login' },
          { status: 401 }
        );
      }
      if (error.message.includes('Forbidden')) {
        return NextResponse.json(
          { error: 'Forbidden: You can only update your own profile' },
          { status: 403 }
        );
      }
      if (error.message.includes('Invalid userId')) {
        return NextResponse.json(
          { error: 'Invalid userId provided' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
