"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Heart,
  Shield,
  Flame,
  Zap,
  CheckCircle,
  AlertTriangle,
  Star,
  MessageCircle,
  User,
  Target,
  RefreshCw,
  Download,
  Share2,
  ArrowRight,
  Save,
  X
} from 'lucide-react';
import { AssessmentData, AttachmentStyle } from './attachment-assessment-flow';
import { MicroInterventions } from './micro-interventions';
import { ConversationScripts } from './conversation-scripts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AttachmentResultsProps {
  data: AssessmentData;
  onRestart: () => void;
  onClose?: () => void;
  styleIcon: (style: AttachmentStyle) => React.ReactNode;
  styleColor: (style: AttachmentStyle) => string;
}

export function AttachmentResults({ data, onRestart, onClose, styleIcon, styleColor }: AttachmentResultsProps) {
  const getStyleName = (style: AttachmentStyle) => {
    switch (style) {
      case 'veilig': return 'Veilig';
      case 'angstig': return 'Angstig';
      case 'vermijdend': return 'Vermijdend';
      case 'angstig_vermijdend': return 'Angstig-Vermijdend';
      default: return style;
    }
  };

  const getStyleDescription = (style: AttachmentStyle) => {
    switch (style) {
      case 'veilig':
        return 'Je voelt je comfortabel met intimiteit en kunt goed balanceren tussen nabijheid en onafhankelijkheid.';
      case 'angstig':
        return 'Je hebt een sterke behoefte aan zekerheid en bevestiging in relaties.';
      case 'vermijdend':
        return 'Je waardeert je onafhankelijkheid en voelt je soms opgesloten in te nauwe relaties.';
      case 'angstig_vermijdend':
        return 'Je hebt conflicterende behoeften: je wilt zowel nabijheid als afstand.';
      default:
        return '';
    }
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 85) return { label: 'Zeer Betrouwbaar', color: 'text-green-600 bg-green-50' };
    if (confidence >= 70) return { label: 'Betrouwbaar', color: 'text-blue-600 bg-blue-50' };
    if (confidence >= 50) return { label: 'Redelijk', color: 'text-yellow-600 bg-yellow-50' };
    return { label: 'Beperkt', color: 'text-orange-600 bg-orange-50' };
  };

  const confidenceInfo = getConfidenceLabel(data.confidence || 85);

  return (
    <div className="space-y-6">
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
          {/* Primary Result Card */}
          <Card className="border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-pink-100">
            <CardContent className="p-8">
              <div className="text-center">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${styleColor(data.primaryStyle)}`}>
                  {styleIcon(data.primaryStyle)}
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {data.aiInsights.profiel}
                </h2>

                <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto leading-relaxed">
                  {data.aiInsights.toekomstgerichteInterpretatie}
                </p>

                <div className="flex items-center justify-center gap-4 mb-6">
                  <Badge className={`px-4 py-2 ${confidenceInfo.color}`}>
                    Betrouwbaarheid: {data.confidence || 85}%
                  </Badge>
                  {data.secondaryStyle && (
                    <Badge variant="outline" className="px-4 py-2">
                      Secundair: {getStyleName(data.secondaryStyle)}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scores Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-pink-600" />
                    Gedetailleerde Scores
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(data.scores).map(([style, score]) => (
                    <div key={style} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {styleIcon(style as AttachmentStyle)}
                          <span className="font-medium">{getStyleName(style as AttachmentStyle)}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-600">{score}%</span>
                      </div>
                      <Progress value={score} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
    
              {/* Key Characteristics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Belangrijkste Kenmerken
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {data.aiInsights.datingVoorbeelden.map((voorbeeld, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{voorbeeld}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
    
              {/* Practical Implications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-600" />
                    In Dating Context
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {getStyleDescription(data.primaryStyle)}
                  </p>
                </CardContent>
              </Card>
    
              {/* Red Flags & Golden Rules */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-900">
                      <AlertTriangle className="w-5 h-5" />
                      Rode Vlaggen
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data.aiInsights.triggers.map((trigger, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <span className="text-red-800 text-sm">{trigger}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
    
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-900">
                      <Star className="w-5 h-5" />
                      Gouden Regels
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data.aiInsights.herstelStrategieen.map((strategie, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <Star className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-green-800 text-sm">{strategie}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
    
              {/* Tool Integrations */}
              <Card className="bg-gradient-to-r from-pink-50 to-pink-100 border-pink-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-pink-600" />
                    Geïntegreerde Tools
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {data.aiInsights.recommendedTools.slice(0, 3).map((tool: any, index: number) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-white"
                        onClick={() => window.location.href = tool.url || '#'}
                      >
                        <MessageCircle className="w-6 h-6 text-pink-600" />
                        <span className="font-semibold">{tool.name || 'Tool'}</span>
                        <span className="text-sm text-gray-600">{tool.reason || 'Integratie'}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
    
            <TabsContent value="interventions" className="space-y-6">
              <MicroInterventions
                interventions={data.aiInsights.microInterventies}
                onInterventionComplete={(id) => console.log('Intervention completed:', id)}
              />
            </TabsContent>
    
            <TabsContent value="scripts" className="space-y-6">
              <ConversationScripts
                scripts={data.aiInsights.gesprekScripts}
                onScriptUsed={(id) => console.log('Script used:', id)}
              />
            </TabsContent>
          </Tabs>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
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
          className="flex-1 flex items-center gap-2 border-pink-200 text-pink-600 hover:bg-pink-50"
          onClick={() => {
            const url = `/api/hechtingsstijl/pdf?assessmentId=${data.assessmentId}&userId=${data.userId || '1'}`;
            window.open(url, '_blank');
          }}
        >
          <Download className="w-4 h-4" />
          Download PDF
        </Button>

        <Button
          className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white flex items-center gap-2"
          onClick={() => {
            // Share functionality
            if (navigator.share) {
              navigator.share({
                title: 'Mijn Hechtingsstijl Resultaat',
                text: `Mijn hechtingsstijl is ${getStyleName(data.primaryStyle)}. Ontdek de jouwe op DatingAssistent!`,
                url: window.location.href
              });
            } else {
              navigator.clipboard.writeText(`${window.location.href} - Mijn hechtingsstijl: ${getStyleName(data.primaryStyle)}`);
              alert('Link gekopieerd naar klembord!');
            }
          }}
        >
          <Share2 className="w-4 h-4" />
          Delen
        </Button>
      </div>

      {/* Disclaimer */}
      <div className="text-center text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
        <p className="mb-2">
          <strong>Belangrijke noot:</strong> Deze QuickScan geeft richtinggevende inzichten maar is geen medische diagnose.
        </p>
        <p>
          Voor professionele hulp bij relatieproblemen, raadpleeg een gekwalificeerde therapeut.
        </p>
      </div>
    </div>
  );
}