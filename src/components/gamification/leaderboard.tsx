'use client';

/**
 * Leaderboard Component - Privacy-aware rankings
 * Sprint 4: Gamification & Engagement
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy, Medal, Crown, Star, TrendingUp, Flame, Award
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  rank: number;
  userId: number;
  displayName: string;
  totalPoints: number;
  currentLevel: number;
  currentStreak: number;
  isCurrentUser: boolean;
}

interface LeaderboardProps {
  userId?: number;
  period?: 'today' | 'week' | 'month' | 'all_time';
  compact?: boolean;
}

export function Leaderboard({ userId, period = 'week', compact = false }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(period);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/gamification/leaderboard?userId=${userId}&period=${selectedPeriod}`);
        if (response.ok) {
          const data = await response.json();
          setEntries(data.entries || []);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [userId, selectedPeriod]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-400" />;
    return <Trophy className="w-5 h-5 text-purple-400" />;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' };
    if (rank === 2) return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' };
    if (rank === 3) return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' };
    return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
  };

  if (loading) {
    return (
      <Card className="border-2 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    // Compact view - show top 3
    const top3 = entries.slice(0, 3);

    return (
      <Card className="border-2 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-gray-900">Top 3 deze Week</h3>
          </div>

          <div className="space-y-3">
            {top3.map((entry) => {
              const rankStyles = getRankBadge(entry.rank);

              return (
                <div
                  key={entry.userId}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border-2",
                    entry.isCurrentUser ? "bg-purple-50 border-purple-300" : "bg-white border-gray-200"
                  )}
                >
                  <div className="flex-shrink-0">
                    {getRankIcon(entry.rank)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {entry.displayName}
                      {entry.isCurrentUser && " (jij)"}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Level {entry.currentLevel}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        {entry.currentStreak}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-sm font-bold text-purple-600">
                    <Star className="w-4 h-4" />
                    <span>{entry.totalPoints.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full leaderboard view
  return (
    <Card className="border-2 border-purple-200">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">Leaderboard</h2>
          </div>

          {/* Period Selector */}
          <div className="flex gap-2">
            {[
              { value: 'today', label: 'Vandaag' },
              { value: 'week', label: 'Week' },
              { value: 'month', label: 'Maand' },
              { value: 'all_time', label: 'All-Time' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedPeriod(option.value as any)}
                className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium transition-colors",
                  selectedPeriod === option.value
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard Entries */}
        <div className="space-y-3">
          {entries.map((entry, index) => {
            const rankStyles = getRankBadge(entry.rank);
            const isTopThree = entry.rank <= 3;

            return (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg border-2 transition-all",
                  entry.isCurrentUser
                    ? "bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300 shadow-md"
                    : isTopThree
                    ? `${rankStyles.bg} ${rankStyles.border}`
                    : "bg-white border-gray-200 hover:border-purple-200"
                )}
              >
                {/* Rank */}
                <div className="flex-shrink-0 w-12 flex items-center justify-center">
                  {isTopThree ? (
                    getRankIcon(entry.rank)
                  ) : (
                    <span className="text-lg font-bold text-gray-600">
                      #{entry.rank}
                    </span>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-bold truncate",
                    entry.isCurrentUser ? "text-purple-900" : "text-gray-900"
                  )}>
                    {entry.displayName}
                    {entry.isCurrentUser && (
                      <Badge className="ml-2 bg-purple-500 text-white">Jij</Badge>
                    )}
                  </p>
                  <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                    <span className="flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      Level {entry.currentLevel}
                    </span>
                    <span className="flex items-center gap-1">
                      <Flame className={cn(
                        "w-4 h-4",
                        entry.currentStreak > 0 ? "text-orange-500" : "text-gray-400"
                      )} />
                      {entry.currentStreak} dag{entry.currentStreak !== 1 ? 'en' : ''}
                    </span>
                  </div>
                </div>

                {/* Points */}
                <div className="flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <Star className={cn(
                      "w-5 h-5",
                      isTopThree ? "text-yellow-500" : "text-purple-500"
                    )} />
                    <span className={cn(
                      "text-lg font-bold",
                      entry.isCurrentUser ? "text-purple-600" : "text-gray-900"
                    )}>
                      {entry.totalPoints.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 text-right">punten</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Privacy Note */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600">
            🔒 Privacy: Alleen gebruikers die dit willen, zijn zichtbaar op de leaderboard.
            Je kunt je zichtbaarheid aanpassen in je profiel instellingen.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
