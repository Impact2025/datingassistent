'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Tv, Lock, Flag, Play, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

function IrisVideoPlayer() {
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
    // Fade to CTA after video ends
    setTimeout(() => setShowCTA(true), 500);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  // Auto-set loaded state if video doesn't load within 3 seconds
  useEffect(() => {
    const loadTimer = setTimeout(() => {
      setIsLoaded(true);
    }, 3000);
    return () => clearTimeout(loadTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      {/* Video Container with elegant styling */}
      <motion.div
        className="relative rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-900 to-gray-800"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: isLoaded ? 1 : 0.3, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Decorative gradient border */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 rounded-3xl p-[3px] -z-10" />

        {/* Video wrapper with aspect ratio */}
        <div className="relative aspect-video bg-gray-900 rounded-3xl overflow-hidden">
          {/* Video element - replace src with actual video URL */}
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
            {/* Fallback for browsers that don't support video */}
            Je browser ondersteunt geen video.
          </video>

          {/* Loading state */}
          {!isLoaded && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-gray-900"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex flex-col items-center gap-3">
                <motion.div
                  className="w-12 h-12 border-4 border-pink-500/30 border-t-pink-500 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <p className="text-gray-400 text-sm">Video laden...</p>
              </div>
            </motion.div>
          )}

          {/* Play button overlay (before playing) */}
          <AnimatePresence>
            {!isPlaying && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer group"
                onClick={handlePlay}
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Animated play button */}
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Pulsing ring */}
                  <motion.div
                    className="absolute inset-0 bg-pink-500/30 rounded-full"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <div className="relative w-20 h-20 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-pink-500/50 transition-shadow">
                    <Play className="w-8 h-8 text-white ml-1" fill="white" />
                  </div>
                </motion.div>

                {/* "Bekijk de intro" text */}
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

          {/* Video controls (while playing) */}
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
                className="absolute inset-0 bg-gradient-to-t from-white via-white/95 to-white/80 dark:from-gray-900 dark:via-gray-900/95 dark:to-gray-900/80"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* CTA that appears after video or with delay */}
      <AnimatePresence>
        {showCTA && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="text-center px-4">
              <Link href="/quiz/dating-patroon">
                <Button className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-10 py-6 text-xl font-semibold shadow-xl hover:shadow-2xl hover:shadow-pink-500/25 transition-all rounded-full flex items-center justify-center gap-3">
                  Ontdek Je Dating Patroon
                  <ArrowRight className="w-6 h-6" />
                </Button>
              </Link>

              <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">
                2 minuten • 10 vragen • Direct resultaat
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative py-12 sm:py-16 lg:py-20 px-4 overflow-hidden bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

          {/* Left side - Pure Messaging */}
          <div className="text-center lg:text-left order-2 lg:order-1 space-y-8">

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-gray-900 dark:text-white leading-[0.95] mb-8">
                <span className="block mb-3">Daten is</span>
                <span className="block mb-3">geen geluk.</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-pink-600 to-purple-600 animate-gradient">
                  Het is een
                </span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-pink-600 to-purple-600 animate-gradient">
                  patroon.
                </span>
              </h1>
            </motion.div>

            {/* Subheadline */}
            <motion.p
              className="text-xl sm:text-2xl md:text-3xl text-gray-700 dark:text-gray-200 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              Ontdek in 2 minuten waarom je steeds op de verkeerde valt.
            </motion.p>

            {/* Supporting text */}
            <motion.p
              className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto lg:mx-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              Gratis quiz gebaseerd op attachment theory
            </motion.p>

            {/* Primary CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link href="/quiz/dating-patroon">
                <Button className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl hover:shadow-pink-500/25 transition-all rounded-full flex items-center justify-center gap-2">
                  Start de Gratis Quiz
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <p className="text-sm text-gray-500 dark:text-gray-400 self-center">
                2 min • 10 vragen • Direct resultaat
              </p>
            </motion.div>
          </div>

          {/* Right side - Iris Video */}
          <motion.div
            className="order-1 lg:order-2 flex justify-center lg:justify-end"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <IrisVideoPlayer />
          </motion.div>
        </div>

        {/* Social Proof Bar */}
        <motion.div
          className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Tv className="w-5 h-5 text-pink-500" />
              <span className="text-sm font-medium">10+ Jaar ervaring (Bekend van TV)</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Lock className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium">100% Privacy & Veilig</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Flag className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-medium">Nederlands product</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
