'use client';

/**
 * TransformatieDashboardView - Two-panel layout voor Transformatie 3.0
 * Links: Module/Les navigatie | Rechts: Les content
 * Design: DESIGN -> ACTION -> SURRENDER framework
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
  PanelLeftClose,
  PanelLeft,
  Keyboard,
  Volume2,
  Maximize,
  SkipForward,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ModuleSidebar } from './ModuleSidebar';
import { QASessionsCalendar } from './QASessionsCalendar';
import type { TransformatieModule, TransformatieLesson, LessonProgress as LessonProgressType } from '@/app/api/transformatie/route';

interface TransformatieDashboardViewProps {
  userId?: number;
  onBack?: () => void;
}

// localStorage keys
const SIDEBAR_COLLAPSED_KEY = 'transformatie_sidebar_collapsed';
const VIDEO_PROGRESS_KEY = 'transformatie_video_progress';

// Tool name to route mapping
const AI_TOOL_ROUTES: Record<string, string> = {
  'Waarden Kompas': '/waarden-kompas',
  'Hechtingsstijl Scan': '/hechtingsstijl',
  'Dating Stijl Scan': '/dating-stijl-scan',
  'Emotionele Readiness': '/emotionele-readiness',
  'Vibe Check Simulator': '/tools/vibe-check',
  'Energie Batterij': '/tools/energie-batterij',
  '36 Vragen Bot': '/tools/36-vragen',
  'Ghosting Reframer': '/tools/ghosting-reframer',
  'Foto Advies': '/foto',
  'Date Planner': '/date-planner',
  'Bio Generator': '/dashboard?tab=profiel',
  'Gesprek Coach': '/chat',
};

export function TransformatieDashboardView({ userId, onBack }: TransformatieDashboardViewProps) {
  const router = useRouter();

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Initialize from localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
    }
    return false;
  });

  // Lesson content state
  const [isVideoComplete, setIsVideoComplete] = useState(false);
  const [reflectieAnswers, setReflectieAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Enhanced UX state
  const [showCelebration, setShowCelebration] = useState(false);
  const [showKeyboardHint, setShowKeyboardHint] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [autoAdvance, setAutoAdvance] = useState(true);

  // Mobile swipe state
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

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

  // Persist sidebar state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(sidebarCollapsed));
    }
  }, [sidebarCollapsed]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          handlePrevLesson();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNextLesson();
          break;
        case ' ':
          e.preventDefault();
          if (videoRef.current) {
            if (videoRef.current.paused) {
              videoRef.current.play();
            } else {
              videoRef.current.pause();
            }
          }
          break;
        case 'f':
          // Toggle fullscreen video
          if (videoRef.current) {
            if (document.fullscreenElement) {
              document.exitFullscreen();
            } else {
              videoRef.current.requestFullscreen();
            }
          }
          break;
        case 'm':
          // Toggle sidebar
          setSidebarCollapsed(prev => !prev);
          break;
        case '?':
          // Show keyboard hints
          setShowKeyboardHint(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentModule, currentLesson, modules]);

  // Video progress tracking
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentLesson) return;

    // Restore video progress
    const savedProgress = localStorage.getItem(`${VIDEO_PROGRESS_KEY}_${currentLesson.id}`);
    if (savedProgress && parseFloat(savedProgress) > 0) {
      video.currentTime = parseFloat(savedProgress);
    }

    const handleTimeUpdate = () => {
      const progress = (video.currentTime / video.duration) * 100;
      setVideoProgress(progress);
      // Save progress every 5 seconds
      if (Math.floor(video.currentTime) % 5 === 0) {
        localStorage.setItem(`${VIDEO_PROGRESS_KEY}_${currentLesson.id}`, String(video.currentTime));
      }
    };

    const handleEnded = () => {
      // Auto-mark as complete when video ends
      if (!isVideoComplete) {
        handleVideoComplete();
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [currentLesson?.id, isVideoComplete]);

  // Mobile swipe handler
  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    setSwipeDirection(direction);
    setTimeout(() => setSwipeDirection(null), 300);

    if (direction === 'left') {
      handleNextLesson();
    } else {
      handlePrevLesson();
    }
  }, []);

  // Touch swipe detection
  useEffect(() => {
    let touchStartX = 0;
    let touchEndX = 0;
    const minSwipeDistance = 50;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].clientX;
      const distance = touchStartX - touchEndX;

      if (Math.abs(distance) > minSwipeDistance) {
        if (distance > 0) {
          handleSwipe('left'); // Swipe left = next
        } else {
          handleSwipe('right'); // Swipe right = previous
        }
      }
    };

    const content = contentRef.current;
    if (content) {
      content.addEventListener('touchstart', handleTouchStart, { passive: true });
      content.addEventListener('touchend', handleTouchEnd, { passive: true });
    }

    return () => {
      if (content) {
        content.removeEventListener('touchstart', handleTouchStart);
        content.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [handleSwipe]);

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

  // Mark lesson complete with celebration
  const handleLessonComplete = async () => {
    await saveProgress({ status: 'completed' });

    // Show celebration
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);

    // Auto-advance to next lesson after celebration
    if (autoAdvance) {
      setTimeout(() => {
        handleNextLesson();
      }, 2000);
    }
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-pink-500 animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-600">Je programma laden...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md border-gray-200 shadow-sm">
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
    <div className="flex flex-col lg:flex-row gap-6 relative" ref={contentRef}>
      {/* Celebration Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-md mx-4"
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5 }}
              >
                <Award className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Les Voltooid!</h2>
              <p className="text-gray-600 mb-4">Geweldig! Je bent weer een stap dichter bij je transformatie.</p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <SkipForward className="w-4 h-4" />
                <span>Automatisch naar volgende les...</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Modal */}
      <AnimatePresence>
        {showKeyboardHint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowKeyboardHint(false)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 mb-4">
                <Keyboard className="w-5 h-5 text-pink-500" />
                <h3 className="text-lg font-semibold text-gray-900">Sneltoetsen</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Volgende les</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">→</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Vorige les</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">←</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Play/Pause video</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Spatie</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fullscreen video</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">F</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Toggle menu</span>
                  <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">M</kbd>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4"
                onClick={() => setShowKeyboardHint(false)}
              >
                Sluiten
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini Navigation when sidebar collapsed */}
      <AnimatePresence>
        {sidebarCollapsed && currentModule && (
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            className="hidden lg:flex fixed left-4 top-1/2 -translate-y-1/2 z-30 flex-col gap-2"
          >
            {/* Quick navigation dots */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-2 shadow-lg border border-gray-200">
              <div className="space-y-1">
                {currentModule.lessons.map((lesson, idx) => (
                  <button
                    key={lesson.id}
                    onClick={() => handleSelectLesson(lesson)}
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all",
                      lesson.id === currentLesson?.id
                        ? "bg-pink-500 text-white"
                        : lesson.progress?.status === 'completed'
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                    title={lesson.title}
                  >
                    {lesson.progress?.status === 'completed' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      idx + 1
                    )}
                  </button>
                ))}
              </div>
              <div className="border-t border-gray-200 mt-2 pt-2">
                <button
                  onClick={() => setSidebarCollapsed(false)}
                  className="w-full px-2 py-1 text-xs text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1"
                >
                  <PanelLeft className="w-3 h-3" />
                  Menu
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard shortcut hint button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowKeyboardHint(true)}
        className="hidden lg:flex fixed bottom-4 right-4 z-20 text-gray-400 hover:text-gray-600"
        title="Sneltoetsen (?)"
      >
        <Keyboard className="w-4 h-4 mr-1" />
        <span className="text-xs">?</span>
      </Button>

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

      {/* Desktop Sidebar - Collapsible */}
      <motion.div
        className="hidden lg:block flex-shrink-0 order-first"
        initial={false}
        animate={{
          width: sidebarCollapsed ? 0 : 340,
          opacity: sidebarCollapsed ? 0 : 1,
          marginRight: sidebarCollapsed ? 0 : 24
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="sticky top-4 w-[340px]">
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

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {currentLesson ? (
          <div className="space-y-6">
            {/* Q&A Sessions - Always visible */}
            <QASessionsCalendar />

            {/* Lesson Header */}
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  {/* Desktop Sidebar Toggle Button */}
                  <div className="flex items-start gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                      className="hidden lg:flex h-9 w-9 bg-white border-gray-200 shadow-sm hover:bg-gray-50 flex-shrink-0"
                      title={sidebarCollapsed ? "Toon navigatie" : "Focus mode uit"}
                    >
                      {sidebarCollapsed ? (
                        <PanelLeft className="w-4 h-4" />
                      ) : (
                        <PanelLeftClose className="w-4 h-4" />
                      )}
                    </Button>
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
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Video
                  {isVideoComplete && <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 lg:p-6">
                {currentLesson.video_url ? (
                  <div className="relative">
                    <div className="aspect-video bg-gray-900 rounded-lg mb-2 overflow-hidden">
                      <video
                        ref={videoRef}
                        controls
                        className="w-full h-full"
                        preload="metadata"
                      >
                        <source src={currentLesson.video_url} type="video/mp4" />
                        Je browser ondersteunt geen video playback.
                      </video>
                    </div>
                    {/* Video Progress Bar */}
                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden mb-4">
                      <motion.div
                        className="h-full bg-gradient-to-r from-pink-500 to-rose-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${videoProgress}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                    {/* Video Controls Hint */}
                    <div className="hidden lg:flex items-center justify-center gap-4 text-xs text-gray-400 mb-4">
                      <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">Spatie</kbd>
                        Play/Pause
                      </span>
                      <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">F</kbd>
                        Fullscreen
                      </span>
                    </div>
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
            <Card className="border-gray-200 shadow-sm">
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
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-pink-300 text-pink-700 hover:bg-pink-100"
                      onClick={() => {
                        const toolRoute = AI_TOOL_ROUTES[currentModule.ai_tool_name || ''];
                        if (toolRoute) {
                          router.push(toolRoute);
                        }
                      }}
                    >
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
          <div className="space-y-6">
            {/* Q&A Sessions - When no lesson selected */}
            <QASessionsCalendar />

            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-12 text-center">
                <p className="text-gray-500">Selecteer een les om te beginnen</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Mobile Quick Actions Bar - Only show when lesson is selected */}
      {currentLesson && (
      <div className="lg:hidden fixed bottom-20 left-0 right-0 z-30 px-4">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200 p-2"
        >
          <div className="flex items-center justify-between gap-2">
            {/* Previous Lesson */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevLesson}
              disabled={currentModule?.module_order === 1 && currentLesson?.lesson_order === 1}
              className="flex-1 h-12"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            {/* Lesson Progress Dots */}
            <div className="flex items-center gap-1.5 px-2">
              {currentModule?.lessons.slice(0, 5).map((lesson, idx) => (
                <button
                  key={lesson.id}
                  onClick={() => handleSelectLesson(lesson)}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-all",
                    lesson.id === currentLesson?.id
                      ? "bg-pink-500 w-4"
                      : lesson.progress?.status === 'completed'
                        ? "bg-green-500"
                        : "bg-gray-300"
                  )}
                />
              ))}
              {(currentModule?.lessons.length || 0) > 5 && (
                <span className="text-xs text-gray-400">+{(currentModule?.lessons.length || 0) - 5}</span>
              )}
            </div>

            {/* Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="h-12 px-3"
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Next Lesson */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextLesson}
              className="flex-1 h-12 bg-pink-50 text-pink-600"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Swipe Hint */}
          <div className="text-center mt-1">
            <p className="text-[10px] text-gray-400">
              ← Swipe voor navigatie →
            </p>
          </div>
        </motion.div>
      </div>
      )}

      {/* Swipe Feedback Indicator */}
      <AnimatePresence>
        {swipeDirection && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="lg:hidden fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
          >
            <div className="bg-black/70 text-white rounded-full p-4">
              {swipeDirection === 'left' ? (
                <ChevronRight className="w-8 h-8" />
              ) : (
                <ChevronLeft className="w-8 h-8" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
