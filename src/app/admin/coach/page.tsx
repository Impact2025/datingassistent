"use client";

import { CoachDashboard } from '@/components/admin/coach-dashboard';

// Admin access is handled by the admin layout (/admin/layout.tsx)
// No need for additional auth checks here
export default function AdminCoachPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
        <CoachDashboard />
      </div>
    </div>
  );
}