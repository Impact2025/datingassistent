import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { verifyToken } from '@/lib/auth';
import type { UserProfile } from '@/lib/types';
import { getClientIdentifier, rateLimitExpensiveAI, createRateLimitHeaders } from '@/lib/rate-limit';
import { trackFeatureUsage } from '@/lib/neon-usage-tracking';
import { checkAndEnforceLimit } from '@/lib/api-helpers';
import { unifiedAIService, type ChatRequest } from '@/lib/unified-ai-service';
import { sharedContextManager } from '@/lib/shared-context-manager';

/**
 * API endpoint voor chat met AI dating coach
 * Gebruik: POST http://localhost:9001/api/chat-coach
 * 🔒 SECURITY: Authenticated + Rate limited
 */
export async function POST(request: Request) {
  try {
    // 🔒 SECURITY: Rate limiting to prevent API cost abuse
    const identifier = getClientIdentifier(request);
    const rateLimit = await rateLimitExpensiveAI(identifier);

    if (!rateLimit.success) {
      const headers = createRateLimitHeaders(rateLimit);
      const resetDate = new Date(rateLimit.resetAt);
      return NextResponse.json(
        {
          error: 'rate_limit_exceeded',
          message: `Te veel chat berichten. Probeer opnieuw na ${resetDate.toLocaleTimeString('nl-NL')}.`,
          resetAt: resetDate.toISOString(),
        },
        { status: 429, headers }
      );
    }

    // Get user from authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // 🔒 SUBSCRIPTION: Check feature limit before processing
    const limitCheck = await checkAndEnforceLimit(user.id, 'ai_message');
    if (limitCheck) {
      return limitCheck; // Return error response if limit exceeded
    }

    // Fetch user profile from database
    const profileResult = await sql`
      SELECT profile FROM users WHERE id = ${user.id}
    `;

    let userProfile: UserProfile | null = null;
    if (profileResult.rows.length > 0 && profileResult.rows[0].profile) {
      userProfile = profileResult.rows[0].profile as UserProfile;
    }

    const { history, message, aiContext } = await request.json();

    // Create unified AI service request
    const chatRequest: ChatRequest = {
      message,
      history: history.map((msg: { role: string; content: string; timestamp?: string }) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      })),
      userId: user.id.toString(),
      userProfile: userProfile || undefined,
      context: aiContext
    };

    // Track tool usage for learning
    await sharedContextManager.trackToolUsage(user.id.toString(), {
      toolId: 'chat-coach',
      timestamp: new Date(),
      action: 'chat_message',
      data: { messageLength: message.length },
      success: true
    });

    // Generate response using unified AI service
    const chatResponse = await unifiedAIService.generateChatResponse(chatRequest);

    // Track usage
    await trackFeatureUsage(user.id, 'ai_message');

    return NextResponse.json({
      response: chatResponse.message,
      coachingPhase: chatResponse.coachingPhase,
      suggestedActions: chatResponse.suggestedActions,
      psychologicalInsights: chatResponse.psychologicalInsights,
      culturalTips: chatResponse.culturalTips,
      confidence: chatResponse.confidence
    }, { status: 200 });
  } catch (error) {
    console.error('❌ Chat coach error:', error);
    return NextResponse.json(
      {
        error: 'Chat coach failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}