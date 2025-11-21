import { generateChatbotResponse } from './response-generator';
import { logChatbotInteraction } from './logger';
import type { ProcessMessageInput } from './types';

export async function processIncomingMessage(input: ProcessMessageInput) {
  const response = await generateChatbotResponse(input);

  await logChatbotInteraction({
    messageId: input.messageId,
    intent: response.intent,
    confidence: response.confidence,
    sessionId: input.context.sessionId,
    channel: input.context.channel,
    userIdentifier: input.context.userIdentifier,
    question: input.messageText,
    answer: response.replyText,
    metadata: input.context.metadata,
  });

  return response;
}
