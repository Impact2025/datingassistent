"use client";

import { useState, useEffect, useRef } from 'react';
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
  CheckCircle,
  RefreshCw,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  userId?: number;
}

export function AISmartFlow({ className, userId }: AISmartFlowProps) {
    const [smartCards, setSmartCards] = useState<SmartCard[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [visibleCards, setVisibleCards] = useState(3);
    const [recommendations, setRecommendations] = useState<any[]>([]);

  // Generate personalized smart cards based on user data and AI recommendations
  const generateSmartCards = (recommendations: any[] = []) => {
    const smartCards: SmartCard[] = [];

    // Convert AI recommendations to smart cards
    recommendations.forEach((rec, index) => {
      let cardType: SmartCard['type'] = 'insight';
      let icon: React.ReactNode;
      let actionText: string | undefined;
      let onAction: (() => void) | undefined;

      // Determine card type and icon based on recommendation type
      switch (rec.type) {
        case 'module':
          cardType = 'opportunity';
          icon = <BookOpen className="w-5 h-5 text-blue-500" />;
          actionText = 'Start Module';
          onAction = () => console.log(`Navigate to module ${rec.id}`);
          break;
        case 'course':
          cardType = 'opportunity';
          icon = <Target className="w-5 h-5 text-green-500" />;
          actionText = 'Bekijk Cursus';
          onAction = () => console.log(`Navigate to course ${rec.id}`);
          break;
        case 'feature':
          cardType = 'insight';
          icon = <Lightbulb className="w-5 h-5 text-purple-500" />;
          actionText = 'Probeer Uit';
          onAction = () => console.log(`Navigate to feature ${rec.id}`);
          break;
        default:
          cardType = 'insight';
          icon = <Sparkles className="w-5 h-5 text-pink-500" />;
      }

      // Determine priority based on confidence
      let priority: SmartCard['priority'] = 'medium';
      if (rec.confidence >= 0.8) priority = 'high';
      else if (rec.confidence <= 0.4) priority = 'low';

      smartCards.push({
        id: `rec-${rec.type}-${rec.id}-${index}`,
        type: cardType,
        icon,
        title: rec.title,
        description: rec.reason,
        actionText,
        onAction,
        priority,
      });
    });

    // Add some default smart cards if we don't have enough recommendations
    if (smartCards.length < 3) {
      // Add achievement/progress cards
      smartCards.push({
        id: 'progress-weekly',
        type: 'progress',
        icon: <TrendingUp className="w-5 h-5 text-green-500" />,
        title: 'Deze week actief',
        description: 'Je bent goed op weg! Blijf consistent voor de beste resultaten.',
        progress: 75,
        target: 100,
        priority: 'medium',
      });

      smartCards.push({
        id: 'motivation-daily',
        type: 'motivation',
        icon: <Heart className="w-5 h-5 text-pink-500" />,
        title: 'Dagelijkse reminder',
        description: 'Elke stap telt. Je dating succes is een marathon, geen sprint.',
        priority: 'low',
      });
    }

    // Limit to 6 cards max
    return smartCards.slice(0, 6);
  };

  // Fetch real AI recommendations
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!userId) return;

      try {
        const response = await fetch(`/api/recommendations?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setRecommendations(data.recommendations || []);
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        // Fallback to empty array
        setRecommendations([]);
      }
    };

    fetchRecommendations();
  }, [userId]);

  // Generate smart cards based on recommendations
  useEffect(() => {
    const cards = generateSmartCards(recommendations);
    setSmartCards(cards);
  }, [recommendations]);

  // Pull-to-refresh functionality
  const handleRefresh = async () => {
    setRefreshing(true);

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Fetch fresh recommendations if userId is available
    if (userId) {
      try {
        const response = await fetch(`/api/recommendations?userId=${userId}&refresh=true`);
        if (response.ok) {
          const data = await response.json();
          setRecommendations(data.recommendations || []);
        }
      } catch (error) {
        console.error('Error refreshing recommendations:', error);
        // Fallback: regenerate cards with current recommendations
        const newCards = generateSmartCards(recommendations);
        const shuffled = [...newCards].sort(() => Math.random() - 0.5);
        setSmartCards(shuffled);
      }
    } else {
      // Fallback for users without ID
      const newCards = generateSmartCards(recommendations);
      const shuffled = [...newCards].sort(() => Math.random() - 0.5);
      setSmartCards(shuffled);
    }

    setRefreshing(false);
  };

  // Load more cards
   const loadMoreCards = () => {
     setVisibleCards(prev => Math.min(prev + 2, smartCards.length));
   };

  const getCardStyle = (type: SmartCard['type'], priority: SmartCard['priority']) => {
    const baseClasses = "bg-white border border-gray-200 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:border-pink-200 hover:bg-pink-50/30 active:scale-98";

    return baseClasses;
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <motion.div
      className={cn("space-y-3", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          AI Aanbevelingen
        </h2>
        <Badge variant="secondary" className="text-xs bg-pink-100 text-pink-700">
          Persoonlijk
        </Badge>
      </div>

      {/* Smart Cards Container */}
      <div className="relative">
        {refreshing && (
          <div className="absolute top-0 left-0 right-0 z-10 bg-white/90 border border-gray-200 rounded-lg p-3 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 text-pink-500 animate-spin" />
            <span className="text-sm text-gray-600">AI denkt na...</span>
          </div>
        )}

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {smartCards.slice(0, visibleCards).map((card, index) => (
            <div
              key={card.id}
              className={getCardStyle(card.type, card.priority)}
              onClick={card.onAction}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {card.icon}
                </div>

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
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
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
            </div>
          ))}
        </div>

        {/* Load more indicator */}
        {visibleCards < smartCards.length && (
          <div className="text-center pt-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-500"
              onClick={() => setVisibleCards(prev => Math.min(prev + 2, smartCards.length))}
            >
              Meer aanbevelingen laden
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}