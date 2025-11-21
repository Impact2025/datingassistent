'use client';

import { useState } from 'react';
import { useUser } from '@/providers/user-provider';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import * as Lucide from 'lucide-react';

interface ReflectionAnswers {
  whichVsRecognized: string[];
  personalExperience: string;
  whatLearned: string;
  futureActions: string;
}

export default function RedFlagsForumPostGenerator() {
  const { user } = useUser();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postCreated, setPostCreated] = useState(false);

  const [answers, setAnswers] = useState<ReflectionAnswers>({
    whichVsRecognized: [],
    personalExperience: '',
    whatLearned: '',
    futureActions: ''
  });

  const vOptions = [
    { id: 'v1', label: 'V1 – Vage foto\'s/info', icon: '🔍' },
    { id: 'v2', label: 'V2 – Vlotte oppervlakkige praat', icon: '💬' },
    { id: 'v3', label: 'V3 – Verhalen vol drama', icon: '⛈️' },
    { id: 'v4', label: 'V4 – Verdoezelde antwoorden', icon: '❓' },
    { id: 'v5', label: 'V5 – Verliefdheidsbombardement', icon: '❤️‍🔥' },
    { id: 'v6', label: 'V6 – Verleggen van grenzen', icon: '🚨' }
  ];

  const toggleV = (vId: string) => {
    setAnswers(prev => ({
      ...prev,
      whichVsRecognized: prev.whichVsRecognized.includes(vId)
        ? prev.whichVsRecognized.filter(id => id !== vId)
        : [...prev.whichVsRecognized, vId]
    }));
  };

  const generateForumPost = (): { title: string; content: string } => {
    const selectedVLabels = answers.whichVsRecognized
      .map(id => vOptions.find(v => v.id === id))
      .filter(Boolean)
      .map(v => v!.label)
      .join(', ');

    const title = `Mijn ervaring met${answers.whichVsRecognized.length > 0 ? `: ${selectedVLabels}` : ' de 5 V\'s'}`;

    const content = `
## 🎯 Welke rode vlaggen heb ik herkend?

${answers.whichVsRecognized.length > 0
  ? answers.whichVsRecognized.map(id => {
      const v = vOptions.find(opt => opt.id === id);
      return `${v!.icon} **${v!.label}**`;
    }).join('\n')
  : '_Nog geen specifieke rode vlaggen herkend in eigen ervaring_'
}

---

## 💭 Mijn persoonlijke ervaring

${answers.personalExperience || '_Geen ervaring gedeeld_'}

---

## 📚 Wat ik heb geleerd

${answers.whatLearned || '_Nog geen reflectie_'}

---

## 🚀 Hoe ik dit ga toepassen

${answers.futureActions || '_Nog geen actieplan_'}

---

_💛 Gepost vanuit Module: Herken de 5 Rode Vlaggen_
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

    // Validate that at least some content is filled
    if (!answers.whatLearned && !answers.personalExperience && !answers.futureActions) {
      toast({
        title: 'Vul tenminste één veld in',
        description: 'Deel wat je hebt geleerd of je ervaring',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { title, content } = generateForumPost();

      // Post to "Veiligheid & Privacy" category (ID: 5)
      const RED_FLAGS_CATEGORY_ID = 5;

      const response = await fetch('/api/community/forum/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          categoryId: RED_FLAGS_CATEGORY_ID,
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
        description: 'Je ervaringen zijn gedeeld in het forum',
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

  if (postCreated) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
        <div className="text-center">
          <div className="mb-4">
            <Lucide.CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Post succesvol gedeeld! 🎉</h3>
          <p className="text-gray-600 mb-6">
            Je ervaringen en inzichten zijn nu zichtbaar in het forum. Anderen kunnen van je leren!
          </p>

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
                  whichVsRecognized: [],
                  personalExperience: '',
                  whatLearned: '',
                  futureActions: ''
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
          <span className="text-sm text-purple-600">Forum Post Generator</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Which V's did you recognize? */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold mb-2">Welke rode vlaggen heb je herkend?</h3>
            <p className="text-gray-600 text-sm mb-4">
              Selecteer de V's die je herkent uit eigen ervaring of observatie. Je kunt meerdere kiezen.
            </p>
          </div>

          <div className="space-y-2">
            {vOptions.map(v => (
              <button
                key={v.id}
                onClick={() => toggleV(v.id)}
                className={`w-full text-left p-4 rounded-lg border-2 transition ${
                  answers.whichVsRecognized.includes(v.id)
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-300 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>
                    {v.icon} <span className="font-medium">{v.label}</span>
                  </span>
                  {answers.whichVsRecognized.includes(v.id) && (
                    <Lucide.Check className="h-5 w-5 text-purple-600" />
                  )}
                </div>
              </button>
            ))}
          </div>

          <Button onClick={() => setStep(2)} className="w-full">
            Volgende <Lucide.ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Step 2: Personal experience */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold mb-2">Deel je persoonlijke ervaring</h3>
            <p className="text-gray-600 text-sm mb-4">
              Optioneel: Deel een ervaring waarbij je een rode vlag hebt herkend (of gemist). Dit helpt anderen te leren.
            </p>
          </div>

          <Textarea
            value={answers.personalExperience}
            onChange={(e) => setAnswers({ ...answers, personalExperience: e.target.value })}
            placeholder="Bijvoorbeeld: 'Ik heb ooit iemand ontmoet die...'"
            rows={6}
            className="resize-none"
          />

          <div className="bg-blue-50 border-l-4 border-blue-400 p-3 text-sm text-blue-800">
            💡 <strong>Tip:</strong> Je hoeft geen namen of identificeerbare details te delen. Focus op het patroon dat je herkende.
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

      {/* Step 3: What did you learn? */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold mb-2">Wat heb je geleerd?</h3>
            <p className="text-gray-600 text-sm mb-4">
              Reflecteer op je grootste inzicht uit deze module over rode vlaggen.
            </p>
          </div>

          <Textarea
            value={answers.whatLearned}
            onChange={(e) => setAnswers({ ...answers, whatLearned: e.target.value })}
            placeholder="Bijvoorbeeld: 'Ik realiseer me nu dat...'"
            rows={6}
            className="resize-none"
          />

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

      {/* Step 4: Future actions */}
      {step === 4 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold mb-2">Hoe ga je dit toepassen?</h3>
            <p className="text-gray-600 text-sm mb-4">
              Wat ga je anders doen nu je de 5 V's kent? Maak een concreet actieplan voor jezelf.
            </p>
          </div>

          <Textarea
            value={answers.futureActions}
            onChange={(e) => setAnswers({ ...answers, futureActions: e.target.value })}
            placeholder="Bijvoorbeeld: 'Voortaan ga ik...'"
            rows={6}
            className="resize-none"
          />

          <div className="bg-green-50 border-l-4 border-green-500 p-4">
            <h4 className="font-semibold text-green-900 mb-2">📋 Preview van je post:</h4>
            <div className="text-sm text-green-800 space-y-1">
              {answers.whichVsRecognized.length > 0 && (
                <p>✓ {answers.whichVsRecognized.length} rode vlag(gen) herkend</p>
              )}
              {answers.personalExperience && <p>✓ Persoonlijke ervaring gedeeld</p>}
              {answers.whatLearned && <p>✓ Leer inzicht toegevoegd</p>}
              {answers.futureActions && <p>✓ Actieplan gemaakt</p>}
            </div>
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
          onClick={() => window.open('/community', '_blank')}
        >
          <Lucide.ExternalLink className="h-4 w-4 mr-2" />
          Ga naar forum zonder post te maken
        </Button>
      </div>
    </div>
  );
}
