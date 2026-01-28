'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUser } from '@/providers/user-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
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
  UserCircle2,
  Star,
  Trophy,
  Zap,
  Heart,
  Brain,
  MessageCircle,
  Users,
  Sparkles,
  BookOpen,
  Video,
  Mic,
  Camera,
  Award,
  TrendingUp,
  Lightbulb,
  Shield,
  Compass
} from 'lucide-react';
import { refineDatingProfile } from '@/ai/flows/refine-dating-profile';
import { ContextualTooltip } from '@/components/shared/contextual-tooltip';
import { TutorialModal, useTutorial } from '@/components/shared/tutorial-modal';
import { useToolCompletion } from '@/hooks/use-tool-completion';
import { ProfileResults } from './profile-results';
import { abTesting, useABTest } from '@/lib/ab-testing';
import { profileAnalytics, useProfileAnalytics } from '@/lib/profile-analytics';
import { ErrorBoundary, useErrorHandler } from '@/components/shared/error-boundary';

// Professional World-Class Personality & Authenticity Assessment
const PROFESSIONAL_PERSONALITY_QUIZ = [
  // Phase 1: Advanced Core Personality (Big Five + Social Styles)
  {
    id: 'personality_core',
    question: 'Wat zijn je drie kernpersoonlijkheidskenmerken?',
    subtitle: 'Kies de woorden die jou het beste beschrijven - dit vormt de basis van je authentieke profiel',
    type: 'multi_select',
    phase: 1,
    category: 'personality',
    maxSelections: 3,
    options: [
      { id: 'adventurous', label: 'Avontuurlijk', description: 'Nieuwe ervaringen en spontaniteit staan centraal', icon: 'Compass', color: 'blue' },
      { id: 'reliable', label: 'Betrouwbaar', description: 'Consistentie en betrouwbaarheid zijn belangrijk', icon: 'Shield', color: 'green' },
      { id: 'creative', label: 'Creatief', description: 'Originele ideeën en buiten-de-kaders-denken', icon: 'Lightbulb', color: 'purple' },
      { id: 'social', label: 'Sociaal', description: 'Mensen verbinden en energie uitwisselen', icon: 'Users', color: 'pink' },
      { id: 'analytical', label: 'Analytisch', description: 'Logisch denken en probleemoplossing', icon: 'Brain', color: 'indigo' },
      { id: 'empathetic', label: 'Empatisch', description: 'Inlevingsvermogen en zorgzaamheid', icon: 'Heart', color: 'red' },
      { id: 'ambitious', label: 'Ambitieus', description: 'Doelgericht en gedreven', icon: 'TrendingUp', color: 'orange' },
      { id: 'playful', label: 'Speels', description: 'Humor en lichtvoetigheid', icon: 'Sparkles', color: 'yellow' }
    ],
    interactive: {
      tip: '💡 Mensen met deze combinatie scoren gemiddeld 35% hoger in matches',
      example: 'Een betrouwbare avonturier straalt stabiliteit uit met een spannende twist'
    }
  },
  {
    id: 'social_energy_detailed',
    question: 'Hoe energiek ben je in verschillende sociale contexten?',
    subtitle: 'Schaal van 1-10 voor verschillende situaties - dit helpt ons je ideale match scenario te begrijpen',
    type: 'multi_slider',
    phase: 1,
    category: 'personality',
    sliders: [
      { id: 'one_on_one', label: '1-op-1 gesprekken', min: 1, max: 10, default: 5 },
      { id: 'small_groups', label: 'Kleine groepen (2-6 mensen)', min: 1, max: 10, default: 5 },
      { id: 'large_groups', label: 'Grote groepen (7+ mensen)', min: 1, max: 10, default: 5 },
      { id: 'online_interaction', label: 'Online interacties', min: 1, max: 10, default: 5 }
    ],
    interactive: {
      insight: 'Dit patroon suggereert je bent meer [energy_type] - perfect voor [match_type] dates',
      tip: '🔍 Dit helpt ons profielen te maken die je natuurlijke energie weerspiegelen'
    }
  },
  {
    id: 'emotional_intelligence',
    question: 'Hoe ga je om met emoties in relaties?',
    subtitle: 'Je emotionele intelligentie beïnvloedt hoe je communiceert en connecties opbouwt',
    type: 'scenario_radio',
    phase: 1,
    category: 'personality',
    scenario: 'Stel: Je partner is gestrest over werk. Hoe reageer je?',
    options: [
      { id: 'empathic_listener', label: 'Actief luisteren en ondersteunen', description: 'Ik geef ruimte om te praten en bied praktische hulp', icon: 'Heart', outcome: 'Dit toont hoge emotionele intelligentie - aantrekkelijk voor diepe connecties' },
      { id: 'practical_solver', label: 'Praktische oplossingen bieden', description: 'Ik help door concrete stappen voor te stellen', icon: 'Lightbulb', outcome: 'Dit toont probleemoplossend vermogen - goed voor pragmatische relaties' },
      { id: 'space_giver', label: 'Ruimte geven om te verwerken', description: 'Ik respecteer dat iedereen anders omgaat met stress', icon: 'Shield', outcome: 'Dit toont respect voor autonomie - ideaal voor onafhankelijke partners' },
      { id: 'emotional_mirror', label: 'Emoties weerspiegelen', description: 'Ik erken hun gevoelens en deel hoe ik me voel', icon: 'Users', outcome: 'Dit creëert emotionele veiligheid - basis voor sterke banden' }
    ],
    interactive: {
      video: 'Bekijk hoe experts dit verschil uitleggen',
      tip: 'Dit antwoord beïnvloedt 40% van je profieltoon'
    }
  },

  // Phase 2: Relationship Psychology & Attachment
  {
    id: 'attachment_style',
    question: 'Welke hechtingsstijl herken je in jezelf?',
    subtitle: 'Dit bepaalt hoe je relaties benadert en wat je nodig hebt voor veiligheid',
    type: 'attachment_quiz',
    phase: 2,
    category: 'relationship',
    statements: [
      { text: 'Ik vind het moeilijk om volledig te vertrouwen in relaties', anxiety: true },
      { text: 'Ik maak me vaak zorgen dat mijn partner me zal verlaten', anxiety: true },
      { text: 'Ik heb behoefte aan constante bevestiging van mijn partner', anxiety: true },
      { text: 'Ik vind het moeilijk om dichtbij te komen bij anderen', avoidance: true },
      { text: 'Ik geef er de voorkeur aan onafhankelijk te blijven in relaties', avoidance: true },
      { text: 'Ik voel me ongemakkelijk als partners te afhankelijk worden', avoidance: true },
      { text: 'Ik geloof dat ik een liefdevolle, stabiele relatie kan hebben', secure: true },
      { text: 'Ik voel me veilig om kwetsbaar te zijn bij mijn partner', secure: true }
    ],
    interactive: {
      insight: 'Je hechtingsstijl suggereert je hebt behoefte aan [security_type]',
      tip: '🛡️ Dit helpt ons profielen te schrijven die de juiste mate van beschikbaarheid uitstralen'
    }
  },
  {
    id: 'love_language',
    question: 'Wat zijn je belangrijkste liefdestalen?',
    subtitle: 'Hoe geef en ontvang je liefde? Dit helpt ons je relatievoorkeuren te begrijpen',
    type: 'love_language',
    phase: 2,
    category: 'relationship',
    languages: [
      { id: 'words', name: 'Woorden van Bevestiging', description: 'Liefde tonen door complimenten en waardering uitspreken', icon: 'MessageCircle' },
      { id: 'acts', name: 'Dienstbaarheid', description: 'Liefde tonen door dingen voor elkaar te doen', icon: 'Heart' },
      { id: 'gifts', name: 'Cadeaus', description: 'Liefde tonen door betekenisvolle geschenken te geven', icon: 'Sparkles' },
      { id: 'time', name: 'Kwaliteitstijd', description: 'Liefde tonen door onverdeelde aandacht te geven', icon: 'Users' },
      { id: 'touch', name: 'Fysiek Contact', description: 'Liefde tonen door aanraking en nabijheid', icon: 'Heart' }
    ],
    interactive: {
      tip: '💑 Partners met aligned liefdestalen hebben 25% sterkere relaties',
      example: 'Als kwaliteitstijd je taal is, zullen we dat benadrukken in je profiel'
    }
  },

  // Phase 3: Communication & Social Intelligence
  {
    id: 'communication_style_detailed',
    question: 'Hoe communiceer je in verschillende situaties?',
    subtitle: 'Je communicatiestijl beïnvloedt hoe mensen je ervaren in dating',
    type: 'communication_matrix',
    phase: 3,
    category: 'communication',
    dimensions: [
      { id: 'directness', label: 'Directheid', low: 'Diplomatiek & Voorzichtig', high: 'Direct & Eerlijk' },
      { id: 'formality', label: 'Formaliteit', low: 'Informeel & Speels', high: 'Formeel & Gestructureerd' },
      { id: 'emotional_expression', label: 'Emotionele Expressie', low: 'Gereserveerd & Analytisch', high: 'Emotioneel & Expressief' },
      { id: 'listening_style', label: 'Luisterstijl', low: 'Actief & Onderbrekend', high: 'Stil & Observerend' }
    ],
    interactive: {
      insight: 'Je communicatiestijl past bij [personality_type] persoonlijkheden',
      tip: '📝 Dit bepaalt de schrijfstijl van je profiel - 60% van de aantrekkingskracht'
    }
  },
  {
    id: 'conflict_style',
    question: 'Hoe ga je om met conflicten in relaties?',
    subtitle: 'Dit toont je volwassenheid en relatievaardigheden',
    type: 'conflict_scenario',
    phase: 3,
    category: 'communication',
    scenario: 'Jullie hebben een meningsverschil over vakantieplannen. Hoe los je dit op?',
    options: [
      { id: 'collaborative', label: 'Samenwerken', description: 'We bespreken opties en vinden een compromis waar beide blij mee zijn', icon: 'Users', strength: 'Teamspeler - bouwt sterke partnerships' },
      { id: 'compromising', label: 'Compromis', description: 'Ik geef toe op kleine punten om de relatie te behouden', icon: 'Shield', strength: 'Flexibel - voorkomt escalatie' },
      { id: 'competitive', label: 'Concurrentie', description: 'Ik verdedig mijn positie en probeer te winnen', icon: 'Trophy', strength: 'Beslist - weet wat hij/zij wil' },
      { id: 'avoiding', label: 'Vermijden', description: 'Ik stel het uit of verander van onderwerp', icon: 'ArrowRight', strength: 'Vredelievend - voorkomt ruzie' },
      { id: 'accommodating', label: 'Toegeven', description: 'Ik geef toe aan de wensen van mijn partner', icon: 'Heart', strength: 'Zorgzaam - relatie boven gelijk' }
    ],
    interactive: {
      tip: '⚖️ Dit antwoord beïnvloedt welke matches we voor je vinden',
      insight: 'Mensen met deze stijl hebben gemiddeld [satisfaction_score]% relatiesucces'
    }
  },

  // Phase 4: Values, Goals & Life Vision
  {
    id: 'core_values',
    question: 'Wat zijn je 5 belangrijkste levenswaarden?',
    subtitle: 'Deze waarden bepalen wie bij je past en hoe je relaties invult',
    type: 'values_prioritization',
    phase: 4,
    category: 'values',
    values: [
      { id: 'authenticity', name: 'Authenticiteit', description: 'Eerlijkheid en echtheid in alles wat ik doe' },
      { id: 'growth', name: 'Groei', description: 'Continu leren en persoonlijk ontwikkelen' },
      { id: 'connection', name: 'Connectie', description: 'Diepe, betekenisvolle relaties opbouwen' },
      { id: 'freedom', name: 'Vrijheid', description: 'Autonomie en ruimte voor individuele keuzes' },
      { id: 'stability', name: 'Stabiliteit', description: 'Betrouwbaarheid en zekerheid' },
      { id: 'adventure', name: 'Avontuur', description: 'Nieuwe ervaringen en spanning' },
      { id: 'harmony', name: 'Harmonie', description: 'Vrede en balans in relaties' },
      { id: 'achievement', name: 'Prestaties', description: 'Doelen bereiken en succes behalen' },
      { id: 'compassion', name: 'Compassie', description: 'Zorgzaamheid en empathie voor anderen' },
      { id: 'creativity', name: 'Creativiteit', description: 'Origineel denken en zelfexpressie' }
    ],
    interactive: {
      tip: '🎯 Partners die je waarden delen hebben 80% meer kans op succes',
      workbook: 'Noteer in je workbook waarom deze waarden belangrijk voor je zijn'
    }
  },
  {
    id: 'relationship_goals',
    question: 'Wat zoek je op de lange termijn in relaties?',
    subtitle: 'Dit helpt ons je profiel te richten op de juiste doelgroep',
    type: 'goals_pyramid',
    phase: 4,
    category: 'goals',
    levels: [
      { level: 'immediate', label: 'Korte termijn (nu)', question: 'Wat wil je de komende maanden bereiken?' },
      { level: 'medium', label: 'Middel termijn (1-2 jaar)', question: 'Wat wil je in een relatie opbouwen?' },
      { level: 'long', label: 'Lange termijn (3+ jaar)', question: 'Wat is je visie op partnership?' }
    ],
    interactive: {
      insight: 'Je doelen passen bij [relationship_type] - we optimaliseren je profiel hiervoor',
      tip: '📅 Duidelijke doelen trekken mensen aan die dezelfde richting op willen'
    }
  },

  // Phase 5: Authentic Storytelling & Vulnerabilities
  {
    id: 'signature_story',
    question: 'Wat is je signature verhaal?',
    subtitle: 'Een verhaal dat jou uniek maakt en je persoonlijkheid toont',
    type: 'story_builder',
    phase: 5,
    category: 'storytelling',
    elements: {
      challenge: 'Een uitdaging die je overwon',
      lesson: 'Wat je daarvan leerde',
      growth: 'Hoe je veranderde',
      strength: 'Welke kracht dit toont'
    },
    interactive: {
      tip: '📖 Goede verhalen verhogen engagement met 300%',
      example: 'Bekijk hoe anderen hun verhalen gebruiken',
      workbook: 'Schrijf je volledige verhaal uit in sectie 3.2 van je workbook'
    }
  },
  {
    id: 'vulnerability_level',
    question: 'Hoe comfortabel ben je met kwetsbaarheid?',
    subtitle: 'Dit bepaalt hoe open je bent in je profiel en relaties',
    type: 'vulnerability_scale',
    phase: 5,
    category: 'authenticity',
    aspects: [
      { id: 'sharing_failures', label: 'Delen van mislukkingen', description: 'Over fouten praten die je leerde' },
      { id: 'emotional_openness', label: 'Emotionele openheid', description: 'Je gevoelens en behoeften uiten' },
      { id: 'asking_help', label: 'Om hulp vragen', description: 'Tonen dat je niet perfect bent' },
      { id: 'deep_questions', label: 'Diepe vragen stellen', description: 'Over betekenisvolle onderwerpen praten' }
    ],
    interactive: {
      insight: 'Je comfort level suggereert [authenticity_style] authenticiteit',
      tip: '💝 Kwetsbare mensen trekken 40% meer quality matches aan'
    }
  },

  // Phase 6: Lifestyle & Practical Compatibility
  {
    id: 'lifestyle_alignment',
    question: 'Hoe ziet je ideale dagelijkse leven eruit?',
    subtitle: 'Dit helpt ons compatibele partners voor je te vinden',
    type: 'lifestyle_canvas',
    phase: 6,
    category: 'lifestyle',
    categories: {
      routine: ['Vroege vogel', 'Nachtuil', 'Flexibel'],
      social: ['Introvert herlaadtijd nodig', 'Extrovert energie uit mensen', 'Gemiddeld sociaal'],
      work: ['9-5 kantoorbaan', 'Flexibel/freelance', 'Ondernemer'],
      activity: ['Actief en sportief', 'Creatief en cultureel', 'Rustig en ontspannen']
    },
    interactive: {
      tip: '🏠 Levensstijl alignment is de #1 voorspeller van relatie succes',
      compatibility: 'Dit past bij [percentage]% van singles in je leeftijdsgroep'
    }
  },

  // Phase 7: Profile Strategy & Optimization
  {
    id: 'unique_selling_points',
    question: 'Wat maakt jou uniek in de dating wereld?',
    subtitle: 'Je onderscheidende kwaliteiten die mensen aantrekken',
    type: 'usp_generator',
    phase: 7,
    category: 'strategy',
    prompts: [
      'Wat kunnen mensen altijd van jou verwachten?',
      'Welke kwaliteit van je wordt het meest gewaardeerd?',
      'Wat doe je beter dan de meeste mensen?',
      'Welke combinatie van eigenschappen heb je die zeldzaam is?'
    ],
    interactive: {
      tip: '⭐ USP\'s maken je 5x zichtbaarder in de swipe massa',
      example: 'Bekijk succesvolle profielen met sterke USP\'s',
      workbook: 'Ontwikkel je 3 belangrijkste USP\'s in sectie 4.1'
    }
  },
  {
    id: 'platform_strategy',
    question: 'Welke dating apps passen bij jou?',
    subtitle: 'Verschillende platforms vragen verschillende strategieën',
    type: 'platform_fit',
    phase: 7,
    category: 'strategy',
    platforms: [
      { id: 'tinder', name: 'Tinder', style: 'Visueel & Snel', best_for: 'Brede doelgroep, snelle matches' },
      { id: 'bumble', name: 'Bumble', style: 'Gelijkwaardig', best_for: 'Serieus daten, vrouwelijk initiatief' },
      { id: 'hinge', name: 'Hinge', style: 'Diepgaand', best_for: 'Betekenisvolle connecties, prompts' },
      { id: 'lexa', name: 'Lexa', style: 'Professioneel', best_for: 'Hogere leeftijd, carrièregericht' }
    ],
    interactive: {
      recommendation: 'Gebaseerd op je antwoorden raden we [platform] aan als startpunt',
      tip: '📱 Het juiste platform verhoogt je match kwaliteit met 60%'
    }
  },

  // Phase 8: Call to Action & Final Optimization
  {
    id: 'conversation_hooks',
    question: 'Welke openingszinnen passen bij jou?',
    subtitle: 'Deze bepalen hoe mensen contact met je opnemen',
    type: 'cta_optimizer',
    phase: 8,
    category: 'optimization',
    hooks: [
      { id: 'curiosity', text: 'Swipe rechts als je...', category: 'Nieuwsgierigheid', effectiveness: 85 },
      { id: 'challenge', text: 'Daag me uit voor een potje...', category: 'Interactie', effectiveness: 78 },
      { id: 'question', text: 'Wat is het gekste wat je ooit...', category: 'Vraag', effectiveness: 92 },
      { id: 'statement', text: 'Ik geloof dat...', category: 'Opinie', effectiveness: 76 },
      { id: 'invitation', text: 'Laten we samen...', category: 'Uitnodiging', effectiveness: 88 }
    ],
    interactive: {
      tip: '💬 De juiste CTA verhoogt respons rates met 150%',
      test: 'We testen welke van deze het beste bij je past',
      workbook: 'Experimenteer met verschillende CTA\'s in sectie 5.3'
    }
  }
];

