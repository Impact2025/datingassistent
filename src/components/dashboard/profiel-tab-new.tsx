'use client';

/**
 * Profiel Tab - WORLD-CLASS VERSION
 * Premium profile hub with modern UI, animations, and AI insights
 */

import { memo } from 'react';
import { WorldClassProfileHub } from './world-class-profile-hub';

interface ProfielTabProps {
  onTabChange?: (tab: string) => void;
  userId?: number;
  userProfile?: any;
}

export const ProfielTab = memo(function ProfielTab({
  onTabChange,
  userId,
  userProfile
}: ProfielTabProps) {
  return (
    <div className="min-h-screen">
      <WorldClassProfileHub embedded={true} />
    </div>
  );
});
