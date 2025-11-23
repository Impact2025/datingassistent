"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@/providers/user-provider';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIHeroSectionProps {
  onStartGuidedFlow: () => void;
  className?: string;
}

export function AIHeroSection({ onStartGuidedFlow, className }: AIHeroSectionProps) {
  const { user } = useUser();
  const [isBreathing, setIsBreathing] = useState(true);

  // Breathing animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBreathing(prev => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Goedemorgen";
    if (hour < 18) return "Goedemiddag";
    return "Goedenavond";
  };

  const getPersonalizedObjectives = () => {
    // This would be calculated based on user's current progress
    return [
      "2 nieuwe weekdoelen stellen",
      "Profielscore verbeteren",
      "Nieuwe chat strategie leren"
    ];
  };

  return (
    <Card className={cn(
      "relative overflow-hidden bg-gradient-to-br from-pink-50 via-white to-purple-50 border-0 shadow-sm",
      className
    )}>
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-200/20 to-purple-200/20 rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-200/20 to-pink-200/20 rounded-full blur-xl" />

      <div className="relative p-6">
        {/* AI Coach Avatar */}
        <div className="flex items-center justify-center mb-6">
          <div className={cn(
            "relative w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg transition-all duration-3000 ease-in-out",
            isBreathing ? "scale-105 shadow-xl" : "scale-100 shadow-lg"
          )}>
            {/* Breathing ring effect */}
            <div className={cn(
              "absolute inset-0 rounded-full border-2 border-pink-300/50 transition-all duration-3000 ease-in-out",
              isBreathing ? "scale-110 opacity-60" : "scale-100 opacity-30"
            )} />

            <div className="text-2xl">🤖</div>

            {/* Active indicator */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
          </div>
        </div>

        {/* Personalized Greeting */}
        <div className="text-center mb-4">
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Dating Expert'}!
          </h1>
          <p className="text-gray-600 text-sm">
            Ik help je vandaag met je dating succes
          </p>
        </div>

        {/* Daily Objectives */}
        <div className="mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-pink-500" />
            <span className="text-sm font-medium text-gray-700">Vandaag focus op:</span>
          </div>

          <div className="space-y-2">
            {getPersonalizedObjectives().map((objective, index) => (
              <div key={index} className="flex items-center gap-3 bg-white/60 rounded-lg p-3">
                <div className="w-2 h-2 bg-pink-500 rounded-full flex-shrink-0" />
                <span className="text-sm text-gray-700">{objective}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Primary CTA */}
        <Button
          onClick={onStartGuidedFlow}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          size="lg"
        >
          <Play className="w-5 h-5 mr-2" />
          Start met mijn advies
        </Button>

        {/* Subtle hint */}
        <p className="text-center text-xs text-gray-500 mt-3">
          Persoonlijke guided flow • 5 minuten
        </p>
      </div>
    </Card>
  );
}