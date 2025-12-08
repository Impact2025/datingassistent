'use client';

/**
 * Mijn Scans Overview Page
 * Shows all completed scans with results and retake options
 */

import { useEffect, useState } from 'react';
import { useUser } from '@/providers/user-provider';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Scan, Heart, Target, Brain,
  CheckCircle2, Clock, TrendingUp, Calendar,
  BarChart3, Sparkles, RefreshCw, Compass, Repeat
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ScanStatus {
  scanType: string;
  isCompleted: boolean;
  lastCompletedAt?: string;
  totalAttempts: number;
  canRetake: boolean;
  daysUntilRetake: number;
  latestResult?: {
    primaryResult: string;
    confidenceScore?: number;
    scoresJson?: any;
  };
  assessmentId?: number;
}

interface ScanMetadata {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  href: string;
  resultLabel: string;
}

const SCAN_METADATA: Record<string, ScanMetadata> = {
  'hechtingsstijl': {
    title: 'Hechtingsstijl QuickScan',
    description: 'Ontdek hoe jouw hechtingspatroon je relaties beïnvloedt',
    icon: <Heart className="w-6 h-6" />,
    color: 'pink',
    href: '/hechtingsstijl',
    resultLabel: 'Hechtingsstijl'
  },
  'dating-style': {
    title: 'Dating Style & Blind Spots',
    description: 'Leer je dating patterns en blinde vlekken kennen',
    icon: <Target className="w-6 h-6" />,
    color: 'purple',
    href: '/blind-vlekken',
    resultLabel: 'Dating Style'
  },
  'emotional-readiness': {
    title: 'Emotional Readiness Check',
    description: 'Evalueer je emotionele gereedheid voor dating',
    icon: <Brain className="w-6 h-6" />,
    color: 'blue',
    href: '/emotionele-readiness',
    resultLabel: 'Readiness'
  },
  'levensvisie': {
    title: 'Levensvisie & Toekomstkompas',
    description: 'Ontdek je toekomstvisie en ideale partner profiel',
    icon: <Compass className="w-6 h-6" />,
    color: 'green',
    href: '/levensvisie',
    resultLabel: 'Levensvisie'
  },
  'relatiepatronen': {
    title: 'Relatiepatronen Analyse',
    description: 'Herken je terugkerende patronen en groei strategieën',
    icon: <Repeat className="w-6 h-6" />,
    color: 'purple',
    resultLabel: 'Patronen',
    href: '/relatiepatronen'
  }
};

