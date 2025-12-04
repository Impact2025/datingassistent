"use client";

import { EmotioneleReadinessFlow } from '@/components/emotional-readiness/emotionele-readiness-flow';
import { EmotionalReadinessTutorial } from '@/components/onboarding/tutorials/emotional-readiness-tutorial';

export function EmotioneleReadinessClient() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <EmotioneleReadinessFlow />
      </div>

      {/* Tutorial Component */}
      <EmotionalReadinessTutorial />
    </div>
  );
}
