"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Heart,
  Target,
  Users,
  MessageCircle,
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Zap,
  Compass
} from 'lucide-react';
import { DatingStyleQuestionnaire } from '@/components/dating-style/dating-style-questionnaire';
import { DatingStyleResults } from '@/components/dating-style/dating-style-results';

type AssessmentState = 'intro' | 'questionnaire' | 'results';

export default function DatingStylePage() {
  const [assessmentState, setAssessmentState] = useState<AssessmentState>('intro');
  const [assessmentData, setAssessmentData] = useState<any>(null);

  const handleStartAssessment = () => {
    setAssessmentState('questionnaire');
  };

  const handleAssessmentComplete = (data: any) => {
    setAssessmentData(data);
    setAssessmentState('results');
  };

  const handleRestart = () => {
    setAssessmentData(null);
    setAssessmentState('intro');
  };

  if (assessmentState === 'questionnaire') {
    return (
      <DatingStyleQuestionnaire
        onComplete={handleAssessmentComplete}
        onBack={() => setAssessmentState('intro')}
      />
    );
  }

  if (assessmentState === 'results' && assessmentData) {
    return (
      <DatingStyleResults
        data={assessmentData}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-200 mb-4">
              <Compass className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">AI·PRO Tool</span>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Dating Stijl Scan
            </h1>

            <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
              Ontdek je unieke dating persoonlijkheid — hoe je daadwerkelijk date in de praktijk van 2025.
            </p>

            <div className="flex items-center justify-center gap-4 mb-8">
              <Badge className="px-4 py-2 bg-purple-100 text-purple-800 border-purple-200">
                4–5 minuten
              </Badge>
              <Badge className="px-4 py-2 bg-blue-100 text-blue-800 border-blue-200">
                Gedragsanalyse
              </Badge>
              <Badge className="px-4 py-2 bg-green-100 text-green-800 border-green-200">
                Praktische inzichten
              </Badge>
            </div>
          </div>

          {/* Main Content Card */}
          <Card className="border-2 border-purple-200 bg-white/90 backdrop-blur-sm shadow-xl">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Left Column - What it does */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <Target className="w-6 h-6 text-purple-600" />
                    Wat deze scan doet
                  </h2>

                  <div className="space-y-4">
                    {[
                      "Analyseert je daadwerkelijke dating gedrag (niet wat je denkt)",
                      "Identificeert je natuurlijke communicatiestijl in apps en dates",
                      "Ontdekt hoe je omgaat met initiatief, planning en spontaniteit",
                      "Bekijkt je grensbewaking en selectiviteit",
                      "Toont hoe je reageert op moderne dating uitdagingen",
                      "Geeft concrete tips om je sterke punten te benutten"
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column - Dating Styles */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <Users className="w-6 h-6 text-pink-600" />
                    8 Dating Stijlen
                  </h2>

                  <div className="space-y-3">
                    {[
                      { name: "Initiator", desc: "Neemt altijd het voortouw", color: "bg-red-100 text-red-800" },
                      { name: "Planner", desc: "Organiseert alles tot in detail", color: "bg-blue-100 text-blue-800" },
                      { name: "Avonturier", desc: "Leeft voor spontaniteit", color: "bg-green-100 text-green-800" },
                      { name: "Selecteur", desc: "Zeer kieskeurig over matches", color: "bg-purple-100 text-purple-800" },
                      { name: "Pleaser", desc: "Past zich aan om te behagen", color: "bg-pink-100 text-pink-800" },
                      { name: "Afstandelijk", desc: "Houdt emotionele afstand", color: "bg-gray-100 text-gray-800" },
                      { name: "Over-Sharer", desc: "Deelt veel persoonlijke info", color: "bg-yellow-100 text-yellow-800" },
                      { name: "Ghost-Gevoelig", desc: "Reageert traag of verdwijnt", color: "bg-orange-100 text-orange-800" }
                    ].map((style, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-semibold text-gray-900">{style.name}</span>
                          <span className="text-sm text-gray-600 ml-2">{style.desc}</span>
                        </div>
                        <Badge className={style.color}>{index + 1}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Klaar voor eerlijke zelfkennis?
                  </h3>

                  <p className="text-gray-600 mb-6 max-w-lg mx-auto">
                    Deze scan kijkt naar hoe je écht date — niet naar wat je hoopt te zijn.
                    De inzichten helpen je bewuster te daten en betere matches te vinden.
                  </p>

                  <Button
                    onClick={handleStartAssessment}
                    size="lg"
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    Start Dating Stijl Scan
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>

                  <p className="text-sm text-gray-500 mt-4">
                    Geen oordeel — alleen inzichten voor betere dates
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trust Indicators */}
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <Card className="text-center p-6 bg-white/80 backdrop-blur-sm">
              <MessageCircle className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">Authentiek</h4>
              <p className="text-sm text-gray-600">
                Gebaseerd op je werkelijke gedrag, niet op zelfbeeld
              </p>
            </Card>

            <Card className="text-center p-6 bg-white/80 backdrop-blur-sm">
              <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">Praktisch</h4>
              <p className="text-sm text-gray-600">
                Direct toepasbare tips voor je dating leven
              </p>
            </Card>

            <Card className="text-center p-6 bg-white/80 backdrop-blur-sm">
              <Zap className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">Snelle Inzichten</h4>
              <p className="text-sm text-gray-600">
                Moderne AI analyse in enkele seconden
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}