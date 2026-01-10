/**
 * Kennisbank Utility
 * Leest en verwerkt markdown content uit de content/kennisbank folder
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Base path voor kennisbank content
const KENNISBANK_PATH = path.join(process.cwd(), 'content', 'kennisbank');

export interface KennisbankArticle {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  type: 'index' | 'pillar' | 'article';
  pillar?: string;
  featured_image?: string | null;
  keywords?: string[];
  content: string;
  readingTime: number;
}

export interface KennisbankCategory {
  slug: string;
  title: string;
  description: string;
  articles: KennisbankArticle[];
}

/**
 * Bereken leestijd (gemiddeld 200 woorden per minuut)
 */
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Parse een markdown bestand
 */
function parseMarkdownFile(filePath: string, slug: string): KennisbankArticle | null {
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title || 'Untitled',
      description: data.description || '',
      date: data.date || new Date().toISOString(),
      author: data.author || 'Team DatingAssistent',
      type: data.type || 'article',
      pillar: data.pillar,
      featured_image: data.featured_image,
      keywords: data.keywords || [],
      content,
      readingTime: calculateReadingTime(content),
    };
  } catch (error) {
    console.error(`Error parsing markdown file: ${filePath}`, error);
    return null;
  }
}

/**
 * Haal de hoofdpagina index op
 */
export function getKennisbankIndex(): KennisbankArticle | null {
  const indexPath = path.join(KENNISBANK_PATH, '_index.md');
  if (fs.existsSync(indexPath)) {
    return parseMarkdownFile(indexPath, '');
  }
  return null;
}

/**
 * Haal alle categorieën (pillar pages) op
 */
export function getKennisbankCategories(): KennisbankCategory[] {
  const categories: KennisbankCategory[] = [];

  if (!fs.existsSync(KENNISBANK_PATH)) {
    return categories;
  }

  const items = fs.readdirSync(KENNISBANK_PATH);

  for (const item of items) {
    const itemPath = path.join(KENNISBANK_PATH, item);
    const stat = fs.statSync(itemPath);

    // Skip non-directories and special files
    if (!stat.isDirectory()) continue;

    // Look for index.md in the category folder
    const indexPath = path.join(itemPath, 'index.md');
    if (fs.existsSync(indexPath)) {
      const pillarArticle = parseMarkdownFile(indexPath, item);
      if (pillarArticle) {
        // Get sub-articles in this category
        const subArticles = getArticlesInCategory(item);

        categories.push({
          slug: item,
          title: pillarArticle.title,
          description: pillarArticle.description,
          articles: [pillarArticle, ...subArticles],
        });
      }
    }
  }

  return categories;
}

/**
 * Haal alle artikelen in een categorie op (exclusief index)
 */
function getArticlesInCategory(categorySlug: string): KennisbankArticle[] {
  const articles: KennisbankArticle[] = [];
  const categoryPath = path.join(KENNISBANK_PATH, categorySlug);

  if (!fs.existsSync(categoryPath)) {
    return articles;
  }

  const items = fs.readdirSync(categoryPath);

  for (const item of items) {
    // Skip index.md (that's the pillar page)
    if (item === 'index.md') continue;

    const itemPath = path.join(categoryPath, item);
    const stat = fs.statSync(itemPath);

    if (stat.isFile() && item.endsWith('.md')) {
      // It's a markdown file
      const slug = `${categorySlug}/${item.replace('.md', '')}`;
      const article = parseMarkdownFile(itemPath, slug);
      if (article) {
        articles.push(article);
      }
    } else if (stat.isDirectory()) {
      // It's a subdirectory, look for index.md
      const subIndexPath = path.join(itemPath, 'index.md');
      if (fs.existsSync(subIndexPath)) {
        const slug = `${categorySlug}/${item}`;
        const article = parseMarkdownFile(subIndexPath, slug);
        if (article) {
          articles.push(article);
        }
      }
    }
  }

  return articles;
}

/**
 * Haal alle artikelen op (voor sitemap, etc.)
 */
