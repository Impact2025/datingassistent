'use client';

import { useEffect, useState, Suspense } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

// Full client-only coach, no top-level dynamic imports
function CoachPageInner() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | undefined>();
  const [mounted, setMounted] = useState(false);
  const [CoachComponent, setCoachComponent] = useState<React.ComponentType<{ userId?: number }> | null>(null);

  useEffect(() => {
    setMounted(true);

    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setUserId(user.id);
        } catch (_) {}
      }
    }
  }, []);

  useEffect(() => {
    // Only load coach module on client, never during SSR/SSG
    import('@/components/coach/CoachChat').then(mod => {
      setCoachComponent(() => mod.CoachChat);
    }).catch(() => {
      // Silently fail - coach feature unavailable
    });
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-coral-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Coach wordt geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Terug</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-coral-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Iris Coach</h1>
                <p className="text-xs text-gray-500">Altijd beschikbaar voor jou</p>
              </div>
            </div>
            <div className="w-20"></div>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-hidden">
        <div className="h-full max-w-4xl mx-auto">
          {CoachComponent ? (
            <CoachComponent userId={userId} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-coral-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Coach wordt geladen...</p>
              </div>
            </div>
          )}
        </div>
      </main>
      <div className="bg-white border-t border-gray-100 py-2 px-6 flex-shrink-0">
        <p className="text-center text-xs text-gray-500">
          Iris is je AI dating coach. Al je gesprekken zijn privé en vertrouwelijk.
        </p>
      </div>
    </div>
  );
}

export default function CoachPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-coral-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Coach wordt geladen...</p>
        </div>
      </div>
    }>
      <CoachPageInner />
    </Suspense>
  );
}
