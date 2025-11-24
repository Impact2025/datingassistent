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
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
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
  const [refreshing, setRefreshing] = useState(false);
  const [visibleCards, setVisibleCards] = useState(3);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Generate personalized smart cards based on user data
  const generateSmartCards = () => {
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
      {
        id: 'streak-1',
        type: 'achievement',
        icon: <Flame className="w-5 h-5 text-orange-500" />,
        title: '7-dagen streak!',
        description: 'Je bent een week actief geweest. Dat verdient een feestje! 🎉',
        badge: '🔥 Streak Master',
        priority: 'high',
      },
    ];

    return mockSmartCards;
  };

  useEffect(() => {
    setSmartCards(generateSmartCards());
  }, []);

  // Pull-to-refresh functionality
  const handleRefresh = async () => {
    setRefreshing(true);

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate fresh recommendations
    const newCards = generateSmartCards();
    // Shuffle and add some new insights
    const shuffled = [...newCards].sort(() => Math.random() - 0.5);
    setSmartCards(shuffled);

    setRefreshing(false);
  };

  // Load more cards
  const loadMoreCards = () => {
    setVisibleCards(prev => Math.min(prev + 2, smartCards.length));
  };

  // Intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCards < smartCards.length) {
          loadMoreCards();
        }
      },
      { threshold: 0.1 }
    );

    if (scrollRef.current) {
      observer.observe(scrollRef.current);
    }

    return () => observer.disconnect();
  }, [visibleCards, smartCards.length]);

  const getCardStyle = (type: SmartCard['type'], priority: SmartCard['priority']) => {
    const baseClasses = "bg-white border border-gray-200 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50";

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

      {/* Pull-to-refresh container */}
      <div className="relative">
        {refreshing && (
          <motion.div
            className="absolute top-0 left-0 right-0 z-10 bg-white/80 backdrop-blur-sm rounded-lg p-3 flex items-center justify-center gap-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw className="w-4 h-4 text-pink-500" />
            </motion.div>
            <span className="text-sm text-gray-600">AI denkt na...</span>
          </motion.div>
        )}

        <motion.div
          className="space-y-3 max-h-96 overflow-y-auto"
          animate={refreshing ? { y: 60 } : { y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AnimatePresence mode="popLayout">
            {smartCards.slice(0, visibleCards).map((card, index) => (
              <motion.div
                key={card.id}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                custom={index}
                layout
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div
                    className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50"
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
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Load more trigger */}
        <div ref={scrollRef} className="h-4" />

        {/* Load more indicator */}
        {visibleCards < smartCards.length && (
          <motion.div
            className="text-center pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-gray-500"
                onClick={() => setVisibleCards(prev => Math.min(prev + 2, smartCards.length))}
              >
                Meer aanbevelingen laden
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* Pull-to-refresh hint */}
        <motion.div
          className="text-center pt-2 opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 2 }}
        >
          <p className="text-xs text-gray-400">↓ Pull to refresh voor nieuwe inzichten</p>
        </motion.div>
      </div>
    </motion.div>
  );
}