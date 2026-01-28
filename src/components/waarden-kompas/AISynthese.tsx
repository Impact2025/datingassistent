'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles, CheckCircle, AlertTriangle, Heart, Target } from 'lucide-react';

interface AISyntheseProps {
  sessionId: number;
  onComplete: () => void;
}

interface SynthesisResults {
  coreValues: Array<{
    key: string;
    name: string;
    description: string;
  }>;
  valuesMeaning: Record<string, string>;
  redFlags: string[];
  greenFlags: string[];
  datingStrategies: string[];
}

export function AISynthese({ sessionId, onComplete }: AISyntheseProps) {
  const [results, setResults] = useState<SynthesisResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    generateResults();
  }, []);

  const generateResults = async () => {
    setGenerating(true);
    try {
      const token = localStorage.getItem('datespark_auth_token');
      if (!token) return;

      const response = await fetch('/api/waarden-kompas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'generate_results'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.results);
      } else {
        console.error('Failed to generate results');
      }
    } catch (error) {
      console.error('Error generating results:', error);
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  };

  if (loading || generating) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-coral-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              AI Analyseert Jouw Antwoorden...
            </h2>
            <p className="text-gray-600 mb-6">
              We combineren je waarden om jouw persoonlijke Waarden Kompas te creëren
            </p>
            <div className="flex justify-center space-x-2">
              <div className="w-3 h-3 bg-coral-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-coral-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Er Ging Iets Mis
            </h2>
            <p className="text-gray-600 mb-6">
              We konden je resultaten niet genereren. Probeer het opnieuw.
            </p>
            <Button onClick={generateResults} variant="outline">
              Opnieuw Proberen
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="text-center">
        <CardContent className="pt-8 pb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Jouw Waarden Kompas™
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Gefeliciteerd! Hier is je persoonlijke analyse van wat jij écht belangrijk vindt in relaties.
            Deze inzichten helpen je om betere dating beslissingen te maken.
          </p>
        </CardContent>
      </Card>

      {/* Core Values */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-coral-500" />
            Jouw Kernwaarden (Top 5-7)
          </CardTitle>
          <p className="text-gray-600">
            Dit zijn de waarden die het meest essentieel zijn voor jouw geluk in relaties
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.coreValues.map((value, index) => (
              <div key={value.key} className="border border-coral-200 bg-coral-50/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="secondary" className="bg-coral-100 text-coral-800">
                    #{index + 1}
                  </Badge>
                  <h3 className="font-semibold text-gray-900">{value.name}</h3>
                </div>
                <p className="text-sm text-gray-700">{value.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Values Meaning */}
      <Card>
        <CardHeader>
          <CardTitle>Wat Deze Waarden Betekenen in Dating</CardTitle>
          <p className="text-gray-600">
            Hoe je kernwaarden zich vertalen naar concrete verwachtingen in relaties
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {results.coreValues.slice(0, 5).map((value) => (
            <div key={value.key} className="border-l-4 border-l-coral-500 pl-4 bg-gray-50 p-4 rounded-r-lg">
              <h3 className="font-semibold text-gray-900 mb-2">{value.name}</h3>
              <p className="text-gray-700">{results.valuesMeaning[value.key]}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Red Flags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-red-700">
            <AlertTriangle className="w-6 h-6" />
            Rode Vlaggen (Let op!)
          </CardTitle>
          <p className="text-gray-600">
            Gedragingen die tegen jouw waarden ingaan - dit zijn belangrijke signalen
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {results.redFlags.map((flag, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-red-800">{flag}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Green Flags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-green-700">
            <CheckCircle className="w-6 h-6" />
            Groene Vlaggen (Zoek dit!)
          </CardTitle>
          <p className="text-gray-600">
            Kwaliteiten die perfect passen bij jouw waarden - dit zijn je ideale matches
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {results.greenFlags.map((flag, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-green-800">{flag}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dating Strategies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Target className="w-6 h-6 text-purple-500" />
            Dating Strategieën op Maat
          </CardTitle>
          <p className="text-gray-600">
            Praktische tips om je waarden toe te passen in je dating leven
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {results.datingStrategies.map((strategy, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <p className="text-purple-800">{strategy}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="bg-gradient-to-r from-coral-50 to-purple-50 border-coral-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Klaar voor de Volgende Stap?
            </h3>
            <p className="text-gray-700 mb-6">
              Nu je je Waarden Kompas hebt, laten we het integreren in al je dating tools.
              Dit zorgt ervoor dat al je toekomstige acties gebaseerd zijn op wat jij écht belangrijk vindt.
            </p>
            <Button
              onClick={onComplete}
              className="bg-gradient-to-r from-coral-500 to-purple-500 hover:from-coral-600 hover:to-purple-600 text-white font-semibold px-8 py-3"
              size="lg"
            >
              Integreer in Mijn Tools
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}