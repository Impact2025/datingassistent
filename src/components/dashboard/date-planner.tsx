'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/providers/user-provider';
import { useToolCompletion } from '@/hooks/use-tool-completion';
import { ErrorBoundary } from '@/components/shared/error-boundary';
import {
  Calendar,
  MapPin,
  Clock,
  Heart,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Coffee,
  Wine,
  Utensils,
  Gamepad2,
  Home,
  HelpCircle
} from 'lucide-react';
import { TutorialModal, useTutorial } from '@/components/shared/tutorial-modal';

interface DatePlanRequest {
  dateIdeaId?: string;
  dateType: 'koffie' | 'drankje' | 'diner' | 'activiteit' | 'wandeldate' | 'thuisdate' | 'anders';
  location: string;
  duration: number;
  energyLevel: 'laag' | 'gemiddeld' | 'hoog';
  desiredStyle: 'speels' | 'zelfverzekerd' | 'relaxed' | 'romantisch';
  budget: 'laag' | 'normaal' | 'luxe';
  dateInfo?: string;
  insecurities?: string[];
  userGoals?: string;
  initiator?: 'ik' | 'zij/hij' | 'beiden';
}

interface DatePlanResponse {
  id: string;
  mindset: string;
  checklist: Array<{
    category: string;
    item: string;
    completed: boolean;
    priority: string;
  }>;
  timeline: Array<{
    time: string;
    action: string;
    duration?: number;
    location?: string;
  }>;
  outfit: {
    style: string;
    items: string[];
    reasoning: string;
  };
  items: string[];
  openers: string[];
  topics: Array<{
    theme: string;
    questions: string[];
    why: string;
  }>;
  warnings: string[];
  closers: string[];
  followUp: {
    immediate: string[];
    nextDay: string[];
    timing: string;
  };
  planB: {
    weather: string;
    noShow: string;
    emergency: string;
  };
  whatsapp: string;
}

const DATE_TYPES = [
  { value: 'koffie', label: 'Koffie Date', icon: Coffee, description: 'Ontspannen kennismaking' },
  { value: 'drankje', label: 'Drankje', icon: Wine, description: 'Borrel of cocktail' },
  { value: 'diner', label: 'Diner', icon: Utensils, description: 'Avondeten samen' },
  { value: 'activiteit', label: 'Activiteit', icon: Gamepad2, description: 'Gedeelde hobby of sport' },
  { value: 'wandeldate', label: 'Wandeldate', icon: MapPin, description: 'Wandeling in de natuur' },
  { value: 'thuisdate', label: 'Thuisdate', icon: Home, description: 'Bij iemand thuis' },
  { value: 'anders', label: 'Anders', icon: HelpCircle, description: 'Iets anders' }
];

const ENERGY_LEVELS = [
  { value: 'laag', label: 'Laag', description: 'Rustig en relaxed' },
  { value: 'gemiddeld', label: 'Gemiddeld', description: 'Normaal tempo' },
  { value: 'hoog', label: 'Hoog', description: 'Energiek en actief' }
];

const DESIRED_STYLES = [
  { value: 'speels', label: 'Speels', description: 'Humor en leuke vibes' },
  { value: 'zelfverzekerd', label: 'Zelfverzekerd', description: 'Kalm en zeker van jezelf' },
  { value: 'relaxed', label: 'Relaxed', description: 'Ontspannen en easy-going' },
  { value: 'romantisch', label: 'Romantisch', description: 'Speciaal en attent' }
];

const BUDGET_LEVELS = [
  { value: 'laag', label: 'Laag', description: '€0-25 per persoon' },
  { value: 'normaal', label: 'Normaal', description: '€25-60 per persoon' },
  { value: 'luxe', label: 'Luxe', description: '€60+ per persoon' }
];

