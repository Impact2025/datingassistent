"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/providers/user-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Eye,
  EyeOff,
  Target,
  AlertTriangle,
  Lightbulb,
  ArrowLeft,
  CheckCircle,
  XCircle,
  TrendingUp
} from 'lucide-react';

export default function BlindVlekkenPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [blindspots, setBlindspots] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user?.id) {
      loadBlindspotsData();
    }
  }, [user, loading, router]);

  const loadBlindspotsData = async () => {
    try {
      setLoadingData(true);

      // Load blindspots assessment data
      const response = await fetch(`/api/dating-style-blindspots?userId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setBlindspots(data.blindspots || []);
      }
    } catch (error) {
      console.error('Error loading blindspots data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coral-50 via-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-coral-200 border-t-coral-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-700">Blindvlekken Analyse laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-coral-50 via-purple-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              className="mb-8 text-gray-700 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Terug naar Dashboard
            </Button>

            <Card className="bg-white border-0 shadow-sm rounded-xl overflow-hidden mb-8">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 bg-coral-100 rounded-2xl flex items-center justify-center mx-auto mb-8">
                  <Eye className="w-10 h-10 text-coral-600" />
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900 mb-6">
                  Dating Blindvlekken Analyse
                </CardTitle>
                <p className="text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto">
                  Ontdek je onbewuste patronen die je dating leven saboteren. Kennis is macht!
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Blindspots List */}
            <div className="lg:col-span-2">
              <Card className="border-2 border-red-200 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Je Blindvlekken
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {blindspots.length > 0 ? (
                      blindspots.map((blindspot, index) => (
                        <div key={index} className="p-4 border border-red-200 rounded-lg bg-red-50/50">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-bold text-red-600">{index + 1}</span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-red-900 mb-2">{blindspot.title}</h4>
                              <p className="text-sm text-red-800 mb-3">{blindspot.description}</p>

                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-xs text-gray-700">Impact niveau:</span>
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map((level) => (
                                    <div
                                      key={level}
                                      className={`w-2 h-2 rounded-full ${
                                        level <= blindspot.impactLevel
                                          ? 'bg-red-500'
                                          : 'bg-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>

                              <div className="bg-white/80 p-3 rounded border-l-4 border-red-300">
                                <p className="text-sm text-gray-700">
                                  <strong>Oplossing:</strong> {blindspot.solution}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Geen blindvlekken gedetecteerd</h3>
                        <p className="text-gray-700 mb-4">
                          Uitstekend! Er zijn geen significante blindvlekken gevonden in je dating gedrag.
                        </p>
                        <Button
                          onClick={() => router.push('/dashboard?tab=leren-ontwikkelen')}
                          className="bg-gradient-to-r from-green-500 to-blue-600"
                        >
                          Ontwikkel jezelf verder
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Progress Overview */}
              <Card className="border-2 border-orange-200 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                    Self-Awareness Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-orange-600 mb-2">78%</div>
                    <Progress value={78} className="h-3 mb-3" />
                    <p className="text-sm text-gray-700">
                      Goede zelfbewustzijn - je kent jezelf goed, maar er is altijd ruimte voor verbetering.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Common Blindspots */}
              <Card className="border-2 border-yellow-200 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-600" />
                    Vaak Voorkomende Blindvlekken
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Te snel commitment zoeken</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Verkeerde partner types kiezen</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Communicatie problemen negeren</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span>Red flags negeren</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span>Eigen behoeften niet kennen</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Button */}
              <Card className="border-2 border-blue-200 bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <Lightbulb className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Meer Zelfbewustzijn?</h3>
                  <p className="text-gray-700 mb-4 text-sm">
                    Ontdek meer over jezelf met onze andere assessments.
                  </p>
                  <Button
                    onClick={() => router.push('/dashboard?tab=profiel-persoonlijkheid')}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600"
                  >
                    Start Profiel Analyse
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="grid md:grid-cols-3 gap-4">
            <Button
              onClick={() => router.push('/dashboard?tab=leren-ontwikkelen')}
              className="h-auto p-4 flex flex-col gap-2 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700"
            >
              <Target className="w-6 h-6" />
              <span className="font-medium">Blindvlekken Verhelpen</span>
              <span className="text-xs opacity-90">Leer van je inzichten</span>
            </Button>

            <Button
              onClick={() => router.push('/dashboard?tab=groei-doelen')}
              className="h-auto p-4 flex flex-col gap-2 bg-gradient-to-r from-orange-500 to-yellow-600 hover:from-orange-600 hover:to-yellow-700"
            >
              <TrendingUp className="w-6 h-6" />
              <span className="font-medium">Doelen Stellen</span>
              <span className="text-xs opacity-90">Gebruik inzichten voor groei</span>
            </Button>

            <Button
              onClick={() => router.push('/dashboard?tab=communicatie-matching')}
              className="h-auto p-4 flex flex-col gap-2 bg-gradient-to-r from-yellow-500 to-green-600 hover:from-yellow-600 hover:to-green-700"
            >
              <Lightbulb className="w-6 h-6" />
              <span className="font-medium">Nieuwe Gewoontes</span>
              <span className="text-xs opacity-90">Bouw betere patronen</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}