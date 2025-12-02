"use client";

import { cn } from "@/lib/utils";
import { IrisAvatar } from "./IrisAvatar";
import { motion } from "framer-motion";

interface IrisSpeechBubbleProps {
  message: string;
  showAvatar?: boolean;
  avatarSize?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  animated?: boolean;
  variant?: "default" | "highlight";
}

export function IrisSpeechBubble({
  message,
  showAvatar = true,
  avatarSize = "sm",
  className,
  animated = true,
  variant = "default",
}: IrisSpeechBubbleProps) {
  const bubbleVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const content = (
    <div className={cn("flex gap-3 items-start", className)}>
      {showAvatar && <IrisAvatar size={avatarSize} />}
      <div
        className={cn(
          "rounded-2xl rounded-tl-none px-4 py-3 max-w-md shadow-sm",
          variant === "default" && "bg-gray-100",
          variant === "highlight" &&
            "bg-gradient-to-r from-violet-50 to-pink-50 border border-pink-200"
        )}
      >
        <p className="text-gray-800">{message}</p>
      </div>
    </div>
  );

  if (animated) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={bubbleVariants}
        transition={{ duration: 0.3 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
}