export function DatePlanner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const { markAsCompleted } = useToolCompletion('date-planner');
  const { showTutorial, startTutorial, completeTutorial, setShowTutorial } = useTutorial('date-planner');

  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<DatePlanResponse | null>(null);
  const [formData, setFormData] = useState<Partial<DatePlanRequest>>({
    dateType: 'koffie',
    energyLevel: 'gemiddeld',
    desiredStyle: 'zelfverzekerd',
    budget: 'normaal',
    duration: 120
  });

  const totalSteps = 5;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  // Check for date idea integration
  useEffect(() => {
    if (!searchParams) return;

    const dateIdeaId = searchParams.get('idea');
    const dateType = searchParams.get('type');
    const location = searchParams.get('location');

    if (dateIdeaId && dateType && location) {
      setFormData(prev => ({
        ...prev,
        dateIdeaId,
        dateType: dateType as any,
        location: decodeURIComponent(location)
      }));
    }
  }, [searchParams]);

  const handleInputChange = (field: keyof DatePlanRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    // Validate Step 0 - Basic Info
    if (currentStep === 0) {
      if (!formData.location || formData.location.trim() === '') {
        alert('Vul eerst een locatie in voordat je verder gaat.');
        return;
      }
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      generateDatePlan();
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const generateDatePlan = async () => {
    if (!user?.id) return;

    // Validate required fields (backup validation)
    if (!formData.dateType || !formData.location || formData.location.trim() === '') {
      alert('Er ontbreekt nog informatie. Ga terug naar stap 1 om de locatie in te vullen.');
      setCurrentStep(0); // Go back to first step
      return;
    }

    setIsGenerating(true);

    try {
      const requestData: DatePlanRequest = {
        dateType: formData.dateType,
        location: formData.location,
        duration: formData.duration || 120,
        energyLevel: formData.energyLevel || 'gemiddeld',
        desiredStyle: formData.desiredStyle || 'zelfverzekerd',
        budget: formData.budget || 'normaal',
        dateInfo: formData.dateInfo,
        insecurities: formData.insecurities,
        userGoals: formData.userGoals,
        initiator: formData.initiator,
        dateIdeaId: formData.dateIdeaId
      };

      const response = await fetch('/api/date-planner/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Er is iets misgegaan bij het maken van je date plan. Probeer het opnieuw.');
      }

      const result = await response.json();
      setGeneratedPlan(result.data);

      // Track completion
      await markAsCompleted('date_plan_created', {
        date_type: requestData.dateType,
        has_date_idea: !!requestData.dateIdeaId
      });

    } catch (error) {
      console.error('Date plan generation error:', error);
      alert('Er is iets misgegaan bij het maken van je date plan. Probeer het opnieuw.');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetPlanner = () => {
    setCurrentStep(0);
    setGeneratedPlan(null);
    setFormData({
      dateType: 'koffie',
      energyLevel: 'gemiddeld',
      desiredStyle: 'zelfverzekerd',
      budget: 'normaal',
      duration: 120
    });
  };

  if (generatedPlan) {
    return <DatePlanResult plan={generatedPlan} onReset={resetPlanner} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-coral-50 to-white">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <Card className="bg-white/80 backdrop-blur-sm border-coral-100 shadow-lg">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-coral-100 rounded-full">
                <Sparkles className="w-8 h-8 text-coral-600" />
              </div>
              <div>
                <CardTitle className="text-2xl text-gray-800">Date Planner</CardTitle>
                <p className="text-gray-600">Maak je perfecte date onweerstaanbaar</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={startTutorial}
                className="gap-2 border-coral-200 hover:bg-coral-50"
              >
                <HelpCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Tutorial</span>
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Stap {currentStep + 1} van {totalSteps}</span>
                <span>{Math.round(progress)}% compleet</span>
              </div>
              <Progress value={progress} className="h-2 bg-coral-100" />
            </div>
          </CardHeader>
        </Card>

        {/* Step Content */}
        <Card className="bg-white/90 backdrop-blur-sm border-coral-100 shadow-lg">
          <CardContent className="p-8">
            {currentStep === 0 && <StepBasicInfo formData={formData} onChange={handleInputChange} />}
            {currentStep === 1 && <StepContentInfo formData={formData} onChange={handleInputChange} />}
            {currentStep === 2 && <StepPracticalPrep formData={formData} onChange={handleInputChange} />}
            {currentStep === 3 && <StepPersonalWishes formData={formData} onChange={handleInputChange} />}
            {currentStep === 4 && <StepAIGeneration isGenerating={isGenerating} />}
          </CardContent>
        </Card>

        {/* Navigation */}
        <Card className="bg-white/80 backdrop-blur-sm border-coral-100 shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="gap-2 border-coral-200 hover:bg-coral-50"
              >
                <ArrowLeft className="w-4 h-4" />
                Vorige
              </Button>

              <Button
                onClick={handleNext}
                disabled={isGenerating}
                className="gap-2 bg-coral-500 hover:bg-coral-600"
              >
                {currentStep === totalSteps - 1 ? (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Plan Genereren
                  </>
                ) : (
                  <>
                    Volgende
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tutorial Modal */}
        <TutorialModal
          isOpen={showTutorial}
          onClose={() => setShowTutorial(false)}
          toolId="date-planner"
          toolName="Date Planner"
          steps={[
            {
              title: "Welkom bij de Date Planner! 📅",
              content: "Deze tool helpt je om professionele date plannen te maken met complete checklists, tijdschema's, gespreksonderwerpen en outfit advies. Perfect voor het organiseren van memorabele dates die goed aflopen.",
              tips: [
                "Gebruik deze tool voor elke belangrijke date",
                "Combineer met Date Ideeën voor inspiratie",
                "De plannen zijn volledig aanpasbaar aan je behoeften"
              ]
            },
            {
              title: "Stap 1: Basis Informatie",
              content: "Begin met de basis: wat voor date is het, waar vindt het plaats, hoe lang duurt het en wie heeft het initiatief genomen. Deze informatie bepaalt de toon van je hele plan.",
              action: {
                text: "Bekijk de eerste stap hieronder om te zien welke informatie je nodig hebt.",
                target: ".space-y-6 > div:first-child"
              },
              tips: [
                "Wees specifiek over de locatie voor betere adviezen",
                "De duur beïnvloedt hoeveel activiteiten je plant",
                "Het initiatief geeft aanwijzingen over de dynamiek"
              ]
            },
            {
              title: "Stap 2: Vibe & Energie",
              content: "Bepaal de sfeer van de date: energie level, gewenste stijl en budget. Dit helpt de AI om een plan te maken dat perfect bij jullie past.",
              tips: [
                "Laag energie = ontspannen, rustig tempo",
                "Speels = humor en leuke interacties",
                "Romantisch = attent en speciaal gevoel"
              ]
            },
            {
              title: "Stap 3: Persoonlijke Informatie",
              content: "Deel wat je weet over je date en wat je zelf lastig vindt. Hoe meer context, hoe beter het plan wordt afgestemd op jullie behoeften.",
              tips: [
                "Wees eerlijk over je uitdagingen voor betere hulp",
                "Specifieke informatie over je date = persoonlijkere adviezen",
                "Je doelen bepalen de focus van het plan"
              ]
            },
            {
              title: "Stap 4: Uitdagingen & Doelen",
              content: "Benoem je persoonlijke uitdagingen en wat je wilt bereiken. De AI geeft specifieke hulp voor zenuwen, gesprekken en afsluiting.",
              tips: [
                "Veelvoorkomende uitdagingen: zenuwen, gesprekken, lichaamstaal",
                "Wees duidelijk over je doelen voor gerichte hulp",
                "Elke uitdaging krijgt specifieke oplossingen"
              ]
            },
            {
              title: "AI Generatie & Resultaten",
              content: "De AI stelt een compleet plan samen met checklist, tijdschema, outfit advies, gespreksonderwerpen en WhatsApp tekst. Alles is klaar voor gebruik!",
              tips: [
                "Het plan is volledig - je hoeft alleen maar te volgen",
                "Alle elementen zijn onderbouwd en getest",
                "Pas aan waar nodig, maar volg de structuur"
              ]
            },
            {
              title: "Het Complete Plan Gebruiken",
              content: "Je ontvangt: Checklist om niets te vergeten, Tijdschema voor de flow, Outfit advies, Gespreksonderwerpen, WhatsApp uitnodiging, en Plan B voor noodgevallen.",
              tips: [
                "Gebruik de checklist tijdens je voorbereiding",
                "Het tijdschema geeft natuurlijke flow aan de date",
                "De WhatsApp tekst is kant-en-klaar om te versturen"
              ]
            },
            {
              title: "Professioneel Date Succes 💪",
              content: "Met deze tool maximaliseer je je kansen op een succesvolle date. Goede voorbereiding is het halve werk - en nu heb je een complete professionele aanpak!",
              tips: [
                "Voorbereiding = zelfvertrouwen",
                "Volg het plan, maar blijf authentiek",
                "Gebruik voor elke belangrijke date",
                "Track je successen en leer van elke ervaring"
              ]
            }
          ]}
          onComplete={completeTutorial}
        />
      </div>
    </div>
  );
}

// Step Components
function StepBasicInfo({ formData, onChange }: any) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Basisinformatie</h3>
        <p className="text-gray-600">Laten we beginnen met de basics van je date</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Date Type</label>
          <Select value={formData.dateType} onValueChange={(value) => onChange('dateType', value)}>
            <SelectTrigger className="border-coral-200 focus:border-coral-400">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <type.icon className="w-4 h-4" />
                    {type.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Locatie <span className="text-coral-600">*</span>
          </label>
          <Input
            value={formData.location || ''}
            onChange={(e) => onChange('location', e.target.value)}
            placeholder="Bijv: Café Central, Amsterdam"
            className="border-coral-200 focus:border-coral-400"
            required
          />
          <p className="text-xs text-gray-500">Vul de specifieke locatie in voor betere adviezen</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Duur (minuten)</label>
          <Input
            type="number"
            value={formData.duration || 120}
            onChange={(e) => onChange('duration', parseInt(e.target.value))}
            min={30}
            max={480}
            className="border-coral-200 focus:border-coral-400"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Initiatief</label>
          <Select value={formData.initiator || 'ik'} onValueChange={(value) => onChange('initiator', value)}>
            <SelectTrigger className="border-coral-200 focus:border-coral-400">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ik">Ik heb gevraagd</SelectItem>
              <SelectItem value="zij/hij">Zij/hij heeft gevraagd</SelectItem>
              <SelectItem value="beiden">We hebben beiden gevraagd</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

function StepContentInfo({ formData, onChange }: any) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Inhoudelijke Informatie</h3>
        <p className="text-gray-600">Vertel ons meer over de vibe en jullie interesses</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Energie Level</label>
          <Select value={formData.energyLevel} onValueChange={(value) => onChange('energyLevel', value)}>
            <SelectTrigger className="border-coral-200 focus:border-coral-400">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ENERGY_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Gewenste Stijl</label>
          <Select value={formData.desiredStyle} onValueChange={(value) => onChange('desiredStyle', value)}>
            <SelectTrigger className="border-coral-200 focus:border-coral-400">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DESIRED_STYLES.map((style) => (
                <SelectItem key={style.value} value={style.value}>
                  {style.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Budget</label>
          <Select value={formData.budget} onValueChange={(value) => onChange('budget', value)}>
            <SelectTrigger className="border-coral-200 focus:border-coral-400">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BUDGET_LEVELS.map((budget) => (
                <SelectItem key={budget.value} value={budget.value}>
                  {budget.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Wat weet je over je date?</label>
        <Textarea
          value={formData.dateInfo || ''}
          onChange={(e) => onChange('dateInfo', e.target.value)}
          placeholder="Bijv: Houdt van Italiaans eten, sportief, heeft gevoel voor humor..."
          rows={3}
          className="border-coral-200 focus:border-coral-400"
        />
      </div>
    </div>
  );
}

function StepPracticalPrep({ formData, onChange }: any) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Praktische Voorbereiding</h3>
        <p className="text-gray-600">Laten we de praktische zaken regelen</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-coral-50 rounded-lg border border-coral-200">
          <Calendar className="w-5 h-5 text-coral-600" />
          <div className="flex-1">
            <p className="font-medium text-gray-800">Reservering nodig?</p>
            <p className="text-sm text-gray-600">Voor restaurants, activiteiten of speciale gelegenheden</p>
          </div>
          <Select value={formData.needsReservation ? 'ja' : 'nee'} onValueChange={(value) => onChange('needsReservation', value === 'ja')}>
            <SelectTrigger className="w-20 border-coral-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ja">Ja</SelectItem>
              <SelectItem value="nee">Nee</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <MapPin className="w-5 h-5 text-blue-600" />
          <div className="flex-1">
            <p className="font-medium text-gray-800">Vervoer</p>
            <p className="text-sm text-gray-600">Hoe ga je naar de date?</p>
          </div>
          <Select value={formData.transport || 'auto'} onValueChange={(value) => onChange('transport', value)}>
            <SelectTrigger className="w-32 border-blue-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto</SelectItem>
              <SelectItem value="fiets">Fiets</SelectItem>
              <SelectItem value="openbaar">Openbaar</SelectItem>
              <SelectItem value="lopen">Lopen</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

function StepPersonalWishes({ formData, onChange }: any) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Persoonlijke Wensen</h3>
        <p className="text-gray-600">Help ons om het plan perfect op jou af te stemmen</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Wat vind je lastig op dates?</label>
          <Select value={formData.mainChallenge || ''} onValueChange={(value) => onChange('mainChallenge', value)}>
            <SelectTrigger className="border-coral-200 focus:border-coral-400">
              <SelectValue placeholder="Selecteer je grootste uitdaging" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="zenuwen">Zenuwen en spanning</SelectItem>
              <SelectItem value="gesprekken">Gesprekken gaande houden</SelectItem>
              <SelectItem value="afsluiten">Date goed afsluiten</SelectItem>
              <SelectItem value="lichaamstaal">Juiste lichaamstaal</SelectItem>
              <SelectItem value="eerste_indruk">Goede eerste indruk maken</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Waar heb je extra hulp bij nodig?</label>
          <Textarea
            value={formData.needsHelp || ''}
            onChange={(e) => onChange('needsHelp', e.target.value)}
            placeholder="Bijv: Ik vind het moeilijk om opener zinnen te bedenken, of ik maak me zorgen over stiltes..."
            rows={3}
            className="border-coral-200 focus:border-coral-400"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Wat zijn je doelen voor deze date?</label>
          <Textarea
            value={formData.userGoals || ''}
            onChange={(e) => onChange('userGoals', e.target.value)}
            placeholder="Bijv: Een leuke connectie maken, kijken of er chemistry is, gewoon een gezellige avond..."
            rows={2}
            className="border-coral-200 focus:border-coral-400"
          />
        </div>
      </div>
    </div>
  );
}

function StepAIGeneration({ isGenerating }: { isGenerating: boolean }) {
  return (
    <div className="text-center space-y-6 py-12">
      <div className="flex justify-center">
        <div className="p-6 bg-coral-100 rounded-full">
          <Sparkles className="w-12 h-12 text-coral-600 animate-pulse" />
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {isGenerating ? 'Iris maakt je Date Plan...' : 'Bijna klaar!'}
        </h3>
        <p className="text-gray-600">
          {isGenerating
            ? 'Onze AI-assistent stelt een persoonlijk plan samen gebaseerd op je antwoorden.'
            : 'Klik op "Plan Genereren" om je unieke date plan te ontvangen.'
          }
        </p>
      </div>

      {isGenerating && (
        <div className="space-y-2">
          <div className="w-full bg-coral-100 rounded-full h-2">
            <div className="bg-coral-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
          <p className="text-sm text-gray-500">Dit duurt ongeveer 3 seconden...</p>
        </div>
      )}
    </div>
  );
}

function DatePlanResult({ plan, onReset }: { plan: DatePlanResponse; onReset: () => void }) {
  const [checklistItems, setChecklistItems] = useState(plan.checklist);

  const toggleChecklistItem = (index: number) => {
    const updatedItems = [...checklistItems];
    updatedItems[index].completed = !updatedItems[index].completed;
    setChecklistItems(updatedItems);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Gekopieerd naar klembord!');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coral-50 to-white">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Success Header */}
        <Card className="bg-gradient-to-r from-coral-100 to-coral-200 border-coral-200 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-white rounded-full shadow-lg">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Je Date Plan is Klaar! 🎉</h2>
            <p className="text-gray-700">{plan.mindset}</p>
          </CardContent>
        </Card>

        {/* Checklist */}
        <Card className="bg-white/90 backdrop-blur-sm border-coral-100 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-coral-600" />
              Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {checklistItems.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    item.completed
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={() => toggleChecklistItem(index)}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    item.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
                  }`}>
                    {item.completed && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${item.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                      {item.item}
                    </p>
                    <Badge variant="outline" className="text-xs mt-1">
                      {item.category}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="bg-white/90 backdrop-blur-sm border-coral-100 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Tijdschema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {plan.timeline.map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    {index < plan.timeline.length - 1 && <div className="w-0.5 h-12 bg-blue-200 mt-2"></div>}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary">{item.time}</Badge>
                      {item.location && <Badge variant="outline">{item.location}</Badge>}
                    </div>
                    <p className="text-gray-800">{item.action}</p>
                    {item.duration && (
                      <p className="text-sm text-gray-500">±{item.duration} minuten</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Outfit & Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white/90 backdrop-blur-sm border-coral-100 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-coral-600" />
                Outfit Advies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="font-medium text-gray-800">{plan.outfit.style}</p>
                <ul className="space-y-1">
                  {plan.outfit.items.map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-coral-400 rounded-full"></div>
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-gray-500 italic">{plan.outfit.reasoning}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-coral-100 shadow-lg">
            <CardHeader>
              <CardTitle>Wat Neem Je Mee?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.items.map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-700">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Conversation Guide */}
        <Card className="bg-white/90 backdrop-blur-sm border-coral-100 shadow-lg">
          <CardHeader>
            <CardTitle>Gespreksgids</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-800 mb-3">Openingszinnen</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {plan.openers.map((opener, index) => (
                    <div key={index} className="p-3 bg-coral-50 rounded-lg border border-coral-200">
                      <p className="text-sm text-gray-700 italic">"{opener}"</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-3">Gespreksonderwerpen</h4>
                <div className="space-y-3">
                  {plan.topics.map((topic, index) => (
                    <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h5 className="font-medium text-blue-800 mb-2">{topic.theme}</h5>
                      <ul className="space-y-1 mb-2">
                        {topic.questions.map((question, qIndex) => (
                          <li key={qIndex} className="text-sm text-blue-700">• {question}</li>
                        ))}
                      </ul>
                      <p className="text-xs text-blue-600 italic">{topic.why}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp & Actions */}
        <Card className="bg-white/90 backdrop-blur-sm border-coral-100 shadow-lg">
          <CardHeader>
            <CardTitle>WhatsApp Uitnodiging</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200 mb-4">
              <p className="text-green-800 italic">"{plan.whatsapp}"</p>
            </div>
            <Button
              onClick={() => copyToClipboard(plan.whatsapp)}
              className="w-full bg-green-500 hover:bg-green-600 gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Kopieer WhatsApp Tekst
            </Button>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="bg-white/80 backdrop-blur-sm border-coral-100 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" onClick={onReset} className="gap-2 border-coral-200 hover:bg-coral-50">
                <ArrowLeft className="w-4 h-4" />
                Nieuwe Date Plan
              </Button>
              <Button className="gap-2 bg-coral-500 hover:bg-coral-600">
                <Heart className="w-4 h-4" />
                Plan Uitvoeren
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Wrap with error boundary
export const DatePlannerWithErrorBoundary = () => (
  <ErrorBoundary>
    <DatePlanner />
  </ErrorBoundary>
);