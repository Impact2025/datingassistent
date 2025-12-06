'use server';

/**
 * @fileOverview A flow for analyzing a user's profile photo and providing feedback.
 *
 * - analyzeProfilePhoto - A function that analyzes the profile photo and gives the feedback.
 * - AnalyzeProfilePhotoInput - The input type for the analyzeProfilePhoto function.
 * - AnalyzeProfilePhotoOutput - The return type for the analyzeProfilePhoto function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { chatCompletion } from '@/lib/ai-service'; // Import the chatCompletion function from our AI service

const AnalyzeProfilePhotoInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A profile photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeProfilePhotoInput = z.infer<typeof AnalyzeProfilePhotoInputSchema>;

const AnalyzeProfilePhotoOutputSchema = z.object({
  advice: z.string().describe('AI analysis and advice on the profile photo.'),
});
export type AnalyzeProfilePhotoOutput = z.infer<typeof AnalyzeProfilePhotoOutputSchema>;

export async function analyzeProfilePhoto(
  input: AnalyzeProfilePhotoInput
): Promise<AnalyzeProfilePhotoOutput> {
  return analyzeProfilePhotoFlow(input);
}

const _prompt = ai.definePrompt({
  name: 'analyzeProfilePhotoPrompt',
  input: {schema: AnalyzeProfilePhotoInputSchema},
  output: {schema: AnalyzeProfilePhotoOutputSchema},
  prompt: `You are a friendly and constructive dating coach from the Netherlands.
Analyze the uploaded profile photo. Give constructive feedback and helpful tips in Dutch.
Always be positive and focus on opportunities for improvement.

Consider elements such as:
- Facial expression (smiling, approachability)
- Eye contact with the camera
- Lighting and background (is it distracting?)
- Clothing and overall appearance
- Whether the photo clearly shows the person
- Whether the photo shows an activity or hobby

Structure your feedback with a positive opening, followed by 2-3 concrete, actionable tips. End with an encouraging closing remark.
The entire response must be in Dutch.

Here is the photo:
{{media url=photoDataUri}}`,
});

const analyzeProfilePhotoFlow = ai.defineFlow(
  {
    name: 'analyzeProfilePhotoFlow',
    inputSchema: AnalyzeProfilePhotoInputSchema,
    outputSchema: AnalyzeProfilePhotoOutputSchema,
  },
  async input => {
    // Use our AI service's chatCompletion function which is properly configured for OpenRouter
    const messages = [
      {
        role: 'system' as const,
        content: 'You are a friendly and constructive dating coach from the Netherlands. Analyze the uploaded profile photo. Give constructive feedback and helpful tips in Dutch. Always be positive and focus on opportunities for improvement. Consider elements such as: facial expression (smiling, approachability), eye contact with the camera, lighting and background (is it distracting?), clothing and overall appearance, whether the photo clearly shows the person, whether the photo shows an activity or hobby. Structure your feedback with a positive opening, followed by 2-3 concrete, actionable tips. End with an encouraging closing remark. The entire response must be in Dutch.'
      },
      {
        role: 'user' as const,
        content: `Here is the photo to analyze: ${input.photoDataUri}`
      }
    ];
    
    const response = await chatCompletion(messages, {
      provider: 'openrouter',
      maxTokens: 600,
      temperature: 0.7
    });
    
    return {
      advice: response,
    };
  }
);