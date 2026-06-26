import { NextRequest, NextResponse } from 'next/server';

const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '1b415c2508776bc036da5896cb5d0851';
const HOST = 'datingassistent.nl';
const INDEXNOW_URL = 'https://api.indexnow.org/indexnow';

// Rate limiting state (in-memory, per instance — voldoende voor Vercel serverless)
const RATE_LIMIT_WINDOW = 10_000; // 10 seconden tussen externe calls
const MAX_BATCH_SIZE = 10;        // max 10 URLs per externe call
let lastCallTime = 0;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * POST /api/indexnow
 * Submit URLs voor instant indexatie via IndexNow (Bing/Yandex/Naver/Seznam).
 *
 * Body: { slugs: string[] } — blog slugs (worden automatisch omgezet naar URLs).
 *        Of { urls: string[] } — volledige URLs.
 *
 * Rate limiting (harde 10s pauze tussen API calls) om 429 te voorkomen.
 * Bij grote batches worden URLs in groepen van 10 verstuurd met 10s ertussen.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let urls: string[] = [];

    if (body.slugs && Array.isArray(body.slugs)) {
      urls = body.slugs.map((s: string) => `https://${HOST}/blog/${s}`);
    } else if (body.urls && Array.isArray(body.urls)) {
      urls = body.urls;
    } else {
      return NextResponse.json(
        { error: 'Geef "slugs" of "urls" array mee in de body.' },
        { status: 400 }
      );
    }

    urls = urls.filter((u) => u.startsWith('https://') || u.startsWith('http://'));
    if (urls.length === 0) {
      return NextResponse.json(
        { error: 'Geen geldige URLs om te submitten.' },
        { status: 400 }
      );
    }

    // Split in batches van MAX_BATCH_SIZE met 10s ertussen (429-preventie)
    const batches: string[][] = [];
    for (let i = 0; i < urls.length; i += MAX_BATCH_SIZE) {
      batches.push(urls.slice(i, i + MAX_BATCH_SIZE));
    }

    const results: { success: boolean; submitted: number; error?: string }[] = [];

    for (const batch of batches) {
      // Rate limit: wachten tot cooldown voorbij is
      const now = Date.now();
      const timeSinceLastCall = now - lastCallTime;
      if (timeSinceLastCall < RATE_LIMIT_WINDOW) {
        const waitMs = RATE_LIMIT_WINDOW - timeSinceLastCall;
        console.log(`[IndexNow] Rate limit: waiting ${waitMs}ms before next call`);
        await sleep(waitMs);
      }

      const payload = {
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
        urlList: batch,
      };

      console.log(`[IndexNow] Submitting batch of ${batch.length} URLs`);

      lastCallTime = Date.now();

      try {
        const response = await fetch(INDEXNOW_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(15_000), // 15s timeout per call
        });

        if (response.ok) {
          console.log(`[IndexNow] Batch OK (${batch.length} URLs)`);
          results.push({ success: true, submitted: batch.length });
        } else if (response.status === 429) {
          // Rate limited — wacht extra 30s en retry eenmalig
          console.warn(`[IndexNow] 429 rate limited — waiting 30s before retry`);
          await sleep(30_000);
          lastCallTime = Date.now();
          const retryResponse = await fetch(INDEXNOW_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(15_000),
          });
          if (retryResponse.ok) {
            results.push({ success: true, submitted: batch.length });
          } else {
            const errText = await retryResponse.text();
            results.push({ success: false, submitted: 0, error: `Retry failed: ${retryResponse.status} ${errText}` });
          }
        } else {
          const errorText = await response.text();
          results.push({ success: false, submitted: 0, error: `IndexNow API error: ${response.status} ${errorText}` });
        }
      } catch (fetchError) {
        console.error(`[IndexNow] Network error:`, fetchError);
        results.push({ success: false, submitted: 0, error: `Network error submitting batch` });
      }
    }

    const totalSubmitted = results.filter((r) => r.success).reduce((sum, r) => sum + r.submitted, 0);
    const errors = results.filter((r) => !r.success);

    return NextResponse.json({
      success: errors.length === 0,
      submitted: totalSubmitted,
      totalRequested: urls.length,
      batches: batches.length,
      ...(errors.length > 0 && { errors: errors.map((e) => e.error) }),
    });
  } catch (error) {
    console.error('[IndexNow] Internal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
