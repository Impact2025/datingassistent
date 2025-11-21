/**
 * AI Cost Tracking Utility
 *
 * This utility provides functions to track AI service usage and costs
 * for monitoring, billing, and analytics purposes.
 */

interface CostLogData {
  service: string;
  operation: string;
  cost: number;
  tokens?: number;
  userId?: number;
  timestamp?: Date;
}

// Service cost rates (per 1K tokens or per operation)
// These should be updated based on actual pricing
const COST_RATES = {
  openrouter: {
    'chat_completion': 0.0005, // per token
    'image_generation': 0.002, // per image
    'text_embedding': 0.0001, // per token
  },
  'google-gemini': {
    'text_generation': 0.00025, // per token
    'vision_analysis': 0.001, // per image
  },
  anthropic: {
    'chat_completion': 0.001, // per token
  }
};

/**
 * Log an AI operation cost
 */
export async function logAICost(data: CostLogData): Promise<void> {
  try {
    const response = await fetch('/api/admin/cost-monitoring', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      console.warn('Failed to log AI cost:', await response.text());
    }
  } catch (error) {
    // Non-blocking error - don't fail the main operation
    console.warn('Cost logging failed:', error);
  }
}

/**
 * Calculate cost for OpenRouter operations
 */
export function calculateOpenRouterCost(model: string, tokens: number, operation: string = 'chat_completion'): number {
  const rate = COST_RATES.openrouter[operation as keyof typeof COST_RATES.openrouter] || 0.0005;
  return (tokens / 1000) * rate;
}

/**
 * Calculate cost for Google Gemini operations
 */
export function calculateGeminiCost(model: string, tokens: number, operation: string = 'text_generation'): number {
  const rate = COST_RATES['google-gemini'][operation as keyof typeof COST_RATES['google-gemini']] || 0.00025;
  return (tokens / 1000) * rate;
}

/**
 * Calculate cost for Anthropic operations
 */
export function calculateAnthropicCost(model: string, tokens: number): number {
  const rate = COST_RATES.anthropic.chat_completion || 0.001;
  return (tokens / 1000) * rate;
}

/**
 * Track OpenRouter API usage
 */
export async function trackOpenRouterUsage(
  operation: string,
  tokens: number,
  userId?: number,
  model?: string
): Promise<void> {
  const cost = calculateOpenRouterCost(model || 'default', tokens, operation);

  await logAICost({
    service: 'openrouter',
    operation,
    cost,
    tokens,
    userId
  });
}

/**
 * Track Google Gemini API usage
 */
export async function trackGeminiUsage(
  operation: string,
  tokens: number,
  userId?: number,
  images?: number
): Promise<void> {
  let cost = calculateGeminiCost('default', tokens, operation);

  // Add image costs if applicable
  if (images && operation === 'vision_analysis') {
    cost += images * (COST_RATES['google-gemini'].vision_analysis || 0.001);
  }

  await logAICost({
    service: 'google-gemini',
    operation,
    cost,
    tokens,
    userId
  });
}

/**
 * Track Anthropic API usage
 */
export async function trackAnthropicUsage(
  tokens: number,
  userId?: number,
  model?: string
): Promise<void> {
  const cost = calculateAnthropicCost(model || 'default', tokens);

  await logAICost({
    service: 'anthropic',
    operation: 'chat_completion',
    cost,
    tokens,
    userId
  });
}

/**
 * Generic cost tracking wrapper for any AI operation
 */
export async function trackAIOperation(
  service: string,
  operation: string,
  cost: number,
  metadata?: {
    tokens?: number;
    userId?: number;
    model?: string;
    images?: number;
  }
): Promise<void> {
  await logAICost({
    service,
    operation,
    cost,
    tokens: metadata?.tokens,
    userId: metadata?.userId
  });
}

/**
 * Estimate tokens from text (rough approximation)
 */
export function estimateTokens(text: string): number {
  // Rough approximation: 1 token ≈ 4 characters for most models
  return Math.ceil(text.length / 4);
}

/**
 * Estimate tokens from messages array
 */
export function estimateTokensFromMessages(messages: Array<{ role: string; content: string }>): number {
  const totalText = messages.map(m => m.content).join(' ');
  return estimateTokens(totalText);
}