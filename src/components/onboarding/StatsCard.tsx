"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatItem {
  label: string;
  value: string | number;
  icon?: string;
  color?: "pink" | "violet" | "amber" | "green";
}

interface StatsCardProps {
  stats: StatItem[];
  className?: string;
}

export function StatsCard({ stats, className }: StatsCardProps) {
  const colorMap = {
    pink: "text-coral-500",
    violet: "text-violet-500",
    amber: "text-amber-500",
    green: "text-green-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className={cn(
        "bg-white rounded-2xl p-4 shadow-lg border border-gray-100",
        className
      )}
    >
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className="text-center"
          >
            {stat.icon && (
              <span className="text-lg mb-1 block">{stat.icon}</span>
            )}
            <div
              className={cn(
                "text-2xl font-bold",
                colorMap[stat.color || "pink"]
              )}
            >
              {stat.value}
            </div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// Helper to create default stats for new users
export function getDefaultStats(
  daysActive: number = 1,
  toolsUsed: number = 0,
  completionPercentage: number = 0
): StatItem[] {
  return [
    {
      label: "Dagen actief",
      value: daysActive,
      icon: "📅",
      color: "violet",
    },
    {
      label: "Tools gebruikt",
      value: toolsUsed,
      icon: "🛠️",
      color: "pink",
    },
    {
      label: "Voltooid",
      value: `${completionPercentage}%`,
      icon: "✅",
      color: "green",
    },
  ];
}
