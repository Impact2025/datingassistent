"use client";

import { Suspense } from 'react';



import { ProfileSuite } from '@/components/dashboard/profile-suite';
import { BottomNavigation } from '@/components/layout/bottom-navigation';

function ProfielPageContent() {
  return (
    <div className="pb-20">
      <ProfileSuite />
      <BottomNavigation />
    </div>
  );
}

export default function ProfielPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
      </div>
    }>
      <ProfielPageContent />
    </Suspense>
  );
}
