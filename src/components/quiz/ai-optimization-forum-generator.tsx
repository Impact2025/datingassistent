'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/providers/user-provider';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import * as Lucide from 'lucide-react';

interface AIOptimizationAnswers {
  aiRole: string;
  concerns: string;
  benefits: string;
  boundaries: string;
}

const LESSON_ID = 890; // Module 5, AI-Optimalisatie forum discussion

export default function AIOptimizationForumGenerator() {
  const { user } = useUser();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postCreated, setPostCreated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [answers, setAnswers] = useState<AIOptimizationAnswers>({
    aiRole: '',
    concerns: '',
    benefits: '',
    boundaries: ''
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
    const title = 'AI in dating: hulp of hinder?';

    const content = `
## 🤖 Welke rol zie ik voor AI in mijn dating leven?

${answers.aiRole || '_Nog geen visie gedeeld_'}

---

## ⚠️ Wat zijn mijn zorgen over AI in dating?

${answers.concerns || '_Nog geen zorgen gedeeld_'}

---

## ✨ Welke voordelen verwacht ik van AI-tools?

${answers.benefits || '_Nog geen voordelen gedeeld_'}

---

## 🚧 Welke grenzen stel ik aan AI-gebruik?

${answers.boundaries || '_Nog geen grenzen gedeeld_'}

---

**💭 AI als tool, niet als vervanging voor menselijke connectie**

_Gepost vanuit Module: AI-Optimalisatie - Professionele Verfijning_
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
    if (!answers.aiRole && !answers.concerns && !answers.benefits && !answers.boundaries) {
      toast({
        title: 'Vul tenminste één veld in',
        description: 'Deel je gedachten over AI in dating',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { title, content } = generateForumPost();

      // Post to "AI & Technologie" category (assuming ID: 6, or create if needed)
      const AI_CATEGORY_ID = 6;

      const response = await fetch('/api/community/forum/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          categoryId: AI_CATEGORY_ID,
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
        description: 'Je gedachten over AI in dating zijn gedeeld in het forum',
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
          <Lucide.Loader className="h-6 w-6 animate-spin text-blue-600" />
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
            Je gedachten over AI in dating zijn nu zichtbaar in het forum. Dit helpt anderen nadenken over technologie in relaties!
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <p className="font-semibold text-blue-900">
              💭 AI als tool, niet als vervanging voor menselijke connectie
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => window.open('/community?category=6', '_blank')}
              className="w-full"
            >
              <Lucide.ExternalLink className="h-4 w-4 mr-2" />
              Bekijk je post in AI & Technologie forum
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setPostCreated(false);
                setStep(1);
                setAnswers({
                  aiRole: '',
                  concerns: '',
                  benefits: '',
                  boundaries: ''
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
            {!isSaving && (answers.aiRole || answers.concerns || answers.benefits || answers.boundaries) && (
              <span className="text-xs text-green-600 flex items-center">
                <Lucide.Check className="h-3 w-3 mr-1" />
                Opgeslagen
              </span>
            )}
            <span className="text-sm text-blue-600">Forum Post Generator - AI in Dating</span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* AI guidelines */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
        <h4 className="font-semibold text-blue-900 mb-2">🤖 Richtlijnen voor AI-discussie</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Deel je ervaringen met AI-tools in dating</li>
          <li>• Respecteer verschillende meningen over technologie</li>
          <li>• Focus op hoe AI menselijke connectie kan ondersteunen</li>
          <li>• Gebruik concrete voorbeelden uit je eigen ervaring</li>
        </ul>
      </div>

      {/* Step 1: AI Role */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold mb-2">Welke rol zie jij voor AI in je dating leven?</h3>
            <p className="text-gray-600 text-sm mb-4">
              Moet AI je dating profiel schrijven, gesprekken analyseren, matches voorstellen, of iets anders?
            </p>
          </div>

          <Textarea
            value={answers.aiRole}
            onChange={(e) => setAnswers({ ...answers, aiRole: e.target.value })}
            placeholder="Bijvoorbeeld: 'AI kan helpen bij het schrijven van mijn profieltekst, maar ik neem altijd de finale beslissingen zelf...'"
            rows={6}
            className="resize-none"
          />

          <div className="bg-blue-50 border-l-4 border-blue-400 p-3 text-sm text-blue-800">
            💡 <strong>Tip:</strong> Denk aan waar AI je kan ondersteunen zonder je authenticiteit te verliezen.
          </div>

          <Button onClick={() => setStep(2)} className="w-full">
            Volgende <Lucide.ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Step 2: Concerns */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold mb-2">Wat zijn je zorgen over AI in dating?</h3>
            <p className="text-gray-600 text-sm mb-4">
              Welke risico's zie je? Maakt AI dating oppervlakkiger, of verlies je je authenticiteit?
            </p>
          </div>

          <Textarea
            value={answers.concerns}
            onChange={(e) => setAnswers({ ...answers, concerns: e.target.value })}
            placeholder="Bijvoorbeeld: 'Ik maak me zorgen dat AI-profielen allemaal op elkaar gaan lijken, waardoor het moeilijker wordt om op te vallen...'"
            rows={6}
            className="resize-none"
          />

          <div className="bg-orange-50 border-l-4 border-orange-400 p-3 text-sm text-orange-800">
            🤔 <strong>Reflectie:</strong> Welke ervaringen heb je al gehad met AI-tools in dating?
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

      {/* Step 3: Benefits */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold mb-2">Welke voordelen verwacht je van AI-tools?</h3>
            <p className="text-gray-600 text-sm mb-4">
              Hoe kan AI je helpen om betere resultaten te behalen in dating?
            </p>
          </div>

          <Textarea
            value={answers.benefits}
            onChange={(e) => setAnswers({ ...answers, benefits: e.target.value })}
            placeholder="Bijvoorbeeld: 'AI kan me helpen om mijn profielfoto's te analyseren en suggesties geven voor verbetering...'"
            rows={6}
            className="resize-none"
          />

          <div className="bg-green-50 border-l-4 border-green-500 p-3 text-sm text-green-800">
            ✨ <strong>Voorbeeld:</strong> AI kan je tijd besparen, objectieve feedback geven, en je helpen buiten je comfortzone te treden.
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

      {/* Step 4: Boundaries */}
      {step === 4 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold mb-2">Welke grenzen stel je aan AI-gebruik?</h3>
            <p className="text-gray-600 text-sm mb-4">
              Waar trek je de lijn? Wanneer blijft het menselijke element centraal staan?
            </p>
          </div>

          <Textarea
            value={answers.boundaries}
            onChange={(e) => setAnswers({ ...answers, boundaries: e.target.value })}
            placeholder="Bijvoorbeeld: 'AI mag mijn tekst verbeteren, maar niet herschrijven. De kern moet van mij komen...'"
            rows={6}
            className="resize-none"
          />

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <h4 className="font-semibold text-blue-900 mb-2">📋 Preview van je post:</h4>
            <div className="text-sm text-blue-800 space-y-1">
              {answers.aiRole && <p>✓ Visie op AI-rol gedeeld</p>}
              {answers.concerns && <p>✓ Zorgen benoemd</p>}
              {answers.benefits && <p>✓ Voordelen beschreven</p>}
              {answers.boundaries && <p>✓ Grenzen gesteld</p>}
              {!answers.aiRole && !answers.concerns && !answers.benefits && !answers.boundaries && (
                <p className="text-orange-600">⚠️ Vul tenminste één veld in om te posten</p>
              )}
            </div>
          </div>

          <div className="bg-blue-100 border-2 border-blue-500 rounded-lg p-4 text-center">
            <p className="font-bold text-blue-900 text-lg">
              💭 AI als tool, niet als vervanging voor menselijke connectie
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
          onClick={() => window.open('/community?category=6', '_blank')}
        >
          <Lucide.ExternalLink className="h-4 w-4 mr-2" />
          Ga naar forum zonder post te maken
        </Button>
      </div>
    </div>
  );
}