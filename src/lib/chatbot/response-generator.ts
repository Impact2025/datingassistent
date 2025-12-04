import { openRouter, OPENROUTER_MODELS } from '@/lib/openrouter';
import { KNOWLEDGE_BASE } from './knowledge-base';
import { detectIntent, findKnowledgeBaseMatch } from './intent-matcher';
import type { ChatbotResponse, ProcessMessageInput } from './types';

/**
 * Iris Dating Coach Personality System Prompt
 *
 * Iris is de AI dating coach van DatingAssistent. Ze combineert warmte met expertise,
 * is oprecht geinteresseerd in het helpen van mensen, en heeft een licht speelse toon.
 */
const IRIS_SYSTEM_PROMPT = `Je bent Iris, de vriendelijke AI dating coach van DatingAssistent.nl.

## Jouw Persoonlijkheid
- **Warm & empathisch**: Je begrijpt dat dating spannend maar ook kwetsbaar kan zijn
- **Deskundig**: Je hebt diepgaande kennis over online dating, profielen, en gesprekstechnieken
- **Licht speels**: Je gebruikt af en toe een emoji of grappige opmerking, maar blijft professioneel
- **Aanmoedigend**: Je gelooft in de dating-succes van elke gebruiker

## Communicatiestijl
- Spreek in informeel Nederlands (jij/je)
- Houd antwoorden kort en scanbaar (max 3 korte alinea's)
- Gebruik concrete voorbeelden wanneer nuttig
- Stel vervolgvragen om het gesprek gaande te houden
- Sluit af met een actie-suggestie of vraag

## Wat je NIET doet
- Geen medisch/psychologisch advies geven
- Geen beloftes doen over resultaten
- Geen persoonlijke gegevens vragen
- Geen externe links geven (alleen naar DatingAssistent producten)

## Context
Je helpt bezoekers met vragen over:
- Online dating tips
- Profiel verbetering
- Gesprekstarters en berichten schrijven
- De programma's van DatingAssistent (21-Dagen Kickstart, coaching)`;

async function craftClaudeReply(input: ProcessMessageInput): Promise<string> {
  const systemPrompt = IRIS_SYSTEM_PROMPT;

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    {
      role: 'user' as const,
      content: `Vraag van gebruiker: ${input.messageText}
Bekende context: intent=${input.context.intent ?? 'onbekend'}, kanaal=${input.context.channel}, sessie=${input.context.sessionId}`,
    },
  ];

  const reply = await openRouter.createChatCompletion(OPENROUTER_MODELS.CLAUDE_35_HAIKU, messages, {
    max_tokens: 250,
    temperature: 0.3,
  });

  return reply.trim();
}

export async function generateChatbotResponse(input: ProcessMessageInput): Promise<ChatbotResponse> {
  const detectedIntent = input.context.intent ?? detectIntent(input.messageText);
  const kbMatch = findKnowledgeBaseMatch(input.messageText);

  if (kbMatch) {
    return {
      replyText: kbMatch.answer,
      intent: detectedIntent,
      confidence: 0.95,
      knowledgeBaseMatch: kbMatch,
      followUpActions: kbMatch.quickReplies,
    };
  }

  const fallbackReply = await craftClaudeReply({
    ...input,
    context: { ...input.context, intent: detectedIntent },
  });

  const reply: ChatbotResponse = {
    replyText: fallbackReply,
    intent: detectedIntent,
    confidence: 0.6,
  };

  return reply;
}

export function getQuickReplyText(entryId: string): string | undefined {
  const entry = KNOWLEDGE_BASE.find((item) => item.id === entryId);
  return entry?.answer;
}
