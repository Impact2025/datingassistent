'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowRight, CheckCircle, AlertCircle, MessageSquare, RefreshCw } from 'lucide-react';

interface WordInput {
  vraag: string;
  placeholder: string[];
}

interface ThreeWordCheckProps {
  titel: string;
  beschrijving: string;
  stap1: WordInput;
  stap2: WordInput;
  vergelijking: boolean;
  irisContext?: string;
  onComplete: (resultaten: any) => void;
  onPrevious?: () => void;
}

interface ThreeWordCheckResultaten {
  huidigeWoorden: string[];
  gewensteWoorden: string[];
  woordenVergelijking: string;
  isValid: boolean;
}

export function ThreeWordCheck({
  titel,
  beschrijving,
  stap1,
  stap2,
  vergelijking,
  irisContext,
  onComplete,
  onPrevious
}: ThreeWordCheckProps) {
  const [huidigeWoorden, setHuidigeWoorden] = useState<string[]>(['', '', '']);
  const [gewensteWoorden, setGewensteWoorden] = useState<string[]>(['', '', '']);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleWoordChange = (type: 'huidig' | 'gewenst', index: number, waarde: string) => {
    if (type === 'huidig') {
      const nieuweWoorden = [...huidigeWoorden];
      nieuweWoorden[index] = waarde;
      setHuidigeWoorden(nieuweWoorden);
    } else {
      const nieuweWoorden = [...gewensteWoorden];
      nieuweWoorden[index] = waarde;
      setGewensteWoorden(nieuweWoorden);
    }
  };

  const generateVergelijking = () => {
    const huidige = huidigeWoorden.filter(w => w.trim());
    const gewenst = gewensteWoorden.filter(w => w.trim());

    if (huidige.length === 0 || gewenst.length === 0) {
      return 'Vul beide lijsten in voor een vergelijking.';
    }

    const overlap = huidige.filter(woord => gewenst.includes(woord));
    const verschillen = gewenst.filter(woord => !huidige.includes(woord));

    let vergelijking = '';

    if (overlap.length > 0) {
      vergelijking += `Goed nieuws! ${overlap.length} woord${overlap.length !== 1 ? 'en' : ''} komen overeen: "${overlap.join('", "')}". `;
    }

    if (verschillen.length > 0) {
      vergelijking += `Je wilt ${verschillen.length} nieuw${verschillen.length !== 1 ? 'e' : ''} woord${verschillen.length !== 1 ? 'en' : ''} toevoegen: "${verschillen.join('", "')}". `;
    }

    if (overlap.length === gewenst.length) {
      vergelijking += 'Je profiel straalt al uit wat je wilt! Geweldig werk.';
    } else {
      vergelijking += 'Dit geeft je concrete doelen voor profiel verbetering.';
    }

    return vergelijking;
  };

  const handleSubmit = () => {
    const resultaten: ThreeWordCheckResultaten = {
      huidigeWoorden: huidigeWoorden.filter(w => w.trim()),
      gewensteWoorden: gewensteWoorden.filter(w => w.trim()),
      woordenVergelijking: vergelijking ? generateVergelijking() : '',
      isValid: huidigeWoorden.some(w => w.trim()) && gewensteWoorden.some(w => w.trim())
    };

    setIsSubmitted(true);
    onComplete(resultaten);
  };

  const isValid = huidigeWoorden.some(w => w.trim()) && gewensteWoorden.some(w => w.trim());
  const woordenVergelijking = vergelijking ? generateVergelijking() : '';

  if (isSubmitted) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Success Header */}
        <Card className="text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              3-Woorden Test Voltooid
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Je hebt je huidige woorden en gewenste woorden gedefinieerd.
            </p>
          </CardContent>
        </Card>

        {/* Words Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Huidige Woorden */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-900">Huidige Woorden</CardTitle>
              <p className="text-sm text-red-700">Wat anderen nu zeggen</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {huidigeWoorden.map((woord, index) => (
                  woord.trim() && (
                    <div key={index} className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-red-100 text-red-800">
                        {index + 1}
                      </Badge>
                      <span className="font-medium text-red-900">"{woord}"</span>
                    </div>
                  )
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Gewenste Woorden */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-900">Gewenste Woorden</CardTitle>
              <p className="text-sm text-green-700">Wat je wilt dat anderen zeggen</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {gewensteWoorden.map((woord, index) => (
                  woord.trim() && (
                    <div key={index} className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        {index + 1}
                      </Badge>
                      <span className="font-medium text-green-900">"{woord}"</span>
                    </div>
                  )
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vergelijking */}
        {vergelijking && woordenVergelijking && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">Woorden Vergelijking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-800 leading-relaxed">
                {woordenVergelijking}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{titel}</h2>
            <p className="text-gray-600 mt-2">{beschrijving}</p>
          </div>
        </CardContent>
      </Card>

      {/* Stap 1: Huidige Woorden */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-900">Stap 1: Huidige Woorden</CardTitle>
          <p className="text-sm text-red-700">{stap1.vraag}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {huidigeWoorden.map((woord, index) => (
            <div key={index} className="flex items-center gap-3">
              <Badge variant="outline" className="bg-red-100 text-red-800 min-w-[40px] justify-center">
                {index + 1}
              </Badge>
              <Input
                value={woord}
                onChange={(e) => handleWoordChange('huidig', index, e.target.value)}
                placeholder={stap1.placeholder[index] || `Woord ${index + 1}`}
                className="flex-1"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Stap 2: Gewenste Woorden */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-green-900">Stap 2: Gewenste Woorden</CardTitle>
          <p className="text-sm text-green-700">{stap2.vraag}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {gewensteWoorden.map((woord, index) => (
            <div key={index} className="flex items-center gap-3">
              <Badge variant="outline" className="bg-green-100 text-green-800 min-w-[40px] justify-center">
                {index + 1}
              </Badge>
              <Input
                value={woord}
                onChange={(e) => handleWoordChange('gewenst', index, e.target.value)}
                placeholder={stap2.placeholder[index] || `Woord ${index + 1}`}
                className="flex-1"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Live Vergelijking Preview */}
      {vergelijking && huidigeWoorden.some(w => w.trim()) && gewensteWoorden.some(w => w.trim()) && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">Live Vergelijking</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-800 leading-relaxed">
              {woordenVergelijking}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Explanation */}
      <Card className="bg-gray-50">
        <CardContent className="pt-4">
          <div className="text-center">
            <h3 className="font-semibold text-gray-900 mb-2">Waarom deze oefening?</h3>
            <p className="text-sm text-gray-700 max-w-2xl mx-auto">
              De woorden die anderen gebruiken om je te beschrijven bepalen hoe je wordt gezien in dating.
              Deze oefening helpt je te zien waar je nu staat en waar je naartoe wilt werken.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Validation */}
      {!isValid && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-900">Woorden nodig</h4>
                <p className="text-sm text-yellow-800">
                  Vul minstens één woord in beide categorieën in voordat je doorgaat.
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
            Woorden Opslaan & Doorgaan
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Huidige woorden: {huidigeWoorden.filter(w => w.trim()).length} |
              Gewenste woorden: {gewensteWoorden.filter(w => w.trim()).length}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}