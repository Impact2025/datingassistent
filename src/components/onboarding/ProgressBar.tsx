"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ProgressBarProps {
  progress: number; // 0-100
  showPercentage?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "gradient";
  className?: string;
  label?: string;
}

export function ProgressBar({
  progress,
  showPercentage = false,
  size = "md",
  variant = "gradient",
  className,
  label,
}: ProgressBarProps) {
  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={cn("w-full", className)}>
      {/* Label and Percentage */}
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-sm font-medium text-gray-700">{label}</span>
          )}
          {showPercentage && (
            <span className="text-sm font-semibold text-coral-600">
              {Math.round(clampedProgress)}%
            </span>
          )}
        </div>
      )}

      {/* Progress Track */}
      <div
        className={cn(
          "w-full bg-gray-200 rounded-full overflow-hidden",
          sizeClasses[size]
        )}
      >
        {/* Progress Fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={cn(
            "h-full rounded-full",
            variant === "default" && "bg-coral-500",
            variant === "gradient" &&
              "bg-gradient-to-r from-violet-500 to-coral-500"
          )}
        />
      </div>
    </div>
  );
}

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
  className?: string;
}

export function StepProgress({
  currentStep,
  totalSteps,
  labels,
  className,
}: StepProgressProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Steps */}
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div key={index} className="flex items-center">
            {/* Step Circle */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors",
                index < currentStep &&
                  "bg-coral-500 text-white",
                index === currentStep &&
                  "bg-coral-500 text-white ring-4 ring-coral-200",
                index > currentStep &&
                  "bg-gray-200 text-gray-500"
              )}
            >
              {index < currentStep ? (
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                index + 1
              )}
            </motion.div>

            {/* Connector Line */}
            {index < totalSteps - 1 && (
              <div className="flex-1 mx-2 h-0.5 bg-gray-200 relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: index < currentStep ? "100%" : "0%",
                  }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="absolute inset-y-0 left-0 bg-coral-500"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Labels */}
      {labels && (
        <div className="flex justify-between mt-2">
          {labels.map((label, index) => (
            <span
              key={index}
              className={cn(
                "text-xs font-medium",
                index <= currentStep ? "text-coral-600" : "text-gray-400"
              )}
              style={{ width: `${100 / totalSteps}%`, textAlign: "center" }}
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
