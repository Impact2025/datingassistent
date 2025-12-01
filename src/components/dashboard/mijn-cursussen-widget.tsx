'use client';

/**
 * Mijn Cursussen Widget - Dashboard Integratie
 * Professional, minimalist design met voortgang en aanbevelingen
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap,
  BookOpen,
  Clock,
  CheckCircle,
  ArrowRight,
  Play,
  Sparkles,
  TrendingUp
} from 'lucide-react';

interface CursusProgress {
  id: number;
  titel: string;
  slug: string;
  beschrijving?: string;
  niveau: string;
  duur_minuten: number;
  thumbnail_url?: string;
  user_progress?: {
    percentage: number;
    voltooide_lessen: number;
    totaal_lessen: number;
    laatste_les_titel?: string;
  };
}

export function MijnCursussenWidget() {
  const [activeCursussen, setActiveCursussen] = useState<CursusProgress[]>([]);
  const [aanbevolenCursussen, setAanbevolenCursussen] = useState<CursusProgress[]>([]);
  const [stats, setStats] = useState({
    totaalVoltooide: 0,
    totaalMinuten: 0,
    totaalActief: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCursussenData();
  }, []);

  const fetchCursussenData = async () => {
    try {
      const response = await fetch('/api/cursussen');
      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      const cursussen = data.cursussen || [];

      // Splits actieve en aanbevolen cursussen
      const actief = cursussen.filter((c: CursusProgress) =>
        c.user_progress && c.user_progress.percentage > 0 && c.user_progress.percentage < 100
      );
      const aanbevolen = cursussen.filter((c: CursusProgress) =>
        !c.user_progress || c.user_progress.percentage === 0
      ).slice(0, 3);

      // Bereken stats
      const voltooide = cursussen.filter((c: CursusProgress) =>
        c.user_progress && c.user_progress.percentage === 100
      ).length;
      const totaalMinuten = cursussen.reduce((sum: number, c: CursusProgress) =>
        sum + (c.user_progress && c.user_progress.percentage === 100 ? c.duur_minuten : 0), 0
      );

      setActiveCursussen(actief);
      setAanbevolenCursussen(aanbevolen);
      setStats({
        totaalVoltooide: voltooide,
        totaalMinuten,
        totaalActief: actief.length
      });
    } catch (error) {
      console.error('Error fetching cursussen:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-sm bg-white">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="space-y-6"
    >
      {/* Header met Stats */}
      <Card className="border-0 shadow-sm bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center shadow-sm">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Mijn Cursussen</h2>
                <p className="text-sm text-gray-600">Je leertraject naar dating succes</p>
              </div>
            </div>
            <Link href="/cursussen">
              <Button
                variant="ghost"
                className="text-pink-500 hover:text-pink-600 hover:bg-pink-50"
              >
                Alles bekijken
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center shadow-sm">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="text-2xl font-semibold text-gray-900">{stats.totaalVoltooide}</div>
              <div className="text-xs text-gray-600">Voltooid</div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center shadow-sm">
                  <Play className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="text-2xl font-semibold text-gray-900">{stats.totaalActief}</div>
              <div className="text-xs text-gray-600">Actief</div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center shadow-sm">
                  <Clock className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="text-2xl font-semibold text-gray-900">{stats.totaalMinuten}</div>
              <div className="text-xs text-gray-600">Minuten</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actieve Cursussen */}
      {activeCursussen.length > 0 && (
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Play className="w-5 h-5 text-pink-500" />
              <h3 className="text-base font-semibold text-gray-900">Ga verder waar je was gebleven</h3>
            </div>

            <div className="space-y-3">
              {activeCursussen.map((cursus) => (
                <Link key={cursus.id} href={`/cursussen/${cursus.slug}`}>
                  <div className="p-4 rounded-lg border-2 border-gray-200 hover:border-pink-300 hover:bg-pink-50/30 transition-all group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors mb-1">
                          {cursus.titel}
                        </h4>
                        <p className="text-xs text-gray-600">
                          {cursus.user_progress?.voltooide_lessen} van {cursus.user_progress?.totaal_lessen} lessen
                        </p>
                      </div>
                      <Badge className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0">
                        {cursus.user_progress?.percentage}%
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <Progress
                        value={cursus.user_progress?.percentage || 0}
                        className="h-2"
                      />
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">
                          {cursus.user_progress?.laatste_les_titel && `Laatst: ${cursus.user_progress.laatste_les_titel}`}
                        </span>
                        <span className="text-pink-600 font-medium group-hover:underline flex items-center gap-1">
                          Verder gaan
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Aanbevolen Cursussen */}
      {aanbevolenCursussen.length > 0 && (
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-pink-500" />
              <h3 className="text-base font-semibold text-gray-900">Aanbevolen voor jou</h3>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {aanbevolenCursussen.map((cursus) => (
                <Link key={cursus.id} href={`/cursussen/${cursus.slug}`}>
                  <div className="p-4 rounded-lg border-2 border-gray-200 hover:border-pink-300 hover:bg-pink-50/30 transition-all group h-full">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors text-sm mb-1 line-clamp-2">
                          {cursus.titel}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Clock className="w-3 h-3" />
                          <span>{cursus.duur_minuten} min</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                      {cursus.beschrijving}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-pink-600 font-medium group-hover:underline">
                      <span>Start cursus</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lege status als geen cursussen */}
      {activeCursussen.length === 0 && aanbevolenCursussen.length === 0 && (
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Start je leertraject</h3>
            <p className="text-sm text-gray-600 mb-4">
              Begin met een van onze cursussen om je dating vaardigheden te verbeteren
            </p>
            <Link href="/cursussen">
              <Button className="bg-gradient-to-br from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white">
                Bekijk alle cursussen
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
