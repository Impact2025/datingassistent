import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const goalId = parseInt(id);
    
    if (isNaN(goalId)) {
      return NextResponse.json(
        { error: 'Invalid goal ID' },
        { status: 400 }
      );
    }
    
    // Get user ID from request body
    const body = await request.json();
    const userId = body.userId;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Get progress value from request body
    const { progress_value, completed } = body;
    
    if (progress_value === undefined && completed === undefined) {
      return NextResponse.json(
        { error: 'progress_value or completed is required' },
        { status: 400 }
      );
    }
    
    // Forward the request to the central update-progress endpoint
    const response = await fetch(`${request.nextUrl.origin}/api/goals/update-progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        goalId,
        newValue: progress_value,
        completed
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || 'Failed to update goal progress' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error updating goal progress:', error);
    return NextResponse.json(
      { error: 'Failed to update goal progress' },
      { status: 500 }
    );
  }
}