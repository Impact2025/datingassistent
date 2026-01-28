'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PrimaryButton } from '@/components/ui/button-system';
import { CheckCircle, Play } from 'lucide-react';

interface VideoSectieProps {
  sectie: any;
  isCompleted: boolean;
  onComplete: () => void;
}

export function VideoSectie({ sectie, isCompleted, onComplete }: VideoSectieProps) {
  const content = sectie.inhoud || {};
  const [hasWatched, setHasWatched] = useState(false);

  const handleVideoEnd = () => {
    setHasWatched(true);
  };

  return (
    <Card className="shadow-lg border-coral-100 dark:border-gray-700 dark:bg-gray-800 hover:shadow-xl transition-shadow">
      <CardContent className="p-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-coral-500 to-coral-600 flex items-center justify-center">
              <Play className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{sectie.titel}</h3>
          </div>
          {isCompleted && <CheckCircle className="w-5 h-5 text-green-500" />}
        </div>

        {/* Intro text */}
        {content.introTekst && (
          <p className="text-gray-700 dark:text-gray-200 mb-6 leading-relaxed">{content.introTekst}</p>
        )}

        {/* Video player */}
        {content.videoUrl && (
          <div className="mb-6">
            <div className="relative rounded-lg overflow-hidden shadow-lg bg-black aspect-video">
              <video
                src={content.videoUrl}
                controls
                onEnded={handleVideoEnd}
                className="w-full h-full"
                controlsList="nodownload"
              >
                Je browser ondersteunt geen video playback.
              </video>
            </div>
          </div>
        )}

        {/* YouTube embed if available */}
        {content.youtubeId && (
          <div className="mb-6">
            <div className="relative rounded-lg overflow-hidden shadow-lg aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${content.youtubeId}`}
                title={sectie.titel}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        )}

        {/* Vimeo embed if available */}
        {content.vimeoId && (
          <div className="mb-6">
            <div className="relative rounded-lg overflow-hidden shadow-lg aspect-video">
              <iframe
                src={`https://player.vimeo.com/video/${content.vimeoId}`}
                title={sectie.titel}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        )}

        {/* Transcript or notes */}
        {content.transcript && (
          <details className="mb-6">
            <summary className="cursor-pointer text-coral-600 dark:text-coral-400 font-medium hover:text-coral-700 dark:hover:text-coral-300">
              Transcript
            </summary>
            <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{content.transcript}</p>
            </div>
          </details>
        )}

        {/* Key takeaways */}
        {content.takeaways && Array.isArray(content.takeaways) && (
          <div className="mb-6 p-4 bg-coral-50 dark:bg-coral-900/30 rounded-lg border-2 border-coral-200 dark:border-coral-700">
            <h4 className="font-semibold text-coral-900 dark:text-coral-300 mb-3">Belangrijkste punten:</h4>
            <ul className="space-y-2">
              {content.takeaways.map((takeaway: string, index: number) => (
                <li key={index} className="text-sm text-coral-800 dark:text-coral-200 flex items-start gap-2">
                  <span className="text-coral-500 dark:text-coral-400 mt-1">•</span>
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Complete button */}
        {!isCompleted && (
          <div className="flex flex-col items-center gap-3">
            {!hasWatched && !isCompleted && (
              <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                Bekijk de video om door te gaan
              </p>
            )}
            <PrimaryButton
              onClick={onComplete}
              className="bg-coral-500 hover:bg-coral-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {hasWatched ? 'Video bekeken!' : 'Markeer als bekeken'}
            </PrimaryButton>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
