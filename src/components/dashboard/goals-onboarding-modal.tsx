"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, X } from 'lucide-react';
import { VideoPlayer } from '@/components/shared/video-player';

interface GoalsOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GoalsOnboardingModal({ isOpen, onClose }: GoalsOnboardingModalProps) {
  const [hasWatched, setHasWatched] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  const handleClose = () => {
    // Mark as watched in localStorage
    localStorage.setItem('goals_onboarding_watched', 'true');
    setHasWatched(true);
    onClose();
  };

  const handleVideoEnd = () => {
    setHasWatched(true);
  };

  const handleVideoError = (error: Error) => {
    setVideoError(error.message);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Welkom bij je Doelen Dashboard</DialogTitle>
        </DialogHeader>
        <div className="relative bg-gradient-to-br from-blue-50 to-purple-50">
          {/* Header */}
          <div className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  🎯 Welkom bij je Doelen Dashboard!
                </h2>
                <p className="text-gray-600 mt-2">
                  Leer hoe je doelen stelt en je voortgang bijhoudt voor maximale dating success.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Video Section */}
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <VideoPlayer
                src="/videos/Doelen.mp4"
                poster="/images/goals-onboarding-poster.svg"
                title="Hoe werkt het Doelen Systeem?"
                className="aspect-video"
                controls={true}
                onEnded={handleVideoEnd}
                onError={handleVideoError}
                fallbackText="De uitleg video kon niet worden geladen. Probeer de pagina te vernieuwen."
              />

              {/* Video Description */}
              <div className="p-6 bg-gray-50">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Wat je gaat zien:
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Welkom in het doelen systeem</li>
                  <li>• Hoe doelen je dating success boosten</li>
                  <li>• Praktische voorbeelden en tips</li>
                  <li>• Snel starten met je eerste doelen</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 pt-0">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {hasWatched ? (
                  <span className="text-green-600 font-medium">
                    ✅ Video bekeken - je kunt nu aan de slag!
                  </span>
                ) : (
                  <span>Bekijk de video om door te gaan</span>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                >
                  {hasWatched ? 'Doelen Verkennen' : 'Overslaan'}
                </Button>

                {hasWatched && (
                  <Button
                    onClick={handleClose}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Start met Doelen Stellen
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}