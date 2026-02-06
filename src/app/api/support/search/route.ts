/**
 * API Route: POST /api/support/search
 *
 * AI-powered search across knowledge base
 * Wereldklasse Helpdesk - DatingAssistent.nl
 */

import { NextRequest, NextResponse } from 'next/server';
import { KB_ARTICLES, searchKnowledgeBase } from '@/lib/support/knowledge-base';
import type { SearchResult } from '@/lib/support/types';

// Simple TF-IDF-like scoring for relevance
function calculateRelevance(query: string, article: typeof KB_ARTICLES[0]): number {
  const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  if (queryTerms.length === 0) return 0;

  let score = 0;
  const titleLower = article.title.toLowerCase();
  const summaryLower = article.summary.toLowerCase();
  const contentLower = article.content.toLowerCase();
  const tagsLower = article.tags.map(t => t.toLowerCase());

  for (const term of queryTerms) {
    // Title match (highest weight)
    if (titleLower.includes(term)) score += 10;

    // Tag exact match (high weight)
    if (tagsLower.includes(term)) score += 8;

    // Tag partial match
    if (tagsLower.some(tag => tag.includes(term))) score += 5;

    // Summary match (medium weight)
    if (summaryLower.includes(term)) score += 4;

    // Content match (lower weight)
    const contentMatches = (contentLower.match(new RegExp(term, 'g')) || []).length;
    score += Math.min(contentMatches * 0.5, 3);
  }

  // Normalize by query length and article popularity
  const normalized = score / queryTerms.length;
  const popularityBonus = Math.log10(article.viewCount + 1) * 0.1;
  const helpfulBonus = Math.log10(article.helpfulCount + 1) * 0.15;

  return Math.min((normalized + popularityBonus + helpfulBonus) / 15, 1);
}

// Dutch synonyms for better matching
const SYNONYMS: Record<string, string[]> = {
  'wachtwoord': ['password', 'inloggen', 'login', 'toegang'],
  'betaling': ['betalen', 'geld', 'kosten', 'prijs', 'factuur', 'ideal', 'creditcard'],
  'opzeggen': ['annuleren', 'stoppen', 'beëindigen', 'cancel'],
  'foto': ['afbeelding', 'plaatje', 'profielfoto', 'picture'],
  'hulp': ['help', 'support', 'assistentie', 'ondersteuning'],
  'coach': ['iris', 'ai', 'assistent', 'begeleiding'],
  'account': ['profiel', 'gebruiker', 'gegevens'],
  'abonnement': ['lidmaatschap', 'subscription', 'premium', 'pro'],
};

function expandQueryWithSynonyms(query: string): string {
  let expanded = query.toLowerCase();

  for (const [word, synonyms] of Object.entries(SYNONYMS)) {
    if (expanded.includes(word)) {
      // Word already in query, add synonyms
      expanded += ' ' + synonyms.join(' ');
    } else if (synonyms.some(syn => expanded.includes(syn))) {
      // Synonym in query, add the main word
      expanded += ' ' + word;
    }
  }

  return expanded;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, limit = 8, category } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is verplicht' },
        { status: 400 }
      );
    }

    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
      return NextResponse.json({ results: [] });
    }

    // Expand query with synonyms for better matching
    const expandedQuery = expandQueryWithSynonyms(trimmedQuery);

    // Filter by category if specified
    let articles = KB_ARTICLES;
    if (category) {
      articles = articles.filter(
        a => a.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Score and rank articles
    const scoredArticles = articles
      .map(article => ({
        article,
        score: calculateRelevance(expandedQuery, article),
      }))
      .filter(item => item.score > 0.1) // Minimum relevance threshold
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Transform to SearchResult format
    const results: SearchResult[] = scoredArticles.map(({ article, score }) => ({
      id: article.id,
      title: article.title,
      summary: article.summary,
      relevanceScore: score,
      category: article.category,
      type: 'article' as const,
      url: `/kennisbank/${article.slug}`,
    }));

    // Log search for analytics (async, don't wait)
    logSearch(trimmedQuery, results.length).catch(console.error);

    return NextResponse.json({
      results,
      query: trimmedQuery,
      totalResults: results.length,
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij het zoeken' },
      { status: 500 }
    );
  }
}

// Analytics logging (simplified version)
async function logSearch(query: string, resultCount: number) {
  // In production, this would log to database or analytics service
  console.log(`[Search] "${query}" -> ${resultCount} results`);
}

// GET endpoint for popular searches
export async function GET() {
  try {
    // Return popular articles
    const popular = [...KB_ARTICLES]
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 5)
      .map(article => ({
        id: article.id,
        title: article.title,
        summary: article.summary,
        category: article.category,
        viewCount: article.viewCount,
      }));

    return NextResponse.json({
      popularArticles: popular,
      popularSearches: [
        'wachtwoord resetten',
        'abonnement opzeggen',
        'foto analyse',
        'Iris gebruiken',
        'betaling mislukt',
      ],
    });
  } catch (error) {
    console.error('Error fetching popular:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis' },
      { status: 500 }
    );
  }
}
