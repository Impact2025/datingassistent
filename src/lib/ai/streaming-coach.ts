/**
 * Streaming AI Coach
 * Sprint 6.1: Real-time streaming AI responses for live coaching
 *
 * Features:
 * - Streaming chat responses (OpenAI/Anthropic)
 * - Conversation context management
 * - Personality-aware coaching
 * - Multi-turn conversations
 * - Token usage tracking
 */

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
});

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface CoachingContext {
  userId: number;
  userProfile?: {
    name?: string;
    age?: number;
    goals?: string[];
    relationship_status?: string;
    challenges?: string[];
  };
  conversationHistory: ChatMessage[];
  coachPersonality: 'empathetic' | 'direct' | 'analytical' | 'motivational';
}

/**
 * Get coaching system prompt based on personality
 */
function getCoachSystemPrompt(
  personality: string,
  userProfile?: CoachingContext['userProfile']
): string {
  const basePrompt = `Je bent een professionele dating en relatie coach die gebruikers helpt met hun dating journey.
Je hebt toegang tot hun profiel en geschiedenis.`;

  const personalityPrompts = {
    empathetic: `${basePrompt}
Je bent warm, begripvol en empathisch. Je luistert actief en valideert gevoelens voor je advies geeft.
Je gebruikt veel emotionele intelligentie en maakt mensen zich veilig voelen.`,

    direct: `${basePrompt}
Je bent direct, eerlijk en to-the-point. Je geeft concrete, actionable advice zonder omwegen.
Je bent niet bang om moeilijke waarheden te vertellen als dat nodig is.`,

    analytical: `${basePrompt}
Je bent analytisch en data-driven. Je breekt problemen op in concrete stappen en gebruikt frameworks.
Je helpt mensen logisch nadenken over hun situaties.`,

    motivational: `${basePrompt}
Je bent energiek, motiverend en inspirerend. Je helpt mensen hun doelen te visualiseren en motiveert ze tot actie.
Je gebruikt positieve framing en celebrates kleine wins.`
  };

  let prompt = personalityPrompts[personality as keyof typeof personalityPrompts] || personalityPrompts.empathetic;

  // Add user context if available
  if (userProfile) {
    prompt += `\n\nContext over de gebruiker:`;
    if (userProfile.name) prompt += `\n- Naam: ${userProfile.name}`;
    if (userProfile.age) prompt += `\n- Leeftijd: ${userProfile.age}`;
    if (userProfile.relationship_status) prompt += `\n- Status: ${userProfile.relationship_status}`;
    if (userProfile.goals && userProfile.goals.length > 0) {
      prompt += `\n- Doelen: ${userProfile.goals.join(', ')}`;
    }
    if (userProfile.challenges && userProfile.challenges.length > 0) {
      prompt += `\n- Uitdagingen: ${userProfile.challenges.join(', ')}`;
    }
  }

  prompt += `\n\nBelangrijk:
- Geef concrete, actionable advice
- Stel relevante vervolgvragen
- Wees cultureel sensitief (Nederlandse context)
- Gebruik emoji's spaarzaam maar effectief
- Houd berichten conversational en niet te lang (max 200 woorden)`;

  return prompt;
}

/**
 * Stream coaching response
 * Returns an async generator that yields message chunks
 */
export async function* streamCoachingResponse(
  context: CoachingContext,
  userMessage: string
): AsyncGenerator<string, void, unknown> {
  try {
    // Prepare messages for API
    const messages: { role: 'user' | 'assistant'; content: string }[] = [
      ...context.conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user' as const,
        content: userMessage
      }
    ];

    // Get system prompt
    const systemPrompt = getCoachSystemPrompt(context.coachPersonality, context.userProfile);

    // Stream from Anthropic
    const stream = await anthropic.messages.stream({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages
    });

    // Yield each content block as it arrives
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        yield chunk.delta.text;
      }
    }

  } catch (error) {
    console.error('Error streaming coaching response:', error);
    yield 'Sorry, er ging iets mis. Probeer het opnieuw.';
  }
}

/**
 * Get non-streaming response (fallback)
 */
export async function getCoachingResponse(
  context: CoachingContext,
  userMessage: string
): Promise<string> {
  try {
    const messages: { role: 'user' | 'assistant'; content: string }[] = [
      ...context.conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user' as const,
        content: userMessage
      }
    ];

    const systemPrompt = getCoachSystemPrompt(context.coachPersonality, context.userProfile);

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages
    });

    const textContent = response.content.find(block => block.type === 'text');
    return textContent && 'text' in textContent ? textContent.text : 'Sorry, geen response ontvangen.';

  } catch (error) {
    console.error('Error getting coaching response:', error);
    return 'Sorry, er ging iets mis. Probeer het opnieuw.';
  }
}

/**
 * Save conversation to database
 */
import { sql } from '@vercel/postgres';

export async function saveConversation(
  userId: number,
  conversationId: string,
  messages: ChatMessage[]
): Promise<void> {
  try {
    await sql`
      INSERT INTO coach_conversations (
        user_id,
        conversation_id,
        messages,
        updated_at
      ) VALUES (
        ${userId},
        ${conversationId},
        ${JSON.stringify(messages)},
        NOW()
      )
      ON CONFLICT (conversation_id)
      DO UPDATE SET
        messages = ${JSON.stringify(messages)},
        updated_at = NOW()
    `;
  } catch (error) {
    console.error('Error saving conversation:', error);
  }
}

/**
 * Load conversation from database
 */
export async function loadConversation(
  conversationId: string
): Promise<ChatMessage[]> {
  try {
    const result = await sql`
      SELECT messages
      FROM coach_conversations
      WHERE conversation_id = ${conversationId}
    `;

    if (result.rows.length > 0) {
      const messages = result.rows[0].messages;
      return typeof messages === 'string' ? JSON.parse(messages) : messages;
    }

    return [];
  } catch (error) {
    console.error('Error loading conversation:', error);
    return [];
  }
}

/**
 * Initialize coach conversations table
 */
export async function initCoachConversationsTable(): Promise<void> {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS coach_conversations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        conversation_id VARCHAR(255) UNIQUE NOT NULL,
        messages JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        INDEX idx_user_conversations (user_id, updated_at),
        INDEX idx_conversation_id (conversation_id)
      )
    `;
    console.log('Coach conversations table initialized');
  } catch (error) {
    console.error('Error initializing coach conversations table:', error);
  }
}
