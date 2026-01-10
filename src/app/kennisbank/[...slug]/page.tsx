/**
 * Kennisbank Article Page
 * Dynamische route voor individuele kennisbank artikelen
 * Wereldklasse versie met TOC, reading progress, feedback, en meer
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Clock,
  Calendar,
  User,
  BookOpen,
  ArrowRight,
  MessageCircle,
  ChevronRight,
} from 'lucide-react';
import {
  getKennisbankArticle,
  getRelatedArticles,
  getAllKennisbankSlugs,
  getAdjacentArticles,
  extractHeadingsFromContent,
} from '@/lib/kennisbank';

// Client components
import { TableOfContents } from '@/components/kennisbank/table-of-contents';
import { ReadingProgress } from '@/components/kennisbank/reading-progress';
import { ArticleFeedback } from '@/components/kennisbank/article-feedback';
import { ArticleNavigation } from '@/components/kennisbank/article-navigation';
import { BookmarkButton } from '@/components/kennisbank/bookmark-button';
import { ShareButton } from '@/components/kennisbank/share-button';
import { KennisbankArticleSchema } from '@/components/kennisbank/article-schema';

interface PageProps {
  params: Promise<{
    slug: string[];
  }>;
}

// Generate static params for all articles
export async function generateStaticParams() {
  const slugs = getAllKennisbankSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

// Generate metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getKennisbankArticle(slug);

  if (!article) {
    return {
      title: 'Artikel niet gevonden | DatingAssistent',
    };
  }

  const canonicalUrl = `https://datingassistent.nl/kennisbank/${article.slug}`;

  return {
    title: `${article.title} | Kennisbank | DatingAssistent`,
    description: article.description,
    keywords: article.keywords?.join(', '),
    authors: [{ name: article.author }],
    openGraph: {
      title: article.title,
      description: article.description,
      type: 'article',
      publishedTime: article.date,
      authors: [article.author],
      url: canonicalUrl,
      siteName: 'DatingAssistent',
      locale: 'nl_NL',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
    },
    alternates: {
      canonical: canonicalUrl,
    },
    other: {
      'article:section': article.pillar || 'Dating',
      'article:tag': article.keywords?.join(',') || '',
    },
  };
}

// Custom heading component that adds IDs for TOC linking
function HeadingWithId({ level, children, ...props }: { level: number; children: React.ReactNode }) {
  const text = typeof children === 'string' ? children : '';
  const id = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  return <Tag id={id} {...props}>{children}</Tag>;
}

export default async function KennisbankArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getKennisbankArticle(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = getRelatedArticles(article, 3);
  const { previous, next } = getAdjacentArticles(article);
  const headings = extractHeadingsFromContent(article.content);
  const slugPath = Array.isArray(slug) ? slug.join('/') : slug;

  // Build breadcrumbs
  const breadcrumbs = [
    { label: 'Kennisbank', href: '/kennisbank' },
  ];

  if (slug.length > 1) {
    breadcrumbs.push({
      label: slug[0].replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      href: `/kennisbank/${slug[0]}`,
    });
  }

  const showTOC = headings.length >= 3;

  return (
    <div className="min-h-screen bg-background">
      {/* Schema.org Structured Data */}
      <KennisbankArticleSchema
        article={article}
        breadcrumbs={breadcrumbs.map(b => ({ name: b.label, url: b.href }))}
      />

      {/* Reading Progress Bar */}
      <ReadingProgress
        targetSelector="article"
        showPercentage={true}
        showTimeRemaining={true}
        readingTime={article.readingTime}
      />

      <PublicHeader />

      {/* Breadcrumbs */}
      <nav className="py-4 px-4 sm:px-6 lg:px-8 bg-muted/30 border-b">
        <div className="max-w-6xl mx-auto">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <li>
              <Link href="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
            </li>
            {breadcrumbs.map((crumb) => (
              <li key={crumb.href} className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4" />
                <Link
                  href={crumb.href}
                  className="hover:text-foreground transition-colors capitalize"
                >
                  {crumb.label}
                </Link>
              </li>
            ))}
            <li className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground font-medium line-clamp-1">
                {article.title.split(':')[0]}
              </span>
            </li>
          </ol>
        </div>
      </nav>

      {/* Article Header */}
      <header className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/kennisbank"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Terug naar kennisbank
          </Link>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            {article.type === 'pillar' && (
              <Badge variant="default" className="bg-primary">Complete Gids</Badge>
            )}
            {article.pillar && (
              <Badge variant="outline" className="capitalize">
                {article.pillar.replace(/-/g, ' ')}
              </Badge>
            )}
            {article.keywords?.slice(0, 3).map((keyword) => (
              <Badge key={keyword} variant="secondary" className="text-xs">
                {keyword}
              </Badge>
            ))}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            {article.title}
          </h1>

          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            {article.description}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4 pb-8 border-b">
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {article.author}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(article.date).toLocaleDateString('nl-NL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {article.readingTime} min leestijd
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <BookmarkButton
                articleSlug={article.slug}
                articleTitle={article.title}
                variant="icon"
              />
              <ShareButton
                title={article.title}
                description={article.description}
                variant="icon"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className={`grid gap-8 ${showTOC ? 'lg:grid-cols-[1fr_280px]' : ''}`}>
            {/* Article Content */}
            <article className="min-w-0">
              <div className="prose prose-lg dark:prose-invert max-w-none
                prose-headings:font-semibold prose-headings:text-foreground prose-headings:scroll-mt-24
                prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
                prose-p:text-muted-foreground prose-p:leading-relaxed
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-strong:text-foreground prose-strong:font-semibold
                prose-ul:text-muted-foreground prose-ol:text-muted-foreground
                prose-li:marker:text-primary
                prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-1 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
                prose-hr:border-border
              ">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Custom heading components with IDs for TOC
                    h2: ({ children, ...props }) => (
                      <HeadingWithId level={2} {...props}>{children}</HeadingWithId>
                    ),
                    h3: ({ children, ...props }) => (
                      <HeadingWithId level={3} {...props}>{children}</HeadingWithId>
                    ),
                    // Custom link handling for internal links
                    a: ({ href, children, ...props }) => {
                      const isInternal = href?.startsWith('/');
                      if (isInternal) {
                        return (
                          <Link href={href || '#'} {...props}>
                            {children}
                          </Link>
                        );
                      }
                      return (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          {...props}
                        >
                          {children}
                        </a>
                      );
                    },
                    // Custom blockquote for tips
                    blockquote: ({ children, ...props }) => {
                      const content = String(children);
                      const isTip = content.includes('Iris-tip') || content.includes('💡');
                      return (
                        <blockquote
                          className={isTip ? 'bg-primary/5 border-l-primary' : ''}
                          {...props}
                        >
                          {children}
                        </blockquote>
                      );
                    },
                  }}
                >
                  {article.content}
                </ReactMarkdown>
              </div>

              {/* Article Navigation (Prev/Next) */}
              {(previous || next) && (
                <div className="mt-12 pt-8 border-t">
                  <h3 className="text-sm font-medium text-muted-foreground mb-4">
                    Meer in deze serie
                  </h3>
                  <ArticleNavigation
                    previousArticle={previous}
                    nextArticle={next}
                  />
                </div>
              )}

              {/* Article Feedback */}
              <div className="mt-12">
                <ArticleFeedback
                  articleSlug={article.slug}
                  articleTitle={article.title}
                />
              </div>
            </article>

            {/* Sidebar with TOC */}
            {showTOC && (
              <aside className="hidden lg:block">
                <TableOfContents
                  headings={headings}
                  className="sticky top-24"
                />
              </aside>
            )}
          </div>
        </div>
      </div>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-muted/30 border-t">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-semibold text-foreground mb-8 flex items-center gap-2">
              <BookOpen className="w-6 h-6" />
              Gerelateerde artikelen
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedArticles.map((related) => (
                <Link key={related.slug} href={`/kennisbank/${related.slug}`}>
                  <Card className="h-full hover:shadow-md transition-all duration-200 hover:border-primary/50 group">
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        {related.type === 'pillar' && (
                          <Badge variant="default" className="text-xs">
                            Gids
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {related.readingTime} min
                        </span>
                      </div>
                      <CardTitle className="text-base group-hover:text-primary transition-colors line-clamp-2">
                        {related.title.split(':')[0]}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {related.description}
                      </p>
                      <span className="inline-flex items-center gap-1 text-sm text-primary mt-4 font-medium">
                        Lees meer
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Wil je persoonlijk advies?
          </h2>
          <p className="text-muted-foreground mb-6">
            Iris, onze AI-coach, kan je helpen met advies afgestemd op jouw specifieke situatie.
          </p>
          <Link
            href="/help?chat=open"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            <MessageCircle className="w-5 h-5" />
            Praat met Iris
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
