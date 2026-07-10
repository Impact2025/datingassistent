import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { pingIndexNow, pingGoogleIndexingAPI } from '@/lib/indexing';

/**
 * Agent OS publish endpoint.
 * POST /api/blog/agent-os
 *
 * Ontvangt een artikel van het Agent OS platform en zet het DIRECT live in de
 * `blogs`-tabel (published=true). Gebruikt Bearer-auth (AGENT_OS_PUBLISH_KEY),
 * NIET de admin-sessie, want Agent OS heeft geen cookie.
 *
 * Contract (Agent OS legacy writer, weareimpact.py Fase 4b):
 *   payload: { title, content, slug?, seoDescription?, tags?, source? }
 *   headers: Authorization: Bearer <AGENT_OS_PUBLISH_KEY>
 *   verwacht: HTTP 201 + { success, post:{id,slug,status}, url, indexing }
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Verwijder het dubbele headerblok dat de content-generator soms bovenaan de
 * body zet. De blogpagina rendert titel, datum en samenvatting ZELF (uit de
 * DB-velden), dus als de body óók een <h1>, een "Door ... Gepubliceerd op ..."
 * byline en een "<strong>Samenvatting:</strong>"-paragraaf bevat, verschijnt
 * alles dubbel op de live pagina. Deze functie str(i)pt die elementen +
 * eventuele meta-comment + losse <hr> aan het begin.
 * Retourneert { html, summary } waarbij summary de tekst uit de
 * Samenvatting-paragraaf is (voor gebruik als excerpt indien geen excerpt).
 */
function sanitizeBody(raw: string): { html: string; summary: string } {
  let html = (raw || '').trim();
  let summary = '';

  // 1) HTML-comment meta-blok (<!-- Meta-titel: ... -->) bovenaan weg.
  html = html.replace(/^\s*<!--[\s\S]*?-->\s*/i, '');

  // 2) Eerste <h1>...</h1> weg (site toont titel zelf).
  html = html.replace(/^\s*<h1\b[^>]*>[\s\S]*?<\/h1>\s*/i, '');

  // 3) Byline-paragraaf "Door ... Gepubliceerd op ..." weg
  //    (class="meta" of gewone <p> met die tekst).
  html = html.replace(
    /^\s*<p\b[^>]*>(?:(?!<\/p>)[\s\S])*?gepubliceerd op[\s\S]*?<\/p>\s*/i,
    ''
  );

  // 4) Samenvatting-paragraaf: pak de tekst als excerpt, verwijder dan het blok.
  const sumMatch =
    /<p\b[^>]*>\s*(?:<strong>)?\s*samenvatting\s*:?\s*(?:<\/strong>)?\s*([\s\S]*?)<\/p>/i.exec(
      html
    );
  if (sumMatch) {
    summary = sumMatch[1].replace(/<[^>]+>/g, '').trim();
    html = html.replace(sumMatch[0], '');
  }

  // 5) Losse <hr> aan het begin (scheidingslijn na de oude header) weg.
  html = html.replace(/^\s*(?:<hr\s*\/?>\s*)+/i, '');

  return { html: html.trim(), summary };
}

/** Kap tekst netjes af op een woordgrens (voorkomt "... toepassen. E"). */
function smartTruncate(text: string, max: number): string {
  const t = (text || '').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim() + '…';
}

/** Bouw een veilige, route-bare slug: en-dash/diacritics/emoji eruit. */
function buildSlug(input: string): string {
  return (input || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // diacritics
    .replace(/[\u2010-\u2015]/g, '-') // alle dash-varianten → '-'
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // alleen a-z 0-9 spatie streepje
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200);
}

