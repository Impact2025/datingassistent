'use client';

/**
 * Recommended Content Component
 * Sprint 5.2: AI-Powered Content Recommendations
 *
 * Displays personalized content recommendations based on user behavior
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  Clock,
  TrendingUp,
  Target,
  Lightbulb,
  ArrowRight,
  Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Recommendation {
  id: string;
  type: 'lesson' | 'program' | 'module';
  title: string;
  description?: string;
  reason: string;
  confidence: number;
  metadata?: {
    program_slug?: string;
    module_id?: number;
    lesson_id?: number;
    estimated_time?: number;
    difficulty?: string;
  };
}

interface LearningInsights {
  strengths: string[];
  improvements: string[];
  next_milestone: string;
}

interface RecommendedContentProps {
  limit?: number;
  showInsights?: boolean;
  compact?: boolean;
}

export function RecommendedContent({
  limit = 6,
  showInsights = true,
  compact = false
}: RecommendedContentProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [insights, setInsights] = useState<LearningInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecommendations();
  }, [limit, showInsights]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `/api/recommendations?limit=${limit}&include_insights=${showInsights}`
      );

      if (!response.ok) {
        throw new Error('Failed to load recommendations');
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
      if (showInsights && data.insights) {
        setInsights(data.insights);
      }
    } catch (err) {
      console.error('Error loading recommendations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'lesson':
        return <BookOpen className="w-5 h-5" />;
      case 'program':
        return <GraduationCap className="w-5 h-5" />;
      case 'module':
        return <Target className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  const getRecommendationLink = (rec: Recommendation): string => {
    if (rec.type === 'lesson' && rec.metadata?.program_slug && rec.metadata?.lesson_id) {
      return `/programs/${rec.metadata.program_slug}/lesson/${rec.metadata.lesson_id}`;
    } else if (rec.type === 'program' && rec.metadata?.program_slug) {
      return `/programs/${rec.metadata.program_slug}`;
    }
    return '/cursussen';
  };

  const getConfidenceBadgeVariant = (confidence: number) => {
    if (confidence >= 90) return 'default';
    if (confidence >= 75) return 'secondary';
    return 'outline';
  };

  if (loading) {
    return (
      <Card className={compact ? 'border-gray-200' : 'border-2 border-pink-200'}>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <p className="text-red-600">{error}</p>
          <Button onClick={loadRecommendations} variant="outline" className="mt-4">
            Probeer opnieuw
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Learning Insights */}
      {showInsights && insights && !compact && (
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              Jouw Leerinsights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Next Milestone */}
            <div className="p-4 bg-white/80 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-semibold text-purple-900">Volgende Mijlpaal</span>
              </div>
              <p className="text-sm text-gray-700">{insights.next_milestone}</p>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              {insights.strengths.length > 0 && (
                <div className="p-4 bg-white/80 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-900">Sterke Punten</span>
                  </div>
                  <ul className="space-y-1">
                    {insights.strengths.map((strength, idx) => (
                      <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvements */}
              {insights.improvements.length > 0 && (
                <div className="p-4 bg-white/80 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-900">Verbeterpunten</span>
                  </div>
                  <ul className="space-y-1">
                    {insights.improvements.map((improvement, idx) => (
                      <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">→</span>
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card className={compact ? 'border-gray-200' : 'border-2 border-pink-200'}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-600" />
            {compact ? 'Aanbevolen' : 'Speciaal voor jou aanbevolen'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recommendations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                Nog geen aanbevelingen beschikbaar. Begin met leren om gepersonaliseerde suggesties te krijgen!
              </p>
              <Link href="/cursussen">
                <Button>
                  Bekijk Cursussen
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {recommendations.map((rec, index) => (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link href={getRecommendationLink(rec)}>
                      <Card className="h-full hover:shadow-lg hover:border-pink-300 transition-all group cursor-pointer">
                        <CardContent className="p-4">
                          {/* Icon & Type */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center text-white">
                              {getRecommendationIcon(rec.type)}
                            </div>
                            <Badge
                              variant={getConfidenceBadgeVariant(rec.confidence)}
                              className="text-xs"
                            >
                              {rec.confidence}% match
                            </Badge>
                          </div>

                          {/* Title */}
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors">
                            {rec.title}
                          </h3>

                          {/* Reason */}
                          <p className="text-sm text-pink-600 mb-2 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            {rec.reason}
                          </p>

                          {/* Description */}
                          {rec.description && (
                            <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                              {rec.description}
                            </p>
                          )}

                          {/* Metadata */}
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            {rec.metadata?.estimated_time && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{rec.metadata.estimated_time} min</span>
                              </div>
                            )}
                            {rec.metadata?.difficulty && (
                              <Badge variant="outline" className="text-xs">
                                {rec.metadata.difficulty}
                              </Badge>
                            )}
                          </div>

                          {/* Arrow Icon */}
                          <div className="mt-3 flex items-center text-pink-600 group-hover:translate-x-1 transition-transform">
                            <span className="text-sm font-medium">Bekijk</span>
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
