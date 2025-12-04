"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Head from 'next/head';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, ArrowLeft, Tag, X } from 'lucide-react';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import './blog.styles.css';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  featured_image?: string;
  placeholder_text?: string;
  seo_title: string;
  seo_description: string;
  slug: string;
  keywords: string[];
  category?: string;
  created_at: any;
  published_at?: any;
}

function BlogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tagFilter = searchParams.get('tag');

  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<BlogPost[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(tagFilter);
  const [loading, setLoading] = useState(true);
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        // Fetch published blog posts from API
        const response = await fetch('/api/blogs?type=latest&limit=10');
        const blogData = await response.json();
        
        // Map the database fields to the interface fields and fix internal links
        const mappedBlogs: BlogPost[] = blogData.map((blog: any) => ({
          id: blog.id,
          title: blog.title,
          content: blog.content,
          excerpt: blog.excerpt,
          featured_image: blog.featured_image || blog.image,
          placeholder_text: blog.placeholder_text,
          seo_title: blog.seo_title,
          seo_description: blog.seo_description,
          slug: blog.slug,
          keywords: blog.keywords || [],
          category: blog.category,
          created_at: blog.created_at,
          published_at: blog.published_at
        }));

        setBlogs(mappedBlogs);
        setFilteredBlogs(mappedBlogs);

        // Extract all unique tags
        const tags = new Set<string>();
        mappedBlogs.forEach(blog => {
          blog.keywords?.forEach(keyword => tags.add(keyword));
        });
        setAllTags(Array.from(tags));
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  useEffect(() => {
    if (tagFilter) {
      setSelectedTag(tagFilter);
    }
  }, [tagFilter]);

  useEffect(() => {
    let filtered = [...blogs];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(blog =>
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.keywords?.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by tag
    if (selectedTag) {
      filtered = filtered.filter(blog =>
        blog.keywords?.includes(selectedTag)
      );
    }

    setFilteredBlogs(filtered);
  }, [searchQuery, selectedTag, blogs]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // SEO Meta Tags
  const pageTitle = "Dating Blog - Tips voor Succesvol Online Daten | DatingAssistent";
  const pageDescription = "Ontdek tips, tricks en advies voor succesvol online daten. Leer hoe je een aantrekkelijk profiel maakt, betere matches vindt en uiteindelijk een echte relatie opbouwt.";
  const pageKeywords = "dating tips, online daten, datingsprofiel, matchen, relatie, datingsite, dating app, datingsucces";

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={pageKeywords} />
        <link rel="canonical" href="https://datingassistent.nl/blog" />

        {/* Open Graph */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://datingassistent.nl/blog" />
        <meta property="og:image" content="https://datingassistent.nl/og-image.png" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="https://datingassistent.nl/og-image.png" />

        {/* Blog structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Blog",
              "name": "DatingAssistent Blog",
              "description": pageDescription,
              "url": "https://datingassistent.nl/blog",
              "publisher": {
                "@type": "Organization",
                "name": "DatingAssistent",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://datingassistent.nl/logo.png"
                }
              }
            })
          }}
        />
      </Head>

      <PublicHeader />

      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-white">
          <div className="absolute inset-0 bg-black/30"></div>
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25"
            style={{
              backgroundImage: `url('/uploads/images/Dating Blog.png')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          ></div>
          <div className="relative container mx-auto px-4 py-16 md:py-24">
            <div className="max-w-4xl mx-auto text-center">

              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-pink-100 bg-clip-text text-transparent drop-shadow-lg">
                Dating Blog
              </h1>
              <p className="text-xl md:text-2xl text-white/95 mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow-md font-medium">
                Ontdek de beste tips, tricks en verhalen voor succesvol online daten
              </p>

              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-white/60" />
                <Input
                  type="text"
                  placeholder="Zoek artikelen over dating..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-12 py-4 text-lg bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/15 h-14 rounded-full"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 text-white/60 hover:text-white hover:bg-white/10"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-10 w-32 h-32 bg-pink-300/20 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-purple-300/20 rounded-full blur-lg"></div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-4 py-12">
          {/* Tags Filter */}
          <div className="mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full">
                <Tag className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Ontdek Onderwerpen</h2>
            </div>
            <div className="flex gap-3 flex-wrap justify-center">
              <Badge
                variant={!selectedTag ? 'default' : 'outline'}
                className="cursor-pointer px-4 py-2 text-sm font-medium hover:shadow-md transition-all duration-200"
                onClick={() => setSelectedTag(null)}
              >
                ✨ Alle onderwerpen
              </Badge>
              {allTags.slice(0, 15).map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTag === tag ? 'default' : 'outline'}
                  className="cursor-pointer px-4 py-2 text-sm font-medium hover:shadow-md transition-all duration-200 hover:scale-105"
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-sm">
              <span className="text-lg font-semibold text-gray-700">
                {filteredBlogs.length} {filteredBlogs.length === 1 ? 'artikel' : 'artikelen'} gevonden
              </span>
              {selectedTag && (
                <span className="text-purple-600 font-medium">voor "{selectedTag}"</span>
              )}
              {searchQuery && (
                <span className="text-pink-600 font-medium">met "{searchQuery}"</span>
              )}
            </div>
          </div>

          {/* Blog Grid */}
          {filteredBlogs.length === 0 ? (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-12 w-12 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Geen artikelen gevonden</h3>
                <p className="text-gray-600 mb-6">
                  Probeer een andere zoekopdracht of onderwerp.
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTag(null);
                  }}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                >
                  Alles tonen
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBlogs.map((blog, index) => (
                <Card
                  key={blog.slug}
                  className="group cursor-pointer overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg"
                  onClick={() => router.push(`/blog/${blog.slug}`)}
                >
                  <div className="relative overflow-hidden">
                    <div className="aspect-[4/3] overflow-hidden">
                      {blog.featured_image ? (
                        <img
                          src={blog.featured_image}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 flex items-center justify-center relative">
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
                          <span className="text-5xl font-bold text-white relative z-10">
                            {blog.placeholder_text || blog.title.split(' ')[0] || 'DA'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {/* Category badge */}
                    {blog.category && (
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-white/90 text-gray-800 hover:bg-white">
                          {blog.category}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6">
                    <CardTitle className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-purple-600 transition-colors duration-200">
                      {blog.title}
                    </CardTitle>

                    <CardDescription className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                      {blog.excerpt}
                    </CardDescription>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {blog.keywords?.slice(0, 3).map((keyword, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs bg-gradient-to-r from-pink-50 to-purple-50 text-purple-700 border-purple-200"
                        >
                          {keyword}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>
                        {blog.published_at && new Date(blog.published_at).toLocaleDateString('nl-NL', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      <span className="text-purple-600 font-medium group-hover:translate-x-1 transition-transform duration-200">
                        Lees meer →
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <PublicFooter />
    </>
  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    }>
      <BlogContent />
    </Suspense>
  );
}