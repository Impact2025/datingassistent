'use client';

/**
 * User Analytics Dashboard
 * Sprint 5: Analytics & Personalization
 *
 * Comprehensive analytics dashboard showing user progress, engagement, and insights
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  Award,
  BookOpen,
  Clock,
  Target,
  Zap,
  Calendar,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AnalyticsData {
  overview: {
    total_programs: number;
    completed_programs: number;
    total_lessons: number;
    completed_lessons: number;
    total_study_time_minutes: number;
    achievements_earned: number;
    current_streak_days: number;
    completion_rate: number;
  };
  weekly_progress: Array<{
    week: string;
    lessons_completed: number;
    study_time_minutes: number;
  }>;
  recent_activity: Array<{
    date: string;
    activity_type: string;
    title: string;
  }>;
  performance_metrics: {
    average_quiz_score: number;
    quiz_pass_rate: number;
    completion_speed: string; // 'fast' | 'average' | 'slow'
  };
}

interface UserAnalyticsDashboardProps {
  userId?: number;
}

export function UserAnalyticsDashboard({ userId }: UserAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [userId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics/user');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-coral-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-gray-600">
          Geen analytics data beschikbaar
        </CardContent>
      </Card>
    );
  }

  const { overview, weekly_progress, recent_activity, performance_metrics } = analytics;

  // Calculate trends
  const weeklyTrend = weekly_progress.length >= 2
    ? weekly_progress[weekly_progress.length - 1].lessons_completed >
      weekly_progress[weekly_progress.length - 2].lessons_completed
    : null;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Completed Lessons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-2 border-coral-200 hover:border-coral-300 transition-colors">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-coral-500 to-coral-600 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600">Lessen Voltooid</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {overview.completed_lessons}
                  </p>
                </div>
              </div>
              <Progress value={(overview.completed_lessons / overview.total_lessons) * 100} className="h-2" />
              <p className="text-xs text-gray-500 mt-2">
                van {overview.total_lessons} totaal
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Study Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-2 border-purple-200 hover:border-purple-300 transition-colors">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600">Studietijd</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {Math.floor(overview.total_study_time_minutes / 60)}h
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {overview.total_study_time_minutes % 60}m totaal
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-2 border-yellow-200 hover:border-yellow-300 transition-colors">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600">Achievements</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {overview.achievements_earned}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">badges verdiend</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Streak */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-2 border-orange-200 hover:border-orange-300 transition-colors">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600">Streak</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {overview.current_streak_days}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">dagen achter elkaar</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Completion Rate */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Voltooiingspercentage</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-coral-600">
                  {overview.completion_rate}%
                </span>
                {weeklyTrend !== null && (
                  weeklyTrend ? (
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  )
                )}
              </div>
            </div>
            <Progress value={overview.completion_rate} className="h-3" />
          </div>

          {/* Quiz Performance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-900 mb-1">Gemiddelde Quiz Score</p>
              <p className="text-2xl font-bold text-blue-700">
                {performance_metrics.average_quiz_score}%
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-900 mb-1">Quiz Slagingspercentage</p>
              <p className="text-2xl font-bold text-green-700">
                {performance_metrics.quiz_pass_rate}%
              </p>
            </div>
          </div>

          {/* Learning Speed */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Leersnelheid</span>
            </div>
            <Badge
              variant={
                performance_metrics.completion_speed === 'fast' ? 'default' :
                performance_metrics.completion_speed === 'average' ? 'secondary' :
                'outline'
              }
            >
              {performance_metrics.completion_speed === 'fast' && '🚀 Snel'}
              {performance_metrics.completion_speed === 'average' && '📊 Gemiddeld'}
              {performance_metrics.completion_speed === 'slow' && '🐢 Rustig'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Recente Activiteit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recent_activity.length === 0 ? (
              <p className="text-sm text-gray-600 text-center py-4">
                Nog geen activiteit geregistreerd
              </p>
            ) : (
              recent_activity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-2 h-2 bg-coral-500 rounded-full mt-2" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-600">
                      {activity.activity_type} • {new Date(activity.date).toLocaleDateString('nl-NL')}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
