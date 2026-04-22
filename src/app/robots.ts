import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://datingassistent.nl';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        // Authenticatie
        '/login',
        '/register',
        '/forgot-password',
        '/reset-password',
        '/verify-email',
        '/resend-verification',
        '/auth-error',
        '/logout',
        // Gebruikersomgeving (achter login)
        '/dashboard/',
        '/profiel',
        '/chat',
        '/kickstart/',
        // Betalingsafhandeling (geen indexeerbare content)
        '/payment/',
        '/checkout/',
        // Beheer
        '/admin/',
        // Technisch
        '/api/',
        '/_next/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
