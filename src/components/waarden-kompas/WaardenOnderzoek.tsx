'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ArrowRight, Heart, Home, User, Sparkles, Target } from 'lucide-react';

interface WaardenOnderzoekProps {
  sessionId: number;
  onComplete: () => void;
}

interface WaardeItem {
  key: string;
  name: string;
  description: string;
  category: string;
}

export function WaardenOnderzoek({ sessionId, onComplete }: WaardenOnderzoekProps) {
  const [currentCategory, setCurrentCategory] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  // Initialize default responses for all values (rating 2 = "Wel belangrijk")
  useEffect(() => {
    const initialResponses: Record<string, number> = {};
    categories.forEach(category => {
      category.waarden.forEach(waarde => {
        initialResponses[waarde.key] = 2; // Default to "Wel belangrijk"
      });
    });
    setResponses(initialResponses);
  }, []);

  const categories = [
    {
      id: 'liefde_relatie',
      name: 'Liefde & Relatie',
      icon: <Heart className="w-6 h-6 text-pink-500" />,
      description: 'Wat zoek je in emotionele verbinding en partnerschap?',
      waarden: [
        { key: 'emotionele_verbinding', name: 'Emotionele Verbinding', description: 'Diepe gevoelens delen en begrijpen' },
        { key: 'loyaliteit', name: 'Loyaliteit & Stabiliteit', description: 'Betrouwbaarheid en trouw' },
        { key: 'intimiteit', name: 'Intimiteit & Affectie', description: 'Fysieke en emotionele nabijheid' },
        { key: 'humor', name: 'Humor & Lichtheid', description: 'Plezier en lachen samen' },
        { key: 'open_communicatie', name: 'Open Communicatie', description: 'Eerlijk en direct praten' },
        { key: 'ondersteuning', name: 'Emotionele Ondersteuning', description: 'Elkaar helpen en steunen' }
      ]
    },
    {
      id: 'lifestyle',
      name: 'Lifestyle & Dagelijks Leven',
      icon: <Home className="w-6 h-6 text-blue-500" />,
      description: 'Hoe wil je dagelijks leven eruit zien?',
      waarden: [
        { key: 'gezonde_levensstijl', name: 'Gezonde Levensstijl', description: 'Sport, voeding, balans' },
        { key: 'ambitie', name: 'Ambitie & Groei', description: 'Doelen nastreven en ontwikkelen' },
        { key: 'stabiliteit', name: 'Financiële Stabiliteit', description: 'Verantwoordelijkheid met geld' },
        { key: 'avontuur', name: 'Avontuur & Spontaniteit', description: 'Nieuwe ervaringen opzoeken' },
        { key: 'rust', name: 'Rust & Structuur', description: 'Voorspelbaarheid en kalmte' },
        { key: 'creativiteit', name: 'Creativiteit & Uitdrukking', description: 'Kunst, muziek, zelfexpressie' }
      ]
    },
    {
      id: 'persoonlijke_groei',
      name: 'Persoonlijke Groei',
      icon: <Sparkles className="w-6 h-6 text-purple-500" />,
      description: 'Wat vind je belangrijk in persoonlijke ontwikkeling?',
      waarden: [
        { key: 'zelfontwikkeling', name: 'Zelfontwikkeling', description: 'Continu leren en groeien' },
        { key: 'emotionele_volwassenheid', name: 'Emotionele Volwassenheid', description: 'Bewuste omgang met gevoelens' },
        { key: 'zelfreflectie', name: 'Zelfreflectie', description: 'Terugkijken en leren van ervaringen' },
        { key: 'eerlijkheid', name: 'Eerlijkheid & Transparantie', description: 'Oprecht zijn tegen jezelf en anderen' },
        { key: 'zelfacceptatie', name: 'Zelfacceptatie', description: 'Vrede hebben met wie je bent' },
        { key: 'spirituele_groei', name: 'Spirituele Groei', description: 'Betekenis en purpose zoeken' }
      ]
    },
    {
      id: 'sociale_connectie',
      name: 'Sociale Connectie',
      icon: <User className="w-6 h-6 text-green-500" />,
      description: 'Hoe zie je je sociale leven en connecties?',
      waarden: [
        { key: 'familiebanden', name: 'Familiebanden', description: 'Belangrijke rol van familie' },
        { key: 'vrienden', name: 'Vrienden & Sociaal Leven', description: 'Kwaliteit van vriendschappen' },
        { key: 'onafhankelijkheid', name: 'Onafhankelijkheid vs Samenzijn', description: 'Balans tussen alleen en samen zijn' },
        { key: 'openheid', name: 'Openheid naar Nieuwe Mensen', description: 'Gemakkelijk connectie maken' },
        { key: 'cultuur', name: 'Culturele Uitwisseling', description: 'Andersdenkenden ontmoeten' },
        { key: 'gemeenschap', name: 'Gemeenschapszin', description: 'Deel uitmaken van groepen' }
      ]
    },
    {
      id: 'levensvisie',
      name: 'Levensvisie & Toekomst',
      icon: <Target className="w-6 h-6 text-orange-500" />,
      description: 'Wat zijn je ideeën over de toekomst en levensdoelen?',
      waarden: [
        { key: 'kinderen', name: 'Gezin & Kinderen', description: 'Belang van ouderschap' },
        { key: 'carriere', name: 'Carrière & Doelen', description: 'Professionele ambities' },
        { key: 'woonstijl', name: 'Woonstijl', description: 'Stad vs natuur vs buitenland' },
        { key: 'relatie_dynamiek', name: 'Relatie Dynamiek', description: 'Traditioneel vs modern vs eigen' },
        { key: 'levensdoelen', name: 'Levensdoelen', description: 'Wat wil je bereiken' },
        { key: 'niet_materieel', name: 'Niet-Materiële Rijkdom', description: 'Ervaringen boven spullen' }
      ]
    }
  ];

  const currentCat = categories[currentCategory];
  const progress = ((currentCategory + 1) / categories.length) * 100;

  const handleRatingChange = (waardeKey: string, rating: number[]) => {
    setResponses(prev => ({
      ...prev,
      [waardeKey]: rating[0]
    }));
  };

  const handleNext = () => {
    if (currentCategory < categories.length - 1) {
      setCurrentCategory(prev => prev + 1);
    } else {
      submitResponses();
    }
  };

  const handlePrevious = () => {
    if (currentCategory > 0) {
      setCurrentCategory(prev => prev - 1);
    }
  };

  const submitResponses = async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('datespark_auth_token');
      if (!token) return;

      // Convert responses to the format expected by API
      const formattedResponses = Object.entries(responses).map(([valueKey, rating]) => {
        // Find the value details
        let category = '';
        let valueName = '';

        for (const cat of categories) {
          const waarde = cat.waarden.find(w => w.key === valueKey);
          if (waarde) {
            category = cat.id;
            valueName = waarde.name;
            break;
          }
        }

        return {
          category,
          valueKey,
          valueName,
          rating
        };
      });

      const response = await fetch('/api/waarden-kompas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'save_responses',
          data: { responses: formattedResponses }
        }),
      });

      if (response.ok) {
        onComplete();
      } else {
        console.error('Failed to save responses');
      }
    } catch (error) {
      console.error('Error saving responses:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 1: return 'Niet belangrijk';
      case 2: return 'Wel belangrijk';
      case 3: return 'Zeer belangrijk';
      case 4: return 'Essentieel';
      default: return '';
    }
  };

  const isCategoryComplete = currentCat.waarden.every(waarde => responses[waarde.key] !== undefined);
  const totalResponses = Object.keys(responses).length;
  const totalPossible = categories.reduce((sum, cat) => sum + cat.waarden.length, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Waarden Onderzoek</h2>
              <p className="text-gray-600">Beoordeel hoe belangrijk elke waarde voor jou is</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Voortgang</div>
              <div className="text-lg font-bold text-pink-600">{totalResponses}/{totalPossible}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Categorie {currentCategory + 1} van {categories.length}</span>
              <span>{Math.round(progress)}% compleet</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-pink-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Category */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            {currentCat.icon}
            <div>
              <CardTitle className="text-xl">{currentCat.name}</CardTitle>
              <p className="text-gray-600 mt-1">{currentCat.description}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {currentCat.waarden.map((waarde) => (
            <div key={waarde.key} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{waarde.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{waarde.description}</p>
                </div>
                {responses[waarde.key] && (
                  <div className="text-sm font-medium text-pink-600 bg-pink-50 px-3 py-1 rounded-full">
                    {getRatingLabel(responses[waarde.key])}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Slider
                  value={responses[waarde.key] ? [responses[waarde.key]] : [2]}
                  onValueChange={(value) => handleRatingChange(waarde.key, value)}
                  max={4}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Niet belangrijk</span>
                  <span>Wel belangrijk</span>
                  <span>Zeer belangrijk</span>
                  <span>Essentieel</span>
                </div>
              </div>
            </div>
          ))}

          <div className="flex gap-3 pt-4">
            {currentCategory > 0 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="flex-1"
              >
                Vorige Categorie
              </Button>
            )}

            <Button
              onClick={handleNext}
              disabled={!isCategoryComplete || submitting}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
            >
              {submitting ? (
                'Opslaan...'
              ) : currentCategory === categories.length - 1 ? (
                <>
                  Genereer Mijn Kompas
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              ) : (
                <>
                  Volgende Categorie
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Help Text */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 text-sm">💡</span>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Hoe te beoordelen?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Essentieel (4):</strong> Kan niet zonder, dealbreaker</li>
                <li>• <strong>Zeer belangrijk (3):</strong> Heel graag willen, grote voorkeur</li>
                <li>• <strong>Wel belangrijk (2):</strong> Leuk als het er is, maar niet cruciaal</li>
                <li>• <strong>Niet belangrijk (1):</strong> Maakt me niet uit, geen invloed</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}