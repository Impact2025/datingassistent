"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@/providers/user-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { useToast } from '@/hooks/use-toast';

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const plan = searchParams.get('plan') || 'core';
  const billing = searchParams.get('billing') || 'monthly';
  const amount = searchParams.get('amount') || '24.50';

  useEffect(() => {
    // If user is already logged in, auto-fill email
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const handlePayment = async () => {
    // Validate email
    if (!email || !email.includes('@')) {
      toast({
        title: 'Email vereist',
        description: 'Vul een geldig e-mailadres in om door te gaan.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment order
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageType: plan,
          billingPeriod: billing,
          amount: parseFloat(amount) * 100, // Convert to cents
          userId: user?.id || user?.uid || 'temp',
          userEmail: email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment creation failed');
      }

      console.log('✅ Payment order created:', data.orderId);

      // Redirect to MultiSafePay payment URL
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('No payment URL received');
      }
    } catch (error) {
      console.error('❌ Payment error:', error);
      toast({
        title: 'Fout',
        description: error instanceof Error ? error.message : 'Kon betaling niet starten',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }
  };

  if (userLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Afronden Bestelling</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Order Summary */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="font-semibold">Plan:</span>
              <span className="capitalize">{plan}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Periode:</span>
              <span>{billing === 'monthly' ? 'Maandelijks' : 'Jaarlijks'}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
              <span>Totaal:</span>
              <span>€{amount}</span>
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              E-mailadres *
            </label>
            <Input
              id="email"
              type="email"
              placeholder="jouw@email.nl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isProcessing || !!user?.email}
              required
            />
            <p className="text-xs text-muted-foreground">
              {user?.email
                ? 'Je account email wordt gebruikt voor deze bestelling'
                : 'Dit adres wordt gebruikt om je account aan te maken en je order te bevestigen'}
            </p>
          </div>

          {/* Payment Button */}
          <Button
            onClick={handlePayment}
            disabled={isProcessing || !email}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <LoadingSpinner className="mr-2" />
                Doorsturen naar betaling...
              </>
            ) : (
              'Doorgaan naar betaling'
            )}
          </Button>

          {/* Info Text */}
          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              Je wordt doorgestuurd naar een veilige betalingspagina van MultiSafePay
            </p>
            {!user && (
              <p className="text-xs text-muted-foreground">
                Al een account?{' '}
                <a href="/login" className="text-primary underline">
                  Log in
                </a>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </main>
    }>
      <PaymentContent />
    </Suspense>
  );
}
