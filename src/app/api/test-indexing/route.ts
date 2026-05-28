import { NextRequest, NextResponse } from 'next/server'
import { pingIndexNow, pingGoogleIndexingAPI } from '@/lib/indexing'

/**
 * Testroute voor SEO-indexering — alleen beschikbaar in development
 * GET /api/test-indexing?url=https://...
 */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Alleen beschikbaar in development' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const testUrl =
    searchParams.get('url') ??
    `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:9000'}/blog/test-slug`

  const results = await Promise.allSettled([
    pingIndexNow([testUrl]),
    pingGoogleIndexingAPI(testUrl),
  ])

  const [indexNowResult, googleResult] = results

  return NextResponse.json({
    testUrl,
    indexNow: indexNowResult.status === 'fulfilled' ? 'ok' : indexNowResult.reason,
    googleIndexing: googleResult.status === 'fulfilled' ? 'ok' : googleResult.reason,
  })
}
