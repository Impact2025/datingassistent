import { NextRequest, NextResponse } from 'next/server';
import { getOpenRouterClient, OPENROUTER_MODELS } from '@/lib/openrouter';
import { buildCoachContext, contextToPrompt } from '@/lib/coach/context';
import { detectTools } from '@/lib/coach/routing';
import { logger } from '@/lib/logger';

/**
 * POST /api/coach/chat
 * Iris Coach conversatie met context-aware AI
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { message, userId, conversationHistory = [] } = body;

    // Input validation
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    if (!userId || typeof userId !== 'number') {
      return NextResponse.json(
        { error: 'User ID is required and must be a number' },
        { status: 400 }
      );
    }

    if (!Array.isArray(conversationHistory)) {
      return NextResponse.json(
        { error: 'Conversation history must be an array' },
        { status: 400 }
      );
    }

    // Message length validation
    if (message.length > 2000) {
      return NextResponse.json(
        { error: 'Message is te lang. Houd het onder 2000 karakters.' },
        { status: 400 }
      );
    }

    if (message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message cannot be empty' },
        { status: 400 }
      );
    }

    // 1. Build user context voor personalisatie
    let userContext = '';
    let contextEnriched = false;

    try {
      const context = await buildCoachContext(userId);
      userContext = contextToPrompt(context);
      contextEnriched = true;
    } catch (error) {
      console.error(`Failed to build context for user ${userId}:`, error);
      // Continue zonder context - graceful degradation
      userContext = '';
      contextEnriched = false;
    }

    // 2. Detect mogelijke tool suggesties
    let toolSuggestions: any[] = [];
    try {
      toolSuggestions = detectTools(message, 3);
    } catch (error) {
      console.error('Failed to detect tools:', error);
      // Continue zonder tool suggesties
    }

    // 3. Build AI prompt met context
    const systemPrompt = `Je bent Iris, dating coach van DatingAssistent.nl. Jij kent het profiel van deze persoon. Gebruik dat. Wees nooit generiek.
${userContext ? `\n=== GEBRUIKER CONTEXT ===\n${userContext}\n` : ''}
JOUW STEM:
Je schrijft zoals een goede vriendin die ook expert is: direct, warm, geen wollige taal. Niet "Ik begrijp dat je je zo voelt" maar "Dat klinkt uitputtend, snap ik." Je valideert concreet.

NOOIT:
- "Dat is heel normaal!" of "Goed dat je dit deelt!"
- Lijstjes van 5+ tips — liever 1 scherpe observatie
- Meer dan 1 vervolgvraag per bericht
- Advies dat ook op iemand anders van toepassing is

ALTIJD:
- Koppel advies aan wat je weet over deze persoon
- Eindig met één concrete actie — niet een lijst
- Maximaal 120 woorden tenzij analyse gevraagd wordt
- Emoji's spaarzaam (max 1 per bericht)

DENK EERST (intern): Wat heeft deze persoon nu écht nodig — validatie, spiegel, of actie?

VOORBEELD — hoe Iris klinkt:
Vraag: "Ik krijg weinig matches"
Iris: "Weinig matches betekent bijna altijd: profielfoto's of bio. Welke foto staat als eerste? Stuur hem eens door, dan kijk ik mee."`;


    // Build conversation history for AI
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: (msg.type === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: msg.content
      })),
      { role: 'user' as const, content: message }
    ];

    // 4. Stream AI response
    const client = getOpenRouterClient();
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of client.streamChatCompletion(
            OPENROUTER_MODELS.CLAUDE_35_SONNET,
            messages,
            { temperature: 0.7, max_tokens: 600, enableFallback: true }
          )) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`));
          }

          logger.log(`💬 Coach chat | User ${userId} | Context: ${contextEnriched ? 'enriched' : 'basic'}`);

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'done',
            toolSuggestions: toolSuggestions.length > 0 ? toolSuggestions : undefined,
            context: contextEnriched ? 'enriched' : 'basic',
          })}\n\n`));

        } catch (streamError: any) {
          console.error(`Coach stream error for user ${userId}:`, streamError);
          let fallback = 'Hmm, ik heb even een momentje nodig. Kun je je vraag opnieuw stellen?';
          if (streamError.message?.includes('timeout')) fallback = 'Mijn antwoord duurde te lang. Kun je je vraag opnieuw stellen?';
          if (streamError.message?.includes('rate limit')) fallback = 'Ik verwerk momenteel veel berichten. Probeer het over een minuutje opnieuw.';
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: fallback })}\n\n`));
        } finally {
          controller.close();
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

  } catch (error: any) {
    console.error('Critical error in coach chat:', error);
    return NextResponse.json({
      error: 'server_error',
      message: 'Er ging iets mis bij het verwerken van je bericht. Probeer het opnieuw.'
    }, { status: 500 });
  }
}
