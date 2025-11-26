'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle, ArrowRight, ArrowLeft, Brain, AlertCircle } from 'lucide-react';

interface TestVraag {
  id: string;
  tekst: string;
  schaal: string; // 'angst' | 'vermijding' | etc.
}

interface AntwoordOptie {
  waarde: number;
  label: string;
}

interface PsychometricTestProps {
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
  gemiddeldeScores: Record<string, number>;
  totaalScore: number;
  classificatie: string;
  interpretatie: {
    titel: string;
    beschrijving: string;
    sterktePunten: string[];
    aandachtspunten: string[];
  };
}

export function PsychometricTest({
  titel,
  beschrijving,
  vragen,
  antwoordOpties,
  irisContext,
  onComplete,
  onPrevious
}: PsychometricTestProps) {
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

  const handleAntwoordSelect = (vraagId: string, waarde: number) => {
    setAntwoorden(prev => ({
      ...prev,
      [vraagId]: waarde
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
    // Groepeer antwoorden per schaal
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
    let totaalScore = 0;

    Object.entries(schaalScores).forEach(([schaal, scores]) => {
      const gemiddelde = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      gemiddeldeScores[schaal] = Math.round(gemiddelde * 10) / 10; // Rond af op 1 decimaal
      totaalScore += gemiddelde;
    });

    // Bepaal classificatie (dit moet worden aangepast per test type)
    const classificatie = bepaalClassificatie(gemiddeldeScores);

    const resultaten: TestResultaat = {
      schaalScores: Object.fromEntries(
        Object.entries(schaalScores).map(([schaal, scores]) => [schaal, scores.length])
      ),
      gemiddeldeScores,
      totaalScore: Math.round(totaalScore * 10) / 10,
      classificatie,
      interpretatie: getInterpretatie(classificatie, gemiddeldeScores)
    };

    setResultaten(resultaten);
    setIsCompleet(true);
  };

  // Placeholder functies - deze moeten worden aangepast per test type
  const bepaalClassificatie = (scores: Record<string, number>): string => {
    // Voor hechtingsstijl test
    const angstScore = scores.angst || 0;
    const vermijdingScore = scores.vermijding || 0;

    if (angstScore < 4 && vermijdingScore < 4) return 'veilig';
    if (angstScore >= 4 && vermijdingScore < 4) return 'angstig';
    if (angstScore < 4 && vermijdingScore >= 4) return 'vermijdend';
    return 'gedesorganiseerd';
  };

  const getInterpretatie = (classificatie: string, scores: Record<string, number>) => {
    const interpretaties: Record<string, any> = {
      veilig: {
        titel: 'Veilige Hechting',
        beschrijving: 'Je bent comfortabel met intimiteit én onafhankelijkheid. Dit is een sterke basis voor dating.',
        sterktePunten: [
          'Je kunt een "nee" accepteren zonder het persoonlijk te nemen',
          'Je communiceert je behoeften duidelijk',
          'Je herkent red flags en handelt ernaar'
        ],
        aandachtspunten: [
          'Pas op dat je niet te lang blijft bij iemand met onveilige hechting'
        ]
      },
      angstig: {
        titel: 'Angstige Hechting',
        beschrijving: 'Je hebt een sterke behoefte aan nabijheid en bevestiging. Dit kan intens maar ook overweldigend zijn.',
        sterktePunten: [
          'Je bent warm en toegewijd in relaties',
          'Je bent attent op de behoeften van anderen',
          'Je bent bereid te werken aan een relatie'
        ],
        aandachtspunten: [
          'Let op dat je niet te veel aanpast om de ander te pleasen',
          'Werk aan zelfgeruststelling in plaats van externe bevestiging',
          'Vermijd vermijdende types - ze triggeren je onzekerheid'
        ]
      },
      vermijdend: {
        titel: 'Vermijdende Hechting',
        beschrijving: 'Je waardeert onafhankelijkheid en voelt je ongemakkelijk bij te veel intimiteit.',
        sterktePunten: [
          'Je bent zelfstandig en niet afhankelijk',
          'Je brengt rust en stabiliteit',
          'Je wordt niet snel overweldigd door emoties'
        ],
        aandachtspunten: [
          'Probeer niet weg te lopen wanneer het intiem wordt',
          'Oefen met je kwetsbaar opstellen',
          'Geef partners niet de schuld van je eigen ongemak'
        ]
      },
      gedesorganiseerd: {
        titel: 'Gedesorganiseerde Hechting',
        beschrijving: 'Je ervaart tegenstrijdige gevoelens - je wilt nabijheid maar het voelt ook bedreigend.',
        sterktePunten: [
          'Je bent diep en intens in connecties',
          'Je hebt een rijk innerlijk leven',
          'Je bent vaak zeer empathisch'
        ],
        aandachtspunten: [
          'Overweeg professionele begeleiding voor diepere healing',
          'Kies heel bewust voor stabiele, veilige partners',
          'Wees je bewust van hot-cold patronen'
        ]
      }
    };

    return interpretaties[classificatie] || interpretaties.veilig;
  };

  if (isCompleet && resultaten) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Resultaten Header */}
        <Card className="text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {resultaten.interpretatie.titel}
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {resultaten.interpretatie.beschrijving}
            </p>
          </CardContent>
        </Card>

        {/* Scores Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Je Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(resultaten.gemiddeldeScores).map(([schaal, score]) => (
                <div key={schaal} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium capitalize">{schaal}</span>
                    <Badge variant="outline">{score}/7</Badge>
                  </div>
                  <Progress value={(score / 7) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Interpretatie */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-700 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Sterktepunten
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {resultaten.interpretatie.sterktePunten.map((punt, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span className="text-sm">{punt}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-orange-700 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Aandachtspunten
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {resultaten.interpretatie.aandachtspunten.map((punt, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-orange-600 mt-1">•</span>
                    <span className="text-sm">{punt}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Complete Button */}
        <Card>
          <CardContent className="pt-6">
            <Button
              onClick={() => onComplete(resultaten)}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
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
        <CardContent>
          <RadioGroup
            value={antwoorden[huidigeVraagData.id]?.toString() || ''}
            onValueChange={(value) => handleAntwoordSelect(huidigeVraagData.id, parseInt(value))}
            className="space-y-3"
          >
            {antwoordOpties.map((optie) => (
              <div key={optie.waarde} className="flex items-center space-x-2">
                <RadioGroupItem value={optie.waarde.toString()} id={`optie-${optie.waarde}`} />
                <Label
                  htmlFor={`optie-${optie.waarde}`}
                  className="flex-1 cursor-pointer p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span>{optie.label}</span>
                    <Badge variant="outline" className="text-xs">
                      {optie.waarde}
                    </Badge>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
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
                <ArrowLeft className="w-4 h-4 mr-2" />
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