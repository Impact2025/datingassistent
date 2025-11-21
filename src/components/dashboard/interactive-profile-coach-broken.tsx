'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/providers/user-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  ChevronLeft,
  ChevronRight,
  Target,
  CheckCircle,
  ArrowRight,
  RotateCcw,
  Copy,
  User,
  FileText,
  HelpCircle
} from 'lucide-react';
import { refineDatingProfile } from '@/ai/flows/refine-dating-profile';
import { ContextualTooltip } from '@/components/shared/contextual-tooltip';
import { useToolCompletion } from '@/hooks/use-tool-completion';
import { ProfileResults } from './profile-results';

// Advanced Personality & Authenticity Assessment
const PERSONALITY_QUIZ = [
  // Phase 1: Core Personality (Original 8 questions - optimized)
  {
    id: 'personality',
    question: 'Beschrijf jezelf in drie kernwoorden',
    subtitle: 'Dit helpt ons je authentieke persoonlijkheid te identificeren',
    type: 'radio',
    phase: 1,
    category: 'personality',
    options: [
      { id: 'adventurous', label: 'Avontuurlijk & Spontaan', description: 'Nieuwe ervaringen en spontaniteit staan centraal' },
      { id: 'reliable', label: 'Betrouwbaar & Stabiel', description: 'Consistentie en betrouwbaarheid zijn belangrijk' },
      { id: 'creative', label: 'Creatief & Innovatief', description: 'Originele ideeën en buiten-de-kaders-denken' },
      { id: 'social', label: 'Sociaal & Energiek', description: 'Mensen verbinden en energie uitwisselen' }
    ]
  },
  {
    id: 'social_energy',
    question: 'Hoe energiek ben je in sociale interacties?',
    subtitle: '1 = Introvert en observerend, 10 = Extravert en expressief',
    type: 'slider',
    phase: 1,
    category: 'personality',
    min: 1,
    max: 10,
    labels: ['Introvert & Observerend', 'Neutraal', 'Extravert & Expressief']
  },
  {
    id: 'relationship',
    question: 'Wat is je primaire relatie doelstelling?',
    subtitle: 'Dit bepaalt de strategische richting van je profiel',
    type: 'radio',
    phase: 1,
    category: 'relationship',
    options: [
      { id: 'deep', label: 'Diepe Emotionele Connectie', description: 'Betekenisvolle gesprekken en gedeelde levenswaarden' },
      { id: 'fun', label: 'Gezamenlijke Ervaringen', description: 'Quality time en gedeelde activiteiten' },
      { id: 'adventure', label: 'Gedeelde Ontdekkingen', description: 'Nieuwe ervaringen en gezamenlijke groei' },
      { id: 'laughter', label: 'Positieve Energie', description: 'Humor en zorgeloosheid in dagelijkse interacties' }
    ]
  },
  {
    id: 'confidence_level',
    question: 'Hoe comfortabel voel je je in dating situaties?',
    subtitle: '1 = Voorzichtig en terughoudend, 10 = Volledig zelfverzekerd',
    type: 'slider',
    phase: 1,
    category: 'personality',
    min: 1,
    max: 10,
    labels: ['Voorzichtig & Terughoudend', 'Neutraal', 'Zelfverzekerd & Comfortabel']
  },
  {
    id: 'style',
    question: 'Welke communicatiestijl past bij jou?',
    subtitle: 'Dit bepaalt de toon van je profiel communicatie',
    type: 'radio',
    phase: 1,
    category: 'communication',
    options: [
      { id: 'direct', label: 'Direct & Efficiënt', description: 'Duidelijke communicatie zonder omwegen' },
      { id: 'playful', label: 'Lichtvoetig & Aantrekkelijk', description: 'Balans tussen ernst en plezier' },
      { id: 'deep', label: 'Diepgaand & Reflectief', description: 'Betekenisvolle en intrigerende gesprekken' },
      { id: 'humorous', label: 'Humorvol & Ontspannen', description: 'Humor als verbindend element' }
    ]
  },
  {
    id: 'romantic_style',
    question: 'Wat is je romantische oriëntatie?',
    subtitle: '1 = Pragmatisch en rationeel, 10 = Romantisch en idealistisch',
    type: 'slider',
    phase: 1,
    category: 'relationship',
    min: 1,
    max: 10,
    labels: ['Pragmatisch & Rationeel', 'Neutraal', 'Romantisch & Idealistisch']
  },
  {
    id: 'content',
    question: 'Welke aspecten wil je benadrukken?',
    subtitle: 'Focus op je unieke sterke punten',
    type: 'radio',
    phase: 1,
    category: 'content',
    options: [
      { id: 'personality', label: 'Persoonlijkheid & Karakter', description: 'Authenticiteit en wie je werkelijk bent' },
      { id: 'interests', label: 'Interesses & Passies', description: 'Wat je drijft en motiveert' },
      { id: 'ambitions', label: 'Ambities & Groei', description: 'Je doelen en ontwikkelingsgerichtheid' },
      { id: 'lifestyle', label: 'Levensstijl & Ervaringen', description: 'Hoe je je leven invult' }
    ]
  },
  {
    id: 'tone',
    question: 'Welke eerste indruk wil je maken?',
    subtitle: 'De strategische positionering van je profiel',
    type: 'radio',
    phase: 1,
    category: 'presentation',
    options: [
      { id: 'approachable', label: 'Benaderbaar & Open', description: 'Makkelijk in contact te komen' },
      { id: 'mysterious', label: 'Intrigerend & Geheimzinnig', description: 'Nieuwsgierigheid wekken' },
      { id: 'confident', label: 'Zelfverzekerd & Competent', description: 'Professionaliteit en succes uitstralen' },
      { id: 'carefree', label: 'Ontspannen & Authentiek', description: 'Natuurlijkheid en zorgeloosheid' }
    ]
  },

  // Phase 2: Authenticity Enhancement (New Advanced Features)
  {
    id: 'authenticity_samples',
    question: 'Voorbeelden van je schrijfstijl',
    subtitle: 'Deel 2-3 berichten of profielteksten die je eerder succesvol hebt gebruikt',
    type: 'textarea',
    phase: 2,
    category: 'authenticity',
    placeholder: 'Bijv: "Ik ben dol op lange wandelingen in de natuur, waar ik tot rust kom en nieuwe energie opdoe. Wat is jouw favoriete manier om te ontspannen?"',
    required: false
  },
  {
    id: 'pet_peeve',
    question: 'Wat is één specifieke ergernis van je?',
    subtitle: 'Dit voegt karakter toe aan je profiel met een luchtige twist',
    type: 'text',
    phase: 2,
    category: 'authenticity',
    placeholder: 'Bijv: "Mensen die altijd te laat komen" of "Sokken die overal rondslingeren"',
    required: false
  },
  {
    id: 'vivid_memory',
    question: 'Beschrijf een levendige herinnering',
    subtitle: 'Deel details over een memorabel moment uit je favoriete activiteit',
    type: 'textarea',
    phase: 2,
    category: 'storytelling',
    placeholder: 'Bijv: "Tijdens mijn laatste wandeling in de Veluwe rook ik de vochtige aarde, hoorde ik de wind door de bomen en voelde ik me volledig vrij..."',
    required: false
  },
  {
    id: 'high_low_balance',
    question: 'Ambities en alledaagse gewoontes',
    subtitle: 'Deel één grote ambitie en één onnozele gewoonte voor balans',
    type: 'dual_text',
    phase: 2,
    category: 'balance',
    fields: [
      { id: 'ambition', label: 'Grote ambitie (5 jaar)', placeholder: 'Bijv: "De wereld rondreizen en nieuwe culturen ontdekken"' },
      { id: 'habit', label: 'Onnozele gewoonte', placeholder: 'Bijv: "Elke avond naar kattenfilmpjes kijken"' }
    ],
    required: false
  },
  {
    id: 'call_to_action',
    question: 'Kies je Call-to-Action',
    subtitle: 'Selecteer de openingszin die het beste bij je past',
    type: 'cta_selection',
    phase: 2,
    category: 'presentation',
    required: true
  }
];

