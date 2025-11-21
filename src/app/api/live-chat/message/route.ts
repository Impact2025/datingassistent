import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      conversationId,
      senderType, // 'user' or 'agent'
      senderId, // agent ID if sender is agent
      content,
      messageType = 'text',
      metadata = {}
    } = body;

    if (!conversationId || !senderType || !content) {
      return NextResponse.json({
        error: 'missing_required_fields',
        message: 'conversationId, senderType, and content are required'
      }, { status: 400 });
    }

    if (!['user', 'agent', 'system'].includes(senderType)) {
      return NextResponse.json({
        error: 'invalid_sender_type',
        message: 'senderType must be user, agent, or system'
      }, { status: 400 });
    }

    // Verify conversation exists and is active
    const conversation = await sql`
      SELECT id, status, assigned_agent_id FROM chat_conversations
      WHERE id = ${conversationId}
    `;

    if (conversation.rows.length === 0) {
      return NextResponse.json({
        error: 'conversation_not_found',
        message: 'Conversation not found'
      }, { status: 404 });
    }

    const conv = conversation.rows[0];
    if (conv.status === 'closed') {
      return NextResponse.json({
        error: 'conversation_closed',
        message: 'Cannot send messages to closed conversation'
      }, { status: 400 });
    }

    // If agent message, verify they are assigned to this conversation
    if (senderType === 'agent' && senderId) {
      if (conv.assigned_agent_id !== senderId) {
        return NextResponse.json({
          error: 'agent_not_assigned',
          message: 'Agent is not assigned to this conversation'
        }, { status: 403 });
      }
    }

    // Create message
    const messageId = randomUUID();

    const message = await sql`
      INSERT INTO chat_messages (
        conversation_id, message_id, sender_type, sender_id,
        message_type, content, metadata, created_at
      ) VALUES (
        ${conversationId}, ${messageId}, ${senderType}, ${senderId || null},
        ${messageType}, ${content}, ${JSON.stringify(metadata)}, NOW()
      )
      RETURNING id, message_id, sender_type, sender_id, message_type, content, created_at
    `;

    const newMessage = message.rows[0];

    // Update conversation last message time
    await sql`
      UPDATE chat_conversations
      SET last_message_at = NOW(), updated_at = NOW()
      WHERE id = ${conversationId}
    `;

    // If this is first agent response, update first_response_at
    if (senderType === 'agent') {
      await sql`
        UPDATE chat_conversations
        SET first_response_at = COALESCE(first_response_at, NOW())
        WHERE id = ${conversationId}
      `;
    }

    return NextResponse.json({
      message: {
        id: newMessage.id,
        messageId: newMessage.message_id,
        conversationId,
        senderType: newMessage.sender_type,
        senderId: newMessage.sender_id,
        messageType: newMessage.message_type,
        content: newMessage.content,
        createdAt: newMessage.created_at
      },
      message: 'Message sent successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({
      error: 'internal_error',
      message: 'Failed to send message'
    }, { status: 500 });
  }
}

// GET messages for a conversation
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!conversationId) {
      return NextResponse.json({
        error: 'conversation_id_required',
        message: 'conversationId parameter is required'
      }, { status: 400 });
    }

    // Get messages
    const messages = await sql`
      SELECT
        m.id, m.message_id, m.sender_type, m.sender_id, m.message_type,
        m.content, m.created_at, m.metadata,
        COALESCE(a.name, 'System') as sender_name,
        COALESCE(a.avatar_url, '') as sender_avatar
      FROM chat_messages m
      LEFT JOIN chat_agents a ON m.sender_id = a.id AND m.sender_type = 'agent'
      WHERE m.conversation_id = ${conversationId}
      ORDER BY m.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    // Get total count
    const countResult = await sql`
      SELECT COUNT(*) as total FROM chat_messages WHERE conversation_id = ${conversationId}
    `;

    const totalMessages = parseInt(countResult.rows[0].total);

    return NextResponse.json({
      messages: messages.rows.reverse(), // Return in chronological order
      pagination: {
        total: totalMessages,
        limit,
        offset,
        hasMore: offset + limit < totalMessages
      }
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({
      error: 'internal_error',
      message: 'Failed to fetch messages'
    }, { status: 500 });
  }
}