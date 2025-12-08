"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Camera, Sparkles, Send, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useUser } from '@/providers/user-provider';

type FlowStep = 'intro' | 'input' | 'analyzing' | 'results';

export function ZelfbeeldFlow() {
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState<FlowStep>('intro');
  const [bioText, setBioText] = useState('');
  const [chatExample, setChatExample] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleStart = () => {
    setCurrentStep('input');
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      alert('Je moet ingelogd zijn om deze tool te gebruiken.');
      return;
    }

    setLoading(true);
    setCurrentStep('analyzing');

    try {
      // Start assessment
      const startResponse = await fetch('/api/zelfbeeld', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          userId: user.id,
          content: { bioText, chatExample, photoUrls }
        })
      });

      const startData = await startResponse.json();

      if (!startData.success) {
        throw new Error(startData.message || 'Failed to start assessment');
      }

      // Analyze content
      const analyzeResponse = await fetch('/api/zelfbeeld', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze',
          assessmentId: startData.assessmentId,
          content: { bioText, chatExample, photoUrls }
        })
      });

      const analyzeData = await analyzeResponse.json();

      if (!analyzeData.success) {
        throw new Error(analyzeData.message || 'Failed to analyze');
      }

      setResults(analyzeData);
      setCurrentStep('results');
    } catch (error: any) {
      console.error('Error in zelfbeeld assessment:', error);
      alert(`Error: ${error.message}`);
      setCurrentStep('input');
    } finally {
      setLoading(false);
    }
  };

  if (currentStep === 'intro') {
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto">
            <Camera className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Zelfbeeld & Eerste Indruk
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            Ontdek hoe je écht overkomt op potentiële matches en optimaliseer je profiel voor maximale impact
          </p>
        </div>

        <Card className="border-2 border-purple-100">
          <CardContent className="p-8 space-y-4">
            <h3 className="font-semibold text-lg mb-4">Wat krijg je:</h3>
            <div className="space-y-3">
              {[
                'AI-analyse van je huidige profiel en eerste indruk',
                '12 Vibe Meters die je energie-handtekening tonen',
                'Zelfbeeld vs Realiteit vergelijking',
                'Concrete optimalisatie tips voor bio, foto\'s en communicatie',
                'Nieuwe bio varianten die beter passen bij je authentieke vibe',
                'Eerste 48-uur strategie voor maximale impact'
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handleStart}
          className="w-full h-12 text-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        >
          Start Analyse
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    );
  }

  if (currentStep === 'input') {
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Deel je profiel content</h2>
          <p className="text-gray-600">
            Hoe meer je deelt, hoe nauwkeuriger de analyse wordt
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bio Tekst</CardTitle>
            <p className="text-sm text-gray-600">Je huidige profiel bio</p>
          </CardHeader>
          <CardContent>
            <Textarea
              value={bioText}
              onChange={(e) => setBioText(e.target.value)}
              placeholder="Bijvoorbeeld: 'Avontuurlijk en nieuwsgierig. Houdt van diepe gesprekken over het leven...'"
              rows={4}
              className="resize-none"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chat Voorbeeld</CardTitle>
            <p className="text-sm text-gray-600">Een representatief voorbeeld van hoe je chat (optioneel)</p>
          </CardHeader>
          <CardContent>
            <Textarea
              value={chatExample}
              onChange={(e) => setChatExample(e.target.value)}
              placeholder="Bijvoorbeeld een eerste bericht dat je zou sturen..."
              rows={3}
              className="resize-none"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Foto URLs (optioneel)</CardTitle>
            <p className="text-sm text-gray-600">Plak links naar je profiel foto's</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {[0, 1, 2].map((idx) => (
              <Input
                key={idx}
                value={photoUrls[idx] || ''}
                onChange={(e) => {
                  const newUrls = [...photoUrls];
                  newUrls[idx] = e.target.value;
                  setPhotoUrls(newUrls.filter(url => url !== ''));
                }}
                placeholder={`Foto ${idx + 1} URL`}
              />
            ))}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => setCurrentStep('intro')}
            className="flex-1"
          >
            Terug
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!bioText.trim()}
            className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            Analyseer
            <Sparkles className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  if (currentStep === 'analyzing') {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center space-y-6">
            <div className="relative mx-auto w-24 h-24">
              <div className="animate-spin rounded-full h-24 w-24 border-4 border-gray-200 border-t-purple-500"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-purple-500 animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">AI analyseert je profiel...</h3>
              <p className="text-gray-600">Dit kan 15-20 seconden duren</p>
            </div>
            <Progress value={66} className="w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === 'results' && results) {
    const { analysis, vibeMeters } = results;

    return (
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-2">
          <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
            Je Zelfbeeld Profiel
          </Badge>
          <h2 className="text-3xl font-bold">{analysis?.firstImpression?.personaTitle || 'Je Profiel Analyse'}</h2>
          <p className="text-gray-600">{analysis?.firstImpression?.instant}</p>
        </div>

        {/* Vibe Meters */}
        <Card>
          <CardHeader>
            <CardTitle>Je Energie-Handtekening</CardTitle>
            <p className="text-sm text-gray-600">12 dimensies van je dating vibe</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {vibeMeters && Object.entries(vibeMeters).map(([key, value]: [string, any]) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="capitalize font-medium">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="text-purple-600 font-semibold">{value}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Eerste Indruk */}
        {analysis?.firstImpression?.thirtySecond && (
          <Card>
            <CardHeader>
              <CardTitle>Eerste 30 Seconden Indruk</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {analysis.firstImpression.thirtySecond.map((item: string, idx: number) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-purple-600">{idx + 1}</span>
                  </div>
                  <p className="text-gray-700">{item}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Zelfbeeld vs Realiteit */}
        {analysis?.selfVsReality && (
          <Card>
            <CardHeader>
              <CardTitle>Zelfbeeld vs Hoe Je Overkomt</CardTitle>
              <Badge variant={
                analysis.selfVsReality.discrepancyLevel === 'perfect_aligned' ? 'default' :
                analysis.selfVsReality.discrepancyLevel === 'licht_verschoven' ? 'secondary' :
                'destructive'
              }>
                {analysis.selfVsReality.discrepancyLevel.replace('_', ' ')}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Hoe je jezelf ziet:</h4>
                <p className="text-gray-700">{analysis.selfVsReality.selfImage}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Hoe je werkelijk overkomt:</h4>
                <p className="text-gray-700">{analysis.selfVsReality.actualImpression}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Nieuwe Bio Varianten */}
        {analysis?.nieuweBioVarianten && analysis.nieuweBioVarianten.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Geoptimaliseerde Bio Varianten</CardTitle>
              <p className="text-sm text-gray-600">Kies de variant die het beste bij je past</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis.nieuweBioVarianten.map((bio: string, idx: number) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <Badge className="mb-2">Variant {idx + 1}</Badge>
                      <p className="text-gray-700">{bio}</p>
                    </div>
                    <Button size="sm" variant="ghost">Kopieer</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Button
          onClick={() => {
            setBioText('');
            setChatExample('');
            setPhotoUrls([]);
            setResults(null);
            setCurrentStep('intro');
          }}
          variant="outline"
          className="w-full"
        >
          Nieuwe Analyse
        </Button>
      </div>
    );
  }

  return null;
}
