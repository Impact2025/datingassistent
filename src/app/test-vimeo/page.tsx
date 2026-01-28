'use client';

/**
 * Vimeo Player Test Page
 * Sprint 4: Integration & UX Enhancement
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VimeoPlayer } from '@/components/video/vimeo-player';

export default function TestVimeoPage() {
  const [videoUrl, setVideoUrl] = useState('https://vimeo.com/76979871'); // Sample Vimeo video
  const [currentUrl, setCurrentUrl] = useState('https://vimeo.com/76979871');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 20));
  };

  const handleProgress = (seconds: number) => {
    addLog(`Progress: ${Math.floor(seconds)}s`);
  };

  const handleEnded = () => {
    addLog('Video ended!');
  };

  const handleReady = () => {
    addLog('Video ready to play');
  };

  const handleLoadVideo = () => {
    setCurrentUrl(videoUrl);
    setLogs([]);
    addLog(`Loading video: ${videoUrl}`);
  };

  const sampleVideos = [
    {
      title: 'Sample Vimeo Video 1',
      url: 'https://vimeo.com/76979871',
      description: 'Short demo video'
    },
    {
      title: 'Sample Vimeo Video 2',
      url: 'https://vimeo.com/148751763',
      description: 'Another test video'
    },
    {
      title: 'Custom URL',
      url: videoUrl,
      description: 'Enter your own Vimeo URL above'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-coral-50 via-purple-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">🎥 Vimeo Player Test</CardTitle>
            <p className="text-gray-600">
              Test de Vimeo player integratie met verschillende video URLs
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* URL Input */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Video URL</h3>
              <div className="flex gap-3">
                <Input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Enter Vimeo URL (e.g., https://vimeo.com/76979871)"
                  className="flex-1"
                />
                <Button onClick={handleLoadVideo} variant="default">
                  Laad Video
                </Button>
              </div>
            </div>

            {/* Sample Videos */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Sample Videos</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {sampleVideos.map((video, index) => (
                  <Button
                    key={index}
                    onClick={() => {
                      if (video.url !== videoUrl) {
                        setVideoUrl(video.url);
                        setCurrentUrl(video.url);
                        setLogs([]);
                        addLog(`Loading: ${video.title}`);
                      } else {
                        handleLoadVideo();
                      }
                    }}
                    variant="outline"
                    className="h-auto flex-col items-start p-4"
                  >
                    <div className="font-semibold text-left">{video.title}</div>
                    <div className="text-xs text-gray-600 text-left">{video.description}</div>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Video Player */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Video Player</CardTitle>
          </CardHeader>
          <CardContent>
            <VimeoPlayer
              videoUrl={currentUrl}
              autoplay={false}
              onProgress={handleProgress}
              onEnded={handleEnded}
              onReady={handleReady}
              initialTime={0}
            />
          </CardContent>
        </Card>

        {/* Event Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Event Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-500 text-sm">No events yet...</p>
              ) : (
                <div className="space-y-1">
                  {logs.map((log, index) => (
                    <div key={index} className="text-green-400 text-sm font-mono">
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>💡 Features:</strong>
          </p>
          <ul className="text-sm text-blue-900 mt-2 space-y-1 list-disc list-inside">
            <li>Automatische Vimeo video detectie</li>
            <li>Custom controls (play/pause, mute, fullscreen)</li>
            <li>Progress tracking (elke 5 seconden)</li>
            <li>Resume vanaf laatst bekeken positie</li>
            <li>Responsive design</li>
            <li>Event callbacks (onProgress, onEnded, onReady)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
