'use client';

/**
 * Iris Video Screen - Full-Screen Video Experience
 *
 * A beautiful full-screen wrapper for Iris coach videos.
 * Used for intro and outro videos in onboarding flows.
 */

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { IrisVideoPlayer, type VideoCaption } from './IrisVideoPlayer';

// =====================================================
// TYPES
// =====================================================

export interface IrisVideoScreenProps {
  /** Type of video screen */
  variant: 'intro' | 'outro';
  /** Video source URL (MP4) */
  videoSrc: string;
  /** WebM source for better compression */
  videoSrcWebm?: string;
  /** Poster image */
  poster?: string;
  /** Video captions */
  captions?: VideoCaption[];
  /** Called when video completes or is skipped */
  onContinue: () => void;
  /** User's name for personalization (outro) */
  userName?: string;
  /** Additional context for outro */
  outroContext?: {
    energyProfile?: string;
    attachmentStyle?: string;
    primaryFocus?: string;
  };
  /** Additional CSS classes */
  className?: string;
}

// =====================================================
// VIDEO CONFIGURATIONS
// =====================================================

const VIDEO_CONFIG = {
  intro: {
    title: 'Welkom bij de Dating Snapshot',
    subtitle: 'Leer Iris, je persoonlijke coach, kennen',
    skipText: 'Overslaan',
    skipDelay: 2000, // Show skip after 2 seconds
  },
  outro: {
    title: 'Gefeliciteerd!',
    subtitle: 'Je Dating Snapshot is compleet',
    skipText: 'Start programma',
    skipDelay: 0, // Always show skip on outro
  },
};

// =====================================================
// MAIN COMPONENT
// =====================================================

export function IrisVideoScreen({
  variant,
  videoSrc,
  videoSrcWebm,
  poster,
  captions,
  onContinue,
  userName,
  outroContext,
  className,
}: IrisVideoScreenProps) {
  const config = VIDEO_CONFIG[variant];

  // Personalize title for outro
  const title = variant === 'outro' && userName
    ? `Gefeliciteerd, ${userName}!`
    : config.title;

  return (
    <div
      className={cn(
        'min-h-[100dvh] flex flex-col items-center justify-start sm:justify-center',
        'bg-gradient-to-b from-coral-50/50 to-white',
        'overflow-y-auto overscroll-y-none', // Enable scrolling on mobile
        'py-4 px-4 safe-area-top safe-area-bottom',
        className
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl my-auto sm:my-0"
      >
        {/* Header text (above video) */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {title}
          </h1>
          <p className="text-gray-500">{config.subtitle}</p>
        </motion.div>

        {/* Video player */}
        <IrisVideoPlayer
          src={videoSrc}
          srcWebm={videoSrcWebm}
          poster={poster}
          captions={captions}
          onComplete={onContinue}
          onSkip={onContinue}
          autoPlay={true}
          showSkip={true}
          skipText={config.skipText}
          skipDelay={config.skipDelay}
        />

        {/* Outro context cards */}
        {variant === 'outro' && outroContext && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 grid grid-cols-3 gap-3"
          >
            {outroContext.energyProfile && (
              <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
                <div className="text-xs text-gray-500 mb-1">Energie</div>
                <div className="text-sm font-semibold text-gray-900 capitalize">
                  {outroContext.energyProfile}
                </div>
              </div>
            )}
            {outroContext.attachmentStyle && (
              <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
                <div className="text-xs text-gray-500 mb-1">Hechting</div>
                <div className="text-sm font-semibold text-gray-900 capitalize">
                  {outroContext.attachmentStyle}
                </div>
              </div>
            )}
            {outroContext.primaryFocus && (
              <div className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
                <div className="text-xs text-gray-500 mb-1">Focus</div>
                <div className="text-sm font-semibold text-gray-900 capitalize truncate">
                  {outroContext.primaryFocus}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Footer hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-xs text-gray-400 mt-6"
        >
          {variant === 'intro'
            ? 'Tip: Zet je geluid aan voor de beste ervaring'
            : 'Iris is klaar om je te begeleiden in je transformatie'}
        </motion.p>
      </motion.div>
    </div>
  );
}

export default IrisVideoScreen;
