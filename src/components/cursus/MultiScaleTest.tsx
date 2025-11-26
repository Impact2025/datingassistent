'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { CheckCircle, ArrowRight, Sparkles, Star } from 'lucide-react';

interface TestVraag {
  id: string;
  tekst: string;
  schaal: string;
}

interface AntwoordOptie {
  waarde: number;
  label: string;
}

interface MultiScaleTestProps {
  titel: string;
  beschrijving: string;
  vragen: TestVraag[];
  antwoordOpties: AntwoordOptie[];
  irisContext?: string;
  onComplete: (resultaten: any) => void;
  onPrevious?: () => void;
}

interface TestResultaat {
  schaalScores: Record<string, number>;
  topScores: Array<{ schaal: string; score: number; rank: number }>;
  visualData: Array<{ schaal: string; score: number; percentage: number }>;
  interpretatie: {
    top2: string[];
    beschrijvingen: Record<string, any>;
  };
}

export function MultiScaleTest({
  titel,
  beschrijving,
  vragen,
  antwoordOpties,
  irisContext,
  onComplete,
  onPrevious
}: MultiScaleTestProps) {
  const [huidigeVraag, setHuidigeVraag] = useState(0);
  const [antwoorden, setAntwoorden] = useState<Record<string, number>>({});
  const [isCompleet, setIsCompleet] = useState(false);
  const [resultaten, setResultaten] = useState<TestResultaat | null>(null);

  const voortgang = ((huidigeVraag + 1) / vragen.length) * 100;
  const huidigeVraagData = vragen[huidigeVraag];
  const alleVragenBeantwoord = Object.keys(antwoorden).length === vragen.length;

  // Controleer of alle vragen beantwoord zijn
  useEffect(() => {
    if (Object.keys(antwoorden).length === vragen.length) {
      berekenResultaten();
    }
  }, [antwoorden]);

  const handleAntwoordChange = (vraagId: string, waarde: number[]) => {
    setAntwoorden(prev => ({
      ...prev,
      [vraagId]: waarde[0]
    }));
  };

  const handleVolgende = () => {
    if (huidigeVraag < vragen.length - 1) {
      setHuidigeVraag(prev => prev + 1);
    }
  };

  const handleVorige = () => {
    if (huidigeVraag > 0) {
      setHuidigeVraag(prev => prev - 1);
    }
  };

  const berekenResultaten = () => {
    // Groepeer antwoorden per schaal en bereken gemiddelden
    const schaalScores: Record<string, number[]> = {};
    const uniekeSchalen = [...new Set(vragen.map(v => v.schaal))];

    uniekeSchalen.forEach(schaal => {
      schaalScores[schaal] = [];
    });

    // Verzamel scores per schaal
    vragen.forEach(vraag => {
      const antwoord = antwoorden[vraag.id];
      if (antwoord !== undefined) {
        schaalScores[vraag.schaal].push(antwoord);
      }
    });

    // Bereken gemiddelden per schaal
    const gemiddeldeScores: Record<string, number> = {};
    Object.entries(schaalScores).forEach(([schaal, scores]) => {
      const gemiddelde = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      gemiddeldeScores[schaal] = Math.round(gemiddelde * 10) / 10;
    });

    // Bepaal top scores
    const gesorteerdeScores = Object.entries(gemiddeldeScores)
      .map(([schaal, score]) => ({ schaal, score }))
      .sort((a, b) => b.score - a.score);

    const topScores = gesorteerdeScores.map((item, index) => ({
      ...item,
      rank: index + 1
    }));

    // Visual data voor charts
    const visualData = Object.entries(gemiddeldeScores).map(([schaal, score]) => ({
      schaal,
      score,
      percentage: (score / 5) * 100 // Aannemende max score van 5
    }));

    const resultaten: TestResultaat = {
      schaalScores: gemiddeldeScores,
      topScores,
      visualData,
      interpretatie: {
        top2: topScores.slice(0, 2).map(item => item.schaal),
        beschrijvingen: getBeschrijvingen(gemiddeldeScores)
      }
    };

    setResultaten(resultaten);
    setIsCompleet(true);
  };

  const getBeschrijvingen = (scores: Record<string, number>) => {
    const beschrijvingen: Record<string, any> = {
      intellectueel: {
        titel: 'Intellectueel Magnetisme',
        icon: '🧠',
        inDating: 'Je gesprekken gaan dieper dan small talk. Matches blijven praten omdat je interessant bent.',
        niveau: scores.intellectueel >= 4 ? 'hoog' : scores.intellectueel >= 3 ? 'gemiddeld' : 'laag'
      },
      emotioneel: {
        titel: 'Emotioneel Magnetisme',
        icon: '💝',
        inDating: 'Dates voelen zich veilig en gezien bij jou. Je creëert intimiteit sneller dan gemiddeld.',
        niveau: scores.emotioneel >= 4 ? 'hoog' : scores.emotioneel >= 3 ? 'gemiddeld' : 'laag'
      },
      energie: {
        titel: 'Energie Magnetisme',
        icon: '⚡',
        inDating: 'Je profiel springt eruit. Dates voelen zich geënergiseerd na een afspraak met jou.',
        niveau: scores.energie >= 4 ? 'hoog' : scores.energie >= 3 ? 'gemiddeld' : 'laag'
      },
      stabiliteit: {
        titel: 'Stabiliteit Magnetisme',
        icon: '🏔️',
        inDating: 'Je bent een veilige haven. Aantrekkelijk voor mensen die rust zoeken na chaos.',
        niveau: scores.stabiliteit >= 4 ? 'hoog' : scores.stabiliteit >= 3 ? 'gemiddeld' : 'laag'
      },
      mysterie: {
        titel: 'Mysterie Magnetisme',
        icon: '✨',
        inDating: 'Je wekt nieuwsgierigheid. Elke date onthult iets nieuws over je.',
        niveau: scores.mysterie >= 4 ? 'hoog' : scores.mysterie >= 3 ? 'gemiddeld' : 'laag'
      }
    };

    return beschrijvingen;
  };

  if (isCompleet && resultaten) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Resultaten Header */}
        <Card className="text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Jouw Magneetkrachten
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Ontdek wat jou aantrekkelijk maakt in dating. Dit zijn je natuurlijke krachten.
            </p>
          </CardContent>
        </Card>

        {/* Top 2 Highlight */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Star className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl font-bold text-gray-900">Jouw Top 2 Krachten</h2>
              <Star className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {resultaten.interpretatie.top2.map((kracht, index) => {
                const beschrijving = resultaten.interpretatie.beschrijvingen[kracht];
                return (
                  <div key={kracht} className="bg-white rounded-lg p-6 shadow-sm border">
                    <div className="text-4xl mb-2">{beschrijving.icon}</div>
                    <div className="text-lg font-bold text-gray-900 mb-1">
                      #{index + 1} {beschrijving.titel}
                    </div>
                    <Badge variant={beschrijving.niveau === 'hoog' ? 'default' : 'secondary'} className="mb-2">
                      {beschrijving.niveau}
                    </Badge>
                    <p className="text-sm text-gray-600">{beschrijving.inDating}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Alle Scores */}
        <Card>
          <CardHeader>
            <CardTitle>Alle Magneetkrachten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resultaten.visualData.map((item) => {
                const beschrijving = resultaten.interpretatie.beschrijvingen[item.schaal];
                const isTop2 = resultaten.interpretatie.top2.includes(item.schaal);

                return (
                  <div
                    key={item.schaal}
                    className={`p-4 rounded-lg border ${
                      isTop2 ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{beschrijving.icon}</span>
                        <span className="font-medium">{beschrijving.titel}</span>
                        {isTop2 && <Star className="w-4 h-4 text-yellow-500" />}
                      </div>
                      <Badge variant="outline">{item.score}/5</Badge>
                    </div>
                    <Progress value={item.percentage} className="h-2 mb-2" />
                    <p className="text-xs text-gray-600">{beschrijving.inDating}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Complete Button */}
        <Card>
          <CardContent className="pt-6">
            <Button
              onClick={() => onComplete(resultaten)}
              className="w-full bg-[#ff66c4] hover:bg-[#e55bb0] text-white"
              size="lg"
            >
              Resultaten Opslaan & Doorgaan
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{titel}</h2>
              <p className="text-gray-600">{beschrijving}</p>
            </div>
            <Badge variant="secondary">
              {huidigeVraag + 1} / {vragen.length}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Voortgang</span>
              <span>{Math.round(voortgang)}% compleet</span>
            </div>
            <Progress value={voortgang} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Huidige Vraag */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{huidigeVraagData.tekst}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Slider
              value={antwoorden[huidigeVraagData.id] ? [antwoorden[huidigeVraagData.id]] : [3]}
              onValueChange={(value) => handleAntwoordChange(huidigeVraagData.id, value)}
              max={5}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Helemaal niet</span>
              <span>Een beetje</span>
              <span>Gemiddeld</span>
              <span>Behoorlijk</span>
              <span>Zeer sterk</span>
            </div>
          </div>

          {antwoorden[huidigeVraagData.id] && (
            <div className="text-center">
              <Badge variant="outline" className="text-sm">
                Jouw score: {antwoorden[huidigeVraagData.id]}/5
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3">
            {huidigeVraag > 0 && (
              <Button
                variant="outline"
                onClick={handleVorige}
                className="flex-1"
              >
                Vorige Vraag
              </Button>
            )}

            <Button
              onClick={handleVolgende}
              disabled={!antwoorden[huidigeVraagData.id]}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              {huidigeVraag === vragen.length - 1 ? (
                <>
                  Bekijk Resultaten
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Volgende Vraag
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          {!alleVragenBeantwoord && (
            <p className="text-center text-sm text-gray-500 mt-4">
              Beantwoord alle vragen om je resultaten te zien
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}