/**
 * WelcomeVideoCard - Reusable welcome video component
 * Shows Iris introduction video (one-time after onboarding)
 */

'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface WelcomeVideoCardProps {
  onDismiss: () => void;
}

export const WelcomeVideoCard = React.memo(function WelcomeVideoCard({
  onDismiss
}: WelcomeVideoCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);

  const handlePlayPause = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        try {
          await videoRef.current.play();
          setIsPlaying(true);
        } catch (error) {
          console.error('Video playback failed:', error);
          // Reset playing state if play fails
          setIsPlaying(false);
        }
      }
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="p-0 rounded-2xl shadow-sm overflow-hidden">
        <div className="relative aspect-video bg-gradient-to-br from-pink-100 to-pink-200">
          {!videoError ? (
            <>
              <video
                ref={videoRef}
                src="/videos/onboarding/iris-dashboard-intro.mp4"
                className="absolute inset-0 w-full h-full object-cover"
                muted={isMuted}
                playsInline
                preload="metadata"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onError={() => setVideoError(true)}
                onEnded={onDismiss}
                poster="/images/iris-poster.jpg"
              />

              {/* Play Button Overlay */}
              {!isPlaying && (
                <button
                  onClick={handlePlayPause}
                  className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/20 transition-colors"
                  aria-label="Play video"
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
                    aria-label="Pause video"
                  >
                    <Pause className="w-4 h-4 text-white" />
                  </button>
                )}
                <button
                  onClick={handleMuteToggle}
                  className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
                  aria-label={isMuted ? "Unmute" : "Mute"}
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
            /* Fallback when video doesn't load */
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-white">I</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Iris, je persoonlijke coach</p>
              </div>
            </div>
          )}
        </div>

        {/* Video Caption with dismiss button */}
        <div className="p-4 bg-white dark:bg-gray-800 flex items-start justify-between gap-4">
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed flex-1">
            Welkom op je dashboard! Dit is je startpunt voor alles wat je nodig hebt om succesvol te daten. Laat me je rondleiden!
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
          >
            Begrepen
          </Button>
        </div>
      </Card>
    </motion.div>
  );
});
