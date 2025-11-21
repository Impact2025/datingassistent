"use client";

import { useUser } from '@/providers/user-provider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ADMIN_EMAILS = ['v_mun@hotmail.com', 'v.munster@weareimpact.nl'];

export default function ArticleToBlog() {
  const { user, loading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBlog, setGeneratedBlog] = useState<any>(null);

  const [articleUrl, setArticleUrl] = useState('');
  const [articleText, setArticleText] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');

  useEffect(() => {
    if (!loading) {
      if (!user || (user.email && !ADMIN_EMAILS.includes(user.email))) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router]);

  const generateBlog = async () => {
    if (!articleUrl && !articleText) {
      toast({
        title: 'Validatie fout',
        description: 'Vul een artikel URL of plak artikel tekst in',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Use the AI service directly instead of Genkit API
      const response = await fetch('/api/test-openrouter/article-to-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleUrl,
          articleText,
          customInstructions,
        }),
      });

      if (!response.ok) {
        throw new Error('AI generatie mislukt');
      }

      const data = await response.json();
      setGeneratedBlog(data);
      toast({
        title: 'Succesvol!',
        description: 'SEO blog gegenereerd uit artikel',
      });
    } catch (error) {
      console.error('Error generating blog:', error);
      toast({
        title: 'Fout',
        description: 'Kon blog niet genereren. Probeer opnieuw.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const saveBlogToDatabase = async () => {
    if (!generatedBlog) return;

    try {
      const response = await fetch('/api/blogs/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: generatedBlog.title,
          excerpt: generatedBlog.excerpt,
          content: generatedBlog.content,
          image: '',
          metaTitle: generatedBlog.metaTitle,
          metaDescription: generatedBlog.metaDescription,
          slug: generatedBlog.slug,
          keywords: generatedBlog.keywords,
          midjourneyPrompt: generatedBlog.midjourneyPrompt || '',
          author: 'DatingAssistent',
          published: false,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Opslaan mislukt');
      }

      toast({
        title: 'Opgeslagen!',
        description: `Blog "${data.blog.title}" is toegevoegd aan de database`,
      });

      // Reset form
      setArticleUrl('');
      setArticleText('');
      setGeneratedBlog(null);
    } catch (error) {
      console.error('Error saving blog:', error);
      toast({
        title: 'Fout',
        description: error instanceof Error ? error.message : 'Kon blog niet opslaan',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4">
        <LoadingSpinner />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Artikel naar SEO Blog</h1>
            <p className="text-muted-foreground mt-2">Converteer externe artikelen naar SEO-geoptimaliseerde blogs</p>
          </div>
          <Button onClick={() => router.push('/admin')} variant="outline">
            Terug naar Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle>Artikel Invoer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="url" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="url">Via URL</TabsTrigger>
                  <TabsTrigger value="text">Via Tekst</TabsTrigger>
                </TabsList>
                <TabsContent value="url" className="space-y-4 mt-4">
                  <div>
                    <Label>Artikel URL</Label>
                    <Input
                      value={articleUrl}
                      onChange={(e) => {
                        setArticleUrl(e.target.value);
                        setArticleText('');
                      }}
                      placeholder="https://voorbeeld.nl/artikel"
                      disabled={isGenerating}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Plak de URL van het artikel dat je wilt converteren
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="text" className="space-y-4 mt-4">
                  <div>
                    <Label>Artikel Tekst</Label>
                    <Textarea
                      value={articleText}
                      onChange={(e) => {
                        setArticleText(e.target.value);
                        setArticleUrl('');
                      }}
                      placeholder="Plak hier de volledige tekst van het artikel..."
                      rows={12}
                      disabled={isGenerating}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Kopieer en plak de artikeltekst die je wilt converteren
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              <div>
                <Label>Aangepaste Instructies (optioneel)</Label>
                <Textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="Bijv: Focus extra op dating tips voor beginners, voeg praktische voorbeelden toe..."
                  rows={3}
                  disabled={isGenerating}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Geef extra instructies voor de AI over hoe het artikel aangepast moet worden
                </p>
              </div>

              <Button
                onClick={generateBlog}
                disabled={isGenerating || (!articleUrl && !articleText)}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <LoadingSpinner />
                    Converteren...
                  </>
                ) : (
                  '🪄 Converteer naar SEO Blog'
                )}
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setArticleUrl('');
                  setArticleText('');
                  setCustomInstructions('');
                  setGeneratedBlog(null);
                }}
              >
                Reset
              </Button>

              <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg text-sm">
                <p className="font-semibold mb-2 text-primary">⚡ AI zal automatisch:</p>
                <ul className="space-y-1 text-sm">
                  <li>✓ SEO-geoptimaliseerde meta title en description maken</li>
                  <li>✓ Content herschrijven naar DatingAssistent stijl</li>
                  <li>✓ H1, H2 en H3 structuur toevoegen</li>
                  <li>✓ SEO-vriendelijke URL-slug genereren</li>
                  <li>✓ Relevante keywords identificeren</li>
                  <li>✓ Call-to-actions toevoegen</li>
                  <li>✓ Interne links suggesties geven</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview & Opslaan</CardTitle>
            </CardHeader>
            <CardContent>
              {!generatedBlog ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Vul een artikel URL of tekst in</p>
                  <p className="text-sm mt-2">De gegenereerde SEO blog verschijnt hier</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  <div>
                    <Label>Titel (H1)</Label>
                    <Input
                      value={generatedBlog.title}
                      onChange={(e) => setGeneratedBlog({ ...generatedBlog, title: e.target.value })}
                      className="font-bold"
                    />
                  </div>

                  <div>
                    <Label>Meta Title ({generatedBlog.metaTitle?.length}/60)</Label>
                    <Input
                      value={generatedBlog.metaTitle}
                      onChange={(e) => setGeneratedBlog({ ...generatedBlog, metaTitle: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>Meta Description ({generatedBlog.metaDescription?.length}/155)</Label>
                    <Textarea
                      value={generatedBlog.metaDescription}
                      onChange={(e) => setGeneratedBlog({ ...generatedBlog, metaDescription: e.target.value })}
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label>Slug</Label>
                    <Input
                      value={generatedBlog.slug}
                      onChange={(e) => setGeneratedBlog({ ...generatedBlog, slug: e.target.value })}
                      className="font-mono"
                    />
                  </div>

                  <div>
                    <Label>Excerpt</Label>
                    <Textarea
                      value={generatedBlog.excerpt}
                      onChange={(e) => setGeneratedBlog({ ...generatedBlog, excerpt: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Keywords</Label>
                    <div className="flex flex-wrap gap-2">
                      {generatedBlog.keywords?.map((kw: string, idx: number) => (
                        <span key={idx} className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Content Preview</Label>
                    <div
                      className="prose prose-sm dark:prose-invert max-h-96 overflow-y-auto border rounded p-4"
                      dangerouslySetInnerHTML={{ __html: generatedBlog.content }}
                    />
                  </div>

                  {generatedBlog.midjourneyPrompt && (
                    <div>
                      <Label>🎨 Midjourney Prompt</Label>
                      <div className="bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded p-4">
                        <p className="text-sm font-mono">{generatedBlog.midjourneyPrompt}</p>
                        <Button
                          onClick={() => navigator.clipboard.writeText(generatedBlog.midjourneyPrompt)}
                          variant="outline"
                          size="sm"
                          className="mt-2"
                        >
                          📋 Kopieer Prompt
                        </Button>
                      </div>
                    </div>
                  )}

                  {generatedBlog.socialMedia && (
                    <div className="space-y-4">
                      <Label className="text-lg font-semibold">📱 Social Media Content</Label>

                      {/* Instagram */}
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border border-purple-200 dark:border-purple-800 rounded p-4">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          📸 Instagram
                        </h4>
                        <p className="text-sm mb-2 whitespace-pre-wrap">{generatedBlog.socialMedia.instagram.caption}</p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {generatedBlog.socialMedia.instagram.hashtags.map((tag: string, idx: number) => (
                            <span key={idx} className="text-xs bg-purple-200 dark:bg-purple-900 px-2 py-1 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <Button
                          onClick={() => {
                            const text = `${generatedBlog.socialMedia.instagram.caption}\n\n${generatedBlog.socialMedia.instagram.hashtags.map((t: string) => `#${t}`).join(' ')}`;
                            navigator.clipboard.writeText(text);
                          }}
                          variant="outline"
                          size="sm"
                        >
                          📋 Kopieer Instagram Post
                        </Button>
                      </div>

                      {/* Facebook */}
                      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded p-4">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          👥 Facebook
                        </h4>
                        <p className="text-sm mb-2">{generatedBlog.socialMedia.facebook.post}</p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {generatedBlog.socialMedia.facebook.hashtags.map((tag: string, idx: number) => (
                            <span key={idx} className="text-xs bg-blue-200 dark:bg-blue-900 px-2 py-1 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <Button
                          onClick={() => {
                            const text = `${generatedBlog.socialMedia.facebook.post}\n\n${generatedBlog.socialMedia.facebook.hashtags.map((t: string) => `#${t}`).join(' ')}`;
                            navigator.clipboard.writeText(text);
                          }}
                          variant="outline"
                          size="sm"
                        >
                          📋 Kopieer Facebook Post
                        </Button>
                      </div>

                      {/* LinkedIn */}
                      <div className="bg-blue-100 dark:bg-slate-900 border border-blue-300 dark:border-slate-700 rounded p-4">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          💼 LinkedIn
                        </h4>
                        <p className="text-sm mb-2 whitespace-pre-wrap">{generatedBlog.socialMedia.linkedin.post}</p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {generatedBlog.socialMedia.linkedin.hashtags.map((tag: string, idx: number) => (
                            <span key={idx} className="text-xs bg-blue-300 dark:bg-slate-800 px-2 py-1 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <Button
                          onClick={() => {
                            const text = `${generatedBlog.socialMedia.linkedin.post}\n\n${generatedBlog.socialMedia.linkedin.hashtags.map((t: string) => `#${t}`).join(' ')}`;
                            navigator.clipboard.writeText(text);
                          }}
                          variant="outline"
                          size="sm"
                        >
                          📋 Kopieer LinkedIn Post
                        </Button>
                      </div>

                      {/* Twitter */}
                      <div className="bg-sky-50 dark:bg-sky-950 border border-sky-200 dark:border-sky-800 rounded p-4">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          🐦 Twitter/X
                        </h4>
                        <p className="text-sm mb-2">{generatedBlog.socialMedia.twitter.tweet}</p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {generatedBlog.socialMedia.twitter.hashtags.map((tag: string, idx: number) => (
                            <span key={idx} className="text-xs bg-sky-200 dark:bg-sky-900 px-2 py-1 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <Button
                          onClick={() => {
                            const text = `${generatedBlog.socialMedia.twitter.tweet} ${generatedBlog.socialMedia.twitter.hashtags.map((t: string) => `#${t}`).join(' ')}`;
                            navigator.clipboard.writeText(text);
                          }}
                          variant="outline"
                          size="sm"
                        >
                          📋 Kopieer Tweet
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 sticky bottom-0 bg-background pt-4">
                    <Button onClick={saveBlogToDatabase} className="flex-1" size="lg">
                      💾 Opslaan in Database
                    </Button>
                    <Button
                      onClick={() => setGeneratedBlog(null)}
                      variant="outline"
                      className="flex-1"
                    >
                      Nieuwe Conversie
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
