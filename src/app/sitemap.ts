import { MetadataRoute } from 'next';
import { sql } from '@vercel/postgres';
import { getAllKennisbankArticles } from '@/lib/kennisbank';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://datingassistent.nl';

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date('2025-01-01'),
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/prijzen`,
      lastModified: new Date('2025-01-01'),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/40-plus`,
      lastModified: new Date('2025-01-01'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/50-plus`,
      lastModified: new Date('2025-01-01'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/features`,
      lastModified: new Date('2025-01-01'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date('2025-01-01'),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/cursussen`,
      lastModified: new Date('2025-01-01'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/kennisbank`,
      lastModified: new Date('2025-01-01'),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/over-ons`,
      lastModified: new Date('2025-01-01'),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date('2025-01-01'),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date('2025-01-01'),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/veiligheid`,
      lastModified: new Date('2025-01-01'),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacyverklaring`,
      lastModified: new Date('2025-01-01'),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/algemene-voorwaarden`,
      lastModified: new Date('2025-01-01'),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: new Date('2025-01-01'),
      changeFrequency: 'monthly' as const,
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
      changeFrequency: 'weekly' as const,
      priority: 0.6,
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
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Error fetching courses for sitemap:', error);
  }

  let kennisbankPages: MetadataRoute.Sitemap = [];
  try {
    const articles = getAllKennisbankArticles();
    kennisbankPages = [
      ...articles.map((article) => ({
        url: `${baseUrl}/kennisbank/${article.slug}`,
        lastModified: new Date(article.date),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      })),
    ];
  } catch (error) {
    console.error('Error fetching kennisbank articles for sitemap:', error);
  }

  return [...staticPages, ...blogPages, ...coursePages, ...kennisbankPages];
}
