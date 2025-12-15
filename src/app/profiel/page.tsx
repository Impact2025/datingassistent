"use client";

export const dynamic = 'force-dynamic';

import { ProfileSuite } from '@/components/dashboard/profile-suite';
import { BottomNavigation } from '@/components/layout/bottom-navigation';

export default function ProfielPage() {
  return (
    <div className="pb-20">
      <ProfileSuite />
      <BottomNavigation />
    </div>
  );
}
