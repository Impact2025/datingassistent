import { NextResponse } from 'next/server';

const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '1b415c2508776bc036da5896cb5d0851';
const HOST = 'https://datingassistent.nl';

const robotsTxt = `# robots.txt — DatingAssistent.nl
# Laatst bijgewerkt: 2026-06-26

User-agent: *
Allow: /
Disallow: /login
Disallow: /register
Disallow: /forgot-password
Disallow: /reset-password
Disallow: /verify-email
Disallow: /resend-verification
Disallow: /auth-error
Disallow: /logout
Disallow: /dashboard/
Disallow: /profiel
Disallow: /chat
Disallow: /kickstart/
Disallow: /payment/
Disallow: /checkout/
Disallow: /admin/
Disallow: /api/
Disallow: /_next/

# IndexNow — instant search indexing (Bing, Yandex, Seznam, Naver)
Sitemap: ${HOST}/sitemap.xml
IndexNow: ${HOST}/${INDEXNOW_KEY}.txt

Host: ${HOST.replace('https://', '')}
`;

export async function GET() {
  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
