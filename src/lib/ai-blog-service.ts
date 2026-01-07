/**
 * AI BLOG SERVICE
 *
 * Specialized AI service for blog content optimization and generation.
 * Uses OpenRouter with Claude models for high-quality blog operations.
 *
 * @module lib/ai-blog-service
 * @author DatingAssistent Team
 */

import { getOpenRouterClient, OPENROUTER_MODELS } from './openrouter';

// ============================================================================
// TYPES
// ============================================================================

export interface BlogOptimizationResult {
  suggestions: {
    headingStructure: {
      hasH1: boolean;
      h2Count: number;
      h3Count: number;
      recommendation: string;
    };
    keywordDensity: {
      count: number;
      density: number;
      recommendation: string;
    };
    readability: {
      score: number;
      sentenceLength: 'good' | 'too_long' | 'too_short';
      recommendation: string;
    };
    contentLength: {
      wordCount: number;
      recommendation: string;
    };
    improvements: string[];
  };
  optimizedContent?: string;
}

export interface MetadataEnhancementResult {
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  social: {
    title: string;
    description: string;
    hashtags: string[];
    facebookPost: string;
    twitterPost: string;
    linkedInPost: string;
  };
}

export interface BlogFormatResult {
  formattedContent: string;
  metadata: {
    seoTitle: string;
    seoDescription: string;
    socialTitle: string;
    socialDescription: string;
    keywords: string[];
    hashtags: string[];
  };
  structure: {
    h1: string | null;
    h2s: string[];
    h3s: string[];
    wordCount: number;
    paragraphCount: number;
  };
}

export interface BlogGenerationResult {
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  socialTitle: string;
  socialDescription: string;
  keywords: string[];
  hashtags: string[];
  category: string;
  readingTime: number;
  headerSuggestion: {
    type: 'image' | 'color';
    colorHex?: string;
    imagePrompt?: string;
    headerTitle?: string;
  };
}

// ============================================================================
// PROMPT TEMPLATES
// ============================================================================

const SYSTEM_PROMPT = `Je bent een professionele blog editor en SEO specialist voor DatingAssistent, een Nederlands platform over online dating en relaties.

Je schrijfstijl is:
- Vriendelijk en toegankelijk
- Professioneel maar persoonlijk
- Praktisch en actionable
- Positief en motiverend
- SEO-geoptimaliseerd

Je doelgroep is:
- Nederlandse singles die online willen daten
- Leeftijd 25-55 jaar
- Op zoek naar serieuze relaties
- Geïnteresseerd in zelfontwikkeling en groei`;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if we're in development mode without a valid API key
 */
function isDevelopmentWithoutApiKey(): boolean {
  return process.env.NODE_ENV === 'development' && !process.env.OPENROUTER_API_KEY;
}

/**
 * Call AI with automatic fallback to GPT-3.5 on rate limits
 */
async function callAIWithFallback(
  prompt: string,
  model: string = OPENROUTER_MODELS.CLAUDE_35_HAIKU,
  options: {
    max_tokens?: number;
    temperature?: number;
  } = {}
): Promise<string> {
  // Check if API key is missing in development
  if (isDevelopmentWithoutApiKey()) {
    throw new Error(
      'OPENROUTER_API_KEY is niet geconfigureerd. Voeg deze toe aan je .env.local bestand om AI functies te gebruiken.'
    );
  }

  const client = getOpenRouterClient();

  try {
    const response = await client.createChatCompletion(
      model,
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      {
        max_tokens: options.max_tokens || 4000,
        temperature: options.temperature || 0.4,
      }
    );

    // Check if we got a mock response (doesn't contain JSON)
    if (response.startsWith('Dit is een') || response.startsWith('Dit is een fallback')) {
      throw new Error(
        'OPENROUTER_API_KEY is niet geconfigureerd. Voeg deze toe aan je .env.local bestand om AI functies te gebruiken.'
      );
    }

    return response;
  } catch (error) {
    console.error(`AI call failed with ${model}:`, error);

    // Fallback to GPT-3.5 if primary model fails
    if (model !== OPENROUTER_MODELS.GPT_35_TURBO) {
      console.log('Falling back to GPT-3.5 Turbo...');
      return await client.createChatCompletion(
        OPENROUTER_MODELS.GPT_35_TURBO,
        [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        {
          max_tokens: options.max_tokens || 4000,
          temperature: options.temperature || 0.4,
        }
      );
    }

    throw error;
  }
}

/**
 * Parse JSON response from AI, with robust fallback strategies
 */
function parseAIResponse<T>(response: string): T {
  // Strategy 1: Extract from markdown code blocks
  const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch (e) {
      console.log('Failed to parse markdown JSON, trying other strategies...');
    }
  }

  // Strategy 2: Direct parse
  try {
    return JSON.parse(response);
  } catch (e) {
    console.log('Direct parse failed, cleaning response...');
  }

  // Strategy 3: Clean control characters and try again
  try {
    const cleaned = response
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control chars
      .replace(/\n/g, '\\n') // Escape newlines
      .replace(/\r/g, '\\r') // Escape carriage returns
      .replace(/\t/g, '\\t'); // Escape tabs

    return JSON.parse(cleaned);
  } catch (e) {
    console.log('Cleaned parse failed, extracting JSON object...');
  }

  // Strategy 4: Extract JSON object/array with regex
  try {
    const objectMatch = response.match(/\{[\s\S]*\}/);
    const arrayMatch = response.match(/\[[\s\S]*\]/);
    const extracted = objectMatch?.[0] || arrayMatch?.[0];

    if (extracted) {
      // Clean the extracted JSON
      const cleaned = extracted
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
        .replace(/,\s*}/g, '}') // Remove trailing commas
        .replace(/,\s*\]/g, ']');

      return JSON.parse(cleaned);
    }
  } catch (e) {
    console.log('Regex extraction failed');
  }

  // Final fallback: Log raw response and throw
  console.error('All parsing strategies failed. Raw response:', response.substring(0, 500));
  throw new Error(`AI response was not valid JSON. Response starts with: ${response.substring(0, 100)}`);
}

