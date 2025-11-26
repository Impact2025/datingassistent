'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';

interface Prompt {
  id: string;
  label: string;
}

interface PromptCategorie {
  categorie: string;
  prompts: Prompt[];
}

interface PromptSelectorProps {
  titel: string;
  beschrijving: string;
  categorieën: PromptCategorie[];
  maxSelectie: number;
  irisContext?: string;
  onComplete: (resultaten: any) => void;
  onPrevious?: () => void;
}

interface PromptSelectorResultaten {
  geselecteerdePrompts: string[];
  isValid: boolean;
}

export function PromptSelector({
  titel,
  beschrijving,
  categorieën,
  maxSelectie,
  irisContext,
  onComplete,
  onPrevious
}: PromptSelectorProps) {
  const [geselecteerdePrompts, setGeselecteerdePrompts] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handlePromptToggle = (promptId: string) => {
    setGeselecteerdePrompts(prev => {
      const isSelected = prev.includes(promptId);

      if (isSelected) {
        // Remove from selection
        return prev.filter(id => id !== promptId);
      } else {
        // Add to selection (check max limit)
        if (prev.length >= maxSelectie) {
          return prev; // Don't add if at max
        }
        return [...prev, promptId];
      }
    });
  };

  const handleSubmit = () => {
    const resultaten: PromptSelectorResultaten = {
      geselecteerdePrompts,
      isValid: geselecteerdePrompts.length > 0
    };

    setIsSubmitted(true);
    onComplete(resultaten);
  };

  const isValid = geselecteerdePrompts.length > 0 && geselecteerdePrompts.length <= maxSelectie;
  const remainingSelections = maxSelectie - geselecteerdePrompts.length;

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
              Prompts Geselecteerd
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Je hebt {geselecteerdePrompts.length} prompt{geselecteerdePrompts.length !== 1 ? 's' : ''} gekozen voor je profiel.
            </p>
          </CardContent>
        </Card>

        {/* Selected Prompts Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Jouw Geselecteerde Prompts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {geselecteerdePrompts.map((promptId, index) => {
                // Find the prompt details
                let promptDetails: Prompt | null = null;
                let categorieNaam = '';

                for (const categorie of categorieën) {
                  const prompt = categorie.prompts.find(p => p.id === promptId);
                  if (prompt) {
                    promptDetails = prompt;
                    categorieNaam = categorie.categorie;
                    break;
                  }
                }

                if (!promptDetails) return null;

                return (
                  <div key={promptId} className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <Badge variant="outline" className="bg-green-100">
                      {index + 1}
                    </Badge>
                    <div className="flex-1">
                      <p className="font-medium text-green-900">"{promptDetails.label}"</p>
                      <p className="text-sm text-green-700 capitalize">{categorieNaam}</p>
                    </div>
                  </div>
                );
              })}
            </div>
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
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{titel}</h2>
            <p className="text-gray-600 mt-2">{beschrijving}</p>
          </div>
        </CardContent>
      </Card>

      {/* PUZZEL Framework */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="pt-4">
          <div className="text-center">
            <h3 className="font-bold text-green-900 mb-2">Het PUZZEL-Principe™</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-sm">
              <div className="bg-white p-2 rounded">P = Persoonlijkheid</div>
              <div className="bg-white p-2 rounded">U = Uniek</div>
              <div className="bg-white p-2 rounded">Z = Zintuiglijk</div>
              <div className="bg-white p-2 rounded">Z = Zegt nieuws</div>
              <div className="bg-white p-2 rounded">E = Energie</div>
              <div className="bg-white p-2 rounded">L = Laag om te reageren</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selection Status */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Selectie Status</h3>
              <p className="text-sm text-gray-600">
                {geselecteerdePrompts.length} van {maxSelectie} prompts geselecteerd
                {remainingSelections > 0 && ` (${remainingSelections} resterend)`}
              </p>
            </div>
            <Badge variant={geselecteerdePrompts.length === maxSelectie ? 'default' : 'secondary'}>
              {geselecteerdePrompts.length}/{maxSelectie}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <div className="space-y-6">
        {categorieën.map(categorie => (
          <Card key={categorie.categorie}>
            <CardHeader>
              <CardTitle className="capitalize text-lg">{categorie.categorie}</CardTitle>
              <p className="text-sm text-gray-600">
                Kies prompts die bij je persoonlijkheid passen
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categorie.prompts.map(prompt => {
                  const isSelected = geselecteerdePrompts.includes(prompt.id);
                  const isDisabled = !isSelected && geselecteerdePrompts.length >= maxSelectie;

                  return (
                    <div
                      key={prompt.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'border-green-500 bg-green-50'
                          : isDisabled
                          ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                          : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                      }`}
                      onClick={() => !isDisabled && handlePromptToggle(prompt.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected ? 'border-green-500 bg-green-500' : 'border-gray-300'
                        }`}>
                          {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">"{prompt.label}"</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Klik om te {isSelected ? 'deselecteren' : 'selecteren'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Prompts Preview */}
      {geselecteerdePrompts.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900">Geselecteerde Prompts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {geselecteerdePrompts.map((promptId, index) => {
                let promptDetails: Prompt | null = null;

                for (const categorie of categorieën) {
                  const prompt = categorie.prompts.find(p => p.id === promptId);
                  if (prompt) {
                    promptDetails = prompt;
                    break;
                  }
                }

                if (!promptDetails) return null;

                return (
                  <div key={promptId} className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      {index + 1}
                    </Badge>
                    <span className="text-green-900">"{promptDetails.label}"</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation */}
      {!isValid && geselecteerdePrompts.length > maxSelectie && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-900">Te veel prompts geselecteerd</h4>
                <p className="text-sm text-red-800">
                  Selecteer maximaal {maxSelectie} prompts. Verwijder er eerst een paar.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!isValid && geselecteerdePrompts.length === 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-900">Prompts nodig</h4>
                <p className="text-sm text-yellow-800">
                  Selecteer minstens één prompt voordat je doorgaat.
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
            disabled={!isValid}
            className="w-full bg-[#ff66c4] hover:bg-[#e55bb0] text-white"
            size="lg"
          >
            Prompts Selecteren & Doorgaan
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}