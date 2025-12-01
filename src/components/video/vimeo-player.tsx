'use client';

/**
 * Vimeo Player Component - Professional video player with progress tracking
 * Sprint 4: Integration & UX Enhancement
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface VimeoPlayerProps {
  videoUrl: string; // Full Vimeo URL or video ID
  autoplay?: boolean;
  onProgress?: (seconds: number) => void;
  onEnded?: () => void;
  onReady?: () => void;
  initialTime?: number;
  className?: string;
}

export function VimeoPlayer({
  videoUrl,
  autoplay = false,
  onProgress,
  onEnded,
  onReady,
  initialTime = 0,
  className = ''
}: VimeoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Extract Vimeo video ID from URL
  const getVimeoId = (url: string): string => {
    // Handle various Vimeo URL formats
    const patterns = [
      /vimeo\.com\/(\d+)/,
      /player\.vimeo\.com\/video\/(\d+)/,
      /^(\d+)$/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return url; // Return as-is if no pattern matches
  };

  const videoId = getVimeoId(videoUrl);

  // Initialize Vimeo Player
  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    // Load Vimeo Player API
    const loadVimeoAPI = async () => {
      if (!(window as any).Vimeo) {
        const script = document.createElement('script');
        script.src = 'https://player.vimeo.com/api/player.js';
        script.async = true;
        document.body.appendChild(script);

        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      initializePlayer();
    };

    const initializePlayer = async () => {
      if (!containerRef.current) return;

      const Vimeo = (window as any).Vimeo;
      if (!Vimeo) return;

      try {
        // Create player
        const player = new Vimeo.Player(containerRef.current, {
          id: videoId,
          width: 640,
          responsive: true,
          controls: false, // We'll use custom controls
          autoplay: autoplay,
          muted: false,
          playsinline: true
        });

        playerRef.current = player;

        // Set initial time if provided
        if (initialTime > 0) {
          await player.setCurrentTime(initialTime);
        }

        // Get duration
        const videoDuration = await player.getDuration();
        setDuration(videoDuration);

        // Player event listeners
        player.on('play', () => {
          setIsPlaying(true);
          startProgressTracking();
        });

        player.on('pause', () => {
          setIsPlaying(false);
          stopProgressTracking();
        });

        player.on('ended', () => {
          setIsPlaying(false);
          stopProgressTracking();
          onEnded?.();
        });

        player.on('timeupdate', async (data: any) => {
          setCurrentTime(data.seconds);
        });

        player.on('loaded', () => {
          setIsReady(true);
          setIsLoading(false);
          onReady?.();
        });

        // Get initial mute state
        const muted = await player.getMuted();
        setIsMuted(muted);

      } catch (error) {
        console.error('Error initializing Vimeo player:', error);
        setIsLoading(false);
      }
    };

    loadVimeoAPI();

    return () => {
      stopProgressTracking();
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoId, autoplay, initialTime]);

  // Progress tracking
  const startProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) return;

    progressIntervalRef.current = setInterval(async () => {
      if (playerRef.current && onProgress) {
        try {
          const time = await playerRef.current.getCurrentTime();
          onProgress(time);
        } catch (error) {
          console.error('Error tracking progress:', error);
        }
      }
    }, 5000); // Update every 5 seconds
  }, [onProgress]);

  const stopProgressTracking = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  // Player controls
  const handlePlayPause = async () => {
    if (!playerRef.current) return;

    try {
      if (isPlaying) {
        await playerRef.current.pause();
      } else {
        await playerRef.current.play();
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  };

  const handleMuteToggle = async () => {
    if (!playerRef.current) return;

    try {
      const newMutedState = !isMuted;
      await playerRef.current.setMuted(newMutedState);
      setIsMuted(newMutedState);
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
  };

  const handleFullscreen = async () => {
    if (!playerRef.current) return;

    try {
      await playerRef.current.requestFullscreen();
    } catch (error) {
      console.error('Error entering fullscreen:', error);
    }
  };

  const handleSeek = async (percentage: number) => {
    if (!playerRef.current || !duration) return;

    try {
      const newTime = (percentage / 100) * duration;
      await playerRef.current.setCurrentTime(newTime);
      setCurrentTime(newTime);
    } catch (error) {
      console.error('Error seeking:', error);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
      {/* Vimeo Player Container */}
      <div ref={containerRef} className="w-full aspect-video" />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center space-y-3">
            <Loader2 className="w-12 h-12 text-white animate-spin mx-auto" />
            <p className="text-white text-sm">Video laden...</p>
          </div>
        </div>
      )}

      {/* Custom Controls Overlay */}
      {isReady && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4">
          <div className="space-y-3">
            {/* Progress Bar */}
            <div
              className="w-full h-1 bg-white/30 rounded-full cursor-pointer group"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const percentage = (x / rect.width) * 100;
                handleSeek(percentage);
              }}
            >
              <div
                className="h-full bg-pink-500 rounded-full transition-all group-hover:bg-pink-400"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Play/Pause */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePlayPause}
                  className="text-white hover:text-white hover:bg-white/20"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </Button>

                {/* Time */}
                <span className="text-white text-sm font-medium">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Mute */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMuteToggle}
                  className="text-white hover:text-white hover:bg-white/20"
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </Button>

                {/* Fullscreen */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFullscreen}
                  className="text-white hover:text-white hover:bg-white/20"
                >
                  <Maximize className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
