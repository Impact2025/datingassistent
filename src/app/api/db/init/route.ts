import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db-schema';
import { initializeUserBehaviorTable } from '@/lib/recommendation-engine';

export async function POST() {
  try {
    await initializeDatabase();
    await initializeUserBehaviorTable();

    return NextResponse.json({
      success: true,
      message: 'Database schema initialized successfully!',
      details: {
        timestamp: new Date().toISOString(),
        tables: [
          'users',
          'user_profiles',
          'conversations',
          'messages',
          'photo_analyses',
          'usage_tracking',
          'subscription_history',
          'blog_posts',
          'password_reset_tokens', // Add the new table
          'user_behavior', // Add recommendation engine table
        ],
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to initialize database schema',
        details: error.message,
      },
      { status: 500 }
    );
  }
}