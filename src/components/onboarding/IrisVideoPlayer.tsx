'use client';

/**
 * Iris Video Player - World-Class Video Experience
 *
 * A premium video player for Iris coach videos in onboarding.
 * Features:
 * - Elegant play/pause overlay
 * - Skip button (always visible)
 * - Mute/unmute toggle
 * - Progress bar with scrubbing
 * - Captions/subtitles support (WebVTT)
 * - Loading skeleton with Iris avatar
 * - Error state with retry
 * - Lazy loading for performance
 * - Reduced motion support
 * - Mobile-first responsive design
 * - Keyboard accessible
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipForward,
  RotateCcw,
  AlertCircle,
  Subtitles,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { IrisAvatar } from './IrisAvatar';
import { Button } from '@/components/ui/button';

// =====================================================
// TYPES
// =====================================================

export interface VideoCaption {
  src: string;
  srclang: string;
  label: string;
  default?: boolean;
}

export interface IrisVideoPlayerProps {
  /** Video source URL (MP4) */
  src: string;
  /** WebM source for better compression (optional) */
  srcWebm?: string;
  /** Poster image shown before video loads */
  poster?: string;
  /** Video captions/subtitles */
  captions?: VideoCaption[];
  /** Called when video ends naturally */
  onComplete?: () => void;
  /** Called when user skips the video */
  onSkip?: () => void;
  /** Auto-play the video (muted by default for autoplay policy) */
  autoPlay?: boolean;
  /** Show skip button */
  showSkip?: boolean;
  /** Skip button text */
  skipText?: string;
  /** Delay before showing skip button (ms) */
  skipDelay?: number;
  /** Title shown above video */
  title?: string;
  /** Subtitle/description */
  subtitle?: string;
  /** Additional CSS classes */
  className?: string;
}

type VideoState = 'loading' | 'ready' | 'playing' | 'paused' | 'ended' | 'error';

// =====================================================
// MAIN COMPONENT
// =====================================================

