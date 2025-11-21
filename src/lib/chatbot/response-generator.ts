import { openRouter, OPENROUTER_MODELS } from '@/lib/openrouter';
import { KNOWLEDGE_BASE } from './knowledge-base';
import { detectIntent, findKnowledgeBaseMatch } from './intent-matcher';
import type { ChatbotResponse, ProcessMessageInput } from './types';

async function craftClaudeReply(input: ProcessMessageInput): Promise<string> {
  const systemPrompt = `Je bent de webchat-assistent voor DatingAssistent.nl. Je tone of voice is vriendelijk, empathisch en duidelijk (B1-niveau). Gebruik maximaal 3 korte alinea's, voeg waar relevant een bulletlijst toe en verwijs naar beschikbare knoppen (bijv. "Vraag offerte aan") als dat past. Geef links alleen wanneer ze expliciet relevant zijn.`;

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
