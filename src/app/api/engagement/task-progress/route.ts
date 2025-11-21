import { NextRequest, NextResponse } from 'next/server';
import { updateTaskProgress } from '@/lib/engagement-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, currentValue, status } = body;

    if (!taskId || currentValue === undefined) {
      return NextResponse.json(
        { error: 'Task ID and current value are required' },
        { status: 400 }
      );
    }

    await updateTaskProgress(taskId, currentValue, status);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating task progress:', error);
    return NextResponse.json(
      { error: 'Failed to update task progress' },
      { status: 500 }
    );
  }
}
