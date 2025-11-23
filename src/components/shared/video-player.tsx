"use client";

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Play, Pause, Volume2, VolumeX, AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  controls?: boolean;
  onEnded?: () => void;
  onError?: (error: Error) => void;
  fallbackText?: string;
}

export function VideoPlayer({
  src,
  poster,
  title,
  className,
  autoPlay = false,
  muted = false,
  controls = true,
  onEnded,
  onError,
  fallbackText = "Video kon niet worden geladen"
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle video play/pause
  const handlePlay = async () => {
    if (videoRef.current) {
      try {
        if (isPlaying) {
          videoRef.current.pause();
          setIsPlaying(false);
        } else {
          await videoRef.current.play();
          setIsPlaying(true);
        }
      } catch (error) {
        console.error('Video play failed:', error);
        setHasError(true);
        onError?.(error as Error);
      }
    }
  };

  // Handle video end
  const handleEnded = () => {
    setIsPlaying(false);
    onEnded?.();
  };

  // Handle video error
  const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const target = e.target as HTMLVideoElement;
    console.error('Video error:', target.error);
    setHasError(true);
    setIsLoading(false);
    onError?.(new Error(`Video failed to load: ${target.error?.message || 'Unknown error'}`));
  };

  // Handle video load
  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  // Toggle mute
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  // Retry loading video
  const retryVideo = () => {
    setHasError(false);
    setIsLoading(true);
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  // Show controls on hover
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseEnter = () => setShowControls(true);
    const handleMouseLeave = () => setShowControls(false);

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Auto-play if requested
  useEffect(() => {
    if (autoPlay && videoRef.current && !hasError) {
      const playVideo = async () => {
        try {
          await videoRef.current!.play();
          setIsPlaying(true);
        } catch (error) {
          // Auto-play failed, user interaction required
          console.log('Auto-play prevented by browser');
        }
      };
      playVideo();
    }
  }, [autoPlay, hasError]);

  if (hasError) {
    return (
      <Card className={cn("relative overflow-hidden", className)}>
        <CardContent className="p-6">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {fallbackText}
              <Button
                variant="outline"
                size="sm"
                onClick={retryVideo}
                className="ml-2 border-red-300 text-red-700 hover:bg-red-100"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Opnieuw proberen
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative group", className)}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover rounded-lg"
        poster={poster}
        muted={isMuted}
        playsInline
        preload="metadata"
        onEnded={handleEnded}
        onError={handleError}
        onLoadedData={handleLoad}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        <source src={src} type="video/mp4" />
        <source src={src.replace('.mp4', '.webm')} type="video/webm" />
        Uw browser ondersteunt deze video niet.
      </video>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}

      {/* Play button overlay (when paused) */}
      {!isPlaying && !isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            onClick={handlePlay}
            size="lg"
            className="bg-white/90 hover:bg-white text-black rounded-full w-16 h-16 p-0 shadow-lg"
          >
            <Play className="w-6 h-6 ml-1" />
          </Button>
        </div>
      )}

      {/* Custom controls overlay */}
      {controls && showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 rounded-b-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePlay}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="text-white hover:bg-white/20"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
            </div>
            {title && (
              <div className="text-white text-sm bg-black/50 px-2 py-1 rounded">
                {title}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}