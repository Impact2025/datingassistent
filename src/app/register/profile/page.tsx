'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthLayout from '../../auth-layout';
import { RegistrationForm } from '@/components/auth/registration-form';
import { useUser } from '@/providers/user-provider';
import { LoadingSpinner } from '@/components/shared/loading-spinner';

export default function RegisterProfilePage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [defaultName, setDefaultName] = useState<string>('');

  useEffect(() => {
    if (!loading && !user) {
      console.log('🔒 Register profile: No user found, redirecting to login');
      router.replace('/login');
    } else if (!loading && user) {
      console.log('✅ Register profile: User authenticated:', user.id);
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedName = localStorage.getItem('profile_setup_name');
    if (storedName) {
      setDefaultName(storedName);
      localStorage.removeItem('profile_setup_name');
    } else if (user?.name) {
      setDefaultName(user.name);
    }
  }, [user]);

  if (loading || !user) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center justify-center py-16">
          <LoadingSpinner />
          <p className="mt-4 text-muted-foreground">Profielformulier laden...</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="w-full py-6 px-4">
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="rounded-2xl border border-border/50 bg-card/60 p-4 text-center shadow-lg">
            <p className="text-xs tracking-widest text-muted-foreground uppercase">Stap 2 van 2</p>
            <h1 className="mt-1 text-2xl font-bold">Maak je profiel compleet</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Met deze informatie kan je coach meteen gericht adviseren en worden de AI-tools persoonlijk voor je ingesteld.
            </p>
          </div>

          <div className="flex justify-center">
            <RegistrationForm defaultName={defaultName || user.name || ''} />
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
