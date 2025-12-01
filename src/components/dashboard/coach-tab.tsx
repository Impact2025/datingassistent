'use client';

/**
 * Coach Tab - Iris AI Coach binnen Dashboard
 */

import { useState, useEffect } from 'react';
import { CoachChat } from '@/components/coach';

interface CoachTabProps {
  onTabChange?: (tab: string) => void;
  userId?: number;
}

export function CoachTab({ onTabChange, userId }: CoachTabProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Coach wordt geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] bg-gray-50">
      <CoachChat userId={userId} />
    </div>
  );
}
