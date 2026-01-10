'use client';

/**
 * Iris Insights Panel - Context-aware AI tips en insights
 * Toont slimme suggesties gebaseerd op huidige pagina en user activiteit
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, X, Lightbulb, TrendingUp, Heart, Zap,
  ChevronDown, ChevronUp, MessageCircle
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

interface Insight {
  id: string;
  type: 'tip' | 'insight' | 'encouragement' | 'next_step';
  icon: any;
  title: string;
  message: string;
  actionText?: string;
  actionHref?: string;
  actionTab?: string;
  color: string;
}

interface IrisInsightsPanelProps {
  currentTab?: string;
  userId?: number;
  onTabChange?: (tab: string) => void;
}

export function IrisInsightsPanel({ currentTab, userId, onTabChange }: IrisInsightsPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentInsight, setCurrentInsight] = useState<Insight | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [insightIndex, setInsightIndex] = useState(0);

  useEffect(() => {
    // Genereer context-aware insights op basis van huidige tab
    const contextInsights = generateContextInsights(currentTab || 'home');
    setInsights(contextInsights);
    setCurrentInsight(contextInsights[0] || null);
    setInsightIndex(0);
  }, [currentTab]);

  const generateContextInsights = (tab: string): Insight[] => {
    const insightsByTab: Record<string, Insight[]> = {
      home: [
        {
          id: 'home-welcome',
          type: 'tip',
          icon: Sparkles,
          title: 'Welkom terug!',
          message: 'Begin je dag met een check-in. Hoe voel je je over je dating journey?',
          actionText: 'Praat met Iris',
          actionTab: 'coach',
          color: 'pink'
        },
        {
          id: 'home-progress',
          type: 'insight',
          icon: TrendingUp,
          title: 'Je groeit!',
          message: 'Je hebt al 3 assessments voltooid. Dat is geweldig vooruitgang!',
          actionText: 'Bekijk Voortgang',
          actionTab: 'pad',
          color: 'purple'
        }
      ],
      pad: [
        {
          id: 'pad-phase-tip',
          type: 'tip',
          icon: Lightbulb,
          title: 'Focus op één fase',
          message: 'Werk de tools in je huidige fase af voordat je verder gaat. Kwaliteit > snelheid!',
          color: 'blue'
        },
        {
          id: 'pad-next-step',
          type: 'next_step',
          icon: Zap,
          title: 'Volgende stap',
          message: 'Klaar om verder te gaan? Probeer de Hechtingsstijl Scan voor dieper inzicht.',
          actionText: 'Start Scan',
          actionHref: '/hechtingsstijl',
          color: 'pink'
        }
      ],
      coach: [
        {
          id: 'coach-tip',
          type: 'tip',
          icon: MessageCircle,
          title: 'Wees specifiek',
          message: 'Hoe specifieker je vraag, hoe beter ik je kan helpen. Deel context over je situatie!',
          color: 'purple'
        },
        {
          id: 'coach-encouragement',
          type: 'encouragement',
          icon: Heart,
          title: 'Je doet het goed',
          message: 'Het stellen van de juiste vragen is al de helft van de oplossing. Blijf groeien!',
          color: 'rose'
        }
      ],
      profiel: [
        {
          id: 'profiel-photo-tip',
          type: 'tip',
          icon: Lightbulb,
          title: 'Foto kwaliteit',
          message: 'Een goede profielfoto is natuurlijk licht, oprechte glimlach, en oogcontact met de camera.',
          actionText: 'Upload Foto',
          actionTab: 'profiel',
          color: 'indigo'
        },
        {
          id: 'profiel-bio-tip',
          type: 'tip',
          icon: Sparkles,
          title: 'Authentieke bio',
          message: 'Vertel een mini-verhaal in je bio. Wat maakt jou uniek? Wat zoek je echt?',
          actionText: 'Schrijf Bio',
          actionTab: 'profiel',
          color: 'green'
        }
      ]
    };

    return insightsByTab[tab] || insightsByTab.home;
  };

  const handleNextInsight = () => {
    const nextIndex = (insightIndex + 1) % insights.length;
    setInsightIndex(nextIndex);
    setCurrentInsight(insights[nextIndex]);
  };

  const handleAction = (insight: Insight) => {
    if (insight.actionHref) {
      window.location.href = insight.actionHref;
    } else if (insight.actionTab) {
      onTabChange?.(insight.actionTab);
    }
  };

  if (!isOpen || !currentInsight) return null;

  const Icon = currentInsight.icon;

  const colorClasses: Record<string, string> = {
    pink: 'bg-pink-500',
    purple: 'bg-purple-500',
    blue: 'bg-blue-500',
    indigo: 'bg-indigo-500',
    green: 'bg-green-500',
    rose: 'bg-rose-500',
    teal: 'bg-teal-500'
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="fixed right-6 bottom-6 z-50 w-80"
      >
        <Card className="border-2 border-pink-200 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className={cn(
            "p-4 text-white flex items-center justify-between",
            colorClasses[currentInsight.color] || 'bg-pink-500'
          )}>
            <div className="flex items-center gap-2">
              <Icon className="w-5 h-5" />
              <span className="font-semibold">Iris Insights</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                {isMinimized ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          {!isMinimized && (
            <CardContent className="p-4 space-y-4">
              {/* Insight Type Badge */}
              <Badge variant="secondary" className="text-xs">
                {currentInsight.type === 'tip' && '💡 Tip'}
                {currentInsight.type === 'insight' && '✨ Inzicht'}
                {currentInsight.type === 'encouragement' && '❤️ Motivatie'}
                {currentInsight.type === 'next_step' && '⚡ Volgende Stap'}
              </Badge>

              {/* Insight Content */}
              <div className="space-y-2">
                <h4 className="font-bold text-gray-900 dark:text-white">{currentInsight.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {currentInsight.message}
                </p>
              </div>

              {/* Action Button */}
              {currentInsight.actionText && (
                <Button
                  onClick={() => handleAction(currentInsight)}
                  className={cn(
                    "w-full text-white",
                    colorClasses[currentInsight.color] || 'bg-pink-500'
                  )}
                  size="sm"
                >
                  {currentInsight.actionText}
                </Button>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-2 border-t dark:border-gray-700">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Tip {insightIndex + 1} van {insights.length}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNextInsight}
                  className="text-xs"
                >
                  Volgende tip
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
