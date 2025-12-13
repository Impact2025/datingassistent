"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { PhotoUploader } from '@/components/ui/photo-uploader';
import { VibeMeter } from './vibe-meter';
import {
  Camera,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Users,
  TrendingUp,
  Clock,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { useUser } from '@/providers/user-provider';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

type FlowStep = 'intro' | 'input' | 'analyzing' | 'results';

interface AnalysisResults {
  success: boolean;
  analysis: {
    firstImpression?: {
      personaTitle?: string;
      instant?: string;
      thirtySecond?: string[];
    };
    selfVsReality?: {
      discrepancyLevel: string;
      selfImage: string;
      actualImpression: string;
    };
    nieuweBioVarianten?: string[];
  };
  vibeMeters?: Record<string, number>;
}

const VIBE_METER_CONFIG: Record<string, { label: string; tips: string[]; examples: Array<{ before: string; after: string }> }> = {
  playfulness: {
    label: 'Speelsheid',
    tips: [
      'Voeg humor toe zonder overdreven te zijn',
      'Gebruik emoji\'s strategisch (max 2 per zin)',
      'Deel een grappige anekdote of quirky hobby'
    ],
    examples: [{
      before: 'Ik hou van reizen.',
      after: 'Verzamel rare koelkastmagneetjes van elke stad 🧲'
    }]
  },
  authenticity: {
    label: 'Authenticiteit',
    tips: [
      'Wees specifiek over je interesses',
      'Deel iets persoonlijks dat jou uniek maakt',
      'Vermijd clichés zoals "avontuurlijk"'
    ],
    examples: [{
      before: 'Ik ben avontuurlijk en spontaan.',
      after: 'Laatst om 04:00 naar de zonsopkomst gefietst. Vergat m\'n jas.'
    }]
  },
  confidence: {
    label: 'Zelfvertrouwen',
    tips: [
      'Gebruik actieve taal ("Ik doe X" vs "Ik probeer X")',
      'Wees direct over wat je zoekt',
      'Toon je passies zonder excuses'
    ],
    examples: [{
      before: 'Ik denk dat ik best leuk ben...',
      after: 'Maak de beste carbonara die je ooit proefde. Uitdaging? 🍝'
    }]
  },
  approachability: {
    label: 'Benaderbaarheid',
    tips: [
      'Eindig met een vraag of gespreksopener',
      'Gebruik vriendelijke, uitnodigende taal',
      'Toon openheid voor nieuwe ervaringen'
    ],
    examples: [{
      before: 'Ik ben kieskeurig.',
      after: 'Op zoek naar iemand die 90s muziek waardeert. Jouw favoriet? 🎵'
    }]
  },
  depth: {
    label: 'Diepgang',
    tips: [
      'Deel een passie waar je écht enthousiast over bent',
      'Laat zien dat je nadenkt over grote en kleine dingen',
      'Wees concreet over je waarden'
    ],
    examples: [{
      before: 'Ik hou van diepe gesprekken.',
      after: 'Fascinatie voor waarom we dromen. En waarom katten altijd op je laptop gaan zitten.'
    }]
  },
  mystery: {
    label: 'Mysterie',
    tips: [
      'Vertel niet alles - laat ruimte voor nieuwsgierigheid',
      'Hint naar interessante ervaringen',
      'Balanceer tussen open en intrigerend'
    ],
    examples: [{
      before: 'Ik heb 3 jaar in Japan gewoond en werk nu als arts.',
      after: 'Heb ooit de beste ramen van Tokio gegeten. Nu zoek ik die in Nederland.'
    }]
  }
};

export function ZelfbeeldFlow({ onClose }: { onClose?: () => void }) {
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState<FlowStep>('intro');
  const [bioText, setBioText] = useState('');
  const [chatExample, setChatExample] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [progressStage, setProgressStage] = useState(0);
  const [progressValue, setProgressValue] = useState(0);

  const progressStages = [
    { label: 'Bio analyseren...', value: 25 },
    { label: 'Foto\'s verwerken...', value: 50 },
    { label: 'Vibe meters berekenen...', value: 75 },
    { label: 'Rapport samenstellen...', value: 100 }
  ];

  // Restore draft
  useEffect(() => {
    const draft = localStorage.getItem('zelfbeeld_draft');
    if (draft) {
      try {
        const data = JSON.parse(draft);
        const ageMinutes = (Date.now() - data.timestamp) / 1000 / 60;
        if (ageMinutes < 60) {
          if (data.bioText) setBioText(data.bioText);
          if (data.chatExample) setChatExample(data.chatExample);
          if (data.photos) setPhotos(data.photos);
        }
      } catch (e) {
        console.error('Failed to restore draft:', e);
      }
    }
  }, []);

  // Save draft
  useEffect(() => {
    if (bioText || chatExample || photos.length > 0) {
      localStorage.setItem('zelfbeeld_draft', JSON.stringify({
        bioText,
        chatExample,
        photos,
        timestamp: Date.now()
      }));
    }
  }, [bioText, chatExample, photos]);

  // Progress animation
  useEffect(() => {
    if (currentStep === 'analyzing') {
      setProgressStage(0);
      setProgressValue(0);

      const interval = setInterval(() => {
        setProgressStage((prev) => {
          const next = prev + 1;
          if (next >= progressStages.length) {
            clearInterval(interval);
            return prev;
          }
          return next;
        });
      }, 4000);

      const smoothProgress = setInterval(() => {
        setProgressValue((prev) => {
          const targetValue = progressStages[progressStage]?.value || 0;
          if (prev < targetValue) {
            return Math.min(prev + 1, targetValue);
          }
          return prev;
        });
      }, 40);

      return () => {
        clearInterval(interval);
        clearInterval(smoothProgress);
      };
    }
  }, [currentStep, progressStage]);

  const handleStart = () => setCurrentStep('input');
  const handleBack = () => currentStep === 'input' && setCurrentStep('intro');

  const handleSubmit = async () => {
    if (!user?.id) {
      alert('Je moet ingelogd zijn om deze tool te gebruiken.');
      return;
    }

    setLoading(true);
    setCurrentStep('analyzing');

    try {
      const startResponse = await fetch('/api/zelfbeeld', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          userId: user.id,
          content: { bioText, chatExample, photoUrls: photos }
        })
      });

      const startData = await startResponse.json();
      if (!startData.success) throw new Error(startData.message || 'Failed to start');

      const analyzeResponse = await fetch('/api/zelfbeeld', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze',
          assessmentId: startData.assessmentId,
          content: { bioText, chatExample, photoUrls: photos }
        })
      });

      const analyzeData = await analyzeResponse.json();
      if (!analyzeData.success) throw new Error(analyzeData.message || 'Failed to analyze');

      setResults(analyzeData);
      setCurrentStep('results');
      localStorage.removeItem('zelfbeeld_draft');
    } catch (error: any) {
      console.error('Error:', error);
      alert(`Er ging iets mis: ${error.message}. Je invoer is bewaard.`);
      setCurrentStep('input');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const resetFlow = () => {
    setBioText('');
    setChatExample('');
    setPhotos([]);
    setResults(null);
    setCurrentStep('intro');
    localStorage.removeItem('zelfbeeld_draft');
  };

  // INTRO
  if (currentStep === 'intro') {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Camera className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Profiel Analyse</h2>
            <p className="text-gray-600">
              Ontdek hoe je overkomt en optimaliseer je profiel
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Users, label: '1.2K+', value: 'analyses' },
              { icon: TrendingUp, label: '+67%', value: 'matches' },
              { icon: Clock, label: '~5 min', value: 'invultijd' }
            ].map((stat, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-3 text-center">
                <stat.icon className="w-5 h-5 text-pink-500 mx-auto mb-1" />
                <div className="text-sm font-semibold text-gray-900">{stat.label}</div>
                <div className="text-xs text-gray-500">{stat.value}</div>
              </div>
            ))}
          </div>

          <Card className="border border-gray-200">
            <CardContent className="p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Je krijgt:</h3>
              <div className="space-y-2">
                {[
                  '6 Vibe Meters met je energie-profiel',
                  'Zelfbeeld vs Realiteit analyse',
                  '3 Geoptimaliseerde bio varianten',
                  'Concrete verbeterpunten',
                  'Voor/na voorbeelden'
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-pink-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleStart}
            className="w-full h-12 bg-pink-500 hover:bg-pink-600"
          >
            Start Analyse
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // INPUT
  if (currentStep === 'input') {
    const bioLength = bioText.length;
    const bioStatus = bioLength < 50 ? 'short' : bioLength < 150 ? 'good' : 'great';
    const bioValid = bioLength >= 50;

    return (
      <div className="p-6">
        <div className="max-w-3xl mx-auto space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-gray-900">Deel je profiel</h3>
              <Badge variant="outline" className="text-xs">Stap 1/2</Badge>
            </div>
            <p className="text-sm text-gray-600">Hoe meer je deelt, hoe beter de analyse</p>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Bio Tekst</CardTitle>
                <Badge variant="destructive" className="text-xs">Verplicht</Badge>
              </div>
              <p className="text-xs text-gray-500">Je huidige of gewenste profiel bio</p>
            </CardHeader>
            <CardContent className="space-y-2">
              <Textarea
                value={bioText}
                onChange={(e) => setBioText(e.target.value)}
                placeholder="Bijvoorbeeld: Softwareontwikkelaar die houdt van koken. Zoek iemand die mijn passie voor documentaires deelt..."
                rows={5}
                className={cn(
                  "resize-none text-sm",
                  bioStatus === 'short' && "border-orange-300 focus:border-orange-400",
                  bioStatus === 'good' && "border-blue-300 focus:border-blue-400",
                  bioStatus === 'great' && "border-green-300 focus:border-green-400"
                )}
              />
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  {bioStatus === 'short' && (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
                      <span className="text-orange-600">Voeg nog {50 - bioLength} karakters toe</span>
                    </>
                  )}
                  {bioStatus === 'good' && (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-blue-600">Goede lengte</span>
                    </>
                  )}
                  {bioStatus === 'great' && (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-green-600">Perfect</span>
                    </>
                  )}
                </div>
                <span className={cn(
                  "font-medium",
                  bioStatus === 'short' && "text-orange-600",
                  bioStatus === 'good' && "text-blue-600",
                  bioStatus === 'great' && "text-green-600"
                )}>
                  {bioLength}/500
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Chat Voorbeeld</CardTitle>
                <Badge variant="outline" className="text-xs">Optioneel</Badge>
              </div>
              <p className="text-xs text-gray-500">Een voorbeeld van hoe je chat</p>
            </CardHeader>
            <CardContent>
              <Textarea
                value={chatExample}
                onChange={(e) => setChatExample(e.target.value)}
                placeholder="Bijvoorbeeld: Hey! Zag dat je van wandelen houdt. Ken je de Veluwe?"
                rows={3}
                className="resize-none text-sm"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Profiel Foto's</CardTitle>
                <Badge variant="outline" className="text-xs">Optioneel</Badge>
              </div>
              <p className="text-xs text-gray-500">Upload tot 3 foto's</p>
            </CardHeader>
            <CardContent>
              <PhotoUploader
                maxFiles={3}
                value={photos}
                onChange={setPhotos}
              />
            </CardContent>
          </Card>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Terug
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!bioValid || loading}
              className="flex-1 bg-pink-500 hover:bg-pink-600"
            >
              Analyseer
              <Sparkles className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ANALYZING
  if (currentStep === 'analyzing') {
    const currentStage = progressStages[progressStage] || progressStages[0];

    return (
      <div className="flex items-center justify-center p-12">
        <Card className="w-full max-w-md border border-gray-200">
          <CardContent className="p-10 text-center space-y-6">
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-gray-100 border-t-pink-500"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-pink-500 animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {currentStage.label}
              </h3>
              <p className="text-sm text-gray-600">Dit duurt ~20 seconden</p>
            </div>
            <div className="space-y-2">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-pink-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressValue}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="text-sm font-medium text-pink-600">{progressValue}%</div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {progressStages.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1 rounded-full",
                    i <= progressStage ? "bg-pink-500" : "bg-gray-200"
                  )}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // RESULTS
  if (currentStep === 'results' && results) {
    const { analysis, vibeMeters } = results;

    return (
      <div className="p-6 pb-12">
        <div className="max-w-5xl mx-auto space-y-5">
          <div className="text-center space-y-2">
            <Badge className="bg-pink-500">Je Analyse</Badge>
            <h2 className="text-2xl font-bold text-gray-900">
              {analysis?.firstImpression?.personaTitle || 'Je Resultaten'}
            </h2>
            <p className="text-sm text-gray-600">
              {analysis?.firstImpression?.instant || 'Ontdek hoe je overkomt'}
            </p>
          </div>

          {vibeMeters && Object.keys(vibeMeters).length > 0 && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="w-5 h-5 text-pink-500" />
                  Je Vibe Profiel
                </CardTitle>
                <p className="text-xs text-gray-500">6 dimensies die bepalen hoe je overkomt</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(vibeMeters).map(([key, value]) => {
                  const config = VIBE_METER_CONFIG[key];
                  if (!config) return null;
                  return (
                    <VibeMeter
                      key={key}
                      label={config.label}
                      value={value as number}
                      benchmark={{ average: 55, top10: 78 }}
                      tips={config.tips}
                      examples={config.examples}
                    />
                  );
                })}
              </CardContent>
            </Card>
          )}

          {analysis?.firstImpression?.thirtySecond && (
            <Card className="border-blue-100 bg-blue-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Eerste 30 Seconden</CardTitle>
                <p className="text-xs text-gray-600">Dit denken matches direct</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {analysis.firstImpression.thirtySecond.map((item: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-blue-600">{i + 1}</span>
                    </div>
                    <p className="text-gray-700">{item}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {analysis?.selfVsReality && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Zelfbeeld vs Realiteit</CardTitle>
                  <Badge
                    variant={
                      analysis.selfVsReality.discrepancyLevel === 'perfect_aligned' ? 'default' :
                      analysis.selfVsReality.discrepancyLevel === 'licht_verschoven' ? 'secondary' :
                      'destructive'
                    }
                    className="text-xs"
                  >
                    {analysis.selfVsReality.discrepancyLevel.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1.5 flex items-center gap-2">
                    <div className="w-2 h-2 bg-pink-500 rounded-full" />
                    Hoe je jezelf ziet
                  </h4>
                  <p className="text-gray-700">{analysis.selfVsReality.selfImage}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1.5 flex items-center gap-2">
                    <div className="w-2 h-2 bg-pink-600 rounded-full" />
                    Hoe je overkomt
                  </h4>
                  <p className="text-gray-700">{analysis.selfVsReality.actualImpression}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {analysis?.nieuweBioVarianten && analysis.nieuweBioVarianten.length > 0 && (
            <Card className="border-green-100 bg-green-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Geoptimaliseerde Bio's</CardTitle>
                <p className="text-xs text-gray-600">Kies de variant die past of combineer elementen</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysis.nieuweBioVarianten.map((bio: string, i: number) => (
                  <div key={i} className="p-4 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <Badge className="bg-green-600 text-xs">Variant {i + 1}</Badge>
                        <p className="text-sm text-gray-700">{bio}</p>
                      </div>
                      <Button
                        size="sm"
                        variant={copiedIndex === i ? "default" : "outline"}
                        onClick={() => copyToClipboard(bio, i)}
                        className={cn(
                          "flex-shrink-0 text-xs h-8",
                          copiedIndex === i && "bg-green-600 hover:bg-green-700"
                        )}
                      >
                        {copiedIndex === i ? (
                          <>
                            <Check className="w-3 h-3 mr-1.5" />
                            Gekopieerd
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 mr-1.5" />
                            Kopieer
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3 pt-3">
            <Button
              variant="outline"
              onClick={resetFlow}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Nieuwe Analyse
            </Button>
            {onClose && (
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Sluiten
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
