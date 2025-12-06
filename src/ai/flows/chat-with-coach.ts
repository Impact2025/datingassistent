'use server';

/**
 * @fileOverview A flow for having a conversation with the AI dating coach.
 *
 * - chatWithCoach - A function that takes the conversation history and a new message, and returns the AI's response.
 * - ChatWithCoachInput - The input type for the chatWithCoach function.
 * - ChatWithCoachOutput - The return type for the chatWithCoach function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { chatCompletion } from '@/lib/ai-service'; // Import the chatCompletion function from our AI service

// Define the schema for a single message
const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string()
});

const ChatWithCoachInputSchema = z.object({
  // History is an array of chat messages
  history: z.array(ChatMessageSchema).describe('The conversation history.'),
  message: z.string().describe('The latest message from the user.'),
});
export type ChatWithCoachInput = z.infer<typeof ChatWithCoachInputSchema>;

const ChatWithCoachOutputSchema = z.object({
  response: z.string().describe("The AI coach's response."),
});
export type ChatWithCoachOutput = z.infer<typeof ChatWithCoachOutputSchema>;

export async function chatWithCoach(input: ChatWithCoachInput): Promise<ChatWithCoachOutput> {
  return chatWithCoachFlow(input);
}

// Define the prompt that takes the history and new message
const _chatPrompt = ai.definePrompt({
  name: 'chatWithCoachPrompt',
  input: {schema: ChatWithCoachInputSchema},
  output: {schema: ChatWithCoachOutputSchema},
  // The prompt now includes a Handlebars template to iterate through history
  prompt: `You are a friendly, empathetic, and expert dating coach from the Netherlands called DatingAssistent. Your goal is to help users navigate the world of online dating with confidence.
Answer the user's questions and provide constructive, actionable advice. Keep the conversation natural and supportive. All responses must be in Dutch.

Conversation History:
{{#each history}}
{{this.role}}: {{this.content}}
{{/each}}

New message from user:
{{{message}}}

Your response:
`,
});

const chatWithCoachFlow = ai.defineFlow(
  {
    name: 'chatWithCoachFlow',
    inputSchema: ChatWithCoachInputSchema,
    outputSchema: ChatWithCoachOutputSchema,
  },
  async input => {
    // Use our AI service's chatCompletion function which is properly configured for OpenRouter
    const messages: Array<{ role: 'user' | 'system' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: 'You are a friendly, empathetic, and expert dating coach from the Netherlands called DatingAssistent. Your goal is to help users navigate the world of online dating with confidence. Answer the user\'s questions and provide constructive, actionable advice. Keep the conversation natural and supportive. All responses must be in Dutch.'
      }
    ];
    
    // Map history messages
    input.history.forEach(msg => {
      messages.push({
        role: msg.role === 'model' ? 'assistant' : 'user',
        content: msg.content
      });
    });
    
    // Add the new user message
    messages.push({
      role: 'user',
      content: input.message
    });
    
    const response = await chatCompletion(messages, {
      provider: 'openrouter',
      maxTokens: 1000,
      temperature: 0.7
    });
    
    return {
      response: response,
    };
  }
);