interface QuizAnswer {
  questionId: string;
  answerId: string | string[];
  label: string;
  content?: string;
  fields?: Record<string, string | number>;
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

  // Waarden Kompas integration
  const [waardenKompasCompleted, setWaardenKompasCompleted] = useState(false);
  const [waardenKompasData, setWaardenKompasData] = useState<any>(null);

  // Check if user has completed Waarden Kompas
  useEffect(() => {
    const checkWaardenKompasStatus = async () => {
      if (!user?.id) return;

      try {
        const response = await fetch('/api/waarden-kompas/status', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setWaardenKompasCompleted(data.completed);
          if (data.completed && data.results) {
            setWaardenKompasData(data.results);
          }
        }
      } catch (error) {
        console.log('Waarden Kompas status check failed:', error);
      }
    };

    checkWaardenKompasStatus();
  }, [user?.id]);

  const [state, setState] = useState<WizardState>({
    currentStep: 0,
    answers: [],
    generatedProfiles: [],
    selectedProfile: null,
    isGenerating: false,
    completed: false
  });

  const currentQuestion = PROFESSIONAL_PERSONALITY_QUIZ[state.currentStep];
  const progress = ((state.currentStep + 1) / PROFESSIONAL_PERSONALITY_QUIZ.length) * 100;

