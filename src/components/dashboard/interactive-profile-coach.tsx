'use client';

import { useState, useEffect, useMemo } from 'react';
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
  HelpCircle,
  UserCircle2
} from 'lucide-react';
import { refineDatingProfile } from '@/ai/flows/refine-dating-profile';
import { ContextualTooltip } from '@/components/shared/contextual-tooltip';
import { TutorialModal, useTutorial } from '@/components/shared/tutorial-modal';
import { useToolCompletion } from '@/hooks/use-tool-completion';
import { ProfileResults } from './profile-results';
import { abTesting, useABTest } from '@/lib/ab-testing';
import { profileAnalytics, useProfileAnalytics } from '@/lib/profile-analytics';
import { ErrorBoundary, useErrorHandler } from '@/components/shared/error-boundary';

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

export const InteractiveProfileCoach = () => {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('InteractiveProfileCoach error:', error, errorInfo);
        // Could send to error reporting service here
      }}
    >
      <InteractiveProfileCoachInner />
    </ErrorBoundary>
  );
};

function InteractiveProfileCoachInner() {
  const { userProfile, user } = useUser();
  const { markAsCompleted } = useToolCompletion('profiel-coach');
  const { getVariant: getQuizVariant, trackConversion: trackQuizConversion } = useABTest('quiz_flow');
  const { getVariant: getAIVariant, trackConversion: trackAIConversion } = useABTest('ai_prompts');
  const { getVariant: getProfileVariant, trackConversion: trackProfileConversion } = useABTest('profile_variants');
  const { trackEvent, calculateQuality } = useProfileAnalytics();
  const handleError = useErrorHandler();
  const { showTutorial, startTutorial, completeTutorial, setShowTutorial } = useTutorial('profile-coach');

  // Generate session ID for analytics
  const sessionId = useMemo(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, []);

  const [state, setState] = useState<WizardState>({
    currentStep: 0,
    answers: [],
    generatedProfiles: [],
    selectedProfile: null,
    isGenerating: false,
    completed: false
  });

  // Get A/B test variants for this user
  const quizVariant = user?.id ? getQuizVariant(user.id.toString()) : null;
  const aiVariant = user?.id ? getAIVariant(user.id.toString()) : null;
  const profileVariant = user?.id ? getProfileVariant(user.id.toString()) : null;

  // Track quiz start
  useEffect(() => {
    if (user?.id) {
      trackEvent({
        userId: user.id.toString(),
        sessionId,
        eventType: 'quiz_start',
        metadata: {
          ab_test_variant: quizVariant?.id,
          user_agent: navigator.userAgent,
          referrer: document.referrer
        }
      });
    }
  }, [user?.id, sessionId, trackEvent, quizVariant]);

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

    // Track quiz completion event
    if (user?.id) {
      trackEvent({
        userId: user.id.toString(),
        sessionId,
        eventType: 'quiz_complete',
        metadata: {
          questions_answered: state.answers.length,
          ab_test_variant: quizVariant?.id,
          completion_time: Date.now() // Will be calculated from start time
        }
      });

      // Track A/B test conversion
      if (quizVariant) {
        trackQuizConversion(quizVariant.id, user.id.toString(), 'quiz_complete');
      }
    }

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

      // Determine number of profiles based on A/B test
      const profileCount = profileVariant?.config?.variantCount || 3;
      const variantTypes = profileVariant?.config?.variantTypes || ['luchtig', 'serieus', 'mysterieus'];

      // Generate profiles based on A/B test variant
      const profiles: ProfileOption[] = [];

      for (let i = 0; i < profileCount; i++) {
        const variation = variantTypes[i] || variantTypes[0];

        // Create enhanced keywords including authenticity data
        const enhancedKeywords = [
          profileData.personality,
          profileData.writingSamples && `Schrijfstijl: ${profileData.writingSamples.substring(0, 100)}`,
          profileData.petPeeve && `Ergernis: ${profileData.petPeeve}`,
          profileData.vividMemory && `Herinnering: ${profileData.vividMemory.substring(0, 100)}`,
          profileData.ambition && `Ambitie: ${profileData.ambition}`,
          profileData.habit && `Gewoonte: ${profileData.habit}`,
        ].filter(Boolean).join('. ');

        // Apply AI prompt variant
        const aiConfig = aiVariant?.config || {};
        const promptTone = aiConfig.promptStyle === 'cultural' ? variation :
                           aiConfig.promptStyle === 'personalized' ? 'persoonlijk' : variation;

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
          tone: promptTone,
          keywords: enhancedKeywords + `, variatie ${i + 1}`,
        });

        // Calculate profile quality score
        const qualityMetrics = calculateQuality(result.refinedProfile);

        profiles.push({
          id: `profile-${i + 1}`,
          title: i === 0 ? 'Lichtvoetig & Aantrekkelijk' :
                 i === 1 ? 'Serieus & Betrouwbaar' :
                 i === 2 ? 'Mysterieus & Intrigerend' :
                 i === 3 ? 'Ambitieus & Gedreven' : 'Creatief & Origineel',
          content: result.refinedProfile,
          score: qualityMetrics.overallScore,
          strengths: [
            qualityMetrics.engagementPotential > 70 ? 'Hoge engagement potentie' : 'Goede persoonlijkheid',
            qualityMetrics.culturalRelevance > 60 ? 'Cultureel relevant' : 'Duidelijke interesses',
            qualityMetrics.readabilityScore > 70 ? 'Goede leesbaarheid' : 'Goede balans tussen humor en diepgang'
          ],
          improvements: [
            qualityMetrics.length < 80 ? 'Kan iets langer voor meer diepgang' : 'Optimale lengte',
            qualityMetrics.uniquenessScore < 70 ? 'Meer unieke elementen toevoegen' : 'Goede uniciteit',
            qualityMetrics.engagementPotential < 60 ? 'Meer interactieve elementen' : 'Goede engagement'
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
      handleError(error as Error, { componentStack: 'InteractiveProfileCoach.generateProfiles' });
      setState(prev => ({ ...prev, isGenerating: false }));

      // Show user-friendly error message
      alert('Er is een fout opgetreden bij het genereren van profielen. Probeer het opnieuw.');
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
        <div className="flex items-center gap-2">
          <UserCircle2 className="w-6 h-6 text-pink-600" />
          <h2 className="text-2xl font-bold text-pink-600">AI Profiel Bouwer</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={startTutorial}
          className="gap-2 text-pink-600 border-pink-200 hover:bg-pink-50"
        >
          <HelpCircle className="w-4 h-4 text-pink-600" />
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

      {/* Tutorial Modal */}
      <TutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        toolId="profile-coach"
        toolName="AI Profiel Bouwer"
        steps={[
          {
            title: "Welkom bij de AI Profiel Bouwer! 🤖",
            content: "Deze tool helpt je om professionele dating profielen te maken met behulp van AI. We stellen je 10 slimme vragen om je persoonlijkheid en voorkeuren te leren kennen, waarna we 3 unieke profiel opties genereren.",
            tips: [
              "Wees eerlijk in je antwoorden - dit geeft de beste resultaten",
              "Neem je tijd, er is geen haast",
              "Je kunt altijd teruggaan om antwoorden aan te passen"
            ]
          },
          {
            title: "Stap 1-4: Je Kern Persoonlijkheid",
            content: "De eerste vragen gaan over je kernpersoonlijkheid. Kies de woorden en eigenschappen die jou het beste beschrijven. Dit vormt de basis van je profiel.",
            action: {
              text: "Bekijk de eerste vraag hieronder om te zien hoe het werkt.",
              target: ".space-y-6 > div:nth-child(3)"
            },
            tips: [
              "Kies altijd de optie die het dichtst bij jou ligt",
              "Sommige vragen hebben een schuifbalk voor nuances",
              "Er zijn geen foute antwoorden - het gaat om authenticiteit"
            ]
          },
          {
            title: "Stap 5-8: Diepere Inzichten",
            content: "Deze vragen gaan dieper in op je relatievoorkeuren, communicatiestijl en hoe je overkomt op anderen. Dit helpt ons om profielen te maken die perfect bij je passen.",
            tips: [
              "Denk na over hoe je wilt overkomen",
              "Je communicatiestijl beïnvloedt de toon van je profiel",
              "We houden rekening met Nederlandse dating cultuur"
            ]
          },
          {
            title: "Stap 9-10: Authenticiteit & Storytelling",
            content: "De laatste vragen voegen unieke, authentieke elementen toe aan je profiel. Deel verhalen, gewoontes of ergernissen die jou uniek maken.",
            tips: [
              "Authenticiteit trekt betere matches aan",
              "Persoonlijke verhalen maken je profiel memorabel",
              "Deze details maken je profiel onderscheidend"
            ]
          },
          {
            title: "AI Generatie & Resultaten",
            content: "Nadat je alle vragen hebt beantwoord, genereert onze AI 3 verschillende profiel opties. Elk profiel heeft een unieke toon en aanpak, maar ze zijn allemaal gebaseerd op jouw antwoorden.",
            tips: [
              "Je krijgt altijd 3 verschillende opties om uit te kiezen",
              "Elk profiel heeft een score en verbeterpunten",
              "Je kunt profielen kopiëren naar je dating apps"
            ]
          },
          {
            title: "Pro Tips voor Succes 💡",
            content: "Om het maximale uit deze tool te halen: Test verschillende profielen, meet welke het beste werken, en pas je aanpak aan. Succesvolle dating is een leerproces!",
            tips: [
              "Test A/B: Gebruik verschillende profielen tegelijk",
              "Track je resultaten om te zien wat werkt",
              "Blijf jezelf - authenticiteit wint altijd",
              "Gebruik de voortgang tracker om je verbetering te zien"
            ]
          }
        ]}
        onComplete={completeTutorial}
      />
    </div>
  );
}