'use client';

/**
 * TransformatieOnboardingFlow - World-class onboarding experience
 *
 * Minimalist, pink (no gradients), professional
 * Matches Kickstart quality level
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  CheckCircle,
  Target,
  Heart,
  Zap,
  ArrowRight,
  Play,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TransformatieIntakeChat, TransformatieIntakeData } from './TransformatieIntakeChat';
import { IrisAvatar } from '@/components/onboarding/IrisAvatar';
import { cn } from '@/lib/utils';

interface TransformatieOnboardingFlowProps {
  userName?: string;
  onComplete: (data: TransformatieIntakeData) => void;
  className?: string;
}

type OnboardingStep = 'welcome' | 'chat' | 'processing' | 'success';

export function TransformatieOnboardingFlow({
  userName,
  onComplete,
  className,
}: TransformatieOnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [completedData, setCompletedData] = useState<TransformatieIntakeData | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleChatComplete = async (data: TransformatieIntakeData) => {
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
  };

  const handleStartProgram = () => {
    if (completedData) {
      onComplete(completedData);
    }
  };

  const handlePlayVideo = async () => {
    if (videoRef.current) {
      try {
        videoRef.current.muted = false;
        setIsMuted(false);
        await videoRef.current.play();
        setVideoPlaying(true);
      } catch {
        // Fallback for autoplay restrictions
        videoRef.current.muted = true;
        setIsMuted(true);
        await videoRef.current.play();
        setVideoPlaying(true);
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
    { icon: Sparkles, text: 'Personaliseren van 12 modules...' },
    { icon: Heart, text: 'Selecteren van AI tools...' },
    { icon: Zap, text: 'Activeren van DESIGN fase...' },
  ];

  return (
    <div className={cn(
      currentStep === 'chat'
        ? 'h-[100dvh] w-full'
        : 'min-h-[100dvh] sm:min-h-[600px] flex items-center justify-center',
      'bg-white',
      className
    )}>
      <AnimatePresence mode="wait">
        {/* STEP 1: Welcome Screen - Minimalist & Professional */}
        {currentStep === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full max-w-lg mx-auto px-4 py-8 pt-16"
          >
            {/* Card */}
            <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-visible relative">
              {/* Video Section */}
              <div className="relative bg-pink-500 rounded-t-3xl overflow-visible">
                <div className="aspect-video relative overflow-visible">
                  {/* Video */}
                  <video
                    ref={videoRef}
                    src="/videos/onboarding/Welkom_transformatie.mp4"
                    playsInline
                    muted={isMuted}
                    controls={false}
                    preload="auto"
                    className={cn(
                      "absolute inset-0 w-full h-full object-cover transition-opacity duration-300 rounded-t-3xl",
                      videoPlaying ? "opacity-100 z-10" : "opacity-0 z-0"
                    )}
                    onEnded={() => setVideoPlaying(false)}
                  />

                  {/* Thumbnail Overlay */}
                  <div className={cn(
                    "absolute inset-0 bg-pink-500 flex flex-col items-center justify-end text-white px-6 pb-6 pt-16 transition-opacity duration-300 rounded-t-3xl",
                    videoPlaying ? "opacity-0 pointer-events-none" : "opacity-100"
                  )}>
                    {/* Avatar */}
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
                        Welkom bij De Transformatie
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
                        className="w-16 h-16 rounded-full bg-white text-pink-500 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                      >
                        <Play className="w-7 h-7 ml-1" fill="currentColor" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Mute Button */}
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

              {/* Content */}
              <div className="p-6 sm:p-8">
                {/* What you'll get */}
                <div className="space-y-3 mb-8">
                  {[
                    { icon: Target, text: '12 modules persoonlijke transformatie' },
                    { icon: Sparkles, text: '4 exclusieve AI tools' },
                    { icon: Heart, text: 'DESIGN → ACTION → SURRENDER' },
                  ].map((item, index) => (
                    <motion.div
                      key={item.text}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-4 h-4 text-pink-500" />
                      </div>
                      <span className="text-gray-700 font-medium">{item.text}</span>
                    </motion.div>
                  ))}
                </div>

                {/* CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  <Button
                    onClick={() => setCurrentStep('chat')}
                    className="w-full bg-pink-500 hover:bg-pink-600 text-white py-6 text-lg font-semibold rounded-2xl shadow-lg shadow-pink-200/50 hover:shadow-xl transition-all group"
                  >
                    Laten we beginnen
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>

                  <p className="mt-4 text-center text-sm text-gray-400">
                    Duurt slechts 2-3 minuten
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Chat */}
        {currentStep === 'chat' && (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full sm:max-w-2xl sm:mx-auto sm:h-auto sm:px-4 sm:py-6 sm:flex sm:items-center"
          >
            <div className="bg-white h-full w-full sm:h-auto sm:rounded-3xl sm:shadow-2xl sm:border sm:border-gray-100 sm:overflow-hidden">
              <div className="h-full sm:h-[min(calc(100vh-150px),700px)] sm:min-h-[550px]">
                <TransformatieIntakeChat onComplete={handleChatComplete} className="h-full" />
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Processing */}
        {currentStep === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md mx-auto px-4"
          >
            <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/50 border border-gray-100 p-8 text-center">
              {/* Animated Avatar */}
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
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

              {/* Progress Steps */}
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
                        isComplete && 'bg-emerald-50',
                        isCurrent && 'bg-pink-50',
                        !isComplete && !isCurrent && 'bg-gray-50'
                      )}
                    >
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300',
                        isComplete && 'bg-emerald-500 text-white',
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
                        isComplete && 'text-emerald-700',
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
              {/* Checkmark */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-8"
              >
                <CheckCircle className="w-8 h-8 text-white" strokeWidth={2.5} />
              </motion.div>

              {/* Text */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <h1 className="text-2xl font-semibold text-gray-900 mb-2 tracking-tight">
                  {completedData?.preferredName ? `${completedData.preferredName}, je bent klaar` : 'Je bent klaar'}
                </h1>
                <p className="text-gray-500 mb-10">
                  Je persoonlijke transformatie is geconfigureerd
                </p>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="flex justify-center gap-12 mb-12"
              >
                <div className="text-center">
                  <div className="text-3xl font-semibold text-gray-900">12</div>
                  <div className="text-sm text-gray-400 mt-1">modules</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-semibold text-gray-900">4</div>
                  <div className="text-sm text-gray-400 mt-1">AI tools</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-semibold text-gray-900">3</div>
                  <div className="text-sm text-gray-400 mt-1">fases</div>
                </div>
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <Button
                  onClick={handleStartProgram}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white py-5 text-base font-medium rounded-xl transition-colors"
                >
                  Start module 1
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
