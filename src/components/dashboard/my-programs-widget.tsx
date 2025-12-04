'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KickstartProgramCard } from '@/components/dashboard/kickstart-program-card';
import {
  Play,
  CheckCircle,
  TrendingUp,
  ArrowRight,
  BookOpen,
  Award,
  Clock
} from 'lucide-react';

interface EnrolledProgram {
  program_id: number;
  program_slug: string;
  program_name: string;
  program_tier: string;
  program_type?: 'kickstart' | 'standard';
  enrolled_at: string;
  status: string;
  overall_progress_percentage: number;
  completed_lessons?: number;
  total_lessons?: number;
  completed_modules?: number;
  total_modules?: number;
  current_lesson_title?: string;
  current_lesson_id?: number;
  next_lesson_id?: number;
  last_accessed_at: string;
  // Kickstart-specific fields
  completed_days?: number;
  total_days?: number;
  next_day?: number;
  last_completed_day?: number;
}

export function MyProgramsWidget() {
  const router = useRouter();
  const [programs, setPrograms] = useState<EnrolledProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEnrolledPrograms();
  }, []);

  const loadEnrolledPrograms = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/enrolled-programs');

      if (!response.ok) {
        if (response.status === 401) {
          // Not authenticated
          return;
        }
        throw new Error('Failed to load programs');
      }

      const data = await response.json();
      setPrograms(data.programs || []);

    } catch (err) {
      console.error('Error loading enrolled programs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = (program: EnrolledProgram) => {
    if (program.next_lesson_id) {
      router.push(`/programs/${program.program_slug}/lesson/${program.next_lesson_id}`);
    } else {
      router.push(`/programs/${program.program_slug}`);
    }
  };

  const handleViewProgram = (slug: string) => {
    router.push(`/programs/${slug}`);
  };

  const tierColors = {
    kickstart: 'from-blue-500 to-blue-600',
    transformatie: 'from-pink-500 to-purple-600',
    'vip-reis': 'from-purple-500 to-indigo-600'
  };

  const tierIcons = {
    kickstart: '🎯',
    transformatie: '✨',
    'vip-reis': '👑'
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Mijn Programma's
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return null; // Silently fail for non-critical widget
  }

  if (programs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Mijn Programma's
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-4">
            <div className="text-6xl">📚</div>
            <div>
              <p className="text-gray-600 mb-4">
                Je bent nog niet ingeschreven voor een programma
              </p>
              <Button
                onClick={() => router.push('/#programmas')}
                className="bg-gradient-to-r from-pink-500 to-purple-600"
              >
                Ontdek programma's
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Mijn Programma's
          </CardTitle>
          <Badge variant="outline">{programs.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {programs.map((program, index) => {
          // Render Kickstart programs with dedicated card
          if (program.program_type === 'kickstart') {
            return (
              <KickstartProgramCard
                key={program.program_id}
                program={program as any}
                index={index}
              />
            );
          }

          // Render standard programs
          const tierColor = tierColors[program.program_tier as keyof typeof tierColors] || tierColors.kickstart;
          const tierIcon = tierIcons[program.program_tier as keyof typeof tierIcons] || '📚';
          const progress = program.overall_progress_percentage || 0;
          const isCompleted = progress === 100;
          const isStarted = progress > 0;

          return (
            <motion.div
              key={program.program_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="border rounded-lg p-4 hover:border-pink-500 transition-colors cursor-pointer group">
                <div onClick={() => handleViewProgram(program.program_slug)}>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{tierIcon}</div>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
                          {program.program_name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          {isCompleted && (
                            <Badge className="bg-green-500 text-white text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Voltooid
                            </Badge>
                          )}
                          {!isCompleted && isStarted && (
                            <Badge variant="outline" className="text-xs">
                              <Play className="w-3 h-3 mr-1" />
                              Bezig
                            </Badge>
                          )}
                          {!isStarted && (
                            <Badge variant="outline" className="text-xs">
                              Nieuw
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Progress Circle */}
                    <div className="text-center">
                      <div className="relative w-12 h-12">
                        <svg className="w-12 h-12 transform -rotate-90">
                          <circle
                            cx="24"
                            cy="24"
                            r="20"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            className="text-gray-200"
                          />
                          <circle
                            cx="24"
                            cy="24"
                            r="20"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 20}`}
                            strokeDashoffset={`${2 * Math.PI * 20 * (1 - progress / 100)}`}
                            className="text-pink-500 transition-all duration-500"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold text-gray-900">
                            {progress}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600">Modules</p>
                      <p className="text-sm font-bold text-gray-900">
                        {program.completed_modules}/{program.total_modules}
                      </p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600">Lessen</p>
                      <p className="text-sm font-bold text-gray-900">
                        {program.completed_lessons}/{program.total_lessons}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className={`h-2 rounded-full bg-gradient-to-r ${tierColor}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  {/* Current Lesson */}
                  {program.current_lesson_title && !isCompleted && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <Clock className="w-4 h-4" />
                      <span className="line-clamp-1">
                        Volgende: {program.current_lesson_title}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                {!isCompleted && (
                  <Button
                    onClick={() => handleContinue(program)}
                    className={`w-full bg-gradient-to-r ${tierColor} hover:opacity-90`}
                    size="sm"
                  >
                    {isStarted ? (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Ga verder
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Start programma
                      </>
                    )}
                  </Button>
                )}

                {isCompleted && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleViewProgram(program.program_slug)}
                      variant="outline"
                      className="flex-1"
                      size="sm"
                    >
                      <Award className="w-4 h-4 mr-2" />
                      Bekijk certificaat
                    </Button>
                    <Button
                      onClick={() => handleViewProgram(program.program_slug)}
                      variant="outline"
                      className="flex-1"
                      size="sm"
                    >
                      Herbekijk
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* View All Button */}
        {programs.length > 2 && (
          <Button
            onClick={() => router.push('/programs')}
            variant="outline"
            className="w-full"
          >
            Bekijk alle programma's
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
