"use client";

/**
 * Welcome Screen - Minimalist & Professional
 */

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Target, Zap, TrendingUp, ArrowRight } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
  onSkipToRoute?: () => void;
}

export function WelcomeScreen({ onStart, onSkipToRoute }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 mb-4">
            <Target className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
            Profiel Optimalisatie
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto leading-relaxed">
            Bouw een profiel dat echt werkt.
            <br />
            AI-guided, data-driven, authentiek.
          </p>
        </div>

        {/* Value Props */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-6 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">30-45</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">minuten</div>
            </div>
          </Card>

          <Card className="p-6 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">+250%</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">meer matches</div>
            </div>
          </Card>

          <Card className="p-6 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">100%</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">geoptimaliseerd</div>
            </div>
          </Card>
        </div>

        {/* Main CTA Card */}
        <Card className="p-8 border-0 bg-white dark:bg-gray-800 shadow-lg">
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Hoe het werkt</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                In 3 stappen begeleid ik je van een leeg of zwak profiel naar een
                geoptimaliseerd, authentiek dating profiel dat matches genereert.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Foto Strategie</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Upload, analyseer, optimaliseer (15 min)</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Bio & Profiel Tekst</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">AI schrijft je perfecte bio (20 min)</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Prompts & Details</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Laatste finetuning (10 min)</div>
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <Button
                onClick={onStart}
                className="w-full h-12 bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 font-medium rounded-lg transition-colors group"
              >
                Start Assessment
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              {onSkipToRoute && (
                <button
                  onClick={onSkipToRoute}
                  className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                >
                  Ik heb al een profiel, ga verder →
                </button>
              )}
            </div>
          </div>
        </Card>

        {/* Trust Indicators */}
        <div className="flex items-center justify-center gap-8 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>AI-Powered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span>Privacy Safe</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            <span>Proven Results</span>
          </div>
        </div>
      </div>
    </div>
  );
}
