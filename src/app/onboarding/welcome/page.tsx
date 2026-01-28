"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/providers/user-provider";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/shared/logo";
import { ArrowRight, Play, Pause, Volume2, VolumeX, CheckCircle, Clock, Sparkles } from "lucide-react";
import { trackTutorialBegin, trackOnboardingStep } from "@/lib/analytics/ga4-events";

export default function WelcomePage() {
  const { user } = useUser();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);

  const firstName = user?.name?.split(" ")[0] || "daar";

  useEffect(() => {
    // Start onboarding in the background
    if (user?.id) {
      // Track tutorial begin in GA4
      trackTutorialBegin({
        tutorial_name: 'main_onboarding',
        user_id: user.id.toString(),
      });

      // Track welcome step
      trackOnboardingStep({
        step_number: 1,
        step_name: 'welcome',
        completed: false,
      });

      fetch("/api/onboarding/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      }).catch(console.error);
    }
  }, [user?.id]);

  const handleStart = async () => {
    setIsStarting(true);
    router.push("/onboarding/intake");
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Logo iconSize={36} textSize="lg" />
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-600 text-xs font-medium px-3 py-1 rounded-full mb-3">
            <CheckCircle className="w-3 h-3" />
            Account geactiveerd
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Welkom, {firstName}!
          </h1>
          <p className="text-gray-500 text-sm">
            Je bent klaar om te starten met DatingAssistent
          </p>
        </div>

        {/* Video Card */}
        <Card className="p-0 rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="relative aspect-video bg-gradient-to-br from-coral-100 to-coral-200">
            {!videoError ? (
              <>
                <video
                  ref={videoRef}
                  src="/videos/onboarding/iris-welcome.mp4"
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
                      <Play className="w-7 h-7 text-coral-500 ml-1" />
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
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-coral-500 to-coral-600 flex items-center justify-center mx-auto mb-3">
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
              Hoi {firstName}! Ik ben <span className="font-medium text-gray-900">Iris</span>, je persoonlijke dating coach.
              Ik ga je helpen om de beste versie van jezelf te laten zien.
            </p>
          </div>
        </Card>

        {/* What's Next Card */}
        <Card className="p-5 rounded-2xl shadow-sm mb-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Wat gaan we doen?
          </h2>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-coral-100 flex items-center justify-center flex-shrink-0">
                <span className="text-coral-600 text-xs font-bold">1</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Korte kennismaking</p>
                <p className="text-xs text-gray-500">Een paar vragen om je beter te leren kennen</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 text-xs font-bold">2</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Persoonlijk plan</p>
                <p className="text-xs text-gray-500">Je krijgt een op maat gemaakt stappenplan</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <span className="text-amber-600 text-xs font-bold">3</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Direct aan de slag</p>
                <p className="text-xs text-gray-500">Start meteen met je eerste actie</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Time Estimate */}
        <div className="flex items-center justify-center gap-2 text-gray-400 text-xs mb-6">
          <Clock className="w-3 h-3" />
          <span>Duurt ongeveer 3 minuten</span>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleStart}
          disabled={isStarting}
          className="w-full py-4 bg-coral-500 hover:bg-coral-600 text-white font-semibold rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
        >
          {isStarting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Even geduld...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Start met Iris</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Skip Option */}
        <button
          onClick={() => router.push("/dashboard")}
          className="w-full mt-3 py-2 text-gray-400 hover:text-gray-600 text-sm transition-colors"
        >
          Later, ga naar dashboard
        </button>
      </div>
    </div>
  );
}
