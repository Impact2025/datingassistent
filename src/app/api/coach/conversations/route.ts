import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { saveConversation, loadConversation } from '@/lib/ai/streaming-coach';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

type ConversationMessage = { role: 'user' | 'model'; content: string };

function deriveTitle(messages: ConversationMessage[]): string {
  const firstUser = messages.find(m => m.role === 'user');
  if (!firstUser) return 'Nieuwe chat';
  return firstUser.content.length > 50
    ? firstUser.content.slice(0, 50) + '...'
    : firstUser.content;
}

// GET /api/coach/conversations — list up to 20 conversations for the current user
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const result = await sql`
      SELECT conversation_id, messages, created_at, updated_at
      FROM coach_conversations
      WHERE user_id = ${user.id}
      ORDER BY updated_at DESC
      LIMIT 20
    `;

    const conversations = result.rows.map(row => {
      const messages: ConversationMessage[] =
        typeof row.messages === 'string' ? JSON.parse(row.messages) : row.messages ?? [];
      return {
        id: row.conversation_id,
        title: deriveTitle(messages),
        messages,
        timestamp: row.updated_at ?? row.created_at,
      };
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('GET /api/coach/conversations error:', error);
    return NextResponse.json({ error: 'Failed to load conversations' }, { status: 500 });
  }
}

// POST /api/coach/conversations — upsert a conversation
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { conversationId, messages } = body as {
      conversationId: string;
      messages: ConversationMessage[];
    };

    if (!conversationId || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'conversationId and messages required' }, { status: 400 });
    }

    await saveConversation(user.id, conversationId, messages as any);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/coach/conversations error:', error);
    return NextResponse.json({ error: 'Failed to save conversation' }, { status: 500 });
  }
}

// DELETE /api/coach/conversations — delete a conversation by id
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('id');

    if (!conversationId) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    await sql`
      DELETE FROM coach_conversations
      WHERE conversation_id = ${conversationId}
      AND user_id = ${user.id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/coach/conversations error:', error);
    return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 });
  }
}
