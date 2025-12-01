import { MetadataRoute } from 'next';
import SEOManager from '@/lib/seo/seo-manager';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://datingassistent.nl';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/api/admin/',
        '/dashboard/',
        '/api/user/',
        '/api/auth/',
        '/_next/',
        '/api/health',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}