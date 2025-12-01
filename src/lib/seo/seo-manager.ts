/**
 * Comprehensive SEO Manager for DatingAssistent
 * Handles meta tags, structured data, sitemaps, and SEO optimizations
 */

import { Metadata } from 'next';

export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  structuredData?: object;
  noIndex?: boolean;
  noFollow?: boolean;
  alternateLanguages?: Array<{ lang: string; url: string }>;
}

export interface PageSEOConfig {
  path: string;
  metadata: SEOMetadata;
  priority?: number;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
}

class SEOManager {
  private static readonly SITE_CONFIG = {
    name: 'DatingAssistent',
    description: 'De ultieme AI-gedreven dating coach voor moderne singles. Verbeter je dating skills met persoonlijke coaching, profiel optimalisatie en relatie advies.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://datingassistent.nl',
    ogImage: '/og-image.jpg',
    twitterHandle: '@datingassistent',
    locale: 'nl_NL',
    type: 'website' as const,
  };

  private static readonly DEFAULT_KEYWORDS = [
    'dating coach',
    'relatie advies',
    'daten tips',
    'singles',
    'liefdesleven',
    'relatieproblemen',
    'dating app',
    'profiel optimalisatie',
    'communicatie skills',
    'zelfvertrouwen',
    'emotionele intelligentie',
    'relatie patronen',
    'AI coaching',
    'persoonlijke ontwikkeling'
  ];

