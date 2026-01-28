"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface ChipOption {
  value: string;
  label: string;
  icon?: string;
}

interface IntakeChipsProps {
  options: ChipOption[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  className?: string;
  multiSelect?: boolean;
  selectedValues?: string[];
  onMultiSelect?: (values: string[]) => void;
}

export function IntakeChips({
  options,
  selectedValue,
  onSelect,
  className,
  multiSelect = false,
  selectedValues = [],
  onMultiSelect,
}: IntakeChipsProps) {
  const handleClick = (value: string) => {
    if (multiSelect && onMultiSelect) {
      const newValues = selectedValues.includes(value)
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value];
      onMultiSelect(newValues);
    } else {
      onSelect(value);
    }
  };

  const isSelected = (value: string) => {
    return multiSelect ? selectedValues.includes(value) : selectedValue === value;
  };

  // Haptic feedback helper
  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  // Determine grid columns based on number of options - MOBILE OPTIMIZED
  const gridCols = options.length <= 3
    ? "grid-cols-1"
    : options.length <= 6
    ? "grid-cols-2"
    : "grid-cols-2 sm:grid-cols-3";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn("w-full max-h-[40vh] sm:max-h-[50vh] overflow-y-auto overscroll-contain", className)}
    >
      {/* Responsive grid with scroll - COMPACT FOR MOBILE */}
      <div className={cn("grid gap-1.5 sm:gap-2", gridCols)}>
        {options.map((option, index) => (
          <motion.button
            key={option.value}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.02 }}
            onClick={() => {
              handleClick(option.value);
              triggerHaptic();
            }}
            className={cn(
              "relative min-h-[44px] sm:min-h-[52px] px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl font-medium transition-all duration-100",
              "border-2 flex items-center justify-start gap-2 sm:gap-3",
              "active:scale-[0.97]",
              "text-left",
              isSelected(option.value)
                ? "bg-gradient-to-br from-coral-500 to-coral-600 text-white border-coral-600 shadow-md"
                : "bg-white text-gray-900 border-gray-200 active:border-coral-400 active:bg-coral-50"
            )}
          >
            {option.icon && (
              <span className="text-lg sm:text-xl flex-shrink-0">{option.icon}</span>
            )}
            <span className="flex-1 text-xs sm:text-sm font-medium leading-tight sm:leading-snug line-clamp-2">
              {option.label}
            </span>
            {isSelected(option.value) && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                className="flex-shrink-0"
              >
                <Check className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.span>
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
