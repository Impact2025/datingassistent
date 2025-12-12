'use client';

/**
 * Profiel Tab - Settings & Persoonlijkheid
 * Wrapper around existing ProfileSuite
 */

import { memo } from 'react';
import { ProfileSuite } from './profile-suite';

interface ProfielTabProps {
  onTabChange?: (tab: string) => void;
}

export const ProfielTab = memo(function ProfielTab({ onTabChange }: ProfielTabProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileSuite onTabChange={onTabChange} />
    </div>
  );
});
