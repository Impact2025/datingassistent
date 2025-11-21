"use client";

import { Suspense } from 'react';
import { RegistrationClientComponent } from '@/components/auth/registration-client';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import AuthLayout from "../auth-layout";

export default function RegisterPage() {
  return (
    <AuthLayout>
      <Suspense fallback={
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-muted-foreground mt-4">Registratie laden...</p>
        </div>
      }>
        <RegistrationClientComponent />
      </Suspense>
    </AuthLayout>
  );
}