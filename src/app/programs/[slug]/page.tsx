'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  Lock,
  Play,
  Download,
  BookOpen,
  FileQuestion,
  Target,
  TrendingUp,
  Award,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import type { ProgramContentResponse, ProgramModuleWithProgress, LessonWithProgress } from '@/types/content-delivery.types';

const contentTypeIcons = {
  video: Play,
  text: BookOpen,
  quiz: FileQuestion,
  exercise: Target,
  download: Download
};

export default function ProgramDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const programSlug = params.slug as string;

  const [programData, setProgramData] = useState<ProgramContentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set([1])); // Expand first module by default

  useEffect(() => {
    loadProgram();
  }, [programSlug]);

  const loadProgram = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/programs/${programSlug}/content?includeProgress=true`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load program');
      }

      const data: ProgramContentResponse = await response.json();
      setProgramData(data);

    } catch (err) {
      console.error('Error loading program:', err);
      setError(err instanceof Error ? err.message : 'Failed to load program');
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (moduleId: number) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const handleLessonClick = (lesson: LessonWithProgress) => {
    if (lesson.is_unlocked) {
      router.push(`/programs/${programSlug}/lesson/${lesson.id}`);
    }
  };

  const handleContinue = () => {
    if (programData?.next_lesson) {
      router.push(`/programs/${programSlug}/lesson/${programData.next_lesson.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coral-50 via-coral-25 to-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-coral-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 font-medium">Programma laden...</p>
        </div>
      </div>
    );
  }

  if (error || !programData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coral-50 via-coral-25 to-white flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <div className="text-red-500 text-5xl">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900">Programma niet gevonden</h2>
            <p className="text-gray-600">{error || 'Dit programma kon niet geladen worden.'}</p>
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Terug naar dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { program, modules, user_progress, next_lesson, has_access, is_authenticated } = programData;
  const overallProgress = user_progress?.overall_progress_percentage || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-coral-500 to-coral-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
                className="text-white hover:bg-white/20 mb-4"
              >
                ← Terug naar dashboard
              </Button>

              <h1 className="text-4xl font-bold mb-4">{program.name}</h1>
              <p className="text-xl text-white/90 mb-6 max-w-2xl">
                {program.description}
              </p>

              {/* Progress Bar */}
              {is_authenticated && has_access && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Voortgang: {overallProgress}%</span>
                    <span>
                      {user_progress?.completed_lessons || 0} / {user_progress?.total_lessons || 0} lessen
                    </span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className="h-full bg-white"
                      initial={{ width: 0 }}
                      animate={{ width: `${overallProgress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Continue Button */}
            {next_lesson && has_access && (
              <div className="ml-8">
                <Button
                  onClick={handleContinue}
                  className="bg-white text-coral-600 hover:bg-gray-100 shadow-lg"
                  size="lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {user_progress?.completed_lessons === 0 ? 'Start programma' : 'Ga verder'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Access Warning */}
      {is_authenticated && !has_access && (
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-yellow-600" />
                <div className="flex-1">
                  <p className="font-medium text-yellow-900">
                    Je hebt nog geen toegang tot dit programma
                  </p>
                  <p className="text-sm text-yellow-700">
                    Schrijf je in voor volledige toegang tot alle modules en lessen.
                  </p>
                </div>
                <Button
                  onClick={() => router.push(`/checkout/${programSlug}`)}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  Inschrijven
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Program Stats */}
      {is_authenticated && has_access && user_progress && (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 mx-auto text-coral-500 mb-2" />
                <p className="text-2xl font-bold text-gray-900">{overallProgress}%</p>
                <p className="text-sm text-gray-600">Voortgang</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {user_progress.completed_modules}/{user_progress.total_modules}
                </p>
                <p className="text-sm text-gray-600">Modules voltooid</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Play className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {user_progress.completed_lessons}/{user_progress.total_lessons}
                </p>
                <p className="text-sm text-gray-600">Lessen voltooid</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Award className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                <p className="text-2xl font-bold text-gray-900">
                  {Math.floor((user_progress.total_time_spent_seconds || 0) / 3600)}h
                </p>
                <p className="text-sm text-gray-600">Tijd besteed</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Modules List */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <div className="space-y-6">
          {modules.map((module: ProgramModuleWithProgress & { lessons?: LessonWithProgress[] }, index) => {
            const isExpanded = expandedModules.has(module.id);
            const moduleProgress = module.progress_percentage || 0;

            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={module.is_unlocked ? '' : 'opacity-60'}>
                  {/* Module Header */}
                  <CardHeader className="cursor-pointer" onClick={() => toggleModule(module.id)}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="text-4xl">{module.icon_emoji}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-xl">
                              Module {module.module_number}: {module.title}
                            </CardTitle>
                            {!module.is_unlocked && (
                              <Lock className="w-4 h-4 text-gray-400" />
                            )}
                            {module.is_unlocked && moduleProgress === 100 && (
                              <Badge className="bg-green-500 text-white">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Voltooid
                              </Badge>
                            )}
                          </div>
                          <CardDescription>{module.description}</CardDescription>

                          {/* Module Progress */}
                          {module.is_unlocked && moduleProgress > 0 && (
                            <div className="mt-4">
                              <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                                <span>{moduleProgress}% voltooid</span>
                                <span>
                                  {module.completed_lessons}/{module.total_lessons} lessen
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-coral-500 to-coral-600 h-2 rounded-full transition-all"
                                  style={{ width: `${moduleProgress}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {!module.is_unlocked && (
                            <p className="text-sm text-gray-500 mt-2">
                              🔒 Voltooi eerst de vorige module
                            </p>
                          )}
                        </div>
                      </div>

                      <Button variant="ghost" size="sm">
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>

                  {/* Module Lessons (Expandable) */}
                  {isExpanded && module.lessons && (
                    <CardContent className="border-t">
                      <div className="space-y-2 pt-4">
                        {module.lessons.map((lesson: LessonWithProgress) => {
                          const Icon = contentTypeIcons[lesson.content_type] || Play;

                          return (
                            <div
                              key={lesson.id}
                              onClick={() => handleLessonClick(lesson)}
                              className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                                lesson.is_unlocked
                                  ? 'hover:border-coral-500 hover:bg-coral-50 cursor-pointer'
                                  : 'bg-gray-50 cursor-not-allowed'
                              }`}
                            >
                              <div className="flex items-center gap-4 flex-1">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-coral-500 to-coral-600 text-white">
                                  {lesson.is_completed ? (
                                    <CheckCircle className="w-5 h-5" />
                                  ) : (
                                    <Icon className="w-5 h-5" />
                                  )}
                                </div>

                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-gray-900">
                                      {lesson.title}
                                    </p>
                                    {!lesson.is_unlocked && (
                                      <Lock className="w-4 h-4 text-gray-400" />
                                    )}
                                    {lesson.is_preview && (
                                      <Badge variant="outline" className="text-xs">
                                        Gratis Preview
                                      </Badge>
                                    )}
                                  </div>
                                  {lesson.description && (
                                    <p className="text-sm text-gray-600 line-clamp-1">
                                      {lesson.description}
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center gap-4">
                                  {lesson.estimated_duration_minutes && (
                                    <span className="text-sm text-gray-600">
                                      {lesson.estimated_duration_minutes} min
                                    </span>
                                  )}

                                  {lesson.is_completed && (
                                    <Badge className="bg-green-500 text-white">
                                      Voltooid
                                    </Badge>
                                  )}

                                  {lesson.watched_percentage > 0 && lesson.watched_percentage < 100 && (
                                    <Badge variant="outline" className="text-xs">
                                      {lesson.watched_percentage}% bekeken
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
