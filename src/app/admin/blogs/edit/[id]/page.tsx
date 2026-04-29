"use client";

/**
 * WORLD-CLASS BLOG EDITOR
 *
 * Professional tabbed blog editor interface inspired by WeAreImpact,
 * customized for DatingAssistent with pink branding.
 *
 * Features:
 * - 4 tabs: Editor, SEO, Social Media, Instellingen
 * - 3 AI action buttons: Format & SEO, Metadata Only, AI Generator
 * - TipTap rich text editor
 * - Image upload via Vercel Blob
 * - Header options: Image OR Color background
 * - Category & tags management
 * - Real-time preview
 *
 * @route /admin/blogs/edit/[id]
 * @access Admin only
 */

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  FileText,
  Search,
  Share2,
  Settings,
  Sparkles,
  Wand2,
  Brain,
  ArrowLeft,
  Save,
  Eye
} from 'lucide-react';
import { logger } from '@/lib/logger';

// Tab components (we'll create these)
import { EditorTab } from '@/components/blog/editor-tab';
import { SEOTab } from '@/components/blog/seo-tab';
import { SocialMediaTab } from '@/components/blog/social-tab';
import { InstellingenTab } from '@/components/blog/instellingen-tab';

import type { BlogPost, CreateBlogPostData } from '@/types/blog';

