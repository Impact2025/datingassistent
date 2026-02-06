/**
 * KNOWLEDGE BASE LIST API
 *
 * Returns all knowledge base articles for internal linking
 *
 * @route GET /api/knowledge-base/list
 * @access Public
 */

import { NextResponse } from 'next/server';
import { KB_ARTICLES } from '@/lib/support/knowledge-base';

export async function GET() {
  try {
    // Return all KB articles with relevant fields for linking
    const articles = KB_ARTICLES.map(article => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      category: article.category,
      tags: article.tags,
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
