'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, Target, AlertTriangle, ThumbsUp } from 'lucide-react';

interface Pilaar {
  id: string;
  naam: string;
  beschrijving: string;
  uitersten: {
    laag: string;
    hoog: string;
  };
}

interface PilarenScoreProps {
  titel: string;
  beschrijving: string;
  pilaren: Pilaar[];
  irisContext?: string;
  onComplete: (resultaten: any) => void;
  onPrevious?: () => void;
}

interface TestResultaat {
  scores: Record<string, number>;
  totaalScore: number;
  classificatie: string;
  kleur: string;
  advies: string;
  irisFeedback: string;
}

export function PilarenScore({
  titel,
  beschrijving,
  pilaren,
  irisContext,
  onComplete,
  onPrevious
}: PilarenScoreProps) {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [isCompleet, setIsCompleet] = useState(false);
  const [resultaten, setResultaten] = useState<TestResultaat | null>(null);

  // Initialize scores with default values
  useEffect(() => {
    const initialScores: Record<string, number> = {};
    pilaren.forEach(pilaar => {
      initialScores[pilaar.id] = 5; // Start in the middle
    });
    setScores(initialScores);
  }, [pilaren]);

  // Check if all pilaren are scored
  useEffect(() => {
    const alleBeoordeeld = pilaren.every(pilaar => scores[pilaar.id] !== undefined);
    if (alleBeoordeeld && Object.keys(scores).length === pilaren.length) {
      berekenResultaten();
    }
  }, [scores, pilaren]);

  const handleScoreChange = (pilaarId: string, waarde: number[]) => {
    setScores(prev => ({
      ...prev,
      [pilaarId]: waarde[0]
    }));
  };

  const berekenResultaten = () => {
    const totaalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

    let classificatie: string;
    let kleur: string;
    let advies: string;
    let irisFeedback: string;

    if (totaalScore >= 30) {
      classificatie = 'Klaar';
      kleur = 'green';
      advies = 'Je hebt een sterke basis. Tijd om te gaan daten!';
      irisFeedback = 'Ik waardeer je eerlijkheid. Je hebt een sterke basis voor dating. Dit is zeldzaam - de meeste mensen beginnen te vroeg. Je bent er klaar voor!';
    } else if (totaalScore >= 20) {
      classificatie = 'Bijna klaar';
      kleur = 'orange';
      advies = 'Je kunt starten, maar wees bewust van je werkpunten.';
      irisFeedback = 'Je bent er bijna. Mijn advies: start rustig, wees eerlijk over waar je staat, en werk parallel aan je werkpunten.';
    } else {
      classificatie = 'Nog niet klaar';
      kleur = 'red';
      advies = 'Focus eerst op jezelf. Dating nu zou pijnlijk zijn.';
      irisFeedback = 'Ik waardeer je eerlijkheid. Het feit dat je dit ziet, betekent dat je zelfbewust bent. Mijn advies: focus eerst op de pilaar waar je het laagst scoort.';
    }

    const resultaten: TestResultaat = {
      scores,
      totaalScore,
      classificatie,
      kleur,
      advies,
      irisFeedback
    };

    setResultaten(resultaten);
    setIsCompleet(true);
  };

  const getScoreLabel = (score: number) => {
    if (score <= 3) return 'Laag';
    if (score <= 6) return 'Gemiddeld';
    return 'Hoog';
  };

  const getScoreColor = (score: number) => {
    if (score <= 3) return 'text-red-600';
    if (score <= 6) return 'text-orange-600';
    return 'text-green-600';
  };

  if (isCompleet && resultaten) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Resultaten Header */}
        <Card className="text-center">
          <CardContent className="pt-8 pb-8">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
              resultaten.kleur === 'green' ? 'bg-green-100' :
              resultaten.kleur === 'orange' ? 'bg-orange-100' : 'bg-red-100'
            }`}>
              {resultaten.kleur === 'green' ? (
                <ThumbsUp className="w-8 h-8 text-green-600" />
              ) : resultaten.kleur === 'orange' ? (
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              ) : (
                <Target className="w-8 h-8 text-red-600" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {resultaten.classificatie}
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              {resultaten.advies}
            </p>
            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-lg font-bold ${
              resultaten.kleur === 'green' ? 'bg-green-100 text-green-800' :
              resultaten.kleur === 'orange' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
            }`}>
              Totaal Score: {resultaten.totaalScore}/40
            </div>
          </CardContent>
        </Card>

        {/* Individuele Pilaren */}
        <Card>
          <CardHeader>
            <CardTitle>Jouw Scores per Pilaar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {pilaren.map((pilaar) => {
                const score = resultaten.scores[pilaar.id];
                return (
                  <div key={pilaar.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{pilaar.naam}</h3>
                        <p className="text-sm text-gray-600 mt-1">{pilaar.beschrijving}</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getScoreColor(score)}`}>
                          {score}/10
                        </div>
                        <Badge variant="outline" className="mt-1">
                          {getScoreLabel(score)}
                        </Badge>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-2">
                        <span>{pilaar.uitersten.laag}</span>
                        <span>{pilaar.uitersten.hoog}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            score <= 3 ? 'bg-red-500' :
                            score <= 6 ? 'bg-orange-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${(score / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Iris Feedback */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">🤖</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Iris zegt:</h3>
                <p className="text-gray-700">{resultaten.irisFeedback}</p>
              </div>
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
          <div>
            <h2 className="text-xl font-bold text-gray-900">{titel}</h2>
            <p className="text-gray-600 mt-2">{beschrijving}</p>
          </div>
        </CardContent>
      </Card>

      {/* Pilaren */}
      <div className="space-y-6">
        {pilaren.map((pilaar, index) => (
          <Card key={pilaar.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {index + 1}
                </div>
                <div>
                  <CardTitle className="text-lg">{pilaar.naam}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{pilaar.beschrijving}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Slider
                  value={scores[pilaar.id] ? [scores[pilaar.id]] : [5]}
                  onValueChange={(value) => handleScoreChange(pilaar.id, value)}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>1 - Helemaal niet</span>
                  <span>10 - Volledig</span>
                </div>
              </div>

              {scores[pilaar.id] && (
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Jouw score:</span> {scores[pilaar.id]}/10
                  </div>
                  <Badge variant="outline">
                    {getScoreLabel(scores[pilaar.id])}
                  </Badge>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between text-xs text-gray-600 mb-2">
                  <span>{pilaar.uitersten.laag}</span>
                  <span>{pilaar.uitersten.hoog}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      (scores[pilaar.id] || 5) <= 3 ? 'bg-red-500' :
                      (scores[pilaar.id] || 5) <= 6 ? 'bg-orange-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${((scores[pilaar.id] || 5) / 10) * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Complete Button */}
      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={() => setIsCompleet(true)}
            disabled={Object.keys(scores).length !== pilaren.length}
            className="w-full bg-[#ff66c4] hover:bg-[#e55bb0] text-white"
            size="lg"
          >
            Bekijk Mijn Resultaten
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          {Object.keys(scores).length !== pilaren.length && (
            <p className="text-center text-sm text-gray-500 mt-4">
              Beoordeel alle 4 pilaren om je resultaten te zien
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}