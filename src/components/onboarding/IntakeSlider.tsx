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
  max = 3,
  labels = ["Beginner", "Gevorderd", "Expert"],
  className,
}: IntakeSliderProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (newValue: number) => {
    setLocalValue(newValue);
    onChange(newValue);
  };

  const percentage = ((localValue - min) / (max - min)) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("w-full max-w-md", className)}
    >
      {/* Slider Track */}
      <div className="relative pt-6 pb-2">
        {/* Track Background */}
        <div className="h-3 bg-gray-200 rounded-full">
          {/* Track Fill */}
          <motion.div
            className="h-3 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full"
            style={{ width: `${percentage}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Slider Input */}
        <input
          type="range"
          min={min}
          max={max}
          value={localValue}
          onChange={(e) => handleChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-3 opacity-0 cursor-pointer"
        />

        {/* Thumb */}
        <motion.div
          className="absolute top-4 -translate-y-1/2 w-6 h-6 bg-white border-4 border-pink-500 rounded-full shadow-lg pointer-events-none"
          style={{ left: `calc(${percentage}% - 12px)` }}
          animate={{ left: `calc(${percentage}% - 12px)` }}
          transition={{ duration: 0.2 }}
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-4">
        {labels.map((label, index) => {
          const labelValue = min + index;
          const isActive = localValue === labelValue;

          return (
            <button
              key={index}
              onClick={() => handleChange(labelValue)}
              className={cn(
                "text-sm font-medium transition-colors px-2 py-1 rounded-lg",
                isActive
                  ? "text-pink-600 bg-pink-50"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Level Indicator */}
      <motion.div
        key={localValue}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 text-center"
      >
        <span className="text-xs text-gray-400 uppercase tracking-wide">
          Jouw level
        </span>
        <p className="text-lg font-semibold text-pink-600">
          {labels[localValue - min]}
        </p>
      </motion.div>
    </motion.div>
  );
}