export async function POST(request: NextRequest) {
  // ── Auth ──────────────────────────────────────────────
  const expectedKey = process.env.AGENT_OS_PUBLISH_KEY || '';
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!expectedKey) {
    return NextResponse.json(
      { success: false, error: 'AGENT_OS_PUBLISH_KEY niet geconfigureerd op de server' },
      { status: 500 }
    );
  }
  if (!token || token !== expectedKey) {
    return NextResponse.json(
      { success: false, error: 'Geen toegang' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const {
      title,
      content,
      slug: incomingSlug,
      seoDescription,
      metaTitle,
      excerpt,
      tags = [],
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'title en content zijn verplicht' },
        { status: 400 }
      );
    }

    // Bouw altijd een schone slug (negeer een aangeleverde en-dash-slug).
    const cleanSlug =
      buildSlug(incomingSlug && /^[a-z0-9-]+$/.test(incomingSlug) ? incomingSlug : title) ||
      buildSlug(title) ||
      `artikel-${Date.now()}`;

    // Verwijder dubbel headerblok (h1/byline/samenvatting) uit de body.
    const { html: cleanContent, summary: bodySummary } = sanitizeBody(content);

    const metaTitleVal = smartTruncate(metaTitle || title, 120);
    // Excerpt: expliciet meegegeven > samenvatting uit body > eerste <p>.
    let excerptSource = (excerpt || '').trim() || bodySummary;
    if (!excerptSource) {
      const firstP = /<p>([\s\S]*?)<\/p>/i.exec(cleanContent);
      excerptSource = firstP ? firstP[1].replace(/<[^>]+>/g, '').trim() : '';
    }
    const excerptVal = smartTruncate(excerptSource, 200);
    const metaDescVal = smartTruncate(seoDescription || excerptSource, 300);
    const tagsArr = Array.isArray(tags) ? tags.filter(Boolean) : [];
    const nowIso = new Date().toISOString();

    // ── Upsert op slug (overschrijf bestaande i.p.v. weigeren) ──
    const existing = await sql`SELECT id FROM blogs WHERE slug = ${cleanSlug} LIMIT 1`;

    let row;
    if (existing.rows.length > 0) {
      const id = existing.rows[0].id;
      const res = await sql`
        UPDATE blogs SET
          title = ${title},
          excerpt = ${excerptVal},
          content = ${cleanContent},
          meta_title = ${metaTitleVal},
          meta_description = ${metaDescVal},
          seo_title = ${metaTitleVal},
          seo_description = ${metaDescVal},
          keywords = ${JSON.stringify(tagsArr)},
          tags = ${JSON.stringify(tagsArr)},
          published = true,
          published_at = COALESCE(published_at, ${nowIso}),
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING id, slug, published
      `;
      row = res.rows[0];
    } else {
      const res = await sql`
        INSERT INTO blogs (
          title, excerpt, content, slug,
          meta_title, meta_description, keywords,
          category, tags,
          seo_title, seo_description,
          author, published, published_at, views, created_at, updated_at
        ) VALUES (
          ${title}, ${excerptVal}, ${cleanContent}, ${cleanSlug},
          ${metaTitleVal}, ${metaDescVal}, ${JSON.stringify(tagsArr)},
          ${'Online Dating Tips'}, ${JSON.stringify(tagsArr)},
          ${metaTitleVal}, ${metaDescVal},
          ${'DatingAssistent'}, true, ${nowIso}, 0, NOW(), NOW()
        )
        RETURNING id, slug, published
      `;
      row = res.rows[0];
    }

    // ── Zoekmachine-indexering (best-effort) ──
    const base = (process.env.NEXT_PUBLIC_BASE_URL || 'https://datingassistent.nl').replace(/\/$/, '');
    const fullUrl = `${base}/blog/${row.slug}`;
    const indexing: Record<string, string> = { indexnow: 'skipped', google: 'skipped' };
    const results = await Promise.allSettled([
      pingIndexNow([fullUrl]),
      pingGoogleIndexingAPI(fullUrl),
    ]);
    indexing.indexnow = results[0].status === 'fulfilled' ? 'ok' : 'failed';
    indexing.google = results[1].status === 'fulfilled' ? 'ok' : 'failed';

    return NextResponse.json(
      {
        success: true,
        post: { id: row.id, slug: row.slug, status: 'published' },
        url: fullUrl,
        indexing,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Agent OS publish error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Kon artikel niet publiceren',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
