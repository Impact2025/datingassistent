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

  // Determine grid columns based on number of options
  const gridCols = options.length <= 3
    ? "grid-cols-1"
    : options.length <= 4
    ? "grid-cols-2"
    : "grid-cols-1 sm:grid-cols-2";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("w-full max-h-[50vh] overflow-y-auto", className)}
    >
      {/* Responsive grid with scroll */}
      <div className={cn("grid gap-2", gridCols)}>
        {options.map((option, index) => (
          <motion.button
            key={option.value}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03 }}
            onClick={() => {
              handleClick(option.value);
              triggerHaptic();
            }}
            className={cn(
              "relative min-h-[56px] px-4 py-3.5 rounded-xl font-medium transition-all duration-150",
              "border-2 flex items-center justify-start gap-3",
              "active:scale-[0.98]",
              "text-left",
              isSelected(option.value)
                ? "bg-gradient-to-br from-pink-500 to-pink-600 text-white border-pink-600 shadow-md"
                : "bg-white text-gray-900 border-gray-200 hover:border-pink-300 hover:bg-pink-50/50"
            )}
          >
            {option.icon && (
              <span className="text-xl flex-shrink-0">{option.icon}</span>
            )}
            <span className="flex-1 text-sm sm:text-base font-medium leading-snug">
              {option.label}
            </span>
            {isSelected(option.value) && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="flex-shrink-0"
              >
                <Check className="w-5 h-5" />
              </motion.span>
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
