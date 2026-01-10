"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { RegistrationClientComponent } from '@/components/auth/registration-client';
import { LeadRegistrationWizard } from '@/components/auth/lead-registration-wizard';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import AuthLayout from "../auth-layout";

// Force dynamic rendering (required for useSearchParams)
export const dynamic = "force-dynamic";

function RegisterContent() {
  const searchParams = useSearchParams();

  // Check if this is a special flow (program purchase, plan selection, etc.)
  const plan = searchParams.get('plan');
  const program = searchParams.get('program');
  const orderId = searchParams.get('order_id');
  const redirectAfterPayment = searchParams.get('redirect_after_payment');
  const fromAssessment = searchParams.get('from');

  // Use legacy registration for special flows
  const useLegacyFlow = !!(plan || program || orderId || redirectAfterPayment || fromAssessment);

  if (useLegacyFlow) {
    return (
      <AuthLayout>
        <RegistrationClientComponent />
      </AuthLayout>
    );
  }

  // Use new Lead Registration Wizard for standard registrations
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-pink-25 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <LeadRegistrationWizard />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-muted-foreground mt-4">Registratie laden...</p>
        </div>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}