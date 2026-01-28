"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Lock, ChevronRight } from "lucide-react";
import { getToolDetails } from "@/lib/onboarding/getRecommendedPath";

interface Phase {
  week: string;
  title: string;
  subtitle: string;
  tools: string[];
  focus: string;
}

interface RoadmapTimelineProps {
  phases: Phase[];
  currentPhase?: number;
  className?: string;
}

export function RoadmapTimeline({
  phases,
  currentPhase = 0,
  className,
}: RoadmapTimelineProps) {
  return (
    <div className={cn("relative", className)}>
      {/* Vertical Line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-coral-500 via-violet-500 to-gray-200" />

      {/* Phases */}
      <div className="space-y-8">
        {phases.map((phase, index) => (
          <PhaseCard
            key={index}
            phase={phase}
            index={index}
            isActive={index === currentPhase}
            isCompleted={index < currentPhase}
            isLocked={index > currentPhase}
          />
        ))}
      </div>
    </div>
  );
}

interface PhaseCardProps {
  phase: Phase;
  index: number;
  isActive: boolean;
  isCompleted: boolean;
  isLocked: boolean;
}

function PhaseCard({
  phase,
  index,
  isActive,
  isCompleted,
  isLocked,
}: PhaseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.2, duration: 0.4 }}
      className="relative pl-16"
    >
      {/* Phase Indicator */}
      <div
        className={cn(
          "absolute left-0 w-12 h-12 rounded-full flex items-center justify-center shadow-lg z-10",
          isCompleted && "bg-green-500",
          isActive && "bg-coral-500 ring-4 ring-coral-200",
          isLocked && "bg-gray-300"
        )}
      >
        {isCompleted ? (
          <Check className="w-6 h-6 text-white" />
        ) : isLocked ? (
          <Lock className="w-5 h-5 text-gray-500" />
        ) : (
          <span className="text-white font-bold">{index + 1}</span>
        )}
      </div>

      {/* Phase Content */}
      <motion.div
        className={cn(
          "rounded-2xl p-6 transition-all",
          isActive &&
            "bg-gradient-to-r from-violet-50 to-coral-50 border-2 border-coral-200 shadow-lg",
          isCompleted && "bg-green-50 border border-green-200",
          isLocked && "bg-gray-50 border border-gray-200 opacity-60"
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <span
              className={cn(
                "text-xs font-semibold uppercase tracking-wide",
                isActive ? "text-coral-500" : "text-gray-400"
              )}
            >
              Week {phase.week}
            </span>
            <h3
              className={cn(
                "text-xl font-bold mt-1",
                isActive ? "text-gray-900" : "text-gray-700"
              )}
            >
              {phase.title}
            </h3>
            <p
              className={cn(
                "text-sm",
                isActive ? "text-gray-600" : "text-gray-500"
              )}
            >
              {phase.subtitle}
            </p>
          </div>
          {isActive && (
            <span className="bg-coral-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Nu actief
            </span>
          )}
        </div>

        {/* Focus */}
        <p
          className={cn(
            "text-sm mb-4",
            isActive ? "text-gray-700" : "text-gray-500"
          )}
        >
          <strong>Focus:</strong> {phase.focus}
        </p>

        {/* Tools */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Tools in deze fase
          </span>
          <div className="flex flex-wrap gap-2">
            {phase.tools.map((toolSlug) => {
              const tool = getToolDetails(toolSlug);
              if (!tool) return null;

              return (
                <motion.div
                  key={toolSlug}
                  whileHover={!isLocked ? { scale: 1.05 } : undefined}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                    isActive
                      ? "bg-white shadow-sm hover:shadow-md cursor-pointer"
                      : "bg-white/50"
                  )}
                >
                  <span>{tool.icon}</span>
                  <span className={isLocked ? "text-gray-400" : "text-gray-700"}>
                    {tool.name}
                  </span>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
