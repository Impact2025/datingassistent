'use client';

/**
 * KickstartOnboardingFlow - Clean, minimalist onboarding experience
 *
 * Design inspired by the logout success page - clean cards, subtle tags,
 * plenty of whitespace, and clear call-to-actions.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  MessageCircle,
  ChevronRight,
  CheckCircle,
  Loader2,
  Rocket,
  Heart,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KickstartIntakeChat } from '@/components/kickstart/KickstartIntakeChat';
import type { KickstartIntakeData } from '@/types/kickstart-onboarding.types';
import { cn } from '@/lib/utils';
import Confetti from 'react-confetti';

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

    // Simulate processing time for dramatic effect
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setCurrentStep('success');
    setShowConfetti(true);

    // Stop confetti after 5 seconds
    setTimeout(() => setShowConfetti(false), 5000);
  };

  const handleStartProgram = () => {
    if (completedData) {
      onComplete(completedData);
    }
  };

  // Simple tags for welcome screen (like logout page)
  const tags = [
    { icon: Heart, label: '21 Dagen' },
    { icon: MessageCircle, label: 'Persoonlijke coaching' },
    { icon: TrendingUp, label: 'Op maat gemaakt' },
  ];

  return (
    <div className={cn('min-h-[600px] flex items-center justify-center', className)}>
      {/* Confetti effect */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={200}
          colors={['#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b']}
        />
      )}

      <AnimatePresence mode="wait">
        {/* STEP 1: Welcome Screen - Clean & Minimal */}
        {currentStep === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-lg mx-auto px-4"
          >
            {/* Clean Card */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 text-center">
              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                Welkom bij Kickstart{userName ? `, ${userName}` : ''}!
              </h1>

              {/* Subtitle */}
              <p className="text-gray-600 mb-6">
                Laat Iris je even leren kennen zodat we je de beste coaching kunnen geven.
              </p>

              {/* Simple Tags Row */}
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {tags.map((tag) => (
                  <div
                    key={tag.label}
                    className="inline-flex items-center gap-1.5 bg-pink-50 text-pink-700 px-3 py-1.5 rounded-full text-sm border border-pink-100"
                  >
                    <tag.icon className="w-3.5 h-3.5" />
                    <span>{tag.label}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Button
                onClick={() => setCurrentStep('chat')}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-6 text-base rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                Start intake gesprek
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>

              {/* Time estimate */}
              <p className="mt-4 text-sm text-gray-400">
                Dit duurt slechts 3-4 minuten
              </p>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Chat Onboarding */}
        {currentStep === 'chat' && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-2xl mx-auto px-4"
          >
            {/* Chat Container - Clean Card */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
              {/* Simple header */}
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 text-center">
                  Intake gesprek met Iris
                </h2>
              </div>

              {/* Chat */}
              <div className="h-[calc(100vh-280px)] min-h-[450px] max-h-[600px]">
                <KickstartIntakeChat onComplete={handleChatComplete} />
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Processing - Clean & Simple */}
        {currentStep === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg mx-auto px-4"
          >
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 text-center">
              {/* Animated Icon */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center mx-auto mb-6"
              >
                <Sparkles className="w-8 h-8 text-pink-600" />
              </motion.div>

              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Iris maakt je plan...
              </h2>
              <p className="text-gray-600 mb-6">
                We stemmen de komende 21 dagen af op jouw situatie
              </p>

              <div className="flex items-center justify-center gap-2 text-pink-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Even geduld</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 4: Success - Clean Card Design */}
        {currentStep === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-lg mx-auto px-4"
          >
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 text-center">
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle className="w-8 h-8 text-green-600" />
              </motion.div>

              {/* Title */}
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Je bent klaar!
              </h1>

              {/* Subtitle */}
              <p className="text-gray-600 mb-6">
                Je persoonlijke 21-dagen programma staat klaar. Iris weet nu precies hoe ze je kan helpen!
              </p>

              {/* What's Next Tags */}
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm border border-green-100">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Plan gemaakt</span>
                </div>
                <div className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full text-sm border border-purple-100">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Dag 1 klaar</span>
                </div>
                <div className="inline-flex items-center gap-1.5 bg-pink-50 text-pink-700 px-3 py-1.5 rounded-full text-sm border border-pink-100">
                  <Heart className="w-3.5 h-3.5" />
                  <span>Iris wacht op je</span>
                </div>
              </div>

              {/* CTA Button */}
              <Button
                onClick={handleStartProgram}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-6 text-base rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                Start met Dag 1
                <Rocket className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
