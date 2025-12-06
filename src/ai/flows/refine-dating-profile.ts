'use server';
/**
 * @fileOverview Refines a dating profile based on user input and desired tone.
 *
 * - refineDatingProfile - A function that refines the dating profile.
 * - RefineDatingProfileInput - The input type for the refineDatingProfile function.
 * - RefineDatingProfileOutput - The return type for the refineDatingProfile function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { chatCompletion } from '@/lib/ai-service'; // Import the chatCompletion function from our AI service

const RefineDatingProfileInputSchema = z.object({
  name: z.string().describe('Your name or nickname.'),
  age: z.number().describe('Your age.'),
  gender: z.string().describe('Your gender identity.'),
  location: z.string().describe('Your city or region.'),
  seekingGender: z.array(z.string()).describe('The gender(s) you are seeking.'),
  seekingAgeMin: z.number().describe('The minimum age of the people you are seeking.'),
  seekingAgeMax: z.number().describe('The maximum age of the people you are seeking.'),
  seekingType: z.string().describe('The type of relationship you are seeking (e.g., serious, casual, open).'),
  identityGroup: z.string().describe('Your identity group (e.g., LGBTQ+, 50+, general).'),
  tone: z.string().describe('The desired tone for your profile (e.g., lighthearted, serious, quirky).'),
  keywords: z.string().describe('Keywords or phrases to include in your profile.'),
});

export type RefineDatingProfileInput = z.infer<typeof RefineDatingProfileInputSchema>;

const RefineDatingProfileOutputSchema = z.object({
  refinedProfile: z.string().describe('The refined dating profile text.'),
});

export type RefineDatingProfileOutput = z.infer<typeof RefineDatingProfileOutputSchema>;

export async function refineDatingProfile(input: RefineDatingProfileInput): Promise<RefineDatingProfileOutput> {
  return refineDatingProfileFlow(input);
}

const _refineDatingProfilePrompt = ai.definePrompt({
  name: 'refineDatingProfilePrompt',
  input: {schema: RefineDatingProfileInputSchema},
  output: {schema: RefineDatingProfileOutputSchema},
  prompt: `You are an expert Dutch dating coach who specializes in creating authentic, culturally-relevant dating profiles for the Dutch market.

  Based on the user's input, create a refined dating profile that is engaging, authentic, and reflects their personality while being perfectly suited for Dutch dating culture (Tinder, Bumble, etc.).

  Here is the user's information:
  - Name: {{{name}}}
  - Age: {{{age}}}
  - Gender: {{{gender}}}
  - Location: {{{location}}}
  - Seeking: {{{seekingGender}}} (ages {{{seekingAgeMin}}} - {{{seekingAgeMax}}}) for {{{seekingType}}}
  - Identity Group: {{{identityGroup}}}
  - Desired Tone: {{{tone}}}
  - Keywords/Phrases: {{{keywords}}}

  CRITICAL REQUIREMENTS for Dutch dating profiles:
  1. Use natural, conversational Dutch - avoid formal language
  2. Include typically Dutch elements: "gezelligheid", local culture, Dutch humor
  3. Keep it concise (80-120 words) - Dutch people prefer direct communication
  4. Add personality through specific hobbies, not generic statements
  5. Include a call-to-action or question to encourage responses
  6. Use emojis sparingly but effectively (1-2 max)
  7. Reference Dutch culture: festivals, food, cities, or typical Dutch activities

  Write a compelling dating profile that will stand out in the Dutch dating scene and attract the user's ideal match. Focus on authenticity and cultural relevance.
  `,
});

const refineDatingProfileFlow = ai.defineFlow(
  {
    name: 'refineDatingProfileFlow',
    inputSchema: RefineDatingProfileInputSchema,
    outputSchema: RefineDatingProfileOutputSchema,
  },
  async input => {
    // Use our AI service's chatCompletion function which is properly configured for OpenRouter
    const messages = [
      {
        role: 'system' as const,
        content: `You are an expert Dutch dating coach who specializes in creating authentic, culturally-relevant dating profiles for the Dutch market.

CRITICAL: You MUST respond in perfect, natural Dutch (Nederlands). No English words or phrases. Use conversational Dutch that Dutch people actually use.

Based on the user's input, create a refined dating profile that is engaging, authentic, and reflects their personality while being perfectly suited for Dutch dating culture (Tinder, Bumble, etc.).

Requirements for Dutch dating profiles:
1. Use natural, conversational Dutch - avoid formal language
2. Include typically Dutch elements: "gezelligheid", local culture, Dutch humor
3. Keep it concise (80-120 words) - Dutch people prefer direct communication
4. Add personality through specific hobbies, not generic statements
5. Include a call-to-action or question to encourage responses
6. Use emojis sparingly but effectively (1-2 max)
7. Reference Dutch culture: festivals, food, cities, or typical Dutch activities

The profile should be approximately 2-3 paragraphs long and written entirely in Dutch.`
      },
      {
        role: 'user' as const,
        content: `Hier is de gebruikersinformatie:
  - Naam: ${input.name}
  - Leeftijd: ${input.age}
  - Geslacht: ${input.gender}
  - Locatie: ${input.location}
  - Zoekt: ${input.seekingGender.join(', ')} (leeftijden ${input.seekingAgeMin} - ${input.seekingAgeMax}) voor ${input.seekingType}
  - Identiteitsgroep: ${input.identityGroup}
  - Gewenste toon: ${input.tone}
  - Sleutelwoorden/zinnen: ${input.keywords}

  Schrijf een overtuigend dating profiel met bovenstaande informatie. Focus op het laten opvallen van het profiel en het aantrekken van de ideale match van de gebruiker. Het profiel moet volledig in het Nederlands zijn.`
      }
    ];
    
    const response = await chatCompletion(messages, {
      provider: 'openrouter',
      maxTokens: 800,
      temperature: 0.7
    });
    
    return {
      refinedProfile: response,
    };
  }
);