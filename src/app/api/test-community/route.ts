import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getUserProfileExtended } from '@/lib/community-db';

export async function GET() {
  try {
    // First check if there are any users
    const usersResult = await sql`SELECT id, name, email FROM users LIMIT 5`;
    console.log('Users in database:', usersResult.rows);
    
    if (usersResult.rows.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No users found in database',
        users: []
      });
    }
    
    // Try to get profile for the first user
    const firstUserId = usersResult.rows[0].id;
    console.log('Testing profile for user ID:', firstUserId);
    
    const profile = await getUserProfileExtended(firstUserId);
    console.log('Profile result:', profile);
    
    return NextResponse.json({
      success: true,
      users: usersResult.rows,
      profile: profile
    });
  } catch (error) {
    console.error('Test profile error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Test profile failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}