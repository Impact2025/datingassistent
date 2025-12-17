"use client";

/**
 * TransformatieProgramCard - World-class dedicated card for Transformatie 3.0
 * Shows phase progress (DESIGN → ACTION → SURRENDER) with beautiful UI
 */

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, ArrowRight, Sparkles, Target, Heart, Compass, Zap, Sun } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

// Phase configuration with icons and colors
const PHASES = {
  DESIGN: {
    label: 'Design',
    description: 'Ontwerp je liefde',
    icon: Compass,
    color: 'from-violet-500 to-purple-600',
    bgColor: 'bg-violet-100',
    textColor: 'text-violet-600',
    modules: [1, 2, 3, 4],
  },
  ACTION: {
    label: 'Action',
    description: 'Neem actie',
    icon: Zap,
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-600',
    modules: [5, 6, 7, 8],
  },
  SURRENDER: {
    label: 'Surrender',
    description: 'Geef je over',
    icon: Sun,
    color: 'from-rose-500 to-pink-600',
    bgColor: 'bg-rose-100',
    textColor: 'text-rose-600',
    modules: [9, 10, 11, 12],
  },
} as const;

interface TransformatieProgram {
  program_id: number;
  program_slug: string;
  program_name: string;
  program_tier: string;
  enrolled_at: string;
  status: string;
  overall_progress_percentage: number;
  completed_lessons?: number;
  total_lessons?: number;
  completed_modules?: number;
  total_modules?: number;
  current_module?: number;
  current_lesson_title?: string;
  current_phase?: 'DESIGN' | 'ACTION' | 'SURRENDER';
}

interface TransformatieProgramCardProps {
  program: TransformatieProgram;
  index?: number;
}

