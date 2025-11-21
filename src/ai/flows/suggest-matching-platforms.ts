'use server';

/**
 * @fileOverview An AI agent that suggests the best dating sites or apps based on user preferences.
 *
 * - suggestMatchingPlatforms - A function that suggests dating platforms based on user profile.
 * - SuggestMatchingPlatformsInput - The input type for the suggestMatchingPlatforms function.
 * - SuggestMatchingPlatformsOutput - The return type for the suggestMatchingPlatforms function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DATING_PLATFORMS = z.array(z.object({
  name: z.string(),
  style: z.string(),
  audience: z.string(),
  cost: z.string(),
  type: z.string(),
  tech: z.string(),
  identity: z.array(z.string()),
}));

const SuggestMatchingPlatformsInputSchema = z.object({
  age: z.number().describe('The user\'s age.'),
  seekingType: z.string().describe('The type of relationship the user is seeking.'),
  identityGroup: z.string().describe('The identity group the user identifies with.'),
  platformPref: z.string().describe('The user\'s preferred platform type (e.g., mobile app, website).'),
  costPref: z.string().describe('The user\'s budget preference (e.g., free, paid).'),
  timePref: z.string().describe('The user\'s preferred time investment (e.g., daily swiping, relaxed contact).'),
  techComfort: z.string().describe('The user\'s comfort level with technology/AI.'),
  availablePlatforms: DATING_PLATFORMS.describe('A JSON array of available dating platforms and their attributes.')
});
export type SuggestMatchingPlatformsInput = z.infer<typeof SuggestMatchingPlatformsInputSchema>;

const SuggestMatchingPlatformsOutputSchema = z.array(z.object({
  name: z.string().describe('The name of the dating platform.'),
  rationale: z.string().describe('The rationale for suggesting this platform to the user.'),
}));
export type SuggestMatchingPlatformsOutput = z.infer<typeof SuggestMatchingPlatformsOutputSchema>;

export async function suggestMatchingPlatforms(input: SuggestMatchingPlatformsInput): Promise<SuggestMatchingPlatformsOutput> {
  return suggestMatchingPlatformsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestMatchingPlatformsPrompt',
  input: {schema: SuggestMatchingPlatformsInputSchema},
  output: {schema: SuggestMatchingPlatformsOutputSchema},
  prompt: `You are an expert on Dutch dating apps and websites. Give a top 2 or 3 recommendation based on the profile and preferences of the user.

        The user has the following profile:
        - Age: {{{age}}}
        - Seeking: {{{seekingType}}}
        - Identity group: {{{identityGroup}}}

        The user has the following preferences:
        - Platform preference: {{{platformPref}}}
        - Budget: {{{costPref}}}
        - Time investment: {{{timePref}}}
        - Comfort with technology/AI: {{{techComfort}}}

        Available platforms (JSON array):
        {{availablePlatforms}}

        Analyze the input and provide advice in an easy to understand manner. The response must be in Dutch.
        Respond with a JSON array of platform suggestions. Each entry in the array should have the platform's name and your rationale for suggesting it.
        Do not include any additional text outside of the JSON array.
        Ensure that the JSON is valid and can be parsed without errors.
        Each rationale should be no more than two sentences. Focus on why the platform's attributes align with the user's profile and preferences.
`,
});

const suggestMatchingPlatformsFlow = ai.defineFlow(
  {
    name: 'suggestMatchingPlatformsFlow',
    inputSchema: SuggestMatchingPlatformsInputSchema,
    outputSchema: SuggestMatchingPlatformsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
