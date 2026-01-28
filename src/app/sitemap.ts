import { MetadataRoute } from 'next';
import { sql } from '@vercel/postgres';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://datingassistent.nl';

  // Define static pages with their SEO configurations
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/prijzen`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/over-ons`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/features`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/veiligheid`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/algemene-voorwaarden`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacyverklaring`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    // Tool pages
    {
      url: `${baseUrl}/emotionele-readiness`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/profiel`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/chat`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/date-planner`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/hechtingsstijl`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/relatiepatronen`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/dating-stijl-scan`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/waarden-kompas`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/boost-je-dating-zelfvertrouwen`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/cursussen`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ];

  // Fetch dynamic blog posts
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

  // Fetch dynamic courses
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

  // Fetch course lessons
  let lessonPages: MetadataRoute.Sitemap = [];
  try {
    const lessonsResult = await sql`
      SELECT
        c.slug as cursus_slug,
        cl.slug as les_slug,
        cl.updated_at
      FROM cursus_lessen cl
      JOIN cursussen c ON c.id = cl.cursus_id
      WHERE cl.status = 'published' AND c.status = 'published'
      ORDER BY cl.created_at ASC
    `;

    lessonPages = lessonsResult.rows.map((les) => ({
      url: `${baseUrl}/cursussen/${les.cursus_slug}/${les.les_slug}`,
      lastModified: new Date(les.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }));
  } catch (error) {
    console.error('Error fetching course lessons for sitemap:', error);
  }

  // Combine all pages
  return [...staticPages, ...blogPages, ...coursePages, ...lessonPages];
}