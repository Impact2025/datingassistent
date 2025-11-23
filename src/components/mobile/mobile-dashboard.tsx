"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AIHeroSection } from './ai-hero-section';
import { QuickActionsGrid } from './quick-actions-grid';
import { AISmartFlow } from './ai-smart-flow';
import { BottomNavigation } from '@/components/layout/bottom-navigation';

interface MobileDashboardProps {
  className?: string;
}

export function MobileDashboard({ className }: MobileDashboardProps) {
  const router = useRouter();

  const handleStartGuidedFlow = () => {
    // This would start a personalized guided flow
    // For now, navigate to the most important action
    router.push('/profiel');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* AI Hero Section */}
        <AIHeroSection onStartGuidedFlow={handleStartGuidedFlow} />

        {/* Quick Actions Grid */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Snelle Acties
          </h2>
          <QuickActionsGrid />
        </div>

        {/* AI Smart Flow */}
        <AISmartFlow />

        {/* Week Overview Card */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Deze Week</h3>
            <span className="text-sm text-gray-500">Week 45</span>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">12</div>
              <div className="text-xs text-gray-600">Doelen behaald</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">8</div>
              <div className="text-xs text-gray-600">Tools gebruikt</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">85%</div>
              <div className="text-xs text-gray-600">Voortgang</div>
            </div>
          </div>
        </div>

        {/* Daily Learning Card */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">📚</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Dagelijkse Les</h3>
              <p className="text-sm text-gray-600">Leer effectieve openingszinnen</p>
            </div>
          </div>

          <button
            onClick={() => router.push('/leren')}
            className="w-full bg-purple-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors"
          >
            Start Les
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}