'use client';

/**
 * KickstartOnboardingFlow - World-class onboarding experience
 *
 * Premium, immersive flow that makes users feel excited about their journey.
 * Designed for maximum engagement and completion rates.
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ChevronRight,
  Volume2,
  VolumeX,
  CheckCircle,
  Rocket,
  Heart,
  Target,
  Zap,
  Star,
  ArrowRight,
  Play,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KickstartIntakeChat } from '@/components/kickstart/KickstartIntakeChat';
import type { KickstartIntakeData } from '@/types/kickstart-onboarding.types';
import { cn } from '@/lib/utils';
import Confetti from 'react-confetti';
import { IrisAvatar } from '@/components/onboarding/IrisAvatar';

interface KickstartOnboardingFlowProps {
  userName?: string;
  onComplete: (data: KickstartIntakeData) => void;
  className?: string;
}

type OnboardingStep = 'welcome' | 'chat' | 'processing' | 'success';

export function KickstartOnboardingFlow({
  userName,
  onComplete,
  className,
}: KickstartOnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [completedData, setCompletedData] = useState<KickstartIntakeData | null>(null);
  const [isMuted, setIsMuted] = useState(false); // Sound ON by default
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Get window size for confetti
  useEffect(() => {
    const updateSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleChatComplete = async (data: KickstartIntakeData) => {
    setCompletedData(data);
    setCurrentStep('processing');

    // Animated processing steps
    const steps = [0, 1, 2, 3];
    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setProcessingStep(i + 1);
    }

    await new Promise((resolve) => setTimeout(resolve, 400));

    setCurrentStep('success');
    setShowConfetti(true);

    // Stop confetti after 6 seconds
    setTimeout(() => setShowConfetti(false), 6000);
  };

  const handleStartProgram = () => {
    if (completedData) {
      onComplete(completedData);
    }
  };

  const handlePlayVideo = async () => {
    if (videoRef.current) {
      try {
        // First unmute, then play
        videoRef.current.muted = false;
        setIsMuted(false);
        await videoRef.current.play();
        setVideoPlaying(true);
      } catch (error) {
        // If autoplay with sound fails (browser policy), try muted first then unmute
        console.log('Autoplay with sound blocked, trying alternative...');
        videoRef.current.muted = true;
        setIsMuted(true);
        await videoRef.current.play();
        setVideoPlaying(true);
        // Unmute after a short delay
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.muted = false;
            setIsMuted(false);
          }
        }, 100);
      }
    }
  };

  // Processing steps content
  const processingSteps = [
    { icon: Target, text: 'Analyseren van je situatie...' },
    { icon: Sparkles, text: 'Personaliseren van content...' },
    { icon: Heart, text: 'Selecteren van coaching tips...' },
    { icon: Zap, text: 'Activeren van dag 1...' },
  ];

  return (
    <div className={cn('min-h-[100dvh] sm:min-h-[600px] flex items-center justify-center bg-gradient-to-b from-pink-50/50 to-white', className)}>
      {/* Confetti effect */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={300}
          colors={['#ec4899', '#f472b6', '#fb7185', '#fda4af', '#fecdd3']}
          gravity={0.3}
        />
      )}

      <AnimatePresence mode="wait">
        {/* STEP 1: Welcome Screen - Premium & Engaging */}
        {currentStep === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full max-w-lg mx-auto px-4 py-8 pt-16"
          >
            {/* Premium Card - overflow-visible for avatar to extend above */}
            <div className="bg-white rounded-3xl shadow-2xl shadow-pink-200/30 border border-pink-100/50 overflow-visible relative">
              {/* Video Section - rounded top, overflow visible for avatar */}
              <div className="relative bg-gradient-to-br from-pink-500 to-pink-600 rounded-t-3xl overflow-visible">
                <div className="aspect-video relative overflow-visible">
                  {/* Video - Always loaded, visibility controlled */}
                  <video
                    ref={videoRef}
                    src="/videos/onboarding/Welkom_onboarding.mp4"
                    playsInline
                    muted={isMuted}
                    controls={false}
                    preload="auto"
                    className={cn(
                      "absolute inset-0 w-full h-full object-cover transition-opacity duration-300 rounded-t-3xl",
                      videoPlaying ? "opacity-100 z-10" : "opacity-0 z-0"
                    )}
                    onEnded={() => setVideoPlaying(false)}
                    onError={(e) => console.error('Video error:', e)}
                  />

                  {/* Thumbnail Overlay - Hidden when playing */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br from-pink-500 to-pink-600 flex flex-col items-center justify-end text-white px-6 pb-6 pt-16 transition-opacity duration-300 rounded-t-3xl",
                    videoPlaying ? "opacity-0 pointer-events-none" : "opacity-100"
                  )}>
                    {/* Avatar positioned at top, overlapping the edge - 50% above pink area */}
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="absolute -top-12 left-1/2 -translate-x-1/2 z-20"
                    >
                      <IrisAvatar size="xl" showGlow className="ring-4 ring-white/30 shadow-xl" />
                    </motion.div>

                    <div className="text-center mt-8">
                      <motion.h2
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-2xl font-bold mb-2"
                      >
                        Welkom bij de Kickstart!
                      </motion.h2>
                      <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-pink-100 text-center mb-6"
                      >
                        Iris heeft een persoonlijk bericht voor je
                      </motion.p>
                      <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.6, type: 'spring', bounce: 0.5 }}
                        onClick={handlePlayVideo}
                        className="w-16 h-16 rounded-full bg-white text-pink-600 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                      >
                        <Play className="w-7 h-7 ml-1" fill="currentColor" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Mute/Unmute Button - Only when playing */}
                  {videoPlaying && (
                    <button
                      onClick={() => {
                        setIsMuted(!isMuted);
                        if (videoRef.current) {
                          videoRef.current.muted = !isMuted;
                        }
                      }}
                      className="absolute bottom-3 right-3 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all z-20"
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 sm:p-8">
                {/* What you'll get */}
                <div className="space-y-3 mb-8">
                  {[
                    { icon: Target, text: '21 dagen persoonlijke begeleiding' },
                    { icon: Sparkles, text: 'Tips op maat voor jouw situatie' },
                    { icon: Heart, text: 'Direct toepasbare acties' },
                  ].map((item, index) => (
                    <motion.div
                      key={item.text}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-4 h-4 text-pink-600" />
                      </div>
                      <span className="text-gray-700 font-medium">{item.text}</span>
                    </motion.div>
                  ))}
                </div>

                {/* CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  <Button
                    onClick={() => setCurrentStep('chat')}
                    className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white py-6 text-lg font-semibold rounded-2xl shadow-lg shadow-pink-200/50 hover:shadow-xl hover:shadow-pink-300/50 transition-all group"
                  >
                    Laten we beginnen
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>

                  {/* Time estimate */}
                  <p className="mt-4 text-center text-sm text-gray-400">
                    Duurt slechts 2-3 minuten
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Chat Onboarding - Immersive */}
        {currentStep === 'chat' && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-2xl mx-auto h-[100dvh] sm:h-auto sm:px-4 sm:py-6"
          >
            {/* Chat Container - Full screen mobile, card desktop */}
            <div className="bg-white sm:rounded-3xl sm:shadow-2xl sm:shadow-pink-200/20 overflow-hidden h-full sm:h-auto sm:border sm:border-pink-100/50">
              {/* Chat - Full height */}
              <div className="h-full sm:h-[min(calc(100vh-150px),700px)] sm:min-h-[550px]">
                <KickstartIntakeChat onComplete={handleChatComplete} />
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Processing - Animated Steps */}
        {currentStep === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md mx-auto px-4"
          >
            <div className="bg-white rounded-3xl shadow-2xl shadow-pink-200/30 border border-pink-100/50 p-8 text-center">
              {/* Animated Iris Avatar */}
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="mb-8"
              >
                <IrisAvatar size="xl" showGlow className="mx-auto ring-4 ring-pink-100" />
              </motion.div>

              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Iris analyseert je antwoorden
              </h2>
              <p className="text-gray-500 mb-8">
                Een moment geduld...
              </p>

              {/* Animated Progress Steps */}
              <div className="space-y-3">
                {processingSteps.map((step, index) => {
                  const isComplete = processingStep > index;
                  const isCurrent = processingStep === index + 1;

                  return (
                    <motion.div
                      key={step.text}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300',
                        isComplete && 'bg-green-50',
                        isCurrent && 'bg-pink-50',
                        !isComplete && !isCurrent && 'bg-gray-50'
                      )}
                    >
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300',
                        isComplete && 'bg-green-500 text-white',
                        isCurrent && 'bg-pink-500 text-white',
                        !isComplete && !isCurrent && 'bg-gray-200 text-gray-400'
                      )}>
                        {isComplete ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <step.icon className={cn('w-4 h-4', isCurrent && 'animate-pulse')} />
                        )}
                      </div>
                      <span className={cn(
                        'text-sm font-medium transition-colors duration-300',
                        isComplete && 'text-green-700',
                        isCurrent && 'text-pink-700',
                        !isComplete && !isCurrent && 'text-gray-400'
                      )}>
                        {step.text}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 4: Success - Celebration */}
        {currentStep === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-lg mx-auto px-4"
          >
            <div className="bg-white rounded-3xl shadow-2xl shadow-pink-200/30 border border-pink-100/50 p-8 text-center overflow-hidden relative">
              {/* Background decoration */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-pink-100 rounded-full opacity-50" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-pink-100 rounded-full opacity-50" />
              </div>

              <div className="relative">
                {/* Success Animation */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', bounce: 0.5, duration: 0.8 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200"
                >
                  <CheckCircle className="w-10 h-10 text-white" />
                </motion.div>

                {/* Personalized Message */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                    {completedData?.preferredName ? `${completedData.preferredName}, je bent klaar!` : 'Je bent klaar!'}
                  </h1>
                  <p className="text-gray-600 mb-8 text-lg">
                    Iris heeft je persoonlijke 21-dagen plan gemaakt
                  </p>
                </motion.div>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="grid grid-cols-3 gap-3 mb-8"
                >
                  {[
                    { value: '21', label: 'Dagen', icon: '📅' },
                    { value: '63+', label: 'Tips', icon: '💡' },
                    { value: '1', label: 'Coach', icon: '👩‍🏫' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-pink-50 rounded-2xl p-4">
                      <div className="text-2xl mb-1">{stat.icon}</div>
                      <div className="text-2xl font-bold text-pink-600">{stat.value}</div>
                      <div className="text-xs text-gray-500">{stat.label}</div>
                    </div>
                  ))}
                </motion.div>

                {/* CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <Button
                    onClick={handleStartProgram}
                    className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white py-6 text-lg font-semibold rounded-2xl shadow-lg shadow-pink-200/50 hover:shadow-xl transition-all group"
                  >
                    <Rocket className="w-5 h-5 mr-2 group-hover:-translate-y-1 transition-transform" />
                    Start je transformatie
                  </Button>

                  <p className="mt-4 text-sm text-gray-400">
                    Dag 1 staat klaar voor je
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
