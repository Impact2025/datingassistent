"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Star,
  Lightbulb,
  TrendingUp,
  Flame,
  Target,
  Heart,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SmartCard {
  id: string;
  type: 'achievement' | 'opportunity' | 'progress' | 'insight' | 'motivation';
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  progress?: number;
  target?: number;
  badge?: string;
  priority: 'high' | 'medium' | 'low';
}

interface AISmartFlowProps {
  className?: string;
}

export function AISmartFlow({ className }: AISmartFlowProps) {
  const [smartCards, setSmartCards] = useState<SmartCard[]>([]);

  // Generate personalized smart cards based on user data
  useEffect(() => {
    // This would be replaced with real AI logic based on user behavior
    const mockSmartCards: SmartCard[] = [
      {
        id: 'achievement-1',
        type: 'achievement',
        icon: <Star className="w-5 h-5 text-yellow-500" />,
        title: 'Goed bezig gisteren!',
        description: 'Je hebt je eerste profiel update voltooid. Dat is een grote stap!',
        badge: '🏆 Eerste succes',
        priority: 'high',
      },
      {
        id: 'opportunity-1',
        type: 'opportunity',
        icon: <Lightbulb className="w-5 h-5 text-blue-500" />,
        title: 'Profielscore +12% mogelijk',
        description: 'Met een betere profielfoto kan je score aanzienlijk verbeteren.',
        actionText: 'Verbeter Nu',
        onAction: () => console.log('Navigate to profile improvement'),
        priority: 'high',
      },
      {
        id: 'progress-1',
        type: 'progress',
        icon: <TrendingUp className="w-5 h-5 text-green-500" />,
        title: 'Weekscore: 65%',
        description: 'Je bent goed op weg! Nog 35% naar je doel.',
        progress: 65,
        target: 100,
        priority: 'medium',
      },
      {
        id: 'insight-1',
        type: 'insight',
        icon: <Flame className="w-5 h-5 text-orange-500" />,
        title: 'Nieuwe match analyse klaar',
        description: 'Ik heb je laatste matches geanalyseerd. Er zijn interessante inzichten!',
        actionText: 'Bekijk Analyse',
        onAction: () => console.log('Navigate to match analysis'),
        priority: 'high',
      },
      {
        id: 'motivation-1',
        type: 'motivation',
        icon: <Heart className="w-5 h-5 text-pink-500" />,
        title: 'Nieuwe date ideeën',
        description: 'Gepersonaliseerde date suggesties gebaseerd op jouw interesses.',
        actionText: 'Ontdek Ideeën',
        onAction: () => console.log('Navigate to date ideas'),
        priority: 'medium',
      },
    ];

    setSmartCards(mockSmartCards);
  }, []);

  const getCardStyle = (type: SmartCard['type'], priority: SmartCard['priority']) => {
    const baseClasses = "p-4 cursor-pointer transition-all duration-200 hover:shadow-md border-0";

    const typeStyles = {
      achievement: "bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-l-yellow-400",
      opportunity: "bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-400",
      progress: "bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-l-green-400",
      insight: "bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-l-orange-400",
      motivation: "bg-gradient-to-r from-pink-50 to-rose-50 border-l-4 border-l-pink-400",
    };

    return cn(baseClasses, typeStyles[type]);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">AI Aanbevelingen</h2>
        <Badge variant="secondary" className="text-xs bg-pink-100 text-pink-700">
          Persoonlijk
        </Badge>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {smartCards.map((card) => (
          <Card
            key={card.id}
            className={getCardStyle(card.type, card.priority)}
            onClick={card.onAction}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {card.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900 text-sm">
                    {card.title}
                  </h3>
                  {card.badge && (
                    <Badge variant="outline" className="text-xs ml-2">
                      {card.badge}
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-3">
                  {card.description}
                </p>

                {/* Progress bar for progress type */}
                {card.type === 'progress' && card.progress !== undefined && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Voortgang</span>
                      <span>{card.progress}%</span>
                    </div>
                    <Progress value={card.progress} className="h-2" />
                  </div>
                )}

                {/* Action button */}
                {card.actionText && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs h-8 border-pink-200 text-pink-700 hover:bg-pink-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      card.onAction?.();
                    }}
                  >
                    {card.actionText}
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Load more indicator */}
      <div className="text-center pt-2">
        <Button variant="ghost" size="sm" className="text-xs text-gray-500">
          Meer aanbevelingen laden
        </Button>
      </div>
    </div>
  );
}