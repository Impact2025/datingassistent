import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Tag } from 'lucide-react';
import { sql } from '@/lib/db';
import { getAllBlogsFromJson } from '@/lib/blog-json-fallback';
import { BlogSearchBar } from './_components/blog-search-bar';
import './blog.styles.css';

// ISR: elke pagina wordt max eens per uur opnieuw gegenereerd
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Dating Blog - Tips voor Succesvol Online Daten | DatingAssistent',
  description: 'Ontdek de beste tips, tricks en verhalen voor succesvol online daten. Van profiel optimalisatie tot de eerste date: jouw dating kenniscentrum.',
  keywords: 'dating tips, online daten, datingprofiel, matchen, relatie, datingsite, dating app, datingsucces',
  alternates: { canonical: 'https://datingassistent.nl/blog' },
  openGraph: {
    title: 'Dating Blog - Tips voor Succesvol Online Daten | DatingAssistent',
    description: 'De beste dating tips en verhalen voor singles in Nederland.',
    type: 'website',
    url: 'https://datingassistent.nl/blog',
    siteName: 'DatingAssistent',
    locale: 'nl_NL',
    images: [{ url: 'https://datingassistent.nl/og-image.png', width: 1200, height: 630, alt: 'DatingAssistent Blog' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dating Blog | DatingAssistent',
    description: 'De beste dating tips voor singles in Nederland.',
    images: ['https://datingassistent.nl/og-image.png'],
  },
};

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  featured_image?: string;
  placeholder_text?: string;
  header_type?: string;
  header_color?: string;
  header_title?: string;
  slug: string;
  keywords: string[];
  category?: string;
  published_at?: string;
}

async function getPublishedBlogs(): Promise<BlogPost[]> {
  try {
    const result = await sql`
      SELECT
        id, slug, title, excerpt,
        image        AS featured_image,
        placeholder_text,
        header_type, header_color, header_title,
        category,    keywords,
        COALESCE(published_at, publish_date, created_at) AS published_at
      FROM blogs
      WHERE published = true
      ORDER BY published_at DESC
      LIMIT 200
    `;
    return result.rows.map((row) => ({
      ...row,
      keywords: typeof row.keywords === 'string'
        ? JSON.parse(row.keywords)
        : (row.keywords ?? []),
    })) as BlogPost[];
  } catch {
    // Fallback: lees uit blog_list.json (geen DB nodig)
    const jsonBlogs = getAllBlogsFromJson();
    if (jsonBlogs.length > 0) {
      return jsonBlogs.map((b) => ({
        id: String(b.id),
        slug: b.slug,
        title: b.title,
        excerpt: b.excerpt,
        featured_image: b.cover_image_url || b.image,
        placeholder_text: '',
        header_type: '',
        header_color: '',
        header_title: b.title,
        category: b.category || 'Dating Tips',
        keywords: b.keywords || [],
        published_at: b.publish_date || b.created_at,
      })) as BlogPost[];
    }
    return [];
  }
}

interface PageProps {
  searchParams: Promise<{ q?: string; tag?: string }>;
}

