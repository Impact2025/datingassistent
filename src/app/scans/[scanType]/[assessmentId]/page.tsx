'use client';

/**
 * Individual Scan Result Detail Page
 * /scans/[scanType]/[assessmentId]
 *
 * Shows detailed results from a specific scan completion
 */

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/providers/user-provider';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Heart, Target, Brain, Calendar,
  Clock, TrendingUp, Sparkles, CheckCircle2,
  AlertCircle, Download, Share2, BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ScanResult {
  id: number;
  scanType: string;
  assessmentId: number;
  completedAt: string;
  totalTimeSeconds: number;
  confidenceScore: number;
  primaryResult: string;
  scores: Record<string, number>;
  fullResults: any;
}

const SCAN_METADATA: Record<string, any> = {
  'hechtingsstijl': {
    title: 'Hechtingsstijl QuickScan',
    icon: <Heart className="w-6 h-6" />,
    color: 'pink',
    description: 'Je hechtingspatroon en relatie patterns'
  },
  'dating-style': {
    title: 'Dating Style & Blind Spots',
    icon: <Target className="w-6 h-6" />,
    color: 'purple',
    description: 'Je dating style en blinde vlekken'
  },
  'emotional-readiness': {
    title: 'Emotional Readiness Check',
    icon: <Brain className="w-6 h-6" />,
    color: 'blue',
    description: 'Je emotionele readiness voor dating'
  }
};

export default function ScanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();

  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const scanType = params.scanType as string;
  const assessmentId = params.assessmentId as string;

  useEffect(() => {
    if (!user?.id) return;

    const fetchResult = async () => {
      try {
        // Fetch the specific assessment from the scan history
        const response = await fetch(
          `/api/scans/history?userId=${user.id}&scanType=${scanType}&includeFullResults=true`
        );
        const data = await response.json();

        if (data.history && data.history.length > 0) {
          // Find the specific assessment by ID
          const assessment = data.history.find(
            (h: any) => h.assessmentId.toString() === assessmentId
          );

          if (assessment) {
            setResult(assessment);
          } else {
            setError('Assessment niet gevonden');
          }
        } else {
          setError('Geen resultaten gevonden');
        }
      } catch (err: any) {
        console.error('Error fetching scan result:', err);
        setError('Fout bij laden van resultaat');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [user?.id, scanType, assessmentId]);

  const meta = SCAN_METADATA[scanType];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Resultaten laden...</p>
        </div>
      </div>
    );
  }

  if (error || !result || !meta) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-6 h-6" />
              Niet Gevonden
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              {error || 'Dit scan resultaat kon niet worden geladen.'}
            </p>
            <Link href="/scans">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Terug naar Mijn Scans
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/scans">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Terug naar Mijn Scans
            </Button>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className={cn(
              "border-2",
              `border-${meta.color}-200 bg-white`
            )}>
              <CardHeader className={`bg-${meta.color}-50`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-3 rounded-xl",
                      `bg-${meta.color}-100 text-${meta.color}-600`
                    )}>
                      {meta.icon}
                    </div>
                    <div>
                      <CardTitle className="text-2xl flex items-center gap-2">
                        {meta.title}
                        <CheckCircle2 className={`w-5 h-5 text-${meta.color}-600`} />
                      </CardTitle>
                      <p className="text-gray-600 mt-1">{meta.description}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      Delen
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Voltooid op
                    </div>
                    <div className="font-semibold">{formatDate(result.completedAt)}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Duur
                    </div>
                    <div className="font-semibold">{formatDuration(result.totalTimeSeconds)}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <BarChart3 className="w-4 h-4" />
                      Betrouwbaarheid
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={result.confidenceScore} className="h-2 flex-1" />
                      <span className="font-semibold text-sm">{result.confidenceScore}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Result */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Je Resultaat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-3xl font-bold mb-4",
                `text-${meta.color}-700`
              )}>
                {result.primaryResult.split('-').map(word =>
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </div>

              {/* Render scan-specific results */}
              <ScanResults scanType={scanType} results={result.fullResults} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Scores Breakdown */}
        {result.scores && Object.keys(result.scores).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Score Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(result.scores).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium capitalize">
                          {key.replace(/-/g, ' ')}
                        </span>
                        <span className="text-sm font-bold">{value}%</span>
                      </div>
                      <Progress value={value as number} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <Link href="/scans">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
              Bekijk Al Je Scans
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

interface ScanResultsProps {
  scanType: string;
  results: any;
}

function ScanResults({ scanType, results }: ScanResultsProps) {
  if (!results) return null;

  // Render based on scan type
  switch (scanType) {
    case 'hechtingsstijl':
      return <HechtingsstijlResults results={results} />;
    case 'dating-style':
      return <DatingStyleResults results={results} />;
    case 'emotional-readiness':
      return <EmotionalReadinessResults results={results} />;
    default:
      return <GenericResults results={results} />;
  }
}

function HechtingsstijlResults({ results }: { results: any }) {
  const { aiAnalysis } = results;

  return (
    <div className="space-y-6">
      {aiAnalysis?.waarom && (
        <div>
          <h3 className="font-semibold mb-2">Waarom dit jouw stijl is:</h3>
          <p className="text-gray-700">{aiAnalysis.waarom}</p>
        </div>
      )}

      {aiAnalysis?.datingVoorbeelden && aiAnalysis.datingVoorbeelden.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Hoe dit zich uit in dating:</h3>
          <ul className="space-y-2">
            {aiAnalysis.datingVoorbeelden.map((item: string, i: number) => (
              <li key={i} className="flex gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {aiAnalysis?.triggers && aiAnalysis.triggers.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2 text-amber-700">Triggers om alert op te zijn:</h3>
          <ul className="space-y-2">
            {aiAnalysis.triggers.map((item: string, i: number) => (
              <li key={i} className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function DatingStyleResults({ results }: { results: any }) {
  const { aiAnalysis } = results;

  return (
    <div className="space-y-6">
      {aiAnalysis?.explanation && (
        <div>
          <p className="text-gray-700">{aiAnalysis.explanation}</p>
        </div>
      )}

      {aiAnalysis?.strengths && aiAnalysis.strengths.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2 text-green-700">Je Sterke Punten:</h3>
          <ul className="space-y-2">
            {aiAnalysis.strengths.map((item: string, i: number) => (
              <li key={i} className="flex gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {aiAnalysis?.blindSpots && aiAnalysis.blindSpots.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2 text-amber-700">Blinde Vlekken:</h3>
          <ul className="space-y-2">
            {aiAnalysis.blindSpots.map((item: string, i: number) => (
              <li key={i} className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function EmotionalReadinessResults({ results }: { results: any }) {
  const { aiAnalysis } = results;

  return (
    <div className="space-y-6">
      {aiAnalysis?.summary && (
        <div>
          <p className="text-gray-700">{aiAnalysis.summary}</p>
        </div>
      )}

      {aiAnalysis?.recommendations && aiAnalysis.recommendations.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Aanbevelingen:</h3>
          <ul className="space-y-2">
            {aiAnalysis.recommendations.map((item: string, i: number) => (
              <li key={i} className="flex gap-2">
                <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function GenericResults({ results }: { results: any }) {
  return (
    <div className="space-y-4">
      <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
        {JSON.stringify(results, null, 2)}
      </pre>
    </div>
  );
}
