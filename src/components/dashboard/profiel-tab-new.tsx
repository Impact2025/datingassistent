'use client';

/**
 * Profiel Tab - Settings & Persoonlijkheid
 * Wrapper around existing ProfileSuite
 */

import { ProfileSuite } from './profile-suite';

interface ProfielTabProps {
  onTabChange?: (tab: string) => void;
}

export function ProfielTab({ onTabChange }: ProfielTabProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileSuite onTabChange={onTabChange} />
    </div>
  );
}
