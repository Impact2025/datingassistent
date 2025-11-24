import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { processIncomingMessage } from '@/lib/chatbot/engine';
import { findKnowledgeBaseEntry } from '@/lib/chatbot/knowledge-base';
import { getClientIdentifier, rateLimitExpensiveAI, createRateLimitHeaders } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
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
          message: `Te veel berichten. Probeer opnieuw na ${resetDate.toLocaleTimeString('nl-NL')}.`,
          resetAt: resetDate.toISOString(),
        },
        { status: 429, headers }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json({
        error: 'invalid_json',
        message: 'Request body must be valid JSON'
      }, { status: 400 });
    }

    const message: string | undefined = body.message;
    const sessionId: string | undefined = body.sessionId;
    const quickReplyId: string | undefined = body.quickReplyId;
    const locale: string | undefined = body.locale;
    const metadata: Record<string, string | undefined> | undefined = body.metadata;
    const userIdentifier: string | undefined = body.userIdentifier;

    // 🔒 SECURITY: Content filtering for inappropriate content
    if (message) {
      const lowerMessage = message.toLowerCase();

      // Block potentially harmful or inappropriate content
      const blockedKeywords = [
        'hack', 'exploit', 'ddos', 'spam', 'scam', 'phishing',
        'porn', 'sex', 'nude', 'naked', 'nsfw',
        'drugs', 'cocaine', 'heroin', 'meth',
        'violence', 'kill', 'murder', 'rape', 'abuse',
        'suicide', 'self-harm', 'cutting'
      ];

      const containsBlockedContent = blockedKeywords.some(keyword =>
        lowerMessage.includes(keyword)
      );

      if (containsBlockedContent) {
        return NextResponse.json({
          error: 'inappropriate_content',
          message: 'Dit type content is niet toegestaan. Stel een vraag over dating advies.'
        }, { status: 400 });
      }

      // Limit message length to prevent abuse
      if (message.length > 1000) {
        return NextResponse.json({
          error: 'message_too_long',
          message: 'Bericht is te lang. Houd het onder 1000 karakters.'
        }, { status: 400 });
      }

      // Simple human verification: require users to include a dating-related keyword
      // This prevents simple bots from spamming the API
      const datingKeywords = [
        'date', 'daten', 'profiel', 'chat', 'gesprek', 'relatie',
        'liefde', 'vriend', 'vriendin', 'ontmoeten', 'app', 'tinder'
      ];

      const containsDatingKeyword = datingKeywords.some(keyword =>
        lowerMessage.includes(keyword)
      );

      if (!containsDatingKeyword && message.length > 50) {
        return NextResponse.json({
          error: 'off_topic',
          message: 'Stel een vraag gerelateerd aan dating of relaties. Ik help je graag met dating advies!',
          requiresHumanVerification: true
        }, { status: 400 });
      }
    }

    // Validation with detailed error messages
    if (!sessionId || typeof sessionId !== 'string' || sessionId.trim() === '') {
      return NextResponse.json({
        error: 'session_id_required',
        message: 'Session ID is required and must be a non-empty string'
      }, { status: 400 });
    }

    if (!message && !quickReplyId) {
      return NextResponse.json({
        error: 'message_required',
        message: 'Either message or quickReplyId must be provided'
      }, { status: 400 });
    }

    if (message && typeof message !== 'string') {
      return NextResponse.json({
        error: 'invalid_message_type',
        message: 'Message must be a string'
      }, { status: 400 });
    }

    if (quickReplyId && typeof quickReplyId !== 'string') {
      return NextResponse.json({
        error: 'invalid_quick_reply_type',
        message: 'Quick reply ID must be a string'
      }, { status: 400 });
    }

    const messageId = randomUUID();

    if (quickReplyId) {
      const entry = findKnowledgeBaseEntry(quickReplyId);
      if (!entry) {
        return NextResponse.json({ error: 'quick_reply_not_found' }, { status: 404 });
      }

      const response = await processIncomingMessage({
        messageId,
        messageText: entry.question,
        context: {
          sessionId,
          channel: 'web',
          userIdentifier,
          locale,
          metadata: { ...metadata, quickReplyId },
        },
      });

      return NextResponse.json(response);
    }

    const response = await processIncomingMessage({
      messageId,
      messageText: message ?? '',
      context: {
        sessionId,
        channel: 'web',
        userIdentifier,
        locale,
        metadata,
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Chatbot API error:', error);

    // Determine error type and provide appropriate response
    let errorResponse = {
      error: 'internal_error',
      message: 'Er is een interne fout opgetreden. Probeer het later opnieuw.'
    };

    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        errorResponse = {
          error: 'rate_limit_exceeded',
          message: 'Te veel berichten. Wacht even voordat je verder gaat.'
        };
      } else if (error.message.includes('timeout')) {
        errorResponse = {
          error: 'request_timeout',
          message: 'Het verzoek duurde te lang. Probeer het opnieuw.'
        };
      } else if (error.message.includes('network')) {
        errorResponse = {
          error: 'network_error',
          message: 'Netwerkfout. Controleer je internetverbinding.'
        };
      }
    }

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
