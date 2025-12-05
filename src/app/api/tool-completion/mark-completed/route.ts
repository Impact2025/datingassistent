import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { toolName, actionName, metadata } = body;

    // For now, just acknowledge the completion
    // The hook will fall back to localStorage for actual tracking
    return NextResponse.json({
      success: true,
      wasNew: true,
      progress: {
        actionsCompleted: [actionName],
        progressPercentage: 10
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to mark completed' },
      { status: 500 }
    );
  }
}