interface QuizAnswer {
  questionId: string;
  answerId: string;
  label: string;
  content?: string; // For textarea and text inputs
  fields?: Record<string, string>; // For dual_text inputs
}

interface ProfileOption {
  id: string;
  title: string;
  content: string;
  score: number;
  strengths: string[];
  improvements: string[];
}

interface WizardState {
  currentStep: number;
  answers: QuizAnswer[];
  generatedProfiles: ProfileOption[];
  selectedProfile: string | null;
  isGenerating: boolean;
  completed: boolean;
}

export function InteractiveProfileCoach() {
  const { userProfile, user } = useUser();
  const { markAsCompleted } = useToolCompletion('profiel-coach');
  const [state, setState] = useState<WizardState>({
    currentStep: 0,
    answers: [],
    generatedProfiles: [],
    selectedProfile: null,
    isGenerating: false,
    completed: false
  });

  const currentQuestion = PERSONALITY_QUIZ[state.currentStep];
  const progress = ((state.currentStep + 1) / PERSONALITY_QUIZ.length) * 100;

  const handleAnswer = (answerId: string, label: string, content?: string, fields?: Record<string, string>) => {
    const newAnswer: QuizAnswer = {
      questionId: currentQuestion.id,
      answerId,
      label,
      content,
      fields
    };

    setState(prev => ({
      ...prev,
      answers: [...prev.answers.filter(a => a.questionId !== currentQuestion.id), newAnswer]
    }));
  };

  const handleNext = () => {
    if (state.currentStep < PERSONALITY_QUIZ.length - 1) {
      setState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
    } else {
      generateProfiles();
    }
  };

  const handlePrevious = () => {
    setState(prev => ({ ...prev, currentStep: Math.max(0, prev.currentStep - 1) }));
  };

  const generateProfiles = async () => {
    setState(prev => ({ ...prev, isGenerating: true }));

    // Track quiz completion in database
    await markAsCompleted('quiz_completed', {
      questions_answered: state.answers.length
    });

    try {
      // Extract different types of answers
      const personalityAnswers = state.answers.filter(a => PERSONALITY_QUIZ.find(q => q.id === a.questionId)?.phase === 1);
      const authenticityAnswers = state.answers.filter(a => PERSONALITY_QUIZ.find(q => q.id === a.questionId)?.phase === 2);

      // Create comprehensive profile data
      const profileData = {
        // Basic personality keywords
        personality: personalityAnswers.map(a => a.label).join(', '),

        // Authenticity data
        writingSamples: authenticityAnswers.find(a => a.questionId === 'authenticity_samples')?.content || '',
        petPeeve: authenticityAnswers.find(a => a.questionId === 'pet_peeve')?.content || '',
        vividMemory: authenticityAnswers.find(a => a.questionId === 'vivid_memory')?.content || '',

        // High-low balance
        ambition: authenticityAnswers.find(a => a.questionId === 'high_low_balance')?.fields?.ambition || '',
        habit: authenticityAnswers.find(a => a.questionId === 'high_low_balance')?.fields?.habit || '',
      };

      // Generate 3 different profile variations
      const profiles: ProfileOption[] = [];

      for (let i = 0; i < 3; i++) {
        const variation = i === 0 ? 'luchtig' : i === 1 ? 'serieus' : 'nieuwsgierig';

        // Create enhanced keywords including authenticity data
        const enhancedKeywords = [
          profileData.personality,
          profileData.writingSamples && `Schrijfstijl: ${profileData.writingSamples.substring(0, 100)}`,
          profileData.petPeeve && `Ergernis: ${profileData.petPeeve}`,
          profileData.vividMemory && `Herinnering: ${profileData.vividMemory.substring(0, 100)}`,
          profileData.ambition && `Ambitie: ${profileData.ambition}`,
          profileData.habit && `Gewoonte: ${profileData.habit}`,
        ].filter(Boolean).join('. ');

        const result = await refineDatingProfile({
          name: userProfile?.name || 'Gebruiker',
          age: userProfile?.age || 25,
          gender: userProfile?.gender || 'other',
          location: userProfile?.location || 'Nederland',
          seekingGender: userProfile?.seekingGender || ['man', 'woman'],
          seekingAgeMin: userProfile?.seekingAgeMin || 20,
          seekingAgeMax: userProfile?.seekingAgeMax || 35,
          seekingType: userProfile?.seekingType || 'relationship',
          identityGroup: userProfile?.identityGroup || 'mainstream',
          tone: variation,
          keywords: enhancedKeywords + `, variatie ${i + 1}`,
        });

        profiles.push({
          id: `profile-${i + 1}`,
          title: i === 0 ? 'Lichtvoetig & Aantrekkelijk' : i === 1 ? 'Serieus & Betrouwbaar' : 'Mysterieus & Intrigerend',
          content: result.refinedProfile,
          score: Math.floor(75 + Math.random() * 20), // Mock score
          strengths: [
            'Sterke persoonlijkheid',
            'Duidelijke interesses',
            'Goede balans tussen humor en diepgang'
          ],
          improvements: [
            'Kan iets korter voor Tinder',
            'Meer specifieke hobby\'s toevoegen'
          ]
        });
      }

      setState(prev => ({
        ...prev,
        generatedProfiles: profiles,
        isGenerating: false,
        completed: true
      }));

      // Track bio generation in database
      await markAsCompleted('bio_generated', {
        profiles_count: profiles.length
      });

      // Track activity for progress system
      if (user?.id) {
        try {
          await fetch('/api/activity/track', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.id,
              activityType: 'profile_coach',
              data: {
                profilesGenerated: profiles.length,
                personalityAnswers: state.answers.length,
                quizCompleted: true
              }
            })
          });
        } catch (error) {
          console.error('Failed to track activity:', error);
          // Non-blocking error - continue even if tracking fails
        }
      }

    } catch (error) {
      console.error('Profile generation error:', error);
      setState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  const resetWizard = () => {
    setState({
      currentStep: 0,
      answers: [],
      generatedProfiles: [],
      selectedProfile: null,
      isGenerating: false,
      completed: false
    });
  };

  const currentAnswer = state.answers.find(a => a.questionId === currentQuestion.id);

  const canProceed = () => {
    if (!currentAnswer) return false;

    if (currentQuestion.type === 'slider') {
      // For slider questions, any value is valid
      return true;
    }

    if (currentQuestion.type === 'textarea' || currentQuestion.type === 'text') {
      // For text inputs, check if content exists (unless optional)
      return currentQuestion.required ? !!currentAnswer.content?.trim() : true;
    }

    if (currentQuestion.type === 'dual_text') {
      // For dual text inputs, check if both fields have content (unless optional)
      if (!currentQuestion.required) return true;
      const fields = currentAnswer.fields || {};
      return currentQuestion.fields?.every(field => fields[field.id]?.trim()) || false;
    }

    // For radio questions, check if an answer exists
    return !!currentAnswer.answerId;
  };

  if (state.completed && state.generatedProfiles.length > 0) {
    return (
      <ProfileResults
        profiles={state.generatedProfiles}
        answers={state.answers}
        onReset={resetWizard}
        markAsCompleted={markAsCompleted}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">🤖 AI Profiel Bouwer</h2>
          <p className="text-sm text-muted-foreground">
            Maak je ideale profieltekst met AI hulp
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {/* TODO: Add tutorial */}}
          className="gap-2"
        >
          <HelpCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Tutorial</span>
        </Button>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium">
              Vraag {state.currentStep + 1} van {PERSONALITY_QUIZ.length}
            </span>
            <span className="text-sm font-medium text-primary">
              {Math.round(progress)}% compleet
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{currentQuestion.question}</CardTitle>
          <p className="text-sm text-muted-foreground">{currentQuestion.subtitle}</p>
        </CardHeader>
        <CardContent>
          {currentQuestion.type === 'slider' ? (
            <div className="space-y-6 mb-6">
              <div className="px-2">
                <Slider
                  value={[parseInt(currentAnswer?.answerId || '5')]}
                  onValueChange={(value) => handleAnswer(value[0].toString(), `${value[0]}`)}
                  max={currentQuestion.max}
                  min={currentQuestion.min}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{currentQuestion.labels?.[0]}</span>
                <span className="font-medium text-lg">
                  {currentAnswer?.answerId || 5}
                </span>
                <span>{currentQuestion.labels?.[2]}</span>
              </div>
            </div>
          ) : currentQuestion.type === 'textarea' ? (
            <div className="space-y-4 mb-6">
              <textarea
                value={currentAnswer?.content || ''}
                onChange={(e) => handleAnswer('textarea', 'Textarea input', e.target.value)}
                placeholder={currentQuestion.placeholder}
                className="w-full p-4 border rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={4}
              />
              <p className="text-sm text-muted-foreground">
                {!currentQuestion.required && 'Optioneel: '}
                Deel specifieke details voor een authentieker profiel
              </p>
            </div>
          ) : currentQuestion.type === 'text' ? (
            <div className="space-y-4 mb-6">
              <input
                type="text"
                value={currentAnswer?.content || ''}
                onChange={(e) => handleAnswer('text', 'Text input', e.target.value)}
                placeholder={currentQuestion.placeholder}
                className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-sm text-muted-foreground">
                {!currentQuestion.required && 'Optioneel: '}
                Dit voegt een unieke twist toe aan je profiel
              </p>
            </div>
          ) : currentQuestion.type === 'dual_text' ? (
            <div className="space-y-4 mb-6">
              {currentQuestion.fields?.map((field) => (
                <div key={field.id} className="space-y-2">
                  <label className="text-sm font-medium">{field.label}</label>
                  <input
                    type="text"
                    value={currentAnswer?.fields?.[field.id] || ''}
                    onChange={(e) => {
                      const currentFields = currentAnswer?.fields || {};
                      handleAnswer('dual_text', 'Dual text input', undefined, {
                        ...currentFields,
                        [field.id]: e.target.value
                      });
                    }}
                    placeholder={field.placeholder}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              ))}
              <p className="text-sm text-muted-foreground">
                {!currentQuestion.required && 'Optioneel: '}
                Dit creëert balans tussen ambitie en benaderbaarheid
              </p>
            </div>
          ) : currentQuestion.type === 'cta_selection' ? (
            <div className="space-y-4 mb-6">
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-4">
                  Kies één van deze openingszinnen die aan het einde van je profiel komt.
                  Dit helpt matches om gemakkelijk contact op te nemen.
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { id: 'debate', text: 'Swipe rechts als je het eens bent dat...', description: 'Start een discussie' },
                    { id: 'challenge', text: 'Daag me uit voor een potje...', description: 'Maak het interactief' },
                    { id: 'question', text: 'Wat is het raarste wat je ooit hebt gegeten?', description: 'Stel een vraag' }
                  ].map((cta) => {
                    const isSelected = currentAnswer?.answerId === cta.id;
                    return (
                      <button
                        key={cta.id}
                        onClick={() => handleAnswer(cta.id, cta.text)}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <p className="font-medium text-sm">"{cta.text}"</p>
                            <p className="text-xs text-muted-foreground mt-1">{cta.description}</p>
                          </div>
                          {isSelected && (
                            <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 mb-6">
              {currentQuestion.options?.map((option) => {
                const isSelected = currentAnswer?.answerId === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleAnswer(option.id, option.label)}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <h4 className="font-medium">{option.label}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                      </div>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={state.currentStep === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Vorige
            </Button>

            {state.currentStep === PERSONALITY_QUIZ.length - 1 ? (
              <ContextualTooltip content="We genereren 3 professionele profiel opties gebaseerd op je antwoorden.">
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                >
                  <Target className="w-4 h-4 mr-2" />
                  Genereer Profielen
                </Button>
              </ContextualTooltip>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
              >
                Volgende
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {state.isGenerating && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Analyse wordt uitgevoerd...</h3>
            <p className="text-muted-foreground">
              We verwerken je antwoorden en genereren professionele profiel opties
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
*/

// Temporary replacement function
function ProfileResults({ profiles, answers, onReset, markAsCompleted }: any) {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Profiel Analyse Compleet</h2>
        <p className="text-muted-foreground mb-6">
          Op basis van je antwoorden hebben we {profiles?.length || 3} professionele profiel opties gegenereerd.
        </p>
        <button
          onClick={onReset}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          Opnieuw Beginnen
        </button>
      </div>
    </div>
  );
}

// Results Component - Temporarily commented out due to syntax error
/*
interface ProfileResultsProps {
  profiles: ProfileOption[];
  answers: QuizAnswer[];
  onReset: () => void;
  markAsCompleted: (actionName: string, metadata?: Record<string, any>) => Promise<boolean>;
}

function ProfileResults({ profiles, answers, onReset, markAsCompleted }: ProfileResultsProps) {
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (profileId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(profileId);

      // Track bio copy in database
      await markAsCompleted('bio_copied', {
        profile_id: profileId
      });

      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Profiel Analyse Compleet
          </CardTitle>
          <p className="text-muted-foreground">
            Op basis van je antwoorden hebben we 3 professionele profiel opties gegenereerd.
          </p>
        </CardHeader>
      </Card>

      {/* Quiz Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Analyse Resultaten
            <ContextualTooltip
              content="Deze kenmerken zijn gebruikt om je profielen te genereren."
              showIcon
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {answers.map((answer, index) => (
              <div key={index} className="text-center p-3 border rounded-lg">
                <div className="text-sm font-medium">{answer.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Profile Options */}
      <div className="space-y-6">
        {/* Profile Titles - Display horizontally */}
        <div className="flex justify-center gap-4 mb-6">
          {profiles.map((profile) => (
            <div key={`title-${profile.id}`} className="text-center">
              <h3 className={`text-lg font-semibold px-4 py-2 rounded-lg transition-colors ${
                selectedProfile === profile.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}>
                {profile.title}
              </h3>
            </div>
          ))}
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <Card key={profile.id} className={`cursor-pointer transition-all ${
              selectedProfile === profile.id ? 'ring-2 ring-primary shadow-sm' : 'hover:shadow-sm'
            }`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">
                    Score: {profile.score}
                  </Badge>
                  <ContextualTooltip content="Kopieer deze tekst naar je dating app profiel">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(profile.id, profile.content);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className={`w-4 h-4 ${copiedId === profile.id ? 'text-primary' : ''}`} />
                    </Button>
                  </ContextualTooltip>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-muted/30 p-4 rounded-lg max-h-48 overflow-y-auto relative">
                    {copiedId === profile.id && (
                      <div className="absolute top-2 right-2 bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                        Gekopieerd
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-line">
                      {profile.content.length > 200
                        ? profile.content.substring(0, 200) + '...'
                        : profile.content
                      }
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">{profile.strengths[0]}</span>
                    </div>
                    <div className="flex items-center gap-2 text-orange-700">
                      <Target className="w-4 h-4" />
                      <span className="text-sm">{profile.improvements[0]}</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => setSelectedProfile(profile.id)}
                    variant={selectedProfile === profile.id ? "default" : "outline"}
                    className="w-full"
                  >
                    {selectedProfile === profile.id ? 'Geselecteerd' : 'Selecteren'}
                  </Button>
                </div>
              </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onReset}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Opnieuw Beginnen
            </Button>

            {selectedProfile && (
              <Button className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4" />
                Profiel Gebruiken
              </Button>
            )}
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Kopieer je favoriete profiel naar je dating apps voor optimale resultaten.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}