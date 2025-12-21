"use client";

import { useUser } from '@/providers/user-provider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  placeholder_text?: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  publishDate: string;
  published: boolean;
  createdAt: any;
}

export default function BlogManagement() {
  const { user, loading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBlog, setCurrentBlog] = useState<Partial<BlogPost>>({});

  useEffect(() => {
    // Admin check is handled by the admin layout - just load blogs when user is available
    if (!loading && user) {
      loadBlogs();
    }
  }, [user, loading]);

  const loadBlogs = async () => {
    try {
      const response = await fetch('/api/blogs/list');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Kon blogs niet laden');
      }

      setBlogs(data.blogs);
    } catch (error) {
      console.error('Error loading blogs:', error);
      toast({
        title: 'Fout',
        description: error instanceof Error ? error.message : 'Kon blogs niet laden',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveBlog = async () => {
    try {
      if (!currentBlog.title || !currentBlog.excerpt || !currentBlog.content || !currentBlog.slug) {
        toast({
          title: 'Validatie fout',
          description: 'Vul alle verplichte velden in (titel, excerpt, content, slug)',
          variant: 'destructive',
        });
        return;
      }

      const blogData = {
        title: currentBlog.title,
        excerpt: currentBlog.excerpt,
        content: currentBlog.content,
        image: currentBlog.image || '',
        placeholder_text: currentBlog.placeholder_text || '',
        slug: currentBlog.slug,
        metaTitle: currentBlog.metaTitle || currentBlog.title,
        metaDescription: currentBlog.metaDescription || currentBlog.excerpt,
        keywords: currentBlog.keywords || [],
        publishDate: currentBlog.publishDate || null,
        author: 'DatingAssistent',
        published: currentBlog.published || false,
      };

      let response;
      if (currentBlog.id) {
        // Update existing
        response = await fetch('/api/blogs/update', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...blogData, id: currentBlog.id }),
        });
      } else {
        // Create new
        response = await fetch('/api/blogs/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(blogData),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Opslaan mislukt');
      }

      toast({
        title: 'Succesvol',
        description: currentBlog.id ? 'Blog bijgewerkt' : 'Blog aangemaakt',
      });

      setIsEditing(false);
      setCurrentBlog({});
      loadBlogs();
    } catch (error) {
      console.error('Error saving blog:', error);
      toast({
        title: 'Fout',
        description: error instanceof Error ? error.message : 'Kon blog niet opslaan',
        variant: 'destructive',
      });
    }
  };

  const togglePublish = async (blog: BlogPost) => {
    try {
      const response = await fetch('/api/blogs/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: blog.id,
          published: !blog.published,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Update mislukt');
      }

      toast({
        title: 'Succesvol',
        description: blog.published ? 'Blog is nu een concept' : 'Blog is gepubliceerd!',
      });
      loadBlogs();
    } catch (error) {
      console.error('Error toggling publish:', error);
      toast({
        title: 'Fout',
        description: error instanceof Error ? error.message : 'Kon status niet wijzigen',
        variant: 'destructive',
      });
    }
  };

  const deleteBlog = async (id: string) => {
    if (!confirm('Weet je zeker dat je deze blog wilt verwijderen?')) return;

    try {
      const response = await fetch(`/api/blogs/delete?id=${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verwijderen mislukt');
      }

      toast({
        title: 'Succesvol',
        description: data.message || 'Blog verwijderd',
      });
      loadBlogs();
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast({
        title: 'Fout',
        description: error instanceof Error ? error.message : 'Kon blog niet verwijderen',
        variant: 'destructive',
      });
    }
  };

  if (loading || isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4">
        <LoadingSpinner />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Blog Beheer</h1>
          <div className="flex gap-4">
            <Button onClick={() => router.push('/admin')} variant="outline">
              Terug naar Dashboard
            </Button>
            <Button onClick={() => { setIsEditing(true); setCurrentBlog({}); }}>
              Nieuw Blog
            </Button>
          </div>
        </div>

        {isEditing ? (
          <Card>
            <CardHeader>
              <CardTitle>{currentBlog.id ? 'Blog Bewerken' : 'Nieuw Blog'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Titel *</label>
                <Input
                  value={currentBlog.title || ''}
                  onChange={(e) => setCurrentBlog({ ...currentBlog, title: e.target.value })}
                  placeholder="Blog titel"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Slug * (URL-vriendelijk, bijv: online-daten-taboe-2015)</label>
                <Input
                  value={currentBlog.slug || ''}
                  onChange={(e) => setCurrentBlog({ ...currentBlog, slug: e.target.value })}
                  placeholder="online-daten-taboe-2015"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Meta Title (SEO)</label>
                <Input
                  value={currentBlog.metaTitle || ''}
                  onChange={(e) => setCurrentBlog({ ...currentBlog, metaTitle: e.target.value })}
                  placeholder="Standaard wordt titel gebruikt"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Meta Description (SEO)</label>
                <Textarea
                  value={currentBlog.metaDescription || ''}
                  onChange={(e) => setCurrentBlog({ ...currentBlog, metaDescription: e.target.value })}
                  placeholder="Standaard wordt excerpt gebruikt"
                  rows={2}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Keywords (komma gescheiden)</label>
                <Input
                  value={Array.isArray(currentBlog.keywords) ? currentBlog.keywords.join(', ') : ''}
                  onChange={(e) => setCurrentBlog({ ...currentBlog, keywords: e.target.value.split(',').map(k => k.trim()) })}
                  placeholder="online daten, tips, 2015"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Korte beschrijving *</label>
                <Textarea
                  value={currentBlog.excerpt || ''}
                  onChange={(e) => setCurrentBlog({ ...currentBlog, excerpt: e.target.value })}
                  placeholder="Korte beschrijving voor preview"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Afbeelding URL</label>
                <Input
                  value={currentBlog.image || ''}
                  onChange={(e) => setCurrentBlog({ ...currentBlog, image: e.target.value })}
                  placeholder="https://..."
                />
                {currentBlog.image && (
                  <img src={currentBlog.image} alt="Preview" className="mt-2 w-full max-w-md rounded border" />
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Placeholder Tekst (alleen als geen afbeelding)</label>
                <Input
                  value={currentBlog.placeholder_text || ''}
                  onChange={(e) => setCurrentBlog({ ...currentBlog, placeholder_text: e.target.value })}
                  placeholder="Bijv. TIPS of één woord uit de titel"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Deze tekst verschijnt in een gekleurd vak als er geen afbeelding is. Laat leeg om automatisch het eerste woord van de titel te gebruiken.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Publicatie Datum (optioneel)</label>
                <Input
                  type="date"
                  value={currentBlog.publishDate || ''}
                  onChange={(e) => setCurrentBlog({ ...currentBlog, publishDate: e.target.value })}
                  placeholder="YYYY-MM-DD"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Laat leeg voor vandaag. Formaat: YYYY-MM-DD (bijv. 2025-01-15)
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Inhoud * (HTML ondersteund)</label>
                <Textarea
                  value={currentBlog.content || ''}
                  onChange={(e) => setCurrentBlog({ ...currentBlog, content: e.target.value })}
                  placeholder="Blog inhoud (HTML ondersteund)"
                  rows={10}
                />
              </div>

              <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                <input
                  type="checkbox"
                  id="published"
                  checked={currentBlog.published || false}
                  onChange={(e) => setCurrentBlog({ ...currentBlog, published: e.target.checked })}
                  className="w-4 h-4 cursor-pointer"
                />
                <label htmlFor="published" className="text-sm font-medium cursor-pointer">
                  Publiceer deze blog (maak zichtbaar op de website)
                </label>
              </div>

              <div className="flex gap-4">
                <Button onClick={saveBlog}>
                  {currentBlog.published ? 'Opslaan & Publiceren' : 'Opslaan als Concept'}
                </Button>
                <Button variant="outline" onClick={() => { setIsEditing(false); setCurrentBlog({}); }}>
                  Annuleren
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {blogs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Geen blogs gevonden</p>
            ) : (
              blogs.map((blog) => (
                <Card key={blog.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold">{blog.title}</h3>
                          {blog.published ? (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 rounded">
                              ✓ Gepubliceerd
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 rounded">
                              ○ Concept
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">Slug: /{blog.slug}</p>
                        <p className="text-muted-foreground mb-4">{blog.excerpt}</p>
                        {blog.image && (
                          <img src={blog.image} alt={blog.title} className="w-32 h-20 object-cover rounded mb-2" />
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant={blog.published ? "outline" : "default"}
                          onClick={() => togglePublish(blog)}
                        >
                          {blog.published ? '📝 Maak Concept' : '✓ Publiceer'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { setCurrentBlog(blog); setIsEditing(true); }}
                        >
                          Bewerken
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteBlog(blog.id)}
                        >
                          Verwijderen
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}
