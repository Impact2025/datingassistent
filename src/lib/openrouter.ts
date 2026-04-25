import { logger } from '@/lib/logger';
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

  private readonly FALLBACK_CHAIN: Record<string, string[]> = {
    'anthropic/claude-haiku-4-5': ['openai/gpt-3.5-turbo'],
    'anthropic/claude-sonnet-4-5': ['anthropic/claude-haiku-4-5', 'openai/gpt-4-turbo'],
    'anthropic/claude-opus-4-5': ['anthropic/claude-sonnet-4-5', 'openai/gpt-4-turbo'],
  };

  private readonly RETRYABLE_STATUS_CODES = [429, 500, 502, 503, 524];

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
  async *streamChatCompletion(
    model: string,
    messages: OpenRouterMessage[],
    options: {
      max_tokens?: number;
      temperature?: number;
      enableFallback?: boolean;
    } = {}
  ): AsyncGenerator<string, void, unknown> {
    const { enableFallback, ...streamOptions } = options;
    const modelsToTry = enableFallback
      ? [model, ...(this.FALLBACK_CHAIN[model] ?? [])]
      : [model];

    let response: Response | null = null;
    let lastError: Error | null = null;

    for (const currentModel of modelsToTry) {
      if (lastError) {
        console.warn(`⚠️ Streaming model ${modelsToTry[modelsToTry.indexOf(currentModel) - 1]} gefaald, schakel naar fallback: ${currentModel}`);
      }

      const requestBody = { model: currentModel, messages, ...streamOptions, stream: true };
      const attempt = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://datingassistent.nl',
          'X-Title': 'DatingAssistent',
        },
        body: JSON.stringify(requestBody),
      });

      if (!attempt.ok) {
        const errorText = await attempt.text();
        const err = new Error(`OpenRouter streaming error: ${attempt.status} - ${errorText}`);
        if (enableFallback && this.RETRYABLE_STATUS_CODES.includes(attempt.status)) {
          lastError = err;
          continue;
        }
        throw err;
      }

      response = attempt;
      break;
    }

    if (!response) {
      throw lastError ?? new Error('Alle streaming modellen in fallback-keten gefaald');
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body for streaming');

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;
          if (!trimmed.startsWith('data: ')) continue;

          try {
            const json = JSON.parse(trimmed.slice(6));
            const content = json.choices?.[0]?.delta?.content;
            if (content) yield content;
          } catch {
            // skip malformed chunks
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async createChatCompletion(
    model: string,
    messages: OpenRouterMessage[],
    options: {
      max_tokens?: number;
      temperature?: number;
      top_p?: number;
      frequency_penalty?: number;
      presence_penalty?: number;
      enableFallback?: boolean;
    } = {}
  ): Promise<string> {
    // For development with fallback key, return mock response
    if (process.env.NODE_ENV === 'development' && this.apiKey === 'sk-or-v1-fallback-key-for-development') {
      logger.log('⚠️ Using mock OpenRouter response in development mode');
      return `Dit is een mock response voor development. Het echte AI model zou hier een nuttige dating tip geven gebaseerd op je input. In productie zou dit een echte AI response zijn van ${model}.`;
    }

    const { enableFallback, ...apiOptions } = options;
    const modelsToTry = enableFallback
      ? [model, ...(this.FALLBACK_CHAIN[model] ?? [])]
      : [model];

    let lastError: Error | null = null;

    for (const currentModel of modelsToTry) {
      if (lastError) {
        console.warn(`⚠️ Model ${modelsToTry[modelsToTry.indexOf(currentModel) - 1]} gefaald, schakel naar fallback: ${currentModel}`);
      }

      const requestBody: OpenRouterRequest = {
        model: currentModel,
        messages,
        ...apiOptions,
      };

      try {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://datingassistent.nl',
            'X-Title': 'DatingAssistent',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          const err = new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
          if (enableFallback && this.RETRYABLE_STATUS_CODES.includes(response.status)) {
            lastError = err;
            continue;
          }
          throw err;
        }

        const data: OpenRouterResponse = await response.json();

        if (!data.choices || data.choices.length === 0) {
          throw new Error('Geen response ontvangen van OpenRouter');
        }

        return data.choices[0].message.content;
      } catch (error) {
        if (error instanceof Error && enableFallback && lastError !== error) {
          lastError = error;
          continue;
        }
        // In development, provide a fallback response instead of failing
        if (process.env.NODE_ENV === 'development') {
          console.warn('⚠️ OpenRouter API call failed in development, using fallback response:', error);
          return `Dit is een fallback response voor development mode. Het AI model zou normaal gesproken een nuttige dating aanbeveling geven. Probeer het opnieuw in productie met een geldige API key.`;
        }
        throw error;
      }
    }

    // All models in fallback chain exhausted
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Alle fallback modellen gefaald in development mode');
      return `Dit is een fallback response voor development mode. Alle modellen gefaald.`;
    }
    throw lastError ?? new Error('Alle modellen in fallback-keten gefaald');
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
  // Claude Haiku — snel en goedkoop, voor analyse en enkelvoudige vragen
  CLAUDE_HAIKU: 'anthropic/claude-haiku-4-5',
  CLAUDE_3_HAIKU: 'anthropic/claude-haiku-4-5',
  CLAUDE_35_HAIKU: 'anthropic/claude-haiku-4-5',

  // Claude Sonnet — balans kwaliteit/snelheid, voor coaching en profielgeneratie
  CLAUDE_SONNET: 'anthropic/claude-sonnet-4-5',
  CLAUDE_35_SONNET: 'anthropic/claude-sonnet-4-5',

  // Claude Opus — hoogste kwaliteit, beschikbaar voor toekomstig gebruik
  CLAUDE_OPUS: 'anthropic/claude-opus-4-5',

  // GPT modellen (OpenAI) — fallback
  GPT_4_TURBO: 'openai/gpt-4-turbo',
  GPT_4: 'openai/gpt-4',
  GPT_35_TURBO: 'openai/gpt-3.5-turbo',

  // Gemini modellen (Google) — fallback
  GEMINI_PRO: 'google/gemini-pro',
  GEMINI_PRO_VISION: 'google/gemini-pro-vision',
} as const;
