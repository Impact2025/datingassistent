"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Tag, Eye, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  incrementBlogViewCountUtil,
  getMostViewedBlogPostsUtil,
  getLatestBlogPostsUtil,
  getBlogPostBySlugUtil
} from '@/lib/blog-utils';
import '../blog.styles.css';
import Head from 'next/head';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import DOMPurify from 'isomorphic-dompurify';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  featured_image?: string;
  seo_title: string;
  seo_description: string;
  slug: string;
  keywords: string[];
  category?: string;
  created_at: any;
  updated_at?: any;
  view_count?: number;
  published?: boolean;
  published_at?: any;
}

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [mostViewedPosts, setMostViewedPosts] = useState<BlogPost[]>([]);
  const [latestPosts, setLatestPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        // Fetch the blog post by slug from Neon
        const blogData = await getBlogPostBySlugUtil(slug);
        
        if (blogData) {
          // Map the database fields to the interface fields
          const mappedBlog: BlogPost = {
            id: blogData.id,
            title: blogData.title,
            content: blogData.content,
            excerpt: blogData.excerpt,
            featured_image: blogData.featured_image,
            seo_title: blogData.seo_title,
            seo_description: blogData.seo_description,
            slug: blogData.slug,
            keywords: blogData.keywords || [],
            category: blogData.category,
            created_at: blogData.created_at,
            updated_at: blogData.updated_at,
            view_count: blogData.view_count,
            published: blogData.published,
            published_at: blogData.published_at
          };
          
          setBlog(mappedBlog);

          // Increment view count
          await incrementBlogViewCountUtil(slug);

          // For related posts, we'll fetch some posts from the same category
          // This is a simplified implementation - in a real app you might want more sophisticated logic
          const allPosts = await getLatestBlogPostsUtil(10);
          const related = allPosts
            .filter((post: any) => post.slug !== slug && post.category === blogData.category)
            .slice(0, 3);
          
          // Map related posts to the correct interface
          const mappedRelated = related.map((post: any) => ({
            id: post.id,
            title: post.title,
            content: post.content,
            excerpt: post.excerpt,
            featured_image: post.featured_image,
            seo_title: post.seo_title,
            seo_description: post.seo_description,
            slug: post.slug,
            keywords: post.keywords || [],
            category: post.category,
            created_at: post.created_at,
            updated_at: post.updated_at,
            view_count: post.view_count,
            published: post.published,
            published_at: post.published_at
          }));
          
          setRelatedPosts(mappedRelated as BlogPost[]);

          // Fetch most viewed posts
          try {
            const mostViewed = await getMostViewedBlogPostsUtil(3);
            // Map most viewed posts to the correct interface
            const mappedMostViewed = mostViewed.map((post: any) => ({
              id: post.id,
              title: post.title,
              content: post.content,
              excerpt: post.excerpt,
              featured_image: post.featured_image,
              seo_title: post.seo_title,
              seo_description: post.seo_description,
              slug: post.slug,
              keywords: post.keywords || [],
              category: post.category,
              created_at: post.created_at,
              updated_at: post.updated_at,
              view_count: post.view_count,
              published: post.published,
              published_at: post.published_at
            }));
            setMostViewedPosts(mappedMostViewed as BlogPost[]);
          } catch (error) {
            console.error('Error fetching most viewed posts:', error);
            setMostViewedPosts([]);
          }

          // Fetch latest posts
          try {
            const latest = await getLatestBlogPostsUtil(2);
            // Map latest posts to the correct interface
            const mappedLatest = latest.map((post: any) => ({
              id: post.id,
              title: post.title,
              content: post.content,
              excerpt: post.excerpt,
              featured_image: post.featured_image,
              seo_title: post.seo_title,
              seo_description: post.seo_description,
              slug: post.slug,
              keywords: post.keywords || [],
              category: post.category,
              created_at: post.created_at,
              updated_at: post.updated_at,
              view_count: post.view_count,
              published: post.published,
              published_at: post.published_at
            }));
            setLatestPosts(mappedLatest as BlogPost[]);
          } catch (error) {
            console.error('Error fetching latest posts:', error);
            setLatestPosts([]);
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
        <button
          onClick={() => router.push('/')}
          className="text-primary hover:underline"
        >
          Terug naar home
        </button>
      </div>
    );
  }

  // SEO Meta Tags
  const pageTitle = blog.seo_title || blog.title;
  const pageDescription = blog.seo_description || blog.excerpt;
  const pageKeywords = blog.keywords?.join(', ') || '';
  const publishedDate = blog.published_at ? new Date(blog.published_at).toISOString() : '';
  const updatedDate = blog.updated_at ? new Date(blog.updated_at).toISOString() : publishedDate;

  // Enhanced structured data for blog posts
  const blogPostSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://datingassistent.nl/blog/${slug}`
    },
    "headline": pageTitle,
    "description": pageDescription,
    "datePublished": publishedDate,
    "dateModified": updatedDate,
    "author": {
      "@type": "Person",
      "name": "DatingAssistent Team",
      "url": "https://datingassistent.nl"
    },
    "publisher": {
      "@type": "Organization",
      "name": "DatingAssistent",
      "logo": {
        "@type": "ImageObject",
        "url": "https://datingassistent.nl/logo.png"
      }
    },
    "image": blog.featured_image ? {
      "@type": "ImageObject",
      "url": blog.featured_image,
      "width": 1200,
      "height": 630
    } : undefined,
    "keywords": blog.keywords?.join(', '),
    "articleBody": blog.content,
    "wordCount": blog.content?.split(/\s+/).filter(word => word.length > 0).length || 0,
    "articleSection": blog.category || "Dating Advice"
  };

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={pageKeywords} />
        <link rel="canonical" href={`https://datingassistent.nl/blog/${slug}`} />

        {/* Open Graph */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://datingassistent.nl/blog/${slug}`} />
        {blog.featured_image && (
          <meta property="og:image" content={blog.featured_image} />
        )}

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        {blog.featured_image && (
          <meta name="twitter:image" content={blog.featured_image} />
        )}

        {/* Blog post structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(blogPostSchema)
          }}
        />
      </Head>

      <div className="min-h-screen flex flex-col bg-background">
        
        {/* Main Content */}
        <main className="flex-grow">
          {/* Header */}
          <header className="border-b bg-card/50">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
              <Button
                variant="ghost"
                onClick={() => router.push('/blog')}
                className="mb-6"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Terug naar blog
              </Button>
              
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {blog.category && (
                    <Badge variant="secondary">{blog.category}</Badge>
                  )}
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-1 h-4 w-4" />
                    {blog.published_at && new Date(blog.published_at).toLocaleDateString('nl-NL', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  {blog.view_count !== undefined && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Eye className="mr-1 h-4 w-4" />
                      {blog.view_count} views
                    </div>
                  )}
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  {blog.title}
                </h1>
                
                {blog.excerpt && (
                  <p className="text-xl text-muted-foreground">
                    {blog.excerpt}
                  </p>
                )}
                
                {blog.keywords && blog.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {blog.keywords.map((keyword, index) => (
                      <Badge key={index} variant="outline" className="flex items-center">
                        <Tag className="mr-1 h-3 w-3" />
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </header>
          
          {/* Main Content */}
          <div className="container mx-auto px-4 py-8 max-w-4xl">
            <article className="prose prose-lg max-w-none dark:prose-invert">
              {blog.featured_image && (
                <div className="mb-8">
                  {/* Optimized image with loading="lazy" */}
                  <img 
                    src={blog.featured_image} 
                    alt={blog.title}
                    className="w-full h-auto rounded-lg object-cover"
                    loading="lazy"
                  />
                </div>
              )}
              
              <div
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
                      'target', 'rel', 'width', 'height'
                    ],
                    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
                  })
                }}
                className="blog-content"
              />
            </article>
          </div>
          
          {/* Related Content Section */}
          <section className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Most Viewed Posts */}
              {mostViewedPosts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Eye className="mr-2 h-5 w-5" />
                      Meest Gelezen
                    </CardTitle>
                    <CardDescription>
                      Populaire artikelen op DatingAssistent
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mostViewedPosts.map((post) => (
                      <div 
                        key={post.slug} 
                        className="border-b pb-4 last:border-b-0 last:pb-0 cursor-pointer hover:bg-muted/50 p-2 rounded"
                        onClick={() => router.push(`/blog/${post.slug}`)}
                      >
                        <h3 className="font-medium hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        {post.featured_image && (
                          <img 
                            src={post.featured_image} 
                            alt={post.title}
                            className="w-full h-32 object-cover rounded mt-2"
                            loading="lazy"
                          />
                        )}
                        <p className="text-sm text-muted-foreground mt-1">
                          {post.excerpt}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
              
              {/* Latest Posts */}
              {latestPosts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="mr-2 h-5 w-5" />
                      Laatste Artikelen
                    </CardTitle>
                    <CardDescription>
                      Recente blogposts
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {latestPosts.map((post) => (
                      <div 
                        key={post.slug} 
                        className="border-b pb-4 last:border-b-0 last:pb-0 cursor-pointer hover:bg-muted/50 p-2 rounded"
                        onClick={() => router.push(`/blog/${post.slug}`)}
                      >
                        <h3 className="font-medium hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        {post.featured_image && (
                          <img 
                            src={post.featured_image} 
                            alt={post.title}
                            className="w-full h-32 object-cover rounded mt-2"
                            loading="lazy"
                          />
                        )}
                        <p className="text-sm text-muted-foreground mt-1">
                          {post.excerpt}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </section>
        </main>
        
        <PublicFooter />
      </div>
    </>
  );
}
