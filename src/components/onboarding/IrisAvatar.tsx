"use client";

import { cn } from "@/lib/utils";

interface IrisAvatarProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showGlow?: boolean;
  animated?: boolean;
}

const sizeMap = {
  xs: "w-8 h-8 text-sm",
  sm: "w-12 h-12 text-lg",
  md: "w-16 h-16 text-xl",
  lg: "w-20 h-20 text-2xl",
  xl: "w-24 h-24 text-3xl",
};

export function IrisAvatar({
  size = "md",
  className,
  showGlow = false,
  animated = false,
}: IrisAvatarProps) {
  return (
    <div
      className={cn(
        "rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg",
        sizeMap[size],
        showGlow && "ring-4 ring-pink-300/50 ring-offset-2 ring-offset-white",
        animated && "animate-pulse",
        className
      )}
    >
      <span className="text-white font-bold select-none">I</span>
    </div>
  );
}