// ============================================================================
// AI SERVICE FUNCTIONS
// ============================================================================

/**
 * Optimize blog content structure for SEO and readability
 */
export async function optimizeBlogContent(input: {
  content: string;
  title: string;
  focusKeyword?: string;
}): Promise<BlogOptimizationResult> {
  const prompt = `Analyseer de volgende blog content voor SEO en leesbaarheid:

TITEL: ${input.title}
${input.focusKeyword ? `FOCUS KEYWORD: ${input.focusKeyword}` : ''}

CONTENT:
${input.content}

Geef een gedetailleerde analyse in JSON formaat met:
1. Heading structuur (H1, H2, H3 counts en aanbevelingen)
2. Keyword densiteit (als focus keyword gegeven is)
3. Leesbaarheid score (0-100)
4. Content lengte en aanbevelingen
5. Lijst van concrete verbeterpunten

BELANGRIJK: Geef ALLEEN valid JSON terug zonder extra tekst. Escape alle special characters correct.

Formaat:
\`\`\`json
{
  "suggestions": {
    "headingStructure": {
      "hasH1": true,
      "h2Count": 5,
      "h3Count": 8,
      "recommendation": "string"
    },
    "keywordDensity": {
      "count": 10,
      "density": 1.5,
      "recommendation": "string"
    },
    "readability": {
      "score": 85,
      "sentenceLength": "good",
      "recommendation": "string"
    },
    "contentLength": {
      "wordCount": 1200,
      "recommendation": "string"
    },
    "improvements": ["improvement1", "improvement2"]
  }
}
\`\`\`

Geef ALLEEN de JSON terug, geen extra uitleg.`;

  const response = await callAIWithFallback(prompt, OPENROUTER_MODELS.CLAUDE_35_HAIKU);
  return parseAIResponse<BlogOptimizationResult>(response);
}

/**
 * Generate enhanced SEO and social media metadata
 */
export async function enhanceMetadata(input: {
  title: string;
  content: string;
  excerpt?: string;
  focusKeyword?: string;
  category?: string;
}): Promise<MetadataEnhancementResult> {
  const prompt = `Genereer geoptimaliseerde SEO en social media metadata voor deze blog:

TITEL: ${input.title}
${input.category ? `CATEGORIE: ${input.category}` : ''}
${input.focusKeyword ? `FOCUS KEYWORD: ${input.focusKeyword}` : ''}
${input.excerpt ? `EXCERPT: ${input.excerpt}` : ''}

CONTENT:
${input.content.substring(0, 1500)}...

Creëer optimale metadata in JSON formaat:
1. SEO titel (max 60 karakters, met keyword)
2. SEO omschrijving (max 155 karakters, pakkend)
3. 5-8 relevante keywords
4. Social media titel (max 70 karakters, emotioneel)
5. Social media omschrijving (max 200 karakters)
6. 3-5 hashtags
7. Platform-specifieke posts (Facebook, Twitter, LinkedIn)

BELANGRIJK: Geef ALLEEN valid JSON terug zonder extra tekst. Escape alle special characters correct.

Formaat:
\`\`\`json
{
  "seo": {
    "title": "string (max 60 chars)",
    "description": "string (max 155 chars)",
    "keywords": ["keyword1", "keyword2", ...]
  },
  "social": {
    "title": "string (max 70 chars)",
    "description": "string (max 200 chars)",
    "hashtags": ["hashtag1", "hashtag2", ...],
    "facebookPost": "string",
    "twitterPost": "string (max 280 chars)",
    "linkedInPost": "string"
  }
}
\`\`\`

Geef ALLEEN de JSON terug, geen extra uitleg.`;

  const response = await callAIWithFallback(prompt, OPENROUTER_MODELS.CLAUDE_35_HAIKU);
  return parseAIResponse<MetadataEnhancementResult>(response);
}

