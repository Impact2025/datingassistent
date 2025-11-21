import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { verifyToken } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    // Authenticate user
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Ensure data_requests table exists
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS data_requests (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          request_type TEXT NOT NULL CHECK (request_type IN ('export', 'delete', 'modify')),
          status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
          requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          completed_at TIMESTAMP WITH TIME ZONE,
          data JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;
    } catch (tableError) {
      console.error('Error ensuring data_requests table:', tableError);
    }

    const { name, age, location } = await request.json();

    // Validate input
    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
      return NextResponse.json(
        { error: 'Name must be a non-empty string' },
        { status: 400 }
      );
    }

    if (age !== undefined && (typeof age !== 'number' || age < 18 || age > 120)) {
      return NextResponse.json(
        { error: 'Age must be a number between 18 and 120' },
        { status: 400 }
      );
    }

    if (location !== undefined && (typeof location !== 'string' || location.trim().length === 0)) {
      return NextResponse.json(
        { error: 'Location must be a non-empty string' },
        { status: 400 }
      );
    }

    console.log(`✏️ Data modification requested for user ${user.id}`);

    // Get current profile
    const currentProfileResult = await sql`
      SELECT profile FROM users WHERE id = ${user.id}
    `;

    if (currentProfileResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const currentProfile = currentProfileResult.rows[0].profile || {};

    // Update profile with new data
    const updatedProfile = {
      ...currentProfile,
      ...(name !== undefined && { name: name.trim() }),
      ...(age !== undefined && { age }),
      ...(location !== undefined && { location: location.trim() })
    };

    // Update user profile
    await sql`
      UPDATE users
      SET profile = ${JSON.stringify(updatedProfile)}, updated_at = NOW()
      WHERE id = ${user.id}
    `;

    // Log the modification request
    const changes = [];
    if (name !== undefined && name !== currentProfile.name) changes.push('name');
    if (age !== undefined && age !== currentProfile.age) changes.push('age');
    if (location !== undefined && location !== currentProfile.location) changes.push('location');

    if (changes.length > 0) {
      await sql`
        INSERT INTO data_requests (user_id, request_type, status, data)
        VALUES (${user.id}, 'modify', 'completed', ${JSON.stringify({
          changes,
          oldValues: {
            name: currentProfile.name,
            age: currentProfile.age,
            location: currentProfile.location
          },
          newValues: {
            name: name !== undefined ? name : currentProfile.name,
            age: age !== undefined ? age : currentProfile.age,
            location: location !== undefined ? location : currentProfile.location
          }
        })})
      `;
    }

    console.log(`✅ Data modification completed for user ${user.id}, changes: ${changes.join(', ')}`);

    return NextResponse.json({
      message: 'Profile updated successfully',
      changes
    });

  } catch (error: any) {
    console.error('❌ Data modification error:', error);
    return NextResponse.json(
      {
        error: 'Data modification failed',
        message: error.message
      },
      { status: 500 }
    );
  }
}