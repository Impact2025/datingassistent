"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Heart,
  Target,
  CheckCircle,
  AlertTriangle,
  Star,
  MessageCircle,
  Download,
  Share2,
  RefreshCw,
  ArrowRight,
  Save
} from 'lucide-react';

interface EmotionalReadinessResultsProps {
  data: any;
  onRestart: () => void;
  onClose?: () => void;
}

export function EmotionalReadinessResults({ data, onRestart, onClose }: EmotionalReadinessResultsProps) {
  const getReadinessLevelInfo = (level: string) => {
    switch (level) {
      case 'klaar_om_te_daten':
        return {
          title: 'Klaar om te Daten',
          color: 'text-green-600 bg-green-50 border-green-200',
          icon: CheckCircle,
          description: 'Je bent emotioneel gegrond en stabiel voor dating'
        };
      case 'bijna_klaar':
        return {
          title: 'Bijna Klaar',
          color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
          icon: AlertTriangle,
          description: 'Met kleine interventies ben je binnen 2–6 weken ready'
        };
      case 'moet_eerst_helen':
        return {
          title: 'Moet Eerst Helen',
          color: 'text-red-600 bg-red-50 border-red-200',
          icon: Heart,
          description: 'Heling eerst = betere relaties later'
        };
      default:
        return {
          title: level,
          color: 'text-gray-600 bg-gray-50 border-gray-200',
          icon: Target,
          description: ''
        };
    }
  };

  const readinessInfo = getReadinessLevelInfo(data.scores.readinessLevel);
  const ReadinessIcon = readinessInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-coral-50 to-coral-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Save & Close Card */}
          {onClose && (
            <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        Resultaten Automatisch Opgeslagen
                      </h3>
                      <p className="text-sm text-gray-600">
                        Je resultaten zijn veilig opgeslagen en altijd terug te vinden bij "Mijn Scans"
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={onClose}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 h-auto flex items-center gap-2 shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    <span className="font-semibold">Bewaar & Sluiten</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overzicht</TabsTrigger>
              <TabsTrigger value="interventions">Oefeningen</TabsTrigger>
              <TabsTrigger value="scripts">Scripts</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Main Result Card */}
              <Card className="border-2 border-coral-200 bg-gradient-to-br from-coral-50 to-coral-100">
                <CardContent className="p-8">
                  <div className="text-center">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${readinessInfo.color.split(' ')[1]}`}>
                      <ReadinessIcon className="w-10 h-10" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {data.aiAnalysis.conclusie}
                    </h2>

                    <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto leading-relaxed">
                      {data.aiAnalysis.analyse}
                    </p>

                    <div className="flex items-center justify-center gap-4 mb-6">
                      <Badge className={`px-4 py-2 ${readinessInfo.color}`}>
                        {readinessInfo.title}
                      </Badge>
                      <Badge variant="outline" className="px-4 py-2">
                        Score: {data.scores.overallScore}/100
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Scores */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-coral-600" />
                    Gedetailleerde Analyse
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(data.scores).filter(([key]) => key !== 'overallScore' && key !== 'readinessLevel').map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="text-sm font-semibold text-gray-600">{value as number}/100</span>
                      </div>
                      <Progress value={value as number} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* What Works Now */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Wat Werkt Nu
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {data.aiAnalysis.watWerktNu?.map((item: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-green-900">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* What Might Be Challenging */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    Wat Kan Lastig Zijn
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {data.aiAnalysis.watLastigKanZijn?.map((item: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="text-yellow-900">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Direct Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-purple-600" />
                    Directe Aanbevelingen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {data.aiAnalysis.aanbevelingen?.map((item: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-sm font-semibold text-purple-600">{index + 1}</span>
                        </div>
                        <span className="text-purple-900">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tool Integrations */}
              <Card className="bg-gradient-to-r from-coral-50 to-coral-100 border-coral-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-coral-600" />
                    Aanbevolen Tools
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {data.aiAnalysis.recommendedTools?.slice(0, 3).map((tool: any, index: number) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-white"
                        onClick={() => window.location.href = tool.url || '#'}
                      >
                        <MessageCircle className="w-6 h-6 text-coral-600" />
                        <span className="font-semibold">{tool.name || 'Tool'}</span>
                        <span className="text-sm text-gray-600">{tool.reason || 'Integratie'}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="interventions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Micro-Interventies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.aiAnalysis.microInterventies && Object.entries(data.aiAnalysis.microInterventies).map(([key, intervention]: [string, any], index: number) => (
                      <div key={key} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">{intervention.titel}</h4>
                        <p className="text-gray-600 mb-3">{intervention.beschrijving}</p>
                        <div className="space-y-1">
                          {intervention.stappen?.map((stap: string, stapIndex: number) => (
                            <div key={stapIndex} className="flex items-start gap-2 text-sm">
                              <span className="text-coral-600 font-semibold">{stapIndex + 1}.</span>
                              <span>{stap}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="scripts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Conversation Scripts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.aiAnalysis.scripts && Object.entries(data.aiAnalysis.scripts).map(([key, script]: [string, any], index: number) => (
                      <div key={key} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold mb-2 capitalize">{key.replace('_', ' ')}</h4>
                        <p className="text-gray-600 italic">"{script}"</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => navigator.clipboard.writeText(script)}
                        >
                          Kopiëren
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button
              onClick={onRestart}
              variant="outline"
              className="flex-1 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Opnieuw Doen
            </Button>

            <Button
              variant="outline"
              className="flex-1 flex items-center gap-2 border-coral-200 text-coral-600 hover:bg-coral-50"
              onClick={() => {
                // PDF generation would go here
                alert('PDF functionaliteit wordt binnenkort toegevoegd!');
              }}
            >
              <Download className="w-4 h-4" />
              Download PDF
            </Button>

            <Button
              className="flex-1 bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 text-white flex items-center gap-2"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'Mijn Emotionele Ready Scan Resultaat',
                    text: `Mijn emotionele readiness score: ${data.scores.overallScore}/100 - ${readinessInfo.title}`,
                    url: window.location.href
                  });
                } else {
                  navigator.clipboard.writeText(`${window.location.href} - Mijn emotionele readiness: ${data.scores.overallScore}/100`);
                  alert('Link gekopieerd naar klembord!');
                }
              }}
            >
              <Share2 className="w-4 h-4" />
              Delen
            </Button>
          </div>

          {/* Disclaimer */}
          <div className="text-center text-sm text-gray-500 bg-gray-50 p-4 rounded-lg mt-6">
            <p className="mb-2">
              <strong>Belangrijke noot:</strong> Deze scan geeft richtinggevende inzichten maar is geen medische diagnose.
            </p>
            <p>
              Bij ernstige emotionele uitdagingen, raadpleeg een professionele hulpverlener.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}