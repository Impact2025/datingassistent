/**
 * ScansSection - Expandable scans overview
 * Shows completed and available scans with smart tracking
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Scan, ArrowRight, Sparkles, Heart, Target, Brain, Compass, Repeat } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ScanCard } from '../scan-card';
import { useRouter } from 'next/navigation';
import type { ScanStatus } from '@/hooks/use-scan-manager';

interface ScansSectionProps {
  scanStatus: Record<string, ScanStatus>;
  onOpenScan?: (scanType: string) => void;
  showWelcomeVideo?: boolean;
}

const SCAN_METADATA: Record<string, any> = {
  'hechtingsstijl': {
    title: 'Hechtingsstijl QuickScan',
    description: 'Ontdek hoe jouw hechtingspatroon je relaties beïnvloedt',
    icon: Heart,
    color: 'pink',
    href: '/hechtingsstijl',
  },
  'dating-style': {
    title: 'Dating Style & Blind Spots',
    description: 'Leer je dating patterns en blinde vlekken kennen',
    icon: Target,
    color: 'purple',
    href: '/blind-vlekken',
  },
  'emotional-readiness': {
    title: 'Emotional Readiness Check',
    description: 'Evalueer je emotionele gereedheid voor dating',
    icon: Brain,
    color: 'blue',
    href: '/emotionele-readiness',
  },
  'levensvisie': {
    title: 'Levensvisie & Toekomstkompas',
    description: 'Ontdek je toekomstvisie en ideale partner profiel',
    icon: Compass,
    color: 'green',
    href: '/levensvisie',
  },
  'relatiepatronen': {
    title: 'Relatiepatronen Analyse',
    description: 'Herken je terugkerende patronen en groei strategieën',
    icon: Repeat,
    color: 'purple',
    href: '/relatiepatronen',
  },
};

export const ScansSection = React.memo(function ScansSection({
  scanStatus,
  onOpenScan,
  showWelcomeVideo = false,
}: ScansSectionProps) {
  const router = useRouter();
  const [showMijnScans, setShowMijnScans] = useState(false);

  if (showWelcomeVideo) return null;

  const completedCount = Object.values(scanStatus).filter((s: any) => s.isCompleted).length;
  const totalCount = Object.keys(scanStatus).length;

  return (
    <>
      {/* Scans Toggle Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card
          className="border-2 border-purple-200 hover:border-purple-300 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-purple-50/50 to-pink-50/50"
          onClick={() => setShowMijnScans(!showMijnScans)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Scan className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Mijn Scans
                  </h3>
                  <p className="text-sm text-gray-600">
                    {totalCount > 0
                      ? `${completedCount} van ${totalCount} voltooid`
                      : 'Ontdek je dating patterns'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm text-gray-600">
                    {showMijnScans ? 'Verberg' : 'Bekijk'} {totalCount > 0 ? 'resultaten' : 'scans'}
                  </p>
                  <p className="text-xs text-purple-600 font-medium">
                    {totalCount > 0 ? 'en track je groei' : 'Start je eerste scan'}
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: showMijnScans ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ArrowRight className="w-5 h-5 text-purple-600" />
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Expanded Scans Section */}
      {showMijnScans && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {totalCount === 0 ? (
            <Card className="p-6 text-center">
              <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Start je eerste scan!</h3>
              <p className="text-gray-600 mb-4">
                Ontdek je hechtingsstijl, dating patterns en blinde vlekken met onze AI-powered scans.
              </p>
              <p className="text-sm text-gray-500">
                Scans worden automatisch hier getoond zodra je ze voltooit.
              </p>
            </Card>
          ) : (
            Object.entries(scanStatus).map(([scanType, status]: [string, any], index) => {
              const scanMeta = SCAN_METADATA[scanType];

              if (!scanMeta) return null;

              const IconComponent = scanMeta.icon;
              const completionStatus = status.isCompleted ? {
                isCompleted: true,
                completedAt: status.lastCompletedAt,
                canRetake: status.canRetake,
                daysUntilRetake: status.daysUntilRetake,
                latestResult: status.latestResult?.primaryResult,
                totalAttempts: status.totalAttempts,
              } : undefined;

              return (
                <motion.div
                  key={scanType}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ScanCard
                    icon={<IconComponent />}
                    title={scanMeta.title}
                    subtitle={scanMeta.description}
                    quote=""
                    actionLabel={status.isCompleted ? (status.canRetake ? 'Opnieuw Doen' : 'Bekijk Resultaat') : 'Start Scan'}
                    onAction={() => {
                      if (status.isCompleted && status.assessmentId) {
                        router.push(`/scans/${scanType}/${status.assessmentId}`);
                      } else {
                        onOpenScan?.(scanType);
                      }
                    }}
                    badgeText={status.isCompleted ? '✓ Voltooid' : 'Nieuw'}
                    color={scanMeta.color}
                    completionStatus={completionStatus}
                    onRetake={() => onOpenScan?.(scanType)}
                  />
                </motion.div>
              );
            })
          )}
        </motion.div>
      )}
    </>
  );
});
