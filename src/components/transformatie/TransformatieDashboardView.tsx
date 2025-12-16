'use client';

/**
 * TransformatieDashboardView - Two-panel layout voor Transformatie 3.0
 * Links: Module/Les navigatie | Rechts: Les content
 * Design: DESIGN -> ACTION -> SURRENDER framework
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  CheckCircle,
  BookOpen,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  RefreshCcw,
  Clock,
  Sparkles,
  Target,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ModuleSidebar } from './ModuleSidebar';
import type { TransformatieModule, TransformatieLesson, LessonProgress as LessonProgressType } from '@/app/api/transformatie/route';

interface TransformatieDashboardViewProps {
  userId?: number;
  onBack?: () => void;
}

export function TransformatieDashboardView({ userId, onBack }: TransformatieDashboardViewProps) {
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modules, setModules] = useState<TransformatieModule[]>([]);
  const [phases, setPhases] = useState<any[]>([]);
  const [overallProgress, setOverallProgress] = useState<any>(null);

  const [currentModule, setCurrentModule] = useState<TransformatieModule | null>(null);
  const [currentLesson, setCurrentLesson] = useState<TransformatieLesson | null>(null);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Lesson content state
  const [isVideoComplete, setIsVideoComplete] = useState(false);
  const [reflectieAnswers, setReflectieAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Fetch overview data
  const fetchOverview = useCallback(async () => {
    try {
      const response = await fetch('/api/transformatie');
      if (!response.ok) throw new Error('Failed to fetch overview');

      const data = await response.json();

      if (data.modules) {
        setModules(data.modules);
        setPhases(data.phases || []);
        setOverallProgress(data.progress);

        // Set initial module and lesson
        if (data.modules.length > 0) {
          const firstModule = data.modules.find(
            (m: TransformatieModule) => m.module_order === data.progress?.current_module
          ) || data.modules[0];
          setCurrentModule(firstModule);

          if (firstModule.lessons.length > 0) {
            const firstLesson = firstModule.lessons.find(
              (l: TransformatieLesson) => l.lesson_order === data.progress?.current_lesson
            ) || firstModule.lessons[0];
            setCurrentLesson(firstLesson);
            setIsVideoComplete(firstLesson.progress?.video_completed || false);
            setReflectieAnswers(firstLesson.progress?.reflectie_answers || {});
          }
        }
      }
    } catch (err) {
      console.error('Error fetching overview:', err);
      setError('Kon programma niet laden');
    }
  }, []);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchOverview();
      setLoading(false);
    };
    init();
  }, [fetchOverview]);

  // Select module
  const handleSelectModule = (module: TransformatieModule) => {
    setCurrentModule(module);
    if (module.lessons.length > 0) {
      const firstIncompleteLesson = module.lessons.find(
        (l) => !l.progress || l.progress.status !== 'completed'
      );
      handleSelectLesson(firstIncompleteLesson || module.lessons[0]);
    }
    setSidebarOpen(false);
  };

  // Select lesson
  const handleSelectLesson = (lesson: TransformatieLesson) => {
    setCurrentLesson(lesson);
    setIsVideoComplete(lesson.progress?.video_completed || false);
    setReflectieAnswers(lesson.progress?.reflectie_answers || {});
    setSidebarOpen(false);
  };

  // Save progress
  const saveProgress = async (data: Record<string, any>) => {
    if (!currentLesson) return;

    setSaving(true);
    try {
      await fetch('/api/transformatie/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: currentLesson.id,
          ...data,
        }),
      });

      // Refresh overview
      await fetchOverview();
    } catch (err) {
      console.error('Error saving progress:', err);
    } finally {
      setSaving(false);
    }
  };

  // Video completion
  const handleVideoComplete = async () => {
    setIsVideoComplete(true);
    await saveProgress({ videoCompleted: true, status: 'in_progress' });
  };

  // Mark lesson complete
  const handleLessonComplete = async () => {
    await saveProgress({ status: 'completed' });
  };

  // Reflectie save
  const handleReflectieSave = async (key: string, value: string) => {
    const newAnswers = { ...reflectieAnswers, [key]: value };
    setReflectieAnswers(newAnswers);

    const allAnswered = ['spiegel', 'identiteit', 'actie'].every(
      (k) => (newAnswers[k]?.length || 0) > 10
    );

    await saveProgress({
      reflectieAnswers: newAnswers,
      reflectieCompleted: allAnswered,
    });
  };

  // Navigate to next lesson
  const handleNextLesson = () => {
    if (!currentModule || !currentLesson) return;

    const currentIndex = currentModule.lessons.findIndex(
      (l) => l.id === currentLesson.id
    );

    if (currentIndex < currentModule.lessons.length - 1) {
      // Next lesson in current module
      handleSelectLesson(currentModule.lessons[currentIndex + 1]);
    } else {
      // First lesson of next module
      const nextModule = modules.find(
        (m) => m.module_order === currentModule.module_order + 1
      );
      if (nextModule && nextModule.lessons.length > 0) {
        setCurrentModule(nextModule);
        handleSelectLesson(nextModule.lessons[0]);
      }
    }
  };

  // Navigate to previous lesson
  const handlePrevLesson = () => {
    if (!currentModule || !currentLesson) return;

    const currentIndex = currentModule.lessons.findIndex(
      (l) => l.id === currentLesson.id
    );

    if (currentIndex > 0) {
      handleSelectLesson(currentModule.lessons[currentIndex - 1]);
    } else {
      // Last lesson of previous module
      const prevModule = modules.find(
        (m) => m.module_order === currentModule.module_order - 1
      );
      if (prevModule && prevModule.lessons.length > 0) {
        setCurrentModule(prevModule);
        handleSelectLesson(prevModule.lessons[prevModule.lessons.length - 1]);
      }
    }
  };

  // Get phase icon
  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'DESIGN':
        return <Target className="w-4 h-4" />;
      case 'ACTION':
        return <Sparkles className="w-4 h-4" />;
      case 'SURRENDER':
        return <Heart className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // Get phase color
  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'DESIGN':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ACTION':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'SURRENDER':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Calculate lesson completion
  const calculateLessonCompletion = () => {
    if (!currentLesson) return 0;

    let total = 1; // video
    let completed = isVideoComplete ? 1 : 0;

    // Reflectie
    total++;
    const reflectieComplete = ['spiegel', 'identiteit', 'actie'].every(
      (k) => (reflectieAnswers[k]?.length || 0) > 10
    );
    if (reflectieComplete) completed++;

    return Math.round((completed / total) * 100);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-pink-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Transformatie laden...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Er ging iets mis
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              <RefreshCcw className="w-4 h-4 mr-2" />
              Opnieuw proberen
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completionPercent = calculateLessonCompletion();
  const isLessonComplete = completionPercent === 100;

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-180px)] gap-6">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {currentModule && (
              <Badge className={cn('text-xs', getPhaseColor(currentModule.phase))}>
                {getPhaseIcon(currentModule.phase)}
                <span className="ml-1">{currentModule.phase}</span>
              </Badge>
            )}
          </div>
          <h2 className="font-bold text-gray-900">{currentModule?.title}</h2>
          <p className="text-sm text-gray-600">{currentLesson?.title}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-[320px]"
          >
            <div className="h-full p-4 bg-gray-100 overflow-y-auto">
              <div className="flex justify-end mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <ModuleSidebar
                modules={modules}
                phases={phases}
                currentModuleId={currentModule?.id}
                currentLessonId={currentLesson?.id}
                onSelectModule={handleSelectModule}
                onSelectLesson={handleSelectLesson}
                overallProgress={overallProgress}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-[340px] flex-shrink-0 order-first">
        <div className="sticky top-4">
          <ModuleSidebar
            modules={modules}
            phases={phases}
            currentModuleId={currentModule?.id}
            currentLessonId={currentLesson?.id}
            onSelectModule={handleSelectModule}
            onSelectLesson={handleSelectLesson}
            overallProgress={overallProgress}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {currentLesson ? (
          <div className="space-y-6">
            {/* Lesson Header */}
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {currentModule && (
                        <Badge className={cn('text-xs', getPhaseColor(currentModule.phase))}>
                          {getPhaseIcon(currentModule.phase)}
                          <span className="ml-1">{currentModule.phase_label}</span>
                        </Badge>
                      )}
                      <span className="text-xs text-gray-500">
                        Module {currentModule?.module_order} · Les {currentLesson.lesson_order}
                      </span>
                    </div>
                    <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">
                      {currentLesson.title}
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                      {currentLesson.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                    <Clock className="w-4 h-4" />
                    {currentLesson.duration_minutes} min
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Voortgang les</span>
                    <span className="font-medium text-gray-900">{completionPercent}%</span>
                  </div>
                  <Progress value={completionPercent} className="h-1.5 bg-gray-100" />
                </div>

                {/* Mindset Hook */}
                {currentModule?.mindset_hook && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-200">
                    <p className="text-sm font-medium text-gray-800 italic">
                      "{currentModule.mindset_hook}"
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Video Section */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Video
                  {isVideoComplete && <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 lg:p-6">
                {currentLesson.video_url ? (
                  <div className="aspect-video bg-gray-900 rounded-lg mb-4 overflow-hidden">
                    <video
                      controls
                      className="w-full h-full"
                      preload="metadata"
                    >
                      <source src={currentLesson.video_url} type="video/mp4" />
                      Je browser ondersteunt geen video playback.
                    </video>
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center text-gray-500">
                      <Play className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Video komt binnenkort beschikbaar</p>
                    </div>
                  </div>
                )}

                {!isVideoComplete ? (
                  <Button
                    onClick={handleVideoComplete}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                    disabled={saving}
                  >
                    Markeer als bekeken
                  </Button>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-green-600 p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle className="w-5 h-5" />
                    Video voltooid
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reflectie Section */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Reflectie
                  {['spiegel', 'identiteit', 'actie'].every(
                    (k) => (reflectieAnswers[k]?.length || 0) > 10
                  ) && <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Spiegel */}
                <div className="space-y-2 p-4 rounded-lg border border-gray-200 bg-gray-50">
                  <Badge className="bg-blue-100 text-blue-700 border-0">Spiegel</Badge>
                  <p className="text-sm text-gray-700">
                    Wat betekent "{currentModule?.mindset_hook}" voor jou persoonlijk?
                  </p>
                  <Textarea
                    value={reflectieAnswers.spiegel || ''}
                    onChange={(e) =>
                      setReflectieAnswers({ ...reflectieAnswers, spiegel: e.target.value })
                    }
                    onBlur={() => handleReflectieSave('spiegel', reflectieAnswers.spiegel || '')}
                    placeholder="Schrijf je reflectie hier..."
                    className="min-h-[80px]"
                  />
                  {(reflectieAnswers.spiegel?.length || 0) > 10 && (
                    <div className="flex items-center gap-1 text-green-600 text-xs">
                      <CheckCircle className="w-3 h-3" />
                      Opgeslagen
                    </div>
                  )}
                </div>

                {/* Identiteit */}
                <div className="space-y-2 p-4 rounded-lg border border-gray-200 bg-gray-50">
                  <Badge className="bg-amber-100 text-amber-700 border-0">Identiteit</Badge>
                  <p className="text-sm text-gray-700">
                    Hoe past dit bij wie je bent in de liefde?
                  </p>
                  <Textarea
                    value={reflectieAnswers.identiteit || ''}
                    onChange={(e) =>
                      setReflectieAnswers({ ...reflectieAnswers, identiteit: e.target.value })
                    }
                    onBlur={() => handleReflectieSave('identiteit', reflectieAnswers.identiteit || '')}
                    placeholder="Schrijf je reflectie hier..."
                    className="min-h-[80px]"
                  />
                  {(reflectieAnswers.identiteit?.length || 0) > 10 && (
                    <div className="flex items-center gap-1 text-green-600 text-xs">
                      <CheckCircle className="w-3 h-3" />
                      Opgeslagen
                    </div>
                  )}
                </div>

                {/* Actie */}
                <div className="space-y-2 p-4 rounded-lg border border-gray-200 bg-gray-50">
                  <Badge className="bg-rose-100 text-rose-700 border-0">Actie</Badge>
                  <p className="text-sm text-gray-700">
                    Wat is een concrete stap die je kunt nemen na deze les?
                  </p>
                  <Textarea
                    value={reflectieAnswers.actie || ''}
                    onChange={(e) =>
                      setReflectieAnswers({ ...reflectieAnswers, actie: e.target.value })
                    }
                    onBlur={() => handleReflectieSave('actie', reflectieAnswers.actie || '')}
                    placeholder="Schrijf je reflectie hier..."
                    className="min-h-[80px]"
                  />
                  {(reflectieAnswers.actie?.length || 0) > 10 && (
                    <div className="flex items-center gap-1 text-green-600 text-xs">
                      <CheckCircle className="w-3 h-3" />
                      Opgeslagen
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Mark Complete Button */}
            {isLessonComplete && currentLesson.progress?.status !== 'completed' && (
              <Button
                onClick={handleLessonComplete}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-6"
                disabled={saving}
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Les voltooien
              </Button>
            )}

            {/* AI Tool Recommendation */}
            {currentModule?.ai_tool_name && (
              <Card className="border-pink-200 bg-gradient-to-r from-pink-50 to-rose-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-pink-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        AI Tool: {currentModule.ai_tool_name}
                      </p>
                      <p className="text-xs text-gray-600">
                        Gebruik deze tool om de les te verdiepen
                      </p>
                    </div>
                    <Button size="sm" variant="outline" className="border-pink-300 text-pink-700 hover:bg-pink-100">
                      Openen
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handlePrevLesson}
                disabled={currentModule?.module_order === 1 && currentLesson?.lesson_order === 1}
                className="border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Vorige</span>
              </Button>

              <Button
                onClick={handleNextLesson}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                <span className="hidden sm:inline">Volgende</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">Selecteer een les om te beginnen</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
