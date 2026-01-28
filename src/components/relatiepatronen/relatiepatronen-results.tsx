"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Download,
  Target,
  Heart,
  MessageCircle,
  Sparkles,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  RotateCcw,
  Save
} from 'lucide-react';
import { AssessmentData, RelationshipPattern } from './relatiepatronen-flow';
import { useUser } from '@/providers/user-provider';

interface RelatiepatronenResultsProps {
  data: AssessmentData;
  onRestart: () => void;
  onClose?: () => void;
  patternIcon: (pattern: RelationshipPattern) => React.ReactNode;
  patternColor: (pattern: RelationshipPattern) => string;
}

export function RelatiepatronenResults({
  data,
  onRestart,
  onClose,
  patternIcon,
  patternColor
}: RelatiepatronenResultsProps) {
  const { user } = useUser();
  const getPatternName = (pattern: RelationshipPattern) => {
    const names = {
      idealize: 'Idealiseringslus',
      avoid_conflict: 'Conflictvermijding',
      rebound: 'Rebound Patroon',
      sabotage: 'Self-Sabotage',
      boundary_deficit: 'Boundary Deficit',
      role_expectation: 'Rol Verwachting',
      unavailable_preference: 'Onbereikbaarheid Voorkeur',
      validation_seeking: 'Validatie Zoeken'
    };
    return names[pattern] || pattern;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-50';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getBlindspotLevel = (index: number) => {
    if (index >= 70) return { level: 'Hoog', color: 'text-red-600', desc: 'Grote kans op onbewuste patronen' };
    if (index >= 40) return { level: 'Gemiddeld', color: 'text-yellow-600', desc: 'Sommige aspecten zijn onbewust' };
    return { level: 'Laag', color: 'text-green-600', desc: 'Goede zelfbewustzijn' };
  };

  const blindspotInfo = getBlindspotLevel(data.blindspotIndex);

  return (
    <div className="p-8 space-y-6">
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

      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-coral-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-8 h-8 text-coral-500" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Jouw Relatiepatronen Analyse
        </h2>

        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getConfidenceColor(data.confidence)}`}>
          <CheckCircle className="w-4 h-4" />
          <span className="font-medium">Confidence: {data.confidence}%</span>
        </div>
      </div>

      {/* Primary Pattern */}
      <Card className="mb-8 border-2 border-coral-200">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-coral-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              {patternIcon(data.primaryPattern)}
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {data.aiInsights.headline}
            </h3>

            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              {data.aiInsights.oneLiner}
            </p>

            <div className="flex items-center justify-center gap-4">
              <Badge variant="secondary" className="bg-coral-100 text-coral-700">
                Primair: {getPatternName(data.primaryPattern)}
              </Badge>
              {data.secondaryPatterns.length > 0 && (
                <Badge variant="outline">
                  Secundair: {getPatternName(data.secondaryPatterns[0].pattern)}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pattern Scores */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-coral-500" />
            Jouw Patroon Scores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(data.scores).map(([pattern, score]) => (
              <div key={pattern} className="flex items-center gap-4">
                <div className="w-32 text-sm font-medium text-gray-700">
                  {getPatternName(pattern as RelationshipPattern)}
                </div>
                <div className="flex-1">
                  <Progress value={score} className="h-2" />
                </div>
                <div className="w-12 text-sm text-gray-600 text-right">
                  {Math.round(score)}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Blind Spot Analysis */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Blinde Vlek Analyse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${blindspotInfo.color} bg-opacity-10`}>
              {blindspotInfo.level} ({data.blindspotIndex}%)
            </div>
            <span className="text-sm text-gray-600">{blindspotInfo.desc}</span>
          </div>
        </CardContent>
      </Card>

      {/* Concrete Examples */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Hoe dit patroon zich uit in dating
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.aiInsights.patternExamples.map((example, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-red-600">{index + 1}</span>
                </div>
                <p className="text-gray-700">{example}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Triggers */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            Wanneer activeert dit patroon?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.aiInsights.triggers.map((trigger, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-yellow-600">⚡</span>
                </div>
                <p className="text-gray-700">{trigger}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Micro Interventions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-green-500" />
            Direct Toepasbare Interventies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {data.aiInsights.microInterventions.map((intervention, index) => (
              <div key={index} className="border border-green-200 rounded-lg p-4 bg-green-50">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-green-600">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-900 mb-2">{intervention.title}</h4>
                    <p className="text-green-800 mb-2">{intervention.description}</p>
                    <Badge variant="secondary" className="bg-green-200 text-green-700">
                      {intervention.duration} dagen
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conversation Scripts */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-500" />
            Conversation Scripts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <h4 className="font-semibold text-blue-900 mb-2">Boundary Setting</h4>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800 italic">"{data.aiInsights.conversationScripts.boundary}"</p>
              </div>
            </div>

            <div className="text-center">
              <h4 className="font-semibold text-blue-900 mb-2">Check-in</h4>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800 italic">"{data.aiInsights.conversationScripts.checkIn}"</p>
              </div>
            </div>

            <div className="text-center">
              <h4 className="font-semibold text-blue-900 mb-2">Post-date Reflectie</h4>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800 italic">"{data.aiInsights.conversationScripts.postDate}"</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stop/Start Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Stop/Start Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                <span className="text-red-500">✋</span> Stoppen
              </h4>
              <ul className="space-y-2">
                {data.aiInsights.stopStartActions.stop.map((action, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span className="text-red-800">{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                <span className="text-green-500">🚀</span> Starten
              </h4>
              <ul className="space-y-2">
                {data.aiInsights.stopStartActions.start.map((action, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span className="text-green-800">{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Tools */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Aanbevolen Tools voor Jouw Patroon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {data.aiInsights.recommendedTools.map((tool, index) => (
              <Card key={index} className="border-2 border-purple-200 hover:border-purple-300 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-purple-900 mb-1">{tool.name}</h4>
                      <p className="text-sm text-purple-700 mb-3">{tool.reason}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-purple-600 border-purple-300 hover:bg-purple-50"
                        onClick={() => window.location.href = tool.url}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Openen
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          variant="outline"
          onClick={onRestart}
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Opnieuw Beginnen
        </Button>

        <Button
          onClick={async () => {
            if (!user?.id) {
              alert('Je moet ingelogd zijn om de PDF te downloaden.');
              return;
            }

            try {
              // Show loading state
              const button = event?.target as HTMLButtonElement;
              const originalText = button?.textContent;
              if (button) {
                button.textContent = 'PDF genereren...';
                button.disabled = true;
              }

              const response = await fetch(`/api/relatiepatronen/pdf?assessmentId=${data.assessmentId}&userId=${user.id}`, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('datespark_auth_token')}`
                }
              });

              if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `relatiepatronen-resultaat-${data.assessmentId}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
              } else {
                const errorText = await response.text();
                console.error('Failed to download PDF:', response.status, errorText);
                alert(`Er is een fout opgetreden bij het downloaden van de PDF (${response.status}). Probeer het opnieuw.`);
              }
            } catch (error) {
              console.error('Error downloading PDF:', error);
              alert('Er is een fout opgetreden bij het downloaden van de PDF. Controleer je internetverbinding en probeer het opnieuw.');
            } finally {
              // Reset button state
              const button = event?.target as HTMLButtonElement;
              if (button) {
                button.textContent = 'Resultaat Downloaden (PDF)';
                button.disabled = false;
              }
            }
          }}
          className="bg-coral-500 hover:bg-coral-600 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Resultaat Downloaden (PDF)
        </Button>
      </div>

      {/* Footer */}
      <div className="text-center mt-8 text-sm text-gray-600">
        <p className="mb-2">
          Deze inzichten zijn bedoeld voor zelfreflectie en gedragsverandering.
        </p>
        <p>
          Bij ernstige relatieproblemen of trauma, raadpleeg een professionele hulpverlener.
        </p>
      </div>
    </div>
  );
}