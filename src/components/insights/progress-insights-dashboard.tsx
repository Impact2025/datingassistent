'use client';

/**
 * Progress Insights Dashboard
 * Sprint 5.3: Progress Insights & Prediction System
 *
 * Displays predictive analytics and personalized learning insights
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  Calendar,
  Target,
  Clock,
  Zap,
  Lightbulb,
  Award,
  CheckCircle2,
  AlertCircle,
  Star,
  Brain
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ProgressPrediction {
  program_id: number;
  program_title: string;
  current_progress_percentage: number;
  lessons_completed: number;
  lessons_remaining: number;
  estimated_completion_date: string;
  days_until_completion: number;
  confidence_level: 'high' | 'medium' | 'low';
}

interface LearningPattern {
  best_time_of_day: string;
  most_productive_day: string;
  average_session_duration_minutes: number;
  preferred_content_type: string;
  consistency_score: number;
  streak_potential: number;
}

interface OptimalSchedule {
  recommended_study_times: Array<{
    day: string;
    time: string;
    duration_minutes: number;
    reason: string;
  }>;
  weekly_goal_minutes: number;
  lessons_per_week: number;
}

interface MilestoneProjection {
  milestone: string;
  estimated_date: string;
  confidence: number;
  description: string;
}

interface LearningTip {
  category: 'motivation' | 'efficiency' | 'retention' | 'engagement';
  tip: string;
  priority: 'high' | 'medium' | 'low';
}

interface InsightsData {
  predictions: ProgressPrediction[] | null;
  patterns: LearningPattern | null;
  schedule: OptimalSchedule | null;
  milestones: MilestoneProjection[] | null;
  tips: LearningTip[] | null;
}

export function ProgressInsightsDashboard() {
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/insights');

      if (!response.ok) {
        throw new Error('Failed to load insights');
      }

      const data = await response.json();
      setInsights(data);
    } catch (err) {
      console.error('Error loading insights:', err);
      setError(err instanceof Error ? err.message : 'Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceBadge = (level: string) => {
    const variants = {
      high: { variant: 'default' as const, label: 'Hoge zekerheid', color: 'text-green-600' },
      medium: { variant: 'secondary' as const, label: 'Gemiddelde zekerheid', color: 'text-yellow-600' },
      low: { variant: 'outline' as const, label: 'Lage zekerheid', color: 'text-gray-600' }
    };
    return variants[level as keyof typeof variants] || variants.medium;
  };

  const getTipIcon = (category: string) => {
    switch (category) {
      case 'motivation': return <Zap className="w-4 h-4" />;
      case 'efficiency': return <Target className="w-4 h-4" />;
      case 'retention': return <Brain className="w-4 h-4" />;
      case 'engagement': return <Star className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card className="border-2 border-purple-200">
        <CardContent className="p-12">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadInsights}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Probeer opnieuw
          </button>
        </CardContent>
      </Card>
    );
  }

  if (!insights) return null;

  const { predictions, patterns, schedule, milestones, tips } = insights;

  return (
    <div className="space-y-6">
      {/* Program Completion Predictions */}
      {predictions && predictions.length > 0 && (
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Voltooiingsvoorspellingen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {predictions.map((pred, index) => (
              <motion.div
                key={pred.program_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{pred.program_title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Verwacht klaar: {formatDate(pred.estimated_completion_date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <Clock className="w-4 h-4" />
                      <span>Nog {pred.days_until_completion} dagen te gaan</span>
                    </div>
                  </div>
                  <Badge {...getConfidenceBadge(pred.confidence_level)}>
                    {getConfidenceBadge(pred.confidence_level).label}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{pred.lessons_completed} / {pred.lessons_completed + pred.lessons_remaining} lessen</span>
                    <span>{pred.current_progress_percentage}%</span>
                  </div>
                  <Progress value={pred.current_progress_percentage} className="h-3" />
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Learning Patterns */}
      {patterns && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              Jouw Leerpatronen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-900">Beste Tijd</span>
                </div>
                <p className="text-lg font-bold text-blue-700 capitalize">
                  {patterns.best_time_of_day === 'morning' && '🌅 Ochtend'}
                  {patterns.best_time_of_day === 'afternoon' && '☀️ Middag'}
                  {patterns.best_time_of_day === 'evening' && '🌆 Avond'}
                  {patterns.best_time_of_day === 'night' && '🌙 Nacht'}
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-900">Productieve Dag</span>
                </div>
                <p className="text-lg font-bold text-green-700">{patterns.most_productive_day}</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-semibold text-purple-900">Gem. Sessie</span>
                </div>
                <p className="text-lg font-bold text-purple-700">
                  {patterns.average_session_duration_minutes} min
                </p>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-semibold text-yellow-900">Consistentie</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={patterns.consistency_score} className="flex-1 h-2" />
                  <span className="text-sm font-bold text-yellow-700">{patterns.consistency_score}%</span>
                </div>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-semibold text-orange-900">Streak Potentieel</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={patterns.streak_potential} className="flex-1 h-2" />
                  <span className="text-sm font-bold text-orange-700">{patterns.streak_potential}%</span>
                </div>
              </div>

              <div className="p-4 bg-pink-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-pink-600" />
                  <span className="text-sm font-semibold text-pink-900">Favoriete Content</span>
                </div>
                <p className="text-lg font-bold text-pink-700 capitalize">{patterns.preferred_content_type}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Optimal Schedule */}
      {schedule && schedule.recommended_study_times.length > 0 && (
        <Card className="border-2 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              Jouw Optimale Studieschema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-900 mb-1">Weekdoel</p>
                <p className="text-2xl font-bold text-green-700">
                  {Math.floor(schedule.weekly_goal_minutes / 60)}h {schedule.weekly_goal_minutes % 60}m
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-900 mb-1">Lessen per week</p>
                <p className="text-2xl font-bold text-green-700">{schedule.lessons_per_week}</p>
              </div>
            </div>

            <div className="space-y-3">
              {schedule.recommended_study_times.map((time, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold">
                    {time.day.substring(0, 2)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{time.day} om {time.time}</p>
                    <p className="text-sm text-gray-600">{time.reason}</p>
                  </div>
                  <Badge variant="outline">{time.duration_minutes} min</Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Milestone Projections */}
        {milestones && milestones.length > 0 && (
          <Card className="border-2 border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-600" />
                Komende Mijlpalen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {milestones.slice(0, 4).map((milestone, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-semibold text-gray-900 text-sm">{milestone.milestone}</p>
                    <Badge variant="secondary" className="text-xs">
                      {milestone.confidence}% zeker
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{milestone.description}</p>
                  <p className="text-xs text-yellow-700 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(milestone.estimated_date)}
                  </p>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Learning Tips */}
        {tips && tips.length > 0 && (
          <Card className="border-2 border-pink-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-pink-600" />
                Persoonlijke Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tips.map((tip, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 rounded-lg border ${
                    tip.priority === 'high' ? 'bg-pink-50 border-pink-200' :
                    tip.priority === 'medium' ? 'bg-purple-50 border-purple-200' :
                    'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className={`p-1.5 rounded ${
                      tip.priority === 'high' ? 'bg-pink-200 text-pink-700' :
                      tip.priority === 'medium' ? 'bg-purple-200 text-purple-700' :
                      'bg-gray-200 text-gray-700'
                    }`}>
                      {getTipIcon(tip.category)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{tip.tip}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
