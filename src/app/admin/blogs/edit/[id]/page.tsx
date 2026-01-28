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
      console.log('📖 Loaded blog:', {
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

  const handleFormatAndSEO = async () => {
    if (!blogData.content || !blogData.title || !blogData.category) {
      toast({
        title: 'Onvolledige data',
        description: 'Vul eerst titel, categorie en content in',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'AI Format & SEO',
      description: 'Bezig met optimaliseren...',
    });

    try {
      const response = await fetch('/api/ai/format-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawContent: blogData.content,
          title: blogData.title,
          category: blogData.category,
          focusKeyword: blogData.seo_title?.split(' ')[0],
          targetLength: 'medium',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Optimalisatie mislukt');
      }

      // Update blog data with formatted content and metadata
      updateBlogData({
        content: data.formattedContent,
        seo_title: data.metadata.seoTitle,
        seo_description: data.metadata.seoDescription,
        social_title: data.metadata.socialTitle,
        social_description: data.metadata.socialDescription,
        reading_time: Math.ceil(data.structure.wordCount / 200),
      });

      toast({
        title: 'Succesvol!',
        description: 'Content is geoptimaliseerd met AI',
      });
    } catch (error) {
      console.error('Format & SEO error:', error);
      toast({
        title: 'Fout',
        description: error instanceof Error ? error.message : 'Optimalisatie mislukt',
        variant: 'destructive',
      });
    }
  };

  const handleMetadataOnly = async () => {
    if (!blogData.content || !blogData.title) {
      toast({
        title: 'Onvolledige data',
        description: 'Vul eerst titel en content in',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'AI Metadata Only',
      description: 'Bezig met genereren van metadata...',
    });

    try {
      const response = await fetch('/api/ai/enhance-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: blogData.title,
          content: blogData.content,
          excerpt: blogData.excerpt,
          category: blogData.category,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Metadata generatie mislukt');
      }

      // Update blog data with metadata
      updateBlogData({
        seo_title: data.seo.title,
        seo_description: data.seo.description,
        social_title: data.social.title,
        social_description: data.social.description,
        tags: [...(blogData.tags || []), ...data.seo.keywords.slice(0, 3)],
      });

      toast({
        title: 'Succesvol!',
        description: 'SEO en social media metadata gegenereerd',
      });
    } catch (error) {
      console.error('Metadata enhancement error:', error);
      toast({
        title: 'Fout',
        description: error instanceof Error ? error.message : 'Metadata generatie mislukt',
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
      console.log('🤖 AI Generated Blog:', {
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

      console.log('📝 Updating blog data with:', updatedData);
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
                <h1 className="text-2xl font-bold bg-gradient-to-r from-coral-500 to-coral-600 bg-clip-text text-transparent">
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
                onClick={handleFormatAndSEO}
                className="border-green-200 text-green-700 hover:bg-green-50"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Format & SEO
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleMetadataOnly}
                className="border-coral-200 text-coral-700 hover:bg-coral-50"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Metadata Only
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
                className="bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 text-white"
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
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-coral-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <FileText className="w-4 h-4 mr-2" />
              Editor
            </TabsTrigger>
            <TabsTrigger
              value="seo"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-coral-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <Search className="w-4 h-4 mr-2" />
              SEO
            </TabsTrigger>
            <TabsTrigger
              value="social"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-coral-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Social Media
            </TabsTrigger>
            <TabsTrigger
              value="instellingen"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-coral-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
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
      </div>
    </div>
  );
}
