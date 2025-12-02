import { NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { streamCoachingResponse, saveConversation, loadConversation, type ChatMessage, type CoachingContext } from '@/lib/ai/streaming-coach';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/coach/stream
 * Stream AI coaching responses in real-time
 *
 * Body:
 * - message: string
 * - conversation_id: string
 * - personality: 'empathetic' | 'direct' | 'analytical' | 'motivational'
 */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { message, conversation_id, personality = 'empathetic', user_profile } = body;

    if (!message || !conversation_id) {
      return new Response('Missing required fields', { status: 400 });
    }

    // Load conversation history
    const conversationHistory = await loadConversation(conversation_id);

    // Build coaching context
    const context: CoachingContext = {
      userId: user.id,
      userProfile: user_profile,
      conversationHistory,
      coachPersonality: personality
    };

    // Create readable stream
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          // Stream response chunks
          for await (const chunk of streamCoachingResponse(context, message)) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`));
          }

          // Send completion signal
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));

          // Save updated conversation
          const updatedHistory: ChatMessage[] = [
            ...conversationHistory,
            { role: 'user', content: message, timestamp: new Date() }
            // Assistant message will be saved by client after full response
          ];

          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error in coach stream:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
