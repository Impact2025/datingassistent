"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  value: number;
  onChange: (value: number) => void;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  label?: string;
  disabled?: boolean;
}

export function RatingStars({
  value,
  onChange,
  maxRating = 10,
  size = "md",
  label,
  disabled = false
}: RatingStarsProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };

  const handleClick = (rating: number) => {
    if (!disabled) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (!disabled) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!disabled) {
      setHoverValue(null);
    }
  };

  const displayValue = hoverValue ?? value;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="flex items-center gap-1">
        {Array.from({ length: maxRating }, (_, i) => i + 1).map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => handleClick(rating)}
            onMouseEnter={() => handleMouseEnter(rating)}
            onMouseLeave={handleMouseLeave}
            disabled={disabled}
            className={cn(
              "transition-colors duration-150",
              disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:scale-110"
            )}
          >
            <Star
              className={cn(
                sizeClasses[size],
                "transition-colors duration-150",
                rating <= displayValue
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300 hover:text-yellow-300"
              )}
            />
          </button>
        ))}
        <span className="ml-2 text-sm font-medium text-gray-600 min-w-[2rem]">
          {displayValue}/{maxRating}
        </span>
      </div>
    </div>
  );
}