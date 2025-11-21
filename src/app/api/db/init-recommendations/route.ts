import { NextResponse } from 'next/server';
import { initializeUserBehaviorTable } from '@/lib/recommendation-engine';

export async function POST() {
  try {
    await initializeUserBehaviorTable();

    return NextResponse.json({
      success: true,
      message: 'Recommendation engine database table initialized successfully!',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to initialize recommendation engine database table',
        details: error.message,
      },
      { status: 500 }
    );
  }
}