import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint for kennisbank article feedback
 * Stores user feedback about article helpfulness
 */

interface FeedbackPayload {
  articleSlug: string;
  articleTitle: string;
  isHelpful: boolean;
  feedback: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const body: FeedbackPayload = await request.json();

    const { articleSlug, articleTitle, isHelpful, feedback } = body;

    // Validate required fields
    if (!articleSlug || typeof isHelpful !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Log feedback for now (in production, store in database)
    console.log('[Kennisbank Feedback]', {
      articleSlug,
      articleTitle,
      isHelpful,
      feedback,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
    });

    // TODO: Store in database when ready
    // Example Supabase integration:
    // const { error } = await supabase
    //   .from('kennisbank_feedback')
    //   .insert({
    //     article_slug: articleSlug,
    //     article_title: articleTitle,
    //     is_helpful: isHelpful,
    //     feedback_text: feedback,
    //     created_at: new Date().toISOString(),
    //   });

    return NextResponse.json({
      success: true,
      message: 'Feedback received',
    });
  } catch (error) {
    console.error('[Kennisbank Feedback Error]', error);
    return NextResponse.json(
      { error: 'Failed to process feedback' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve feedback stats (for admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const articleSlug = searchParams.get('articleSlug');

    // TODO: Implement database query
    // For now, return mock data
    return NextResponse.json({
      articleSlug,
      stats: {
        totalFeedback: 0,
        helpfulCount: 0,
        notHelpfulCount: 0,
        helpfulPercentage: 0,
      },
    });
  } catch (error) {
    console.error('[Kennisbank Feedback Stats Error]', error);
    return NextResponse.json(
      { error: 'Failed to retrieve feedback stats' },
      { status: 500 }
    );
  }
}
