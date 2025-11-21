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

  return KNOWLEDGE_BASE.find((entry) => {
    if (entry.tags && entry.tags.some((tag) => normalized.includes(tag))) {
      return true;
    }

    const normalizedQuestion = entry.question.toLowerCase();
    return normalizedQuestion.includes(normalized) || normalized.includes(normalizedQuestion);
  });
}