export default async function BlogPage({ searchParams }: PageProps) {
  const { q, tag } = await searchParams;
  let blogs = await getPublishedBlogs();

  // Server-side filtering — gefilterde pagina's zijn ook crawlbaar door Google
  if (q) {
    const query = q.toLowerCase();
    blogs = blogs.filter(
      (b) =>
        b.title.toLowerCase().includes(query) ||
        b.excerpt?.toLowerCase().includes(query) ||
        b.keywords?.some((k) => k.toLowerCase().includes(query))
    );
  }
  if (tag) {
    blogs = blogs.filter((b) => b.keywords?.includes(tag));
  }

  const allTags = Array.from(
    new Set(blogs.flatMap((b) => b.keywords ?? []))
  ).slice(0, 15);

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'DatingAssistent Blog',
    description: 'Tips en advies voor succesvol online daten in Nederland',
    url: 'https://datingassistent.nl/blog',
    publisher: {
      '@type': 'Organization',
      name: 'DatingAssistent',
      logo: { '@type': 'ImageObject', url: 'https://datingassistent.nl/logo.png' },
    },
    blogPost: blogs.slice(0, 20).map((blog) => ({
      '@type': 'BlogPosting',
      headline: blog.title,
      url: `https://datingassistent.nl/blog/${blog.slug}`,
      datePublished: blog.published_at,
      description: blog.excerpt,
      keywords: blog.keywords?.join(', '),
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://datingassistent.nl' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://datingassistent.nl/blog' },
      ...(tag ? [{ '@type': 'ListItem', position: 3, name: tag, item: `https://datingassistent.nl/blog?tag=${encodeURIComponent(tag)}` }] : []),
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coral-50 via-cream to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-coral-50 via-cream to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <Badge variant="outline" className="border-coral-200 dark:border-coral-700 text-coral-600 dark:text-coral-400 px-4 py-1">
              Dating Tips & Advies
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-50 leading-tight">
              Dating Blog{' '}
              <span className="text-[#B76E79]">& Inspiratie</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Ontdek de beste{' '}
              <strong className="text-gray-900 dark:text-gray-100">tips, tricks en verhalen</strong>{' '}
              voor succesvol online daten.
            </p>
            <Suspense>
              <BlogSearchBar defaultQuery={q} />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Tag filters — server-gerenderd als <Link> zodat Google ze kan crawlen */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-coral-100 to-coral-200 rounded-full">
              <Tag className="h-6 w-6 text-coral-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Ontdek Onderwerpen</h2>
          </div>
          <div className="flex gap-3 flex-wrap justify-center">
            <Link href="/blog">
              <Badge
                variant={!tag && !q ? 'default' : 'outline'}
                className="cursor-pointer px-4 py-2 text-sm font-medium hover:shadow-md transition-all duration-200"
              >
                ✨ Alle onderwerpen
              </Badge>
            </Link>
            {allTags.map((t) => (
              <Link key={t} href={`/blog?tag=${encodeURIComponent(t)}`}>
                <Badge
                  variant={tag === t ? 'default' : 'outline'}
                  className="cursor-pointer px-4 py-2 text-sm font-medium hover:shadow-md transition-all duration-200 hover:scale-105"
                >
                  {t}
                </Badge>
              </Link>
            ))}
          </div>
        </div>

        {/* Resultaten teller */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-sm dark:bg-gray-800/80">
            <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              {blogs.length} {blogs.length === 1 ? 'artikel' : 'artikelen'} gevonden
            </span>
            {tag && <span className="text-coral-600 font-medium">over &ldquo;{tag}&rdquo;</span>}
            {q && <span className="text-coral-600 font-medium">voor &ldquo;{q}&rdquo;</span>}
          </div>
        </div>

        {/* Blog grid — server-gerenderd met echte <Link> tags voor Google */}
        {blogs.length === 0 ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Geen artikelen gevonden</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Probeer een andere zoekopdracht of onderwerp.
              </p>
              <Link href="/blog" className="text-coral-600 hover:underline font-medium">
                ← Alle blogs bekijken
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <Link
                key={blog.slug}
                href={`/blog/${blog.slug}`}
                className="group block"
              >
                <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg h-full dark:bg-gray-800/80">
                  <div className="relative overflow-hidden">
                    <div className="aspect-[4/3] overflow-hidden">
                      {blog.featured_image ? (
                        <img
                          src={blog.featured_image}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center relative"
                          style={{
                            background: blog.header_color
                              ? `linear-gradient(135deg, ${blog.header_color}, ${blog.header_color}dd)`
                              : 'linear-gradient(135deg, #ff7b54, #667eea)',
                          }}
                        >
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                          <span className="text-xl md:text-2xl font-semibold text-white relative z-10 px-6 text-center leading-snug">
                            {blog.header_title || blog.placeholder_text || blog.title}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {blog.category && (
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-white/90 text-gray-800 hover:bg-white dark:bg-gray-900/90 dark:text-gray-100">
                          {blog.category}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6">
                    <CardTitle className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-coral-600 transition-colors duration-200 dark:text-gray-100">
                      {blog.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 leading-relaxed">
                      {blog.excerpt}
                    </CardDescription>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {blog.keywords?.slice(0, 3).map((keyword, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs bg-gradient-to-r from-coral-50 to-coral-100 text-coral-700 border-coral-200 dark:from-coral-900/30 dark:to-coral-800/30 dark:text-coral-300"
                        >
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>
                        {blog.published_at &&
                          new Date(blog.published_at).toLocaleDateString('nl-NL', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                      </span>
                      <span className="text-coral-600 font-medium group-hover:translate-x-1 transition-transform duration-200">
                        Lees meer →
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
