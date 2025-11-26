'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, CheckCircle, AlertCircle, MessageSquare, Sparkles } from 'lucide-react';

interface PromptConfig {
  placeholder: string;
  maxLength: number;
  showCharacterCount: boolean;
}

interface DynamicPromptsProps {
  titel: string;
  beschrijving: string;
  bronOefening: string; // Reference to PromptSelector results
  perPrompt: PromptConfig;
  aiAssist?: boolean;
  irisContext?: string;
  onComplete: (resultaten: any) => void;
  onPrevious?: () => void;
}

interface DynamicPromptsResultaten {
  promptAntwoorden: Record<string, string>;
  isValid: boolean;
}

// Mock data - in real app this would come from the previous exercise
const mockGeselecteerdePrompts = [
  'Ik ga ongemakkelijk goed in...',
  'Mijn simpele genoegens...',
  'Een ding dat je moet weten over mij...'
];

export function DynamicPrompts({
  titel,
  beschrijving,
  bronOefening,
  perPrompt,
  aiAssist = false,
  irisContext,
  onComplete,
  onPrevious
}: DynamicPromptsProps) {
  const [promptAntwoorden, setPromptAntwoorden] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});

  // Initialize answers for each selected prompt
  useEffect(() => {
    const initialAntwoorden: Record<string, string> = {};
    mockGeselecteerdePrompts.forEach(prompt => {
      initialAntwoorden[prompt] = '';
    });
    setPromptAntwoorden(initialAntwoorden);
  }, []);

  const handleAnswerChange = (prompt: string, antwoord: string) => {
    setPromptAntwoorden(prev => ({
      ...prev,
      [prompt]: antwoord
    }));
  };

  const generateAIAnswer = async (prompt: string) => {
    if (!aiAssist) return;

    setAiLoading(prev => ({ ...prev, [prompt]: true }));

    try {
      // Simulate AI call - in real app this would call an API
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockAnswers: Record<string, string> = {
        'Ik ga ongemakkelijk goed in...': 'Het organiseren van spontane picknicks in het park. Ik plan ze tot in detail maar vertel niemand van tevoren.',
        'Mijn simpele genoegens...': 'De eerste hap van een versgebakken croissant op zondagochtend. Of de geur van regen op warm asfalt.',
        'Een ding dat je moet weten over mij...': 'Ik heb ooit mijn baan opgezegd om 3 maanden door Europa te reizen. Het beste besluit ooit.'
      };

      const aiAnswer = mockAnswers[prompt] || 'Dit is een AI gegenereerd antwoord voor deze prompt.';
      handleAnswerChange(prompt, aiAnswer);
    } catch (error) {
      console.error('AI generation failed:', error);
    } finally {
      setAiLoading(prev => ({ ...prev, [prompt]: false }));
    }
  };

  const handleSubmit = () => {
    const resultaten: DynamicPromptsResultaten = {
      promptAntwoorden,
      isValid: Object.values(promptAntwoorden).some(antwoord => antwoord.trim().length > 0)
    };

    setIsSubmitted(true);
    onComplete(resultaten);
  };

  const isValid = Object.values(promptAntwoorden).some(antwoord => antwoord.trim().length > 0);
  const totaalKarakters = Object.values(promptAntwoorden).reduce((sum, antwoord) => sum + antwoord.length, 0);
  const completedPrompts = Object.values(promptAntwoorden).filter(a => a.trim().length > 0).length;

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
              Prompt Antwoorden Voltooid
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Je hebt {completedPrompts} prompt{completedPrompts !== 1 ? 's' : ''} beantwoord met {totaalKarakters} karakters totaal.
            </p>
          </CardContent>
        </Card>

        {/* Answers Overview */}
        <div className="space-y-4">
          {mockGeselecteerdePrompts.map((prompt, index) => {
            const antwoord = promptAntwoorden[prompt] || '';

            return (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Prompt {index + 1}</CardTitle>
                    <Badge variant="outline">PUZZEL-Principe™</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-blue-700 mb-2">Prompt:</h4>
                    <p className="text-blue-900 bg-blue-50 p-3 rounded border border-blue-200">
                      "{prompt}"
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">Jouw Antwoord:</h4>
                    <p className="text-green-900 bg-green-50 p-3 rounded border border-green-200 whitespace-pre-wrap">
                      {antwoord || 'Geen antwoord gegeven'}
                    </p>
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
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{titel}</h2>
            <p className="text-gray-600 mt-2">{beschrijving}</p>
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Voortgang</h3>
              <p className="text-sm text-gray-600">
                {completedPrompts} van {mockGeselecteerdePrompts.length} prompts beantwoord
              </p>
            </div>
            <Badge variant={completedPrompts === mockGeselecteerdePrompts.length ? 'default' : 'secondary'}>
              {completedPrompts}/{mockGeselecteerdePrompts.length}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* PUZZEL Reminder */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="pt-4">
          <div className="text-center">
            <h3 className="font-bold text-green-900 mb-2">Onthoud: PUZZEL-Principe™</h3>
            <p className="text-sm text-green-800">
              Zorg dat je antwoorden persoonlijk, uniek, zintuiglijk, nieuw, energiek en uitnodigend zijn.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Prompt Answers */}
      <div className="space-y-6">
        {mockGeselecteerdePrompts.map((prompt, index) => {
          const antwoord = promptAntwoorden[prompt] || '';
          const karakterTelling = antwoord.length;
          const isOverMax = karakterTelling > perPrompt.maxLength;

          return (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Prompt {index + 1}</CardTitle>
                  <div className="flex gap-2">
                    {aiAssist && (
                      <Button
                        onClick={() => generateAIAnswer(prompt)}
                        disabled={aiLoading[prompt]}
                        size="sm"
                        variant="outline"
                        className="text-xs"
                      >
                        {aiLoading[prompt] ? (
                          'Generating...'
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3 mr-1" />
                            AI
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                {perPrompt.showCharacterCount && (
                  <p className={`text-sm ${isOverMax ? 'text-red-600' : 'text-gray-600'}`}>
                    {karakterTelling}/{perPrompt.maxLength} karakters
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-blue-700 mb-2">Prompt:</h4>
                  <p className="text-blue-900 bg-blue-50 p-3 rounded border border-blue-200">
                    "{prompt}"
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Jouw Antwoord:</h4>
                  <Textarea
                    value={antwoord}
                    onChange={(e) => handleAnswerChange(prompt, e.target.value)}
                    placeholder={perPrompt.placeholder}
                    maxLength={perPrompt.maxLength}
                    className={`min-h-[100px] ${isOverMax ? 'border-red-300' : ''}`}
                  />
                </div>
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
                  Klik op "AI" om suggesties te krijgen. Deze zijn bedoeld als inspiratie - pas ze aan naar je eigen stem!
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
                <h4 className="font-semibold text-yellow-900">Antwoorden nodig</h4>
                <p className="text-sm text-yellow-800">
                  Beantwoord minstens één prompt voordat je doorgaat.
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
            Prompt Antwoorden Opslaan & Doorgaan
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Totaal karakters: {totaalKarakters} |
              Prompts voltooid: {completedPrompts}/{mockGeselecteerdePrompts.length}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}