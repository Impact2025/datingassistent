'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LessonCard } from '../shared/LessonCard';
import { ScoreDisplay } from '../shared/ScoreDisplay';
import { Les3_2_ConnectieProps } from '../types/module3.types';

// Mix of clichés and authentic phrases - randomly ordered
const PHRASES = [
  { text: "Ik ben een leuke persoon om mee om te gaan", isCliché: true },
  { text: "Ik schrijf graag verhalen over mijn reizen door Azië", isCliché: false },
  { text: "Op zoek naar mijn soulmate", isCliché: true },
  { text: "Ik experimenteer graag met nieuwe recepten in de keuken", isCliché: false },
  { text: "Ik ben succesvol in mijn carrière", isCliché: true },
  { text: "Ik hou van diepgaande gesprekken bij een goed glas wijn", isCliché: false },
  { text: "Liefde op het eerste gezicht bestaat", isCliché: true },
  { text: "Ik ben gek op spontane weekendjes weg", isCliché: false },
  { text: "Ik ben een familiemens", isCliché: true },
  { text: "Ik verzamel vintage platencollecties en ga regelmatig naar concerten", isCliché: false },
  { text: "Ik zoek iemand die van avontuur houdt", isCliché: true },
  { text: "Ik ben gepassioneerd over fotografie en street art", isCliché: false },
  { text: "Ik ben een romanticus in hart en nieren", isCliché: true },
  { text: "Ik werk als ontwikkelaar en bouw graag aan persoonlijke projecten", isCliché: false },
  { text: "Ik ben een echte gentleman/lady", isCliché: true },
  { text: "Ik ben dol op yoga en meditatie voor innerlijke rust", isCliché: false },
  { text: "Ik geloof in karma en het universum", isCliché: true },
  { text: "Ik spreek vloeiend Frans en Spaans door mijn reizen", isCliché: false },
  { text: "Ik ben een workaholic maar weet hoe te balanceren", isCliché: true },
  { text: "Ik ben een fervent lezer van science fiction romans", isCliché: false }
];

export function Les3_2_Connectie({ onComplete }: Les3_2_ConnectieProps) {
  const [selections, setSelections] = useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectionChange = (index: number, checked: boolean) => {
    const newSelections = new Set(selections);
    if (checked) {
      newSelections.add(index);
    } else {
      newSelections.delete(index);
    }
    setSelections(newSelections);
  };

  const calculateScore = () => {
    let correct = 0;
    PHRASES.forEach((phrase, index) => {
      if (phrase.isCliché === selections.has(index)) {
        correct++;
      }
    });
    return Math.round((correct / PHRASES.length) * 10); // Score out of 10
  };

  const handleSubmit = async () => {
    if (selections.size === 0) return;

    setIsSubmitting(true);
    const finalScore = calculateScore();

    try {
      const response = await fetch('/api/user/profile/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('datespark_auth_token')}`
        },
        body: JSON.stringify({
          profieltekst_cliché_score: finalScore
        })
      });

      if (response.ok) {
        setScore(finalScore);
        setSubmitted(true);
        onComplete({ score: finalScore });
      } else {
        throw new Error('Failed to save score');
      }
    } catch (error) {
      console.error('Score submission failed:', error);
      // For demo purposes, still show the result
      setScore(finalScore);
      setSubmitted(true);
      onComplete({ score: finalScore });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getScoreFeedback = (score: number) => {
    if (score >= 8) return "Uitstekend! Je hebt een scherp oog voor clichés. Dit helpt je om authentieke verbindingen te maken.";
    if (score >= 6) return "Goed gedaan! Je herkent veel clichés. Blijf oefenen voor nog betere resultaten.";
    if (score >= 4) return "Redelijk resultaat. Herlees de voorbeelden en probeer het opnieuw voor betere inzichten.";
    return "Dit is een leerproces. Bekijk de juiste antwoorden en probeer het nog eens.";
  };

  if (submitted) {
    return (
      <LessonCard title="Connectie (C)" emoji="🔗">
        <ScoreDisplay
          score={score}
          maxScore={10}
          title="Jouw Cliché Detector Score"
          feedback={getScoreFeedback(score)}
        />

        <div className="space-y-4 mt-6">
          <h4 className="font-semibold text-center">Juiste Antwoorden:</h4>
          <div className="grid gap-2 max-h-60 overflow-y-auto">
            {PHRASES.map((phrase, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg text-sm ${
                  phrase.isCliché
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-green-50 border border-green-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex-1">{phrase.text}</span>
                  <Badge
                    variant={phrase.isCliché ? "destructive" : "default"}
                    className="ml-2 text-xs"
                  >
                    {phrase.isCliché ? 'CLICHÉ' : 'AUTHENTIEK'}
                  </Badge>
                </div>
                {selections.has(index) !== phrase.isCliché && (
                  <div className="text-xs text-orange-600 mt-1">
                    Jouw keuze: {selections.has(index) ? 'Cliché' : 'Authentiek'}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </LessonCard>
    );
  }

  return (
    <LessonCard title="Connectie (C)" emoji="🔗">
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Cliché Detector Challenge</h3>
          <p className="text-sm text-muted-foreground">
            Markeer alle <strong>clichés</strong> die je herkent. Deze oefening traint je onderscheidingsvermogen voor authentieke verbindingen.
          </p>
          <div className="flex justify-center gap-4 mt-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
              <span>Cliché</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
              <span>Authentiek</span>
            </div>
          </div>
        </div>

        <Card className="bg-blue-50/50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-blue-700">ℹ️</span>
              </div>
              <div className="text-sm text-blue-800">
                <strong>Tip:</strong> Clichés zijn generieke zinnen die iedereen kan zeggen.
                Authentieke zinnen bevatten specifieke details die jou uniek maken.
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {PHRASES.map((phrase, index) => (
            <div
              key={index}
              className={`flex items-center gap-3 p-4 border rounded-lg transition-all ${
                selections.has(index)
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Checkbox
                checked={selections.has(index)}
                onCheckedChange={(checked) => handleSelectionChange(index, checked === true)}
                className="flex-shrink-0"
              />
              <span className="flex-1 text-sm leading-relaxed">{phrase.text}</span>
              {selections.has(index) && (
                <Badge variant="secondary" className="text-xs">
                  Geselecteerd
                </Badge>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            {selections.size} van {PHRASES.length} zinnen geselecteerd
          </div>

          <Button
            onClick={handleSubmit}
            disabled={selections.size === 0 || isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? 'Bezig met controleren...' : `Controleer Score (${selections.size} geselecteerd)`}
          </Button>
        </div>
      </div>
    </LessonCard>
  );
}