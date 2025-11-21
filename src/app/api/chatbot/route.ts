import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { processIncomingMessage } from '@/lib/chatbot/engine';
import { findKnowledgeBaseEntry } from '@/lib/chatbot/knowledge-base';

export async function POST(request: NextRequest) {
  try {
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
