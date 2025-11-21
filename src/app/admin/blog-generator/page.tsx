"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ImageUploader } from '@/components/blog/image-uploader';
import { ImageEditor } from '@/components/blog/image-editor';
import { Edit2 } from 'lucide-react';

export default function BlogGenerator() {
  const router = useRouter();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBlog, setGeneratedBlog] = useState<any>(null);

  const [topic, setTopic] = useState('');
  const [primaryKeyword, setPrimaryKeyword] = useState('');
  const [year, setYear] = useState('2025');
  const [targetAudience, setTargetAudience] = useState('');
  const [category, setCategory] = useState('');
  const [extraKeywords, setExtraKeywords] = useState('');
  const [toneOfVoice, setToneOfVoice] = useState('Vriendelijk en motiverend');
  const [focus, setFocus] = useState('Algemeen - Alle singles');
  const [articleLength, setArticleLength] = useState('Middellang (700-900 woorden)');
  const [includeImageSuggestion, setIncludeImageSuggestion] = useState(true);

  // Image state
  const [blogImage, setBlogImage] = useState('');
  const [isEditingImage, setIsEditingImage] = useState(false);

  // No auth checks needed - AdminLayout handles all authentication

  const generateBlog = async () => {
    if (!primaryKeyword || !category) {
      toast({
        title: 'Validatie fout',
        description: 'Vul primair keyword en categorie in',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Use the AI service directly instead of Genkit API
      const response = await fetch('/api/test-openrouter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primaryKeyword,
          category,
          year,
          targetAudience,
          topic,
          extraKeywords,
          toneOfVoice,
          focus: targetAudience, // Use targetAudience as focus
          articleLength,
        }),
      });

      if (!response.ok) {
        throw new Error('AI generatie mislukt');
      }

      const data = await response.json();
      setGeneratedBlog(data);
      toast({
        title: 'Succesvol!',
        description: 'Blog gegenereerd. Bekijk en sla op.',
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
          image: blogImage || '',
          metaTitle: generatedBlog.metaTitle,
          metaDescription: generatedBlog.metaDescription,
          slug: generatedBlog.slug,
          keywords: generatedBlog.keywords,
          midjourneyPrompt: generatedBlog.midjourneyPrompt || '',
          author: 'DatingAssistent',
          published: true, // Publish immediately so it appears on homepage/blog page
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
      setTopic('');
      setPrimaryKeyword('');
      setGeneratedBlog(null);
      setBlogImage('');
    } catch (error) {
      console.error('Error saving blog:', error);
      toast({
        title: 'Fout',
        description: error instanceof Error ? error.message : 'Kon blog niet opslaan',
        variant: 'destructive',
      });
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">AI Blog Generator</h1>
            <p className="text-muted-foreground mt-2">Genereer SEO-geoptimaliseerde blogs voor DatingAssistent</p>
          </div>
          <Button onClick={() => router.push('/admin')} variant="outline">
            Terug naar Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle>Blog Instellingen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
              <div>
                <Label>Primair Keyword *</Label>
                <Input
                  value={primaryKeyword}
                  onChange={(e) => setPrimaryKeyword(e.target.value)}
                  placeholder="Bijv: Virtuele DatingCoach 2025, Online daten tips, AI in online daten"
                  disabled={isGenerating}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Het hoofdzoekwoord voor deze blog
                </p>
              </div>

              <div>
                <Label>Doelgroep/ Doel (optioneel)</Label>
                <Textarea
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="Bijv: Singles die moeite hebben met daten en hun kans op liefde willen vergroten"
                  rows={2}
                  disabled={isGenerating}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Standaard: Singles die praktische dating tips zoeken
                </p>
              </div>

              <div>
                <Label>Gewenste Titel (optioneel)</Label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Laat leeg voor automatische generatie"
                  disabled={isGenerating}
                />
              </div>

              <div>
                <Label>Categorie *</Label>
                <Select value={category} onValueChange={setCategory} disabled={isGenerating}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kies een categorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Daten & Liefde">Daten & Liefde</SelectItem>
                    <SelectItem value="AI & Technologie">AI & Technologie</SelectItem>
                    <SelectItem value="Praktische Gidsen">Praktische Gidsen</SelectItem>
                    <SelectItem value="Inspiratie & Motivatie">Inspiratie & Motivatie</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Daten & Liefde: ervaringen, tips, succesverhalen | AI & Tech: hoe AI helpt
                </p>
              </div>

              <div>
                <Label>Extra Keywords (komma gescheiden)</Label>
                <Textarea
                  value={extraKeywords}
                  onChange={(e) => setExtraKeywords(e.target.value)}
                  placeholder="Gerelateerde thema, begrip, Lange Staart Keyword, termen of synoniemen"
                  rows={3}
                  disabled={isGenerating}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Voeg hier keywords in die je verwerkt wilt hebben
                </p>
              </div>

              <div>
                <Label>Tone of Voice</Label>
                <Select value={toneOfVoice} onValueChange={setToneOfVoice} disabled={isGenerating}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vriendelijk en motiverend">Vriendelijk en motiverend</SelectItem>
                    <SelectItem value="Praktisch en concreet">Praktisch en concreet</SelectItem>
                    <SelectItem value="Positief en laagdrempelig">Positief en laagdrempelig</SelectItem>
                    <SelectItem value="Persoonlijk (als coach)">Persoonlijk (als coach)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Vriendelijk, praktisch, positief - alsof een coach je persoonlijk aanspreekt
                </p>
              </div>

              <div>
                <Label>Doelgroep Focus</Label>
                <Select value={focus} onValueChange={setFocus} disabled={isGenerating}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Singles 20-50 jaar">Singles 20-50 jaar</SelectItem>
                    <SelectItem value="Dating beginners">Dating beginners</SelectItem>
                    <SelectItem value="Mensen met negatieve ervaringen">Mensen met negatieve ervaringen</SelectItem>
                    <SelectItem value="Mensen met beperking">Mensen met beperking</SelectItem>
                    <SelectItem value="Algemeen - Alle singles">Algemeen - Alle singles</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Inclusief voor iedereen die begeleiding zoekt bij online daten
                </p>
              </div>

              <div>
                <Label>Artikel Lengte</Label>
                <Select value={articleLength} onValueChange={setArticleLength} disabled={isGenerating}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kort (400-600 woorden)">Kort (400-600 woorden)</SelectItem>
                    <SelectItem value="Middellang (700-900 woorden)">Middellang (700-900 woorden)</SelectItem>
                    <SelectItem value="Lang (1000-1200 woorden)">Lang (1000-1200 woorden)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="image-suggestion"
                  checked={includeImageSuggestion}
                  onCheckedChange={(checked) => setIncludeImageSuggestion(checked as boolean)}
                  disabled={isGenerating}
                />
                <Label htmlFor="image-suggestion" className="text-sm font-normal cursor-pointer">
                  Afbeelding URL of upload een bestand
                </Label>
              </div>

              <Button
                onClick={generateBlog}
                disabled={isGenerating || !primaryKeyword || !category}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <LoadingSpinner />
                    Genereren...
                  </>
                ) : (
                  '🪄 Genereer Artikel'
                )}
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setPrimaryKeyword('');
                  setTargetAudience('');
                  setTopic('');
                  setCategory('');
                  setExtraKeywords('');
                  setGeneratedBlog(null);
                }}
              >
                Annuleren
              </Button>

              <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg text-sm">
                <p className="font-semibold mb-2 text-primary">⚡ AI zal automatisch toevoegen:</p>
                <ul className="space-y-1 text-sm">
                  <li>✓ SEO-geoptimaliseerde meta title en descriptie</li>
                  <li>✓ Duidelijke H1, H2 en H3 structuur</li>
                  <li>✓ Professionele en SEO-friendly URL-slug</li>
                  <li>✓ Interne links & relevante call-to-action's</li>
                  <li>✓ Voorbeelden en kansen voor het huidige jaar</li>
                  <li>✓ Praktische doorlichten en toepassingen</li>
                  <li>✓ Conclusie met contactmogelijkheden</li>
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
                  <p>Vul de velden in en klik op "Genereer Blog"</p>
                  <p className="text-sm mt-2">De gegenereerde blog verschijnt hier</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label>Titel (H1)</Label>
                    <p className="font-bold text-lg">{generatedBlog.title}</p>
                  </div>

                  <div>
                    <Label>Meta Title ({generatedBlog.metaTitle?.length}/60)</Label>
                    <p className="text-sm">{generatedBlog.metaTitle}</p>
                  </div>

                  <div>
                    <Label>Meta Description ({generatedBlog.metaDescription?.length}/155)</Label>
                    <p className="text-sm">{generatedBlog.metaDescription}</p>
                  </div>

                  <div>
                    <Label>Slug</Label>
                    <p className="text-sm font-mono bg-muted p-2 rounded">{generatedBlog.slug}</p>
                  </div>

                  <div>
                    <Label>Excerpt</Label>
                    <p className="text-sm">{generatedBlog.excerpt}</p>
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

                  {/* Image Upload & Editor */}
                  {isEditingImage && blogImage ? (
                    <ImageEditor
                      imageUrl={blogImage}
                      onSave={(editedUrl) => {
                        setBlogImage(editedUrl);
                        setIsEditingImage(false);
                        toast({
                          title: 'Afbeelding bijgewerkt',
                          description: 'Je wijzigingen zijn opgeslagen',
                        });
                      }}
                      onCancel={() => setIsEditingImage(false)}
                    />
                  ) : (
                    <>
                      <ImageUploader
                        onImageUploaded={(url) => setBlogImage(url)}
                        currentImage={blogImage}
                      />
                      {blogImage && (
                        <Button
                          onClick={() => setIsEditingImage(true)}
                          variant="outline"
                          className="w-full"
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Bewerk afbeelding
                        </Button>
                      )}
                    </>
                  )}

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

                  <div className="flex gap-4">
                    <Button onClick={saveBlogToDatabase} className="flex-1" size="lg">
                      💾 Opslaan in Database
                    </Button>
                    <Button
                      onClick={() => setGeneratedBlog(null)}
                      variant="outline"
                      className="flex-1"
                    >
                      Nieuwe Blog
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
