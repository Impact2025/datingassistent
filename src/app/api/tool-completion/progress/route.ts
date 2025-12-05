import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const toolName = request.nextUrl.searchParams.get('toolName');

  // Return empty progress - localStorage fallback will be used
  return NextResponse.json({
    completedActions: 0,
    actionsCompleted: [],
    progressPercentage: 0,
    firstCompletion: null,
    lastCompletion: null,
    overall: {
      toolsUsed: 0,
      totalCompletions: 0,
      overallProgress: 0
    }
  });
}
