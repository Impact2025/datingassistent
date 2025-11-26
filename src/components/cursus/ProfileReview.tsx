'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle, Edit, Camera, FileText, MessageSquare } from 'lucide-react';

interface ReviewSectie {
  titel: string;
  bron: string;
  icon?: string;
  beschrijving?: string;
}

interface ProfileReviewProps {
  titel: string;
  beschrijving: string;
  secties: ReviewSectie[];
  editLinks: boolean;
  irisContext?: string;
  onComplete: (resultaten: any) => void;
  onPrevious?: () => void;
  onEditSection?: (sectieId: string) => void;
}

interface ProfileReviewResultaten {
  reviewCompleet: boolean;
  isValid: boolean;
}

// Mock data - in real app this would come from previous exercises
const mockProfileData = {
  'oef-2-1-2-hitlist': {
    teVerwijderen: ['Zonnebril foto', 'Groepsfoto'],
    teMaken: ['Nieuwe portret foto', 'Full-body foto']
  },
  'oef-2-3-3-herschreven': 'Ik ben die persoon die per ongeluk een plant adopteerde en nu een plantenleger onderhoudt. Vraag me over mijn groene vrienden!',
  'oef-2-4-2-antwoorden': {
    'Ik ga ongemakkelijk goed in...': 'Het organiseren van spontane picknicks in het park',
    'Mijn simpele genoegens...': 'De eerste hap van een verse stroopwafel',
    'Een ding dat je moet weten over mij...': 'Ik heb ooit mijn baan opgezegd om 3 maanden door Europa te reizen'
  }
};

export function ProfileReview({
  titel,
  beschrijving,
  secties,
  editLinks,
  irisContext,
  onComplete,
  onPrevious,
  onEditSection
}: ProfileReviewProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    const resultaten: ProfileReviewResultaten = {
      reviewCompleet: true,
      isValid: true
    };

    setIsSubmitted(true);
    onComplete(resultaten);
  };

  const renderSectieContent = (sectie: ReviewSectie) => {
    const data = mockProfileData[sectie.bron as keyof typeof mockProfileData];

    if (!data) {
      return (
        <div className="text-gray-500 italic">
          Geen data gevonden voor deze sectie
        </div>
      );
    }

    // Handle different data types with proper type checking
    if (sectie.bron.includes('hitlist') && typeof data === 'object' && 'teVerwijderen' in data) {
      // Photo action plan
      const photoData = data as { teVerwijderen: string[]; teMaken: string[] };
      return (
        <div className="space-y-3">
          {photoData.teVerwijderen && photoData.teVerwijderen.length > 0 && (
            <div>
              <h5 className="font-semibold text-red-700 mb-2">Te Verwijderen:</h5>
              <ul className="space-y-1">
                {photoData.teVerwijderen.map((item: string, index: number) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {photoData.teMaken && photoData.teMaken.length > 0 && (
            <div>
              <h5 className="font-semibold text-green-700 mb-2">Te Maken:</h5>
              <ul className="space-y-1">
                {photoData.teMaken.map((item: string, index: number) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }

    if (sectie.bron.includes('herschreven') && typeof data === 'string') {
      // Bio text
      return (
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-900 leading-relaxed">"{data}"</p>
        </div>
      );
    }

    if (sectie.bron.includes('antwoorden') && typeof data === 'object' && !('teVerwijderen' in data)) {
      // Prompt answers
      const promptData = data as Record<string, string>;
      return (
        <div className="space-y-3">
          {Object.entries(promptData).map(([prompt, antwoord]: [string, string], index: number) => (
            <div key={index} className="border-l-4 border-blue-200 pl-4">
              <p className="font-medium text-blue-900 mb-1">"{prompt}"</p>
              <p className="text-blue-800 text-sm">{antwoord}</p>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="text-gray-500">
        Onbekend data type voor sectie {sectie.bron}
      </div>
    );
  };

  const getSectieIcon = (sectie: ReviewSectie) => {
    if (sectie.titel.toLowerCase().includes('foto')) return <Camera className="w-5 h-5" />;
    if (sectie.titel.toLowerCase().includes('bio')) return <FileText className="w-5 h-5" />;
    if (sectie.titel.toLowerCase().includes('prompt')) return <MessageSquare className="w-5 h-5" />;
    return <CheckCircle className="w-5 h-5" />;
  };

  if (isSubmitted) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Success Header */}
        <Card className="text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Profiel Review Voltooid
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Je hebt je complete profiel bekeken en bent klaar voor de volgende stappen.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{titel}</h2>
            <p className="text-gray-600 mt-2">{beschrijving}</p>
          </div>
        </CardContent>
      </Card>

      {/* Review Sections */}
      <div className="space-y-6">
        {secties.map((sectie, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    {getSectieIcon(sectie)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{sectie.titel}</CardTitle>
                    {sectie.beschrijving && (
                      <p className="text-sm text-gray-600">{sectie.beschrijving}</p>
                    )}
                  </div>
                </div>

                {editLinks && onEditSection && (
                  <Button
                    onClick={() => onEditSection(sectie.bron)}
                    variant="outline"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Bewerken
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {renderSectieContent(sectie)}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="font-bold text-blue-900 mb-2">Profiel Samenvatting</h3>
            <p className="text-blue-800 mb-4">
              Je hebt alle elementen van je onweerstaanbare profiel doorgenomen.
              Foto's, bio en prompts werken samen om de juiste mensen aan te trekken.
            </p>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white p-3 rounded-lg">
                <Camera className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                <div className="text-sm font-medium">Foto's</div>
                <div className="text-xs text-gray-600">BEELD-framework</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                <div className="text-sm font-medium">Bio</div>
                <div className="text-xs text-gray-600">VONK-methode</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <MessageSquare className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                <div className="text-sm font-medium">Prompts</div>
                <div className="text-xs text-gray-600">PUZZEL-principe</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Reminder */}
      {editLinks && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Edit className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <h4 className="font-semibold text-yellow-900 mb-1">Wil je iets aanpassen?</h4>
                <p className="text-sm text-yellow-800">
                  Klik op "Bewerken" bij elke sectie om terug te gaan en wijzigingen aan te brengen.
                  Neem de tijd - dit is je profiel!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={handleSubmit}
            className="w-full bg-[#ff66c4] hover:bg-[#e55bb0] text-white"
            size="lg"
          >
            Profiel Compleet & Doorgaan
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Alle secties bekeken • Klaar voor volgende stappen
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}