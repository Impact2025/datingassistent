import { Suspense } from 'react';
import { CheckoutClientComponent } from '@/app/payment/checkout/checkout-client';
import { LoadingSpinner } from '@/components/shared/loading-spinner';

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <LoadingSpinner />
        <h1 className="text-2xl font-bold">Betaling voorbereiden...</h1>
        <p className="text-muted-foreground">Je wordt doorgestuurd naar de betaalpagina</p>
      </main>
    }>
      <CheckoutClientComponent />
    </Suspense>
  );
}