export function getAllKennisbankArticles(): KennisbankArticle[] {
  const articles: KennisbankArticle[] = [];

  // Get standalone articles (direct in kennisbank folder)
  if (fs.existsSync(KENNISBANK_PATH)) {
    const items = fs.readdirSync(KENNISBANK_PATH);

    for (const item of items) {
      const itemPath = path.join(KENNISBANK_PATH, item);
      const stat = fs.statSync(itemPath);

      if (stat.isFile() && item.endsWith('.md') && item !== '_index.md') {
        const slug = item.replace('.md', '');
        const article = parseMarkdownFile(itemPath, slug);
        if (article) {
          articles.push(article);
        }
      }
    }
  }

  // Get all category articles
  const categories = getKennisbankCategories();
  for (const category of categories) {
    articles.push(...category.articles);
  }

  return articles;
}

/**
 * Haal een specifiek artikel op via slug
 */
export function getKennisbankArticle(slug: string | string[]): KennisbankArticle | null {
  // Convert array slug to string path
  const slugPath = Array.isArray(slug) ? slug.join('/') : slug;

  // Try different file locations
  const possiblePaths = [
    // Direct file: /kennisbank/datingtermen -> datingtermen.md
    path.join(KENNISBANK_PATH, `${slugPath}.md`),
    // Index in folder: /kennisbank/ghosting -> ghosting/index.md
    path.join(KENNISBANK_PATH, slugPath, 'index.md'),
    // Sub-article: /kennisbank/ghosting/verwerken -> ghosting/verwerken.md
    path.join(KENNISBANK_PATH, `${slugPath}.md`),
  ];

  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      return parseMarkdownFile(filePath, slugPath);
    }
  }

  return null;
}

/**
 * Haal gerelateerde artikelen op
 */
export function getRelatedArticles(article: KennisbankArticle, limit: number = 3): KennisbankArticle[] {
  const allArticles = getAllKennisbankArticles();

  // Filter out the current article
  const otherArticles = allArticles.filter(a => a.slug !== article.slug);

  // Score articles based on shared keywords and same pillar
  const scored = otherArticles.map(a => {
    let score = 0;

    // Same pillar = high relevance
    if (a.pillar && article.pillar && a.pillar === article.pillar) {
      score += 10;
    }

    // Shared keywords
    if (article.keywords && a.keywords) {
      const shared = article.keywords.filter(k => a.keywords?.includes(k));
      score += shared.length * 2;
    }

    return { article: a, score };
  });

  // Sort by score and return top results
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.article);
}

/**
 * Genereer alle mogelijke slugs voor static generation
 */
export function getAllKennisbankSlugs(): string[][] {
  const slugs: string[][] = [];

  const articles = getAllKennisbankArticles();
  for (const article of articles) {
    slugs.push(article.slug.split('/'));
  }

  return slugs;
}

/**
 * Haal vorige en volgende artikelen binnen dezelfde pillar/categorie
 */
export function getAdjacentArticles(article: KennisbankArticle): {
  previous: KennisbankArticle | null;
  next: KennisbankArticle | null;
} {
  // Get the pillar slug from the article
  const pillarSlug = article.pillar || article.slug.split('/')[0];

  // Find the category
  const categories = getKennisbankCategories();
  const category = categories.find(c => c.slug === pillarSlug);

  if (!category) {
    return { previous: null, next: null };
  }

  // Find current article index in category
  const currentIndex = category.articles.findIndex(a => a.slug === article.slug);

  if (currentIndex === -1) {
    return { previous: null, next: null };
  }

  return {
    previous: currentIndex > 0 ? category.articles[currentIndex - 1] : null,
    next: currentIndex < category.articles.length - 1 ? category.articles[currentIndex + 1] : null,
  };
}

/**
 * Extract headings from markdown content for Table of Contents
 */
export interface TOCHeading {
  id: string;
  text: string;
  level: number;
}

export function extractHeadingsFromContent(content: string): TOCHeading[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const headings: TOCHeading[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    // Create URL-friendly ID
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    headings.push({ id, text, level });
  }

  return headings;
}

/**
 * Get category info for an article
 */
export function getArticleCategory(article: KennisbankArticle): KennisbankCategory | null {
  const pillarSlug = article.pillar || article.slug.split('/')[0];
  const categories = getKennisbankCategories();
  return categories.find(c => c.slug === pillarSlug) || null;
}
