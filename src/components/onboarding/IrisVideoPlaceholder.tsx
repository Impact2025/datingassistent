"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { IrisAvatar } from "./IrisAvatar";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Video URL mapping - Voeg hier je video URLs toe
 *
 * Opties voor videoUrl:
 * 1. Lokaal: "/videos/onboarding/welcome.mp4" (plaats in public/videos/onboarding/)
 * 2. HeyGen: "https://resource.heygen.ai/video/xxx.mp4"
 * 3. Vimeo: Gebruik embed URL
 * 4. Andere CDN: Directe URL naar .mp4 bestand
 */
const VIDEO_URLS: Record<string, string> = {
  // Onboarding videos
  "welcome": "/videos/onboarding/iris-welcome.mp4",
  "intake-intro": "/videos/onboarding/iris-intake-intro.mp4",
  "roadmap-profile": "/videos/onboarding/iris-roadmap-profile.mp4",
  "roadmap-conversation": "/videos/onboarding/iris-roadmap-conversation.mp4",
  "roadmap-dating": "/videos/onboarding/iris-roadmap-dating.mp4",
  "roadmap-confidence": "/videos/onboarding/iris-roadmap-confidence.mp4",
  "first-win": "/videos/onboarding/iris-first-win.mp4",
  "dashboard-intro": "/videos/onboarding/iris-dashboard-intro.mp4",

  // Tool intro videos
  "tool-profiel-analyse": "/videos/onboarding/iris-tool-profiel-analyse.mp4",
  "tool-bio-builder": "/videos/onboarding/iris-tool-bio-builder.mp4",
  "tool-chat-coach": "/videos/onboarding/iris-tool-chat-coach.mp4",
};

interface IrisVideoPlaceholderProps {
  videoId: string;
  fallbackText: string;
  aspectRatio?: "16:9" | "1:1" | "4:3";
  onComplete?: () => void;
  className?: string;
  showPlayButton?: boolean;
  autoShowText?: boolean;
  autoPlay?: boolean;
  videoUrl?: string; // Override de VIDEO_URLS mapping
}

export function IrisVideoPlaceholder({
  videoId,
  fallbackText,
  aspectRatio = "1:1",
  onComplete,
  className,
  showPlayButton = false,
  autoShowText = true,
  autoPlay = false,
  videoUrl: externalVideoUrl,
}: IrisVideoPlaceholderProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(true);
  const [hasEnded, setHasEnded] = useState(false);

  // Gebruik externe URL of lookup in VIDEO_URLS
  const videoUrl = externalVideoUrl || VIDEO_URLS[videoId] || "";
  const hasVideo = Boolean(videoUrl);

  const aspectRatioClass = {
    "16:9": "aspect-video",
    "1:1": "aspect-square",
    "4:3": "aspect-[4/3]",
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

  const handleVideoEnd = () => {
    setHasEnded(true);
    setIsPlaying(false);
    onComplete?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={cn("flex flex-col items-center gap-4", className)}
    >
      {/* Video Container */}
      <div
        className={cn(
          "relative w-full max-w-xs rounded-2xl overflow-hidden bg-gradient-to-br from-violet-100 to-pink-100 flex items-center justify-center",
          aspectRatioClass[aspectRatio]
        )}
        data-video-id={videoId}
      >
        {hasVideo ? (
          <>
            {/* Echte Video */}
            <video
              ref={videoRef}
              src={videoUrl}
              className="absolute inset-0 w-full h-full object-cover"
              muted={isMuted}
              autoPlay={autoPlay}
              playsInline
              onEnded={handleVideoEnd}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />

            {/* Video Controls Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              {!isPlaying && (
                <button
                  onClick={handlePlayPause}
                  className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                >
                  <Play className="w-8 h-8 text-pink-500 ml-1" />
                </button>
              )}
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-2 right-2 flex gap-2">
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
          <>
            {/* Placeholder - geen video beschikbaar */}
            <IrisAvatar size="xl" showGlow animated />

            {/* Play Button Overlay (voor later) */}
            {showPlayButton && (
              <button
                onClick={onComplete}
                className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/20 transition-colors group"
              >
                <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 text-pink-500 ml-1" />
                </div>
              </button>
            )}

            {/* Video komt binnenkort badge */}
            <div className="absolute top-2 right-2">
              <span className="text-xs bg-white/80 text-gray-500 px-2 py-1 rounded-full">
                Video binnenkort
              </span>
            </div>
          </>
        )}
      </div>

      {/* Speech Bubble - alleen tonen als er geen video is of video is afgelopen */}
      {autoShowText && (!hasVideo || hasEnded) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="bg-white rounded-2xl px-6 py-4 shadow-md max-w-md text-center border border-gray-100"
        >
          <p className="text-gray-700 leading-relaxed">{fallbackText}</p>
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * Helper om video URL toe te voegen/updaten
 * Gebruik in een admin panel of config bestand
 */
export function getVideoUrl(videoId: string): string {
  return VIDEO_URLS[videoId] || "";
}

export function hasVideoForId(videoId: string): boolean {
  return Boolean(VIDEO_URLS[videoId]);
}
