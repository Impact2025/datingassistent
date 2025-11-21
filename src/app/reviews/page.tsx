import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { ensureReviewPublishedColumn } from '@/lib/reviews-db';
import { sql } from '@vercel/postgres';

type Review = {
  id: number;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string | null;
  created_at: string;
};

async function getPublishedReviews(): Promise<Review[]> {
  await ensureReviewPublishedColumn();

  const result = await sql<Review>`
    SELECT id, name, role, content, rating, avatar, created_at
    FROM reviews
    WHERE published = true
    ORDER BY created_at DESC
  `;
  return result.rows;
}

export default async function ReviewsPage() {
  const reviews = await getPublishedReviews();

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      
      <main className="flex-grow">
        {/* Header */}
        <header className="border-b bg-card/50">
          <div className="container mx-auto px-4 py-8">
            <Button
              variant="ghost"
              asChild
              className="mb-6"
            >
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Terug naar home
              </Link>
            </Button>

            <h1 className="text-3xl md:text-4xl font-bold mb-4">Klantbeoordelingen</h1>
            <p className="text-lg text-muted-foreground">
              Echte verhalen van mensen die met meer succes daten dankzij DatingAssistent
            </p>
          </div>
        </header>

          <div className="container mx-auto px-4 py-8">
          {reviews.length === 0 ? (
            <p className="text-muted-foreground text-center">Nog geen reviews beschikbaar.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <Card key={review.id} className="p-6 rounded-2xl bg-card">
                  <p className="text-sm text-muted-foreground italic mb-4">"{review.content}"</p>
                  <div className="flex items-center">
                    {review.avatar && (
                      <img
                        className="w-10 h-10 rounded-full mr-3"
                        src={review.avatar}
                        alt={`Foto van ${review.name}`}
                      />
                    )}
                    <div>
                      <p className="font-semibold text-sm">{review.name}</p>
                      <p className="text-xs text-muted-foreground">{review.role}</p>
                    </div>
                  </div>
                  <div className="mt-3 text-yellow-500 text-sm">
                    {'★'.repeat(review.rating) + '☆'.repeat(5 - review.rating)}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Trust Indicators */}
          <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold mb-6">Waarom kiezen duizenden mensen voor DatingAssistent?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="p-6">
                <div className="text-3xl font-bold text-primary mb-2">25K+</div>
                <div className="text-muted-foreground">Tevreden gebruikers</div>
              </Card>
              <Card className="p-6">
                <div className="text-3xl font-bold text-primary mb-2">89%</div>
                <div className="text-muted-foreground">Meer matches</div>
              </Card>
              <Card className="p-6">
                <div className="text-3xl font-bold text-primary mb-2">4.8/5</div>
                <div className="text-muted-foreground">Gemiddelde beoordeling</div>
              </Card>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <Card className="p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">Klaar om je eigen succesverhaal te schrijven?</h3>
              <p className="text-muted-foreground mb-6">
                Word lid van duizenden tevreden gebruikers en ontdek hoe DatingAssistent jou helpt om sneller een echte match te vinden.
              </p>
              <Link href="/register">
                <Button size="lg">Start gratis</Button>
              </Link>
            </Card>
          </div>
        </div>
      </main>
      
      <PublicFooter />
    </div>
  );
}