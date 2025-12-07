'use client';

/**
 * Lead Registration Wizard - "Hooked Model" Conversion Flow
 *
 * A 5-step onboarding wizard that transforms registration into a
 * psychological conversion machine:
 *
 * 1. Account Creation (minimal friction)
 * 2. Mini-Intake (3 segmentation questions)
 * 3. Photo Upload + AI Scan
 * 4. Score Reveal + OTO (One-Time-Offer)
 * 5. Dashboard redirect
 *
 * Design inspired by KickstartOnboardingFlow
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Confetti from 'react-confetti';
import { cn } from '@/lib/utils';

import { LeadAccountStep } from './lead-account-step';
import { LeadIntakeQuestions } from '@/components/onboarding/lead-intake-questions';
import { PhotoScanWizard } from '@/components/onboarding/photo-scan-wizard';
import { PhotoScoreReveal } from '@/components/onboarding/photo-score-reveal';
import { KickstartOTOModal } from '@/components/onboarding/kickstart-oto-modal';

import type {
  LeadWizardStep,
  LeadWizardState,
  LeadAccountData,
  LeadIntakeData,
  PhotoAnalysisResult,
  INITIAL_WIZARD_STATE,
} from '@/types/lead-activation.types';

interface LeadRegistrationWizardProps {
  className?: string;
  onComplete?: (userId: number, otoAccepted: boolean) => void;
}

export function LeadRegistrationWizard({
  className,
  onComplete,
}: LeadRegistrationWizardProps) {
  const router = useRouter();
  const [state, setState] = useState<LeadWizardState>({
    currentStep: 'account',
    accountData: null,
    intakeData: null,
    photoResult: null,
    userId: null,
    otoAccepted: null,
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

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

  // Step handlers
  const handleAccountComplete = (data: LeadAccountData, userId: number) => {
    setState((prev) => ({
      ...prev,
      accountData: data,
      userId,
      currentStep: 'intake',
    }));
  };

  const handleIntakeComplete = async (data: LeadIntakeData) => {
    setState((prev) => ({
      ...prev,
      intakeData: data,
      currentStep: 'photo-upload',
    }));

    // Save intake data to database
    if (state.userId) {
      try {
        await fetch('/api/user/lead-intake', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: state.userId,
            intakeData: data,
          }),
        });
      } catch (error) {
        console.error('Failed to save intake data:', error);
      }
    }
  };

  const handleScanStart = () => {
    setState((prev) => ({
      ...prev,
      currentStep: 'scanning',
    }));
  };

  const handleScanComplete = async (result: PhotoAnalysisResult) => {
    setState((prev) => ({
      ...prev,
      photoResult: result,
      currentStep: 'score-reveal',
    }));

    // Save initial photo score to database
    if (state.userId) {
      try {
        await fetch('/api/user/initial-photo-score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: state.userId,
            score: result.overall_score,
          }),
        });
      } catch (error) {
        console.error('Failed to save photo score:', error);
      }
    }
  };

  const handleShowOTO = () => {
    setState((prev) => ({
      ...prev,
      currentStep: 'oto',
    }));
  };

  const handleOTOAccept = async () => {
    setState((prev) => ({
      ...prev,
      otoAccepted: true,
      currentStep: 'complete',
    }));

    // Show confetti for conversion!
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);

    // Mark onboarding as completed with OTO accepted (CONVERSION!) and notify admin
    if (state.userId) {
      try {
        await fetch('/api/user/complete-lead-onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: state.userId,
            otoShown: true,
            otoAccepted: true,
            photoScore: state.photoResult?.overall_score,
            intakeData: state.intakeData ? {
              lookingFor: state.intakeData.lookingFor,
              datingStatus: state.intakeData.datingStatus,
              mainObstacle: state.intakeData.mainObstacle,
            } : null,
          }),
        });
      } catch (error) {
        console.error('Failed to complete onboarding:', error);
      }
    }

    // Redirect to checkout with discount
    setTimeout(() => {
      router.push(`/checkout/kickstart-programma?userId=${state.userId}&discount=true`);
    }, 1500);

    onComplete?.(state.userId!, true);
  };

  const handleOTODecline = async () => {
    setState((prev) => ({
      ...prev,
      otoAccepted: false,
      currentStep: 'complete',
    }));

    // Mark onboarding as completed and notify admin
    if (state.userId) {
      try {
        await fetch('/api/user/complete-lead-onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: state.userId,
            otoShown: true,
            otoAccepted: false,
            photoScore: state.photoResult?.overall_score,
            intakeData: state.intakeData ? {
              lookingFor: state.intakeData.lookingFor,
              datingStatus: state.intakeData.datingStatus,
              mainObstacle: state.intakeData.mainObstacle,
            } : null,
          }),
        });
      } catch (error) {
        console.error('Failed to complete onboarding:', error);
      }
    }

    // Redirect to dashboard
    setTimeout(() => {
      router.push('/dashboard');
    }, 500);

    onComplete?.(state.userId!, false);
  };

  // Step indicator configuration
  const steps = [
    { key: 'account', label: 'Account' },
    { key: 'intake', label: 'Vragen' },
    { key: 'photo-upload', label: 'Foto' },
    { key: 'score-reveal', label: 'Score' },
  ];

  const currentStepIndex = steps.findIndex(
    (s) =>
      s.key === state.currentStep ||
      (state.currentStep === 'scanning' && s.key === 'photo-upload') ||
      (state.currentStep === 'oto' && s.key === 'score-reveal')
  );

  return (
    <div className={cn('min-h-[600px] flex flex-col', className)}>
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

      {/* Step Indicator - Only show for first 4 steps */}
      {state.currentStep !== 'complete' && state.currentStep !== 'oto' && (
        <div className="w-full max-w-lg mx-auto px-4 pt-6 pb-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.key} className="flex items-center">
                {/* Step Circle */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors',
                    index < currentStepIndex && 'bg-pink-500 text-white',
                    index === currentStepIndex &&
                      'bg-pink-500 text-white ring-4 ring-pink-200',
                    index > currentStepIndex && 'bg-gray-200 text-gray-500'
                  )}
                >
                  {index < currentStepIndex ? (
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </motion.div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 mx-2 h-0.5 bg-gray-200 relative min-w-[40px]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: index < currentStepIndex ? '100%' : '0%',
                      }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="absolute inset-y-0 left-0 bg-pink-500"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Step Labels */}
          <div className="flex justify-between mt-2">
            {steps.map((step, index) => (
              <span
                key={step.key}
                className={cn(
                  'text-xs font-medium text-center',
                  index <= currentStepIndex ? 'text-pink-600' : 'text-gray-400'
                )}
                style={{ width: `${100 / steps.length}%` }}
              >
                {step.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        <AnimatePresence mode="wait">
          {/* Step 1: Account Creation */}
          {state.currentStep === 'account' && (
            <motion.div
              key="account"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-lg"
            >
              <LeadAccountStep onComplete={handleAccountComplete} />
            </motion.div>
          )}

          {/* Step 2: Mini-Intake Questions */}
          {state.currentStep === 'intake' && (
            <motion.div
              key="intake"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full max-w-lg"
            >
              <LeadIntakeQuestions
                onComplete={handleIntakeComplete}
                userName={state.accountData?.firstName}
              />
            </motion.div>
          )}

          {/* Step 3: Photo Upload */}
          {state.currentStep === 'photo-upload' && (
            <motion.div
              key="photo-upload"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full max-w-lg"
            >
              <PhotoScanWizard
                userId={state.userId!}
                onScanStart={handleScanStart}
                onScanComplete={handleScanComplete}
                isScanning={false}
              />
            </motion.div>
          )}

          {/* Step 3b: Scanning Animation */}
          {state.currentStep === 'scanning' && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg"
            >
              <PhotoScanWizard
                userId={state.userId!}
                onScanStart={handleScanStart}
                onScanComplete={handleScanComplete}
                isScanning={true}
              />
            </motion.div>
          )}

          {/* Step 4: Score Reveal */}
          {state.currentStep === 'score-reveal' && state.photoResult && (
            <motion.div
              key="score-reveal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-lg"
            >
              <PhotoScoreReveal
                result={state.photoResult}
                onContinue={handleShowOTO}
              />
            </motion.div>
          )}

          {/* Step 5: OTO Modal */}
          {state.currentStep === 'oto' && state.photoResult && (
            <motion.div
              key="oto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-lg"
            >
              <KickstartOTOModal
                score={state.photoResult.overall_score}
                userId={state.userId!}
                onAccept={handleOTOAccept}
                onDecline={handleOTODecline}
              />
            </motion.div>
          )}

          {/* Complete State */}
          {state.currentStep === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-lg"
            >
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', bounce: 0.5 }}
                  className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto mb-6"
                >
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </motion.div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {state.otoAccepted
                    ? 'Geweldig! Je start met Kickstart'
                    : 'Account aangemaakt!'}
                </h1>

                <p className="text-gray-600 mb-6">
                  {state.otoAccepted
                    ? 'Je wordt doorgestuurd naar de betaalpagina...'
                    : 'Je wordt doorgestuurd naar je dashboard...'}
                </p>

                <div className="flex items-center justify-center gap-2 text-pink-600">
                  <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Even geduld</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
