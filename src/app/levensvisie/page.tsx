"use client";

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LevensvisieFlow } from '@/components/levensvisie/levensvisie-flow';
import { BottomNavigation } from '@/components/layout/bottom-navigation';

function LevensvisieContent() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-coral-50 pb-24">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-indigo-100 px-4 py-3 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="p-2 hover:bg-indigo-50 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Levensvisie & Toekomstkompas</h1>
            <p className="text-xs text-gray-500">Ontdek je toekomst compatibility</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <LevensvisieFlow onClose={() => router.back()} />
      </div>

      <BottomNavigation />
    </div>
  );
}

export default function LevensVisiePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-coral-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    }>
      <LevensvisieContent />
    </Suspense>
  );
}
