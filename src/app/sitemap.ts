import { MetadataRoute } from 'next';
import { sql } from '@vercel/postgres';
import { getAllKennisbankArticles } from '@/lib/kennisbank';

export const dynamic = 'force-dynamic';

const baseUrl = 'https://datingassistent.nl';

// Reflects when a page was last meaningfully updated.
// Update this date whenever you make significant content changes to that page.
const DATES = {
  homepage:    new Date('2026-04-01'),
  pricing:     new Date('2026-04-01'),
  features:    new Date('2026-03-01'),
  blog:        new Date(),             // always fresh (new posts appear here)
  kennisbank:  new Date('2026-04-01'),
  cursussen:   new Date('2026-04-01'),
  landingpage: new Date('2026-03-01'),
  static:      new Date('2025-12-01'),
  legal:       new Date('2025-06-01'),
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: DATES.homepage,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/prijzen`,
      lastModified: DATES.pricing,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/features`,
      lastModified: DATES.features,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: DATES.blog,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/cursussen`,
      lastModified: DATES.cursussen,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/kennisbank`,
      lastModified: DATES.kennisbank,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    // Doelgroep landingspagina's
    {
      url: `${baseUrl}/30-plus`,
      lastModified: DATES.landingpage,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/40-plus`,
      lastModified: DATES.landingpage,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/50-plus`,
      lastModified: DATES.landingpage,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/over-ons`,
      lastModified: DATES.static,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: DATES.static,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: DATES.static,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/veiligheid`,
      lastModified: DATES.static,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacyverklaring`,
      lastModified: DATES.legal,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/algemene-voorwaarden`,
      lastModified: DATES.legal,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: DATES.legal,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const blogResult = await sql`
      SELECT slug, updated_at, publish_date
      FROM blogs
      WHERE published = true
      ORDER BY publish_date DESC
    `;

    blogPages = blogResult.rows.map((blog) => ({
      url: `${baseUrl}/blog/${blog.slug}`,
      lastModified: new Date(blog.updated_at || blog.publish_date),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error);
  }

  let coursePages: MetadataRoute.Sitemap = [];
  try {
    const coursesResult = await sql`
      SELECT slug, updated_at
      FROM cursussen
      WHERE status = 'published'
      ORDER BY created_at ASC
    `;

    coursePages = coursesResult.rows.map((cursus) => ({
      url: `${baseUrl}/cursussen/${cursus.slug}`,
      lastModified: new Date(cursus.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Error fetching courses for sitemap:', error);
  }

  let kennisbankPages: MetadataRoute.Sitemap = [];
  try {
    const articles = getAllKennisbankArticles();
    kennisbankPages = articles.map((article) => ({
      url: `${baseUrl}/kennisbank/${article.slug}`,
      lastModified: new Date(article.date),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Error fetching kennisbank articles for sitemap:', error);
  }

  return [...staticPages, ...blogPages, ...coursePages, ...kennisbankPages];
}
