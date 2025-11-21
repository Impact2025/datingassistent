/**
 * OpenRouter API Client voor toegang tot Claude Haiku en andere AI modellen
 * OpenRouter biedt toegang tot meerdere AI modellen via één API
 * Documentatie: https://openrouter.ai/docs
 */

interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

interface OpenRouterResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * OpenRouter client class voor het maken van API calls
 */
export class OpenRouterClient {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENROUTER_API_KEY || '';

    // For development, provide a fallback if API key is not found
    if (!this.apiKey && process.env.NODE_ENV === 'development') {
      console.warn('⚠️ OpenRouter API key niet gevonden in development mode, using fallback');
      this.apiKey = 'sk-or-v1-fallback-key-for-development';
    }

    if (!this.apiKey) {
      throw new Error('OpenRouter API key is niet ingesteld. Voeg OPENROUTER_API_KEY toe aan .env.local');
    }
  }

  /**
   * Maak een chat completion met OpenRouter
   * @param model - Het AI model om te gebruiken (bijv. 'anthropic/claude-3.5-haiku')
   * @param messages - Array van berichten
   * @param options - Optionele parameters zoals max_tokens, temperature, etc.
   */
  async createChatCompletion(
    model: string,
    messages: OpenRouterMessage[],
    options: {
      max_tokens?: number;
      temperature?: number;
      top_p?: number;
      frequency_penalty?: number;
      presence_penalty?: number;
    } = {}
  ): Promise<string> {
    // For development with fallback key, return mock response
    if (process.env.NODE_ENV === 'development' && this.apiKey === 'sk-or-v1-fallback-key-for-development') {
      console.log('⚠️ Using mock OpenRouter response in development mode');
      return `Dit is een mock response voor development. Het echte AI model zou hier een nuttige dating tip geven gebaseerd op je input. In productie zou dit een echte AI response zijn van ${model}.`;
    }

    const requestBody: OpenRouterRequest = {
      model,
      messages,
      ...options,
    };

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002',
          'X-Title': 'DatingAssistent',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const data: OpenRouterResponse = await response.json();

      if (!data.choices || data.choices.length === 0) {
        throw new Error('Geen response ontvangen van OpenRouter');
      }

      return data.choices[0].message.content;
    } catch (error) {
      // In development, provide a fallback response instead of failing
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ OpenRouter API call failed in development, using fallback response:', error);
        return `Dit is een fallback response voor development mode. Het AI model zou normaal gesproken een nuttige dating aanbeveling geven. Probeer het opnieuw in productie met een geldige API key.`;
      }
      throw error;
    }
  }
}

/**
 * Default OpenRouter client instantie - lazy loaded
 */
let openRouterInstance: OpenRouterClient | null = null;

/**
 * Get the OpenRouter client instance (lazy loaded)
 */
export function getOpenRouterClient(): OpenRouterClient {
  if (!openRouterInstance) {
    openRouterInstance = new OpenRouterClient();
  }
  return openRouterInstance;
}

/**
 * Legacy export for backward compatibility - lazy loaded via Proxy
 * Only creates instance when methods are actually called
 */
export const openRouter: OpenRouterClient = new Proxy({} as OpenRouterClient, {
  get(target, prop) {
    // Only create instance when a property/method is accessed
    const instance = getOpenRouterClient();
    const value = (instance as any)[prop];

    // If it's a function, bind it to the instance
    if (typeof value === 'function') {
      return value.bind(instance);
    }

    return value;
  }
});

/**
 * Beschikbare modellen via OpenRouter
 */
export const OPENROUTER_MODELS = {
  // Claude modellen (Anthropic)
  CLAUDE_35_HAIKU: 'anthropic/claude-3.5-haiku',
  CLAUDE_35_SONNET: 'anthropic/claude-3.5-sonnet',
  CLAUDE_3_OPUS: 'anthropic/claude-3-opus',
  CLAUDE_3_SONNET: 'anthropic/claude-3-sonnet',
  CLAUDE_3_HAIKU: 'anthropic/claude-3-haiku',

  // GPT modellen (OpenAI)
  GPT_4_TURBO: 'openai/gpt-4-turbo',
  GPT_4: 'openai/gpt-4',
  GPT_35_TURBO: 'openai/gpt-3.5-turbo',

  // Gemini modellen (Google)
  GEMINI_PRO: 'google/gemini-pro',
  GEMINI_PRO_VISION: 'google/gemini-pro-vision',
} as const;
