"use client";

/**
 * BlindVlekkenFlow - Dating Blind Spots Analysis Flow
 * Integrated modal flow component for blind spots analysis
 */

import { useState, useEffect } from 'react';
import { useUser } from '@/providers/user-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Eye,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  XCircle,
  TrendingUp,
  Sparkles
} from 'lucide-react';

interface BlindVlekkenFlowProps {
  onClose?: () => void;
}

export function BlindVlekkenFlow({ onClose }: BlindVlekkenFlowProps) {
  const { user } = useUser();
  const [blindspots, setBlindspots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadBlindspotsData();
    }
  }, [user]);

  const loadBlindspotsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/dating-style-blindspots?userId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setBlindspots(data.blindspots || []);
      } else {
        setError('Kon blindvlekken data niet laden');
      }
    } catch (error) {
      console.error('Error loading blindspots data:', error);
      setError('Er ging iets mis bij het laden van de data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Blindvlekken Analyse laden...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadBlindspotsData} variant="outline">
            Opnieuw proberen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 border-0 shadow-sm">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Eye className="w-8 h-8 text-pink-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Dating Blindvlekken Analyse
          </h2>
          <p className="text-gray-600 leading-relaxed max-w-xl mx-auto">
            Ontdek je onbewuste patronen die je dating leven saboteren. Kennis is macht!
          </p>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Blindspots List */}
        <div className="lg:col-span-2">
          <Card className="border-2 border-red-200 bg-white">
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
                            <span className="text-xs text-gray-600">Impact niveau:</span>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((level) => (
                                <div
                                  key={level}
                                  className={`w-2 h-2 rounded-full ${
                                    level <= (blindspot.impactLevel || 3)
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
                    <p className="text-gray-600 mb-4">
                      Uitstekend! Er zijn geen significante blindvlekken gevonden in je dating gedrag.
                    </p>
                    <Badge className="bg-green-500">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Goed bezig!
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress Overview */}
          <Card className="border-2 border-orange-200 bg-white">
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
                <p className="text-sm text-gray-600">
                  Goede zelfbewustzijn - je kent jezelf goed, maar er is altijd ruimte voor verbetering.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Common Blindspots */}
          <Card className="border-2 border-yellow-200 bg-white">
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
          <Card className="border-2 border-blue-200 bg-white">
            <CardContent className="p-6 text-center">
              <Sparkles className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Meer Zelfbewustzijn?</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Ontdek meer over jezelf met onze andere assessments.
              </p>
              {onClose && (
                <Button
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600"
                >
                  Terug naar Dashboard
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
