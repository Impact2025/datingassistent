import { MetadataRoute } from 'next';
import { sql } from '@vercel/postgres';
import { getAllKennisbankArticles } from '@/lib/kennisbank';

export const dynamic = 'force-dynamic';

const baseUrl = 'https://datingassistent.nl';

// Reflects when a page was last meaningfully updated.
// Update this date whenever you make significant content changes to that page.
const DATES = {
  homepage:    new Date('2026-06-26'),
  pricing:     new Date('2026-06-26'),
  features:    new Date('2026-06-26'),
  blog:        new Date(),             // always fresh (new posts appear here)
  kennisbank:  new Date('2026-06-26'),
  cursussen:   new Date('2026-06-26'),
  tools:       new Date('2026-06-26'),
  quizzes:     new Date('2026-06-26'),
  courses:     new Date('2026-06-26'),
  assessment:  new Date('2026-06-26'),
  transform:   new Date('2026-06-26'),
  landingpage: new Date('2026-06-26'),
  static:      new Date('2026-06-26'),
  legal:       new Date('2026-06-26'),
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    // === Hoofdpagina's ===
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
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/kennisbank`,
      lastModified: DATES.kennisbank,
      changeFrequency: 'weekly',
      priority: 0.8,
    },

    // === Doelgroep landingspagina's ===
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

    // === Signatuur pagina's (AI-features) ===
    {
      url: `${baseUrl}/ai-relationship-coach`,
      lastModified: DATES.landingpage,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/date-planner`,
      lastModified: DATES.landingpage,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/scheiding-herstart`,
      lastModified: DATES.landingpage,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/profile-analysis`,
      lastModified: DATES.landingpage,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/kickstart`,
      lastModified: DATES.landingpage,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/kickstart-toolkit`,
      lastModified: DATES.landingpage,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/transformatie`,
      lastModified: DATES.transform,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/transformatie/onboarding`,
      lastModified: DATES.transform,
      changeFrequency: 'monthly',
      priority: 0.6,
    },

    // === Cursus pagina's ===
    {
      url: `${baseUrl}/cursus`,
      lastModified: DATES.courses,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/cursus/mindset-voorbereiding`,
      lastModified: DATES.courses,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/cursus/profiel-optimalisatie`,
      lastModified: DATES.courses,
      changeFrequency: 'monthly',
      priority: 0.7,
    },

    // === Tools ===
    {
      url: `${baseUrl}/tools`,
      lastModified: DATES.tools,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/tools/36-vragen`,
      lastModified: DATES.tools,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/tools/ai-bio-generator`,
      lastModified: DATES.tools,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/tools/vibe-check`,
      lastModified: DATES.tools,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/tools/ghosting-reframer`,
      lastModified: DATES.tools,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/tools/energie-batterij`,
      lastModified: DATES.tools,
      changeFrequency: 'monthly',
      priority: 0.6,
    },

    // === Quizzen ===
    {
      url: `${baseUrl}/quiz`,
      lastModified: DATES.quizzes,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/quiz/resultaat`,
      lastModified: DATES.quizzes,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/quiz/dating-patroon`,
      lastModified: DATES.quizzes,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/quiz/dating-patroon/resultaat`,
      lastModified: DATES.quizzes,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/quiz/emotionele-readiness-40plus`,
      lastModified: DATES.quizzes,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/quiz/emotionele-readiness-50plus`,
      lastModified: DATES.quizzes,
      changeFrequency: 'monthly',
      priority: 0.7,
    },

    // === Assessments & Scans ===
    {
      url: `${baseUrl}/assessment/result`,
      lastModified: DATES.assessment,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/scans`,
      lastModified: DATES.assessment,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/reviews`,
      lastModified: DATES.static,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/essentials`,
      lastModified: DATES.static,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/pro`,
      lastModified: DATES.static,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/select-package`,
      lastModified: DATES.static,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/premium-coaching`,
      lastModified: DATES.static,
      changeFrequency: 'monthly',
      priority: 0.7,
    },

    // === Content pagina's ===
    {
      url: `${baseUrl}/reviews`,
      lastModified: DATES.static,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/podcasts`,
      lastModified: DATES.static,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: DATES.static,
      changeFrequency: 'monthly',
      priority: 0.5,
    },

    // === Zelf-assessment onderdelen ===
    {
      url: `${baseUrl}/hechtingsstijl`,
      lastModified: DATES.assessment,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/relatiepatronen`,
      lastModified: DATES.assessment,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/datingstijl`,
      lastModified: DATES.assessment,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/dating-stijl-scan`,
      lastModified: DATES.assessment,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/dating-style`,
      lastModified: DATES.assessment,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blind-vlekken`,
      lastModified: DATES.assessment,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/emotionele-readiness`,
      lastModified: DATES.assessment,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/foto`,
      lastModified: DATES.assessment,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/match`,
      lastModified: DATES.assessment,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/opener`,
      lastModified: DATES.assessment,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/veiligheid`,
      lastModified: DATES.assessment,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/waarden-kompas`,
      lastModified: DATES.assessment,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/levensvisie`,
      lastModified: DATES.assessment,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/voice`,
      lastModified: DATES.assessment,
      changeFrequency: 'monthly',
      priority: 0.5,
    },

    // === Groei & Leren ===
    {
      url: `${baseUrl}/groei`,
      lastModified: DATES.static,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/leren`,
      lastModified: DATES.static,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/meer`,
      lastModified: DATES.static,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/coach`,
      lastModified: DATES.static,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/leaderboard`,
      lastModified: DATES.static,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/progress`,
      lastModified: DATES.static,
      changeFrequency: 'monthly',
      priority: 0.4,
    },

    // === Community ===
    {
      url: `${baseUrl}/community/guidelines`,
      lastModified: DATES.static,
      changeFrequency: 'monthly',
      priority: 0.5,
    },

    // === Overige ===
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

    // === Juridisch ===
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

  // === Dynamische pagina's (DB) — errors worden silent afgevangen ===
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const blogResult = await sql`
      SELECT slug, updated_at, publish_date
      FROM blogs
      WHERE published = true
      ORDER BY publish_date DESC
    `;
    blogPages = blogResult.rows.map((blog: { slug: string; updated_at?: string | Date; publish_date?: string | Date }) => ({
      url: `${baseUrl}/blog/${blog.slug}`,
      lastModified: new Date(blog.updated_at || blog.publish_date || new Date()),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
    if (blogPages.length > 0) {
      console.log(`[sitemap] ${blogPages.length} blog posts toegevoegd`);
    }
  } catch (error) {
    console.error('[sitemap] Blog posts niet geladen:', error);
  }

  let coursePages: MetadataRoute.Sitemap = [];
  try {
    const coursesResult = await sql`
      SELECT slug, updated_at
      FROM cursussen
      WHERE status = 'published'
      ORDER BY created_at ASC
    `;
    coursePages = coursesResult.rows.map((cursus: { slug: string; updated_at?: string | Date }) => ({
      url: `${baseUrl}/cursussen/${cursus.slug}`,
      lastModified: new Date(cursus.updated_at || new Date()),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
    if (coursePages.length > 0) {
      console.log(`[sitemap] ${coursePages.length} cursussen toegevoegd`);
    }
  } catch (error) {
    console.error('[sitemap] Cursussen niet geladen:', error);
  }

  let kennisbankPages: MetadataRoute.Sitemap = [];
  try {
    const articles = getAllKennisbankArticles();
    kennisbankPages = articles.map((article: { slug: string; date?: string }) => ({
      url: `${baseUrl}/kennisbank/${article.slug}`,
      lastModified: new Date(article.date || new Date()),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
    if (kennisbankPages.length > 0) {
      console.log(`[sitemap] ${kennisbankPages.length} kennisbank artikelen toegevoegd`);
    }
  } catch (error) {
    console.error('[sitemap] Kennisbank niet geladen:', error);
  }

  const allPages = [...staticPages, ...blogPages, ...coursePages, ...kennisbankPages];
  console.log(`[sitemap] Totaal: ${allPages.length} URLs gegenereerd`);
  return allPages;
}
