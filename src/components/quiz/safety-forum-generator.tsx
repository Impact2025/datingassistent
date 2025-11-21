'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/providers/user-provider';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import * as Lucide from 'lucide-react';

interface SafetyAnswers {
  mainAspect: string;
  absoluteBoundary: string;
  lessonLearned: string;
  dealingWithPressure: string;
}

const LESSON_ID = 567; // Module 1, Les 4: Forum Discussie veiligheid

export default function SafetyForumGenerator() {
  const { user } = useUser();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postCreated, setPostCreated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [answers, setAnswers] = useState<SafetyAnswers>({
    mainAspect: '',
    absoluteBoundary: '',
    lessonLearned: '',
    dealingWithPressure: ''
  });

  // Load saved answers on mount
  useEffect(() => {
    async function loadSavedAnswers() {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/user/lesson-responses?userId=${user.id}`);
        if (response.ok) {
          const allResponses = await response.json();
          const savedResponse = allResponses.find((r: any) => r.lesson_id === LESSON_ID);

          if (savedResponse?.response_text) {
            try {
              const parsedAnswers = JSON.parse(savedResponse.response_text);
              setAnswers(parsedAnswers);
            } catch (e) {
              console.error('Failed to parse saved answers:', e);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load saved answers:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadSavedAnswers();
  }, [user?.id]);

  // Auto-save answers whenever they change
  useEffect(() => {
    if (!user?.id || isLoading) return;

    const timeoutId = setTimeout(async () => {
      setIsSaving(true);
      try {
        await fetch('/api/user/lesson-responses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            lessonId: LESSON_ID,
            responseText: JSON.stringify(answers)
          }),
        });
      } catch (error) {
        console.error('Failed to auto-save answers:', error);
      } finally {
        setIsSaving(false);
      }
    }, 1000); // Debounce: save 1 second after last change

    return () => clearTimeout(timeoutId);
  }, [answers, user?.id, isLoading]);

  const generateForumPost = (): { title: string; content: string } => {
    const title = 'Wat veiligheid betekent voor mij in dating';

    const content = `
## 🛡️ Mijn belangrijkste aspect van veiligheid

${answers.mainAspect || '_Nog geen reflectie gedeeld_'}

---

## 🚫 Mijn absolute grens

${answers.absoluteBoundary || '_Nog geen grens gedeeld_'}

---

## 📖 Wat ik heb geleerd uit ervaring

${answers.lessonLearned || '_Nog geen ervaring gedeeld_'}

---

## 💪 Hoe ik omga met druk

${answers.dealingWithPressure || '_Nog geen strategie gedeeld_'}

---

**💛 Mijn veiligheid > iemand anders gevoelens**

_✨ Gepost vanuit Module: Herken de 5 Rode Vlaggen - Les 4_
`.trim();

    return { title, content };
  };

  const handleSubmitToForum = async () => {
    if (!user) {
      toast({
        title: 'Login vereist',
        description: 'Je moet ingelogd zijn om een forumpost te maken',
        variant: 'destructive'
      });
      return;
    }

    // Validate that at least one field is filled
    if (!answers.mainAspect && !answers.absoluteBoundary && !answers.lessonLearned && !answers.dealingWithPressure) {
      toast({
        title: 'Vul tenminste één veld in',
        description: 'Deel wat veiligheid voor jou betekent',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { title, content } = generateForumPost();

      // Post to "Veiligheid & Privacy" category (ID: 5)
      const SAFETY_CATEGORY_ID = 5;

      const response = await fetch('/api/community/forum/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          categoryId: SAFETY_CATEGORY_ID,
          title,
          content
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      const data = await response.json();

      setPostCreated(true);

      toast({
        title: '🎉 Post succesvol aangemaakt!',
        description: 'Je gedachten over veiligheid zijn gedeeld in het forum',
      });
    } catch (error) {
      console.error('Failed to create forum post:', error);
      toast({
        title: 'Fout bij aanmaken post',
        description: 'Probeer het later opnieuw',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-center space-x-2">
          <Lucide.Loader className="h-6 w-6 animate-spin text-purple-600" />
          <span className="text-gray-600">Antwoorden laden...</span>
        </div>
      </div>
    );
  }

  if (postCreated) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
        <div className="text-center">
          <div className="mb-4">
            <Lucide.CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Post succesvol gedeeld! 🎉</h3>
          <p className="text-gray-600 mb-6">
            Je gedachten over veiligheid zijn nu zichtbaar in het forum. Dit helpt anderen nadenken over hun eigen grenzen!
          </p>

          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-6">
            <p className="font-semibold text-purple-900">
              💛 Mijn veiligheid &gt; iemand anders gevoelens
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => window.open('/community?category=5', '_blank')}
              className="w-full"
            >
              <Lucide.ExternalLink className="h-4 w-4 mr-2" />
              Bekijk je post in Veiligheid & Privacy forum
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setPostCreated(false);
                setStep(1);
                setAnswers({
                  mainAspect: '',
                  absoluteBoundary: '',
                  lessonLearned: '',
                  dealingWithPressure: ''
                });
              }}
              className="w-full"
            >
              <Lucide.Plus className="h-4 w-4 mr-2" />
              Nog een post maken
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Stap {step} van 4
          </span>
          <div className="flex items-center space-x-2">
            {isSaving && (
              <span className="text-xs text-gray-500 flex items-center">
                <Lucide.Loader className="h-3 w-3 animate-spin mr-1" />
                Opslaan...
              </span>
            )}
            {!isSaving && (answers.mainAspect || answers.absoluteBoundary || answers.lessonLearned || answers.dealingWithPressure) && (
              <span className="text-xs text-green-600 flex items-center">
                <Lucide.Check className="h-3 w-3 mr-1" />
                Opgeslagen
              </span>
            )}
            <span className="text-sm text-purple-600">Forum Post Generator - Veiligheid</span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Safety guidelines */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <h4 className="font-semibold text-blue-900 mb-2">🛡️ Richtlijnen voor deelname</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Respecteer elkaars grenzen en ervaringen</li>
          <li>• Deel geen namen of herkenbare details</li>
          <li>• Geef steun en tips, geen oordelen</li>
          <li>• Gebruik trigger warnings bij gevoelige content</li>
        </ul>
      </div>

      {/* Step 1: Main aspect of safety */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold mb-2">Wat is voor jou het belangrijkste aspect van veiligheid?</h3>
            <p className="text-gray-600 text-sm mb-4">
              Denk bijvoorbeeld aan: fysieke veiligheid, emotionele veiligheid, privacy, respectvolle communicatie, grenzen stellen...
            </p>
          </div>

          <Textarea
            value={answers.mainAspect}
            onChange={(e) => setAnswers({ ...answers, mainAspect: e.target.value })}
            placeholder="Bijvoorbeeld: 'Voor mij is emotionele veiligheid het belangrijkste. Ik wil me kunnen uiten zonder...'"
            rows={6}
            className="resize-none"
          />

          <div className="bg-purple-50 border-l-4 border-purple-400 p-3 text-sm text-purple-800">
            💡 <strong>Tip:</strong> Er is geen goed of fout antwoord. Wat belangrijk is voor jou, is belangrijk.
          </div>

          <Button onClick={() => setStep(2)} className="w-full">
            Volgende <Lucide.ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Step 2: Absolute boundary */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold mb-2">Welke grens stel je altijd, ongeacht wat?</h3>
            <p className="text-gray-600 text-sm mb-4">
              Wat is jouw absolute dealbreaker? Waar trek jij altijd de lijn, ook al vindt de ander je "overdreven"?
            </p>
          </div>

          <Textarea
            value={answers.absoluteBoundary}
            onChange={(e) => setAnswers({ ...answers, absoluteBoundary: e.target.value })}
            placeholder="Bijvoorbeeld: 'Ik ga nooit naar iemands huis bij de eerste date, hoe leuk het ook gaat...'"
            rows={6}
            className="resize-none"
          />

          <div className="bg-green-50 border-l-4 border-green-500 p-3 text-sm text-green-800">
            🚫 <strong>Herinner jezelf:</strong> Jouw grenzen zijn niet onderhandelbaar. Wie jouw grenzen niet respecteert, respecteert jou niet.
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
              <Lucide.ChevronLeft className="h-4 w-4 mr-2" /> Terug
            </Button>
            <Button onClick={() => setStep(3)} className="flex-1">
              Volgende <Lucide.ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Lesson learned */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold mb-2">Wat heb je geleerd uit een eerdere ervaring?</h3>
            <p className="text-gray-600 text-sm mb-4">
              Optioneel: Deel een situatie waar je een grens had moeten stellen, of juist wél stelde en daar blij mee bent.
            </p>
          </div>

          <Textarea
            value={answers.lessonLearned}
            onChange={(e) => setAnswers({ ...answers, lessonLearned: e.target.value })}
            placeholder="Bijvoorbeeld: 'Ik heb geleerd dat mijn buikgevoel vaak klopt. Toen ik...'"
            rows={6}
            className="resize-none"
          />

          <div className="bg-orange-50 border-l-4 border-orange-400 p-3 text-sm text-orange-800">
            ⚠️ <strong>Let op:</strong> Gebruik een trigger warning als je traumatische ervaringen deelt (bijv. *[TW: manipulatie]*).
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
              <Lucide.ChevronLeft className="h-4 w-4 mr-2" /> Terug
            </Button>
            <Button onClick={() => setStep(4)} className="flex-1">
              Volgende <Lucide.ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Dealing with pressure */}
      {step === 4 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold mb-2">Hoe ga je om met druk van anderen?</h3>
            <p className="text-gray-600 text-sm mb-4">
              Wat doe je als iemand je grenzen niet respecteert of je "overdreven" noemt? Hoe blijf je bij jezelf?
            </p>
          </div>

          <Textarea
            value={answers.dealingWithPressure}
            onChange={(e) => setAnswers({ ...answers, dealingWithPressure: e.target.value })}
            placeholder="Bijvoorbeeld: 'Als iemand mijn grenzen niet respecteert, zie ik dat als een rode vlag en...'"
            rows={6}
            className="resize-none"
          />

          <div className="bg-purple-50 border-l-4 border-purple-500 p-4">
            <h4 className="font-semibold text-purple-900 mb-2">📋 Preview van je post:</h4>
            <div className="text-sm text-purple-800 space-y-1">
              {answers.mainAspect && <p>✓ Belangrijkste aspect gedeeld</p>}
              {answers.absoluteBoundary && <p>✓ Absolute grens genoemd</p>}
              {answers.lessonLearned && <p>✓ Ervaring gedeeld</p>}
              {answers.dealingWithPressure && <p>✓ Strategie voor druk toegevoegd</p>}
              {!answers.mainAspect && !answers.absoluteBoundary && !answers.lessonLearned && !answers.dealingWithPressure && (
                <p className="text-orange-600">⚠️ Vul tenminste één veld in om te posten</p>
              )}
            </div>
          </div>

          <div className="bg-purple-100 border-2 border-purple-500 rounded-lg p-4 text-center">
            <p className="font-bold text-purple-900 text-lg">
              💛 Mijn veiligheid &gt; iemand anders gevoelens
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
              <Lucide.ChevronLeft className="h-4 w-4 mr-2" /> Terug
            </Button>
            <Button
              onClick={handleSubmitToForum}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Lucide.Loader className="h-4 w-4 mr-2 animate-spin" />
                  Plaatsen...
                </>
              ) : (
                <>
                  <Lucide.Send className="h-4 w-4 mr-2" />
                  Plaats in Forum
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Skip option */}
      <div className="mt-6 pt-6 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-500 mb-2">
          Wil je liever eerst het forum verkennen?
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open('/community?category=5', '_blank')}
        >
          <Lucide.ExternalLink className="h-4 w-4 mr-2" />
          Ga naar forum zonder post te maken
        </Button>
      </div>
    </div>
  );
}
