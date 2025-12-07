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
      className={cn("w-full", className)}
    >
      {/* Value Display */}
      <div className="text-center mb-6">
        <motion.div
          key={localValue}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 text-white text-2xl font-bold shadow-lg"
        >
          {localValue}
        </motion.div>
      </div>

      {/* Slider Track - Larger touch area */}
      <div className="relative py-4 px-2">
        {/* Track Background */}
        <div className="h-2 bg-gray-200 rounded-full">
          {/* Track Fill */}
          <motion.div
            className="h-2 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full"
            style={{ width: `${percentage}%` }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          />
        </div>

        {/* Slider Input - MUCH LARGER touch area */}
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={localValue}
          onChange={(e) => handleChange(Number(e.target.value))}
          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
          style={{
            touchAction: 'none',
            WebkitTapHighlightColor: 'transparent'
          }}
        />

        {/* Visual Thumb */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-white border-4 border-pink-500 rounded-full shadow-xl pointer-events-none z-0"
          style={{ left: `calc(${percentage}% - 16px)` }}
          animate={{ left: `calc(${percentage}% - 16px)` }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />

        {/* Number markers */}
        <div className="flex justify-between mt-2 px-1">
          {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((num) => (
            <button
              key={num}
              onClick={() => handleChange(num)}
              className={cn(
                "w-6 h-6 flex items-center justify-center text-xs font-medium rounded-full transition-all",
                localValue === num
                  ? "bg-pink-500 text-white scale-110"
                  : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              )}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-4 text-center">
        {labels.map((label, index) => {
          const position = (index / (labels.length - 1)) * 100;
          const isNearValue = Math.abs(percentage - position) < 15;

          return (
            <div
              key={index}
              className={cn(
                "flex-1 text-xs font-medium transition-all",
                isNearValue
                  ? "text-pink-600 scale-105"
                  : "text-gray-500"
              )}
            >
              {label}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
