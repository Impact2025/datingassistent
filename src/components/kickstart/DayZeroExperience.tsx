'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight, ChevronLeft, Target, Calendar, Heart, CheckCircle2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter } from 'next/navigation';

interface DayZeroExperienceProps {
  onComplete?: () => void;
  embedded?: boolean; // When true, removes full-screen styling for dashboard integration
}

export function DayZeroExperience({ onComplete, embedded = false }: DayZeroExperienceProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Vision Setting
  const [visionStatement, setVisionStatement] = useState('');

  // Step 3: Commitment Ceremony
  const [commitmentLevel, setCommitmentLevel] = useState(5);
  const [commitmentChecklist, setCommitmentChecklist] = useState({
    daily_time: false,
    honest_reflections: false,
    do_exercises: false,
  });

  // Step 4: First Step Ritual
  const [firstImpressionNotes, setFirstImpressionNotes] = useState('');

  // Check if current step is valid
  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return visionStatement.trim().length >= 20; // Minimaal 20 karakters
      case 2:
        return true; // Journey preview heeft geen validatie
      case 3:
        return (
          commitmentLevel >= 7 &&
          commitmentChecklist.daily_time &&
          commitmentChecklist.honest_reflections &&
          commitmentChecklist.do_exercises
        );
      case 4:
        return firstImpressionNotes.trim().length >= 10;
      default:
        return false;
    }
  };

  const saveProgress = async (data: any, completed: boolean = false) => {
    try {
      const token = localStorage.getItem('datespark_auth_token');
      const response = await fetch('/api/kickstart/day-zero', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ...data, completed }),
      });

      if (!response.ok) {
        throw new Error('Failed to save progress');
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving progress:', error);
      throw error;
    }
  };

  const handleNext = async () => {
    if (!isStepValid()) return;

    setLoading(true);

    try {
      // Save current step data
      if (currentStep === 1) {
        await saveProgress({ vision_statement: visionStatement });
      } else if (currentStep === 3) {
        await saveProgress({
          commitment_level: commitmentLevel,
          commitment_checklist: commitmentChecklist,
        });
      } else if (currentStep === 4) {
        // Final step - mark as completed
        await saveProgress(
          { first_impression_notes: firstImpressionNotes },
          true
        );

        // Redirect naar Kickstart dag 1
        if (onComplete) {
          onComplete();
        } else {
          router.push('/kickstart/dag/1');
        }
        return;
      }

      // Move to next step
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error('Error:', error);
      alert('Er ging iets mis. Probeer het opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className={embedded ? "w-full" : "min-h-screen bg-white flex items-center justify-center p-4"}>
      <div className={embedded ? "w-full" : "w-full max-w-3xl"}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-pink-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Welkom bij Kickstart
            </h1>
          </div>
          <p className="text-gray-600">
            Voordat we beginnen, maken we jouw persoonlijke reis compleet
          </p>
        </motion.div>

        {/* Progress Indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`h-2 rounded-full transition-all duration-300 ${
                step === currentStep
                  ? 'w-12 bg-pink-600'
                  : step < currentStep
                  ? 'w-8 bg-pink-400'
                  : 'w-8 bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-8">
                {/* STEP 1: VISION SETTING */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                        <Target className="w-5 h-5 text-pink-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Jouw Visie</h2>
                        <p className="text-sm text-gray-500">Stap 1 van 4</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 border-l-4 border-pink-600 p-4 rounded">
                      <p className="text-gray-900 font-medium">
                        Stel je voor... 3 maanden later.
                      </p>
                      <p className="text-gray-600 text-sm mt-1">
                        Je hebt de Kickstart afgerond. Hoe ziet je ideale dating leven eruit?
                      </p>
                    </div>

                    <Textarea
                      value={visionStatement}
                      onChange={(e) => setVisionStatement(e.target.value)}
                      placeholder="Ik voel me zelfverzekerd in wie ik ben. Ik heb betekenisvolle matches die bij me passen. Dating voelt natuurlijk en leuk, niet stressvol..."
                      className="min-h-[200px] text-base resize-none"
                    />

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className={`w-4 h-4 ${visionStatement.length >= 20 ? 'text-green-500' : 'text-gray-300'}`} />
                      <span>{visionStatement.length}/20 karakters (minimaal)</span>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-pink-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Deze visie wordt je kompas
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Iris zal je hieraan herinneren tijdens je 21-daagse reis
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: JOURNEY PREVIEW */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-pink-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Jouw Reis</h2>
                        <p className="text-sm text-gray-500">Stap 2 van 4</p>
                      </div>
                    </div>

                    <p className="text-gray-700">
                      De komende 3 weken ga je door een transformatie. Hier is wat je kunt verwachten:
                    </p>

                    {/* Week 1 */}
                    <div className="border-l-4 border-pink-500 pl-6 py-4 bg-pink-50 rounded-r">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-3xl">📸</span>
                        <h3 className="text-xl font-bold text-pink-900">Week 1: Fundament</h3>
                      </div>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-pink-600 mt-0.5 flex-shrink-0" />
                          <span>Je foto's: leer wat werkt en waarom</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-pink-600 mt-0.5 flex-shrink-0" />
                          <span>Eerste indruk: zie jezelf door de ogen van matches</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-pink-600 mt-0.5 flex-shrink-0" />
                          <span>Profiel audit: ontdek je sterke punten én verbeterpunten</span>
                        </li>
                      </ul>
                    </div>

                    {/* Week 2 */}
                    <div className="border-l-4 border-pink-400 pl-6 py-4 bg-gray-50 rounded-r">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-3xl">✍️</span>
                        <h3 className="text-xl font-bold text-gray-900">Week 2: Connectie</h3>
                      </div>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-pink-600 mt-0.5 flex-shrink-0" />
                          <span>Bio's die converteren: schrijf teksten die matchen</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-pink-600 mt-0.5 flex-shrink-0" />
                          <span>Jouw verhaal: ontdek wat je uniek maakt</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-pink-600 mt-0.5 flex-shrink-0" />
                          <span>Authentiek aantrekkelijk zijn: geen masker nodig</span>
                        </li>
                      </ul>
                    </div>

                    {/* Week 3 */}
                    <div className="border-l-4 border-pink-300 pl-6 py-4 bg-gray-50 rounded-r">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-3xl">💬</span>
                        <h3 className="text-xl font-bold text-gray-900">Week 3: Groei</h3>
                      </div>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-pink-600 mt-0.5 flex-shrink-0" />
                          <span>Gesprekken die boeien: van opener tot eerste date</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-pink-600 mt-0.5 flex-shrink-0" />
                          <span>Date strategie: van match naar ontmoeting</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-pink-600 mt-0.5 flex-shrink-0" />
                          <span>Jouw dating succes systeem: blijvende resultaten</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 border-l-4 border-pink-600 p-4 rounded">
                      <div className="flex items-start gap-3">
                        <Zap className="w-5 h-5 text-pink-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Dagelijks 15-20 minuten
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Elke dag een korte video, quiz, en reflectie. Klein commitment, grote impact.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: COMMITMENT CEREMONY */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                        <Heart className="w-5 h-5 text-pink-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Jouw Commitment</h2>
                        <p className="text-sm text-gray-500">Stap 3 van 4</p>
                      </div>
                    </div>

                    <p className="text-gray-700">
                      Succes komt van commitment. Hoe committed ben je om deze transformatie te maken?
                    </p>

                    {/* Commitment Slider */}
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Commitment level: {commitmentLevel}/10
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={commitmentLevel}
                        onChange={(e) => setCommitmentLevel(parseInt(e.target.value))}
                        className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>1 - Niet zeker</span>
                        <span>5 - Neutraal</span>
                        <span>10 - 100% committed</span>
                      </div>

                      {commitmentLevel < 7 && (
                        <div className="bg-gray-50 border-l-4 border-pink-600 p-3 rounded">
                          <p className="text-sm text-gray-900">
                            💡 Tip: Een commitment van minimaal 7 geeft je de beste kans op succes!
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Commitment Checklist */}
                    <div className="space-y-3 pt-4">
                      <p className="font-medium text-gray-900">Ik commit me aan:</p>

                      <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-pink-300 transition-colors">
                        <Checkbox
                          checked={commitmentChecklist.daily_time}
                          onCheckedChange={(checked) =>
                            setCommitmentChecklist({ ...commitmentChecklist, daily_time: checked as boolean })
                          }
                          className="mt-1"
                        />
                        <div>
                          <p className="font-medium text-gray-900">Dagelijks 15-20 minuten investeren</p>
                          <p className="text-sm text-gray-600">Consistent zijn is de sleutel tot resultaat</p>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-pink-300 transition-colors">
                        <Checkbox
                          checked={commitmentChecklist.honest_reflections}
                          onCheckedChange={(checked) =>
                            setCommitmentChecklist({ ...commitmentChecklist, honest_reflections: checked as boolean })
                          }
                          className="mt-1"
                        />
                        <div>
                          <p className="font-medium text-gray-900">Eerlijk zijn in mijn reflecties</p>
                          <p className="text-sm text-gray-600">Alleen door eerlijkheid groei je echt</p>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-pink-300 transition-colors">
                        <Checkbox
                          checked={commitmentChecklist.do_exercises}
                          onCheckedChange={(checked) =>
                            setCommitmentChecklist({ ...commitmentChecklist, do_exercises: checked as boolean })
                          }
                          className="mt-1"
                        />
                        <div>
                          <p className="font-medium text-gray-900">Oefeningen daadwerkelijk uitvoeren</p>
                          <p className="text-sm text-gray-600">Niet alleen kijken, maar ook doen</p>
                        </div>
                      </label>
                    </div>

                    {commitmentLevel >= 7 &&
                      commitmentChecklist.daily_time &&
                      commitmentChecklist.honest_reflections &&
                      commitmentChecklist.do_exercises && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-pink-50 border-l-4 border-pink-600 p-4 rounded"
                        >
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-6 h-6 text-pink-600 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-gray-900">Perfect! Je bent klaar voor de volgende stap 🎉</p>
                              <p className="text-sm text-gray-600">
                                Dit commitment is precies wat je nodig hebt voor succes
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                  </div>
                )}

                {/* STEP 4: FIRST STEP RITUAL */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-pink-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Je Eerste Stap</h2>
                        <p className="text-sm text-gray-500">Stap 4 van 4</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 border-l-4 border-pink-600 p-6 rounded">
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        🎯 Mini-opdracht voor Dag 1
                      </p>
                      <p className="text-gray-700">
                        Denk na over je huidige dating profiel. Wat is de <strong>eerste indruk</strong> die iemand krijgt als ze je profiel zien?
                      </p>
                    </div>

                    <Textarea
                      value={firstImpressionNotes}
                      onChange={(e) => setFirstImpressionNotes(e.target.value)}
                      placeholder="Bijvoorbeeld: Mijn foto's zijn een beetje saai, allemaal selfies. Mijn bio vertelt niet echt wie ik ben..."
                      className="min-h-[150px] text-base resize-none"
                    />

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className={`w-4 h-4 ${firstImpressionNotes.length >= 10 ? 'text-green-500' : 'text-gray-300'}`} />
                      <span>{firstImpressionNotes.length}/10 karakters (minimaal)</span>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-pink-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Klaar voor de start! 🚀
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Morgen leer je in Dag 1 hoe je deze eerste indruk kunt transformeren
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-pink-600 p-6 rounded-lg text-white">
                      <p className="text-lg font-bold mb-2">🎉 Je bent klaar om te beginnen!</p>
                      <p className="text-pink-50">
                        Klik op "Ik doe mee" om je Kickstart reis te starten. Iris zal je elke dag begeleiden met persoonlijke inzichten.
                      </p>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 mt-6 border-t border-gray-200">
                  <Button
                    variant="ghost"
                    onClick={handlePrevious}
                    disabled={currentStep === 1 || loading}
                    className="gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Vorige
                  </Button>

                  <Button
                    onClick={handleNext}
                    disabled={!isStepValid() || loading}
                    className="bg-pink-600 hover:bg-pink-700 text-white gap-2"
                  >
                    {loading ? (
                      'Bezig...'
                    ) : currentStep === 4 ? (
                      <>
                        Ik doe mee! 🚀
                      </>
                    ) : (
                      <>
                        Volgende
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
