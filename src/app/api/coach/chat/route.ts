import { NextRequest, NextResponse } from 'next/server';
import { getOpenRouterClient, OPENROUTER_MODELS } from '@/lib/openrouter';
import { buildCoachContext, contextToPrompt } from '@/lib/coach/context';
import { detectTools } from '@/lib/coach/routing';

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
    const systemPrompt = `Je bent Iris, een empathische en professionele AI dating coach.

${userContext ? `\n=== GEBRUIKER CONTEXT ===\n${userContext}\n` : ''}

=== JOUW ROL ===
- Je bent warm, professioneel en motiverend
- Je geeft concrete, actionable dating advies
- Je bent direct maar respectvol
- Je gebruikt Nederlandse taal op een natuurlijke manier
- Je verwijst naar relevante tools wanneer passend

=== GEDRAGSREGELS ===
1. Ken de user: gebruik hun naam, hechtingsstijl, dating stijl waar relevant
2. Personaliseer: match advies aan hun journey fase en goals
3. Wees specifiek: geen algemene adviezen, maar concrete acties
4. Tool suggesties: als user vraagt over foto's, bio, gesprekken → verwijs subtiel naar tools
5. Empathie eerst: erken gevoelens voordat je advies geeft
6. Motiveer: eindig met bemoedigende woorden of concrete volgende stap

=== CONVERSATIE STIJL ===
- Kort en krachtig (max 3-4 zinnen per response)
- Gebruik emoji's spaarzaam (max 1-2 per bericht)
- Stel verdiepende vragen
- Focus op wat werkt, niet alleen wat mis gaat
- Vier kleine successen

Beantwoord de gebruiker op een persoonlijke, coachende manier.`;

    // Build conversation history for AI
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: (msg.type === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: msg.content
      })),
      { role: 'user' as const, content: message }
    ];

    // 4. Call AI with timeout and error handling
    let aiResponse: string;

    try {
      const client = getOpenRouterClient();

      // Add timeout protection
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('AI request timeout')), 30000); // 30 second timeout
      });

      const aiPromise = client.createChatCompletion(
        OPENROUTER_MODELS.CLAUDE_35_SONNET,
        messages,
        {
          temperature: 0.7,
          max_tokens: 500
        }
      );

      aiResponse = await Promise.race([aiPromise, timeoutPromise]);

    } catch (aiError: any) {
      console.error('AI API error:', aiError);

      // Provide fallback response based on error type
      if (aiError.message?.includes('timeout')) {
        aiResponse = "Sorry, mijn antwoord duurde te lang. Kun je je vraag opnieuw stellen? 🙏";
      } else if (aiError.message?.includes('rate limit')) {
        aiResponse = "Ik heb momenteel veel berichten te verwerken. Probeer het over een minuutje opnieuw. 😊";
      } else if (aiError.message?.includes('insufficient_quota') || aiError.message?.includes('quota')) {
        aiResponse = "Er is momenteel een technisch probleem. Ons team is op de hoogte. Probeer het later opnieuw. 🔧";
      } else {
        // Generic fallback
        aiResponse = "Hmm, ik heb even een momentje nodig. Kun je je vraag opnieuw stellen? 💭";
      }

      // Log the error for monitoring
      console.error(`AI fallback triggered for user ${userId}: ${aiError.message}`);
    }

    // 5. Log conversation for learning and monitoring
    try {
      console.log(`💬 Coach chat | User ${userId} | Message length: ${message.length} | Context: ${contextEnriched ? 'enriched' : 'basic'}`);
    } catch (logError) {
      // Silent fail on logging
    }

    return NextResponse.json({
      response: aiResponse,
      toolSuggestions: toolSuggestions.length > 0 ? toolSuggestions : undefined,
      context: contextEnriched ? 'enriched' : 'basic',
      metadata: {
        contextEnriched,
        toolSuggestionsCount: toolSuggestions.length
      }
    });

  } catch (error: any) {
    console.error('Critical error in coach chat:', error);

    // Return user-friendly error message
    return NextResponse.json({
      error: 'server_error',
      message: 'Er ging iets mis bij het verwerken van je bericht. Probeer het opnieuw.'
    }, { status: 500 });
  }
}
