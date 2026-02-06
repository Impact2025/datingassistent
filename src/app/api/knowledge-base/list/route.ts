/**
 * KNOWLEDGE BASE LIST API
 *
 * Returns all knowledge base articles for internal linking
 * Uses the REAL markdown-based kennisbank articles, not the support KB_ARTICLES
 *
 * @route GET /api/knowledge-base/list
 * @access Public
 */

import { NextResponse } from 'next/server';
import { getAllKennisbankArticles } from '@/lib/kennisbank';

export async function GET() {
  try {
    // Get all REAL markdown-based kennisbank articles
    const kennisbankArticles = getAllKennisbankArticles();

    // Return articles with relevant fields for linking
    const articles = kennisbankArticles.map(article => ({
      id: article.slug,
      title: article.title,
      slug: article.slug,
      category: article.pillar || 'Algemeen',
      tags: article.keywords || [],
    }));

    return NextResponse.json({
      success: true,
      articles,
      count: articles.length,
    });
  } catch (error) {
    console.error('KB list error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Kon kennisbank artikelen niet ophalen',
      },
      { status: 500 }
    );
  }
}
