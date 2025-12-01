'use client';

import { useEffect, useState, Suspense } from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamically import CoachChat to avoid SSR issues
const CoachChat = dynamic(
  () => import('@/components/coach').then(mod => mod.CoachChat),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Coach wordt geladen...</p>
        </div>
      </div>
    )
  }
);

export default function CoachPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | undefined>();
  const [userName, setUserName] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Get user from localStorage (client-side only)
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setUserId(user.id);
          setUserName(user.voornaam || user.email || 'daar');
        } catch (error) {
          console.error('Failed to parse user from localStorage:', error);
        }
      }
    }
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Back Button */}
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Terug</span>
            </button>

            {/* Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Iris Coach</h1>
                <p className="text-xs text-gray-500">Altijd beschikbaar voor jou</p>
              </div>
            </div>

            {/* Spacer for alignment */}
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full max-w-4xl mx-auto">
          <Suspense fallback={
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Coach wordt geladen...</p>
              </div>
            </div>
          }>
            <CoachChat userId={userId} />
          </Suspense>
        </div>
      </main>

      {/* Footer Info (Optional) */}
      <div className="bg-white border-t border-gray-100 py-2 px-6 flex-shrink-0">
        <p className="text-center text-xs text-gray-500">
          Iris is je AI dating coach. Al je gesprekken zijn privé en vertrouwelijk.
        </p>
      </div>
    </div>
  );
}
