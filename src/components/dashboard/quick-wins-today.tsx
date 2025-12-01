"use client";

/**
 * Quick Wins Today Component
 * Toont 3 kleine, direct uitvoerbare taken voor vandaag
 * Verhoogt engagement en geeft gebruikers snelle successen
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2, Circle, Sparkles, TrendingUp,
  MessageCircle, Camera, FileText, Target, Zap
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

interface QuickWin {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: any;
  color: string;
  action: () => void;
  completed: boolean;
}

interface QuickWinsTodayProps {
  userId?: number;
  onTabChange?: (tab: string) => void;
}

export function QuickWinsToday({ userId, onTabChange }: QuickWinsTodayProps) {
  const [wins, setWins] = useState<QuickWin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateQuickWins();
  }, [userId]);

  const generateQuickWins = async () => {
    try {
      // Fetch user's progress to determine which wins to show
      const completedToday = JSON.parse(
        localStorage.getItem(`quick_wins_${userId}_${new Date().toDateString()}`) || '[]'
      );

      // Smart quick wins based on user behavior
      const allWins: QuickWin[] = [
        {
          id: 'chat-coach',
          title: 'Stel 1 vraag aan je coach',
          description: '💬 Krijg direct advies',
          points: 50,
          icon: MessageCircle,
          color: 'blue',
          action: () => onTabChange?.('coach'),
          completed: completedToday.includes('chat-coach')
        },
        {
          id: 'start-cursus',
          title: 'Start een nieuwe cursus',
          description: '📚 Leer iets nieuws vandaag',
          points: 100,
          icon: FileText,
          color: 'purple',
          action: () => onTabChange?.('leren'),
          completed: completedToday.includes('start-cursus')
        },
        {
          id: 'complete-assessment',
          title: 'Doe een quick assessment',
          description: '🎯 Ontdek je sterktes',
          points: 75,
          icon: Target,
          color: 'green',
          action: () => onTabChange?.('leren'),
          completed: completedToday.includes('complete-assessment')
        },
        {
          id: 'update-profile',
          title: 'Update je profiel',
          description: '📸 Voeg een nieuwe foto toe',
          points: 50,
          icon: Camera,
          color: 'pink',
          action: () => onTabChange?.('profiel'),
          completed: completedToday.includes('update-profile')
        },
        {
          id: 'daily-check',
          title: 'Check je voortgang',
          description: '📊 Zie wat je hebt bereikt',
          points: 25,
          icon: TrendingUp,
          color: 'orange',
          action: () => onTabChange?.('pad'),
          completed: completedToday.includes('daily-check')
        }
      ];

      // Select 3 wins: prioritize incomplete ones
      const incompleteWins = allWins.filter(w => !w.completed);
      const selectedWins = incompleteWins.length >= 3
        ? incompleteWins.slice(0, 3)
        : [...incompleteWins, ...allWins.filter(w => w.completed).slice(0, 3 - incompleteWins.length)];

      setWins(selectedWins);
    } catch (error) {
      console.error('Error generating quick wins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteWin = (winId: string) => {
    const completedToday = JSON.parse(
      localStorage.getItem(`quick_wins_${userId}_${new Date().toDateString()}`) || '[]'
    );

    if (!completedToday.includes(winId)) {
      completedToday.push(winId);
      localStorage.setItem(
        `quick_wins_${userId}_${new Date().toDateString()}`,
        JSON.stringify(completedToday)
      );

      // Update local state
      setWins(prevWins =>
        prevWins.map(win =>
          win.id === winId ? { ...win, completed: true } : win
        )
      );

      // Award points via gamification system
      fetch('/api/gamification/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          actionType: 'quick_win',
          metadata: { winId }
        })
      }).catch(err => console.error('Failed to track quick win:', err));
    }
  };

  const completedCount = wins.filter(w => w.completed).length;
  const totalPoints = wins.filter(w => w.completed).reduce((sum, w) => sum + w.points, 0);

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600 border-blue-200',
    purple: 'bg-purple-100 text-purple-600 border-purple-200',
    green: 'bg-green-100 text-green-600 border-green-200',
    pink: 'bg-pink-100 text-pink-600 border-pink-200',
    orange: 'bg-orange-100 text-orange-600 border-orange-200'
  };

  if (loading) {
    return (
      <Card className="shadow-sm animate-pulse">
        <CardContent className="p-6">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="shadow-sm border-2 border-pink-100">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-pink-500" />
              <h2 className="text-lg font-semibold text-gray-900">Quick Wins Vandaag</h2>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {completedCount}/3 voltooid
              </Badge>
              {totalPoints > 0 && (
                <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                  +{totalPoints} pts
                </Badge>
              )}
            </div>
          </div>

          {/* Progress bar */}
          {completedCount > 0 && (
            <div className="mb-4">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedCount / 3) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}

          {/* Wins List */}
          <div className="space-y-3">
            {wins.map((win, index) => {
              const IconComponent = win.icon;
              return (
                <motion.div
                  key={win.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border-2 transition-all",
                    win.completed
                      ? "bg-green-50 border-green-200 opacity-75"
                      : "bg-white border-gray-200 hover:border-pink-300 hover:shadow-sm cursor-pointer"
                  )}
                  onClick={() => {
                    if (!win.completed) {
                      win.action();
                      handleCompleteWin(win.id);
                    }
                  }}
                >
                  {/* Checkbox */}
                  <div className="flex-shrink-0">
                    {win.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-400" />
                    )}
                  </div>

                  {/* Icon */}
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                    win.completed ? "bg-green-100 text-green-600" : colorMap[win.color]
                  )}>
                    <IconComponent className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-medium",
                      win.completed ? "text-gray-600 line-through" : "text-gray-900"
                    )}>
                      {win.title}
                    </p>
                    <p className="text-xs text-gray-500">{win.description}</p>
                  </div>

                  {/* Points */}
                  {!win.completed && (
                    <Badge variant="outline" className="text-xs">
                      +{win.points}
                    </Badge>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Completion Message */}
          {completedCount === 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200 text-center"
            >
              <Sparkles className="w-6 h-6 text-pink-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-900">
                Geweldig! Je hebt alle Quick Wins voltooid! 🎉
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Kom morgen terug voor nieuwe uitdagingen
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
