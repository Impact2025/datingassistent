"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@/providers/user-provider';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Play, Heart, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIHeroSectionProps {
  onStartGuidedFlow: () => void;
  className?: string;
}

export function AIHeroSection({ onStartGuidedFlow, className }: AIHeroSectionProps) {
   const { user } = useUser();

   const greetings = [
     "Goedemorgen",
     "Goedemiddag",
     "Goedenavond"
   ];

   // Dynamic greeting based on time
   const getCurrentGreeting = () => {
     const hour = new Date().getHours();
     if (hour < 12) return greetings[0];
     else if (hour < 18) return greetings[1];
     else return greetings[2];
   };

  const getPersonalizedObjectives = () => {
    // This would be calculated based on user's current progress and AI analysis
    const userStreak = 7; // Would come from user data
    const timeOfDay = new Date().getHours();

    if (timeOfDay < 12) {
      return [
        "Profiel foto optimaliseren",
        "Ontbijt date plannen",
        "Nieuwe matches bekijken"
      ];
    } else if (timeOfDay < 18) {
      return [
        "Chat responses verbeteren",
        "Date voor vanavond plannen",
        `${userStreak}-dagen streak behouden`
      ];
    } else {
      return [
        "Avond date evalueren",
        "Morgen doelen stellen",
        "Week voortgang bekijken"
      ];
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* AI Coach Avatar */}
      <div className="flex items-center justify-center mb-6">
        <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
          <span className="text-xl">🤖</span>
        </div>
      </div>

      {/* Personalized Greeting */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          {getCurrentGreeting()}, {user?.name?.split(' ')[0] || 'Dating Expert'}!
        </h1>
        <p className="text-gray-600 text-sm">
          Ik help je vandaag met je dating succes
        </p>
      </div>

      {/* Daily Objectives */}
      <div className="mb-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-pink-500" />
          <span className="text-sm font-medium text-gray-700">Vandaag focus op:</span>
        </div>

        <div className="space-y-3">
          {getPersonalizedObjectives().map((objective, index) => (
            <div
              key={index}
              className="flex items-center gap-3 bg-gray-50 rounded-lg p-3"
            >
              <div className="w-2 h-2 bg-pink-500 rounded-full flex-shrink-0"></div>
              <span className="text-sm text-gray-700">{objective}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Primary CTA */}
      <div>
        <Button
          onClick={onStartGuidedFlow}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-3 rounded-lg"
          size="lg"
        >
          <Play className="w-4 h-4 mr-2" />
          Start met mijn advies
        </Button>

        <p className="text-center text-xs text-gray-500 mt-3">
          Persoonlijke guided flow • 5 minuten
        </p>
      </div>
    </div>
  );
}