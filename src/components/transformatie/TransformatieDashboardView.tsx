'use client';

/**
 * TransformatieDashboardView - Two-panel layout voor Transformatie 3.0
 * Links: Module/Les navigatie | Rechts: Les content
 * Design: DESIGN -> ACTION -> SURRENDER framework
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
import { ModuleToolCard } from '@/components/journey/module-tool-card';
import { AssignmentChecklist } from './AssignmentChecklist';
import { LessonQuiz } from './LessonQuiz';
import { BadgeNotification } from './BadgeNotification';
import { BadgeShowcase } from './BadgeShowcase';
import type { TransformatieModule, TransformatieLesson, LessonProgress as LessonProgressType } from '@/app/api/transformatie/route';

interface TransformatieDashboardViewProps {
  userId?: number;
  onBack?: () => void;
}

// localStorage keys
const SIDEBAR_COLLAPSED_KEY = 'transformatie_sidebar_collapsed';
const VIDEO_PROGRESS_KEY = 'transformatie_video_progress';

// Detect video URL type and return embed URL for iframe-based players
function parseVideoUrl(url: string | null): {
  type: 'youtube' | 'vimeo' | 'loom' | 'mp4' | 'none';
  embedUrl: string;
} {
  if (!url) return { type: 'none', embedUrl: '' };
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (ytMatch) return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1` };
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return { type: 'vimeo', embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?byline=0&portrait=0&title=0` };
  const loomMatch = url.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/);
  if (loomMatch) return { type: 'loom', embedUrl: `https://www.loom.com/embed/${loomMatch[1]}?hide_owner=true&hide_share=true` };
  return { type: 'mp4', embedUrl: url };
}

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
  const queryClient = useQueryClient();

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
  const [assignmentCompleted, setAssignmentCompleted] = useState(false);

  // Interactive features state
  const [showQuiz, setShowQuiz] = useState(false);
  const [pendingBadges, setPendingBadges] = useState<any[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<any[]>([]);
  const [allBadges, setAllBadges] = useState<any[]>([]);
  const [aiFeedback, setAiFeedback] = useState<Record<string, string>>({});
  const [loadingFeedback, setLoadingFeedback] = useState<Record<string, boolean>>({});

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
      // Fetch badge data alongside overview
      const badgeResponse = await fetch('/api/transformatie/progress');
      if (badgeResponse.ok) {
        const badgeData = await badgeResponse.json();
        setEarnedBadges(badgeData.badges || []);
        setAllBadges(badgeData.allBadges || []);
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
    setAssignmentCompleted((lesson.progress as any)?.assignment_completed || false);
    setShowQuiz(false);
    setAiFeedback({});
    setSidebarOpen(false);
  };

  // Save progress
  const saveProgress = async (data: Record<string, any>) => {
    if (!currentLesson) return;

    setSaving(true);
    try {
      const res = await fetch('/api/transformatie/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId: currentLesson.id, ...data }),
      });
      if (!res.ok) {
        console.error('Progress save failed:', res.status);
        return;
      }
      const json = await res.json();
      if (json.newBadges?.length > 0) {
        setPendingBadges(json.newBadges);
        setEarnedBadges(prev => [...prev, ...json.newBadges]);
      }
      // Refresh overview + invalideer sidebar cache
      await fetchOverview();
      queryClient.invalidateQueries({ queryKey: ['enrollment-status'] });
    } catch (err) {
      console.error('Error saving progress:', err);
    } finally {
      setSaving(false);
    }
  };

  // Video completion — show quiz if questions exist
  const handleVideoComplete = async () => {
    setIsVideoComplete(true);
    setShowQuiz(true);
    await saveProgress({ videoCompleted: true, status: 'in_progress' });
  };

  // AI feedback per reflectie type
  const handleAiFeedback = async (type: 'spiegel' | 'identiteit' | 'actie') => {
    if (!currentLesson || !currentModule) return;
    const answer = reflectieAnswers[type] || '';
    if (answer.trim().length < 30) return;

    setLoadingFeedback(prev => ({ ...prev, [type]: true }));
    try {
      const res = await fetch('/api/transformatie/reflectie-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: currentLesson.id,
          moduleTitle: currentModule.title,
          lessonTitle: currentLesson.title,
          phase: currentModule.phase,
          reflectieType: type,
          question: currentLesson.reflectie?.[type] || '',
          answer,
        }),
      });
      const data = await res.json();
      if (data.feedback) {
        setAiFeedback(prev => ({ ...prev, [type]: data.feedback }));
      }
    } finally {
      setLoadingFeedback(prev => ({ ...prev, [type]: false }));
    }
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

  // Calculate lesson completion — only count elements the lesson actually has
  const calculateLessonCompletion = () => {
    if (!currentLesson) return 0;

    let total = 0;
    let completed = 0;

    // Video — alleen tellen als de les een video heeft
    if (currentLesson.video_url) {
      total++;
      if (isVideoComplete) completed++;
    }

    // Reflectie — alleen tellen als de les vragen heeft
    const hasReflectie = currentLesson.reflectie && (
      currentLesson.reflectie.spiegel ||
      currentLesson.reflectie.identiteit ||
      currentLesson.reflectie.actie
    );
    if (hasReflectie) {
      total++;
      const reflectieComplete = ['spiegel', 'identiteit', 'actie'].every(
        (k) => (reflectieAnswers[k]?.length || 0) > 10
      );
      if (reflectieComplete) completed++;
    }

    // Les zonder video/reflectie is direct voltooibaar
    if (total === 0) return 100;

    return Math.round((completed / total) * 100);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-coral-500 animate-spin mx-auto mb-4" />
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
      {/* Badge Notification */}
      {pendingBadges.length > 0 && (
        <BadgeNotification badges={pendingBadges} onDismiss={() => setPendingBadges([])} />
      )}

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
                <Keyboard className="w-5 h-5 text-coral-500" />
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
                        ? "bg-coral-500 text-white"
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
        <div className="sticky top-4 w-[340px] space-y-4">
          <ModuleSidebar
            modules={modules}
            phases={phases}
            currentModuleId={currentModule?.id}
            currentLessonId={currentLesson?.id}
            onSelectModule={handleSelectModule}
            onSelectLesson={handleSelectLesson}
            overallProgress={overallProgress}
          />
          {allBadges.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Badges</span>
              </div>
              <BadgeShowcase earnedBadges={earnedBadges} allBadges={allBadges} />
            </div>
          )}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {currentLesson ? (
          <div className="space-y-6">
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
                  <div className="mt-4 p-4 bg-gradient-to-r from-coral-50 to-rose-50 rounded-lg border border-coral-200">
                    <p className="text-sm font-medium text-gray-800 italic">
                      "{currentModule.mindset_hook}"
                    </p>
                  </div>
                )}

                {/* Leerdoelen */}
                {currentLesson.content?.objectives && currentLesson.content.objectives.length > 0 && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Na deze les</p>
                    <ul className="space-y-1">
                      {currentLesson.content.objectives.map((obj, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <Target className="w-3.5 h-3.5 text-coral-500 shrink-0 mt-0.5" />
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Video Section */}
            <Card className="border-gray-200 shadow-sm overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Video
                  {isVideoComplete && <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {(() => {
                  const { type, embedUrl } = parseVideoUrl(currentLesson.video_url);

                  if (type === 'youtube' || type === 'vimeo' || type === 'loom') {
                    return (
                      <div className="px-4 lg:px-6 pb-4 lg:pb-6">
                        <div className="aspect-video rounded-xl overflow-hidden bg-gray-900 mb-4 shadow-md">
                          <iframe
                            src={embedUrl}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                            allowFullScreen
                            loading="lazy"
                          />
                        </div>
                        {!isVideoComplete ? (
                          <Button onClick={handleVideoComplete} className="w-full bg-gray-900 hover:bg-gray-800 text-white" disabled={saving}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Markeer als bekeken
                          </Button>
                        ) : (
                          <div className="flex items-center justify-center gap-2 text-green-600 p-3 bg-green-50 rounded-lg border border-green-200">
                            <CheckCircle className="w-5 h-5" />
                            Video voltooid
                          </div>
                        )}
                      </div>
                    );
                  }

                  if (type === 'mp4') {
                    return (
                      <div className="px-4 lg:px-6 pb-4 lg:pb-6">
                        <div className="aspect-video bg-gray-900 rounded-xl mb-2 overflow-hidden shadow-md">
                          <video ref={videoRef} controls className="w-full h-full" preload="metadata">
                            <source src={embedUrl} type="video/mp4" />
                          </video>
                        </div>
                        <div className="h-1 bg-gray-200 rounded-full overflow-hidden mb-4">
                          <motion.div
                            className="h-full bg-coral-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${videoProgress}%` }}
                            transition={{ duration: 0.1 }}
                          />
                        </div>
                        {!isVideoComplete ? (
                          <Button onClick={handleVideoComplete} className="w-full bg-gray-900 hover:bg-gray-800 text-white" disabled={saving}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Markeer als bekeken
                          </Button>
                        ) : (
                          <div className="flex items-center justify-center gap-2 text-green-600 p-3 bg-green-50 rounded-lg border border-green-200">
                            <CheckCircle className="w-5 h-5" />
                            Video voltooid
                          </div>
                        )}
                      </div>
                    );
                  }

                  // No video yet — rich placeholder
                  return (
                    <div>
                      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-8 py-10 flex flex-col items-center justify-center text-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-2">
                          <Play className="w-8 h-8 text-white/60" />
                        </div>
                        {currentLesson.content?.quote ? (
                          <>
                            <p className="text-white/90 text-lg font-medium italic leading-relaxed max-w-md">
                              "{currentLesson.content.quote}"
                            </p>
                            <p className="text-white/40 text-xs">Video wordt binnenkort toegevoegd</p>
                          </>
                        ) : (
                          <p className="text-white/60 text-sm">Video wordt binnenkort toegevoegd</p>
                        )}
                      </div>
                      <div className="px-4 lg:px-6 py-4">
                        {!isVideoComplete ? (
                          <Button onClick={handleVideoComplete} className="w-full bg-gray-900 hover:bg-gray-800 text-white" disabled={saving}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Markeer als bekeken
                          </Button>
                        ) : (
                          <div className="flex items-center justify-center gap-2 text-green-600 p-3 bg-green-50 rounded-lg border border-green-200">
                            <CheckCircle className="w-5 h-5" />
                            Video voltooid
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Kennisquiz — verschijnt na video completion */}
            {isVideoComplete && showQuiz && (
              <LessonQuiz
                lessonId={currentLesson.id}
                onComplete={(score) => setShowQuiz(false)}
                onSkip={() => setShowQuiz(false)}
              />
            )}

            {/* Sleutelinzichten */}
            {currentLesson.content?.takeaways && currentLesson.content.takeaways.length > 0 && (
              <Card className="border-amber-200 bg-amber-50/50 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-amber-900">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                    Sleutelinzichten
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {currentLesson.content.takeaways.map((insight, i) => (
                    <div key={i} className="flex gap-3 items-start p-3 rounded-lg bg-white border border-amber-100 shadow-sm">
                      <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <p className="text-sm text-gray-800 leading-relaxed">{insight}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

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
                <div className="space-y-2 p-4 rounded-lg border border-blue-100 bg-blue-50/50">
                  <Badge className="bg-blue-100 text-blue-700 border-0 text-xs">Spiegel</Badge>
                  <p className="text-sm font-medium text-gray-800 leading-relaxed">
                    {currentLesson.reflectie?.spiegel || `Wat betekent "${currentModule?.mindset_hook}" voor jou persoonlijk?`}
                  </p>
                  <Textarea
                    value={reflectieAnswers.spiegel || ''}
                    onChange={(e) =>
                      setReflectieAnswers({ ...reflectieAnswers, spiegel: e.target.value })
                    }
                    onBlur={() => handleReflectieSave('spiegel', reflectieAnswers.spiegel || '')}
                    placeholder="Schrijf je reflectie hier..."
                    className="min-h-[100px] bg-white border-blue-200 focus:border-blue-400 resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{reflectieAnswers.spiegel?.length || 0} tekens</span>
                    {(reflectieAnswers.spiegel?.length || 0) > 10 && (
                      <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Opgeslagen
                      </div>
                    )}
                  </div>
                  {(reflectieAnswers.spiegel?.length || 0) >= 30 && (
                    <div className="mt-2">
                      {aiFeedback.spiegel ? (
                        <div className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg p-3 leading-relaxed">
                          <span className="font-semibold">Coach: </span>{aiFeedback.spiegel}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAiFeedback('spiegel')}
                          disabled={loadingFeedback.spiegel}
                          className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors disabled:opacity-50"
                        >
                          <Sparkles className="w-3 h-3" />
                          {loadingFeedback.spiegel ? 'Feedback laden...' : 'Vraag AI feedback'}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Identiteit */}
                <div className="space-y-2 p-4 rounded-lg border border-amber-100 bg-amber-50/50">
                  <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">Identiteit</Badge>
                  <p className="text-sm font-medium text-gray-800 leading-relaxed">
                    {currentLesson.reflectie?.identiteit || 'Hoe past dit bij wie je bent in de liefde?'}
                  </p>
                  <Textarea
                    value={reflectieAnswers.identiteit || ''}
                    onChange={(e) =>
                      setReflectieAnswers({ ...reflectieAnswers, identiteit: e.target.value })
                    }
                    onBlur={() => handleReflectieSave('identiteit', reflectieAnswers.identiteit || '')}
                    placeholder="Schrijf je reflectie hier..."
                    className="min-h-[100px] bg-white border-amber-200 focus:border-amber-400 resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{reflectieAnswers.identiteit?.length || 0} tekens</span>
                    {(reflectieAnswers.identiteit?.length || 0) > 10 && (
                      <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Opgeslagen
                      </div>
                    )}
                  </div>
                  {(reflectieAnswers.identiteit?.length || 0) >= 30 && (
                    <div className="mt-2">
                      {aiFeedback.identiteit ? (
                        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 leading-relaxed">
                          <span className="font-semibold">Coach: </span>{aiFeedback.identiteit}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAiFeedback('identiteit')}
                          disabled={loadingFeedback.identiteit}
                          className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-800 font-medium transition-colors disabled:opacity-50"
                        >
                          <Sparkles className="w-3 h-3" />
                          {loadingFeedback.identiteit ? 'Feedback laden...' : 'Vraag AI feedback'}
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Actie */}
                <div className="space-y-2 p-4 rounded-lg border border-rose-100 bg-rose-50/50">
                  <Badge className="bg-rose-100 text-rose-700 border-0 text-xs">Actie</Badge>
                  <p className="text-sm font-medium text-gray-800 leading-relaxed">
                    {currentLesson.reflectie?.actie || 'Wat is een concrete stap die je kunt nemen na deze les?'}
                  </p>
                  <Textarea
                    value={reflectieAnswers.actie || ''}
                    onChange={(e) =>
                      setReflectieAnswers({ ...reflectieAnswers, actie: e.target.value })
                    }
                    onBlur={() => handleReflectieSave('actie', reflectieAnswers.actie || '')}
                    placeholder="Schrijf je concrete actie hier..."
                    className="min-h-[100px] bg-white border-rose-200 focus:border-rose-400 resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{reflectieAnswers.actie?.length || 0} tekens</span>
                    {(reflectieAnswers.actie?.length || 0) > 10 && (
                      <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Opgeslagen
                      </div>
                    )}
                  </div>
                  {(reflectieAnswers.actie?.length || 0) >= 30 && (
                    <div className="mt-2">
                      {aiFeedback.actie ? (
                        <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-3 leading-relaxed">
                          <span className="font-semibold">Coach: </span>{aiFeedback.actie}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAiFeedback('actie')}
                          disabled={loadingFeedback.actie}
                          className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-800 font-medium transition-colors disabled:opacity-50"
                        >
                          <Sparkles className="w-3 h-3" />
                          {loadingFeedback.actie ? 'Feedback laden...' : 'Vraag AI feedback'}
                        </button>
                      )}
                    </div>
                  )}
                  {/* Opdracht checklist */}
                  {currentLesson.reflectie?.actie && (
                    <AssignmentChecklist
                      lessonId={currentLesson.id}
                      assignmentText={currentLesson.reflectie.actie}
                      isCompleted={assignmentCompleted}
                      onComplete={(done) => setAssignmentCompleted(done)}
                    />
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
            <ModuleToolCard toolName={currentModule?.ai_tool_name} />

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

            {/* Q&A Sessions - Below lesson content */}
            <QASessionsCalendar />
          </div>
        ) : (
          <div className="space-y-6">
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
            <div className="flex items-center px-2">
              {currentModule?.lessons.slice(0, 5).map((lesson, idx) => (
                <button
                  key={lesson.id}
                  onClick={() => handleSelectLesson(lesson)}
                  className="w-8 h-8 flex items-center justify-center"
                >
                  <span className={cn(
                    "rounded-full transition-all block",
                    lesson.id === currentLesson?.id
                      ? "bg-coral-500 w-4 h-2.5"
                      : lesson.progress?.status === 'completed'
                        ? "bg-green-500 w-2.5 h-2.5"
                        : "bg-gray-300 w-2.5 h-2.5"
                  )} />
                </button>
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
              className="flex-1 h-12 bg-coral-50 text-coral-600"
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
