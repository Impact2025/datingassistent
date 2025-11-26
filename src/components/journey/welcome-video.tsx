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
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
      setHasStarted(true);
    }
  };

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
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
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-2xl">👋</span>
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">
            Welkom bij DatingAssistent!
          </CardTitle>
          <p className="text-gray-600 mt-2 text-sm">
            Voordat we beginnen, wil ik je graag persoonlijk welkom heten.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Video Player */}
          <div className="relative aspect-[16/9] bg-black rounded-xl overflow-hidden shadow-inner max-h-[300px]">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              onEnded={handleVideoEnd}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              muted={isMuted}
              playsInline
            >
              <source src="/videos/Welkom-dashboard.mp4" type="video/mp4" />
              <source src="/videos/Welkom-dashboard.mp4" type="video/webm" />
              Uw browser ondersteunt deze video niet.
            </video>

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
                size="lg"
                className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all"
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