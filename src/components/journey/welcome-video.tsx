"use client";

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Volume2, VolumeX, Pause } from 'lucide-react';

interface WelcomeVideoProps {
  onComplete: () => void;
}

export function WelcomeVideo({ onComplete }: WelcomeVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  console.log('🎥 DEBUG: WelcomeVideo component mounted');

  const handlePlay = () => {
    console.log('▶️ DEBUG: Video play button clicked');
    if (videoRef.current) {
      console.log('▶️ DEBUG: Attempting to play video...');
      videoRef.current.play().then(() => {
        console.log('✅ DEBUG: Video started playing successfully');
      }).catch((error) => {
        console.error('❌ DEBUG: Video play failed:', error);
      });
      setIsPlaying(true);
      setHasStarted(true);
    } else {
      console.error('❌ DEBUG: Video ref is null');
    }
  };

  const handlePause = () => {
    console.log('⏸️ DEBUG: Video pause button clicked');
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleVideoEnd = () => {
    console.log('🏁 DEBUG: Video ended, calling onComplete');
    setIsPlaying(false);
    onComplete();
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const target = e.currentTarget;
    const error = target.error;
    console.error('❌ DEBUG: Video error occurred:', error);

    let errorMessage = 'Video kon niet worden geladen';
    if (error) {
      switch (error.code) {
        case MediaError.MEDIA_ERR_NETWORK:
          errorMessage = 'Netwerkfout bij het laden van de video';
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = 'Video formaat wordt niet ondersteund';
          break;
        case MediaError.MEDIA_ERR_ABORTED:
          errorMessage = 'Video laden geannuleerd';
          break;
        default:
          errorMessage = `Video fout: ${error.message}`;
      }
    }

    setVideoError(errorMessage);
  };

  const skipVideo = () => {
    console.log('⏭️ DEBUG: User chose to skip video');
    onComplete();
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  // Auto-play when component mounts (optional)
  useEffect(() => {
    // We don't auto-play to respect user preferences
    // Users need to click play manually
  }, []);

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-white/95 backdrop-blur-sm shadow-lg">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-xl font-bold text-gray-900">
            Welkom bij DatingAssistent!
          </CardTitle>
          <p className="text-gray-600 mt-2 text-sm">
            Voordat we beginnen, wil ik je graag persoonlijk welkom heten.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Video Player */}
          <div className="relative aspect-[16/9] bg-black rounded-xl overflow-hidden shadow-inner max-w-2xl mx-auto">
            {videoError ? (
              // Error fallback UI
              <div className="w-full h-full bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center">
                <div className="text-center p-8 max-w-md">
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Video kon niet worden geladen
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    {videoError}
                  </p>
                  <Button
                    onClick={skipVideo}
                    className="bg-pink-500 hover:bg-pink-600 text-white"
                  >
                    Doorgaan zonder video
                  </Button>
                </div>
              </div>
            ) : (
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                onEnded={handleVideoEnd}
                onPlay={() => {
                  console.log('▶️ DEBUG: Video onPlay event fired');
                  setIsPlaying(true);
                }}
                onPause={() => {
                  console.log('⏸️ DEBUG: Video onPause event fired');
                  setIsPlaying(false);
                }}
                onError={handleVideoError}
                onLoadStart={() => console.log('⏳ DEBUG: Video load started')}
                onLoadedData={() => {
                  console.log('✅ DEBUG: Video data loaded');
                  setVideoLoaded(true);
                }}
                onCanPlay={() => console.log('🎯 DEBUG: Video can play')}
                muted={isMuted}
                playsInline
                preload="metadata"
              >
                <source src="/videos/Welkom-dashboard.mp4" type="video/mp4" />
                <source src="/videos/Welkom-dashboard.mp4" type="video/webm" />
                Uw browser ondersteunt deze video niet.
              </video>
            )}

            {/* Video Controls Overlay */}
            {!hasStarted && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                    <Play className="w-8 h-8 text-pink-500 ml-1" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">Welkomstvideo van Iris</h3>
                    <p className="text-sm text-gray-300">Klik om te starten</p>
                  </div>
                </div>
              </div>
            )}

            {/* Playing Controls */}
            {hasStarted && (
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={isPlaying ? handlePause : handlePlay}
                    className="bg-black/50 hover:bg-black/70 text-white border-0"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    className="bg-black/50 hover:bg-black/70 text-white border-0"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="text-white text-sm bg-black/50 px-2 py-1 rounded">
                  Welkomstvideo van Iris
                </div>
              </div>
            )}
          </div>

          {/* Play Button - Only show if video hasn't started yet */}
          {!hasStarted && (
            <div className="text-center">
              <Button
                onClick={handlePlay}
                className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2.5 text-base rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Welkomstvideo
              </Button>
              <p className="text-sm text-gray-500 mt-3">
                Deze video wordt maar één keer getoond
              </p>
            </div>
          )}

          {/* Video Controls - Show when playing */}
          {hasStarted && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-4">
                <Button
                  onClick={isPlaying ? handlePause : handlePlay}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? 'Pauzeren' : 'Hervatten'}</span>
                </Button>
                <Button
                  onClick={toggleMute}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span>{isMuted ? 'Dempen uit' : 'Dempen'}</span>
                </Button>
              </div>
              <p className="text-sm text-gray-600">
                De video wordt automatisch afgesloten wanneer deze is afgelopen
              </p>
            </div>
          )}

          {/* Skip Option (for development/testing) */}
          {process.env.NODE_ENV === 'development' && !hasStarted && (
            <div className="text-center pt-4 border-t border-gray-200">
              <Button
                variant="ghost"
                onClick={onComplete}
                className="text-gray-500 hover:text-gray-700"
              >
                Overslaan (alleen voor development)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}