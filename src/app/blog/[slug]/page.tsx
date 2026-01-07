"use client";

/**
 * WERELDKLASSE BLOG POST PAGE
 *
 * Features:
 * - Rich SEO metadata (Open Graph, Twitter Cards, Schema.org)
 * - Header display (image OR color background)
 * - Reading time & progress indicator
 * - Social sharing buttons
 * - Author bio
 * - Related posts by tags
 * - Breadcrumb navigation
 * - Mobile optimized
 */

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Head from 'next/head';
import DOMPurify from 'isomorphic-dompurify';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Calendar,
  Tag,
  Eye,
  Clock,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  User
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import '../blog.styles.css';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;

  // Images
  cover_image_url?: string;
  cover_image_alt?: string;
  featured_image?: string; // Legacy

  // Header
  header_type: 'image' | 'color';
  header_color?: string;
  header_title?: string;

  // SEO
  seo_title?: string;
  seo_description?: string;
  slug: string;
  keywords: string[];
  tags: string[];

  // Social
  social_title?: string;
  social_description?: string;

  // Category & metadata
  category?: string;
  reading_time?: number;

  // Author
  author?: string;
  author_bio?: string;
  author_avatar?: string;

  // Timestamps
  created_at: any;
  updated_at?: any;
  published_at?: any;

  // Analytics
  view_count?: number;
  published?: boolean;
}

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const slug = params.slug as string;

  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [readingProgress, setReadingProgress] = useState(0);

  // =========================================================================
  // FETCH BLOG DATA
  // =========================================================================

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await fetch(`/api/blogs/${slug}`);

        if (!response.ok) {
          throw new Error('Blog niet gevonden');
        }

        const data = await response.json();
        const blogData = data.blog;

        // Map database fields
        const mappedBlog: BlogPost = {
          id: blogData.id,
          title: blogData.title,
          content: blogData.content,
          excerpt: blogData.excerpt,
          cover_image_url: blogData.cover_image_url || blogData.featured_image || blogData.image,
          cover_image_alt: blogData.cover_image_alt,
          header_type: blogData.header_type || 'image',
          header_color: blogData.header_color || '#ec4899',
          header_title: blogData.header_title,
          seo_title: blogData.seo_title,
          seo_description: blogData.seo_description,
          slug: blogData.slug,
          keywords: blogData.keywords || [],
          tags: blogData.tags || [],
          social_title: blogData.social_title,
          social_description: blogData.social_description,
          category: blogData.category,
          reading_time: blogData.reading_time || calculateReadingTime(blogData.content),
          author: blogData.author || 'DatingAssistent',
          author_bio: blogData.author_bio,
          author_avatar: blogData.author_avatar,
          created_at: blogData.created_at,
          updated_at: blogData.updated_at,
          published_at: blogData.published_at,
          view_count: blogData.view_count || 0,
          published: blogData.published,
          featured_image: blogData.featured_image,
        };

        setBlog(mappedBlog);

        // Increment view count
        fetch(`/api/blogs/${slug}/view`, { method: 'POST' }).catch(console.error);

        // Fetch related posts by tags
        if (mappedBlog.tags && mappedBlog.tags.length > 0) {
          const relatedResponse = await fetch(`/api/blogs?tags=${mappedBlog.tags.slice(0, 3).join(',')}&limit=3`);
          if (relatedResponse.ok) {
            const relatedData = await relatedResponse.json();
            setRelatedPosts(relatedData.filter((p: any) => p.slug !== slug).slice(0, 3));
          }
        }
      } catch (error) {
        console.error('Error fetching blog:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  // =========================================================================
  // READING PROGRESS
  // =========================================================================

  useEffect(() => {
    const handleScroll = () => {
      const article = document.querySelector('article');
      if (!article) return;

      const articleTop = article.offsetTop;
      const articleHeight = article.offsetHeight;
      const windowHeight = window.innerHeight;
      const scrollTop = window.scrollY;

      const progress = Math.min(
        100,
        Math.max(0, ((scrollTop - articleTop + windowHeight) / articleHeight) * 100)
      );

      setReadingProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [blog]);

  // =========================================================================
  // SOCIAL SHARING
  // =========================================================================

  const shareUrl = `https://datingassistent.nl/blog/${slug}`;
  const shareTitle = blog?.social_title || blog?.title || '';
  const shareDescription = blog?.social_description || blog?.excerpt || '';

  const handleShare = (platform: string) => {
    let url = '';

    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        toast({
          title: 'Link gekopieerd!',
          description: 'De link is naar je klembord gekopieerd',
        });
        return;
    }

    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  // =========================================================================
  // HELPERS
  // =========================================================================

  function calculateReadingTime(content: string): number {
    const words = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
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

  // =========================================================================
  // LOADING & ERROR STATES
  // =========================================================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Blog niet gevonden</h1>
        <Button onClick={() => router.push('/blog')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Terug naar blog
        </Button>
      </div>
    );
  }

  // =========================================================================
  // SEO DATA
  // =========================================================================

  const pageTitle = blog.seo_title || blog.title;
  const pageDescription = blog.seo_description || blog.excerpt;
  const pageImage = blog.cover_image_url;
  const publishedDate = blog.published_at ? new Date(blog.published_at).toISOString() : new Date(blog.created_at).toISOString();
  const updatedDate = blog.updated_at ? new Date(blog.updated_at).toISOString() : publishedDate;

  // Schema.org structured data
  const blogPostSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": shareUrl
    },
    "headline": pageTitle,
    "description": pageDescription,
    "image": pageImage ? {
      "@type": "ImageObject",
      "url": pageImage,
      "width": 1200,
      "height": 630
    } : undefined,
    "datePublished": publishedDate,
    "dateModified": updatedDate,
    "author": {
      "@type": "Person",
      "name": blog.author || 'DatingAssistent',
      "description": blog.author_bio,
      "image": blog.author_avatar
    },
    "publisher": {
      "@type": "Organization",
      "name": "DatingAssistent",
      "logo": {
        "@type": "ImageObject",
        "url": "https://datingassistent.nl/logo.png"
      }
    },
    "keywords": [...blog.keywords, ...blog.tags].join(', '),
    "articleSection": blog.category || "Dating Advice",
    "wordCount": blog.content?.split(/\s+/).filter((w: string) => w.length > 0).length || 0,
    "timeRequired": `PT${blog.reading_time || 5}M`
  };

  // Breadcrumb schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://datingassistent.nl"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": "https://datingassistent.nl/blog"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": blog.title,
        "item": shareUrl
      }
    ]
  };

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <>
      <Head>
        {/* Basic SEO */}
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={[...blog.keywords, ...blog.tags].join(', ')} />
        <link rel="canonical" href={shareUrl} />

        {/* Open Graph */}
        <meta property="og:title" content={blog.social_title || pageTitle} />
        <meta property="og:description" content={blog.social_description || pageDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={shareUrl} />
        {pageImage && <meta property="og:image" content={pageImage} />}
        <meta property="article:published_time" content={publishedDate} />
        <meta property="article:modified_time" content={updatedDate} />
        <meta property="article:author" content={blog.author || 'DatingAssistent'} />
        <meta property="article:section" content={blog.category || 'Dating'} />
        {blog.tags.map((tag, i) => (
          <meta key={i} property="article:tag" content={tag} />
        ))}

        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={blog.social_title || pageTitle} />
        <meta name="twitter:description" content={blog.social_description || pageDescription} />
        {pageImage && <meta name="twitter:image" content={pageImage} />}

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      </Head>

      {/* Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-pink-500 to-pink-600 z-50 transition-all duration-150"
        style={{ width: `${readingProgress}%` }}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-pink-50/30 to-pink-50/30">
        {/* Header - Image OR Color */}
        {blog.header_type === 'color' ? (
          <div
            className="relative h-80 flex items-center justify-center overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${blog.header_color}, ${adjustColor(blog.header_color || '#ec4899', -20)})`,
            }}
          >
            <div className="absolute inset-0 bg-black/20"></div>
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          </div>
        ) : null}

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => router.push('/blog')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Terug naar blog
          </Button>

          {/* Article Header */}
          <header className="mb-8">
            {/* Metadata */}
            <div className="flex flex-wrap gap-3 mb-4">
              {blog.category && (
                <Badge className="bg-pink-100 text-pink-700 hover:bg-pink-200">
                  {blog.category}
                </Badge>
              )}
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="mr-1 h-4 w-4" />
                {new Date(blog.published_at || blog.created_at).toLocaleDateString('nl-NL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="mr-1 h-4 w-4" />
                {blog.reading_time || 5} min leestijd
              </div>
              {blog.view_count !== undefined && blog.view_count > 0 && (
                <div className="flex items-center text-sm text-gray-600">
                  <Eye className="mr-1 h-4 w-4" />
                  {blog.view_count} views
                </div>
              )}
            </div>

            {/* Title (if not in header) */}
            {blog.header_type !== 'color' && (
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                {blog.title}
              </h1>
            )}

            {/* Excerpt */}
            {blog.excerpt && (
              <p className="text-xl text-gray-600 leading-relaxed mb-6">
                {blog.excerpt}
              </p>
            )}

            {/* Tags */}
            {(blog.tags.length > 0 || blog.keywords.length > 0) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {[...blog.tags, ...blog.keywords].slice(0, 8).map((tag, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="text-xs bg-pink-50 text-pink-700 border-pink-200"
                  >
                    <Tag className="mr-1 h-3 w-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Social Share Buttons */}
            <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200">
              <span className="text-sm font-medium text-gray-700 flex items-center">
                <Share2 className="mr-2 h-4 w-4" />
                Delen:
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleShare('facebook')}
                className="hover:bg-blue-50 hover:text-blue-600"
              >
                <Facebook className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleShare('twitter')}
                className="hover:bg-sky-50 hover:text-sky-600"
              >
                <Twitter className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleShare('linkedin')}
                className="hover:bg-blue-50 hover:text-blue-700"
              >
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleShare('copy')}
                className="hover:bg-gray-100"
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
            </div>
          </header>

          {/* Article Content */}
          <article
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-pink-600 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(blog.content, {
                ALLOWED_TAGS: [
                  'p', 'br', 'b', 'i', 'em', 'strong', 'a', 'ul', 'ol', 'li',
                  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                  'blockquote', 'code', 'pre',
                  'img', 'figure', 'figcaption',
                  'table', 'thead', 'tbody', 'tr', 'th', 'td',
                  'div', 'span', 'section', 'article'
                ],
                ALLOWED_ATTR: [
                  'href', 'src', 'alt', 'title', 'class', 'id',
                  'target', 'rel', 'width', 'height', 'style'
                ],
              })
            }}
          />

          {/* Author Bio */}
          {(blog.author_bio || blog.author_avatar) && (
            <Card className="mt-12 border-pink-100 bg-gradient-to-br from-pink-50 to-pink-100">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {blog.author_avatar ? (
                    <img
                      src={blog.author_avatar}
                      alt={blog.author}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-400 to-pink-600 flex items-center justify-center">
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

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="mt-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Gerelateerde Artikelen</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((post: any) => (
                  <Card
                    key={post.slug}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => router.push(`/blog/${post.slug}`)}
                  >
                    {post.cover_image_url && (
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-pink-600">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
