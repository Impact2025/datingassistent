/**
 * Token Usage Tracking Utility
 * Tracks AI API calls for cost monitoring and admin analytics
 */

import { sql } from '@vercel/postgres';

export interface TokenUsageData {
  provider: 'openai' | 'anthropic' | string;
  model: string;
  userId?: number;
  tokensUsed: number;
  tokensInput: number;
  tokensOutput: number;
  costCents: number;
  requestDurationMs?: number;
  statusCode?: number;
  endpoint?: string;
}

/**
 * Track token usage for an AI API call
 */
export async function trackTokenUsage(data: TokenUsageData): Promise<void> {
  try {
    await sql`
      INSERT INTO api_usage (
        provider,
        model,
        user_id,
        tokens_used,
        tokens_input,
        tokens_output,
        cost_cents,
        request_duration_ms,
        status_code,
        endpoint
      ) VALUES (
        ${data.provider},
        ${data.model},
        ${data.userId || null},
        ${data.tokensUsed},
        ${data.tokensInput},
        ${data.tokensOutput},
        ${data.costCents},
        ${data.requestDurationMs || null},
        ${data.statusCode || 200},
        ${data.endpoint || null}
      )
    `;

    console.log(`📊 Tracked token usage: ${data.provider}/${data.model} - ${data.tokensUsed} tokens, $${(data.costCents / 100).toFixed(4)}`);
  } catch (error) {
    console.error('❌ Failed to track token usage:', error);
    // Don't throw - we don't want token tracking to break the API
  }
}

/**
 * Extract token usage from OpenAI API response
 */
export function extractOpenAITokenUsage(response: any, model: string): Partial<TokenUsageData> {
  const usage = response?.usage;
  if (!usage) return {};

  // Calculate cost based on model (simplified pricing)
  let costPer1kTokens = 0.002; // Default for GPT-3.5

  if (model.includes('gpt-4o')) {
    costPer1kTokens = 0.005; // $0.005 per 1k tokens for GPT-4o
  } else if (model.includes('gpt-4')) {
    costPer1kTokens = 0.03; // $0.03 per 1k tokens for GPT-4
  }

  const totalTokens = usage.total_tokens || (usage.prompt_tokens + usage.completion_tokens) || 0;
  const costCents = Math.round(totalTokens * costPer1kTokens * 10); // Convert to cents

  return {
    provider: 'openai',
    model,
    tokensUsed: totalTokens,
    tokensInput: usage.prompt_tokens || 0,
    tokensOutput: usage.completion_tokens || 0,
    costCents
  };
}

/**
 * Extract token usage from Anthropic API response
 */
export function extractAnthropicTokenUsage(response: any, model: string): Partial<TokenUsageData> {
  const usage = response?.usage;
  if (!usage) return {};

  // Anthropic pricing (simplified)
  let costPer1kTokens = 0.015; // Default for Claude

  if (model.includes('claude-3-5-sonnet')) {
    costPer1kTokens = 0.015; // $0.015 per 1k tokens
  } else if (model.includes('claude-3-opus')) {
    costPer1kTokens = 0.075; // $0.075 per 1k tokens
  }

  const totalTokens = usage.total_tokens || (usage.input_tokens + usage.output_tokens) || 0;
  const costCents = Math.round(totalTokens * costPer1kTokens * 10); // Convert to cents

  return {
    provider: 'anthropic',
    model,
    tokensUsed: totalTokens,
    tokensInput: usage.input_tokens || 0,
    tokensOutput: usage.output_tokens || 0,
    costCents
  };
}

/**
 * Track token usage with timing
 */
export async function trackTokenUsageWithTiming(
  startTime: number,
  userId: number | undefined,
  endpoint: string,
  tokenData: Partial<TokenUsageData>
): Promise<void> {
  const duration = Date.now() - startTime;

  await trackTokenUsage({
    provider: tokenData.provider || 'unknown',
    model: tokenData.model || 'unknown',
    userId,
    tokensUsed: tokenData.tokensUsed || 0,
    tokensInput: tokenData.tokensInput || 0,
    tokensOutput: tokenData.tokensOutput || 0,
    costCents: tokenData.costCents || 0,
    requestDurationMs: duration,
    endpoint,
    statusCode: 200
  });
}