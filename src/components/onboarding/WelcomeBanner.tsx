"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { IrisAvatar } from "./IrisAvatar";
import { X, Sparkles } from "lucide-react";

interface WelcomeBannerProps {
  userName: string;
  irisMessage: string;
  className?: string;
  storageKey?: string;
}

export function WelcomeBanner({
  userName,
  irisMessage,
  className,
  storageKey = "dashboard-welcome-banner-dismissed",
}: WelcomeBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    // Check localStorage to see if banner was dismissed
    const dismissed = localStorage.getItem(storageKey);
    if (!dismissed) {
      setIsDismissed(false);
      // Small delay for animation
      setTimeout(() => setIsVisible(true), 100);
    }
  }, [storageKey]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      setIsDismissed(true);
      localStorage.setItem(storageKey, "true");
    }, 300);
  };

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "relative bg-gradient-to-r from-violet-500 to-pink-500 rounded-2xl p-6 shadow-lg overflow-hidden",
            className
          )}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>

          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            aria-label="Sluiten"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="relative flex items-start gap-4">
            <div className="flex-shrink-0">
              <IrisAvatar size="lg" showGlow />
            </div>

            <div className="flex-1 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium opacity-90">
                  Welkom terug!
                </span>
              </div>

              <h2 className="text-xl font-bold mb-2">
                Hoi {userName}! Je transformatie begint nu.
              </h2>

              <p className="text-white/90 text-sm leading-relaxed">
                {irisMessage}
              </p>
            </div>
          </div>

          {/* Progress Dots */}
          <div className="relative mt-4 flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-white" />
              <div className="w-2 h-2 rounded-full bg-white/50" />
              <div className="w-2 h-2 rounded-full bg-white/50" />
            </div>
            <span className="text-xs text-white/70">Dag 1 van je journey</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
