import { NextRequest, NextResponse } from 'next/server';
import FeedbackManager from '@/lib/feedback/feedback-manager';

// POST: Submit user feedback
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      type,
      rating,
      title,
      description,
      category,
      page,
      userAgent,
      metadata
    } = body;

    if (!userId || !type || !title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const result = await FeedbackManager.submitFeedback({
      userId,
      type,
      rating,
      title,
      description,
      category,
      page,
      userAgent,
      metadata
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Feedback submitted successfully',
        feedbackId: result.feedbackId
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to submit feedback' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in feedback API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET: Get user's feedback history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    const feedback = await FeedbackManager.getUserFeedback(parseInt(userId), limit);

    return NextResponse.json({
      success: true,
      feedback
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}