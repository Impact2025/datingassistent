"use client";

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trophy, Star, TrendingUp, ArrowRight, Sparkles } from 'lucide-react';

interface CompletionScreenProps {
  profileData: any;
  onViewDashboard: () => void;
}

export function CompletionScreen({ profileData, onViewDashboard }: CompletionScreenProps) {
  const overallScore = 92; // Calculate based on data

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-3xl w-full space-y-8">
        {/* Celebration */}
        <div className="text-center space-y-4">
          <div className="text-7xl animate-bounce">🎉</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Gefeliciteerd!
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Je dating profiel is nu 100% geoptimaliseerd
          </p>
        </div>

        {/* Score Card */}
        <Card className="p-8 md:p-12 border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 text-center">
          <div className="space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-4">
              <Trophy className="w-10 h-10 text-white" />
            </div>

            <div>
              <div className="text-6xl font-bold text-gray-900 dark:text-white mb-2">{overallScore}/100</div>
              <div className="flex items-center justify-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                Beter dan 87% van alle dating profielen!
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">38</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">minuten besteed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">+250%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">meer matches</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">15-25</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">matches/week</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Achievements */}
        <Card className="p-6 border-0 shadow-lg dark:bg-gray-800">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Vrijgespeelde Badges
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-3xl mb-2">🏅</div>
                <div className="text-xs font-medium text-gray-900 dark:text-white">Profiel Perfectionist</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-3xl mb-2">📸</div>
                <div className="text-xs font-medium text-gray-900 dark:text-white">Foto Master</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-3xl mb-2">✍️</div>
                <div className="text-xs font-medium text-gray-900 dark:text-white">Bio Boss</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Next Steps */}
        <Card className="p-6 border-0 shadow-lg dark:bg-gray-800">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Volgende Stappen</h3>
            <div className="space-y-2">
              <button className="w-full p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-left transition-colors flex items-center justify-between group">
                <span className="font-medium text-gray-900 dark:text-white">Upload profiel naar dating app</span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-left transition-colors flex items-center justify-between group">
                <span className="font-medium text-gray-900 dark:text-white">A/B Test je bio (2 varianten)</span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="w-full p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-left transition-colors flex items-center justify-between group">
                <span className="font-medium text-gray-900 dark:text-white">Chat Coach - Leer perfecte openers</span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <Button
          onClick={onViewDashboard}
          className="w-full h-14 bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 font-semibold text-lg group"
          size="lg"
        >
          Ga naar Dashboard
          <TrendingUp className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}
