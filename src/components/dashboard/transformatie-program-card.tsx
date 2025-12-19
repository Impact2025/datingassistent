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
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-11 h-11 bg-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-pink-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900">De Transformatie 3.0</h3>
            <p className="text-sm text-gray-500">
              Je complete transformatie reis. {program.completed_modules || 0} van 12 modules voltooid.
            </p>
          </div>
        </div>

        {/* Phase Progress - Clean minimal design */}
        <p className="text-xs text-gray-400 mb-2 italic">"DESIGN → ACTION → SURRENDER"</p>

        <div className="flex gap-1 mb-4">
          {(Object.keys(PHASES) as Array<keyof typeof PHASES>).map((phase) => {
            const config = PHASES[phase];
            const phaseProgress = getPhaseProgress(phase);
            const isActive = phase === currentPhase;

            return (
              <div key={phase} className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className={cn(
                    "text-xs",
                    isActive ? "text-gray-700 font-medium" : "text-gray-400"
                  )}>
                    {config.label}
                  </span>
                  <span className="text-xs text-gray-400">{phaseProgress}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      phase === 'DESIGN' && "bg-violet-400",
                      phase === 'ACTION' && "bg-amber-400",
                      phase === 'SURRENDER' && "bg-rose-400"
                    )}
                    style={{ width: `${phaseProgress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="flex gap-6 mb-4 text-center">
          <div>
            <p className="text-xs text-gray-400">Module</p>
            <p className="text-sm font-semibold text-gray-900">{currentModule}/12</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Lessen</p>
            <p className="text-sm font-semibold text-gray-900">{program.completed_lessons || 0}/{program.total_lessons || 48}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Voortgang</p>
            <p className="text-sm font-semibold text-gray-900">{progress}%</p>
          </div>
        </div>

        {/* Button */}
        <Button
          onClick={handleContinue}
          size="sm"
          className="bg-pink-500 hover:bg-pink-600 text-white rounded-full px-6"
        >
          {isCompleted ? (
            <>Bekijk Overzicht</>
          ) : isStarted ? (
            <>
              <Play className="w-4 h-4 mr-2" />
              Start je Transformatie
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Start je Transformatie
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
