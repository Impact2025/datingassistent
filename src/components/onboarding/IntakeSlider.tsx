"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface IntakeSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  labels?: string[];
  className?: string;
}

export function IntakeSlider({
  value,
  onChange,
  min = 1,
  max = 10,
  labels = ["Niet zelfverzekerd", "Neutraal", "Heel zelfverzekerd"],
  className,
}: IntakeSliderProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue: number) => {
    setLocalValue(newValue);
    onChange(newValue);

    // Haptic feedback on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("w-full", className)}
    >
      {/* Compact Value Display */}
      <div className="text-center mb-4">
        <motion.div
          key={localValue}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 text-white text-2xl font-bold shadow-lg"
        >
          {localValue}
        </motion.div>
      </div>

      {/* Number Grid - Mobile optimized */}
      <div className="mb-4">
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((num) => (
            <motion.button
              key={num}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: num * 0.02 }}
              onClick={() => handleChange(num)}
              className={cn(
                "aspect-square min-h-[44px] rounded-lg font-semibold text-sm sm:text-base",
                "transition-all duration-150 active:scale-95",
                "border-2",
                localValue === num
                  ? "bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-md border-pink-600"
                  : "bg-white text-gray-800 border-gray-200 hover:border-pink-300"
              )}
            >
              {num}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Labels - Simplified */}
      <div className="flex justify-between">
        {labels.map((label, index) => {
          const labelPosition = index / (labels.length - 1);
          const valuePosition = (localValue - min) / (max - min);
          const isActive = Math.abs(labelPosition - valuePosition) < 0.2;

          return (
            <span
              key={index}
              className={cn(
                "text-xs font-medium transition-all text-center flex-1 px-1",
                isActive ? "text-pink-600 font-semibold" : "text-gray-500"
              )}
            >
              {label}
            </span>
          );
        })}
      </div>
    </motion.div>
  );
}
