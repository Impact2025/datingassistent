"use client";

import { useUser } from '@/providers/user-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Button } from '@/components/ui/button';

const ADMIN_EMAILS = ['v_mun@hotmail.com', 'v.munster@weareimpact.nl'];

export default function TestLinkPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  // Check if user is admin
  const isAdminUser = user?.email && ADMIN_EMAILS.includes(user.email);

  useEffect(() => {
    console.log('TestLinkPage - User state:', { user, loading });
    
    if (!loading) {
      if (!user) {
        console.log('TestLinkPage - No user, redirecting to admin login');
        router.push('/admin/login');
      } else if (!isAdminUser) {
        console.log('TestLinkPage - Not admin user, redirecting to dashboard');
        router.push('/dashboard');
      } else {
        console.log('TestLinkPage - Admin user, staying on page');
      }
    }
  }, [user, loading, isAdminUser, router]);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4">
        <LoadingSpinner />
        <p className="text-muted-foreground">Toegang controleren...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4">
        <LoadingSpinner />
        <p className="text-muted-foreground">Redirecting to admin login...</p>
      </main>
    );
  }

  if (!isAdminUser) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Geen admin rechten. Redirecting to dashboard...</p>
        <Button onClick={() => router.push('/dashboard')}>Terug naar dashboard</Button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Test Links</h1>
          <Button onClick={() => router.push('/admin')}>Terug naar Dashboard</Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Reviews</h2>
            <p className="text-muted-foreground mb-4">Test link naar Review Beheer</p>
            <Button onClick={() => router.push('/admin/reviews')}>Ga naar Reviews</Button>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Analytics</h2>
            <p className="text-muted-foreground mb-4">Test link naar Analytics</p>
            <Button onClick={() => router.push('/admin/analytics')}>Ga naar Analytics</Button>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Gebruikers</h2>
            <p className="text-muted-foreground mb-4">Test link naar Gebruikers Beheer</p>
            <Button onClick={() => router.push('/admin/users')}>Ga naar Gebruikers</Button>
          </div>
        </div>
        
        <div className="mt-8 p-6 bg-yellow-100 text-yellow-800 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Debug Informatie</h3>
          <p>User ID: {user?.uid}</p>
          <p>User Email: {user?.email}</p>
          <p>Is Admin: {isAdminUser ? 'Ja' : 'Nee'}</p>
        </div>
      </div>
    </main>
  );
}