export default function ScansPage() {
  const { user } = useUser();
  const router = useRouter();
  const [scans, setScans] = useState<ScanStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchScans = async () => {
      try {
        const response = await fetch(`/api/scans/status?userId=${user.id}`);
        const data = await response.json();

        if (data.scans) {
          setScans(data.scans);
        }
      } catch (error) {
        console.error('Failed to fetch scan status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScans();
  }, [user?.id]);

  const completedScans = scans.filter(s => s.isCompleted);
  const completionPercentage = (completedScans.length / scans.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Terug naar Dashboard
            </Button>
          </Link>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Scan className="w-10 h-10 text-purple-600" />
                Mijn Scans
              </h1>
              <p className="text-gray-600">Bekijk je resultaten en volg je groei</p>
            </div>

            <Card className="px-6 py-4 border-2 border-purple-200 bg-white/50 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {completedScans.length}/{scans.length}
                </div>
                <div className="text-sm text-gray-600 mt-1">Scans Voltooid</div>
              </div>
            </Card>
          </div>

          {/* Progress Bar */}
          <Card className="p-6 bg-white/70 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                  <span className="text-sm font-bold text-purple-600">{Math.round(completionPercentage)}%</span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
              </div>
            </div>
          </Card>
        </div>

        {/* Scans Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Scans laden...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {scans.map((scan, index) => {
              const meta = SCAN_METADATA[scan.scanType];
              if (!meta) return null;

              return (
                <ScanOverviewCard
                  key={scan.scanType}
                  scan={scan}
                  metadata={meta}
                  delay={index * 0.1}
                />
              );
            })}
          </div>
        )}

        {/* Call to Action */}
        {completedScans.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center py-12"
          >
            <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Start je eerste scan!
            </h3>
            <p className="text-gray-600 mb-6">
              Ontdek je dating patterns en unlock personalized inzichten
            </p>
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                Naar Dashboard
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}

interface ScanOverviewCardProps {
  scan: ScanStatus;
  metadata: ScanMetadata;
  delay: number;
}

function ScanOverviewCard({ scan, metadata, delay }: ScanOverviewCardProps) {
  const router = useRouter();

  const colorClasses = {
    pink: {
      bg: 'bg-pink-50',
      border: 'border-pink-200',
      text: 'text-pink-700',
      badge: 'bg-pink-100 text-pink-700',
      button: 'from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800',
      icon: 'text-pink-600'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-700',
      badge: 'bg-purple-100 text-purple-700',
      button: 'from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800',
      icon: 'text-purple-600'
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      badge: 'bg-blue-100 text-blue-700',
      button: 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
      icon: 'text-blue-600'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      badge: 'bg-green-100 text-green-700',
      button: 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800',
      icon: 'text-green-600'
    }
  };

  const colors = colorClasses[metadata.color as keyof typeof colorClasses];

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Nooit';
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatResult = (result?: string) => {
    if (!result) return 'Geen resultaat';
    // Capitalize and clean up result string
    return result.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className={cn(
        "border-2 overflow-hidden",
        scan.isCompleted ? colors.border : "border-gray-200",
        scan.isCompleted ? "bg-white" : "bg-gray-50"
      )}>
        <CardHeader className={cn(
          "pb-4",
          scan.isCompleted ? colors.bg : "bg-gray-100"
        )}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className={cn(
                "p-3 rounded-xl",
                scan.isCompleted ? colors.badge : "bg-gray-200"
              )}>
                <div className={scan.isCompleted ? colors.icon : "text-gray-400"}>
                  {metadata.icon}
                </div>
              </div>

              <div>
                <CardTitle className="text-xl mb-1 flex items-center gap-2">
                  {metadata.title}
                  {scan.isCompleted && (
                    <CheckCircle2 className={cn("w-5 h-5", colors.icon)} />
                  )}
                </CardTitle>
                <p className="text-sm text-gray-600">{metadata.description}</p>
              </div>
            </div>

            {scan.isCompleted && (
              <Badge variant="outline" className={colors.badge}>
                {scan.totalAttempts}x Voltooid
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {scan.isCompleted ? (
            <>
              {/* Latest Result */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">{metadata.resultLabel}</div>
                  <div className={cn("text-lg font-bold", colors.text)}>
                    {formatResult(scan.latestResult?.primaryResult)}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-gray-500">Laatst Voltooid</div>
                  <div className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {formatDate(scan.lastCompletedAt)}
                  </div>
                </div>

                {scan.latestResult?.confidenceScore && (
                  <div className="space-y-1">
                    <div className="text-sm text-gray-500">Betrouwbaarheid</div>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={scan.latestResult.confidenceScore}
                        className="h-2 flex-1"
                      />
                      <span className="text-sm font-semibold">
                        {scan.latestResult.confidenceScore}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={() => router.push(`/scans/${scan.scanType}/${scan.assessmentId}`)}
                  variant="outline"
                  className="flex-1"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Bekijk Resultaten
                </Button>

                {scan.canRetake ? (
                  <Button
                    onClick={() => router.push(metadata.href)}
                    className={cn("flex-1 bg-gradient-to-r", colors.button)}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Opnieuw Doen
                  </Button>
                ) : (
                  <Button
                    disabled
                    variant="outline"
                    className="flex-1"
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Nog {scan.daysUntilRetake} dagen
                  </Button>
                )}
              </div>

              {scan.totalAttempts > 1 && (
                <div className="mt-4 pt-4 border-t">
                  <button
                    onClick={() => router.push(`/scans/${scan.scanType}/history`)}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                  >
                    <TrendingUp className="w-4 h-4" />
                    Bekijk groei over {scan.totalAttempts} scans
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-4">Je hebt deze scan nog niet gedaan</p>
              <Button
                onClick={() => router.push(metadata.href)}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                Start Scan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
