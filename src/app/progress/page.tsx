'use client';

/**
 * Progress Page - Detailed Gamification Stats & Challenges
 * Sprint 4: Gamification & Engagement
 */

import { useEffect, useState } from 'react';
import { useUser } from '@/providers/user-provider';
import { motion } from 'framer-motion';
import {
  Trophy, Crown, Flame, Star, Target, TrendingUp,
  Award, CheckCircle2, Lock, ArrowLeft, Zap
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { GamificationWidget } from '@/components/gamification/gamification-widget';

export default function ProgressPage() {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
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
                Jouw Progress
              </h1>
              <p className="text-gray-600">Volg je punten, streaks en challenges</p>
            </div>

            <Link href="/leaderboard">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Trophy className="w-4 h-4 mr-2" />
                Leaderboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content - Full Gamification Widget */}
        {user?.id && (
          <GamificationWidget userId={user.id} compact={false} />
        )}

        {/* Quick Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Zap className="w-8 h-8 text-purple-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">💡 Tips om Punten te Verdienen</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Log dagelijks in</strong> - Bouw je streak op voor bonus multipliers (tot 5x punten!)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Voltooi challenges</strong> - Dagelijkse challenges geven direct punten</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Gebruik tools</strong> - Elke tool die je gebruikt geeft punten</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Chat met Iris</strong> - Interactie met je AI coach geeft punten</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Voltooi assessments</strong> - Grote punt bonussen voor het voltooien van assessments</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Streak Bonuses Explanation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6"
        >
          <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Flame className="w-8 h-8 text-orange-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    🔥 Streak Bonussen
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">1-2 dagen</p>
                      <p className="text-lg font-bold text-gray-900">1x</p>
                      <p className="text-xs text-gray-500">Basis punten</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-green-200">
                      <p className="text-xs text-gray-600 mb-1">3-6 dagen</p>
                      <p className="text-lg font-bold text-green-600">1.5x</p>
                      <p className="text-xs text-gray-500">Goede start!</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-blue-200">
                      <p className="text-xs text-gray-600 mb-1">7-13 dagen</p>
                      <p className="text-lg font-bold text-blue-600">2x</p>
                      <p className="text-xs text-gray-500">Week warrior</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-purple-200">
                      <p className="text-xs text-gray-600 mb-1">14-29 dagen</p>
                      <p className="text-lg font-bold text-purple-600">3x</p>
                      <p className="text-xs text-gray-500">Dedicated!</p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-3 rounded-lg border-2 border-orange-300">
                      <p className="text-xs text-gray-600 mb-1">30+ dagen</p>
                      <p className="text-lg font-bold text-orange-600">5x</p>
                      <p className="text-xs text-orange-600 font-medium">🔥 LEGEND!</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
