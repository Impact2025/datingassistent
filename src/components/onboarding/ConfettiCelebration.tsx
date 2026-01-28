"use client";

import { useEffect, useState, useCallback } from "react";
import ReactConfetti from "react-confetti";

interface ConfettiCelebrationProps {
  duration?: number; // Duration in milliseconds
  pieces?: number;
  colors?: string[];
  onComplete?: () => void;
}

export function ConfettiCelebration({
  duration = 3000,
  pieces = 200,
  colors = ["#FF7B54", "#a855f7", "#8b5cf6", "#FFB49D", "#f9a8d4"],
  onComplete,
}: ConfettiCelebrationProps) {
  const [windowDimension, setWindowDimension] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });
  const [isRunning, setIsRunning] = useState(true);
  const [recycling, setRecycling] = useState(true);

  const detectSize = useCallback(() => {
    setWindowDimension({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  }, []);

  useEffect(() => {
    window.addEventListener("resize", detectSize);
    detectSize();

    return () => {
      window.removeEventListener("resize", detectSize);
    };
  }, [detectSize]);

  useEffect(() => {
    // Stop recycling after duration to let pieces fall
    const recycleTimer = setTimeout(() => {
      setRecycling(false);
    }, duration);

    // Stop completely after additional time
    const stopTimer = setTimeout(() => {
      setIsRunning(false);
      onComplete?.();
    }, duration + 3000);

    return () => {
      clearTimeout(recycleTimer);
      clearTimeout(stopTimer);
    };
  }, [duration, onComplete]);

  if (!isRunning) return null;

  return (
    <ReactConfetti
      width={windowDimension.width}
      height={windowDimension.height}
      numberOfPieces={pieces}
      recycle={recycling}
      colors={colors}
      gravity={0.3}
      wind={0.01}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 9999,
        pointerEvents: "none",
      }}
    />
  );
}
