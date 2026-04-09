import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getUserProfileExtended } from '@/lib/community-db';

export async function GET() {
  try {
    // First check if there are any users
    const usersResult = await sql`SELECT id, name, email FROM users LIMIT 5`;
    logger.log('Users in database:', usersResult.rows);
    
    if (usersResult.rows.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No users found in database',
        users: []
      });
    }
    
    // Try to get profile for the first user
    const firstUserId = usersResult.rows[0].id;
    logger.log('Testing profile for user ID:', firstUserId);
    
    const profile = await getUserProfileExtended(firstUserId);
    logger.log('Profile result:', profile);
    
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