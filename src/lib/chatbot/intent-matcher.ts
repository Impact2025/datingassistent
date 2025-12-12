import type { ChatbotIntent, KnowledgeBaseEntry } from './types';
import { KNOWLEDGE_BASE } from './knowledge-base';

const SUPPORT_KEYWORDS = ['inloggen', 'login', 'support', 'probleem', 'bug', 'fout', 'reset'];
const SALES_KEYWORDS = ['prijs', 'kosten', 'abonnement', 'demo', 'sales', 'offerte', 'pakket'];
const PRIVACY_KEYWORDS = ['privacy', 'avg', 'gegevens', 'data'];

export function detectIntent(message: string): ChatbotIntent {
  const normalized = message.toLowerCase();

  if (PRIVACY_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return 'privacy';
  }

  if (SUPPORT_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return 'support';
  }

  if (SALES_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return normalized.includes('prijs') || normalized.includes('kost') ? 'pricing' : 'sales';
  }

  const faqMatch = findKnowledgeBaseMatch(normalized);
  if (faqMatch) {
    return faqMatch.intent;
  }

  return 'fallback';
}

export function findKnowledgeBaseMatch(message: string): KnowledgeBaseEntry | undefined {
  const normalized = message.toLowerCase();
  // Split into words for whole-word matching
  const messageWords = normalized.split(/\s+/);

  return KNOWLEDGE_BASE.find((entry) => {
    // Check tags with WORD BOUNDARY matching (not substring)
    if (entry.tags) {
      const hasTagMatch = entry.tags.some((tag) => {
        const tagLower = tag.toLowerCase();
        // Escape special regex characters
        const escapedTag = tagLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Use word boundaries to prevent "rouw" matching "vrouw"
        const wordBoundaryRegex = new RegExp(`\\b${escapedTag}\\b`, 'i');
        return wordBoundaryRegex.test(normalized);
      });

      if (hasTagMatch) {
        return true;
      }
    }

    // Check question similarity with minimum word overlap
    const normalizedQuestion = entry.question.toLowerCase();
    const questionWords = normalizedQuestion.split(/\s+/);

    // Require at least 2 significant words to match (3+ letters)
    const significantMessageWords = messageWords.filter(w => w.length >= 3);
    const significantQuestionWords = questionWords.filter(w => w.length >= 3);

    const matchingWords = significantMessageWords.filter(word =>
      significantQuestionWords.some(qWord => qWord.includes(word) || word.includes(qWord))
    );

    // Match if at least 2 significant words overlap
    return matchingWords.length >= 2;
  });
}
