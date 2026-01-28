"use client";

/**
 * Recommended Courses Component
 * Smart course recommendations based on user progress, goals, and behavior
 * Drives course discovery and conversion
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  GraduationCap, ArrowRight, Clock, BookOpen, Star,
  TrendingUp, Sparkles, Lock, CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { cn } from '@/lib/utils';
import type { CursusWithProgress } from '@/types/cursus.types';

interface RecommendedCoursesProps {
  userId?: number;
  maxCourses?: number;
}

export function RecommendedCourses({ userId, maxCourses = 3 }: RecommendedCoursesProps) {
  const [courses, setCourses] = useState<CursusWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommendationReason, setRecommendationReason] = useState<string>('');

  useEffect(() => {
    fetchRecommendedCourses();
  }, [userId]);

  const fetchRecommendedCourses = async () => {
    try {
      // Fetch all courses
      const response = await fetch('/api/cursussen');
      if (!response.ok) throw new Error('Failed to fetch courses');

      const data = await response.json();
      const allCourses = data.cursussen || [];

      // Smart recommendation logic
      const recommended = selectRecommendedCourses(allCourses);
      setCourses(recommended.slice(0, maxCourses));

      // Set recommendation reason
      setRecommendationReason(getRecommendationReason(recommended));
    } catch (error) {
      console.error('Error fetching recommended courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const selectRecommendedCourses = (allCourses: CursusWithProgress[]): CursusWithProgress[] => {
    // Priority 1: In-progress courses
    const inProgress = allCourses.filter(
      c => c.user_progress && c.user_progress.percentage > 0 && c.user_progress.percentage < 100
    );

    // Priority 2: Free courses (for acquisition)
    const freeCourses = allCourses.filter(c => c.cursus_type === 'gratis' && !c.user_progress);

    // Priority 3: Next level courses (if user completed beginner, show intermediate)
    const completedCourses = allCourses.filter(
      c => c.user_progress && c.user_progress.percentage === 100
    );
    const hasCompletedBeginner = completedCourses.some(c => c.niveau === 'beginner');
    const nextLevel = hasCompletedBeginner
      ? allCourses.filter(c => c.niveau === 'intermediate' && !c.user_progress)
      : allCourses.filter(c => c.niveau === 'beginner' && !c.user_progress);

    // Priority 4: Popular courses (most progress by other users)
    const notStarted = allCourses.filter(c => !c.user_progress);

    // Combine with smart ordering
    return [
      ...inProgress,
      ...freeCourses,
      ...nextLevel,
      ...notStarted
    ].filter((course, index, self) =>
      index === self.findIndex(c => c.id === course.id)
    );
  };

  const getRecommendationReason = (recommended: CursusWithProgress[]): string => {
    if (recommended.length === 0) return 'Voor jou geselecteerd';

    const hasInProgress = recommended.some(
      c => c.user_progress && c.user_progress.percentage > 0 && c.user_progress.percentage < 100
    );
    const hasFree = recommended.some(c => c.cursus_type === 'gratis');

    if (hasInProgress) return 'Zet je begonnen cursussen voort';
    if (hasFree) return 'Start gratis met leren';
    return 'Aanbevolen voor jouw niveau';
  };

  const getCourseTypeLabel = (type: string): { text: string; color: string } => {
    const labels: Record<string, { text: string; color: string }> = {
      gratis: { text: 'Gratis', color: 'bg-green-500 text-white' },
      starter: { text: 'Starter', color: 'bg-blue-500 text-white' },
      groeier: { text: 'Groeier', color: 'bg-purple-500 text-white' },
      expert: { text: 'Expert', color: 'bg-orange-500 text-white' },
      vip: { text: 'VIP', color: 'bg-coral-500 text-white' }
    };
    return labels[type] || { text: type, color: 'bg-gray-500 text-white' };
  };

  const getNiveauLabel = (niveau: string): string => {
    const labels: Record<string, string> = {
      beginner: 'Beginner',
      intermediate: 'Gevorderd',
      advanced: 'Expert'
    };
    return labels[niveau] || niveau;
  };

  if (loading) {
    return (
      <Card className="shadow-sm animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (courses.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-purple-500" />
              <CardTitle className="text-lg">Aanbevolen Cursussen</CardTitle>
            </div>
            <Link href="/cursussen">
              <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                Alles bekijken
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-600 mt-1">{recommendationReason}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {courses.map((course, index) => {
              const typeInfo = getCourseTypeLabel(course.cursus_type);
              const progress = course.user_progress;
              const isStarted = progress && progress.percentage > 0;
              const isCompleted = progress && progress.percentage === 100;

              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/cursussen/${course.slug}`}>
                    <Card className={cn(
                      "hover:shadow-md transition-all cursor-pointer border-2",
                      isCompleted && "border-green-200 bg-green-50/30",
                      isStarted && !isCompleted && "border-purple-200 bg-purple-50/30",
                      !isStarted && "hover:border-purple-300"
                    )}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 line-clamp-1">
                                {course.titel}
                              </h4>
                              {course.subtitel && (
                                <p className="text-xs text-gray-600 line-clamp-1 mt-0.5">
                                  {course.subtitel}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col gap-1 items-end flex-shrink-0">
                              <Badge className={typeInfo.color}>
                                {typeInfo.text}
                              </Badge>
                              {isCompleted && (
                                <Badge className="bg-green-500 text-white text-xs">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Voltooid
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Meta info */}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{course.duur_minuten} min</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>{progress?.totaal_lessen || 0} lessen</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3.5 h-3.5" />
                              <span>{getNiveauLabel(course.niveau)}</span>
                            </div>
                          </div>

                          {/* Progress bar (if started) */}
                          {isStarted && progress && (
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-600">Voortgang</span>
                                <span className="font-semibold text-purple-600">
                                  {progress.percentage}%
                                </span>
                              </div>
                              <Progress value={progress.percentage} className="h-1.5" />
                            </div>
                          )}

                          {/* CTA */}
                          <div className="pt-1">
                            <Button
                              size="sm"
                              className={cn(
                                "w-full",
                                isStarted
                                  ? "bg-purple-600 hover:bg-purple-700"
                                  : course.cursus_type === 'gratis'
                                  ? "bg-green-600 hover:bg-green-700"
                                  : "bg-gray-600 hover:bg-gray-700"
                              )}
                            >
                              {isCompleted ? (
                                <>
                                  <Star className="w-3.5 h-3.5 mr-1.5" />
                                  Bekijk opnieuw
                                </>
                              ) : isStarted ? (
                                <>
                                  <ArrowRight className="w-3.5 h-3.5 mr-1.5" />
                                  Verder gaan
                                </>
                              ) : course.cursus_type === 'gratis' ? (
                                <>
                                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                                  Gratis starten
                                </>
                              ) : (
                                <>
                                  <Lock className="w-3.5 h-3.5 mr-1.5" />
                                  Bekijk cursus
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* View all CTA */}
          <div className="mt-4 pt-4 border-t">
            <Link href="/cursussen">
              <Button variant="outline" className="w-full">
                Bekijk alle cursussen
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
