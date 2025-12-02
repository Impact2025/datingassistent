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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("flex flex-wrap gap-3", className)}
    >
      {options.map((option, index) => (
        <motion.button
          key={option.value}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => handleClick(option.value)}
          className={cn(
            "relative px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
            "border-2 flex items-center gap-2",
            "hover:scale-105 active:scale-95",
            isSelected(option.value)
              ? "bg-pink-500 text-white border-pink-500 shadow-lg shadow-pink-200"
              : "bg-white text-gray-700 border-gray-200 hover:border-pink-300 hover:bg-pink-50"
          )}
        >
          {option.icon && <span className="text-base">{option.icon}</span>}
          <span>{option.label}</span>
          {isSelected(option.value) && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="ml-1"
            >
              <Check className="w-4 h-4" />
            </motion.span>
          )}
        </motion.button>
      ))}
    </motion.div>
  );
}