/**
 * Format and optimize blog content with metadata
 */
export async function formatBlog(input: {
  rawContent: string;
  title: string;
  category: string;
  focusKeyword?: string;
  targetLength?: 'short' | 'medium' | 'long';
}): Promise<BlogFormatResult> {
  const lengthGuide = {
    short: '500-800 woorden',
    medium: '1000-1500 woorden',
    long: '1800-2500 woorden',
  };

  const prompt = `Format en optimaliseer deze ruwe blog content tot een professionele blog post:

TITEL: ${input.title}
CATEGORIE: ${input.category}
${input.focusKeyword ? `FOCUS KEYWORD: ${input.focusKeyword}` : ''}
TARGET LENGTE: ${lengthGuide[input.targetLength || 'medium']}

RUWE CONTENT:
${input.rawContent}

Taak:
1. Structureer de content met H2 en H3 koppen
2. Schrijf volledige paragrafen (3-5 zinnen)
3. Voeg bullet points toe waar relevant
4. Optimaliseer voor leesbaarheid en SEO
5. Behoud de kernboodschap en tone of voice
6. Genereer complete metadata

BELANGRIJK: Geef ALLEEN valid JSON terug zonder extra tekst. Escape alle special characters correct (\\n voor newlines, \\" voor quotes).

Geef terug in dit EXACTE JSON formaat:
\`\`\`json
{
  "formattedContent": "volledig geformatteerde HTML content (gebruik \\n voor newlines)",
  "metadata": {
    "seoTitle": "string",
    "seoDescription": "string",
    "socialTitle": "string",
    "socialDescription": "string",
    "keywords": ["keyword1", ...],
    "hashtags": ["hashtag1", ...]
  },
  "structure": {
    "h1": "string or null",
    "h2s": ["h2_1", "h2_2", ...],
    "h3s": ["h3_1", "h3_2", ...],
    "wordCount": number,
    "paragraphCount": number
  }
}
\`\`\`

Geef ALLEEN de JSON terug, geen extra uitleg of tekst ervoor of erna.`;

  const response = await callAIWithFallback(prompt, OPENROUTER_MODELS.CLAUDE_35_SONNET, {
    max_tokens: 6000,
    temperature: 0.5,
  });
  return parseAIResponse<BlogFormatResult>(response);
}

/**
 * Generate complete blog post from keywords/topic
 */
export async function generateBlog(input: {
  primaryKeyword: string;
  category: string;
  targetAudience?: string;
  topic?: string;
  toneOfVoice?: string;
  articleLength?: 'short' | 'medium' | 'long';
}): Promise<BlogGenerationResult> {
  const lengthGuide = {
    short: '500-800 woorden',
    medium: '1000-1500 woorden',
    long: '1800-2500 woorden',
  };

  const prompt = `Genereer een complete blog post voor DatingAssistent:

PRIMARY KEYWORD: ${input.primaryKeyword}
CATEGORIE: ${input.category}
${input.topic ? `TOPIC: ${input.topic}` : ''}
${input.targetAudience ? `DOELGROEP: ${input.targetAudience}` : 'Nederlandse singles 25-55 jaar'}
${input.toneOfVoice ? `TONE OF VOICE: ${input.toneOfVoice}` : 'Vriendelijk, professioneel, motiverend'}
LENGTE: ${lengthGuide[input.articleLength || 'medium']}

Creëer een volledige blog post met:
1. Pakkende titel
2. Korte excerpt (2-3 zinnen)
3. Volledige content met H2/H3 structuur
4. SEO-geoptimaliseerde metadata
5. Social media optimalisatie
6. URL-vriendelijke slug
7. Header suggestie (color of image prompt)

BELANGRIJK: Geef ALLEEN valid JSON terug zonder extra tekst. Escape alle special characters correct (\\n voor newlines, \\" voor quotes).

Geef terug in dit EXACTE JSON formaat:
\`\`\`json
{
  "title": "string",
  "content": "volledige HTML content (gebruik \\n voor newlines)",
  "excerpt": "string",
  "slug": "url-friendly-slug",
  "seoTitle": "string (max 60 chars)",
  "seoDescription": "string (max 155 chars)",
  "socialTitle": "string (max 70 chars)",
  "socialDescription": "string (max 200 chars)",
  "keywords": ["keyword1", "keyword2", ...],
  "hashtags": ["hashtag1", "hashtag2", ...],
  "category": "${input.category}",
  "readingTime": number,
  "headerSuggestion": {
    "type": "color",
    "colorHex": "#ec4899",
    "headerTitle": "string"
  }
}
\`\`\`

Geef ALLEEN de JSON terug, geen extra uitleg of tekst ervoor of erna.`;

  const response = await callAIWithFallback(prompt, OPENROUTER_MODELS.CLAUDE_35_SONNET, {
    max_tokens: 8000,
    temperature: 0.6,
  });
  return parseAIResponse<BlogGenerationResult>(response);
}
