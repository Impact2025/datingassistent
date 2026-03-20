'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

interface IrisVideoPlayerProps {
  ctaHref?: string;
  ctaText?: string;
}

export function IrisVideoPlayer({
  ctaHref = '/quiz/dating-patroon',
  ctaText = 'Ontdek Je Dating Patroon',
}: IrisVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showCTA, setShowCTA] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      setIsMuted(false);
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleVideoEnd = () => {
    setVideoEnded(true);
    setTimeout(() => setShowCTA(true), 500);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    const loadTimer = setTimeout(() => setIsLoaded(true), 3000);
    return () => clearTimeout(loadTimer);
  }, []);

  return (
    <div className="relative w-full">
      <motion.div
        className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-900 to-gray-800"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: isLoaded ? 1 : 0.3, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {/* Decorative gradient border */}
        <div className="absolute inset-0 bg-gradient-to-r from-coral-500 via-deep-purple to-coral-500 rounded-3xl p-[3px] -z-10" />

        <div className="relative aspect-video bg-gray-900 rounded-3xl overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            poster="/images/iris-video-poster.jpg"
            muted={isMuted}
            playsInline
            onLoadedData={() => setIsLoaded(true)}
            onEnded={handleVideoEnd}
            onPlay={() => setIsPlaying(true)}
          >
            <source src="/videos/iris-intro.mp4" type="video/mp4" />
            Je browser ondersteunt geen video.
          </video>

          {/* Loading state */}
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="flex flex-col items-center gap-3">
                <motion.div
                  className="w-12 h-12 border-4 border-coral-500/30 border-t-coral-500 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                <p className="text-gray-400 text-sm">Video laden...</p>
              </div>
            </div>
          )}

          {/* Play button overlay */}
          <AnimatePresence>
            {!isPlaying && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer group"
                onClick={handlePlay}
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div className="relative" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <motion.div
                    className="absolute inset-0 bg-coral-500/30 rounded-full"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <div className="relative w-20 h-20 bg-gradient-to-r from-coral-500 to-coral-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-coral-500/50 transition-shadow">
                    <Play className="w-8 h-8 text-white ml-1" fill="white" />
                  </div>
                </motion.div>

                <motion.p
                  className="absolute bottom-8 text-white text-xl font-semibold drop-shadow-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  Bekijk hoe Iris je helpt
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mute toggle */}
          {isPlaying && !videoEnded && (
            <motion.div
              className="absolute bottom-4 right-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <button
                onClick={toggleMute}
                className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-white" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white" />
                )}
              </button>
            </motion.div>
          )}

          {/* Fade overlay when video ends */}
          <AnimatePresence>
            {videoEnded && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-white via-white/95 to-white/80"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* CTA after video ends */}
      <AnimatePresence>
        {showCTA && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="text-center px-4">
              <Link href={ctaHref}>
                <Button className="bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 text-white px-10 py-6 text-xl font-semibold shadow-xl rounded-full flex items-center justify-center gap-3">
                  {ctaText}
                  <ArrowRight className="w-6 h-6" />
                </Button>
              </Link>
              <p className="mt-4 text-gray-600 text-sm">
                5 min • Vertrouwelijk • Direct persoonlijk advies
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default IrisVideoPlayer;
