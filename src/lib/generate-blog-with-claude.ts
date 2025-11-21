import { anthropic } from './anthropic';

// Bestand gedeactiveerd - Gebruik OpenRouter in plaats van directe Anthropic API
// Dit bestand is uitgeschakeld om conflicten te voorkomen

export interface BlogInput {
  topic?: string;
  primaryKeyword: string;
  year?: string;
  targetAudience?: string;
  category: string;
  extraKeywords?: string;
  toneOfVoice?: string;
  focus?: string;
  articleLength?: string;
}

export interface BlogOutput {
  title: string;
  metaTitle: string;
  metaDescription: string;
  slug: string;
  content: string;
  excerpt: string;
  keywords: string[];
  midjourneyPrompt: string;
  socialMedia: {
    instagram: {
      caption: string;
      hashtags: string[];
    };
    facebook: {
      post: string;
      hashtags: string[];
    };
    linkedin: {
      post: string;
      hashtags: string[];
    };
    twitter: {
      tweet: string;
      hashtags: string[];
    };
  };
}

export async function generateBlogWithClaude(input: BlogInput): Promise<BlogOutput> {
  // Gedeactiveerd - Gebruik OpenRouter in plaats van directe Anthropic API
  throw new Error('Directe Anthropic Claude API is gedeactiveerd. Gebruik OpenRouter in plaats daarvan.');
}
