"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Trophy,
  Zap
} from "lucide-react";
import { CLICHE_EXERCISES, scoreTransformation, type ClicheExercise, type TransformationScore } from "@/lib/cliche-data";
import { cn } from "@/lib/utils";

interface ClicheTransformerProps {
  onComplete?: (completed: number, totalScore: number) => void;
}

type TransformationStep = 'identify' | 'meaning' | 'detail' | 'write' | 'result';

export function ClicheTransformer({ onComplete }: ClicheTransformerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [step, setStep] = useState<TransformationStep>('identify');

  const [selectedMeaning, setSelectedMeaning] = useState('');
  const [userDetail, setUserDetail] = useState('');
  const [transformedText, setTransformedText] = useState('');

  const [score, setScore] = useState<TransformationScore | null>(null);
  const [completedExercises, setCompletedExercises] = useState<{[key: number]: TransformationScore}>({});

  const currentExercise = CLICHE_EXERCISES[currentIndex];
  const totalCompleted = Object.keys(completedExercises).length;
  const overallProgress = (totalCompleted / CLICHE_EXERCISES.length) * 100;

  const handleNextStep = () => {
    if (step === 'identify') setStep('meaning');
    else if (step === 'meaning') setStep('detail');
    else if (step === 'detail') setStep('write');
    else if (step === 'write') {
      // Score the transformation
      const transformationScore = scoreTransformation(currentExercise, transformedText);
      setScore(transformationScore);
      setStep('result');

      // Save completion
      setCompletedExercises(prev => ({
        ...prev,
        [currentIndex]: transformationScore
      }));
    }
  };

  const handleNextExercise = () => {
    if (currentIndex < CLICHE_EXERCISES.length - 1) {
      setCurrentIndex(prev => prev + 1);
      resetExercise();
    } else {
      // All done!
      const totalScore = Object.values(completedExercises).reduce((sum, s) => sum + s.total, 0);
      if (onComplete) {
        onComplete(totalCompleted + 1, totalScore);
      }
    }
  };

  const handleSkip = () => {
    if (currentIndex < CLICHE_EXERCISES.length - 1) {
      setCurrentIndex(prev => prev + 1);
      resetExercise();
    }
  };

  const resetExercise = () => {
    setStep('identify');
    setSelectedMeaning('');
    setUserDetail('');
    setTransformedText('');
    setScore(null);
  };

  const handleRetry = () => {
    setStep('write');
    setTransformedText('');
    setScore(null);
  };

  const handleUseExample = (example: string) => {
    setTransformedText(example);
  };

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Cliché Crusher Challenge</CardTitle>
              <CardDescription>
                Transform {CLICHE_EXERCISES.length} clichés naar magnetische zinnen
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-purple-600">
                {totalCompleted}/{CLICHE_EXERCISES.length}
              </div>
              <div className="text-xs text-muted-foreground">voltooid</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={overallProgress} className="h-2" />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-muted-foreground">
              {Math.round(overallProgress)}% compleet
            </span>
            {totalCompleted >= 8 && (
              <Badge variant="default" className="gap-1">
                <Trophy className="w-3 h-3" />
                Achievement Unlocked!
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current Exercise */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                Cliché #{currentIndex + 1}
                <Badge variant="outline">
                  {currentExercise.usagePercentage}% van profielen
                </Badge>
              </CardTitle>
              <CardDescription className="mt-2">
                Stap {['1', '2', '3', '4', '5'][['identify', 'meaning', 'detail', 'write', 'result'].indexOf(step)]} van 4
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              disabled={step === 'result'}
            >
              Overslaan
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Identify */}
          {step === 'identify' && (
            <div className="space-y-4">
              <div className="text-center py-8">
                <div className="inline-block p-6 bg-red-50 border-2 border-red-200 rounded-lg mb-4">
                  <p className="text-2xl font-bold text-red-600">
                    "{currentExercise.clicheText}"
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Deze cliché wordt gebruikt door {currentExercise.usagePercentage}% van dating profielen
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Waarom is dit een cliché?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Te algemeen - iedereen zegt dit</li>
                  <li>• Geen specifieke details</li>
                  <li>• Vertelt niets unieks over JOU</li>
                  <li>• Je brein filtert het weg (boring!)</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">❌ Slechte voorbeelden:</h4>
                {currentExercise.badExamples.map((example, i) => (
                  <div key={i} className="text-sm text-muted-foreground italic p-2 bg-gray-50 rounded border border-gray-200">
                    "{example}"
                  </div>
                ))}
              </div>

              <Button onClick={handleNextStep} className="w-full gap-2">
                Laten we dit transformeren
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Step 2: Meaning */}
          {step === 'meaning' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Wat bedoel je eigenlijk?</h3>
                <p className="text-sm text-muted-foreground">
                  Kies de optie die het best bij je past (of schrijf je eigen)
                </p>
              </div>

              <RadioGroup value={selectedMeaning} onValueChange={setSelectedMeaning}>
                {currentExercise.meaningOptions.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent cursor-pointer">
                    <RadioGroupItem value={option} id={`meaning-${index}`} />
                    <Label htmlFor={`meaning-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
                <div className="flex items-start space-x-2 border rounded-lg p-3">
                  <RadioGroupItem value="custom" id="meaning-custom" />
                  <div className="flex-1">
                    <Label htmlFor="meaning-custom" className="cursor-pointer">
                      Custom:
                    </Label>
                    <Textarea
                      placeholder="Schrijf je eigen betekenis..."
                      rows={2}
                      className="mt-2"
                      onFocus={() => setSelectedMeaning('custom')}
                      onChange={(e) => selectedMeaning === 'custom' && setSelectedMeaning(e.target.value)}
                    />
                  </div>
                </div>
              </RadioGroup>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-900">
                  💡 <strong>Tip:</strong> Kies de meest specifieke optie - hoe preciezer, hoe beter!
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('identify')}>
                  Terug
                </Button>
                <Button
                  onClick={handleNextStep}
                  disabled={!selectedMeaning}
                  className="flex-1 gap-2"
                >
                  Volgende
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Detail */}
          {step === 'detail' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Maak het concreet!</h3>
                <p className="text-sm text-muted-foreground">
                  Voeg een specifiek voorbeeld toe. Kies één prompt en beantwoord hem:
                </p>
              </div>

              <div className="grid gap-3">
                {currentExercise.detailPrompts.map((prompt, index) => (
                  <div key={index} className="border rounded-lg p-3 bg-gradient-to-r from-blue-50 to-white">
                    <div className="font-medium text-sm mb-2">💭 {prompt}</div>
                    <Textarea
                      placeholder="Bijv: Laatst naar Tokio, verdwaald in een Shinto-tempel..."
                      rows={2}
                      value={userDetail}
                      onChange={(e) => setUserDetail(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                ))}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-900">
                  ✅ <strong>Details = conversation starters!</strong> Hoe specifieker, hoe makkelijker om over te praten.
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('meaning')}>
                  Terug
                </Button>
                <Button
                  onClick={handleNextStep}
                  disabled={!userDetail.trim()}
                  className="flex-1 gap-2"
                >
                  Volgende
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Write */}
          {step === 'write' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Schrijf je transformatie!</h3>
                <p className="text-sm text-muted-foreground">
                  Combineer je betekenis en details in één puntige, magnetische zin
                </p>
              </div>

              <div className="space-y-2">
                <Label>Je transformeerde versie</Label>
                <Textarea
                  value={transformedText}
                  onChange={(e) => setTransformedText(e.target.value)}
                  placeholder="Bijv: Laatst verdwaald in een Shinto-tempel in Tokio - geen wifi, geen plan. Eindigde met thee bij een monnik die me de weg wees. Beste middag ooit."
                  rows={4}
                  className="font-mono"
                />
                <div className="text-xs text-muted-foreground text-right">
                  {transformedText.length} karakters
                  {transformedText.length >= 60 && transformedText.length <= 150 && (
                    <span className="text-green-600 ml-2">✓ Perfecte lengte!</span>
                  )}
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-gradient-to-br from-purple-50 to-white">
                <h4 className="font-semibold text-sm mb-3">✨ Goede voorbeelden ter inspiratie:</h4>
                <div className="space-y-2">
                  {currentExercise.goodExamples.slice(0, 2).map((example, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="text-sm flex-1 p-2 bg-white rounded border">
                        {example}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUseExample(example)}
                        className="shrink-0"
                      >
                        Gebruik
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('detail')}>
                  Terug
                </Button>
                <Button
                  onClick={handleNextStep}
                  disabled={transformedText.length < 20}
                  className="flex-1 gap-2 bg-gradient-to-r from-purple-600 to-blue-600"
                >
                  <Zap className="w-4 h-4" />
                  Analyseer mijn transformatie
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Result */}
          {step === 'result' && score && (
            <div className="space-y-6">
              {/* Score Display */}
              <div className="text-center py-6">
                <div className={cn(
                  "inline-flex flex-col items-center justify-center w-32 h-32 rounded-full border-8 mb-4",
                  score.level === 'excellent' && "border-green-500 bg-green-50",
                  score.level === 'good' && "border-blue-500 bg-blue-50",
                  score.level === 'okay' && "border-orange-500 bg-orange-50",
                  score.level === 'poor' && "border-red-500 bg-red-50"
                )}>
                  <div className={cn(
                    "text-4xl font-bold",
                    score.level === 'excellent' && "text-green-600",
                    score.level === 'good' && "text-blue-600",
                    score.level === 'okay' && "text-orange-600",
                    score.level === 'poor' && "text-red-600"
                  )}>
                    {score.total}
                  </div>
                  <div className="text-xs text-muted-foreground">/ 100</div>
                </div>

                <h3 className="text-2xl font-bold mb-2">
                  {score.level === 'excellent' && "Excellent! 🎉"}
                  {score.level === 'good' && "Goed gedaan! 👍"}
                  {score.level === 'okay' && "Oké start! 👌"}
                  {score.level === 'poor' && "Kan beter! 💪"}
                </h3>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-2 gap-3">
                <ScoreBreakdownItem
                  label="Specificiteit"
                  score={score.breakdown.specificity}
                  max={25}
                />
                <ScoreBreakdownItem
                  label="Creativiteit"
                  score={score.breakdown.creativity}
                  max={25}
                />
                <ScoreBreakdownItem
                  label="Authenticiteit"
                  score={score.breakdown.authenticity}
                  max={25}
                />
                <ScoreBreakdownItem
                  label="Impact"
                  score={score.breakdown.impact}
                  max={25}
                />
              </div>

              {/* Feedback */}
              <div className="space-y-2">
                <h4 className="font-semibold">Feedback:</h4>
                {score.feedback.map((fb, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-start gap-2 p-2 rounded text-sm",
                      fb.startsWith('✅') && "bg-green-50 text-green-900",
                      fb.startsWith('⚠️') && "bg-orange-50 text-orange-900",
                      fb.startsWith('❌') && "bg-red-50 text-red-900"
                    )}
                  >
                    {fb}
                  </div>
                ))}
              </div>

              {/* Your Transformation */}
              <div className="border-2 border-purple-200 rounded-lg p-4 bg-gradient-to-br from-purple-50 to-white">
                <h4 className="font-semibold mb-2">Je transformatie:</h4>
                <p className="font-mono text-sm bg-white p-3 rounded border">
                  {transformedText}
                </p>
              </div>

              {/* Exceptional Example */}
              {score.level !== 'excellent' && currentExercise.exceptionalExamples[0] && (
                <div className="border-2 border-gold rounded-lg p-4 bg-gradient-to-br from-yellow-50 to-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                    <h4 className="font-semibold text-yellow-900">Exceptional Voorbeeld:</h4>
                  </div>
                  <p className="text-sm italic">
                    "{currentExercise.exceptionalExamples[0]}"
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-2">
                {score.total < 80 && (
                  <Button
                    variant="outline"
                    onClick={handleRetry}
                    className="gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Probeer opnieuw (betere score!)
                  </Button>
                )}

                <Button
                  onClick={handleNextExercise}
                  className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600"
                >
                  {currentIndex < CLICHE_EXERCISES.length - 1 ? (
                    <>
                      Volgende Cliché
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Voltooien
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Community Showcase (if completed 3+) */}
      {totalCompleted >= 3 && (
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-purple-600" />
              Je voortgang
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Gemiddelde score:</span>
                <span className="font-bold">
                  {Math.round(Object.values(completedExercises).reduce((sum, s) => sum + s.total, 0) / totalCompleted)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Excellent scores:</span>
                <span className="font-bold">
                  {Object.values(completedExercises).filter(s => s.level === 'excellent').length}
                </span>
              </div>
              {totalCompleted >= 8 && (
                <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 text-purple-900">
                    <Trophy className="w-5 h-5" />
                    <span className="font-bold">Achievement Unlocked: Cliché Crusher!</span>
                  </div>
                  <p className="text-sm text-purple-700 mt-1">
                    Je hebt 8/10 clichés succesvol getransformeerd. +25 karma!
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function ScoreBreakdownItem({ label, score, max }: { label: string; score: number; max: number }) {
  const percentage = (score / max) * 100;

  return (
    <div className="border rounded-lg p-3">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-bold">{score}/{max}</span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
}
