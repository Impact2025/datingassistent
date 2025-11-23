"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { VideoPlayer } from '@/components/shared/video-player';

interface WelcomeVideoProps {
  onComplete: () => void;
}

export function WelcomeVideo({ onComplete }: WelcomeVideoProps) {
  const [hasStarted, setHasStarted] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  const handleVideoStart = () => {
    setHasStarted(true);
  };

  const handleVideoEnd = () => {
    onComplete();
  };

  const handleVideoError = (error: Error) => {
    setVideoError(error.message);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-3xl">👋</span>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Welkom bij DatingAssistent!
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Voordat we beginnen, wil ik je graag persoonlijk welkom heten.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Video Player */}
          <VideoPlayer
            src="/videos/Welkom-Iris.mp4"
            title="Welkomstvideo van Iris"
            className="aspect-video"
            controls={true}
            onEnded={handleVideoEnd}
            onError={handleVideoError}
            fallbackText="De welkomstvideo kon niet worden geladen. Probeer de pagina te vernieuwen."
          />

          {/* Play Button - Only show if video hasn't started yet */}
          {!hasStarted && !videoError && (
            <div className="text-center">
              <Button
                onClick={handleVideoStart}
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

          {/* Error message */}
          {videoError && (
            <div className="text-center">
              <p className="text-sm text-red-600 mb-4">
                Er is een probleem met de video. Probeer de pagina te vernieuwen of neem contact op met support.
              </p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="border-pink-300 text-pink-700 hover:bg-pink-50"
              >
                Pagina vernieuwen
              </Button>
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