"use client";

import { Suspense } from 'react';
import { CheckoutClientComponent } from '@/components/checkout/checkout-client';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import AuthLayout from "../auth-layout";

export default function CheckoutPage() {
  return (
    <AuthLayout>
      <Suspense fallback={
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-muted-foreground mt-4">Checkout laden...</p>
        </div>
      }>
        <CheckoutClientComponent />
      </Suspense>
    </AuthLayout>
  );
}