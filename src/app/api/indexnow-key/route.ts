import { NextResponse } from 'next/server'

/**
 * Serves the IndexNow verification key at /api/indexnow-key
 * Referenced as keyLocation in pingIndexNow requests
 * GET /api/indexnow-key
 */
export async function GET() {
  const key = process.env.INDEXNOW_KEY

  if (!key) {
    return new NextResponse('INDEXNOW_KEY not configured', { status: 404 })
  }

  return new NextResponse(key, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