export function IrisVideoPlayer({
  src,
  srcWebm,
  poster,
  captions = [],
  onComplete,
  onSkip,
  autoPlay = true,
  showSkip = true,
  skipText = 'Overslaan',
  skipDelay = 3000,
  title,
  subtitle,
  className,
}: IrisVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // State
  const [videoState, setVideoState] = useState<VideoState>('loading');
  const [isMuted, setIsMuted] = useState(autoPlay); // Muted for autoplay
  const [showCaptions, setShowCaptions] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [canSkip, setCanSkip] = useState(!showSkip || skipDelay === 0);
  const [showControls, setShowControls] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Auto-hide controls timer
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Show skip button after delay
  useEffect(() => {
    if (!showSkip || skipDelay === 0) return;

    const timer = setTimeout(() => {
      setCanSkip(true);
    }, skipDelay);

    return () => clearTimeout(timer);
  }, [showSkip, skipDelay]);

  // Auto-hide controls
  const resetControlsTimer = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);

    if (videoState === 'playing') {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [videoState]);

  useEffect(() => {
    resetControlsTimer();
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [resetControlsTimer]);

  // Video event handlers
  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      setDuration(video.duration);
      setVideoState('ready');

      // Autoplay if enabled
      if (autoPlay) {
        video.play().catch(() => {
          // Autoplay blocked, wait for user interaction
          setVideoState('paused');
        });
      }
    }
  }, [autoPlay]);

  const handlePlay = useCallback(() => {
    setVideoState('playing');
  }, []);

  const handlePause = useCallback(() => {
    if (videoRef.current && !videoRef.current.ended) {
      setVideoState('paused');
    }
  }, []);

  const handleEnded = useCallback(() => {
    setVideoState('ended');
    setShowControls(true);
    onComplete?.();
  }, [onComplete]);

  const handleError = useCallback(() => {
    setVideoState('error');
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);
      setProgress((video.currentTime / video.duration) * 100);
    }
  }, []);

  const handleCanPlay = useCallback(() => {
    if (videoState === 'loading') {
      setVideoState('ready');
    }
  }, [videoState]);

  // User interactions
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    setHasInteracted(true);

    if (video.paused || video.ended) {
      // If ended, restart
      if (video.ended) {
        video.currentTime = 0;
      }
      video.play();
    } else {
      video.pause();
    }
    resetControlsTimer();
  }, [resetControlsTimer]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    setHasInteracted(true);
    video.muted = !video.muted;
    setIsMuted(video.muted);
    resetControlsTimer();
  }, [resetControlsTimer]);

  const toggleCaptions = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    setShowCaptions(!showCaptions);

    // Toggle text tracks
    for (let i = 0; i < video.textTracks.length; i++) {
      video.textTracks[i].mode = !showCaptions ? 'showing' : 'hidden';
    }
    resetControlsTimer();
  }, [showCaptions, resetControlsTimer]);

  const handleSkip = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
    }
    onSkip?.();
  }, [onSkip]);

  const handleRetry = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      setVideoState('loading');
      video.load();
    }
  }, []);

  // Progress bar click/drag
  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const progressBar = progressRef.current;
    if (!video || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    video.currentTime = percentage * video.duration;
    resetControlsTimer();
  }, [resetControlsTimer]);

  // Keyboard controls
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const video = videoRef.current;
    if (!video) return;

    switch (e.key) {
      case ' ':
      case 'k':
        e.preventDefault();
        togglePlay();
        break;
      case 'm':
        e.preventDefault();
        toggleMute();
        break;
      case 'c':
        e.preventDefault();
        toggleCaptions();
        break;
      case 'ArrowRight':
        e.preventDefault();
        video.currentTime = Math.min(video.currentTime + 5, video.duration);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        video.currentTime = Math.max(video.currentTime - 5, 0);
        break;
      case 'Escape':
        if (canSkip) {
          handleSkip();
        }
        break;
    }
  }, [togglePlay, toggleMute, toggleCaptions, canSkip, handleSkip]);

  // Format time (mm:ss)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Animation variants
  const fadeIn = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };

  const scaleIn = prefersReducedMotion
    ? {}
    : { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 } };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div
      className={cn(
        'relative w-full max-w-2xl mx-auto',
        'rounded-2xl sm:rounded-3xl overflow-hidden',
        'bg-gradient-to-br from-coral-900 to-purple-900',
        'shadow-2xl shadow-coral-900/30',
        className
      )}
      onMouseMove={resetControlsTimer}
      onTouchStart={resetControlsTimer}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="application"
      aria-label="Video speler"
    >
      {/* Title/Subtitle overlay */}
      {(title || subtitle) && videoState !== 'playing' && (
        <motion.div
          {...fadeIn}
          className="absolute top-0 left-0 right-0 z-20 p-4 sm:p-6 bg-gradient-to-b from-black/60 to-transparent"
        >
          {title && (
            <h2 className="text-white text-lg sm:text-xl font-bold">{title}</h2>
          )}
          {subtitle && (
            <p className="text-white/80 text-sm mt-1">{subtitle}</p>
          )}
        </motion.div>
      )}

      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full aspect-video object-cover"
        poster={poster}
        muted={isMuted}
        playsInline
        preload="metadata"
        onLoadedMetadata={handleLoadedMetadata}
        onCanPlay={handleCanPlay}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onError={handleError}
        onTimeUpdate={handleTimeUpdate}
      >
        {srcWebm && <source src={srcWebm} type="video/webm" />}
        <source src={src} type="video/mp4" />
        {captions.map((caption) => (
          <track
            key={caption.srclang}
            kind="captions"
            src={caption.src}
            srcLang={caption.srclang}
            label={caption.label}
            default={caption.default && showCaptions}
          />
        ))}
      </video>

      {/* Loading state */}
      <AnimatePresence>
        {videoState === 'loading' && (
          <motion.div
            {...fadeIn}
            className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-coral-900 to-purple-900"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <IrisAvatar size="xl" showGlow className="ring-4 ring-white/20" />
            </motion.div>
            <div className="mt-6 flex items-center gap-2 text-white/80">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Video laden...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error state */}
      <AnimatePresence>
        {videoState === 'error' && (
          <motion.div
            {...fadeIn}
            className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-coral-900 to-purple-900 p-6"
          >
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-white text-center mb-4">
              Video kon niet worden geladen
            </p>
            <div className="flex gap-3">
              <Button
                onClick={handleRetry}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Opnieuw proberen
              </Button>
              {showSkip && (
                <Button
                  onClick={handleSkip}
                  className="bg-white text-coral-600 hover:bg-white/90"
                >
                  {skipText}
                  <SkipForward className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Play/Pause overlay (center) */}
      <AnimatePresence>
        {(videoState === 'ready' || videoState === 'paused' || videoState === 'ended') && (
          <motion.button
            {...scaleIn}
            onClick={togglePlay}
            className={cn(
              'absolute inset-0 flex items-center justify-center',
              'bg-black/30 hover:bg-black/40 transition-colors',
              'focus:outline-none focus:ring-4 focus:ring-coral-500/50'
            )}
            aria-label={videoState === 'ended' ? 'Opnieuw afspelen' : 'Afspelen'}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-2xl"
            >
              {videoState === 'ended' ? (
                <RotateCcw className="w-8 h-8 sm:w-10 sm:h-10 text-coral-600" />
              ) : (
                <Play className="w-8 h-8 sm:w-10 sm:h-10 text-coral-600 ml-1" />
              )}
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Controls bar (bottom) */}
      <AnimatePresence>
        {showControls && videoState !== 'loading' && videoState !== 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-12"
          >
            {/* Progress bar */}
            <div
              ref={progressRef}
              onClick={handleProgressClick}
              className="relative h-1.5 bg-white/30 rounded-full cursor-pointer mb-4 group"
              role="slider"
              aria-label="Video voortgang"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              {/* Buffered progress would go here */}
              <motion.div
                className="absolute inset-y-0 left-0 bg-coral-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
              {/* Scrubber handle */}
              <motion.div
                className={cn(
                  'absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg',
                  'opacity-0 group-hover:opacity-100 transition-opacity',
                  '-ml-2'
                )}
                style={{ left: `${progress}%` }}
              />
            </div>

            {/* Controls row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Play/Pause button */}
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors touch-manipulation"
                  aria-label={videoState === 'playing' ? 'Pauzeren' : 'Afspelen'}
                >
                  {videoState === 'playing' ? (
                    <Pause className="w-5 h-5 text-white" />
                  ) : (
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  )}
                </button>

                {/* Mute button */}
                <button
                  onClick={toggleMute}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors touch-manipulation"
                  aria-label={isMuted ? 'Geluid aan' : 'Geluid uit'}
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5 text-white" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-white" />
                  )}
                </button>

                {/* Captions toggle (if available) */}
                {captions.length > 0 && (
                  <button
                    onClick={toggleCaptions}
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center transition-colors touch-manipulation',
                      showCaptions ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'
                    )}
                    aria-label={showCaptions ? 'Ondertiteling uit' : 'Ondertiteling aan'}
                    aria-pressed={showCaptions}
                  >
                    <Subtitles className="w-5 h-5 text-white" />
                  </button>
                )}

                {/* Time display */}
                <div className="text-white/80 text-sm font-mono hidden sm:block">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              {/* Skip button */}
              {showSkip && (
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{
                    opacity: canSkip ? 1 : 0.5,
                    x: 0
                  }}
                  onClick={canSkip ? handleSkip : undefined}
                  disabled={!canSkip}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all touch-manipulation',
                    canSkip
                      ? 'bg-white text-coral-600 hover:bg-white/90 cursor-pointer'
                      : 'bg-white/20 text-white/60 cursor-not-allowed'
                  )}
                  aria-label={skipText}
                >
                  {skipText}
                  <SkipForward className="w-4 h-4" />
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unmute hint (shown when autoplay muted) */}
      <AnimatePresence>
        {videoState === 'playing' && isMuted && !hasInteracted && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={toggleMute}
            className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 rounded-full bg-black/60 text-white text-sm hover:bg-black/70 transition-colors touch-manipulation"
          >
            <VolumeX className="w-4 h-4" />
            <span>Tik voor geluid</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export default IrisVideoPlayer;
