import { genkit } from 'genkit';

// Configure Genkit to work with OpenRouter
export const ai = genkit({
  // Since we're using OpenRouter, we don't need specific plugins
  // OpenRouter acts as a unified gateway to multiple AI providers
});