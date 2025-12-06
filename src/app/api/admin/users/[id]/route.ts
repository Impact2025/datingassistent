import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAdmin } from '@/lib/auth';

/**
 * GET /api/admin/users/[id] - Get a specific user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const getUserId = id;

    const result = await sql`
      SELECT
        u.id, u.email, u.name, u.role, 'active' as status, u.created_at, u.last_login, true as email_verified,
        COALESCE(u.subscription_status, 'free') as subscription_status,
        CASE WHEN u.profile IS NOT NULL THEN true ELSE false END as profile_complete,
        u.photo_url as profile_picture_url, u.profile as bio, u.location, null as date_of_birth, null as gender, null as looking_for, null as interests
      FROM users u
      WHERE u.id = ${getUserId}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = result.rows[0];
    return NextResponse.json({
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        status: userData.status,
        createdAt: userData.created_at,
        lastLogin: userData.last_login,
        emailVerified: userData.email_verified,
        subscriptionStatus: userData.subscription_status,
        profileComplete: userData.profile_complete,
        profile: userData.profile_complete ? {
          profilePictureUrl: userData.profile_picture_url,
          bio: userData.bio,
          location: userData.location,
          dateOfBirth: userData.date_of_birth,
          gender: userData.gender,
          lookingFor: userData.looking_for,
          interests: userData.interests
        } : null
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/users/[id] - Update a user
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const putUserId = id;
    const updateData = await request.json();
    const { email: putEmail, name: putName, role: putRole } = updateData;

    if (!putEmail || !putName) {
      return NextResponse.json({ error: 'Email and name are required' }, { status: 400 });
    }

    // Check email uniqueness
    const emailCheck = await sql`SELECT id FROM users WHERE email = ${putEmail} AND id != ${putUserId}`;

    if (emailCheck.rows.length > 0) {
      return NextResponse.json({ error: 'Email is already taken by another user' }, { status: 409 });
    }

    const updateResult = await sql`
      UPDATE users SET email = ${putEmail}, name = ${putName}, role = ${putRole}, updated_at = NOW()
      WHERE id = ${putUserId} RETURNING id, email, name, role, created_at, updated_at
    `;

    if (updateResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedUser = updateResult.rows[0];
    return NextResponse.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        status: 'active',
        updatedAt: updatedUser.updated_at
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/users/[id] - Delete a user
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const delUserId = id;

    const userCheck = await sql`SELECT id, role FROM users WHERE id = ${delUserId}`;
    if (userCheck.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (userCheck.rows[0].role === 'admin') {
      return NextResponse.json({ error: 'Cannot delete admin users' }, { status: 403 });
    }

    await sql`DELETE FROM users WHERE id = ${delUserId}`;
    return NextResponse.json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}