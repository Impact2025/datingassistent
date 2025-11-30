// ============================================================================
// IRIS SMART CONVERSATION MEMORY
//
// 🚀 WERELDKLASSE: Intelligente conversatie tracking met pattern recognition
// Analyseert gesprekken, detecteert patronen, en genereert follow-up suggesties
// ============================================================================

import { sql } from '@vercel/postgres';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ConversationInsight {
  userId: number;
  conversationId: string;
  topics: string[];
  emotionalTone: string;
  userConcerns: string[];
  progress: 'stuck' | 'improving' | 'neutral';
  suggestedFollowUps: string[];
  createdAt: Date;
}

export interface ConversationPattern {
  pattern: string;
  frequency: number;
  firstSeen: Date;
  lastSeen: Date;
  examples: string[];
}

/**
 * 🧠 Analyseer een gesprek met AI voor diepere inzichten
 */
export async function analyzeConversationWithAI(
  userMessage: string,
  irisResponse: string
): Promise<{
  sentiment: string;
  topics: string[];
  emotionalTone: string;
  keyInsight?: string;
}> {
  try {
    const analysisPrompt = `Analyseer dit dating coaching gesprek:

USER: "${userMessage}"
IRIS: "${irisResponse}"

Geef JSON terug met:
{
  "sentiment": "positief/negatief/neutraal/bezorgd/enthousiast",
  "topics": ["topic1", "topic2"], // max 3 topics
  "emotionalTone": "confident/nervous/frustrated/excited/confused",
  "keyInsight": "1 zin samenvatting van waar user mee worstelt"
}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',  // Snel en goedkoop voor analyse
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: analysisPrompt,
        },
      ],
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      return {
        sentiment: analysis.sentiment || 'neutraal',
        topics: analysis.topics || [],
        emotionalTone: analysis.emotionalTone || 'neutraal',
        keyInsight: analysis.keyInsight,
      };
    }
  } catch (error) {
    console.error('Error in AI conversation analysis:', error);
  }

  // Fallback to simple analysis
  return {
    sentiment: analyzeSentimentSimple(userMessage),
    topics: [],
    emotionalTone: 'neutraal',
  };
}

/**
 * 📊 Detecteer conversatie patronen voor een gebruiker
 */
export async function detectConversationPatterns(userId: number): Promise<ConversationPattern[]> {
  // Haal laatste 20 gesprekken op
  const conversations = await sql`
    SELECT user_message, sentiment, created_at
    FROM iris_conversation_memory
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 20
  `;

  if (conversations.rows.length === 0) return [];

  const patterns: Record<string, ConversationPattern> = {};

  // Detecteer terugkerende thema's
  const topics = ['profiel', 'match', 'date', 'gesprek', 'relatie', 'onzekerheid'];

  conversations.rows.forEach(conv => {
    const message = conv.user_message.toLowerCase();

    topics.forEach(topic => {
      if (message.includes(topic)) {
        if (!patterns[topic]) {
          patterns[topic] = {
            pattern: topic,
            frequency: 0,
            firstSeen: conv.created_at,
            lastSeen: conv.created_at,
            examples: [],
          };
        }

        patterns[topic].frequency++;
        patterns[topic].lastSeen = conv.created_at;

        if (patterns[topic].examples.length < 3) {
          patterns[topic].examples.push(conv.user_message.substring(0, 50));
        }
      }
    });
  });

  // Sorteer op frequency
  return Object.values(patterns).sort((a, b) => b.frequency - a.frequency);
}

/**
 * 💡 Genereer follow-up suggesties op basis van conversatie geschiedenis
 */
export async function generateFollowUpSuggestions(userId: number): Promise<string[]> {
  const patterns = await detectConversationPatterns(userId);
  const suggestions: string[] = [];

  // Check voor terugkerende problemen
  patterns.forEach(pattern => {
    if (pattern.frequency >= 3) {
      if (pattern.pattern === 'onzekerheid') {
        suggestions.push('Hoe kan ik je helpen met je zelfvertrouwen?');
      }
      if (pattern.pattern === 'profiel') {
        suggestions.push('Laten we je profiel eens goed reviewen!');
      }
      if (pattern.pattern === 'gesprek') {
        suggestions.push('Wil je tips om gesprekken soepeler te laten verlopen?');
      }
      if (pattern.pattern === 'match') {
        suggestions.push('Laten we je match criteria eens analyseren');
      }
    }
  });

  // Check voor stuck patterns (zelfde onderwerp > 5x)
  const stuckPattern = patterns.find(p => p.frequency > 5);
  if (stuckPattern) {
    suggestions.push(`Je vraagt vaak over ${stuckPattern.pattern}. Misschien kunnen we een assessment doen?`);
  }

  // Default suggestions als geen patronen
  if (suggestions.length === 0) {
    suggestions.push(
      'Hoe gaat het met je dating journey?',
      'Heb je nog vragen over je laatste date?',
      'Wil je je profiel laten reviewen?'
    );
  }

  return suggestions.slice(0, 3);
}

/**
 * 📈 Track user progress over tijd
 */
export async function trackUserProgress(userId: number): Promise<{
  overallProgress: 'improving' | 'stuck' | 'declining' | 'new';
  sentimentTrend: string;
  topConcerns: string[];
  successMoments: number;
}> {
  const conversations = await sql`
    SELECT sentiment, user_message, created_at
    FROM iris_conversation_memory
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 30
  `;

  if (conversations.rows.length < 3) {
    return {
      overallProgress: 'new',
      sentimentTrend: 'Nog te weinig data',
      topConcerns: [],
      successMoments: 0,
    };
  }

  // Analyse sentiment trend
  const recentSentiments = conversations.rows.slice(0, 10).map(c => c.sentiment);
  const olderSentiments = conversations.rows.slice(10, 20).map(c => c.sentiment);

  const recentPositive = recentSentiments.filter(s => s === 'positief' || s === 'enthousiast').length;
  const olderPositive = olderSentiments.filter(s => s === 'positief' || s === 'enthousiast').length;

  let overallProgress: 'improving' | 'stuck' | 'declining' | 'new' = 'stuck';
  if (recentPositive > olderPositive + 2) overallProgress = 'improving';
  if (recentPositive < olderPositive - 2) overallProgress = 'declining';

  // Count success moments (positive sentiment mentions)
  const successMoments = recentSentiments.filter(s => s === 'positief' || s === 'enthousiast').length;

  // Extract top concerns
  const patterns = await detectConversationPatterns(userId);
  const topConcerns = patterns.slice(0, 3).map(p => p.pattern);

  return {
    overallProgress,
    sentimentTrend: `${recentPositive}/10 positief (was ${olderPositive}/10)`,
    topConcerns,
    successMoments,
  };
}

/**
 * 🎯 Sla conversation insight op
 */
export async function saveConversationInsight(
  userId: number,
  conversationId: string,
  insight: Partial<ConversationInsight>
): Promise<void> {
  await sql`
    INSERT INTO iris_conversation_insights (
      user_id,
      conversation_id,
      topics,
      emotional_tone,
      user_concerns,
      progress,
      suggested_follow_ups,
      created_at
    ) VALUES (
      ${userId},
      ${conversationId},
      ${JSON.stringify(insight.topics || [])},
      ${insight.emotionalTone || 'neutraal'},
      ${JSON.stringify(insight.userConcerns || [])},
      ${insight.progress || 'neutral'},
      ${JSON.stringify(insight.suggestedFollowUps || [])},
      NOW()
    )
    ON CONFLICT (user_id, conversation_id)
    DO UPDATE SET
      topics = EXCLUDED.topics,
      emotional_tone = EXCLUDED.emotional_tone,
      user_concerns = EXCLUDED.user_concerns,
      progress = EXCLUDED.progress,
      suggested_follow_ups = EXCLUDED.suggested_follow_ups,
      created_at = NOW()
  `.catch(err => {
    // Table might not exist yet, that's ok
    console.log('Note: iris_conversation_insights table not found (expected on first run)');
  });
}

/**
 * 🔍 Simpele sentiment analyse (fallback)
 */
function analyzeSentimentSimple(message: string): string {
  const lowerMessage = message.toLowerCase();

  const positiveWords = ['blij', 'super', 'geweldig', 'bedankt', 'dankje', 'top', 'fijn', 'leuk', 'mooi', 'goed gegaan'];
  const negativeWords = ['moeilijk', 'lastig', 'frustrerend', 'stom', 'balen', 'vervelend', 'slecht', 'mislukt'];
  const worriedWords = ['onzeker', 'bang', 'twijfel', 'zorgen', 'stress', 'angstig', 'nerveus'];
  const excitedWords = ['enthousiast', 'match', 'date!', 'leuk!', 'yes', 'yes!'];

  let positiveCount = 0;
  let negativeCount = 0;
  let worriedCount = 0;
  let excitedCount = 0;

  for (const word of positiveWords) {
    if (lowerMessage.includes(word)) positiveCount++;
  }
  for (const word of negativeWords) {
    if (lowerMessage.includes(word)) negativeCount++;
  }
  for (const word of worriedWords) {
    if (lowerMessage.includes(word)) worriedCount++;
  }
  for (const word of excitedWords) {
    if (lowerMessage.includes(word)) excitedCount++;
  }

  if (excitedCount > 0) return 'enthousiast';
  if (worriedCount > 0) return 'bezorgd';
  if (positiveCount > negativeCount) return 'positief';
  if (negativeCount > positiveCount) return 'negatief';
  return 'neutraal';
}

/**
 * 📝 Haal recente conversatie samenvatting op voor context
 */
export async function getConversationSummary(userId: number, limit: number = 5): Promise<string> {
  const conversations = await sql`
    SELECT user_message, iris_response, sentiment, created_at
    FROM iris_conversation_memory
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;

  if (conversations.rows.length === 0) {
    return 'Geen eerdere gesprekken';
  }

  const summary = conversations.rows.map((conv, index) => {
    const timeAgo = getTimeAgo(conv.created_at);
    return `${index + 1}. ${timeAgo}: "${conv.user_message.substring(0, 60)}..." (${conv.sentiment})`;
  }).join('\n');

  return `RECENTE GESPREKKEN:\n${summary}`;
}

/**
 * ⏰ Helper: tijd geleden
 */
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} dag${days > 1 ? 'en' : ''} geleden`;
  if (hours > 0) return `${hours} uur geleden`;
  if (minutes > 0) return `${minutes} min geleden`;
  return 'zojuist';
}
