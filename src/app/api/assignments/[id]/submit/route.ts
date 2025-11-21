import { NextRequest, NextResponse } from 'next/server';
import { AssignmentService } from '@/lib/course/assignment-service';
import { verifyAuth } from '@/lib/auth';

// POST /api/assignments/[id]/submit - Submit assignment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const assignmentId = parseInt(id);
    if (isNaN(assignmentId)) {
      return NextResponse.json(
        { error: 'Invalid assignment ID' },
        { status: 400 }
      );
    }

    const data = await request.json();

    const submission = await AssignmentService.submitAssignment(
      user.id,
      assignmentId,
      data
    );

    if (!submission) {
      return NextResponse.json(
        { error: 'Failed to submit assignment' },
        { status: 500 }
      );
    }

    return NextResponse.json(submission);
  } catch (error) {
    console.error('Error submitting assignment:', error);
    return NextResponse.json(
      { error: 'Failed to submit assignment' },
      { status: 500 }
    );
  }
}

// GET /api/assignments/[id]/submit - Get user's submission for assignment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const assignmentId = parseInt(id);
    if (isNaN(assignmentId)) {
      return NextResponse.json(
        { error: 'Invalid assignment ID' },
        { status: 400 }
      );
    }

    const submission = await AssignmentService.getUserSubmission(
      user.id,
      assignmentId
    );

    return NextResponse.json(submission || null);
  } catch (error) {
    console.error('Error fetching assignment submission:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submission' },
      { status: 500 }
    );
  }
}