  const handleAnswer = (answerId: string | string[], label: string, content?: string, fields?: Record<string, string | number>) => {
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
    if (state.currentStep < PROFESSIONAL_PERSONALITY_QUIZ.length - 1) {
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

    try {
      // Create profile data from answers
      const personalityAnswers = state.answers.filter(a => PROFESSIONAL_PERSONALITY_QUIZ.find(q => q.id === a.questionId)?.phase === 1);
      const profileData = personalityAnswers.map(a => a.label).join(', ');

      // Enhance with Waarden Kompas data if available
      let enhancedKeywords = profileData;
      let waardenKompasInsights = '';

      if (waardenKompasCompleted && waardenKompasData) {
        // Extract core values and personality insights from Waarden Kompas
        const coreValues = waardenKompasData.core_values || [];
        const greenFlags = waardenKompasData.green_flags || [];
        const datingStrategies = waardenKompasData.dating_strategies || [];

        waardenKompasInsights = `
        Waarden Kompas Insights:
        - Kernwaarden: ${coreValues.slice(0, 3).join(', ')}
        - Groene vlaggen: ${greenFlags.slice(0, 2).join(', ')}
        - Dating strategieën: ${datingStrategies.slice(0, 2).join(', ')}
        `;

        enhancedKeywords += waardenKompasInsights;
      }

      // Generate 3 profile options
      const profiles: ProfileOption[] = [];

      for (let i = 0; i < 3; i++) {
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
          tone: i === 0 ? 'mysterieus' : i === 1 ? 'energiek' : 'authentiek',
          keywords: enhancedKeywords,
        });

        const qualityMetrics = calculateQuality(result.refinedProfile);

        // Adjust title and add Waarden Kompas indicator
        let title = i === 0 ? 'Authentiek & Betrouwbaar' : i === 1 ? 'Mysterieus & Intrigerend' : 'Energie & Avontuurlijk';
        if (waardenKompasCompleted) {
          title += ' ✨'; // Add sparkle indicator for Waarden Kompas enhanced profiles
        }

        profiles.push({
          id: `profile-${i + 1}`,
          title,
          content: result.refinedProfile,
          score: waardenKompasCompleted ? Math.min(100, qualityMetrics.overallScore + 5) : qualityMetrics.overallScore, // Boost score for Waarden Kompas users
          strengths: [
            ...(waardenKompasCompleted ? ['✨ Waarden Kompas Enhanced'] : []),
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

    } catch (error) {
      console.error('Profile generation error:', error);
      handleError(error as Error, { componentStack: 'InteractiveProfileCoach.generateProfiles' });
      setState(prev => ({ ...prev, isGenerating: false }));
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

    // For multi_select questions, check if required number of selections are made
    if (currentQuestion.type === 'multi_select') {
      const selectedAnswers = currentAnswer?.answerId;
      if (!selectedAnswers || !Array.isArray(selectedAnswers)) return false;
      const requiredSelections = currentQuestion.maxSelections || 3;
      return selectedAnswers.length >= requiredSelections;
    }

    // For values_prioritization questions, check if 5 values are selected
    if (currentQuestion.type === 'values_prioritization') {
      if (!currentAnswer.answerId || !Array.isArray(currentAnswer.answerId)) return false;
      return currentAnswer.answerId.length >= 5;
    }

    // For goals_pyramid questions, check if all levels have content
    if (currentQuestion.type === 'goals_pyramid') {
      if (!currentAnswer.fields) return false;
      const requiredLevels = currentQuestion.levels?.length || 0;
      const filledLevels = Object.values(currentAnswer.fields).filter((value: any) =>
        typeof value === 'string' && value.trim().length > 0
      ).length;
      return filledLevels === requiredLevels;
    }

    // For story_builder questions, check if all elements have content
    if (currentQuestion.type === 'story_builder') {
      if (!currentAnswer.fields) return false;
      const requiredElements = Object.keys(currentQuestion.elements || {}).length;
      const filledElements = Object.values(currentAnswer.fields).filter((value: any) =>
        typeof value === 'string' && value.trim().length > 0
      ).length;
      return filledElements === requiredElements;
    }

    // For vulnerability_scale questions, check if all aspects have values
    if (currentQuestion.type === 'vulnerability_scale') {
      if (!currentAnswer.fields) return false;
      const requiredAspects = currentQuestion.aspects?.length || 0;
      const filledAspects = Object.keys(currentAnswer.fields).length;
      return filledAspects === requiredAspects;
    }

    // For usp_generator questions, check if all prompts have content
    if (currentQuestion.type === 'usp_generator') {
      if (!currentAnswer.fields) return false;
      const requiredPrompts = currentQuestion.prompts?.length || 0;
      const filledPrompts = Object.values(currentAnswer.fields).filter((value: any) =>
        typeof value === 'string' && value.trim().length > 0
      ).length;
      return filledPrompts === requiredPrompts;
    }

    // For communication_matrix questions, check if all dimensions have values
    if (currentQuestion.type === 'communication_matrix') {
      if (!currentAnswer.fields) return false;
      const requiredDimensions = currentQuestion.dimensions?.length || 0;
      const filledDimensions = Object.keys(currentAnswer.fields).length;
      return filledDimensions === requiredDimensions;
    }

    // For multi_slider questions, check if all sliders have values
    if (currentQuestion.type === 'multi_slider') {
      if (!currentAnswer.fields) return false;
      const requiredSliders = currentQuestion.sliders?.length || 0;
      const filledSliders = Object.keys(currentAnswer.fields).length;
      return filledSliders === requiredSliders;
    }

    // For attachment_quiz questions, check if all statements have ratings
    if (currentQuestion.type === 'attachment_quiz') {
      if (!currentAnswer.fields) return false;
      const requiredStatements = currentQuestion.statements?.length || 0;
      const ratedStatements = Object.keys(currentAnswer.fields).filter(key => key.startsWith('statement_')).length;
      return ratedStatements === requiredStatements;
    }

    // For love_language questions, check if at least one language is selected
    if (currentQuestion.type === 'love_language') {
      if (!currentAnswer.fields) return false;
      const selectedLanguages = Object.values(currentAnswer.fields).filter((value: any) => value === true).length;
      return selectedLanguages > 0;
    }

    // For other question types, check for answerId
    return !!currentAnswer.answerId;
  };

  if (state.completed && state.generatedProfiles.length > 0) {
    return (
      <ProfileResults
        profiles={state.generatedProfiles}
        answers={state.answers}
        onReset={resetWizard}
        markAsCompleted={markAsCompleted}
        onProfileUsed={(profile) => {
          console.log('Profile used:', profile);
          // You could add additional logic here, like showing a success message
          // or navigating to a different page
        }}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Professional Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-coral-50 to-coral-100 p-6 rounded-xl border border-coral-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-coral-100 rounded-full">
            <UserCircle2 className="w-8 h-8 text-coral-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Profiel Architect</h1>
            <p className="text-sm text-gray-600">Professionele dating profielen gebaseerd op psychologie</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={startTutorial}
          className="gap-2 text-coral-600 border-coral-200 hover:bg-coral-50"
        >
          <HelpCircle className="w-4 h-4" />
          Handleiding
        </Button>
      </div>

      {/* Waarden Kompas Integration Banner */}
      {!waardenKompasCompleted && (
        <Card className="border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Compass className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 mb-1">Ontgrendel Waarden Kompas voor Betere Resultaten! ✨</h3>
                <p className="text-sm text-amber-800 mb-3">
                  Door je kernwaarden en relatievoorkeuren te ontdekken, kunnen we profielen maken die 40% beter aansluiten bij je ideale matches.
                </p>
                <Button
                  size="sm"
                  onClick={() => window.location.href = '/tools/waarden-kompas'}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Start Waarden Kompas
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Waarden Kompas Completed Badge */}
      {waardenKompasCompleted && (
        <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900">Waarden Kompas Voltooid! 🎉</h3>
                <p className="text-sm text-green-800">Je profielen worden nu versterkt met je persoonlijke waarden en voorkeuren.</p>
              </div>
              <Badge className="bg-green-100 text-green-700">✨ Enhanced</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Section */}
      <Card className="border-2 border-coral-100">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-sm font-medium text-gray-700">
                Vraag {state.currentStep + 1} van {PROFESSIONAL_PERSONALITY_QUIZ.length}
              </span>
              <div className="text-xs text-gray-500 mt-1">
                Fase {currentQuestion.phase}: {currentQuestion.category}
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-medium text-primary">
                {Math.round(progress)}% compleet
              </span>
            </div>
          </div>
          <Progress value={progress} className="h-3 bg-coral-50" />
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Persoonlijkheid</span>
            <span>Relatie Psychologie</span>
            <span>Authenticiteit</span>
            <span>Strategie</span>
          </div>
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card className="border-2 border-purple-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-coral-50">
          <div className="flex-1">
            <CardTitle className="text-xl text-gray-900 mb-2">{currentQuestion.question}</CardTitle>
            <p className="text-sm text-gray-600">{currentQuestion.subtitle}</p>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Question Options */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 gap-3">
              {currentQuestion.options?.map((option) => {
                const isSelected = currentAnswer?.answerId === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleAnswer(option.id, option.label)}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      isSelected
                        ? 'border-coral-500 bg-coral-50 shadow-sm'
                        : 'border-gray-200 hover:border-coral-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <h4 className="font-medium">{option.label}</h4>
                        <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                      </div>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-coral-500 flex-shrink-0 mt-0.5" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Single Slider */}
          {currentQuestion.type === 'slider' && (
            <div className="space-y-3 mb-6">
              <div className="px-2">
                <Slider
                  value={[currentAnswer?.fields?.value || currentQuestion.min]}
                  onValueChange={(value) => {
                    handleAnswer('slider', 'Slider input', undefined, { value: value[0] });
                  }}
                  max={currentQuestion.max}
                  min={currentQuestion.min}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{currentQuestion.labels?.[0] || 'Laag'}</span>
                <span className="font-medium">{currentAnswer?.fields?.value || currentQuestion.min}</span>
                <span>{currentQuestion.labels?.[2] || 'Hoog'}</span>
              </div>
            </div>
          )}

          {/* Multi Slider for Social Energy */}
          {currentQuestion.type === 'multi_slider' && (
            <div className="space-y-6 mb-6">
              {currentQuestion.sliders?.map((slider, index) => {
                const sliderValue = currentAnswer?.fields?.[slider.id] || slider.default;
                return (
                  <div key={slider.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        {slider.label}
                      </label>
                      <span className="text-sm font-bold text-coral-600 bg-coral-50 px-2 py-1 rounded-full">
                        {sliderValue}
                      </span>
                    </div>
                    <div className="px-2">
                      <Slider
                        value={[sliderValue]}
                        onValueChange={(value) => {
                          const newFields = {
                            ...currentAnswer?.fields,
                            [slider.id]: value[0]
                          };
                          handleAnswer('multi_slider', 'Multi slider input', undefined, newFields);
                        }}
                        max={slider.max}
                        min={slider.min}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>1 (Laag)</span>
                      <span>10 (Hoog)</span>
                    </div>
                  </div>
                );
              })}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">💡</span>
                  </div>
                  <div>
                    <p className="text-sm text-blue-800">
                      <strong>Deze scores helpen ons je ideale match scenario te begrijpen.</strong> Hoe hoger je score in een situatie, hoe meer energie je daar uit haalt.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Attachment Style Quiz */}
          {currentQuestion.type === 'attachment_quiz' && (
            <div className="space-y-4 mb-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">🛡️</span>
                  </div>
                  <div>
                    <p className="text-sm text-amber-800">
                      <strong>Beantwoord eerlijk:</strong> Deze vragen helpen ons je relatiepatronen te begrijpen. Er zijn geen "goede" antwoorden - het gaat om zelfkennis.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {currentQuestion.statements?.map((statement, index) => {
                  const statementId = `statement_${index}`;
                  const currentValue = currentAnswer?.fields?.[statementId] || 3; // Default to neutral

                  return (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 mb-3">
                            "{statement.text}"
                          </p>
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Oneens</span>
                              <span className="font-medium text-coral-600">{currentValue}/5</span>
                              <span>Eens</span>
                            </div>
                            <div className="px-2">
                              <Slider
                                value={[currentValue]}
                                onValueChange={(value) => {
                                  const newFields = {
                                    ...currentAnswer?.fields,
                                    [statementId]: value[0]
                                  };
                                  handleAnswer('attachment_quiz', 'Attachment quiz response', undefined, newFields);
                                }}
                                max={5}
                                min={1}
                                step={1}
                                className="w-full"
                              />
                            </div>
                            <div className="flex justify-between text-xs text-gray-400">
                              <span>1</span>
                              <span>2</span>
                              <span>3</span>
                              <span>4</span>
                              <span>5</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">💜</span>
                  </div>
                  <div>
                    <p className="text-sm text-purple-800">
                      <strong>Je antwoorden bepalen je hechtingsstijl:</strong> Veilig, Angstig, Vermijdend, of een mix. Dit helpt ons profielen te schrijven die de juiste mate van beschikbaarheid uitstralen.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Love Languages Selection */}
          {currentQuestion.type === 'love_language' && (
            <div className="space-y-4 mb-6">
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">💕</span>
                  </div>
                  <div>
                    <p className="text-sm text-rose-800">
                      <strong>Selecteer je belangrijkste liefdestalen:</strong> Hoe geef en ontvang jij liefde? Dit bepaalt hoe we je relatievoorkeuren in je profiel verwerken.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {currentQuestion.languages?.map((language, index) => {
                  const isSelected = currentAnswer?.fields?.[language.id] === true;

                  return (
                    <div
                      key={language.id}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-coral-500 bg-coral-50 shadow-sm'
                          : 'border-gray-200 hover:border-coral-300'
                      }`}
                      onClick={() => {
                        const newFields = {
                          ...currentAnswer?.fields,
                          [language.id]: !isSelected
                        };
                        handleAnswer('love_language', 'Love language selection', undefined, newFields);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isSelected ? 'border-coral-500 bg-coral-500' : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <CheckCircle className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {language.name}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {language.description}
                          </p>
                          {isSelected && (
                            <Badge className="bg-coral-100 text-coral-700 text-xs">
                              Geselecteerd
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-coral-50 border border-coral-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-coral-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">💑</span>
                  </div>
                  <div>
                    <p className="text-sm text-coral-800">
                      <strong>Partners met aligned liefdestalen:</strong> Hebben gemiddeld 25% sterkere relaties. We gebruiken dit om mensen aan te trekken die op dezelfde manier van jou houden.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Multi Select Questions */}
          {currentQuestion.type === 'multi_select' && (
            <div className="space-y-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">🎯</span>
                  </div>
                  <div>
                    <p className="text-sm text-blue-800">
                      <strong>Selecteer {currentQuestion.maxSelections} kenmerken:</strong> Kies de woorden die jou het beste beschrijven. Dit vormt de basis van je authentieke profiel.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {currentQuestion.options?.map((option) => {
                  const selectedAnswers = currentAnswer?.answerId as string[] || [];
                  const isSelected = selectedAnswers.includes(option.id);
                  const isDisabled = !isSelected && selectedAnswers.length >= (currentQuestion.maxSelections || 3);

                  return (
                    <button
                      key={option.id}
                      onClick={() => {
                        const currentSelected = selectedAnswers;
                        let newSelected: string[];

                        if (isSelected) {
                          // Remove from selection
                          newSelected = currentSelected.filter(id => id !== option.id);
                        } else {
                          // Add to selection (if not at max)
                          if (currentSelected.length < (currentQuestion.maxSelections || 3)) {
                            newSelected = [...currentSelected, option.id];
                          } else {
                            return; // Don't allow more selections
                          }
                        }

                        const selectedLabels = newSelected.map(id =>
                          currentQuestion.options?.find(opt => opt.id === id)?.label
                        ).filter(Boolean);

                        handleAnswer(newSelected, selectedLabels.join(', '));
                      }}
                      disabled={isDisabled && !isSelected}
                      className={`p-4 border-2 rounded-lg text-left transition-all w-full ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : isDisabled
                          ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <CheckCircle className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {option.label}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {option.description}
                          </p>
                          {isSelected && (
                            <Badge className="bg-blue-100 text-blue-700 text-xs">
                              Geselecteerd
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">💡</span>
                  </div>
                  <div>
                    <p className="text-sm text-blue-800">
                      <strong>Geselecteerd: {((currentAnswer?.answerId as string[]) || []).length} / {currentQuestion.maxSelections || 3}</strong>
                      <br />
                      {currentQuestion.interactive?.tip}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Scenario Radio Selection */}
          {currentQuestion.type === 'scenario_radio' && (
            <div className="space-y-4 mb-6">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">🎭</span>
                  </div>
                  <div>
                    <p className="text-sm text-indigo-800">
                      <strong>{currentQuestion.scenario}</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {currentQuestion.options?.map((option) => {
                  const isSelected = currentAnswer?.answerId === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleAnswer(option.id, option.label)}
                      className={`p-4 border-2 rounded-lg text-left transition-all w-full ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <CheckCircle className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {option.label}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {option.description}
                          </p>
                          {option.outcome && (
                            <p className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                              {option.outcome}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">🧠</span>
                  </div>
                  <div>
                    <p className="text-sm text-indigo-800">
                      <strong>Je keuze beïnvloedt je profieltoon:</strong> Dit antwoord helpt ons de juiste mate van emotionele expressie in je profiel te bepalen.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Communication Matrix */}
          {currentQuestion.type === 'communication_matrix' && (
            <div className="space-y-6 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">💬</span>
                  </div>
                  <div>
                    <p className="text-sm text-green-800">
                      <strong>Beoordeel je communicatiestijl:</strong> Schuif de sliders naar waar jij je het meest thuis voelt. Dit bepaalt de schrijfstijl van je profiel.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {currentQuestion.dimensions?.map((dimension, index) => {
                  const dimensionId = dimension.id;
                  const currentValue = currentAnswer?.fields?.[dimensionId] || 3; // Default to middle (3)

                  return (
                    <div key={dimensionId} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">
                          {dimension.label}
                        </h4>
                        <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          {currentValue}/5
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="px-2">
                          <Slider
                            value={[currentValue]}
                            onValueChange={(value) => {
                              const newFields = {
                                ...currentAnswer?.fields,
                                [dimensionId]: value[0]
                              };
                              handleAnswer('communication_matrix', 'Communication style assessment', undefined, newFields);
                            }}
                            max={5}
                            min={1}
                            step={1}
                            className="w-full"
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{dimension.low}</span>
                          <span>{dimension.high}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">📝</span>
                  </div>
                  <div>
                    <p className="text-sm text-green-800">
                      <strong>Je communicatiestijl beïnvloedt 60% van je profiel aantrekkingskracht:</strong> {currentQuestion.interactive?.tip}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Values Prioritization */}
          {currentQuestion.type === 'values_prioritization' && (
            <div className="space-y-4 mb-6">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">🎯</span>
                  </div>
                  <div>
                    <p className="text-sm text-purple-800">
                      <strong>Selecteer je 5 belangrijkste levenswaarden:</strong> Sleep of klik om je top 5 waarden te kiezen. Deze bepalen wie bij je past.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {currentQuestion.values?.map((value, index) => {
                  const selectedValues = currentAnswer?.answerId as string[] || [];
                  const isSelected = selectedValues.includes(value.id);
                  const priority = selectedValues.indexOf(value.id) + 1;

                  return (
                    <button
                      key={value.id}
                      onClick={() => {
                        const currentSelected = selectedValues;
                        let newSelected: string[];

                        if (isSelected) {
                          // Remove from selection
                          newSelected = currentSelected.filter(id => id !== value.id);
                        } else {
                          // Add to selection (if not at max 5)
                          if (currentSelected.length < 5) {
                            newSelected = [...currentSelected, value.id];
                          } else {
                            return; // Don't allow more selections
                          }
                        }

                        const selectedLabels = newSelected.map(id =>
                          currentQuestion.values?.find(v => v.id === id)?.name
                        ).filter(Boolean);

                        handleAnswer(newSelected, selectedLabels.join(', '));
                      }}
                      className={`p-4 border-2 rounded-lg text-left transition-all w-full ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50 shadow-sm'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isSelected ? 'border-purple-500 bg-purple-500 text-white' : 'border-gray-300 text-gray-500'
                        }`}>
                          {isSelected ? priority : (index + 1)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {value.name}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {value.description}
                          </p>
                          {isSelected && (
                            <Badge className="bg-purple-100 text-purple-700 text-xs">
                              #{priority} Prioriteit
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">💜</span>
                  </div>
                  <div>
                    <p className="text-sm text-purple-800">
                      <strong>Geselecteerd: {((currentAnswer?.answerId as string[]) || []).length} / 5</strong>
                      <br />
                      {currentQuestion.interactive?.tip}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Goals Pyramid */}
          {currentQuestion.type === 'goals_pyramid' && (
            <div className="space-y-6 mb-6">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">🎯</span>
                  </div>
                  <div>
                    <p className="text-sm text-emerald-800">
                      <strong>Definieer je relatie doelen:</strong> Beschrijf wat je wilt bereiken op korte, middel en lange termijn. Dit helpt ons mensen aan te trekken die dezelfde richting op willen.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {currentQuestion.levels?.map((level, index) => {
                  const levelId = level.level;
                  const currentContent = currentAnswer?.fields?.[levelId] || '';

                  return (
                    <div key={levelId} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">
                          {level.label}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          levelId === 'immediate' ? 'bg-blue-100 text-blue-700' :
                          levelId === 'medium' ? 'bg-purple-100 text-purple-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {levelId === 'immediate' ? 'Nu' : levelId === 'medium' ? '1-2 jaar' : '3+ jaar'}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">
                        {level.question}
                      </p>

                      <Textarea
                        placeholder={`Beschrijf je ${level.label.toLowerCase()} doelen...`}
                        value={currentContent}
                        onChange={(e) => {
                          const newFields = {
                            ...currentAnswer?.fields,
                            [levelId]: e.target.value
                          };
                          handleAnswer('goals_pyramid', 'Goals pyramid input', undefined, newFields);
                        }}
                        className="min-h-[80px] resize-none"
                        maxLength={300}
                      />

                      <div className="text-xs text-gray-500 mt-2">
                        {currentContent.length}/300 karakters
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">📅</span>
                  </div>
                  <div>
                    <p className="text-sm text-emerald-800">
                      <strong>Duidelijke doelen trekken doelgerichte mensen aan:</strong> {currentQuestion.interactive?.tip}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Story Builder */}
          {currentQuestion.type === 'story_builder' && (
            <div className="space-y-6 mb-6">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">📖</span>
                  </div>
                  <div>
                    <p className="text-sm text-indigo-800">
                      <strong>Bouw je signature verhaal:</strong> Een verhaal dat jou uniek maakt en je persoonlijkheid toont. Vul de elementen in om je verhaal te construeren.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {Object.entries(currentQuestion.elements || {}).map(([key, label]) => {
                  const currentContent = currentAnswer?.fields?.[key] || '';

                  return (
                    <div key={key} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">
                          {label}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {currentContent.length}/200 karakters
                        </span>
                      </div>

                      <Textarea
                        placeholder={`Beschrijf je ${label.toLowerCase()}...`}
                        value={currentContent}
                        onChange={(e) => {
                          const newFields = {
                            ...currentAnswer?.fields,
                            [key]: e.target.value
                          };
                          handleAnswer('story_builder', 'Story builder input', undefined, newFields);
                        }}
                        className="min-h-[100px] resize-none"
                        maxLength={200}
                      />

                      <div className="text-xs text-gray-500 mt-2">
                        Tip: Weef dit element natuurlijk in je dating verhalen
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✨</span>
                  </div>
                  <div>
                    <p className="text-sm text-indigo-800">
                      <strong>Goede verhalen verhogen engagement met 300%:</strong> {currentQuestion.interactive?.tip}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Vulnerability Scale */}
          {currentQuestion.type === 'vulnerability_scale' && (
            <div className="space-y-4 mb-6">
              <div className="bg-coral-50 border border-coral-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-coral-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">💝</span>
                  </div>
                  <div>
                    <p className="text-sm text-coral-800">
                      <strong>Beoordeel je comfort met kwetsbaarheid:</strong> Dit bepaalt hoe open je bent in je profiel en relaties. Schuif per aspect naar waar jij je het meest thuis voelt.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {currentQuestion.aspects?.map((aspect, index) => {
                  const aspectId = aspect.id;
                  const currentValue = currentAnswer?.fields?.[aspectId] || 3;

                  return (
                    <div key={aspectId} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-2">
                            {aspect.label}
                          </h4>
                          <p className="text-sm text-gray-600 mb-3">
                            {aspect.description}
                          </p>

                          <div className="space-y-2">
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Zeer oncomfortabel</span>
                              <span className="font-medium text-coral-600">{currentValue}/5</span>
                              <span>Zeer comfortabel</span>
                            </div>
                            <div className="px-2">
                              <Slider
                                value={[currentValue]}
                                onValueChange={(value) => {
                                  const newFields = {
                                    ...currentAnswer?.fields,
                                    [aspectId]: value[0]
                                  };
                                  handleAnswer('vulnerability_scale', 'Vulnerability assessment', undefined, newFields);
                                }}
                                max={5}
                                min={1}
                                step={1}
                                className="w-full"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-coral-50 border border-coral-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-coral-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">💖</span>
                  </div>
                  <div>
                    <p className="text-sm text-coral-800">
                      <strong>Kwetsbare mensen trekken 40% meer quality matches aan:</strong> {currentQuestion.interactive?.tip}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lifestyle Canvas */}
          {currentQuestion.type === 'lifestyle_canvas' && (
            <div className="space-y-6 mb-6">
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">🏠</span>
                  </div>
                  <div>
                    <p className="text-sm text-teal-800">
                      <strong>Levensstijl alignment is de #1 voorspeller van relatie succes:</strong> Selecteer je voorkeuren voor elke levensstijl categorie. Dit helpt ons compatibele partners voor je te vinden.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {Object.entries(currentQuestion.categories || {}).map(([categoryKey, options]) => {
                  const categoryLabels: Record<string, string> = {
                    routine: 'Routine & Slaapritme',
                    social: 'Sociaal & Energie',
                    work: 'Werk & Carrière',
                    activity: 'Activiteiten & Hobby\'s'
                  };

                  const categoryIcons: Record<string, string> = {
                    routine: '⏰',
                    social: '👥',
                    work: '💼',
                    activity: '🎯'
                  };

                  return (
                    <div key={categoryKey} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">{categoryIcons[categoryKey]}</span>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {categoryLabels[categoryKey]}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Kies je ideale {categoryLabels[categoryKey].toLowerCase()}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {(options as string[]).map((option, index) => {
                          const optionId = `${categoryKey}_${index}`;
                          const isSelected = currentAnswer?.answerId === optionId;

                          return (
                            <button
                              key={optionId}
                              onClick={() => handleAnswer(optionId, option)}
                              className={`p-3 border-2 rounded-lg text-left transition-all ${
                                isSelected
                                  ? 'border-teal-500 bg-teal-50 shadow-sm'
                                  : 'border-gray-200 hover:border-teal-300'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                  isSelected ? 'border-teal-500 bg-teal-500' : 'border-gray-300'
                                }`}>
                                  {isSelected && (
                                    <CheckCircle className="w-3 h-3 text-white" />
                                  )}
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                  {option}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">💫</span>
                  </div>
                  <div>
                    <p className="text-sm text-teal-800">
                      <strong>Levensstijl alignment is de #1 voorspeller van relatie succes:</strong> {currentQuestion.interactive?.tip}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* USP Generator */}
          {currentQuestion.type === 'usp_generator' && (
            <div className="space-y-4 mb-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">⭐</span>
                  </div>
                  <div>
                    <p className="text-sm text-yellow-800">
                      <strong>Wat maakt jou uniek in de dating wereld?</strong> Beantwoord deze prompts om je onderscheidende kwaliteiten te ontdekken.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {currentQuestion.prompts?.map((prompt, index) => {
                  const promptId = `prompt_${index}`;
                  const currentContent = currentAnswer?.fields?.[promptId] || '';

                  return (
                    <div key={promptId} className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">
                        {prompt}
                      </h4>

                      <Textarea
                        placeholder="Beschrijf hier je antwoord..."
                        value={currentContent}
                        onChange={(e) => {
                          const newFields = {
                            ...currentAnswer?.fields,
                            [promptId]: e.target.value
                          };
                          handleAnswer('usp_generator', 'USP generation', undefined, newFields);
                        }}
                        className="min-h-[80px] resize-none"
                        maxLength={150}
                      />

                      <div className="text-xs text-gray-500 mt-2">
                        {currentContent.length}/150 karakters
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">💫</span>
                  </div>
                  <div>
                    <p className="text-sm text-yellow-800">
                      <strong>USP's maken je 5x zichtbaarder in de swipe massa:</strong> {currentQuestion.interactive?.tip}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Platform Fit */}
          {currentQuestion.type === 'platform_fit' && (
            <div className="space-y-4 mb-6">
              <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">📱</span>
                  </div>
                  <div>
                    <p className="text-sm text-cyan-800">
                      <strong>Welke dating apps passen bij jou?</strong> Selecteer de platforms die het beste bij je persoonlijkheid en doelen passen.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {currentQuestion.platforms?.map((platform) => {
                  const isSelected = currentAnswer?.answerId === platform.id;
                  return (
                    <button
                      key={platform.id}
                      onClick={() => handleAnswer(platform.id, platform.name)}
                      className={`p-4 border-2 rounded-lg text-left transition-all w-full ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-50 shadow-sm'
                          : 'border-gray-200 hover:border-cyan-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isSelected ? 'border-cyan-500 bg-cyan-500' : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <CheckCircle className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {platform.name}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {platform.best_for}
                          </p>
                          <Badge className="bg-cyan-100 text-cyan-700 text-xs">
                            {platform.style}
                          </Badge>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">🎯</span>
                  </div>
                  <div>
                    <p className="text-sm text-cyan-800">
                      <strong>Het juiste platform verhoogt je match kwaliteit met 60%:</strong> {currentQuestion.interactive?.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CTA Optimizer */}
          {currentQuestion.type === 'cta_optimizer' && (
            <div className="space-y-4 mb-6">
              <div className="bg-lime-50 border border-lime-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-lime-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">💬</span>
                  </div>
                  <div>
                    <p className="text-sm text-lime-800">
                      <strong>Welke openingszinnen passen bij jou?</strong> Selecteer de CTA's die het beste bij je persoonlijkheid passen.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {currentQuestion.hooks?.map((hook) => {
                  const isSelected = currentAnswer?.answerId === hook.id;
                  return (
                    <button
                      key={hook.id}
                      onClick={() => handleAnswer(hook.id, hook.text)}
                      className={`p-4 border-2 rounded-lg text-left transition-all w-full ${
                        isSelected
                          ? 'border-lime-500 bg-lime-50 shadow-sm'
                          : 'border-gray-200 hover:border-lime-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isSelected ? 'border-lime-500 bg-lime-500' : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <CheckCircle className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">
                            "{hook.text}"
                          </h4>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-lime-100 text-lime-700 text-xs">
                              {hook.category}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              Effectiviteit: {hook.effectiveness}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="bg-lime-50 border border-lime-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-lime-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">🚀</span>
                  </div>
                  <div>
                    <p className="text-sm text-lime-800">
                      <strong>De juiste CTA verhoogt respons rates met 150%:</strong> {currentQuestion.interactive?.tip}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Conflict Scenario */}
          {currentQuestion.type === 'conflict_scenario' && (
            <div className="space-y-4 mb-6">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">⚖️</span>
                  </div>
                  <div>
                    <p className="text-sm text-orange-800">
                      <strong>{currentQuestion.scenario}</strong>
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {currentQuestion.options?.map((option) => {
                  const isSelected = currentAnswer?.answerId === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleAnswer(option.id, option.label)}
                      className={`p-4 border-2 rounded-lg text-left transition-all w-full ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50 shadow-sm'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isSelected ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                        }`}>
                          {isSelected && (
                            <CheckCircle className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {option.label}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {option.description}
                          </p>
                          {option.strength && (
                            <p className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                              {option.strength}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">🤝</span>
                  </div>
                  <div>
                    <p className="text-sm text-orange-800">
                      <strong>Je conflictstijl toont je volwassenheid:</strong> Dit helpt ons mensen aan te trekken die op dezelfde manier met uitdagingen omgaan.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={state.currentStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Vorige
            </Button>

            {state.currentStep === PROFESSIONAL_PERSONALITY_QUIZ.length - 1 ? (
              <ContextualTooltip content="We genereren 3 professionele profiel opties gebaseerd op je antwoorden.">
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="gap-2 bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700"
                >
                  <Target className="w-4 h-4" />
                  Genereer Profielen
                </Button>
              </ContextualTooltip>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="gap-2"
              >
                Volgende
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {state.isGenerating && (
        <Card className="border-2 border-purple-100">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-500 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">AI Analyse Wordt Uitgevoerd...</h3>
            <p className="text-gray-600 mb-4">
              We verwerken je antwoorden en genereren professionele profiel opties met behulp van geavanceerde psychologie.
            </p>
            <div className="flex justify-center gap-2">
              <Badge variant="secondary" className="bg-coral-100 text-coral-700">Persoonlijkheid Analyse</Badge>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">AI Optimalisatie</Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-700">Psychologie</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tutorial Modal */}
      <TutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        toolId="profile-coach"
        toolName="AI Profiel Architect"
        steps={[
          {
            title: "Welkom bij de AI Profiel Architect! 🏗️",
            content: "Deze professionele tool helpt je om wereldklasse dating profielen te maken met behulp van psychologie, AI en gedragsanalyse. We stellen je 12 diepgaande vragen om je unieke persoonlijkheid te ontdekken.",
            tips: [
              "Wees volledig eerlijk - dit geeft de beste resultaten",
              "Neem je tijd voor elke vraag, reflectie is belangrijk",
              "Je kunt altijd teruggaan om antwoorden aan te passen"
            ]
          },
          {
            title: "Fase 1: Geavanceerde Persoonlijkheid (Vragen 1-3)",
            content: "Deze vragen analyseren je kernpersoonlijkheid met behulp van moderne psychologie. We kijken naar je Big Five persoonlijkheidstrekken, sociale energie en emotionele intelligentie.",
            action: {
              text: "Bekijk de eerste vraag hieronder om te zien hoe het werkt.",
              target: ".space-y-6 > div:nth-child(3)"
            },
            tips: [
              "Kies woorden die jou écht beschrijven, niet wat je denkt dat aantrekkelijk is",
              "De multi-select vragen laten je nuances tonen",
              "Elk antwoord draagt bij aan je unieke profiel-DNA"
            ]
          },
          {
            title: "Fase 2: Relatie Psychologie (Vragen 4-5)",
            content: "Hier onderzoeken we je hechtingsstijl en liefdestalen. Dit helpt ons om profielen te schrijven die de juiste mate van beschikbaarheid en liefde tonen voor jouw ideale partner.",
            tips: [
              "Hechtingsstijl beïnvloedt 70% van je relatie patronen",
              "Liefdestalen bepalen hoe je liefde geeft en ontvangt",
              "Deze inzichten maken je profiel psychologisch aantrekkelijk"
            ]
          },
          {
            title: "Fase 3: Communicatie & Sociale Intelligentie (Vragen 6-7)",
            content: "Deze vragen analyseren hoe je communiceert en conflicten oplost. Dit bepaalt de toon en schrijfstijl van je profiel.",
            tips: [
              "Je communicatiestijl is uniek - we passen je profiel hierop aan",
              "Conflictstijl toont je volwassenheid in relaties",
              "Dit wordt 60% van je profiel aantrekkingskracht"
            ]
          },
          {
            title: "Fase 4: Waarden, Doelen & Levensvisie (Vragen 8-9)",
            content: "Hier definieer je je kernwaarden en relatie doelen. Dit helpt ons om mensen aan te trekken die dezelfde richting op willen als jij.",
            tips: [
              "Gedeelde waarden zijn de basis van sterke relaties",
              "Duidelijke doelen trekken doelgerichte mensen aan",
              "Dit creëert 80% meer betekenisvolle matches"
            ]
          },
          {
            title: "Fase 5: Authenticiteit & Storytelling (Vragen 10-11)",
            content: "Deze vragen helpen je om authentiek te zijn en verhalen te vertellen die mensen raken. Kwetsbaarheid en verhalen maken je onvergetelijk.",
            tips: [
              "Authenticiteit verhoogt respons rates met 40%",
              "Goede verhalen blijven hangen in het geheugen",
              "Dit maakt je onderscheidend in de swipe massa"
            ]
          },
          {
            title: "Fase 6-8: Strategie & Optimalisatie (Vragen 12)",
            content: "De laatste vragen optimaliseren je profiel voor verschillende platforms en doelgroepen. We kiezen de beste openingszinnen en strategieën.",
            tips: [
              "Verschillende apps vragen verschillende strategieën",
              "USP's maken je 5x zichtbaarder",
              "De juiste CTA verhoogt respons met 150%"
            ]
          },
          {
            title: "AI Generatie & Professionele Resultaten",
            content: "Na je antwoorden genereert onze AI 3 professionele profiel opties. Elk profiel is gebaseerd op psychologische principes en geoptimaliseerd voor maximale aantrekkingskracht.",
            tips: [
              "Je krijgt altijd 3 verschillende opties om uit te kiezen",
              "Elk profiel heeft een kwaliteit score en verbeterpunten",
              "Profielen zijn klaar voor direct gebruik op dating apps"
            ]
          },
          {
            title: "Gamification & Voortgang",
            content: "Verdien punten voor elke vraag, bouw streaks op en unlock badges. Dit maakt het leren leuk en motiveert tot completion.",
            tips: [
              "10 punten per vraag - bouw je score op!",
              "Streaks houden je gemotiveerd",
              "Badges tonen je expertise niveau"
            ]
          },
          {
            title: "Workbook Integratie",
            content: "Veel vragen bevatten workbook opdrachten voor diepere reflectie. Deze offline oefeningen helpen je om nog beter na te denken over je antwoorden.",
            tips: [
              "Workbook opdrachten zijn optioneel maar waardevol",
              "Neem je tijd voor reflectie oefeningen",
              "Deze oefeningen verbeteren je zelfkennis aanzienlijk"
            ]
          },
          {
            title: "Pro Tips voor Wereldklasse Resultaten 💎",
            content: "Om het maximale uit deze tool te halen: Wees volledig eerlijk, neem tijd voor reflectie, test verschillende profielen, en gebruik de workbook oefeningen. Succesvolle dating is een vaardigheid die je kunt leren!",
            tips: [
              "Eerlijkheid = Betere matches (altijd kiezen voor authenticiteit boven 'wat werkt')",
              "Test A/B: Gebruik verschillende profielen tegelijkertijd",
              "Track resultaten: Meet welke profielen de beste responses krijgen",
              "Blijf jezelf: Authenticiteit wint altijd op lange termijn",
              "Gebruik de voortgang tracker: Zie hoe je verbetert over tijd",
              "Community: Deel successen en leer van anderen",
              "Herhaal: Kom terug na een paar maanden voor bijstelling"
            ]
          }
        ]}
        onComplete={completeTutorial}
      />
    </div>
  );
};
