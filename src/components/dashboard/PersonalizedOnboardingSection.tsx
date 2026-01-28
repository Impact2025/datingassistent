"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useUser } from "@/providers/user-provider";
import {
  WelcomeBanner,
  PriorityActionCard,
  TransformationProgress,
  StatsCard,
  PRIORITY_ACTIONS,
} from "@/components/onboarding";
import { Loader2 } from "lucide-react";

interface PersonalizedData {
  user: {
    firstName: string;
    daysActive: number;
  };
  isFirstVisit: boolean;
  priorityAction: typeof PRIORITY_ACTIONS.profile;
  progress: {
    totalXp: number;
    currentLevel: number;
    currentStreak: number;
    longestStreak: number;
  };
  stats: {
    daysActive: number;
    toolsUsed: number;
    completionPercentage: number;
  };
  transformationPhases: Array<{
    title: string;
    subtitle: string;
    progress: number;
    isLocked: boolean;
  }>;
  irisMessages: {
    welcome: string;
    motivation: string;
    tip: string;
  };
  recommendation: {
    path: string;
    personality: string;
  };
}

interface PersonalizedOnboardingSectionProps {
  className?: string;
}

export function PersonalizedOnboardingSection({
  className,
}: PersonalizedOnboardingSectionProps) {
  const { user } = useUser();
  const [data, setData] = useState<PersonalizedData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/dashboard/personalized?userId=${user.id}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch personalized data");
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error("Error fetching personalized data:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-coral-500 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return null; // Silently fail if no data
  }

  const {
    user: userData,
    isFirstVisit,
    priorityAction,
    stats,
    transformationPhases,
    irisMessages,
  } = data;

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Welcome Banner - Only shown once (dismissable) */}
        <WelcomeBanner
          userName={userData.firstName}
          irisMessage={irisMessages.welcome}
          storageKey={`dashboard-welcome-${user?.id}`}
        />

        {/* Stats Overview */}
        <StatsCard
          stats={[
            {
              label: "Dagen actief",
              value: stats.daysActive,
              icon: "📅",
              color: "violet",
            },
            {
              label: "Tools gebruikt",
              value: stats.toolsUsed,
              icon: "🛠️",
              color: "pink",
            },
            {
              label: "Voltooid",
              value: `${stats.completionPercentage}%`,
              icon: "✅",
              color: "green",
            },
          ]}
        />

        {/* Priority Action - Highlighted for first visit */}
        {isFirstVisit && priorityAction && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              Je Eerste Stap
            </h2>
            <PriorityActionCard
              toolSlug={priorityAction.toolSlug}
              toolName={priorityAction.toolName}
              toolIcon={priorityAction.toolIcon}
              toolDescription={priorityAction.toolDescription}
              estimatedTime={priorityAction.estimatedTime}
              irisMessage={priorityAction.irisMessage}
            />
          </motion.div>
        )}

        {/* Transformation Progress */}
        <TransformationProgress phases={transformationPhases} />

        {/* Iris Motivation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-violet-50 to-coral-50 rounded-2xl p-4 border border-coral-100"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-coral-500 flex items-center justify-center text-white font-bold flex-shrink-0">
              I
            </div>
            <div>
              <p className="text-gray-700 text-sm leading-relaxed">
                {irisMessages.motivation}
              </p>
              <p className="text-gray-500 text-xs mt-2 italic">
                💡 Tip: {irisMessages.tip}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
