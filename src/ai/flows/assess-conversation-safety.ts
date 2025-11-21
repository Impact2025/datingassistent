'use server';

/**
 * @fileOverview This file defines a Genkit flow for assessing the safety of a conversation.
 *
 * It takes chat logs as input and analyzes them for potential red flags, providing discreet advice to the user.
 *
 * @fileOverview
 * - `assessConversationSafety` - The main function to assess conversation safety.
 * - `AssessConversationSafetyInput` - The input type for the `assessConversationSafety` function.
 * - `AssessConversationSafetyOutput` - The output type for the `assessConversationSafety` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssessConversationSafetyInputSchema = z.object({
  conversationLog: z
    .string()
    .describe('The conversation log to analyze for potential red flags.'),
});
export type AssessConversationSafetyInput = z.infer<typeof AssessConversationSafetyInputSchema>;

const AssessConversationSafetyOutputSchema = z.object({
  analysis: z
    .string()
    .describe(
      'An analysis of the conversation log, highlighting any potential red flags and providing discreet advice.'
    ),
});
export type AssessConversationSafetyOutput = z.infer<typeof AssessConversationSafetyOutputSchema>;

export async function assessConversationSafety(input: AssessConversationSafetyInput): Promise<AssessConversationSafetyOutput> {
  return assessConversationSafetyFlow(input);
}

const assessConversationSafetyPrompt = ai.definePrompt({
  name: 'assessConversationSafetyPrompt',
  input: {schema: AssessConversationSafetyInputSchema},
  output: {schema: AssessConversationSafetyOutputSchema},
  prompt: `You are a safety expert specialized in online dating conversations. Analyze the following conversation log for potential "red flags." Red flags include asking for personal information too quickly, dwingend language, guilt-tripping, love bombing, or vague answers. Provide a discreet analysis and advice on how the user can react. If there are no red flags, provide reassuring feedback. The entire response must be in Dutch.\n\nConversation Log: {{{conversationLog}}}`,
});

const assessConversationSafetyFlow = ai.defineFlow(
  {
    name: 'assessConversationSafetyFlow',
    inputSchema: AssessConversationSafetyInputSchema,
    outputSchema: AssessConversationSafetyOutputSchema,
  },
  async input => {
    const {output} = await assessConversationSafetyPrompt(input);
    return output!;
  }
);