  /**
   * Generate comprehensive metadata for a page
   */
  static generateMetadata(config: SEOMetadata): Metadata {
    const title = this.optimizeTitle(config.title);
    const description = this.optimizeDescription(config.description);
    const canonicalUrl = config.canonical || `${this.SITE_CONFIG.url}${config.canonical || ''}`;

    const metadata: Metadata = {
      title,
      description,
      keywords: [...(config.keywords || []), ...this.DEFAULT_KEYWORDS].join(', '),
      authors: [{ name: 'DatingAssistent Team' }],
      creator: 'DatingAssistent',
      publisher: 'DatingAssistent',
      formatDetection: {
        email: false,
        address: false,
        telephone: false,
      },
      metadataBase: new URL(this.SITE_CONFIG.url),
      alternates: {
        canonical: canonicalUrl,
        languages: config.alternateLanguages?.reduce((acc, alt) => {
          acc[alt.lang] = alt.url;
          return acc;
        }, {} as Record<string, string>),
      },
      openGraph: {
        title: title.slice(0, 60), // OG title limit
        description: description.slice(0, 160), // OG description limit
        url: canonicalUrl,
        siteName: this.SITE_CONFIG.name,
        images: [{
          url: config.ogImage || this.SITE_CONFIG.ogImage,
          width: 1200,
          height: 630,
          alt: title,
        }],
        locale: this.SITE_CONFIG.locale,
        type: config.ogType || 'website',
      },
      twitter: {
        card: config.twitterCard || 'summary_large_image',
        title: title.slice(0, 60),
        description: description.slice(0, 160),
        images: [config.ogImage || this.SITE_CONFIG.ogImage],
        creator: this.SITE_CONFIG.twitterHandle,
        site: this.SITE_CONFIG.twitterHandle,
      },
      robots: {
        index: !config.noIndex,
        follow: !config.noFollow,
        googleBot: {
          index: !config.noIndex,
          follow: !config.noFollow,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      verification: {
        google: process.env.GOOGLE_SITE_VERIFICATION,
        yandex: process.env.YANDEX_VERIFICATION,
      },
    };

    // Add structured data if provided
    if (config.structuredData) {
      metadata.other = {
        'application/ld+json': JSON.stringify(config.structuredData),
      };
    }

    return metadata;
  }

  /**
   * Predefined SEO configurations for common pages
   */
  static readonly pageConfigs: Record<string, SEOMetadata> = {
    home: {
      title: 'DatingAssistent - AI Dating Coach voor Moderne Singles | Professionele Relatiebegeleiding',
      description: 'Transformeer je dating leven met DatingAssistent. AI-gedreven coaching voor profiel optimalisatie, communicatie skills, en emotionele groei. Gratis tools voor betere dates.',
      keywords: ['dating coach', 'AI relatie advies', 'profiel optimalisatie', 'dating tips', 'relatie coaching'],
      ogType: 'website',
      structuredData: this.generateOrganizationStructuredData(),
    },

    'emotionele-readiness': {
      title: 'Emotionele Ready Scan - Ben je Klaar om te Daten? | DatingAssistent',
      description: 'Ontdek of je écht klaar bent om te daten met onze wetenschappelijke Emotionele Ready Scan. AI-gedreven analyse van je emotionele beschikbaarheid en dating readiness.',
      keywords: ['emotionele readiness', 'dating readiness', 'relatie readiness', 'emotionele beschikbaarheid', 'zelfreflectie'],
      ogType: 'website',
      structuredData: this.generateToolStructuredData('Emotionele Ready Scan', 'Ontdek je emotionele beschikbaarheid voor dating'),
    },

    dashboard: {
      title: 'Dashboard - Jouw Persoonlijke Dating Journey | DatingAssistent',
      description: 'Jouw persoonlijke dashboard met AI coaching, voortgang tracking, en tools voor betere dates. Beheer je dating doelen en groei.',
      keywords: ['dashboard', 'dating voortgang', 'persoonlijke coaching', 'doelen', 'AI coach'],
      ogType: 'website',
      noIndex: true, // Private dashboard pages
    },

    'profile-suite': {
      title: 'Profiel Optimalisatie - Creëer een Onweerstaanbaar Dating Profiel | DatingAssistent',
      description: 'Optimaliseer je dating profiel met AI-gedreven analyse. Foto tips, bio optimalisatie, en persoonlijkheid matching voor betere matches.',
      keywords: ['profiel optimalisatie', 'dating profiel', 'foto tips', 'bio schrijven', 'persoonlijkheid matching'],
      ogType: 'website',
      structuredData: this.generateToolStructuredData('Profiel Suite', 'AI-gedreven profiel optimalisatie'),
    },

    'communication-hub': {
      title: 'Communicatie Hub - Betere Conversaties & Connecties | DatingAssistent',
      description: 'Leer effectief communiceren in dating. Conversation starters, flirting tips, en conflict resolution voor gezonde relaties.',
      keywords: ['communicatie skills', 'conversation starters', 'flirting tips', 'relatie communicatie', 'conflicten oplossen'],
      ogType: 'website',
      structuredData: this.generateToolStructuredData('Communicatie Hub', 'Verbeter je communicatie skills'),
    },

    'relationship-coach': {
      title: 'AI Relationship Coach - Persoonlijke Relatiebegeleiding | DatingAssistent',
      description: '24/7 AI relatie coach voor advies, inzichten, en begeleiding. Persoonlijke coaching gebaseerd op je unieke situatie en behoeften.',
      keywords: ['AI coach', 'relatie advies', 'persoonlijke coaching', 'relatieproblemen', 'liefdesleven'],
      ogType: 'website',
      structuredData: this.generateServiceStructuredData('AI Relationship Coach', 'Persoonlijke AI-gedreven relatiebegeleiding'),
    },

    login: {
      title: 'Inloggen - DatingAssistent',
      description: 'Log in op je DatingAssistent account voor toegang tot je persoonlijke dashboard en tools.',
      noIndex: true,
    },

    register: {
      title: 'Registreren - Start Jouw Dating Transformatie | DatingAssistent',
      description: 'Maak een gratis account aan en begin je journey naar betere dates en relaties met DatingAssistent.',
      keywords: ['registreren', 'gratis account', 'dating transformatie', 'beginnen'],
    },

    pricing: {
      title: 'Prijzen & Abonnementen - DatingAssistent Premium',
      description: 'Kies het juiste abonnement voor jouw dating doelen. Van gratis tools tot premium AI coaching en persoonlijke begeleiding.',
      keywords: ['prijzen', 'abonnementen', 'premium', 'kosten', 'tarieven'],
      structuredData: this.generatePricingStructuredData(),
    },

    blog: {
      title: 'Dating Blog - Tips, Advies & Inzichten | DatingAssistent',
      description: 'Gratis dating tips, relatie advies, en inzichten van experts. Leer meer over moderne liefde, communicatie, en persoonlijke groei.',
      keywords: ['dating blog', 'relatie tips', 'liefdesleven', 'persoonlijke ontwikkeling', 'relatie advies'],
      ogType: 'website',
      structuredData: this.generateBlogStructuredData(),
    },

    contact: {
      title: 'Contact - Neem Contact Op | DatingAssistent',
      description: 'Heb je vragen of feedback? Neem contact op met het DatingAssistent team. We helpen je graag verder met je dating journey.',
      keywords: ['contact', 'support', 'hulp', 'vragen', 'feedback'],
    },

    privacy: {
      title: 'Privacy Policy - Hoe Wij Jouw Data Beschermen | DatingAssistent',
      description: 'Lees onze privacy policy om te begrijpen hoe we jouw persoonlijke gegevens beschermen en gebruiken voor de beste dating ervaring.',
      keywords: ['privacy policy', 'gegevensbescherming', 'AVG', 'privacy', 'veiligheid'],
    },

    terms: {
      title: 'Algemene Voorwaarden - Gebruiksvoorwaarden | DatingAssistent',
      description: 'Onze algemene voorwaarden en gebruiksvoorwaarden voor het gebruik van DatingAssistent diensten en platform.',
      keywords: ['voorwaarden', 'terms of service', 'gebruiksvoorwaarden', 'algemene voorwaarden'],
    },
  };

  /**
   * Optimize title for SEO (50-60 characters ideal)
   */
  private static optimizeTitle(title: string): string {
    if (title.length <= 60) return title;

    // Try to cut at word boundary
    const words = title.split(' ');
    let optimized = '';

    for (const word of words) {
      if ((optimized + ' ' + word).length > 55) break;
      optimized += (optimized ? ' ' : '') + word;
    }

    return optimized || title.slice(0, 57) + '...';
  }

  /**
   * Optimize description for SEO (150-160 characters ideal)
   */
  private static optimizeDescription(description: string): string {
    if (description.length <= 160) return description;

    // Cut at word boundary
    const words = description.split(' ');
    let optimized = '';

    for (const word of words) {
      if ((optimized + ' ' + word).length > 155) break;
      optimized += (optimized ? ' ' : '') + word;
    }

    return optimized || description.slice(0, 157) + '...';
  }

  /**
   * Generate organization structured data
   */
  private static generateOrganizationStructuredData() {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: this.SITE_CONFIG.name,
      description: this.SITE_CONFIG.description,
      url: this.SITE_CONFIG.url,
      logo: `${this.SITE_CONFIG.url}/logo.png`,
      sameAs: [
        'https://twitter.com/datingassistent',
        'https://linkedin.com/company/datingassistent',
        'https://facebook.com/datingassistent',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+31-20-1234567',
        contactType: 'customer service',
        availableLanguage: 'Dutch',
      },
      offers: {
        '@type': 'Offer',
        category: 'Dating Coaching Services',
        description: 'AI-powered dating coaching and relationship advice',
      },
    };
  }

  /**
   * Generate tool structured data
   */
  private static generateToolStructuredData(name: string, description: string) {
    return {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name,
      description,
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Web Browser',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'EUR',
      },
      provider: {
        '@type': 'Organization',
        name: this.SITE_CONFIG.name,
      },
    };
  }

