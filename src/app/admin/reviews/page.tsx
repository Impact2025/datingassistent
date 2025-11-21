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
import { useTimeoutLoading } from '@/hooks/use-timeout-loading';
import { sql } from '@vercel/postgres';

const ADMIN_EMAILS = ['v_mun@hotmail.com', 'v.munster@weareimpact.nl'];

interface Review {
  id: number;
  name: string;
  role: string;
  content: string;
  avatar?: string;
  rating: number;
  created_at: string;
  published: boolean;
}

export default function ReviewManagement() {
  const { user, loading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentReview, setCurrentReview] = useState<Partial<Review>>({});

  // Add timeout loading protection
  useTimeoutLoading(isLoading, setIsLoading, 5000);

  useEffect(() => {
    console.log('ReviewManagement - useEffect triggered', { user, loading });
    
    if (!loading) {
      console.log('ReviewManagement - User loaded, checking permissions');
      
      if (!user) {
        console.log('ReviewManagement - No user, redirecting to dashboard');
        router.push('/dashboard');
      } else if (user.email && !ADMIN_EMAILS.includes(user.email)) {
        console.log('ReviewManagement - Not admin, redirecting to dashboard');
        router.push('/dashboard');
      } else {
        console.log('ReviewManagement - Admin user, loading reviews');
        loadReviews();
      }
    }
  }, [user, loading, router]);

  const loadReviews = async () => {
    try {
      console.log('ReviewManagement - Loading reviews from Neon');
      setIsLoading(true);
      
      // Fetch reviews from Neon database
      const result = await sql`
        SELECT 
          id,
          name,
          role,
          content,
          avatar,
          rating,
          created_at
        FROM reviews 
        ORDER BY created_at DESC
      `;
      
      console.log('ReviewManagement - Reviews loaded:', result.rows.length);
      setReviews(result.rows);
    } catch (error) {
      console.error('ReviewManagement - Error loading reviews:', error);
      toast({
        title: 'Fout',
        description: 'Kon reviews niet laden: ' + (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      console.log('ReviewManagement - Setting isLoading to false');
      setIsLoading(false);
    }
  };

  // Add a manual reset function
  const resetLoading = () => {
    console.log('ReviewManagement - Manual reset loading');
    setIsLoading(false);
  };

  console.log('ReviewManagement - Render triggered', { loading, isLoading });

  if (loading || isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4">
        <LoadingSpinner />
        <p className="text-muted-foreground">Reviews laden...</p>
        <button 
          onClick={resetLoading}
          className="text-sm text-muted-foreground underline"
        >
          Forceer laden stoppen
        </button>
      </main>
    );
  }

  // Define the missing functions
  const saveReview = async () => {
    try {
      if (!currentReview.name || !currentReview.content) {
        toast({
          title: 'Validatie fout',
          description: 'Vul alle verplichte velden in',
          variant: 'destructive',
        });
        return;
      }

      const published = currentReview.published ?? false;

      if (currentReview.id) {
        // Update existing review in Neon
        await sql`
          UPDATE reviews 
          SET 
            name = ${currentReview.name},
            role = ${currentReview.role || 'Gebruiker'},
            content = ${currentReview.content},
            avatar = ${currentReview.avatar || ''},
            rating = ${currentReview.rating || 5},
            published = ${published}
          WHERE id = ${currentReview.id}
        `;
        toast({ title: 'Succesvol', description: 'Review bijgewerkt' });
      } else {
        // Create new review in Neon
        await sql`
          INSERT INTO reviews (name, role, content, avatar, rating, published)
          VALUES (
            ${currentReview.name},
            ${currentReview.role || 'Gebruiker'},
            ${currentReview.content},
            ${currentReview.avatar || ''},
            ${currentReview.rating || 5},
            ${published}
          )
        `;
        toast({ title: 'Succesvol', description: 'Review aangemaakt' });
      }

      setIsEditing(false);
      setCurrentReview({});
      loadReviews();
    } catch (error) {
      console.error('Error saving review:', error);
      toast({
        title: 'Fout',
        description: 'Kon review niet opslaan',
        variant: 'destructive',
      });
    }
  };

  const deleteReview = async (id: number) => {
    if (!confirm('Weet je zeker dat je deze review wilt verwijderen?')) return;

    try {
      await sql`DELETE FROM reviews WHERE id = ${id}`;
      toast({ title: 'Succesvol', description: 'Review verwijderd' });
      loadReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast({
        title: 'Fout',
        description: 'Kon review niet verwijderen',
        variant: 'destructive',
      });
    }
  };

  const togglePublished = async (review: Review) => {
    try {
      const newPublished = !review.published;
      await sql`
        UPDATE reviews
        SET published = ${newPublished}
        WHERE id = ${review.id}
      `;
      toast({
        title: 'Succesvol',
        description: newPublished ? 'Review gepubliceerd' : 'Review teruggezet naar concept',
      });
      loadReviews();
    } catch (error) {
      console.error('Error toggling published state:', error);
      toast({
        title: 'Fout',
        description: 'Kon publicatiestatus niet aanpassen',
        variant: 'destructive',
      });
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Review Beheer</h1>
          <div className="flex gap-4">
            <Button onClick={() => router.push('/admin')} variant="outline">
              Terug naar Dashboard
            </Button>
            <Button onClick={() => { setIsEditing(true); setCurrentReview({}); }}>
              Nieuwe Review
            </Button>
          </div>
        </div>

        {isEditing ? (
          <Card>
            <CardHeader>
              <CardTitle>{currentReview.id ? 'Review Bewerken' : 'Nieuwe Review'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Naam *</label>
                <Input
                  value={currentReview.name || ''}
                  onChange={(e) => setCurrentReview({ ...currentReview, name: e.target.value })}
                  placeholder="Naam van de reviewer"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Rol/Functie</label>
                <Input
                  value={currentReview.role || ''}
                  onChange={(e) => setCurrentReview({ ...currentReview, role: e.target.value })}
                  placeholder="Bijv: Gebruiker sinds 2 maanden"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Avatar URL</label>
                <Input
                  value={currentReview.avatar || ''}
                  onChange={(e) => setCurrentReview({ ...currentReview, avatar: e.target.value })}
                  placeholder="https://... (optioneel)"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Rating (1-5)</label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={currentReview.rating || 5}
                  onChange={(e) => setCurrentReview({ ...currentReview, rating: parseInt(e.target.value) })}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="published"
                  type="checkbox"
                  checked={currentReview.published ?? false}
                  onChange={(e) => setCurrentReview({ ...currentReview, published: e.target.checked })}
                  className="h-4 w-4"
                />
                <label htmlFor="published" className="text-sm font-medium">
                  Gepubliceerd (zichtbaar op openbare reviews pagina)
                </label>
              </div>

              <div>
                <label className="text-sm font-medium">Review Tekst *</label>
                <Textarea
                  value={currentReview.content || ''}
                  onChange={(e) => setCurrentReview({ ...currentReview, content: e.target.value })}
                  placeholder="Review inhoud..."
                  rows={5}
                />
              </div>

              <div className="flex gap-4">
                <Button onClick={saveReview}>Opslaan</Button>
                <Button variant="outline" onClick={() => { setIsEditing(false); setCurrentReview({}); }}>
                  Annuleren
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {reviews.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Geen reviews gevonden</p>
            ) : (
              reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          {review.avatar && (
                            <img src={review.avatar} alt={review.name} className="w-12 h-12 rounded-full" />
                          )}
                          <div>
                            <h3 className="font-semibold">{review.name}</h3>
                            <p className="text-sm text-muted-foreground">{review.role}</p>
                          </div>
                        </div>
                        <p className="text-muted-foreground italic">"{review.content}"</p>
                        <div className="mt-2 text-yellow-500">
                          {review.rating && review.rating > 0 ? (
                            <>
                              {'★'.repeat(Math.min(review.rating, 5))}
                              {'☆'.repeat(Math.max(5 - review.rating, 0))}
                            </>
                          ) : (
                            '☆☆☆☆☆'
                          )}
                        </div>
                        <div className="mt-2 text-xs">
                          {review.published ? (
                            <span className="rounded-full bg-green-100 px-2 py-1 text-green-700">Gepubliceerd</span>
                          ) : (
                            <span className="rounded-full bg-yellow-100 px-2 py-1 text-yellow-700">Concept</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => togglePublished(review)}
                        >
                          {review.published ? 'Naar concept' : 'Publiceer'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { setCurrentReview(review); setIsEditing(true); }}
                        >
                          Bewerken
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteReview(review.id)}
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