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

    const metaTitleVal = (metaTitle || title).slice(0, 120);
    const metaDescVal = (seoDescription || excerpt || '').slice(0, 300);
    // Excerpt uit eerste <p> als niet meegegeven.
    let excerptVal = (excerpt || '').trim();
    if (!excerptVal) {
      const firstP = /<p>([\s\S]*?)<\/p>/i.exec(content);
      excerptVal = firstP
        ? firstP[1].replace(/<[^>]+>/g, '').trim().slice(0, 200)
        : '';
    }
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
          content = ${content},
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
          ${title}, ${excerptVal}, ${content}, ${cleanSlug},
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
