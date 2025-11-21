import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionId,
      userIdentifier,
      userName,
      userEmail,
      department = 'general',
      priority = 'normal',
      initialMessage,
      metadata = {}
    } = body;

    if (!sessionId) {
      return NextResponse.json({
        error: 'session_id_required',
        message: 'Session ID is required'
      }, { status: 400 });
    }

    // Check if conversation already exists for this session
    const existingConversation = await sql`
      SELECT id, status FROM chat_conversations
      WHERE session_id = ${sessionId} AND status IN ('active', 'waiting', 'assigned')
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (existingConversation.rows.length > 0) {
      const conv = existingConversation.rows[0];
      return NextResponse.json({
        conversation: {
          id: conv.id,
          sessionId,
          status: conv.status
        },
        message: 'Conversation already exists'
      });
    }

    // Create new conversation
    const conversationId = randomUUID();

    const conversation = await sql`
      INSERT INTO chat_conversations (
        session_id, channel, status, priority, department,
        user_identifier, user_name, user_email, metadata
      ) VALUES (
        ${sessionId}, 'web', 'waiting', ${priority}, ${department},
        ${userIdentifier || null}, ${userName || null}, ${userEmail || null},
        ${JSON.stringify(metadata)}
      )
      RETURNING id, session_id, status, priority, department, created_at
    `;

    const newConversation = conversation.rows[0];

    // If initial message provided, create it
    if (initialMessage) {
      const messageId = randomUUID();
      await sql`
        INSERT INTO chat_messages (
          conversation_id, message_id, sender_type, content, created_at
        ) VALUES (
          ${newConversation.id}, ${messageId}, 'user', ${initialMessage}, NOW()
        )
      `;
    }

    return NextResponse.json({
      conversation: {
        id: newConversation.id,
        sessionId: newConversation.session_id,
        status: newConversation.status,
        priority: newConversation.priority,
        department: newConversation.department,
        createdAt: newConversation.created_at
      },
      message: 'Conversation started successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error starting conversation:', error);
    return NextResponse.json({
      error: 'internal_error',
      message: 'Failed to start conversation'
    }, { status: 500 });
  }
}