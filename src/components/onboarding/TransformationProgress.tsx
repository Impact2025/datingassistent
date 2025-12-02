"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check, Lock } from "lucide-react";

interface Phase {
  title: string;
  subtitle: string;
  progress: number; // 0-100
  isLocked: boolean;
}

interface TransformationProgressProps {
  phases: Phase[];
  className?: string;
}

export function TransformationProgress({
  phases,
  className,
}: TransformationProgressProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={cn("bg-white rounded-2xl p-6 shadow-lg border border-gray-100", className)}
    >
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Jouw Transformatie
      </h3>

      <div className="space-y-4">
        {phases.map((phase, index) => (
          <PhaseRow
            key={index}
            phase={phase}
            index={index}
            isLast={index === phases.length - 1}
          />
        ))}
      </div>

      {/* Overall Progress */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-500">Totale voortgang</span>
          <span className="font-semibold text-pink-600">
            {Math.round(
              phases.reduce((acc, p) => acc + p.progress, 0) / phases.length
            )}%
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${Math.round(
                phases.reduce((acc, p) => acc + p.progress, 0) / phases.length
              )}%`,
            }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
}

interface PhaseRowProps {
  phase: Phase;
  index: number;
  isLast: boolean;
}

function PhaseRow({ phase, index, isLast }: PhaseRowProps) {
  const isComplete = phase.progress === 100;
  const isActive = !phase.isLocked && phase.progress < 100;

  return (
    <div className="relative">
      {/* Connector Line */}
      {!isLast && (
        <div
          className={cn(
            "absolute left-4 top-8 bottom-0 w-0.5",
            isComplete ? "bg-pink-200" : "bg-gray-200"
          )}
        />
      )}

      <div className="flex items-start gap-4">
        {/* Status Icon */}
        <div
          className={cn(
            "relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
            isComplete && "bg-pink-500",
            isActive && "bg-pink-500 ring-4 ring-pink-100",
            phase.isLocked && "bg-gray-200"
          )}
        >
          {isComplete ? (
            <Check className="w-4 h-4 text-white" />
          ) : phase.isLocked ? (
            <Lock className="w-3 h-3 text-gray-400" />
          ) : (
            <span className="text-white text-sm font-bold">{index + 1}</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pb-4">
          <div className="flex items-center justify-between mb-1">
            <h4
              className={cn(
                "font-semibold",
                phase.isLocked ? "text-gray-400" : "text-gray-900"
              )}
            >
              {phase.title}
            </h4>
            {!phase.isLocked && (
              <span
                className={cn(
                  "text-sm font-medium",
                  isComplete ? "text-pink-500" : "text-gray-500"
                )}
              >
                {phase.progress}%
              </span>
            )}
          </div>

          <p
            className={cn(
              "text-sm mb-2",
              phase.isLocked ? "text-gray-300" : "text-gray-500"
            )}
          >
            {phase.subtitle}
          </p>

          {/* Progress Bar */}
          {!phase.isLocked && (
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${phase.progress}%` }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className={cn(
                  "h-full rounded-full",
                  isComplete
                    ? "bg-pink-500"
                    : "bg-gradient-to-r from-violet-400 to-pink-400"
                )}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Default phases for new users
export function getDefaultPhases(currentPhase: number = 0): Phase[] {
  return [
    {
      title: "Fundament",
      subtitle: "Profiel & Basis",
      progress: currentPhase > 0 ? 100 : 0,
      isLocked: false,
    },
    {
      title: "Connectie",
      subtitle: "Gesprekken & Matches",
      progress: currentPhase > 1 ? 100 : currentPhase === 1 ? 0 : 0,
      isLocked: currentPhase < 1,
    },
    {
      title: "Dates",
      subtitle: "Van Match naar Date",
      progress: currentPhase > 2 ? 100 : 0,
      isLocked: currentPhase < 2,
    },
  ];
}
