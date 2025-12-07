"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/providers/user-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { InterestSelection } from "@/components/ui/interest-selection";
import { LocationDistanceSlider } from "@/components/ui/location-distance-slider";
import {
  MapPin,
  Heart,
  DollarSign,
  Clock,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle,
  Star,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TutorialModal, useTutorial } from '@/components/shared/tutorial-modal';

interface DateIdeasProFormProps {
  onComplete?: (results: DateIdeaResults) => void;
}

interface DateIdeaResults {
  topMatches: DateIdea[];
  creativeSurprises: DateIdea[];
  lowEffortOptions: DateIdea[];
  userPreferences: UserPreferences;
}

interface DateIdea {
  title: string;
  description: string;
  whatsappLine: string;
  score: number;
  category: string;
}

interface UserPreferences {
  location: string;
  maxDistance: number;
  userInterests: string[];
  dateInterests: string[];
  vibe: string;
  budget: string;
  weatherConsideration: boolean;
  indoorOutdoor: string;
  timeOfDay: string;
}

const VIBE_OPTIONS = [
  { id: 'first-meeting', label: 'Eerste ontmoeting', description: 'Luchtig en ontspannen', icon: '☕' },
  { id: 'second-date', label: 'Tweede date', description: 'Verdieping en connectie', icon: '💕' },
  { id: 'romantic', label: 'Romantisch & intiem', description: 'Speciaal en liefdevol', icon: '🌹' },
  { id: 'creative', label: 'Creatief & speels', description: 'Origineel en avontuurlijk', icon: '🎨' },
  { id: 'energetic', label: 'Energiek & actief', description: 'Sportief en dynamisch', icon: '⚡' },
  { id: 'casual', label: 'Casual koffie & praten', description: 'Gezellig en informeel', icon: '🗣️' }
];

const BUDGET_OPTIONS = [
  { id: 'low', label: 'Laag budget', range: '€0-20', description: 'Gratis of goedkoop' },
  { id: 'medium', label: 'Gemiddeld', range: '€20-60', description: 'Standaard prijzen' },
  { id: 'high', label: 'Hoog budget', range: '€60+', description: 'Luxe ervaringen' }
];

