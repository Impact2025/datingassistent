"use client";

import { Suspense } from 'react';
import { CheckoutClientComponent } from '@/components/checkout/checkout-client';

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-coral-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CheckoutClientComponent />
    </Suspense>
  );
}
