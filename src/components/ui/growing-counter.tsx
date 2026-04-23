"use client";

import { useEffect, useState } from "react";

interface GrowingCounterProps {
  start?: number;
  intervalMs?: number;
  suffix?: string;
  className?: string;
}

export function GrowingCounter({
  start = 156,
  intervalMs = 8000,
  suffix = "+",
  className,
}: GrowingCounterProps) {
  const [count, setCount] = useState(start);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => prev + 1);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return (
    <span className={className}>
      {count}
      {suffix}
    </span>
  );
}