export function TransformatieProgramCard({ program, index = 0 }: TransformatieProgramCardProps) {
  const router = useRouter();

  const progress = program.overall_progress_percentage || 0;
  const currentModule = program.current_module || 1;
  const isCompleted = progress === 100;
  const isStarted = progress > 0;

  // Determine current phase based on current module
  const getCurrentPhase = (moduleNum: number): 'DESIGN' | 'ACTION' | 'SURRENDER' => {
    if (moduleNum <= 4) return 'DESIGN';
    if (moduleNum <= 8) return 'ACTION';
    return 'SURRENDER';
  };

  const currentPhase = program.current_phase || getCurrentPhase(currentModule);
  const phaseConfig = PHASES[currentPhase];
  const PhaseIcon = phaseConfig.icon;

  // Calculate phase progress
  const getPhaseProgress = (phase: keyof typeof PHASES): number => {
    const phaseModules = PHASES[phase].modules;
    const completedModules = program.completed_modules || 0;

    // Count how many modules in this phase are completed
    const phaseCompleted = phaseModules.filter(m => m <= completedModules).length;
    return Math.round((phaseCompleted / phaseModules.length) * 100);
  };

  const handleContinue = () => {
    router.push('/transformatie');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="border-2 border-pink-200 dark:border-pink-700 bg-gradient-to-br from-pink-50 via-rose-50 to-amber-50 dark:from-pink-900/30 dark:via-rose-900/30 dark:to-amber-900/30 shadow-lg overflow-hidden">
        <CardContent className="p-0">
          {/* Phase Progress Bar - Top */}
          <div className="flex h-2">
            <div
              className={cn(
                "flex-1 transition-all duration-500",
                getPhaseProgress('DESIGN') === 100 ? "bg-violet-500" :
                getPhaseProgress('DESIGN') > 0 ? "bg-gradient-to-r from-violet-500 to-violet-200" : "bg-violet-200"
              )}
              style={{
                background: getPhaseProgress('DESIGN') > 0 && getPhaseProgress('DESIGN') < 100
                  ? `linear-gradient(90deg, #8b5cf6 ${getPhaseProgress('DESIGN')}%, #ddd6fe ${getPhaseProgress('DESIGN')}%)`
                  : undefined
              }}
            />
            <div
              className={cn(
                "flex-1 transition-all duration-500",
                getPhaseProgress('ACTION') === 100 ? "bg-amber-500" :
                getPhaseProgress('ACTION') > 0 ? "bg-gradient-to-r from-amber-500 to-amber-200" : "bg-amber-200"
              )}
              style={{
                background: getPhaseProgress('ACTION') > 0 && getPhaseProgress('ACTION') < 100
                  ? `linear-gradient(90deg, #f59e0b ${getPhaseProgress('ACTION')}%, #fde68a ${getPhaseProgress('ACTION')}%)`
                  : undefined
              }}
            />
            <div
              className={cn(
                "flex-1 transition-all duration-500",
                getPhaseProgress('SURRENDER') === 100 ? "bg-rose-500" :
                getPhaseProgress('SURRENDER') > 0 ? "bg-gradient-to-r from-rose-500 to-rose-200" : "bg-rose-200"
              )}
              style={{
                background: getPhaseProgress('SURRENDER') > 0 && getPhaseProgress('SURRENDER') < 100
                  ? `linear-gradient(90deg, #f43f5e ${getPhaseProgress('SURRENDER')}%, #fecdd3 ${getPhaseProgress('SURRENDER')}%)`
                  : undefined
              }}
            />
          </div>

          <div className="p-4 sm:p-6">
            {/* Mobile: Stack layout, Desktop: Side-by-side */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
              {/* Icon with Logo */}
              <div className="flex-shrink-0 flex items-center gap-3 sm:block">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                  <Image
                    src="/images/Logo Icon DatingAssistent.png"
                    alt=""
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                {/* Title on same line as icon on mobile */}
                <div className="sm:hidden flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-base bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                      {program.program_name}
                    </h3>
                    {isStarted && !isCompleted && (
                      <Badge className={cn("text-xs shadow-sm text-white", `bg-gradient-to-r ${phaseConfig.color}`)}>
                        {phaseConfig.label}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Title - hidden on mobile (shown above) */}
                <div className="hidden sm:flex items-center gap-2 mb-2 flex-wrap">
                  <h3 className="font-semibold text-lg bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                    {program.program_name}
                  </h3>
                  {isStarted && !isCompleted && (
                    <Badge className={cn("text-xs shadow-sm text-white", `bg-gradient-to-r ${phaseConfig.color}`)}>
                      <PhaseIcon className="w-3 h-3 mr-1" />
                      {phaseConfig.label}
                    </Badge>
                  )}
                  {isCompleted && (
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs shadow-sm">
                      Voltooid
                    </Badge>
                  )}
                </div>

                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-2">
                  {isCompleted
                    ? "Gefeliciteerd! Je hebt alle 12 modules afgerond! 🎉"
                    : `Je complete transformatie reis. ${program.completed_modules || 0} van 12 modules voltooid.`
                  }
                </p>

                <p className="text-xs sm:text-sm text-pink-600 dark:text-pink-400 italic mb-4 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  "DESIGN → ACTION → SURRENDER"
                </p>

                {/* Phase Indicators */}
                {!isCompleted && (
                  <div className="flex gap-2 mb-4">
                    {(Object.keys(PHASES) as Array<keyof typeof PHASES>).map((phase) => {
                      const config = PHASES[phase];
                      const Icon = config.icon;
                      const isActive = phase === currentPhase;
                      const phaseProgress = getPhaseProgress(phase);

                      return (
                        <div
                          key={phase}
                          className={cn(
                            "flex-1 p-2 rounded-lg text-center transition-all",
                            isActive
                              ? `${config.bgColor} ring-2 ring-offset-1 ring-${config.textColor.replace('text-', '')}`
                              : "bg-white/60 dark:bg-white/10"
                          )}
                        >
                          <Icon className={cn(
                            "w-4 h-4 mx-auto mb-1",
                            isActive ? config.textColor : "text-gray-400"
                          )} />
                          <p className={cn(
                            "text-xs font-medium",
                            isActive ? config.textColor : "text-gray-500"
                          )}>
                            {config.label}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            {phaseProgress}%
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Progress Stats */}
                {!isCompleted && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center p-2 bg-white/60 dark:bg-white/10 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Module</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {currentModule}/12
                      </p>
                    </div>
                    <div className="text-center p-2 bg-white/60 dark:bg-white/10 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Lessen</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {program.completed_lessons || 0}/{program.total_lessons || 48}
                      </p>
                    </div>
                    <div className="text-center p-2 bg-white/60 dark:bg-white/10 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Voortgang</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {progress}%
                      </p>
                    </div>
                  </div>
                )}

                {/* Current Lesson */}
                {program.current_lesson_title && !isCompleted && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 truncate">
                    <span className="font-medium">Volgende:</span> {program.current_lesson_title}
                  </p>
                )}

                {/* Button */}
                <Button
                  onClick={handleContinue}
                  size="sm"
                  className="gap-2 px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all w-full sm:w-auto justify-center"
                >
                  {isCompleted ? (
                    <>
                      Bekijk Overzicht
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : isStarted ? (
                    <>
                      <Play className="w-4 h-4" />
                      Ga verder met Module {currentModule}
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Start je Transformatie
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
