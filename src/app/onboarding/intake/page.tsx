"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/providers/user-provider";
import { Logo } from "@/components/shared/logo";
import { IntakeChat, type IntakeData } from "@/components/onboarding/IntakeChat";
import { AchievementPopup } from "@/components/onboarding/AchievementPopup";
import type { Achievement } from "@/lib/onboarding/achievements";

export default function IntakePage() {
  const { user } = useUser();
  const router = useRouter();
  const [earnedAchievement, setEarnedAchievement] = useState<Achievement | null>(null);
  const [showAchievement, setShowAchievement] = useState(false);

  const handleIntakeComplete = async (data: IntakeData) => {
    if (!user?.id) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch("/api/onboarding/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          ...data,
        }),
      });

      const result = await response.json();

      if (result.success && result.newAchievement) {
        setEarnedAchievement(result.newAchievement);
        setShowAchievement(true);
      } else {
        // No achievement, go directly to roadmap
        router.push("/onboarding/roadmap");
      }
    } catch (error) {
      console.error("Error saving intake:", error);
      // Still continue to roadmap on error
      router.push("/onboarding/roadmap");
    }
  };

  const handleAchievementClose = () => {
    setShowAchievement(false);
    router.push("/onboarding/roadmap");
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-lg mx-auto px-4 py-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Logo iconSize={36} textSize="lg" />
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden h-[calc(100vh-180px)] min-h-[500px]">
            <IntakeChat onComplete={handleIntakeComplete} />
          </div>
        </div>
      </div>

      <AchievementPopup
        achievement={earnedAchievement}
        isOpen={showAchievement}
        onClose={handleAchievementClose}
      />
    </>
  );
}
