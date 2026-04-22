'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, Play, MessageCircle, ArrowRight } from 'lucide-react';
import { useUser } from '@/providers/user-provider';
import { useTransformatieEnrollment } from '@/hooks/use-enrollment-status';
import { TodayFocusCard } from '@/components/engagement/today-focus-card';
import { useScanManager } from '@/hooks/use-scan-manager';
import { ScanCard } from './scan-card';
import { ToolModal } from '@/components/tools/tool-modal';

interface VandaagTabProps {
  onTabChange?: (tab: string) => void;
  userId?: number;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Goedemorgen';
  if (hour < 18) return 'Goedemiddag';
  return 'Goedenavond';
}

export const VandaagTab = React.memo(function VandaagTab({ onTabChange, userId }: VandaagTabProps) {
  const router = useRouter();
  const { user } = useUser();
  const { isEnrolled: hasTransformatie, progress } = useTransformatieEnrollment();
  const { scanModal, scanStatus, openScan, closeScan } = useScanManager(userId);

  const firstName = user?.name?.split(' ')[0] || 'je';

  const completedLessons = progress?.completed ?? 0;
  const totalLessons = progress?.total ?? 48;
  const percentage = progress?.percentage ?? 0;
  const currentModule = Math.min(Math.floor(completedLessons / 4) + 1, 12);
  const currentLesson = (completedLessons % 4) + 1;

  const scanNotDone = scanStatus?.hechtingsstijl && !scanStatus.hechtingsstijl.isCompleted;

  return (
    <div className="space-y-4">
      {/* Greeting */}
      <div className="pt-1">
        <p className="text-sm text-gray-500 dark:text-gray-400">{getGreeting()}</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{firstName}</h1>
      </div>

      {/* Hero Card: één primaire actie */}
      {hasTransformatie ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <button
            onClick={() => router.push('/transformatie')}
            className="w-full relative overflow-hidden rounded-2xl bg-coral-500 hover:bg-coral-600 p-5 text-left active:scale-[0.99] transition-transform"
          >
            <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-3xl -translate-y-8 translate-x-8 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-white" fill="white" />
                  </div>
                  <div>
                    <p className="text-[11px] text-white/60 uppercase tracking-wider font-medium">Jouw volgende stap</p>
                    <p className="text-base font-bold text-white">
                      Module {currentModule} · Les {currentLesson}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-white/25 px-3 py-1.5 rounded-full">
                  <Play className="w-3.5 h-3.5 text-white" fill="white" />
                  <span className="text-sm font-bold text-white">Ga verder</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="bg-white/20 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className="h-full bg-white rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-white/60">
                <span>{completedLessons} van {totalLessons} lessen voltooid</span>
                <span>{percentage}%</span>
              </div>
            </div>
          </button>
        </motion.div>
      ) : scanNotDone ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <ScanCard
            icon={<Heart className="w-6 h-6" />}
            title="Ontdek je hechtingsstijl"
            subtitle="Leer hoe je hechtingsstijl je dating gedrag beïnvloedt"
            quote='"Wetenschappelijk onderbouwde inzichten voor betere relaties"'
            actionLabel="Start test (5 min)"
            onAction={() => openScan('hechtingsstijl')}
            color="pink"
          />
        </motion.div>
      ) : (
        <TodayFocusCard userId={userId} />
      )}

      {/* Coach teaser */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        onClick={() => onTabChange?.('coach')}
        className="w-full flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all active:scale-[0.99] text-left"
      >
        <div className="w-10 h-10 rounded-full bg-coral-500 hover:bg-coral-600 flex items-center justify-center flex-shrink-0">
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white text-sm">Stel Iris een vraag</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Je AI dating coach · altijd beschikbaar</p>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </motion.button>

      <ToolModal isOpen={scanModal.isOpen} onClose={closeScan}>
        {scanModal.component}
      </ToolModal>
    </div>
  );
});