  /**
   * Generate service structured data
   */
  private static generateServiceStructuredData(name: string, description: string) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name,
      description,
      provider: {
        '@type': 'Organization',
        name: this.SITE_CONFIG.name,
      },
      serviceType: 'Dating Coaching',
      areaServed: 'Netherlands',
    };
  }

  /**
   * Generate pricing structured data
   */
  private static generatePricingStructuredData() {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'DatingAssistent Premium',
      description: 'Premium AI-powered dating coaching service',
      offers: [
        {
          '@type': 'Offer',
          name: 'Free Plan',
          price: '0',
          priceCurrency: 'EUR',
          description: 'Basic dating tools and assessment',
        },
        {
          '@type': 'Offer',
          name: 'Premium Plan',
          price: '9.99',
          priceCurrency: 'EUR',
          billingDuration: 'P1M',
          description: 'Full AI coaching and premium tools',
        },
      ],
    };
  }

  /**
   * Generate blog structured data
   */
  private static generateBlogStructuredData() {
    return {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'DatingAssistent Blog',
      description: 'Expert dating tips, relationship advice, and personal growth insights',
      url: `${this.SITE_CONFIG.url}/blog`,
      publisher: {
        '@type': 'Organization',
        name: this.SITE_CONFIG.name,
      },
    };
  }

  /**
   * Generate sitemap XML
   */
  static generateSitemap(pages: PageSEOConfig[]): string {
    const urlset = pages.map(page => {
      const url = `${this.SITE_CONFIG.url}${page.path}`;
      const lastmod = new Date().toISOString().split('T')[0];

      return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changeFrequency || 'weekly'}</changefreq>
    <priority>${page.priority || 0.5}</priority>
  </url>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlset}
</urlset>`;
  }

  /**
   * Generate robots.txt
   */
  static generateRobotsTxt(): string {
    return `User-agent: *
Allow: /

# Block admin and private areas
Disallow: /admin/
Disallow: /api/admin/
Disallow: /dashboard/
Disallow: /api/user/
Disallow: /api/auth/

# Allow important resources
Allow: /api/health
Allow: /api/public/

# Sitemap
Sitemap: ${this.SITE_CONFIG.url}/sitemap.xml

# Crawl delay for respectful crawling
Crawl-delay: 1`;
  }

  /**
   * Get SEO config for a specific page
   */
  static getPageConfig(pageKey: string): SEOMetadata | null {
    return this.pageConfigs[pageKey] || null;
  }

  /**
   * Create dynamic SEO config for user-generated content
   */
  static createDynamicSEO(title: string, description: string, path: string, options: Partial<SEOMetadata> = {}): SEOMetadata {
    return {
      title: `${title} | ${this.SITE_CONFIG.name}`,
      description: description.slice(0, 160),
      canonical: path,
      keywords: this.DEFAULT_KEYWORDS,
      ...options,
    };
  }
}

export default SEOManager;