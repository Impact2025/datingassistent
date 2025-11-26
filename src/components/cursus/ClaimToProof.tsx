'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, CheckCircle, AlertCircle, Wand2 } from 'lucide-react';

interface ClaimToProofProps {
  titel: string;
  beschrijving: string;
  claims: string[];
  vragenPerClaim: {
    id: string;
    vraag: string;
    placeholder?: string;
  }[];
  irisContext?: string;
  onComplete: (resultaten: any) => void;
  onPrevious?: () => void;
}

interface ClaimTransformation {
  origineleClaim: string;
  antwoorden: Record<string, string>;
  getransformeerdeTekst: string;
}

interface ClaimToProofResultaten {
  transformations: ClaimTransformation[];
  isValid: boolean;
}

export function ClaimToProof({
  titel,
  beschrijving,
  claims,
  vragenPerClaim,
  irisContext,
  onComplete,
  onPrevious
}: ClaimToProofProps) {
  const [transformations, setTransformations] = useState<ClaimTransformation[]>([]);
  const [currentClaimIndex, setCurrentClaimIndex] = useState(0);
  const [antwoorden, setAntwoorden] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Initialize transformations
  useEffect(() => {
    const initialTransformations = claims.map(claim => ({
      origineleClaim: claim,
      antwoorden: {} as Record<string, string>,
      getransformeerdeTekst: ''
    }));
    setTransformations(initialTransformations);
  }, [claims]);

  const currentClaim = claims[currentClaimIndex];
  const currentTransformation = transformations[currentClaimIndex];

  const handleAnswerChange = (vraagId: string, antwoord: string) => {
    setAntwoorden(prev => ({
      ...prev,
      [vraagId]: antwoord
    }));
  };

  const generateTransformedText = () => {
    // Simple transformation logic - in real app this could be more sophisticated
    const answers = Object.values(antwoorden);
    if (answers.length === 0) return '';

    // Combine answers into a narrative
    const combined = answers.filter(a => a.trim()).join('. ') + '.';
    return combined.charAt(0).toUpperCase() + combined.slice(1);
  };

  const saveCurrentTransformation = () => {
    const updatedTransformations = [...transformations];
    updatedTransformations[currentClaimIndex] = {
      origineleClaim: currentClaim,
      antwoorden: { ...antwoorden },
      getransformeerdeTekst: generateTransformedText()
    };
    setTransformations(updatedTransformations);
  };

  const nextClaim = () => {
    saveCurrentTransformation();
    setAntwoorden({}); // Reset answers for next claim

    if (currentClaimIndex < claims.length - 1) {
      setCurrentClaimIndex(prev => prev + 1);
    }
  };

  const previousClaim = () => {
    saveCurrentTransformation();
    setAntwoorden({}); // Reset answers

    if (currentClaimIndex > 0) {
      setCurrentClaimIndex(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    // Save final transformation
    saveCurrentTransformation();

    const resultaten: ClaimToProofResultaten = {
      transformations,
      isValid: transformations.every(t => t.getransformeerdeTekst.trim().length > 0)
    };

    setIsSubmitted(true);
    onComplete(resultaten);
  };

  const isValid = transformations.every(t => t.getransformeerdeTekst.trim().length > 0);
  const progress = ((currentClaimIndex + 1) / claims.length) * 100;

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
              Claims Getransformeerd
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Je hebt {transformations.length} claim{transformations.length !== 1 ? 's' : ''} omgezet naar bewijs.
            </p>
          </CardContent>
        </Card>

        {/* Transformations Overview */}
        <div className="space-y-4">
          {transformations.map((transformation, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Transformatie {index + 1}</CardTitle>
                  <Badge variant="outline">BEWIJS-Systeem™</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-red-700 mb-2">Originele Claim:</h4>
                  <p className="text-red-900 bg-red-50 p-3 rounded border border-red-200">
                    "{transformation.origineleClaim}"
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-green-700 mb-2">Getransformeerd naar Bewijs:</h4>
                  <p className="text-green-900 bg-green-50 p-3 rounded border border-green-200">
                    {transformation.getransformeerdeTekst}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!currentClaim) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="pt-8 pb-8 text-center">
            <p className="text-gray-600">Geen claims gevonden om te transformeren.</p>
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
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wand2 className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{titel}</h2>
            <p className="text-gray-600 mt-2">{beschrijving}</p>
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Voortgang</span>
            <span className="text-sm text-gray-600">
              {currentClaimIndex + 1} van {claims.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      {/* Current Claim */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-900">Huidige Claim</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-xl font-bold text-red-900 mb-2">
              "{currentClaim}"
            </p>
            <p className="text-sm text-red-700">
              Deze claim is niet geloofd totdat er bewijs is.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* BEWIJS Framework */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="pt-4">
          <div className="text-center">
            <h3 className="font-bold text-purple-900 mb-2">Het BEWIJS-Systeem™</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-sm">
              <div className="bg-white p-2 rounded">B = Beschrijf niet</div>
              <div className="bg-white p-2 rounded">E = Eis specifiek</div>
              <div className="bg-white p-2 rounded">W = Weef verhaal</div>
              <div className="bg-white p-2 rounded">I = Impliceer</div>
              <div className="bg-white p-2 rounded">J = Juiste details</div>
              <div className="bg-white p-2 rounded">S = Sensorisch</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions for Current Claim */}
      <Card>
        <CardHeader>
          <CardTitle>Transformeer naar Bewijs</CardTitle>
          <p className="text-sm text-gray-600">
            Beantwoord deze vragen om je claim om te zetten naar geloofwaardig bewijs.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {vragenPerClaim.map(vraag => (
            <div key={vraag.id} className="space-y-3">
              <label className="font-medium text-gray-900">
                {vraag.vraag}
              </label>
              <Textarea
                value={antwoorden[vraag.id] || ''}
                onChange={(e) => handleAnswerChange(vraag.id, e.target.value)}
                placeholder={vraag.placeholder}
                className="min-h-[80px]"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Preview */}
      {Object.values(antwoorden).some(a => a.trim()) && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900">Voorvertoning</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <h4 className="font-semibold text-green-900 mb-2">Getransformeerde tekst:</h4>
              <p className="text-green-800 bg-white p-3 rounded border border-green-200">
                {generateTransformedText() || 'Vul antwoorden in om voorvertoning te zien...'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <Button
              onClick={previousClaim}
              disabled={currentClaimIndex === 0}
              variant="outline"
            >
              Vorige Claim
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Claim {currentClaimIndex + 1} van {claims.length}
              </p>
            </div>

            {currentClaimIndex < claims.length - 1 ? (
              <Button
                onClick={nextClaim}
                disabled={Object.values(antwoorden).every(a => !a.trim())}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Volgende Claim
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!isValid || Object.values(antwoorden).every(a => !a.trim())}
                className="bg-[#ff66c4] hover:bg-[#e55bb0] text-white"
              >
                Transformeren Voltooien
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Validation */}
      {Object.values(antwoorden).every(a => !a.trim()) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-900">Antwoorden nodig</h4>
                <p className="text-sm text-yellow-800">
                  Beantwoord minstens één vraag om door te gaan.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}