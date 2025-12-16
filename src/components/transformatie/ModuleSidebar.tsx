'use client';

/**
 * ModuleSidebar - Navigation sidebar for Transformatie 3.0
 * Shows phases, modules, and lessons with progress indicators
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Lock,
  Play,
  Target,
  Sparkles,
  Heart,
  BookOpen,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { TransformatieModule, TransformatieLesson } from '@/app/api/transformatie/route';

interface Phase {
  id: string;
  name: string;
  description?: string;
  progress: number;
}

interface PhaseWithModules extends Phase {
  modules: TransformatieModule[];
}

interface ModuleSidebarProps {
  modules: TransformatieModule[];
  phases: Phase[];
  currentModuleId?: number;
  currentLessonId?: number;
  onSelectModule: (module: TransformatieModule) => void;
  onSelectLesson: (lesson: TransformatieLesson) => void;
  overallProgress?: {
    total_lessons: number;
    completed_lessons: number;
    percentage: number;
    current_module: number;
    current_phase: string;
  };
}

export function ModuleSidebar({
  modules,
  phases,
  currentModuleId,
  currentLessonId,
  onSelectModule,
  onSelectLesson,
  overallProgress,
}: ModuleSidebarProps) {
  const [expandedModules, setExpandedModules] = useState<number[]>(
    currentModuleId ? [currentModuleId] : []
  );

  const toggleModule = (moduleId: number) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
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

  // Get phase colors
  const getPhaseColors = (phase: string) => {
    switch (phase) {
      case 'DESIGN':
        return {
          bg: 'bg-blue-500',
          text: 'text-blue-600',
          light: 'bg-blue-50',
          border: 'border-blue-200',
        };
      case 'ACTION':
        return {
          bg: 'bg-amber-500',
          text: 'text-amber-600',
          light: 'bg-amber-50',
          border: 'border-amber-200',
        };
      case 'SURRENDER':
        return {
          bg: 'bg-rose-500',
          text: 'text-rose-600',
          light: 'bg-rose-50',
          border: 'border-rose-200',
        };
      default:
        return {
          bg: 'bg-gray-500',
          text: 'text-gray-600',
          light: 'bg-gray-50',
          border: 'border-gray-200',
        };
    }
  };

  // Get lesson status icon
  const getLessonIcon = (lesson: TransformatieLesson) => {
    if (!lesson.progress || lesson.progress.status === 'locked') {
      return <Lock className="w-4 h-4 text-gray-400" />;
    }
    if (lesson.progress.status === 'completed') {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (lesson.progress.status === 'in_progress') {
      return <Play className="w-4 h-4 text-pink-500" />;
    }
    return <BookOpen className="w-4 h-4 text-gray-400" />;
  };

  // Group modules by phase
  const modulesByPhase: PhaseWithModules[] = phases.map((phase) => ({
    ...phase,
    modules: modules.filter((m) => m.phase === phase.id),
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Overall Progress Header */}
      <div className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-900">Je voortgang</span>
          <span className="text-sm font-bold text-pink-600">
            {overallProgress?.percentage || 0}%
          </span>
        </div>
        <Progress value={overallProgress?.percentage || 0} className="h-2" />
        <p className="text-xs text-gray-600 mt-2">
          {overallProgress?.completed_lessons || 0} van {overallProgress?.total_lessons || 0} lessen voltooid
        </p>
      </div>

      {/* Phases and Modules */}
      <div className="divide-y divide-gray-100">
        {modulesByPhase.map((phase) => (
          <div key={phase.id} className="p-3">
            {/* Phase Header */}
            <div className="flex items-center gap-2 mb-3">
              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center',
                  getPhaseColors(phase.id).light
                )}
              >
                {getPhaseIcon(phase.id)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn('text-xs font-semibold', getPhaseColors(phase.id).text)}>
                  {phase.id}
                </p>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {phase.name}
                </p>
              </div>
              <Badge
                variant="outline"
                className={cn('text-xs', getPhaseColors(phase.id).border)}
              >
                {phase.progress}%
              </Badge>
            </div>

            {/* Modules in Phase */}
            <div className="space-y-1">
              {phase.modules.map((module) => {
                const isExpanded = expandedModules.includes(module.id);
                const isCurrentModule = module.id === currentModuleId;
                const isComplete = module.progress.percentage === 100;

                return (
                  <div key={module.id}>
                    {/* Module Header */}
                    <button
                      onClick={() => {
                        toggleModule(module.id);
                        onSelectModule(module);
                      }}
                      className={cn(
                        'w-full flex items-center gap-2 p-2 rounded-lg text-left transition-all',
                        isCurrentModule
                          ? 'bg-pink-50 border border-pink-200'
                          : 'hover:bg-gray-50'
                      )}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">M{module.module_order}</span>
                          {isComplete && (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          )}
                        </div>
                        <p
                          className={cn(
                            'text-sm truncate',
                            isCurrentModule ? 'font-medium text-gray-900' : 'text-gray-700'
                          )}
                        >
                          {module.title}
                        </p>
                      </div>

                      <span className="text-xs text-gray-500">
                        {module.progress.completed_lessons}/{module.progress.total_lessons}
                      </span>
                    </button>

                    {/* Lessons */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="ml-6 mt-1 space-y-0.5">
                            {module.lessons.map((lesson) => {
                              const isCurrentLesson = lesson.id === currentLessonId;
                              const isLocked =
                                !lesson.progress || lesson.progress.status === 'locked';

                              return (
                                <button
                                  key={lesson.id}
                                  onClick={() => !isLocked && onSelectLesson(lesson)}
                                  disabled={isLocked}
                                  className={cn(
                                    'w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-all',
                                    isLocked
                                      ? 'opacity-50 cursor-not-allowed'
                                      : isCurrentLesson
                                        ? 'bg-pink-100 border border-pink-300'
                                        : 'hover:bg-gray-50'
                                  )}
                                >
                                  {getLessonIcon(lesson)}
                                  <span
                                    className={cn(
                                      'flex-1 truncate',
                                      isCurrentLesson
                                        ? 'font-medium text-pink-700'
                                        : 'text-gray-600'
                                    )}
                                  >
                                    {lesson.title}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {lesson.duration_minutes}m
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
