"use client";

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';

export default function PaymentCancelledPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      <main className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <CardTitle className="text-2xl">Betaling Geannuleerd</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Je betaling is geannuleerd. Geen zorgen, er is niets afgeschreven.
            </p>
            <div className="space-y-2 pt-4">
              <Button
                onClick={() => router.push('/select-package')}
                className="w-full"
              >
                Probeer Opnieuw
              </Button>
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="w-full"
              >
                Terug naar Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <PublicFooter />
    </div>
  );
}
