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
 * Supports: name, email, role, status (active/suspended/blocked), subscriptionStatus, emailVerified
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const body = await request.json();
    const { name, email, role, status, subscriptionStatus, emailVerified } = body;

    // Check if user exists
    const existingUser = await sql`SELECT id, role FROM users WHERE id = ${userId}`;
    if (existingUser.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (name !== undefined && name.trim()) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name.trim());
    }

    if (email !== undefined && email.trim()) {
      // Check email uniqueness
      const emailCheck = await sql`SELECT id FROM users WHERE email = ${email.trim().toLowerCase()} AND id != ${userId}`;
      if (emailCheck.rows.length > 0) {
        return NextResponse.json({ error: 'Email is already taken by another user' }, { status: 409 });
      }
      updates.push(`email = $${paramIndex++}`);
      values.push(email.trim().toLowerCase());
    }

    if (role !== undefined) {
      const allowedRoles = ['user', 'admin', 'coach'];
      if (!allowedRoles.includes(role)) {
        return NextResponse.json({ error: 'Invalid role. Must be: user, admin, or coach' }, { status: 400 });
      }
      updates.push(`role = $${paramIndex++}`);
      values.push(role);
    }

    if (status !== undefined) {
      const allowedStatuses = ['active', 'inactive', 'suspended', 'blocked'];
      if (!allowedStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid status. Must be: active, inactive, suspended, or blocked' }, { status: 400 });
      }
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
    }

    if (subscriptionStatus !== undefined) {
      const allowedSubs = ['free', 'premium', 'vip', 'pro'];
      if (!allowedSubs.includes(subscriptionStatus)) {
        return NextResponse.json({ error: 'Invalid subscription. Must be: free, premium, vip, or pro' }, { status: 400 });
      }
      updates.push(`subscription_status = $${paramIndex++}`);
      values.push(subscriptionStatus);
    }

    if (emailVerified !== undefined) {
      updates.push(`email_verified = $${paramIndex++}`);
      values.push(Boolean(emailVerified));
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    // Add updated_at and user ID
    updates.push(`updated_at = NOW()`);
    values.push(userId);

    const updateQuery = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, email, name, role, status, subscription_status, email_verified, updated_at
    `;

    const result = await sql.query(updateQuery, values);
    const updatedUser = result.rows[0];

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        status: updatedUser.status || 'active',
        subscriptionStatus: updatedUser.subscription_status || 'free',
        emailVerified: updatedUser.email_verified,
        updatedAt: updatedUser.updated_at
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/users/[id] - Soft delete a user
 * Anonymizes email and sets status to 'deleted'
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const userCheck = await sql`SELECT id, role, email FROM users WHERE id = ${userId}`;
    if (userCheck.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (userCheck.rows[0].role === 'admin') {
      return NextResponse.json(
        { error: 'Cannot delete admin users. Remove admin role first.' },
        { status: 403 }
      );
    }

    // Soft delete: anonymize data and set status to deleted
    const anonymizedEmail = `deleted_${userId}_${Date.now()}@deleted.local`;
    await sql`
      UPDATE users
      SET
        status = 'deleted',
        email = ${anonymizedEmail},
        name = 'Verwijderde gebruiker',
        password_hash = NULL,
        profile = NULL,
        updated_at = NOW()
      WHERE id = ${userId}
    `;

    return NextResponse.json({
      success: true,
      message: 'Gebruiker is succesvol verwijderd'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}