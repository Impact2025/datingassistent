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
    // Confetti disabled for minimal/professional look
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
    <div className={cn(
      // Full viewport on mobile for chat, centered for other steps
      currentStep === 'chat'
        ? 'h-[100dvh] w-full'
        : 'min-h-[100dvh] sm:min-h-[600px] flex items-center justify-center',
      'bg-gradient-to-b from-coral-50/50 to-white',
      className
    )}>
      {/* Confetti effect */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={300}
          colors={['#ff6b6b', '#ff8787', '#ff9999', '#ffabab', '#ffbdbd']}
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
            <div className="bg-white rounded-3xl shadow-2xl shadow-coral-200/30 border border-coral-100/50 overflow-visible relative">
              {/* Video Section - rounded top, overflow visible for avatar */}
              <div className="relative bg-gradient-to-br from-coral-500 to-coral-600 rounded-t-3xl overflow-visible">
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
                    "absolute inset-0 bg-gradient-to-b from-coral-500 via-coral-500 to-coral-600 flex flex-col items-center justify-between text-white transition-opacity duration-300 rounded-t-3xl overflow-visible",
                    videoPlaying ? "opacity-0 pointer-events-none" : "opacity-100"
                  )}>
                    {/* Top section: Avatar positioned outside container */}
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="absolute -top-10 left-1/2 -translate-x-1/2 z-20"
                    >
                      <IrisAvatar size="xl" showGlow className="ring-4 ring-white shadow-2xl" />
                    </motion.div>

                    {/* Center content with proper spacing from avatar */}
                    <div className="flex-1 flex flex-col items-center justify-center pt-16 pb-4 px-6">
                      {/* Play button - prominent and centered */}
                      <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.4, type: 'spring', bounce: 0.5 }}
                        onClick={handlePlayVideo}
                        className="w-20 h-20 rounded-full bg-white text-coral-500 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform mb-6"
                      >
                        <Play className="w-9 h-9 ml-1" fill="currentColor" />
                      </motion.button>
                    </div>

                    {/* Bottom text section with dark overlay for readability */}
                    <div className="w-full bg-gradient-to-t from-black/40 via-black/20 to-transparent px-6 pb-6 pt-8">
                      <motion.h2
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-2xl font-bold mb-2 text-center drop-shadow-lg"
                      >
                        Welkom bij de Kickstart!
                      </motion.h2>
                      <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-white/90 text-center text-sm drop-shadow-md"
                      >
                        Iris heeft een persoonlijk bericht voor je
                      </motion.p>
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
                      <div className="w-8 h-8 rounded-full bg-coral-100 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-4 h-4 text-coral-600" />
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
                    className="w-full bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 text-white py-6 text-lg font-semibold rounded-2xl shadow-lg shadow-coral-200/50 hover:shadow-xl hover:shadow-coral-300/50 transition-all group"
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

        {/* STEP 2: Chat Onboarding - FULL SCREEN MOBILE */}
        {currentStep === 'chat' && (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full sm:max-w-2xl sm:mx-auto sm:h-auto sm:px-4 sm:py-6 sm:flex sm:items-center"
          >
            {/* Chat Container - FULL SCREEN mobile, card desktop */}
            <div className="bg-white h-full w-full sm:h-auto sm:rounded-3xl sm:shadow-2xl sm:shadow-coral-200/20 sm:border sm:border-coral-100/50 sm:overflow-hidden">
              {/* Chat - FULL HEIGHT on mobile */}
              <div className="h-full sm:h-[min(calc(100vh-150px),700px)] sm:min-h-[550px]">
                <KickstartIntakeChat onComplete={handleChatComplete} className="h-full" />
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
            <div className="bg-white rounded-3xl shadow-2xl shadow-coral-200/30 border border-coral-100/50 p-8 text-center">
              {/* Animated Iris Avatar */}
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="mb-8"
              >
                <IrisAvatar size="xl" showGlow className="mx-auto ring-4 ring-coral-100" />
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
                        isCurrent && 'bg-coral-50',
                        !isComplete && !isCurrent && 'bg-gray-50'
                      )}
                    >
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300',
                        isComplete && 'bg-green-500 text-white',
                        isCurrent && 'bg-coral-500 text-white',
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
                        isCurrent && 'text-coral-700',
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

        {/* STEP 4: Success - Minimal & Professional */}
        {currentStep === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md mx-auto px-6"
          >
            <div className="text-center py-12">
              {/* Minimal checkmark */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-8"
              >
                <CheckCircle className="w-8 h-8 text-white" strokeWidth={2.5} />
              </motion.div>

              {/* Clean typography */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <h1 className="text-2xl font-semibold text-gray-900 mb-2 tracking-tight">
                  {completedData?.preferredName ? `${completedData.preferredName}, je bent klaar` : 'Je bent klaar'}
                </h1>
                <p className="text-gray-500 mb-10">
                  Je persoonlijke 21-dagen programma is gereed
                </p>
              </motion.div>

              {/* Minimal stats row */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="flex justify-center gap-12 mb-12"
              >
                <div className="text-center">
                  <div className="text-3xl font-semibold text-gray-900">21</div>
                  <div className="text-sm text-gray-400 mt-1">dagen</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-semibold text-gray-900">63+</div>
                  <div className="text-sm text-gray-400 mt-1">tips</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-semibold text-gray-900">1</div>
                  <div className="text-sm text-gray-400 mt-1">coach</div>
                </div>
              </motion.div>

              {/* Clean CTA */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <Button
                  onClick={handleStartProgram}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white py-5 text-base font-medium rounded-xl transition-colors"
                >
                  Start dag 1
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
