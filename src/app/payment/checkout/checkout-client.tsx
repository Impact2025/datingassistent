"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@/providers/user-provider';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { getPackagePrice, type PackageType, type BillingPeriod } from '@/lib/multisafepay';

export function CheckoutClientComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, userProfile } = useUser();
  const [error, setError] = useState<string | null>(null);

  // Get params safely
  const plan = typeof window !== 'undefined' ? searchParams.get('plan') : null;
  const billing = typeof window !== 'undefined' ? searchParams.get('billing') : null;

  useEffect(() => {
    if (!user) {
      // Not logged in, redirect to register
      router.push(`/register?plan=${plan}&billing=${billing}`);
      return;
    }

    if (!plan || !billing) {
      setError('Plan of factureringsperiode ontbreekt');
      return;
    }

    // Initiate payment
    initiatePayment();
  }, [user, plan, billing]);

  async function initiatePayment() {
    if (!user || !plan || !billing) return;

    try {
      const packageType = plan as PackageType;
      const allowedPackages: PackageType[] = ['sociaal', 'core', 'pro', 'premium'];

      if (!allowedPackages.includes(packageType)) {
        throw new Error('Invalid package selected');
      }

      const billingPeriod: BillingPeriod = billing === 'yearly' ? 'yearly' : 'monthly';
      const amount = getPackagePrice(packageType, billingPeriod);

      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          packageType,
          billingPeriod,
          customerName: userProfile?.name || user.name || user.email?.split('@')[0] || 'DatingAssistent gebruiker',
          amount,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment');
      }

      const data = await response.json();

      if (data.payment_url) {
        // Redirect to MultiSafePay
        window.location.href = data.payment_url;
      } else {
        throw new Error('No payment URL received');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('Er ging iets mis bij het starten van de betaling. Probeer het opnieuw.');
    }
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Fout</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => router.push('/select-package')}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Terug naar pakket selectie
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <LoadingSpinner />
      <h1 className="text-2xl font-bold">Betaling voorbereiden...</h1>
      <p className="text-muted-foreground">Je wordt doorgestuurd naar de betaalpagina</p>
    </main>
  );
}