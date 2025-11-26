'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, CheckCircle, AlertCircle, Sparkles, Copy, RefreshCw } from 'lucide-react';

interface BioVersie {
  id: string;
  label: string;
  placeholder: string;
  maxLength: number;
}

interface MultiBioProps {
  titel: string;
  beschrijving: string;
  versies: BioVersie[];
  aiAssist?: boolean;
  showCharacterCount?: boolean;
  irisContext?: string;
  onComplete: (resultaten: any) => void;
  onPrevious?: () => void;
}

interface MultiBioResultaten {
  bioVersies: Record<string, string>;
  geselecteerdeVersie?: string;
  isValid: boolean;
}

export function MultiBio({
  titel,
  beschrijving,
  versies,
  aiAssist = false,
  showCharacterCount = true,
  irisContext,
  onComplete,
  onPrevious
}: MultiBioProps) {
  const [bioVersies, setBioVersies] = useState<Record<string, string>>({});
  const [geselecteerdeVersie, setGeselecteerdeVersie] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});

  // Initialize bio versions
  useEffect(() => {
    const initialVersies: Record<string, string> = {};
    versies.forEach(versie => {
      initialVersies[versie.id] = '';
    });
    setBioVersies(initialVersies);
  }, [versies]);

  const handleBioChange = (versieId: string, tekst: string) => {
    setBioVersies(prev => ({
      ...prev,
      [versieId]: tekst
    }));
  };

  const generateAIVersie = async (versieId: string) => {
    if (!aiAssist) return;

    setAiLoading(prev => ({ ...prev, [versieId]: true }));

    try {
      // Simulate AI call - in real app this would call an API
      await new Promise(resolve => setTimeout(resolve, 2000));

      const versie = versies.find(v => v.id === versieId);
      const mockSuggestions = {
        'versie-grappig': 'Ik ben die persoon die per ongeluk een plant adopteerde en nu een plantenleger onderhoudt. Vraag me over mijn groene vrienden!',
        'versie-authentiek': 'Ik geloof in diepgaande gesprekken die ertoe doen. Mijn favoriete momenten zijn wanneer woorden plaatsmaken voor echte verbinding.',
        'versie-mysterieus': 'Er is een verhaal achter elke foto. Sommige verhalen zijn beter dan anderen. Welke wil je horen?'
      };

      const aiTekst = mockSuggestions[versieId as keyof typeof mockSuggestions] || versie?.placeholder || '';
      handleBioChange(versieId, aiTekst);
    } catch (error) {
      console.error('AI generation failed:', error);
    } finally {
      setAiLoading(prev => ({ ...prev, [versieId]: false }));
    }
  };

  const copyToClipboard = async (tekst: string) => {
    try {
      await navigator.clipboard.writeText(tekst);
      // Could show a toast here
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const handleSubmit = () => {
    const resultaten: MultiBioResultaten = {
      bioVersies,
      geselecteerdeVersie,
      isValid: Object.values(bioVersies).some(tekst => tekst.trim().length > 0)
    };

    setIsSubmitted(true);
    onComplete(resultaten);
  };

  const isValid = Object.values(bioVersies).some(tekst => tekst.trim().length > 0);
  const totaalKarakters = Object.values(bioVersies).reduce((sum, tekst) => sum + tekst.length, 0);

  if (isSubmitted) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Success Header */}
        <Card className="text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Bio Versies Geschreven
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Je hebt {Object.values(bioVersies).filter(v => v.trim()).length} bio versies gemaakt met {totaalKarakters} karakters totaal.
            </p>
          </CardContent>
        </Card>

        {/* Bio Versions Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {versies.map(versie => {
            const tekst = bioVersies[versie.id] || '';
            const isSelected = geselecteerdeVersie === versie.id;

            return (
              <Card key={versie.id} className={isSelected ? 'border-blue-500 bg-blue-50' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{versie.label}</CardTitle>
                    {isSelected && <Badge className="bg-blue-600">Geselecteerd</Badge>}
                  </div>
                  {showCharacterCount && (
                    <p className="text-sm text-gray-600">
                      {tekst.length}/{versie.maxLength} karakters
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-3 rounded-lg min-h-[100px]">
                    {tekst ? (
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{tekst}</p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">Geen tekst ingevoerd</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
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
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{titel}</h2>
            <p className="text-gray-600 mt-2">{beschrijving}</p>
          </div>
        </CardContent>
      </Card>

      {/* VONK Framework Reminder */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="text-center">
            <h3 className="font-bold text-blue-900 mb-2">Het VONK-Methode™</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div className="bg-white p-2 rounded">V = Verrassend</div>
              <div className="bg-white p-2 rounded">O = Origineel</div>
              <div className="bg-white p-2 rounded">N = Nieuwsgierig</div>
              <div className="bg-white p-2 rounded">K = Kort</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bio Versions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {versies.map(versie => {
          const tekst = bioVersies[versie.id] || '';
          const karakterTelling = tekst.length;
          const isOverMax = karakterTelling > versie.maxLength;
          const isSelected = geselecteerdeVersie === versie.id;

          return (
            <Card key={versie.id} className={isSelected ? 'border-blue-500 bg-blue-50' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{versie.label}</CardTitle>
                  <div className="flex gap-2">
                    {aiAssist && (
                      <Button
                        onClick={() => generateAIVersie(versie.id)}
                        disabled={aiLoading[versie.id]}
                        size="sm"
                        variant="outline"
                        className="text-xs"
                      >
                        {aiLoading[versie.id] ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <Sparkles className="w-3 h-3" />
                        )}
                      </Button>
                    )}
                    <Button
                      onClick={() => copyToClipboard(tekst)}
                      disabled={!tekst}
                      size="sm"
                      variant="outline"
                      className="text-xs"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                {showCharacterCount && (
                  <p className={`text-sm ${isOverMax ? 'text-red-600' : 'text-gray-600'}`}>
                    {karakterTelling}/{versie.maxLength} karakters
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={tekst}
                  onChange={(e) => handleBioChange(versie.id, e.target.value)}
                  placeholder={versie.placeholder}
                  maxLength={versie.maxLength}
                  className={`min-h-[120px] ${isOverMax ? 'border-red-300' : ''}`}
                />

                <Button
                  onClick={() => setGeselecteerdeVersie(versie.id)}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  className="w-full"
                >
                  {isSelected ? 'Geselecteerd' : 'Selecteren'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* AI Assist Info */}
      {aiAssist && (
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-purple-900 mb-1">AI Assist beschikbaar</h4>
                <p className="text-sm text-purple-800">
                  Klik op het vonkje om AI suggesties te krijgen voor elke versie. Je kunt deze altijd aanpassen naar je eigen stem.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation */}
      {!isValid && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-900">Bio versies nodig</h4>
                <p className="text-sm text-yellow-800">
                  Schrijf minstens één bio versie voordat je doorgaat.
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
            Bio Versies Opslaan & Doorgaan
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Totaal karakters: {totaalKarakters} |
              Versies voltooid: {Object.values(bioVersies).filter(v => v.trim()).length}/{versies.length}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}