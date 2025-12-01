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
    const body = await request.json();
    const { message, userId, conversationHistory = [] } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // 1. Build user context voor personalisatie
    let userContext = '';
    if (userId) {
      try {
        const context = await buildCoachContext(userId);
        userContext = contextToPrompt(context);
      } catch (error) {
        console.error('Failed to build context:', error);
        // Continue zonder context
      }
    }

    // 2. Detect mogelijke tool suggesties
    const toolSuggestions = detectTools(message, 3);

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
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // 4. Call AI
    const client = getOpenRouterClient();
    const response = await client.createChatCompletion(
      OPENROUTER_MODELS.CLAUDE_35_SONNET,
      messages,
      {
        temperature: 0.7,
        max_tokens: 500
      }
    );

    // 5. Log conversation for learning
    if (userId) {
      try {
        // TODO: Store conversation in database for future context
        console.log(`💬 Coach chat with user ${userId}: "${message}"`);
      } catch (error) {
        console.error('Failed to log conversation:', error);
      }
    }

    return NextResponse.json({
      response,
      toolSuggestions: toolSuggestions.length > 0 ? toolSuggestions : undefined,
      context: userContext ? 'enriched' : 'basic'
    });

  } catch (error: any) {
    console.error('Error in coach chat:', error);
    return NextResponse.json({
      error: 'Chat failed',
      message: error.message
    }, { status: 500 });
  }
}
