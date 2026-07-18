import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { sql } from '@vercel/postgres';
import { getAllKennisbankArticles } from '@/lib/kennisbank';
import { pingIndexNow } from '@/lib/indexing';

const BASE_URL = 'https://www.datingassistent.nl';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
  } catch {
    return NextResponse.json({ error: 'Geen toegang' }, { status: 401 });
  }

  const blogUrls: string[] = [];
  const kennisbankUrls: string[] = [];
  const errors: string[] = [];

  // Haal alle gepubliceerde blog slugs op
  try {
    const result = await sql`SELECT slug FROM blogs WHERE published = true`;
    for (const row of result.rows) {
      blogUrls.push(`${BASE_URL}/blog/${row.slug}`);
    }
  } catch (err) {
    errors.push(`Blog ophalen mislukt: ${err instanceof Error ? err.message : String(err)}`);
  }

  // Haal alle kennisbank artikel slugs op
  try {
    const articles = getAllKennisbankArticles();
    for (const article of articles) {
      kennisbankUrls.push(`${BASE_URL}/kennisbank/${article.slug}`);
    }
  } catch (err) {
    errors.push(`Kennisbank ophalen mislukt: ${err instanceof Error ? err.message : String(err)}`);
  }

  const allUrls = [...blogUrls, ...kennisbankUrls];

  // IndexNow accepteert max 10.000 URLs per request — batch per 500
  const BATCH = 500;
  let submitted = 0;
  for (let i = 0; i < allUrls.length; i += BATCH) {
    try {
      await pingIndexNow(allUrls.slice(i, i + BATCH));
      submitted += Math.min(BATCH, allUrls.length - i);
    } catch (err) {
      errors.push(`IndexNow batch ${i / BATCH + 1} mislukt: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return NextResponse.json({
    success: true,
    submitted,
    blog: blogUrls.length,
    kennisbank: kennisbankUrls.length,
    errors: errors.length > 0 ? errors : undefined,
    tip: 'Dien ook de sitemap opnieuw in via Search Console → Sitemaps → datingassistent.nl/sitemap.xml → Verzenden',
  });
}
