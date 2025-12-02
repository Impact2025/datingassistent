"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/providers/user-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RoadmapTimeline } from "@/components/onboarding/RoadmapTimeline";
import { AchievementPopup } from "@/components/onboarding/AchievementPopup";
import { getRoadmapPhases, getToolDetails } from "@/lib/onboarding/getRecommendedPath";
import type { Achievement } from "@/lib/onboarding/achievements";
import { ArrowRight, Sparkles, Loader2, Play, Pause, Volume2, VolumeX } from "lucide-react";

interface OnboardingStatus {
  recommendation: {
    path: string;
    pathTitle?: string;
    pathDescription?: string;
    priorityTools: string[];
    irisPersonality: string;
  };
  intake: {
    biggestChallenge: string;
  };
}

// Challenge labels for display
const CHALLENGE_LABELS: Record<string, string> = {
  "weinig-matches": "te weinig matches krijgen",
  "gesprekken-dood": "gesprekken die doodlopen",
  "geen-dates": "moeite met dates plannen",
  "weet-niet-wat-zeggen": "niet weten wat te zeggen",
  "fotos-niet-goed": "je foto's verbeteren",
  "geen-zelfvertrouwen": "meer zelfvertrouwen opbouwen",
};

// Video URLs for each path
const VIDEO_URLS: Record<string, string> = {
  profile: "/videos/onboarding/iris-roadmap-profile.mp4",
  conversation: "/videos/onboarding/iris-roadmap-conversation.mp4",
  dating: "/videos/onboarding/iris-roadmap-dating.mp4",
  confidence: "/videos/onboarding/iris-roadmap-confidence.mp4",
};

export default function RoadmapPage() {
  const { user } = useUser();
  const router = useRouter();
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [earnedAchievements, setEarnedAchievements] = useState<Achievement[]>([]);
  const [showAchievement, setShowAchievement] = useState(false);
  const [currentAchievementIndex, setCurrentAchievementIndex] = useState(0);

  // Video state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch(`/api/onboarding/status?userId=${user.id}`);
        const data = await response.json();

        if (data.exists) {
          setStatus(data);
        }
      } catch (error) {
        console.error("Error fetching onboarding status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, [user?.id]);

  const handleComplete = async () => {
    if (!user?.id) return;

    setIsCompleting(true);

    try {
      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      const result = await response.json();

      if (result.success && result.achievements?.length > 0) {
        setEarnedAchievements(result.achievements);
        setShowAchievement(true);
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
      router.push("/dashboard");
    }
  };

  const handleAchievementClose = () => {
    if (currentAchievementIndex < earnedAchievements.length - 1) {
      setCurrentAchievementIndex((prev) => prev + 1);
    } else {
      setShowAchievement(false);
      router.push("/dashboard");
    }
  };

  // Video controls
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const path = (status?.recommendation?.path || "profile") as
    | "profile"
    | "conversation"
    | "dating"
    | "confidence";
  const phases = getRoadmapPhases(path);
  const firstTool = status?.recommendation?.priorityTools?.[0];
  const firstToolDetails = firstTool ? getToolDetails(firstTool) : null;
  const challengeLabel =
    CHALLENGE_LABELS[status?.intake?.biggestChallenge || ""] ||
    "je dating succes verbeteren";

  // Iris message based on path
  const irisMessages: Record<string, string> = {
    profile: `Op basis van wat je verteld hebt, gaan we focussen op je profiel. Dit is de snelste manier om meer matches te krijgen!`,
    conversation: `Je wilt betere gesprekken voeren - dat is een geweldig doel! Ik ga je helpen om elke chat om te zetten in een date.`,
    dating: `Je bent klaar voor de volgende stap: dates! Ik ga je voorbereiden zodat elke date een succes wordt.`,
    confidence: `Zelfvertrouwen is de basis van alles. Samen gaan we werken aan hoe je jezelf ziet en presenteert.`,
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-lg mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-600 text-xs font-medium px-3 py-1 rounded-full mb-3">
              <Sparkles className="w-3 h-3" />
              Jouw Persoonlijke Plan
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Je Transformatie Roadmap
            </h1>
            <p className="text-gray-500 text-sm">
              Gebaseerd op je doel: <strong>{challengeLabel}</strong>
            </p>
          </div>

          {/* Iris Video Card */}
          <Card className="p-0 rounded-2xl shadow-sm overflow-hidden mb-6">
            <div className="relative aspect-video bg-gradient-to-br from-pink-100 to-purple-100">
              {!videoError ? (
                <>
                  <video
                    ref={videoRef}
                    src={VIDEO_URLS[path]}
                    className="absolute inset-0 w-full h-full object-cover"
                    muted={isMuted}
                    playsInline
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onError={() => setVideoError(true)}
                    poster="/images/iris-poster.jpg"
                  />

                  {/* Play Button Overlay */}
                  {!isPlaying && (
                    <button
                      onClick={handlePlayPause}
                      className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/20 transition-colors"
                    >
                      <div className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                        <Play className="w-7 h-7 text-pink-500 ml-1" />
                      </div>
                    </button>
                  )}

                  {/* Video Controls */}
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    {isPlaying && (
                      <button
                        onClick={handlePlayPause}
                        className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
                      >
                        <Pause className="w-4 h-4 text-white" />
                      </button>
                    )}
                    <button
                      onClick={handleMuteToggle}
                      className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4 text-white" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-white" />
                      )}
                    </button>
                  </div>
                </>
              ) : (
                /* Fallback als video niet laadt */
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl font-bold text-white">I</span>
                    </div>
                    <p className="text-gray-600 text-sm">Iris, je persoonlijke coach</p>
                  </div>
                </div>
              )}
            </div>

            {/* Video Caption */}
            <div className="p-4 bg-white">
              <p className="text-gray-600 text-sm leading-relaxed">
                {irisMessages[path]}
              </p>
            </div>
          </Card>

          {/* Timeline Card */}
          <Card className="p-5 rounded-2xl shadow-sm mb-6">
            <RoadmapTimeline phases={phases} currentPhase={0} />
          </Card>

          {/* First Action Recommendation */}
          {firstToolDetails && (
            <Card className="p-5 rounded-2xl shadow-sm mb-6 bg-gradient-to-r from-violet-50 to-pink-50 border-pink-200">
              <div className="flex items-start gap-1 mb-3">
                <span className="text-amber-500 text-lg">⭐</span>
                <span className="text-xs font-semibold text-pink-500 uppercase tracking-wide">
                  Aanbevolen eerste stap
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl">
                  {firstToolDetails.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {firstToolDetails.name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {firstToolDetails.description}
                  </p>
                  <span className="text-xs text-gray-400 mt-1 inline-block">
                    {firstToolDetails.estimatedTime}
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* CTA Button */}
          <button
            onClick={handleComplete}
            disabled={isCompleting}
            className="w-full py-4 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            {isCompleting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Even geduld...</span>
              </>
            ) : (
              <>
                <span>Bekijk mijn dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-400 mt-3">
            Je kunt later altijd je plan aanpassen
          </p>
        </div>
      </div>

      <AchievementPopup
        achievement={earnedAchievements[currentAchievementIndex] || null}
        isOpen={showAchievement}
        onClose={handleAchievementClose}
      />
    </>
  );
}
