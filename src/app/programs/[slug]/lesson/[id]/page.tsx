'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Play,
  Pause,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Download,
  Lock,
  BookOpen,
  Award
} from 'lucide-react';
import type { LessonResponse, LessonWithProgress, QuizAnswer } from '@/types/content-delivery.types';
import { formatDuration } from '@/types/content-delivery.types';
import { QuizComponent } from '@/components/lessons/quiz-component';
import { useAchievementNotifications } from '@/hooks/use-achievement-notifications';

export default function LessonPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = parseInt(params.id as string);
  const { checkForNewAchievements } = useAchievementNotifications();

  const [lessonData, setLessonData] = useState<LessonResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Video state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Completion state
  const [completingLesson, setCompletingLesson] = useState(false);

  useEffect(() => {
    loadLesson();
  }, [lessonId]);

  const loadLesson = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/lessons/${lessonId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load lesson');
      }

      const data: LessonResponse = await response.json();
      setLessonData(data);

      // If video lesson, set initial position from progress
      if (data.lesson.content_type === 'video' && data.lesson.user_progress?.last_position_seconds) {
        setCurrentTime(data.lesson.user_progress.last_position_seconds);
      }

    } catch (err) {
      console.error('Error loading lesson:', err);
      setError(err instanceof Error ? err.message : 'Failed to load lesson');
    } finally {
      setLoading(false);
    }
  };

  // Video player handlers
  useEffect(() => {
    if (videoRef.current && lessonData?.lesson.user_progress?.last_position_seconds) {
      videoRef.current.currentTime = lessonData.lesson.user_progress.last_position_seconds;
    }
  }, [lessonData]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration);
    }
  };

  const handleVideoEnded = async () => {
    setIsPlaying(false);
    // Auto-complete lesson when video ends
    await completeLesson();
  };

  // Progress tracking (save every 10 seconds)
  useEffect(() => {
    if (isPlaying && lessonData?.lesson.content_type === 'video') {
      progressUpdateIntervalRef.current = setInterval(() => {
        saveProgress(false);
      }, 10000); // Every 10 seconds

      return () => {
        if (progressUpdateIntervalRef.current) {
          clearInterval(progressUpdateIntervalRef.current);
        }
      };
    }
  }, [isPlaying, currentTime]);

  const saveProgress = async (markComplete: boolean = false) => {
    if (!lessonData) return;

    try {
      const body: any = {
        time_spent_seconds: 10 // Increment by 10 seconds
      };

      if (lessonData.lesson.content_type === 'video') {
        body.watch_time_seconds = Math.floor(currentTime);
        body.last_position_seconds = Math.floor(currentTime);
      }

      if (markComplete) {
        body.is_completed = true;
      }

      const response = await fetch(`/api/lessons/${lessonId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        console.error('Failed to save progress');
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const completeLesson = async () => {
    if (!lessonData || lessonData.lesson.is_completed || completingLesson) return;

    setCompletingLesson(true);
    try {
      const response = await fetch(`/api/lessons/${lessonId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_completed: true })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Lesson completed!', data);

        // Update local state
        setLessonData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            lesson: {
              ...prev.lesson,
              is_completed: true,
              user_progress: data.progress
            }
          };
        });

        // Check for new achievements and show toast notifications
        const newAchievements = await checkForNewAchievements();
        if (newAchievements.length > 0) {
          console.log('🏆 New achievements unlocked:', newAchievements);
        }
      }
    } catch (error) {
      console.error('Error completing lesson:', error);
    } finally {
      setCompletingLesson(false);
    }
  };

  const handleQuizComplete = async (score: number, passed: boolean, answers: QuizAnswer[]) => {
    console.log('📝 Quiz completed:', { score, passed });

    try {
      const response = await fetch(`/api/lessons/${lessonId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quiz_answers: answers,
          is_completed: passed // Auto-complete if passed
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Quiz progress saved!', data);

        // Update local state
        setLessonData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            lesson: {
              ...prev.lesson,
              is_completed: passed,
              user_progress: data.progress
            }
          };
        });

        // Check for new achievements and show toast notifications
        if (passed) {
          const newAchievements = await checkForNewAchievements();
          if (newAchievements.length > 0) {
            console.log('🏆 New achievements unlocked:', newAchievements);
          }
        }
      }
    } catch (error) {
      console.error('Error saving quiz progress:', error);
    }
  };

  const handleNext = () => {
    if (lessonData?.next_lesson && lessonData.next_lesson.is_unlocked) {
      router.push(`/programs/${lessonData.program.slug}/lesson/${lessonData.next_lesson.id}`);
    }
  };

  const handlePrevious = () => {
    if (lessonData?.previous_lesson) {
      router.push(`/programs/${lessonData.program.slug}/lesson/${lessonData.previous_lesson.id}`);
    }
  };

  const handleBackToProgram = () => {
    if (lessonData) {
      router.push(`/programs/${lessonData.program.slug}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 font-medium">Lesson laden...</p>
        </div>
      </div>
    );
  }

  if (error || !lessonData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <Lock className="w-16 h-16 mx-auto text-red-500" />
            <h2 className="text-xl font-bold text-gray-900">Lesson niet beschikbaar</h2>
            <p className="text-gray-600">{error || 'Deze lesson kon niet geladen worden.'}</p>
            <Button onClick={() => router.back()} className="w-full">
              Ga terug
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { lesson, module, next_lesson, previous_lesson, program } = lessonData;
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleBackToProgram}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {program.name}
              </Button>
              <div className="hidden md:block text-sm text-gray-600">
                {module.title} → Les {lesson.lesson_number}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {lesson.is_completed && (
                <Badge className="bg-green-500 text-white">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Voltooid
                </Badge>
              )}
              {!lesson.is_completed && (
                <Button
                  onClick={completeLesson}
                  disabled={completingLesson}
                  variant="outline"
                  size="sm"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Markeer als voltooid
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Lesson Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lesson Title */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">Les {lesson.lesson_number}</Badge>
                {lesson.difficulty_level && (
                  <Badge variant="outline" className="capitalize">
                    {lesson.difficulty_level}
                  </Badge>
                )}
                {lesson.estimated_duration_minutes && (
                  <span className="text-sm text-gray-600">
                    {lesson.estimated_duration_minutes} min
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {lesson.title}
              </h1>
              {lesson.description && (
                <p className="text-gray-600 text-lg">{lesson.description}</p>
              )}
            </div>

            {/* Video Player */}
            {lesson.content_type === 'video' && lesson.video_url && (
              <Card>
                <CardContent className="p-0">
                  <div className="relative bg-black aspect-video">
                    <video
                      ref={videoRef}
                      className="w-full h-full"
                      src={lesson.video_url}
                      poster={lesson.video_thumbnail_url || undefined}
                      onTimeUpdate={handleTimeUpdate}
                      onEnded={handleVideoEnded}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                    >
                      Your browser does not support video playback.
                    </video>

                    {/* Custom Controls Overlay (optional) */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <div className="space-y-2">
                        <Progress value={progressPercentage} className="h-1" />
                        <div className="flex items-center justify-between text-white text-sm">
                          <span>
                            {formatDuration(Math.floor(currentTime)).display} /
                            {formatDuration(Math.floor(duration)).display}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handlePlayPause}
                            className="text-white hover:text-white hover:bg-white/20"
                          >
                            {isPlaying ? (
                              <Pause className="w-5 h-5" />
                            ) : (
                              <Play className="w-5 h-5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Text Content */}
            {lesson.content_type === 'text' && lesson.text_content && (
              <Card>
                <CardContent className="prose max-w-none p-8">
                  <div dangerouslySetInnerHTML={{ __html: lesson.text_content.replace(/\n/g, '<br>') }} />
                </CardContent>
              </Card>
            )}

            {/* Exercise */}
            {lesson.content_type === 'exercise' && lesson.text_content && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Oefening
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: lesson.text_content.replace(/\n/g, '<br>') }} />
                </CardContent>
              </Card>
            )}

            {/* Quiz */}
            {lesson.content_type === 'quiz' && lesson.quiz_data && (
              <QuizComponent
                quizData={lesson.quiz_data as any}
                lessonId={lessonId}
                onComplete={handleQuizComplete}
                initialAnswers={lesson.user_progress?.quiz_answers as any || []}
                maxAttempts={lesson.quiz_data.max_attempts}
                currentAttempts={lesson.user_progress?.quiz_attempts || 0}
              />
            )}

            {/* Download */}
            {lesson.content_type === 'download' && lesson.download_url && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Download className="w-16 h-16 mx-auto text-pink-500 mb-4" />
                  <h3 className="text-xl font-bold mb-2">{lesson.download_filename}</h3>
                  <p className="text-gray-600 mb-6">
                    Download dit bestand om verder te gaan met de oefening.
                  </p>
                  <Button asChild className="bg-gradient-to-r from-pink-500 to-purple-600">
                    <a href={lesson.download_url} download>
                      <Download className="w-4 h-4 mr-2" />
                      Download {lesson.download_filename}
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Transcript (if available) */}
            {lesson.transcript && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Transcript</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {lesson.transcript}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Navigation & Info */}
          <div className="space-y-6">
            {/* Navigation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Navigatie</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {previous_lesson && (
                  <Button
                    onClick={handlePrevious}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Vorige: {previous_lesson.title}
                  </Button>
                )}

                {next_lesson && (
                  <Button
                    onClick={handleNext}
                    disabled={!next_lesson.is_unlocked}
                    className="w-full justify-start bg-gradient-to-r from-pink-500 to-purple-600"
                  >
                    {next_lesson.is_unlocked ? (
                      <>
                        Volgende: {next_lesson.title}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        Voltooi deze les eerst
                      </>
                    )}
                  </Button>
                )}

                {!next_lesson && (
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Award className="w-12 h-12 mx-auto text-green-600 mb-2" />
                    <p className="text-sm font-medium text-green-900">
                      Laatste les van deze module!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            {lesson.tags && lesson.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {lesson.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
