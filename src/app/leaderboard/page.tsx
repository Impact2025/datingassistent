'use client';

/**
 * Leaderboard Page - Dating Masters Rankings
 * Sprint 4: Gamification & Engagement
 */

import { useEffect, useState } from 'react';
import { useUser } from '@/providers/user-provider';
import { motion } from 'framer-motion';
import { Trophy, Crown, Medal, Award, Flame, Star, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface LeaderboardEntry {
  rank: number;
  userId: number;
  displayName: string;
  totalPoints: number;
  currentLevel: number;
  currentStreak: number;
  isCurrentUser: boolean;
}

export default function LeaderboardPage() {
  const { user } = useUser();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'week' | 'month' | 'all_time'>('all_time');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`/api/gamification/leaderboard?userId=${user.id}&period=${period}&limit=50`);
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
  }, [user?.id, period]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-8 h-8 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-8 h-8 text-gray-400" />;
    if (rank === 3) return <Medal className="w-8 h-8 text-amber-600" />;
    return <Award className="w-6 h-6 text-gray-400" />;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
    if (rank === 3) return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
    if (rank <= 10) return 'bg-purple-100 text-purple-700';
    return 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-purple-500 animate-bounce mx-auto mb-4" />
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Terug naar Dashboard
            </Button>
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Trophy className="w-10 h-10 text-purple-600" />
                Leaderboard
              </h1>
              <p className="text-gray-600">Wie zijn de beste dating masters?</p>
            </div>
          </div>

          {/* Period Filter */}
          <div className="flex gap-2 mt-6">
            <Button
              variant={period === 'week' ? 'default' : 'outline'}
              onClick={() => setPeriod('week')}
              className={period === 'week' ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              Deze Week
            </Button>
            <Button
              variant={period === 'month' ? 'default' : 'outline'}
              onClick={() => setPeriod('month')}
              className={period === 'month' ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              Deze Maand
            </Button>
            <Button
              variant={period === 'all_time' ? 'default' : 'outline'}
              onClick={() => setPeriod('all_time')}
              className={period === 'all_time' ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              All-Time
            </Button>
          </div>
        </div>

        {/* Top 3 Podium */}
        {entries.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {/* 2nd Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="order-1"
            >
              <Card className="border-2 border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 pt-12">
                <CardContent className="text-center p-4">
                  <Medal className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-700 mb-1">#{entries[1].rank}</p>
                  <p className="font-semibold text-gray-900 mb-1">{entries[1].displayName}</p>
                  <div className="flex items-center justify-center gap-1 text-purple-600">
                    <Star className="w-4 h-4" />
                    <span className="font-bold">{entries[1].totalPoints.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Level {entries[1].currentLevel}</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* 1st Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="order-2"
            >
              <Card className="border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-yellow-100">
                <CardContent className="text-center p-6">
                  <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-3 animate-pulse" />
                  <p className="text-3xl font-bold text-yellow-700 mb-2">👑 #{entries[0].rank}</p>
                  <p className="text-lg font-bold text-gray-900 mb-2">{entries[0].displayName}</p>
                  <div className="flex items-center justify-center gap-1 text-purple-600 text-xl">
                    <Star className="w-6 h-6" />
                    <span className="font-bold">{entries[0].totalPoints.toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Level {entries[0].currentLevel}</p>
                  {entries[0].currentStreak > 0 && (
                    <div className="flex items-center justify-center gap-1 mt-2 text-orange-600">
                      <Flame className="w-4 h-4" />
                      <span className="text-sm font-medium">{entries[0].currentStreak} dagen streak!</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* 3rd Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="order-3"
            >
              <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-amber-100 pt-12">
                <CardContent className="text-center p-4">
                  <Medal className="w-12 h-12 text-amber-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-amber-700 mb-1">#{entries[2].rank}</p>
                  <p className="font-semibold text-gray-900 mb-1">{entries[2].displayName}</p>
                  <div className="flex items-center justify-center gap-1 text-purple-600">
                    <Star className="w-4 h-4" />
                    <span className="font-bold">{entries[2].totalPoints.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Level {entries[2].currentLevel}</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Rest of Leaderboard */}
        <Card className="border-2 border-purple-200">
          <CardContent className="p-6">
            <div className="space-y-2">
              {entries.slice(3).map((entry, index) => (
                <motion.div
                  key={entry.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg transition-all",
                    entry.isCurrentUser
                      ? "bg-purple-100 border-2 border-purple-400"
                      : "bg-gray-50 hover:bg-gray-100"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <Badge className={cn("text-sm font-bold min-w-[40px] justify-center", getRankBadge(entry.rank))}>
                      #{entry.rank}
                    </Badge>
                    <div>
                      <p className={cn(
                        "font-semibold",
                        entry.isCurrentUser ? "text-purple-900" : "text-gray-900"
                      )}>
                        {entry.displayName}
                        {entry.isCurrentUser && " (You)"}
                      </p>
                      <p className="text-sm text-gray-600">Level {entry.currentLevel}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {entry.currentStreak > 0 && (
                      <div className="flex items-center gap-1 text-orange-600">
                        <Flame className="w-4 h-4" />
                        <span className="text-sm font-medium">{entry.currentStreak}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-purple-600">
                      <Star className="w-5 h-5" />
                      <span className="font-bold">{entry.totalPoints.toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
