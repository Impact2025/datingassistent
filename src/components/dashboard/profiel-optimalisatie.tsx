"use client";

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Target,
  Zap,
  TrendingUp,
  Camera,
  FileText,
  Sparkles,
  ArrowRight,
  Shield,
  CheckCircle
} from 'lucide-react';

interface ProfielOptimalisatieProps {
  onStartAssessment?: () => void;
  onSkipToDashboard?: () => void;
}

export function ProfielOptimalisatie({
  onStartAssessment,
  onSkipToDashboard
}: ProfielOptimalisatieProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <Card className="border-0 shadow-xl bg-white">
        <CardContent className="p-8 md:p-12">
          {/* Header Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-coral-500 to-coral-600 rounded-3xl flex items-center justify-center shadow-lg">
              <Target className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-3">
            Profiel Optimalisatie
          </h1>

          {/* Subtitle */}
          <p className="text-center text-gray-600 mb-4 text-lg">
            Bouw een profiel dat echt werkt.
          </p>
          <p className="text-center text-coral-600 font-medium mb-10">
            AI-guided, data-driven, authentiek.
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {/* Stat 1: Time */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center border border-blue-200">
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">30-45</div>
              <div className="text-sm text-gray-600">minuten</div>
            </div>

            {/* Stat 2: Results */}
            <div className="bg-gradient-to-br from-coral-50 to-coral-100 rounded-2xl p-6 text-center border border-coral-200">
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 bg-coral-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-coral-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">+250%</div>
              <div className="text-sm text-gray-600">meer matches</div>
            </div>

            {/* Stat 3: Optimization */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 text-center border border-purple-200">
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">100%</div>
              <div className="text-sm text-gray-600">geoptimaliseerd</div>
            </div>
          </div>

          {/* How it works */}
          <div className="bg-gray-50 rounded-2xl p-8 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Hoe het werkt</h2>
            <p className="text-gray-600 mb-6">
              In 3 stappen begeleid ik je van een leeg of zwak profiel naar een geoptimaliseerd,{' '}
              <span className="text-coral-600 font-semibold">authentiek</span> dating profiel dat matches genereert.
            </p>

            {/* Steps */}
            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-coral-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    1
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">Foto Strategie</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Upload, analyseer, optimaliseer (15 min)
                  </p>
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-coral-600" />
                    <span className="text-xs text-gray-500">AI-powered foto analyse</span>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-coral-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    2
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">Bio & Profiel Tekst</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    AI schrijft je perfecte bio (20 min)
                  </p>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-coral-600" />
                    <span className="text-xs text-gray-500">Persoonlijk & authentiek</span>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-coral-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    3
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">Prompts & Details</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Laatste finetuning (10 min)
                  </p>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-coral-600" />
                    <span className="text-xs text-gray-500">Perfecte afronding</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <Button
            onClick={onStartAssessment}
            className="w-full bg-gradient-to-r from-coral-600 to-coral-700 hover:from-coral-700 hover:to-coral-800 text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Start Assessment
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          {/* Skip Link */}
          {onSkipToDashboard && (
            <button
              onClick={onSkipToDashboard}
              className="w-full text-center text-sm text-gray-500 hover:text-coral-600 mt-4 transition-colors"
            >
              Ik heb al een profiel, ga verder →
            </button>
          )}

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600">AI-Powered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Privacy Safe</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Proven Results</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
