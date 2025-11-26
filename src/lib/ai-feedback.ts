/**
 * AI Feedback utilities for DatingAssistent
 * Contains functions for generating AI-powered feedback for course exercises
 */

import { openRouter, OPENROUTER_MODELS } from './openrouter';
import { sql } from '@vercel/postgres';

export interface AIFeedbackResult {
  feedback: string;
  score: number;
}

/**
 * Generate AI feedback for a course exercise answer using Claude
 * @param answer - The user's answer text
 * @param exerciseId - The exercise ID (number)
 * @param moduleSlug - The module slug
 * @param lesSlug - The lesson slug
 * @returns Promise with feedback and score
 */
export async function generateAIFeedback(
  answer: string,
  exerciseId: number,
  moduleSlug: string,
  lesSlug: string,
  userId?: number
): Promise<AIFeedbackResult> {
  try {
    // Create cache key based on answer content and context
    const cacheKey = `exercise_feedback_${exerciseId}_${moduleSlug}_${lesSlug}_${hashString(answer)}`;

    // Check cache first if userId is provided
    if (userId) {
      try {
        const cachedResult = await sql`
          SELECT content_data, expires_at
          FROM ai_content_cache
          WHERE user_id = ${userId}
            AND content_type = 'exercise_feedback'
            AND content_key = ${cacheKey}
            AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
          LIMIT 1
        `;

        if (cachedResult.rows.length > 0) {
          const cachedData = JSON.parse(cachedResult.rows[0].content_data);
          console.log(`📖 Using cached AI feedback for user ${userId}, exercise ${exerciseId}`);
          return cachedData;
        }
      } catch (cacheError) {
        console.warn('Cache check failed, proceeding with AI generation:', cacheError);
      }
    }

    const systemPrompt = `Je bent een dating coach die feedback geeft op oefeningen in een cursus over dating en relaties. Je geeft constructieve, empathische feedback in het Nederlands op B1-niveau. Focus op:
- Wat goed gaat aan het antwoord
- Wat kan worden verbeterd
- Praktische tips voor dating
- Moedigende woorden

Geef een score tussen 60-100 gebaseerd op:
- Diepgang van het antwoord
- Zelfreflectie
- Realistische verwachtingen
- Authenticiteit

Houd feedback kort (max 3 zinnen) en geef altijd een score.`;

    const userPrompt = `Geef feedback op dit antwoord van een cursusoefening:

Module: ${moduleSlug}
Les: ${lesSlug}
Oefening ID: ${exerciseId}

Antwoord van gebruiker: "${answer}"

Geef feedback en een score (60-100).`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt }
    ];

    const aiResponse = await openRouter.createChatCompletion(
      OPENROUTER_MODELS.CLAUDE_35_HAIKU,
      messages,
      {
        max_tokens: 200,
        temperature: 0.7,
      }
    );

    // Extract score from AI response (look for number between 60-100)
    const scoreMatch = aiResponse.match(/(\d{2,3})(?=\/100|\s*score|\s*punten?|$)/);
    let score = 75; // Default score

    if (scoreMatch) {
      const parsedScore = parseInt(scoreMatch[1]);
      if (parsedScore >= 60 && parsedScore <= 100) {
        score = parsedScore;
      }
    }

    // Clean up feedback (remove score mentions if present)
    let feedback = aiResponse.replace(/\s*\d{2,3}\/\d{2,3}|\s*score:?\s*\d{2,3}|\s*\d{2,3}\s*punten?/gi, '').trim();

    // Ensure feedback is not empty
    if (!feedback || feedback.length < 20) {
      feedback = "Bedankt voor je antwoord! Dit is een belangrijke stap in je dating reis. Blijf reflecteren op je ervaringen.";
    }

    const result = { feedback, score };

    // Cache the result if userId is provided
    if (userId) {
      try {
        await sql`
          INSERT INTO ai_content_cache
          (user_id, content_type, content_key, content_data, ai_model, ai_version, usage_count, last_used, expires_at)
          VALUES (
            ${userId},
            'exercise_feedback',
            ${cacheKey},
            ${JSON.stringify(result)}::jsonb,
            'anthropic/claude-3.5-haiku',
            'v1.0',
            1,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP + INTERVAL '24 hours'
          )
          ON CONFLICT (user_id, content_type, content_key)
          DO UPDATE SET
            content_data = EXCLUDED.content_data,
            usage_count = ai_content_cache.usage_count + 1,
            last_used = CURRENT_TIMESTAMP,
            expires_at = CURRENT_TIMESTAMP + INTERVAL '24 hours'
        `;
        console.log(`💾 Cached AI feedback for user ${userId}, exercise ${exerciseId}`);
      } catch (cacheError) {
        console.warn('Failed to cache AI feedback:', cacheError);
        // Don't fail the request if caching fails
      }
    }

    return result;

  } catch (error) {
    console.error('Error generating AI feedback:', error);

    // Fallback to basic feedback if AI fails
    const fallbackFeedback = "Bedankt voor je antwoord! Dit is een belangrijke stap in je leerproces. Blijf oefenen met zelfreflectie - dat helpt je om betere keuzes te maken.";
    const fallbackScore = Math.floor(Math.random() * 20) + 70; // 70-90

    return { feedback: fallbackFeedback, score: fallbackScore };
  }
}

/**
 * Simple string hashing function for cache keys
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}