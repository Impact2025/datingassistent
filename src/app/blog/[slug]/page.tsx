import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import DOMPurify from 'isomorphic-dompurify';
import { getBlogPostBySlug, getLatestBlogPosts } from '@/lib/db-operations';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Calendar, Clock, Eye, Tag, User } from 'lucide-react';
import ReadingProgressBar from '../_components/reading-progress';
import SocialShareButtons from '../_components/social-share';
import ViewCounter from '../_components/view-counter';
import '../blog.styles.css';

// ISR: pagina wordt elke uur opnieuw gegenereerd op de server
export const revalidate = 3600;
// Nieuwe slugs die niet bij build bestaan worden alsnog server-side gegenereerd
export const dynamicParams = true;

// Pre-genereer alle gepubliceerde blog slugs bij build voor maximale SEO-performance
export async function generateStaticParams() {
  try {
    const { sql } = await import('@vercel/postgres');
    const result = await sql`SELECT slug FROM blogs WHERE published = true`;
    return result.rows.map((row: { slug: string }) => ({ slug: row.slug }));
  } catch {
    return [];
  }
}

// Metadata wordt server-side gegenereerd — Googlebot ziet title, description,
// Open Graph en canonical URL direct in de HTML zonder JavaScript nodig te hebben
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogPostBySlug(slug);
  if (!blog) return {};

  const title = blog.seo_title || blog.title;
  const description = blog.seo_description || blog.excerpt;
  const shareUrl = `https://datingassistent.nl/blog/${slug}`;
  const publishedTime = new Date(blog.published_at || blog.created_at).toISOString();
  const modifiedTime = blog.updated_at
    ? new Date(blog.updated_at).toISOString()
    : publishedTime;
  const allTags = [...(blog.tags || []), ...(blog.keywords || [])];

  return {
    title,
    description,
    keywords: allTags.join(', '),
    alternates: { canonical: shareUrl },
    openGraph: {
      title: blog.social_title || title,
      description: blog.social_description || description,
      type: 'article',
      url: shareUrl,
      publishedTime,
      modifiedTime,
      authors: [blog.author || 'DatingAssistent'],
      section: blog.category || 'Dating',
      tags: allTags,
      ...(blog.cover_image_url && {
        images: [
          {
            url: blog.cover_image_url,
            width: 1200,
            height: 630,
            alt: blog.cover_image_alt || title,
          },
        ],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.social_title || title,
      description: blog.social_description || description,
      ...(blog.cover_image_url && { images: [blog.cover_image_url] }),
    },
    // Ongepubliceerde posts (admin preview) niet indexeren
    ...(blog.published === false && {
      robots: { index: false, follow: false },
    }),
  };
}

function adjustColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}

function calculateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = await getBlogPostBySlug(slug);

  // Gooit automatisch de Next.js 404 pagina — correct HTTP 404 status voor Googlebot
  if (!blog) notFound();

  const latestPosts = await getLatestBlogPosts(6);
  const relatedPosts = latestPosts
    .filter((p: any) => p.slug !== slug)
    .slice(0, 3);

  const shareUrl = `https://datingassistent.nl/blog/${slug}`;
  const pageTitle = blog.seo_title || blog.title;
  const pageDescription = blog.seo_description || blog.excerpt;
  const publishedDate = new Date(blog.published_at || blog.created_at).toISOString();
  const updatedDate = blog.updated_at
    ? new Date(blog.updated_at).toISOString()
    : publishedDate;
  const readingTime = blog.reading_time || calculateReadingTime(blog.content);
  const allTags = [...(blog.tags || []), ...(blog.keywords || [])];

  const blogPostSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: { '@type': 'WebPage', '@id': shareUrl },
    headline: pageTitle,
    description: pageDescription,
    ...(blog.cover_image_url && {
      image: { '@type': 'ImageObject', url: blog.cover_image_url, width: 1200, height: 630 },
    }),
    datePublished: publishedDate,
    dateModified: updatedDate,
    author: {
      '@type': 'Person',
      name: blog.author || 'DatingAssistent',
      ...(blog.author_bio && { description: blog.author_bio }),
      ...(blog.author_avatar && { image: blog.author_avatar }),
    },
    publisher: {
      '@type': 'Organization',
      name: 'DatingAssistent',
      logo: { '@type': 'ImageObject', url: 'https://datingassistent.nl/logo.png' },
    },
    keywords: allTags.join(', '),
    articleSection: blog.category || 'Dating Advice',
    wordCount: blog.content?.split(/\s+/).filter((w: string) => w.length > 0).length || 0,
    timeRequired: `PT${readingTime}M`,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://datingassistent.nl' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://datingassistent.nl/blog' },
      { '@type': 'ListItem', position: 3, name: blog.title, item: shareUrl },
    ],
  };

  const safeContent = DOMPurify.sanitize(blog.content, {
    ALLOWED_TAGS: [
      'p', 'br', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'code', 'pre',
      'img', 'figure', 'figcaption',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span', 'section', 'article',
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'class', 'id',
      'target', 'rel', 'width', 'height', 'style',
    ],
  });

  return (
    <>
      {/* Schema.org structured data — zichtbaar voor Googlebot in HTML */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Client-only interactieve onderdelen */}
      <ReadingProgressBar />
      <ViewCounter slug={slug} />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-coral-50/30 to-coral-50/30">
        {/* Header: kleur OF afbeelding */}
        {blog.header_type === 'color' ? (
          <div
            className="relative h-80 flex items-center justify-center overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${blog.header_color}, ${adjustColor(blog.header_color || '#FF7B54', -20)})`,
            }}
          >
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative z-10 container mx-auto px-4 text-center">
              <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-2xl max-w-4xl mx-auto">
                {blog.header_title || blog.title}
              </h1>
            </div>
          </div>
        ) : blog.cover_image_url ? (
          <div className="relative h-96 overflow-hidden">
            <img
              src={blog.cover_image_url}
              alt={blog.cover_image_alt || blog.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        ) : null}

        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Link
            href="/blog"
            className="inline-flex items-center mb-6 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Terug naar blog
          </Link>

          <header className="mb-8">
            <div className="flex flex-wrap gap-3 mb-4">
              {blog.category && (
                <Badge className="bg-coral-100 text-coral-700 hover:bg-coral-200">
                  {blog.category}
                </Badge>
              )}
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="mr-1 h-4 w-4" />
                {new Date(blog.published_at || blog.created_at).toLocaleDateString('nl-NL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="mr-1 h-4 w-4" />
                {readingTime} min leestijd
              </div>
              {(blog.view_count || 0) > 0 && (
                <div className="flex items-center text-sm text-gray-600">
                  <Eye className="mr-1 h-4 w-4" />
                  {blog.view_count} views
                </div>
              )}
            </div>

            {blog.header_type !== 'color' && (
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                {blog.title}
              </h1>
            )}

            {blog.excerpt && (
              <p className="text-xl text-gray-600 leading-relaxed mb-6">{blog.excerpt}</p>
            )}

            {allTags.slice(0, 8).length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {allTags.slice(0, 8).map((tag: string, idx: number) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="text-xs bg-coral-50 text-coral-700 border-coral-200"
                  >
                    <Tag className="mr-1 h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <SocialShareButtons
              url={shareUrl}
              title={blog.social_title || pageTitle}
              description={blog.social_description || pageDescription}
            />
          </header>

          {/* Volledige artikel content — server-side gerenderd, direct zichtbaar voor Googlebot */}
          <article
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-coral-600 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700"
            dangerouslySetInnerHTML={{ __html: safeContent }}
          />

          {(blog.author_bio || blog.author_avatar) && (
            <Card className="mt-12 border-coral-100 bg-gradient-to-br from-coral-50 to-coral-100">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {blog.author_avatar ? (
                    <img
                      src={blog.author_avatar}
                      alt={blog.author}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-coral-400 to-coral-600 flex items-center justify-center">
                      <User className="h-8 w-8 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">
                      {blog.author || 'DatingAssistent'}
                    </h3>
                    {blog.author_bio && (
                      <p className="text-gray-600 mt-2">{blog.author_bio}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {relatedPosts.length > 0 && (
            <section className="mt-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Gerelateerde Artikelen</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((post: any) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                      {post.cover_image_url && (
                        <img
                          src={post.cover_image_url}
                          alt={post.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                      )}
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-coral-600">
                          {post.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