export function DateIdeasProForm({ onComplete }: DateIdeasProFormProps) {
  const { userProfile } = useUser();
  const { showTutorial, startTutorial, completeTutorial, setShowTutorial } = useTutorial('date-ideas');
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<DateIdeaResults | null>(null);

  // Form state
  const [formData, setFormData] = useState<UserPreferences>({
    location: userProfile?.location || '',
    maxDistance: 25,
    userInterests: [],
    dateInterests: [],
    vibe: '',
    budget: '',
    weatherConsideration: false,
    indoorOutdoor: '',
    timeOfDay: ''
  });

  const [knowsDateInterests, setKnowsDateInterests] = useState(false);

  const totalSteps = 6;

  // Pre-fill location from user profile
  useEffect(() => {
    if (userProfile?.location && !formData.location) {
      setFormData(prev => ({ ...prev, location: userProfile.location || '' }));
    }
  }, [userProfile, formData.location]);

  const updateFormData = (field: keyof UserPreferences, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateIdeas = async () => {
    setIsGenerating(true);

    try {
      // Get auth token
      const token = localStorage.getItem('datespark_auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Call the real API
      const response = await fetch('/api/date-ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          city: formData.location,
          preferences: {
            userInterests: formData.userInterests,
            dateInterests: formData.dateInterests,
            vibe: formData.vibe,
            budget: formData.budget,
            weatherConsideration: formData.weatherConsideration,
            indoorOutdoor: formData.indoorOutdoor,
            timeOfDay: formData.timeOfDay
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }

      const apiResponse = await response.json();

      // Transform API response to our expected format
      // The API returns ideas as an array of strings, we need to parse them
      const parsedIdeas = apiResponse.ideas.map((ideaText: string, index: number) => {
        // Parse the markdown format from the API
        const lines = ideaText.split('\n').filter(line => line.trim());

        let title = `Date Idee ${index + 1}`;
        let description = '';
        let whatsappLine = '';
        const score = 85 - (index * 5); // Decreasing scores

        // Try to extract title from **Idee:** line
        const ideeMatch = ideaText.match(/\*\*Idee:\*\*\s*(.+?)(?:\n|$)/);
        if (ideeMatch) {
          title = ideeMatch[1].trim();
        }

        // Try to extract description from **Waarom dit werkt:** line
        const waaromMatch = ideaText.match(/\*\*Waarom dit werkt:\*\*\s*(.+?)(?:\n|$)/);
        if (waaromMatch) {
          description = waaromMatch[1].trim();
        }

        // Try to extract whatsapp message
        const berichtMatch = ideaText.match(/\*\*Voorbeeldbericht:\*\*\s*"([^"]+)"/);
        if (berichtMatch) {
          whatsappLine = berichtMatch[1];
        }

        return {
          title,
          description,
          whatsappLine,
          score,
          category: index < 3 ? 'top-match' : index < 5 ? 'creative' : 'low-effort'
        };
      });

      // Group ideas into categories
      const topMatches = parsedIdeas.slice(0, 3);
      const creativeSurprises = parsedIdeas.slice(3, 5);
      const lowEffortOptions = parsedIdeas.slice(5, 7);

      const results: DateIdeaResults = {
        userPreferences: formData,
        topMatches,
        creativeSurprises,
        lowEffortOptions
      };

      setResults(results);
      setIsGenerating(false);
      onComplete?.(results);

    } catch (error) {
      console.error('Error generating date ideas:', error);

      // Fallback to mock data if API fails
      const mockResults: DateIdeaResults = {
        userPreferences: formData,
        topMatches: [
          {
            title: "Cocktail Challenge Bar",
            description: "Een speelse cocktail workshop waar jullie samen drankjes leren mixen. Perfect voor een eerste date met humor en interactie.",
            whatsappLine: "Hey! Zin in een cocktail challenge? Ik weet een leuke bar waar we samen drankjes kunnen leren mixen 😉🍸",
            score: 92,
            category: "top-match"
          },
          {
            title: "Stads wandeling met street food",
            description: "Een ontspannen wandeling door de stad met stops bij verschillende street food kraampjes. Ontdek elkaars smaak.",
            whatsappLine: "Lijkt het je leuk om samen door de stad te wandelen en verschillende street food te proberen? 🌆🍜",
            score: 88,
            category: "top-match"
          },
          {
            title: "Museum + Café combo",
            description: "Bezoek een interessant museum gevolgd door een goed gesprek in een gezellig café. Cultuur en connectie.",
            whatsappLine: "Ik zag een interessante tentoonstelling in het museum. Zin om samen te gaan kijken en daarna wat te drinken? 🎨☕",
            score: 85,
            category: "top-match"
          }
        ],
        creativeSurprises: [
          {
            title: "Suprise escape room",
            description: "Een onverwachte escape room ervaring. Test jullie teamwork en probleemoplossend vermogen.",
            whatsappLine: "Verrassing! Zin in een escape room avontuur? Ik denk dat we een goed team zouden zijn 🕵️‍♂️🔐",
            score: 78,
            category: "creative"
          },
          {
            title: "Kookworkshop voor beginners",
            description: "Leer samen een nieuw gerecht koken in een leuke workshop setting. Creatief en praktisch.",
            whatsappLine: "Ik zag een kookworkshop voor iets nieuws. Zin om samen te leren koken? 👨‍🍳🍳",
            score: 75,
            category: "creative"
          }
        ],
        lowEffortOptions: [
          {
            title: "Park picknick",
            description: "Een eenvoudige picknick in het park met zelfgemaakte sandwiches. Ontspannen en goedkoop.",
            whatsappLine: "Zin in een relaxte picknick in het park? Ik neem lekkere broodjes mee 🧺🌳",
            score: 65,
            category: "low-effort"
          },
          {
            title: "Koffie bij de bakker",
            description: "Gewoon een kop koffie bij de lokale bakker. Perfect voor een eerste gesprek.",
            whatsappLine: "Er is een leuke bakker hier vlakbij. Zin in een kop koffie en een goed gesprek? ☕🥐",
            score: 62,
            category: "low-effort"
          }
        ]
      };

      setResults(mockResults);
      setIsGenerating(false);
      onComplete?.(mockResults);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Waar wil je daten?</h3>
              <p className="text-gray-600">
                Kies je locatie en maximale afstand voor date ideeën
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stad of postcode</label>
                <Input
                  value={formData.location}
                  onChange={(e) => updateFormData('location', e.target.value)}
                  placeholder="bijv. Amsterdam, Rotterdam..."
                  className="bg-gray-50 border-gray-200 focus:border-gray-300 focus:bg-white"
                />
                {userProfile?.location && (
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Gebaseerd op je profiel: {userProfile.location}
                  </p>
                )}
              </div>

              <LocationDistanceSlider
                value={formData.maxDistance}
                onChange={(value) => updateFormData('maxDistance', value)}
                showLocation={true}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Heart className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Jouw interesses</h3>
              <p className="text-gray-600">
                Wat vind jij leuk? Dit helpt ons de beste date ideeën te vinden
              </p>
            </div>

            <InterestSelection
              selectedInterests={formData.userInterests}
              onSelectionChange={(interests) => updateFormData('userInterests', interests)}
              title="Selecteer jouw interesses"
              subtitle="Kies minimaal 2 interesses voor betere matches"
              maxSelections={5}
              showExistingData={true}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Heart className="w-12 h-12 mx-auto mb-4 text-purple-500" />
              <h3 className="text-xl font-bold mb-2">Interesses van je date</h3>
              <p className="text-muted-foreground">
                Weet je wat je date leuk vindt? Dit maakt de ideeën nog persoonlijker
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <Button
                  variant={knowsDateInterests ? "default" : "outline"}
                  onClick={() => setKnowsDateInterests(true)}
                  className="flex-1"
                >
                  Ja, ik weet wat hij/zij leuk vindt
                </Button>
                <Button
                  variant={!knowsDateInterests ? "default" : "outline"}
                  onClick={() => {
                    setKnowsDateInterests(false);
                    updateFormData('dateInterests', []);
                  }}
                  className="flex-1"
                >
                  Nee, geen idee
                </Button>
              </div>

              {knowsDateInterests && (
                <InterestSelection
                  selectedInterests={formData.dateInterests}
                  onSelectionChange={(interests) => updateFormData('dateInterests', interests)}
                  title="Selecteer interesses van je date"
                  subtitle="Wat vindt hij/zij leuk?"
                  maxSelections={5}
                  showExistingData={false}
                />
              )}

              {!knowsDateInterests && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    Geen probleem! We gebruiken alleen jouw interesses om ideeën te genereren.
                    De resultaten zijn dan iets algemener, maar nog steeds heel geschikt.
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Heart className="w-12 h-12 mx-auto mb-4 text-pink-500" />
              <h3 className="text-xl font-bold mb-2">Type date & sfeer</h3>
              <p className="text-muted-foreground">
                Wat voor soort date wordt dit? Dit bepaalt de toon van de ideeën
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {VIBE_OPTIONS.map((vibe) => (
                <button
                  key={vibe.id}
                  onClick={() => updateFormData('vibe', vibe.id)}
                  className={cn(
                    "p-4 border-2 rounded-lg text-left transition-all hover:shadow-md",
                    formData.vibe === vibe.id
                      ? "border-pink-500 bg-pink-50 shadow-md"
                      : "border-gray-200 hover:border-pink-300 bg-white"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{vibe.icon}</span>
                    <div>
                      <h4 className="font-semibold text-sm">{vibe.label}</h4>
                      <p className="text-xs text-muted-foreground">{vibe.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <DollarSign className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-xl font-bold mb-2">Budget</h3>
              <p className="text-muted-foreground">
                Wat is je budget voor deze date?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {BUDGET_OPTIONS.map((budget) => (
                <button
                  key={budget.id}
                  onClick={() => updateFormData('budget', budget.id)}
                  className={cn(
                    "p-6 border-2 rounded-lg text-center transition-all hover:shadow-md",
                    formData.budget === budget.id
                      ? "border-green-500 bg-green-50 shadow-md"
                      : "border-gray-200 hover:border-green-300 bg-white"
                  )}
                >
                  <div className="text-2xl mb-2">{budget.id === 'low' ? '💰' : budget.id === 'medium' ? '💳' : '💎'}</div>
                  <h4 className="font-semibold">{budget.label}</h4>
                  <p className="text-sm text-muted-foreground">{budget.range}</p>
                  <p className="text-xs text-muted-foreground mt-1">{budget.description}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Clock className="w-12 h-12 mx-auto mb-4 text-blue-500" />
              <h3 className="text-xl font-bold mb-2">Bijna klaar!</h3>
              <p className="text-muted-foreground">
                Optionele extra voorkeuren voor nog betere ideeën
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="weather"
                  checked={formData.weatherConsideration}
                  onChange={(e) => updateFormData('weatherConsideration', e.target.checked)}
                  className="w-4 h-4 text-pink-500"
                />
                <label htmlFor="weather" className="text-sm">
                  Neem weer mee in overweging (indoor vs outdoor ideeën)
                </label>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Voorkeur indoor/outdoor</label>
                <div className="flex gap-2">
                  {['Indoor', 'Outdoor', 'Geen voorkeur'].map((option) => (
                    <button
                      key={option}
                      onClick={() => updateFormData('indoorOutdoor', option.toLowerCase())}
                      className={cn(
                        "px-4 py-2 border rounded-lg text-sm transition-colors",
                        formData.indoorOutdoor === option.toLowerCase()
                          ? "border-pink-500 bg-pink-50 text-pink-700"
                          : "border-gray-200 hover:border-pink-300"
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Tijdstip voorkeur</label>
                <div className="flex gap-2">
                  {['Ochtend', 'Middag', 'Avond', 'Geen voorkeur'].map((time) => (
                    <button
                      key={time}
                      onClick={() => updateFormData('timeOfDay', time.toLowerCase())}
                      className={cn(
                        "px-4 py-2 border rounded-lg text-sm transition-colors",
                        formData.timeOfDay === time.toLowerCase()
                          ? "border-pink-500 bg-pink-50 text-pink-700"
                          : "border-gray-200 hover:border-pink-300"
                      )}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1: return formData.location.trim().length > 0;
      case 2: return formData.userInterests.length >= 2;
      case 3: return true; // Optional step
      case 4: return formData.vibe.length > 0;
      case 5: return formData.budget.length > 0;
      case 6: return true; // Optional step
      default: return false;
    }
  };

  if (results) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center bg-white p-8 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-gray-600" />
            <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">PRO</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Jouw Persoonlijke Date Ideeën</h2>
          <p className="text-gray-600">
            Speciaal gegenereerd voor {formData.location} • {formData.userInterests.length} interesses • {formData.vibe}
          </p>
        </div>

        {/* Top Matches */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-gray-600" />
            Top Matches (Hoogste scores)
          </h4>
          <div className="space-y-4">
            {results.topMatches.map((idea, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-semibold text-gray-900">{idea.title}</h5>
                  <span className="text-sm bg-gray-200 text-gray-700 px-2 py-1 rounded">{idea.score}% match</span>
                </div>
                <p className="text-sm text-gray-700 mb-3">{idea.description}</p>
                <div className="bg-white p-3 rounded border-l-4 border-gray-300">
                  <p className="text-sm italic text-gray-600">"{idea.whatsappLine}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Creative Surprises */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gray-600" />
            Creatieve Verrassingen
          </h4>
          <div className="space-y-4">
            {results.creativeSurprises.map((idea, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-semibold text-gray-900">{idea.title}</h5>
                  <span className="text-sm bg-gray-200 text-gray-700 px-2 py-1 rounded">{idea.score}% match</span>
                </div>
                <p className="text-sm text-gray-700 mb-3">{idea.description}</p>
                <div className="bg-white p-3 rounded border-l-4 border-gray-300">
                  <p className="text-sm italic text-gray-600">"{idea.whatsappLine}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Effort Options */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-gray-600" />
            Low Effort Opties
          </h4>
          <div className="space-y-4">
            {results.lowEffortOptions.map((idea, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-semibold text-gray-900">{idea.title}</h5>
                  <span className="text-sm bg-gray-200 text-gray-700 px-2 py-1 rounded">{idea.score}% match</span>
                </div>
                <p className="text-sm text-gray-700 mb-3">{idea.description}</p>
                <div className="bg-white p-3 rounded border-l-4 border-gray-300">
                  <p className="text-sm italic text-gray-600">"{idea.whatsappLine}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => setResults(null)}
            variant="outline"
            className="flex-1"
          >
            Nieuwe Ideeën Genereren
          </Button>
          <Button className="flex-1 bg-pink-500 hover:bg-pink-600">
            <Sparkles className="w-4 h-4 mr-2" />
            Opslaan voor Later
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header with Tutorial */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-yellow-600" />
          <div>
            <h2 className="text-2xl font-bold text-yellow-600">AI Date Ideeën Generator</h2>
            <p className="text-sm text-muted-foreground">
              Ontvang gepersonaliseerde date ideeën gebaseerd op jullie interesses
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={startTutorial}
          className="gap-2"
        >
          <HelpCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Tutorial</span>
        </Button>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-gray-900">Stap {currentStep} van {totalSteps}</span>
          <span className="text-sm text-gray-600">
            {Math.round((currentStep / totalSteps) * 100)}% compleet
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gray-900 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 min-h-[400px]">
        <div className="p-6">
          {renderStepContent()}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          onClick={prevStep}
          disabled={currentStep === 1}
          variant="outline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Vorige
        </Button>

        {currentStep < totalSteps ? (
          <Button
            onClick={nextStep}
            disabled={!canProceedToNext()}
            className="bg-pink-500 hover:bg-pink-600"
          >
            Volgende
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={generateIdeas}
            disabled={isGenerating}
            className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 px-8"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Iris genereert ideeën...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Genereer Date Ideeën
              </>
            )}
          </Button>
        )}
      </div>

      {/* Tutorial Modal */}
      <TutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        toolId="date-ideas"
        toolName="AI Date Ideeën Generator"
        steps={[
          {
            title: "Welkom bij AI Date Ideeën Generator! 💡",
            content: "Deze tool gebruikt AI om gepersonaliseerde date ideeën te genereren gebaseerd op jullie interesses, locatie, budget en vibe. Je krijgt 7 verschillende ideeën in 3 categorieën: Top Matches, Creatieve Verrassingen en Low Effort opties.",
            tips: [
              "Hoe meer details je geeft, hoe beter de ideeën",
              "De tool werkt het beste als je beide interesses kent",
              "Gebruik de resultaten om unieke dates te plannen"
            ]
          },
          {
            title: "Stap 1: Locatie & Bereik",
            content: "Kies waar je date plaatsvindt en hoe ver je wilt reizen. De tool zoekt naar ideeën in jouw stad en omgeving. Een grotere afstand geeft meer opties, maar houd rekening met reistijd.",
            action: {
              text: "Selecteer je locatie en maximale afstand voor de beste resultaten.",
              target: ".space-y-6 > div:first-child"
            },
            tips: [
              "Gebruik je huidige locatie voor realistische ideeën",
              "25km is een goed bereik voor de meeste mensen",
              "Bedenk of je bereid bent te reizen voor een speciale date"
            ]
          },
          {
            title: "Stap 2: Jouw Interesses",
            content: "Selecteer wat jij leuk vindt. Dit vormt de basis voor alle date ideeën. Kies minimaal 2 interesses voor goede resultaten. De AI gebruikt deze om ideeën te vinden die bij jullie passen.",
            tips: [
              "Wees eerlijk over wat je echt leuk vindt",
              "Kies interesses die je graag wilt delen",
              "Meerdere interesses geven meer gevarieerde ideeën"
            ]
          },
          {
            title: "Stap 3: Interesses van je Date (Optioneel)",
            content: "Als je weet wat je date leuk vindt, voeg dit toe voor nog persoonlijkere ideeën. Dit is optioneel - als je het niet weet, gebruikt de AI alleen jouw interesses voor algemene maar goede suggesties.",
            tips: [
              "Persoonlijkere ideeën scoren hoger bij dates",
              "Het is oké als je niet alles weet",
              "Je kunt dit altijd later toevoegen"
            ]
          },
          {
            title: "Stap 4: Date Type & Vibe",
            content: "Kies het type date: eerste ontmoeting, tweede date, romantisch, creatief, energiek, casual. Dit bepaalt de toon en intensiteit van de ideeën. Denk na over waar jullie relatie staat.",
            tips: [
              "Eerste date: Houd het licht en ontspannen",
              "Tweede date: Meer verdieping en connectie",
              "Romantisch: Speciaal en attent",
              "Creatief: Origineel en avontuurlijk"
            ]
          },
          {
            title: "Stap 5: Budget",
            content: "Stel je budget in: laag (€0-20), normaal (€20-60) of luxe (€60+). De ideeën worden aangepast aan je budget terwijl ze toch aantrekkelijk blijven.",
            tips: [
              "Goede ideeën zijn mogelijk in elk budget",
              "Laag budget: Creatief met gratis activiteiten",
              "Normaal budget: Standaard uitjes met kwaliteit",
              "Luxe: Speciale ervaringen en goede restaurants"
            ]
          },
          {
            title: "Stap 6: Extra Voorkeuren (Optioneel)",
            content: "Optionele extra's: weer gevoeligheid, indoor/outdoor voorkeur, tijdstip. Deze maken de ideeën nog specifieker voor jullie situatie.",
            tips: [
              "Weer gevoeligheid: Belangrijk in Nederland",
              "Indoor/outdoor: Flexibiliteit geeft meer opties",
              "Tijdstip: Sommige activiteiten zijn alleen overdag mogelijk"
            ]
          },
          {
            title: "Resultaten: 3 Categorieën Ideeën",
            content: "Je krijgt 7 ideeën in 3 categorieën: Top Matches (hoogste scores), Creatieve Verrassingen (originele ideeën), Low Effort opties (eenvoudige maar leuke dates). Elk idee heeft een WhatsApp voorbeeld bericht.",
            tips: [
              "Top Matches: Hoogste kans op succes",
              "Creatieve Verrassingen: Sta uit van de massa",
              "Low Effort: Perfect voor drukke mensen",
              "Kopieer de WhatsApp berichten direct"
            ]
          },
          {
            title: "Pro Tips voor Date Succes 🎯",
            content: "Gebruik deze tool strategisch: Kies ideeën die passen bij jullie relatie fase, combineer met de Date Planner voor complete plannen, en test verschillende stijlen om te zien wat werkt.",
            tips: [
              "Combineer met Date Planner voor complete dates",
              "Test A/B: Verschillende ideeën met verschillende mensen",
              "Wees authentiek - mensen zien door geforceerde ideeën heen",
              "Volg op met een bedankje voor een goede indruk"
            ]
          }
        ]}
        onComplete={completeTutorial}
      />
    </div>
  );
}