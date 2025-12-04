"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

interface IrisAvatarProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showGlow?: boolean;
  animated?: boolean;
}

const sizeMap = {
  xs: "w-8 h-8",
  sm: "w-12 h-12",
  md: "w-16 h-16",
  lg: "w-20 h-20",
  xl: "w-24 h-24",
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
        "rounded-full overflow-hidden shadow-lg relative flex-shrink-0",
        sizeMap[size],
        showGlow && "ring-4 ring-pink-300/50 ring-offset-2 ring-offset-white",
        animated && "animate-pulse",
        className
      )}
    >
      <Image
        src="/images/iris-avatar.png"
        alt="Iris - Your Dating Coach"
        fill
        className="object-cover"
        priority
      />
    </div>
  );
}
