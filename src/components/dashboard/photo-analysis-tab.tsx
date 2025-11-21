'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Camera, Loader2, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { TutorialModal, useTutorial } from '@/components/shared/tutorial-modal';

interface PhotoAnalysisResult {
  overall_score: number;
  analysis: {
    lighting: { score: number; feedback: string };
    composition: { score: number; feedback: string };
    authenticity: { score: number; feedback: string };
    facial_expression: { score: number; feedback: string };
  };
  tips: string[];
  suggestions: {
    alternative_angles: string[];
    background: string[];
    overall: string;
  };
}

export function PhotoAnalysisTab() {
  const { showTutorial, startTutorial, completeTutorial, setShowTutorial } = useTutorial('photo-analysis');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<PhotoAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Selecteer een afbeelding (JPG, PNG, etc.)');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Afbeelding is te groot. Maximum 10MB');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setResult(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const analyzePhoto = async () => {
    if (!selectedFile) return;

    setAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('photo', selectedFile);
      formData.append('context', 'profile_photo');

      const response = await fetch('/api/photo-analysis', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Analyse mislukt');
      }

      const data: PhotoAnalysisResult = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis bij de analyse');
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Goed';
    if (score >= 4) return 'Voldoende';
    return 'Kan beter';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-6 h-6 text-purple-600" />
          <div>
            <h2 className="text-2xl font-bold text-purple-600">AI Foto Analyse</h2>
            <p className="text-sm text-muted-foreground">
              Upload je profielfoto en krijg direct professioneel advies over belichting, compositie en uitstraling
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={startTutorial}
          className="gap-2"
        >
          <HelpCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Tutorial</span>
        </Button>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload je foto</CardTitle>
          <CardDescription>
            JPG, PNG of WebP - Maximum 10MB
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="file"
              id="photo-upload"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <label htmlFor="photo-upload">
              <Button asChild variant="outline">
                <span className="cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  Selecteer foto
                </span>
              </Button>
            </label>

            {selectedFile && (
              <span className="text-sm text-muted-foreground">
                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
              </span>
            )}
          </div>

          {previewUrl && (
            <div className="space-y-4">
              <div className="relative w-full max-w-md mx-auto">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full rounded-lg border shadow-sm"
                />
              </div>

              <Button
                onClick={analyzePhoto}
                disabled={analyzing}
                className="w-full max-w-md mx-auto block"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Foto analyseren...
                  </>
                ) : (
                  <>
                    <Camera className="mr-2 h-4 w-4" />
                    Analyseer deze foto
                  </>
                )}
              </Button>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {/* Overall Score Card */}
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                Profielfoto Analyse Resultaat
              </CardTitle>
              <div className="space-y-2">
                <div className={`text-5xl font-bold ${getScoreColor(result.overall_score)}`}>
                  {result.overall_score.toFixed(1)}/10
                </div>
                <div className={`text-lg font-semibold ${getScoreColor(result.overall_score)}`}>
                  {getScoreLabel(result.overall_score)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {result.overall_score >= 8 ? 'Uitstekend! Deze foto heeft hoog swipe potentieel' :
                   result.overall_score >= 6 ? 'Goed, maar er is ruimte voor verbetering' :
                   'Deze foto heeft verbeterpunten nodig voor optimaal dating succes'}
                </p>
              </div>
            </CardHeader>
          </Card>

          {/* Detailed Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>📊 Gedetailleerde Analyse</CardTitle>
              <CardDescription>
                Uitgebreide beoordeling van de vier belangrijkste aspecten
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(result.analysis).map(([key, value]) => (
                  <div key={key} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-base">
                        {key === 'lighting' && '💡 Belichting'}
                        {key === 'composition' && '🎨 Compositie'}
                        {key === 'authenticity' && '✨ Authenticiteit'}
                        {key === 'facial_expression' && '😊 Gezichtsuitdrukking'}
                      </h4>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getScoreColor(value.score)}`}>
                          {value.score.toFixed(1)}/10
                        </div>
                        <div className={`text-xs ${getScoreColor(value.score)}`}>
                          {value.score >= 8 ? 'Uitstekend' :
                           value.score >= 6 ? 'Goed' :
                           value.score >= 4 ? 'Voldoende' : 'Verbetering nodig'}
                        </div>
                      </div>
                    </div>

                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-sm leading-relaxed">{value.feedback}</p>
                    </div>

                    {/* Progress bar for visual feedback */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          value.score >= 8 ? 'bg-green-500' :
                          value.score >= 6 ? 'bg-yellow-500' :
                          value.score >= 4 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${(value.score / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actionable Tips */}
          <Card>
            <CardHeader>
              <CardTitle>💡 Concrete Verbeterpunten</CardTitle>
              <CardDescription>
                Specifieke tips om je foto te optimaliseren voor dating apps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.tips.map((tip, index) => (
                  <div key={index} className={`p-4 rounded-lg border-l-4 ${
                    tip.includes('✅') ? 'border-l-green-500 bg-green-50' :
                    tip.includes('❌') ? 'border-l-red-500 bg-red-50' :
                    tip.includes('💡') ? 'border-l-blue-500 bg-blue-50' :
                    'border-l-yellow-500 bg-yellow-50'
                  }`}>
                    <p className="text-sm font-medium leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Professional Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>🎯 Professionele Aanbevelingen</CardTitle>
              <CardDescription>
                Concrete suggesties voor betere dating foto resultaten
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3 text-primary">📐 Alternatieve Foto Hoeken</h4>
                <div className="space-y-2">
                  {result.suggestions.alternative_angles.map((angle, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <span className="text-primary font-bold mt-0.5">{index + 1}.</span>
                      <p className="text-sm leading-relaxed">{angle}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-primary">🖼️ Achtergrond & Setting Advies</h4>
                <div className="space-y-2">
                  {result.suggestions.background.map((bg, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <span className="text-primary font-bold mt-0.5">{index + 1}.</span>
                      <p className="text-sm leading-relaxed">{bg}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg border border-primary/20">
                <h4 className="font-semibold mb-3 text-primary flex items-center gap-2">
                  🎯 Overall Professioneel Advies
                </h4>
                <p className="text-sm leading-relaxed font-medium">{result.suggestions.overall}</p>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle>🚀 Volgende Stappen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                  <p className="text-sm">Pas de concrete tips toe op je huidige foto</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                  <p className="text-sm">Maak nieuwe foto's met de aanbevolen composities</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                  <p className="text-sm">Test je verbeterde foto's opnieuw voor validatie</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">4</span>
                  <p className="text-sm">Voeg variatie toe met hobby/interesse foto's</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setResult(null);
                setSelectedFile(null);
                setPreviewUrl(null);
              }}
            >
              🔄 Analyseer Nieuwe Foto
            </Button>
            <Button
              className="flex-1"
              onClick={() => window.open('/dashboard?tab=profiel-coach', '_self')}
            >
              📝 Naar Profiel Coach
            </Button>
          </div>
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">ℹ️ Hoe werkt het?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• AI analyseert je foto op 4 aspecten: belichting, compositie, authenticiteit en gezichtsuitdrukking</p>
          <p>• Je krijgt een score van 0-10 per aspect + overall score</p>
          <p>• Concrete, toepasbare tips om je foto te verbeteren</p>
          <p>• Alle analyses blijven privé en worden niet opgeslagen</p>
          <p>• Rate limit: 10 analyses per uur</p>
        </CardContent>
      </Card>

      {/* Tutorial Modal */}
      <TutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        toolId="photo-analysis"
        toolName="AI Foto Analyse"
        steps={[
          {
            title: "Welkom bij AI Foto Analyse! 📸",
            content: "Deze tool gebruikt geavanceerde AI om je profielfoto's te analyseren op 4 cruciale aspecten: belichting, compositie, authenticiteit en gezichtsuitdrukking. Ontvang professionele feedback om je dating succes te maximaliseren.",
            tips: [
              "Upload alleen recente, duidelijke foto's",
              "Test verschillende soorten foto's (portret, actie, hobby)",
              "Gebruik de feedback om systematisch te verbeteren"
            ]
          },
          {
            title: "Foto Upload & Validatie",
            content: "Selecteer je beste profielfoto om te analyseren. De tool accepteert JPG, PNG en WebP bestanden tot 10MB. Zorg voor een duidelijke, goed belichte foto voor de beste resultaten.",
            action: {
              text: "Klik op 'Selecteer foto' om een foto te uploaden.",
              target: "label[for='photo-upload']"
            },
            tips: [
              "Gebruik een recente foto (maximaal 6 maanden oud)",
              "Zorg voor goede belichting - natuurlijk licht is het beste",
              "Sta recht voor de camera met een ontspannen houding"
            ]
          },
          {
            title: "De 4 Analyse Aspecten",
            content: "Onze AI beoordeelt je foto op vier wetenschappelijk onderbouwde criteria die het meeste invloed hebben op dating app succes: belichting, compositie, authenticiteit en gezichtsuitdrukking.",
            tips: [
              "Belichting: Natuurlijk licht scoort het hoogst",
              "Compositie: Gezicht moet 60-70% van de foto vullen",
              "Authenticiteit: Wees jezelf - geforceerde poses scoren lager",
              "Gezichtsuitdrukking: Ontspannen glimlach werkt het beste"
            ]
          },
          {
            title: "Begrijp je Scores",
            content: "Elk aspect krijgt een score van 0-10. Een totaalscore van 8+ betekent excellent dating potentieel. Scores van 6-8 zijn goed maar verbeterbaar. Onder de 6 vraagt om significante aanpassingen.",
            tips: [
              "8-10: Uitstekend - deze foto heeft hoog swipe potentieel",
              "6-8: Goed - kleine verbeteringen kunnen veel verschil maken",
              "4-6: Voldoende - concrete actiepunten nodig",
              "0-4: Verbetering nodig - overweeg een nieuwe foto"
            ]
          },
          {
            title: "Concrete Verbeterpunten Toepassen",
            content: "Na de analyse krijg je specifieke, actiegerichte tips. Deze zijn wetenschappelijk onderbouwd en bewezen effectief voor dating apps. Pas ze systematisch toe voor maximale verbetering.",
            tips: [
              "Begin met de hoogste impact verbeteringen eerst",
              "Test verbeterde foto's opnieuw voor validatie",
              "Gebruik verschillende achtergronden en poses",
              "Voeg variatie toe met hobby/interesse foto's"
            ]
          },
          {
            title: "Professionele Aanbevelingen",
            content: "Naast scores en tips krijg je professionele suggesties voor alternatieve composities en achtergrond ideeën. Deze zijn specifiek afgestemd op Nederlandse dating cultuur en voorkeuren.",
            tips: [
              "Nederlandse daters waarderen authenticiteit boven perfectie",
              "Natuurlijke lichtomstandigheden scoren hoger dan studio",
              "Hobby-foto's laten je persoonlijkheid zien",
              "Variatie in poses voorkomt 'saai' gevoel"
            ]
          },
          {
            title: "Strategie voor Succes 💡",
            content: "Gebruik deze tool strategisch: Analyseer je huidige beste foto, pas verbeteringen toe, test opnieuw, en bouw een portfolio van sterke foto's op. Succesvolle dating is een data-gedreven proces!",
            tips: [
              "Analyseer elke nieuwe foto voordat je hem gebruikt",
              "A/B test verschillende stijlen om te zien wat werkt",
              "Track je verbetering over tijd",
              "Combineer met sterke profielteksten voor maximum effect"
            ]
          }
        ]}
        onComplete={completeTutorial}
      />
    </div>
  );
}