export default function BlogEditorPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const blogId = params?.id as string;
  const isNewBlog = blogId === 'new';

  // =========================================================================
  // STATE
  // =========================================================================

  const [activeTab, setActiveTab] = useState('instellingen');
  const [loading, setLoading] = useState(!isNewBlog);
  const [saving, setSaving] = useState(false);
  const [blogData, setBlogData] = useState<Partial<CreateBlogPostData>>({
    title: '',
    excerpt: '',
    content: '',
    slug: '',
    category: 'Online Dating Tips',
    tags: [],
    header_type: 'image',
    header_color: '#FF7B54',
    published: false,
    author: 'DatingAssistent',
  });
  const [internalLinks, setInternalLinks] = useState<{
    knowledgeBase: Array<{
      title: string;
      slug: string;
      url: string;
      category: string;
      relevance: string;
      suggestedAnchorText: string;
      suggestedPlacement: string;
    }>;
    relatedBlogs: Array<{
      title: string;
      slug: string;
      url: string;
      category: string;
      relevance: string;
      suggestedAnchorText: string;
      suggestedPlacement: string;
    }>;
  } | null>(null);

  // =========================================================================
  // LOAD EXISTING BLOG
  // =========================================================================

  useEffect(() => {
    if (!isNewBlog) {
      loadBlog();
    }
  }, [blogId]);

  const loadBlog = async () => {
    try {
      const response = await fetch(`/api/blogs/${blogId}`);
      if (!response.ok) throw new Error('Blog niet gevonden');

      const data = await response.json();
      const blog = data.blog;

      // 🐛 DEBUG: Log loaded blog data
      logger.log('📖 Loaded blog:', {
        category: blog.category,
        tags: blog.tags,
        fullBlog: blog,
      });

      // Map database fields to form fields
      setBlogData({
        ...blog,
        // Ensure arrays are properly set
        tags: Array.isArray(blog.tags) ? blog.tags : [],
        category: blog.category || 'Online Dating Tips',
      });
    } catch (error) {
      toast({
        title: 'Fout',
        description: 'Kon blog niet laden',
        variant: 'destructive',
      });
      router.push('/admin/blogs');
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // SAVE BLOG (Smart Save - auto-generates missing fields)
  // =========================================================================

  const handleSave = async (publish: boolean = false) => {
    setSaving(true);

    try {
      // Basic validation - only title and content are truly required
      if (!blogData.title || !blogData.content) {
        toast({
          title: 'Validatie fout',
          description: 'Vul minimaal een titel en content in',
          variant: 'destructive',
        });
        setSaving(false);
        return;
      }

      // Auto-complete missing fields with AI
      let finalData = { ...blogData };

      if (!blogData.excerpt || !blogData.slug) {
        toast({
          title: 'Slim opslaan',
          description: 'Ontbrekende velden worden automatisch gegenereerd...',
        });

        try {
          const autoCompleteResponse = await fetch('/api/ai/auto-complete-blog', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: blogData.title,
              content: blogData.content,
              category: blogData.category,
            }),
          });

          if (autoCompleteResponse.ok) {
            const autoData = await autoCompleteResponse.json();

            // Only fill in missing fields
            finalData = {
              ...finalData,
              excerpt: finalData.excerpt || autoData.excerpt,
              slug: finalData.slug || autoData.slug,
              seo_title: finalData.seo_title || autoData.seo_title,
              seo_description: finalData.seo_description || autoData.seo_description,
            };

            // Update local state with generated values
            updateBlogData(finalData);
          } else {
            // Fallback: generate simple slug from title
            const fallbackSlug = blogData.title
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, '')
              .trim()
              .replace(/\s+/g, '-')
              .substring(0, 100);

            const fallbackExcerpt = blogData.content
              .replace(/<[^>]*>/g, ' ')
              .replace(/\s+/g, ' ')
              .trim()
              .substring(0, 200) + '...';

            finalData = {
              ...finalData,
              excerpt: finalData.excerpt || fallbackExcerpt,
              slug: finalData.slug || fallbackSlug,
            };
            updateBlogData(finalData);
          }
        } catch (autoError) {
          console.error('Auto-complete failed:', autoError);
          // Use simple fallback
          const fallbackSlug = blogData.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .substring(0, 100);

          const fallbackExcerpt = blogData.content
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 200) + '...';

          finalData = {
            ...finalData,
            excerpt: finalData.excerpt || fallbackExcerpt,
            slug: finalData.slug || fallbackSlug,
          };
          updateBlogData(finalData);
        }
      }

      // Final validation after auto-complete
      if (!finalData.excerpt || !finalData.slug) {
        toast({
          title: 'Auto-complete fout',
          description: 'Kon niet alle velden genereren. Vul excerpt en slug handmatig in.',
          variant: 'destructive',
        });
        setSaving(false);
        return;
      }

      const endpoint = isNewBlog ? '/api/blogs/save' : '/api/blogs/update';
      const payload = {
        ...finalData,
        published: publish,
        id: isNewBlog ? undefined : parseInt(blogId),
      };

      const response = await fetch(endpoint, {
        method: isNewBlog ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Opslaan mislukt');

      const result = await response.json();

      toast({
        title: publish ? 'Gepubliceerd!' : 'Opgeslagen!',
        description: publish
          ? 'Blog is succesvol gepubliceerd'
          : 'Blog is opgeslagen als concept',
      });

      if (isNewBlog && result.blog?.id) {
        router.push(`/admin/blogs/edit/${result.blog.id}`);
      }
    } catch (error) {
      toast({
        title: 'Fout',
        description: error instanceof Error ? error.message : 'Opslaan mislukt',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // =========================================================================
  // AI ACTIONS
  // =========================================================================

  const handleAIOptimize = async () => {
    if (!blogData.content || !blogData.title) {
      toast({
        title: 'Onvolledige data',
        description: 'Vul eerst titel en content in',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'AI Optimaliseren...',
      description: 'Bezig met metadata en interne links invoegen...',
    });

    try {
      // Run metadata fetch and article list fetch in parallel
      const [metaResponse, kbResponse, blogsResponse] = await Promise.all([
        fetch('/api/ai/enhance-metadata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: blogData.title,
            content: blogData.content,
            excerpt: blogData.excerpt,
            category: blogData.category,
          }),
        }),
        fetch('/api/knowledge-base/list'),
        fetch('/api/blogs/list?published=true'),
      ]);

      if (!metaResponse.ok) {
        const err = await metaResponse.json();
        throw new Error(err.error || 'Metadata generatie mislukt');
      }
      if (!kbResponse.ok || !blogsResponse.ok) {
        throw new Error('Kon artikelen niet ophalen');
      }

      const [metaData, kbData, blogsData] = await Promise.all([
        metaResponse.json(),
        kbResponse.json(),
        blogsResponse.json(),
      ]);

      logger.log('📥 Metadata response:', metaData);

      // --- Step 1: update metadata fields ---
      updateBlogData({
        seo_title: metaData.seo.title,
        seo_description: metaData.seo.description,
        social_title: metaData.social.title,
        social_description: metaData.social.description,
        tags: [...(blogData.tags || []), ...metaData.seo.keywords.slice(0, 3)],
      });

      if (metaData.internalLinks) {
        setInternalLinks(metaData.internalLinks);
      }

      // --- Step 2: auto-link content ---
      const knowledgeBase = kbData.articles || [];
      const blogs = blogsData.blogs || [];

      let updatedContent = blogData.content;
      let linksInserted = 0;
      const MAX_LINKS = 10;

      const extractKeywords = (text: string): string[] => {
        const stopWords = ['de', 'het', 'een', 'en', 'van', 'voor', 'in', 'op', 'met', 'aan', 'je', 'jouw', 'is', 'zijn', 'naar', 'over', 'bij', 'als', 'dat', 'die', 'dit'];
        return text
          .toLowerCase()
          .replace(/[?!:.,]/g, '')
          .split(/\s+/)
          .filter(word => word.length > 3 && !stopWords.includes(word));
      };

      // Replaces only the FIRST occurrence — no global flag to avoid linking the
      // same word 10+ times throughout the article.
      const tryReplaceWithLink = (textToFind: string, url: string): boolean => {
        if (updatedContent.includes(url)) return false;
        const escapedText = textToFind.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(?<!<a[^>]*>)${escapedText}(?![^<]*<\/a>)`, 'i');
        if (regex.test(updatedContent)) {
          updatedContent = updatedContent.replace(
            regex,
            `<a href="${url}" class="text-coral-600 hover:text-coral-700 underline">$&</a>`
          );
          return true;
        }
        return false;
      };

      // Strategy 1: exact title match — stop once cap is reached
      const kbItems = knowledgeBase.map((a: any) => ({ title: a.title, url: `/kennisbank/${a.slug}` }));
      const blogItems = blogs.filter((b: any) => b.id !== parseInt(blogId)).map((b: any) => ({ title: b.title, url: `/blog/${b.slug}` }));
      for (const item of [...kbItems, ...blogItems]) {
        if (linksInserted >= MAX_LINKS) break;
        const variations = [item.title, item.title.replace(/\?/g, ''), item.title.replace(/:/g, '')];
        for (const v of variations) {
          if (tryReplaceWithLink(v, item.url)) { linksInserted++; break; }
        }
      }

      // Strategy 2: keyword match from article title — only runs if cap not yet reached
      for (const article of [...kbItems, ...blogItems]) {
        if (linksInserted >= MAX_LINKS) break;
        if (updatedContent.includes(article.url)) continue;
        const keywords = extractKeywords(article.title).filter(kw => kw.length >= 6).sort((a, b) => b.length - a.length);
        for (const kw of keywords) {
          if (tryReplaceWithLink(kw, article.url)) { linksInserted++; break; }
        }
      }

      updateBlogData({ content: updatedContent });

      const suggestCount = (metaData.internalLinks?.knowledgeBase?.length || 0) + (metaData.internalLinks?.relatedBlogs?.length || 0);
      toast({
        title: 'Klaar!',
        description: `Metadata bijgewerkt · ${linksInserted} link${linksInserted === 1 ? '' : 's'} ingevoegd · ${suggestCount} suggesties beschikbaar`,
      });
    } catch (error) {
      console.error('AI optimize error:', error);
      toast({
        title: 'Fout',
        description: error instanceof Error ? error.message : 'AI optimaliseren mislukt',
        variant: 'destructive',
      });
    }
  };

  const handleAIGenerator = async () => {
    // Show a dialog to get input from user
    const keyword = window.prompt('Voer het primaire keyword in (bijv. "eerste date tips"):');
    if (!keyword) return;

    toast({
      title: 'AI Generator',
      description: 'Bezig met genereren van complete blog...',
    });

    try {
      const response = await fetch('/api/ai/generate-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primaryKeyword: keyword,
          category: blogData.category || 'Online Dating Tips',
          articleLength: 'medium',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Blog generatie mislukt');
      }

      // Update blog data with generated content
      const blog = data.blog;

      // 🐛 DEBUG: Log what AI returned
      logger.log('🤖 AI Generated Blog:', {
        category: blog.category,
        keywords: blog.keywords,
        tags: blog.keywords?.slice(0, 5),
        fullResponse: blog,
      });

      const updatedData = {
        title: blog.title,
        excerpt: blog.excerpt,
        content: blog.content,
        slug: blog.slug,
        seo_title: blog.seoTitle,
        seo_description: blog.seoDescription,
        social_title: blog.socialTitle,
        social_description: blog.socialDescription,
        category: blog.category,
        tags: blog.keywords?.slice(0, 5) || [],
        reading_time: blog.readingTime,
        header_type: blog.headerSuggestion?.type || 'color',
        header_color: blog.headerSuggestion?.colorHex || '#FF7B54',
        header_title: blog.headerSuggestion?.headerTitle || '',
      };

      logger.log('📝 Updating blog data with:', updatedData);
      updateBlogData(updatedData);

      toast({
        title: 'Succesvol!',
        description: 'Complete blog gegenereerd met AI',
      });
    } catch (error) {
      console.error('Blog generation error:', error);
      toast({
        title: 'Fout',
        description: error instanceof Error ? error.message : 'Blog generatie mislukt',
        variant: 'destructive',
      });
    }
  };


  // =========================================================================
  // AUTO INSERT INTERNAL LINKS
  // =========================================================================

  const handleAutoInsertLinks = async () => {
    if (!internalLinks || !blogData.content) return;

    let updatedContent = blogData.content;
    let linksInserted = 0;

    // Combine all links from AI suggestions
    const allLinks = [
      ...internalLinks.knowledgeBase,
      ...internalLinks.relatedBlogs
    ];

    // Strategy 1: Find ALL potential blog/KB titles in content and convert to links
    // This includes titles in "Gerelateerde artikelen" sections that are just text
    for (const link of allLinks) {
      const title = link.title;

      // Create variations of the title to match
      const titleVariations = [
        title,
        title.replace(/\?/g, ''), // Without question mark
        title.replace(/:/g, ''), // Without colon
        title.toLowerCase(),
      ];

      for (const variation of titleVariations) {
        // Check if this title appears as plain text (not already a link)
        const escapedTitle = variation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Match the title if it's NOT already inside an <a> tag
        const regex = new RegExp(
          `(?<!<a[^>]*>)${escapedTitle}(?![^<]*<\/a>)`,
          'gi'
        );

        if (regex.test(updatedContent)) {
          // Replace with link
          updatedContent = updatedContent.replace(
            regex,
            `<a href="${link.url}" class="text-coral-600 hover:text-coral-700 underline">${title}</a>`
          );
          linksInserted++;
          break; // Move to next link
        }
      }
    }

    // Strategy 2: Try to find and link based on anchor text
    allLinks.forEach((link) => {
      if (updatedContent.includes(link.url)) return; // Skip if already linked

      const anchorText = link.suggestedAnchorText;
      const escapedAnchor = anchorText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // Match anchor text if it's NOT already inside an <a> tag
      const regex = new RegExp(
        `(?<!<a[^>]*>)${escapedAnchor}(?![^<]*<\/a>)`,
        'gi'
      );

      if (regex.test(updatedContent)) {
        updatedContent = updatedContent.replace(
          regex,
          `<a href="${link.url}" class="text-coral-600 hover:text-coral-700 underline">${anchorText}</a>`
        );
        linksInserted++;
      }
    });

    // Strategy 3: If we still have unlinked suggestions, add them in a new section
    const unlinkedLinks = allLinks.filter(link => !updatedContent.includes(link.url));

    if (unlinkedLinks.length > 0 && linksInserted === 0) {
      const resourcesSection = `
<h2>Gerelateerde Informatie</h2>
<p>Voor meer informatie, bekijk ook deze artikelen:</p>
<ul>
${unlinkedLinks.map(link => `  <li><a href="${link.url}" class="text-coral-600 hover:text-coral-700 underline">${link.title}</a> - ${link.relevance}</li>`).join('\n')}
</ul>`;

      updatedContent = updatedContent + resourcesSection;
      linksInserted = unlinkedLinks.length;
    }

    updateBlogData({ content: updatedContent });

    toast({
      title: 'Links toegevoegd!',
      description: `${linksInserted} interne link${linksInserted === 1 ? '' : 's'} automatisch ingevoegd in de content`,
    });

    // Clear the suggestions after inserting
    setInternalLinks(null);
  };

  // =========================================================================
  // UPDATE FUNCTIONS
  // =========================================================================

  const updateBlogData = (updates: Partial<CreateBlogPostData>) => {
    setBlogData(prev => ({ ...prev, ...updates }));
  };

  // =========================================================================
  // LOADING STATE
  // =========================================================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-coral-50/30 to-coral-50/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Blog laden...</p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-coral-50/30 to-coral-50/30">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back Button + Title */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/admin/blogs')}
                className="hover:bg-coral-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Terug
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-coral-500 hover:bg-coral-600 bg-clip-text text-transparent">
                  {isNewBlog ? 'Nieuwe Blog Post' : 'Bewerk Blog Post'}
                </h1>
                <p className="text-sm text-gray-500">
                  Update je artikel of laat AI nieuwe content genereren
                </p>
              </div>
            </div>

            {/* AI Action Buttons */}
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAIOptimize}
                className="border-coral-200 text-coral-700 hover:bg-coral-50"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                AI Optimaliseren
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAIGenerator}
                className="border-gray-800 text-gray-800 hover:bg-gray-100"
              >
                <Brain className="w-4 h-4 mr-2" />
                AI Generator
              </Button>

              {/* Save Buttons */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSave(false)}
                disabled={saving}
              >
                <Save className="w-4 h-4 mr-2" />
                Opslaan als Concept
              </Button>
              <Button
                size="sm"
                onClick={() => handleSave(true)}
                disabled={saving}
                className="bg-coral-500 hover:bg-coral-600 text-white"
              >
                <Eye className="w-4 h-4 mr-2" />
                Publiceren
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200 p-1 rounded-lg shadow-sm">
            <TabsTrigger
              value="editor"
              className="data-[state=active]:bg-coral-500 data-[state=active]:text-white"
            >
              <FileText className="w-4 h-4 mr-2" />
              Editor
            </TabsTrigger>
            <TabsTrigger
              value="seo"
              className="data-[state=active]:bg-coral-500 data-[state=active]:text-white"
            >
              <Search className="w-4 h-4 mr-2" />
              SEO
            </TabsTrigger>
            <TabsTrigger
              value="social"
              className="data-[state=active]:bg-coral-500 data-[state=active]:text-white"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Social Media
            </TabsTrigger>
            <TabsTrigger
              value="instellingen"
              className="data-[state=active]:bg-coral-500 data-[state=active]:text-white"
            >
              <Settings className="w-4 h-4 mr-2" />
              Instellingen
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <div className="mt-6">
            <TabsContent value="editor" className="mt-0">
              <EditorTab
                blogData={blogData}
                updateBlogData={updateBlogData}
              />
            </TabsContent>

            <TabsContent value="seo" className="mt-0">
              <SEOTab
                blogData={blogData}
                updateBlogData={updateBlogData}
              />
            </TabsContent>

            <TabsContent value="social" className="mt-0">
              <SocialMediaTab
                blogData={blogData}
                updateBlogData={updateBlogData}
              />
            </TabsContent>

            <TabsContent value="instellingen" className="mt-0">
              <InstellingenTab
                blogData={blogData}
                updateBlogData={updateBlogData}
              />
            </TabsContent>
          </div>
        </Tabs>

        {/* Internal Links Suggestions Section */}
        {internalLinks && (internalLinks.knowledgeBase.length > 0 || internalLinks.relatedBlogs.length > 0) && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Sparkles className="w-5 h-5 text-coral-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  AI Interne Link Suggesties
                </h3>
              </div>
              <Button
                onClick={() => handleAutoInsertLinks()}
                className="bg-coral-500 hover:bg-coral-600 text-white"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Automatisch Invoegen
              </Button>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              De AI heeft relevante interne links gevonden die je kunt toevoegen aan je blog.
              Klik op "Automatisch Invoegen" om alle links in de content te plaatsen, of kopieer ze handmatig.
            </p>

            {/* Knowledge Base Links */}
            {internalLinks.knowledgeBase.length > 0 && (
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-blue-500" />
                  Kennisbank Artikelen
                </h4>
                <div className="space-y-4">
                  {internalLinks.knowledgeBase.map((link, index) => (
                    <div key={index} className="border border-blue-100 rounded-lg p-4 bg-blue-50/50 hover:bg-blue-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{link.title}</h5>
                          <p className="text-xs text-gray-500 mt-1">Categorie: {link.category}</p>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`[${link.suggestedAnchorText}](${link.url})`);
                            toast({
                              title: 'Gekopieerd!',
                              description: 'Link is gekopieerd naar klembord',
                            });
                          }}
                          className="ml-4 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                        >
                          Kopieer Link
                        </button>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Relevantie:</strong> {link.relevance}
                      </p>
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Suggestie:</strong> {link.suggestedPlacement}
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>Anker tekst:</strong> <code className="bg-white px-2 py-1 rounded text-blue-600">{link.suggestedAnchorText}</code>
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        URL: <code className="bg-white px-2 py-1 rounded">{link.url}</code>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Blog Links */}
            {internalLinks.relatedBlogs.length > 0 && (
              <div>
                <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-green-500" />
                  Gerelateerde Blogs
                </h4>
                <div className="space-y-4">
                  {internalLinks.relatedBlogs.map((link, index) => (
                    <div key={index} className="border border-green-100 rounded-lg p-4 bg-green-50/50 hover:bg-green-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{link.title}</h5>
                          <p className="text-xs text-gray-500 mt-1">Categorie: {link.category}</p>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`[${link.suggestedAnchorText}](${link.url})`);
                            toast({
                              title: 'Gekopieerd!',
                              description: 'Link is gekopieerd naar klembord',
                            });
                          }}
                          className="ml-4 px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                        >
                          Kopieer Link
                        </button>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Relevantie:</strong> {link.relevance}
                      </p>
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Suggestie:</strong> {link.suggestedPlacement}
                      </p>
                      <p className="text-sm text-gray-700">
                        <strong>Anker tekst:</strong> <code className="bg-white px-2 py-1 rounded text-green-600">{link.suggestedAnchorText}</code>
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        URL: <code className="bg-white px-2 py-1 rounded">{link.url}</code>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
