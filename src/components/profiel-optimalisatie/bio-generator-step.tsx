"use client";

/**
 * Bio Generator Step - AI-powered bio creation
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ArrowRight, Sparkles, CheckCircle, Loader2 } from 'lucide-react';

interface BioGeneratorStepProps {
  onComplete: (data: any) => void;
  onBack: () => void;
  profileData: any;
}

const BIO_QUESTIONS = [
  {
    id: 'passion',
    question: 'Wat doe je het liefst in je vrije tijd?',
    placeholder: 'Bijv: Ik verdwijn graag in sci-fi boeken op zondag...',
    hint: 'Wees specifiek! Niet "lezen" maar "verdwijnen in sci-fi boeken"'
  },
  {
    id: 'unique',
    question: 'Wat maakt jou uniek of anders?',
    placeholder: 'Iets specifieks over jezelf...',
    hint: 'Denk aan je eigenaardigheden, unieke skills, of grappige gewoontes'
  },
  {
    id: 'ideal_date',
    question: 'Hoe ziet jouw ideale eerste date eruit?',
    placeholder: 'Beschrijf een perfecte eerste date...',
    hint: 'Geef een concreet voorbeeld, geen algemene beschrijving'
  },
  {
    id: 'humor',
    question: 'Deel iets leuks of grappigs over jezelf',
    placeholder: 'Een grappig feit of anekdote...',
    hint: 'Humor maakt je profiel memorabel'
  },
  {
    id: 'looking_for',
    question: 'Waar ben je naar op zoek?',
    placeholder: 'Wat voor connectie zoek je...',
    hint: 'Wees eerlijk over je intenties'
  }
];

export function BioGeneratorStep({ onComplete, onBack, profileData }: BioGeneratorStepProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBios, setGeneratedBios] = useState<any[]>([]);
  const [selectedBio, setSelectedBio] = useState<string | null>(null);

  const question = BIO_QUESTIONS[currentQuestion];

  const handleNext = async () => {
    if (currentQuestion < BIO_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Generate bios
      setIsGenerating(true);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate AI-generated bios
      const bios = [
        {
          variant: `${answers.passion} ${answers.unique} Op zoek naar iemand voor ${answers.ideal_date}. ${answers.humor} ${answers.looking_for}`,
          score: 92,
          style: 'Avontuurlijk & Speels'
        },
        {
          variant: `Authentiek verhaal: ${answers.unique} Houdt van ${answers.passion}. ${answers.looking_for}`,
          score: 87,
          style: 'Authentiek & Direct'
        },
        {
          variant: `${answers.humor} Dagelijks: ${answers.passion}. Ideale date? ${answers.ideal_date}`,
          score: 79,
          style: 'Mysterieus & Intrigerend'
        }
      ];

      setGeneratedBios(bios);
      setIsGenerating(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    } else {
      onBack();
    }
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-12 max-w-md w-full text-center space-y-6 border-0 shadow-lg">
          <Loader2 className="w-12 h-12 animate-spin text-gray-900 mx-auto" />
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">AI genereert je bio's...</h3>
            <p className="text-gray-600">
              3 gepersonaliseerde varianten gebaseerd op jouw antwoorden
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (generatedBios.length > 0) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="space-y-4">
            <button
              onClick={() => setGeneratedBios([])}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Antwoorden Aanpassen</span>
            </button>

            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Kies Je Bio
              </h1>
              <p className="text-gray-600 mt-2">
                3 gepersonaliseerde bio's gemaakt voor jou
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {generatedBios.map((bio, index) => (
              <Card
                key={index}
                className={`p-6 border-2 cursor-pointer transition-all ${
                  selectedBio === bio.variant
                    ? 'border-gray-900 shadow-lg'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
                onClick={() => setSelectedBio(bio.variant)}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Optie {index + 1}</span>
                      <h3 className="text-lg font-semibold text-gray-900 mt-1">{bio.style}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{bio.score}</div>
                        <div className="text-xs text-gray-500">Match Score</div>
                      </div>
                      {selectedBio === bio.variant && (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      )}
                    </div>
                  </div>

                  <p className="text-gray-700 leading-relaxed">{bio.variant}</p>

                  {index === 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-blue-900">
                          <strong>Aanbevolen:</strong> Deze bio balanceert humor, authenticiteit en specifieke details
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {selectedBio && (
            <Button
              onClick={() => onComplete({ selectedBio, bioScore: 92, bioVariants: generatedBios })}
              className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium group"
              size="lg"
            >
              Bio Opslaan & Verder
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        <div className="space-y-4">
          <button
            onClick={handlePrevious}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">{currentQuestion === 0 ? 'Terug naar Route' : 'Vorige Vraag'}</span>
          </button>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Vraag {currentQuestion + 1} van {BIO_QUESTIONS.length}</span>
            </div>
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-900 transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / BIO_QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <Card className="p-8 border-0 shadow-lg">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Bio Generator
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                {question.question}
              </h2>
              {question.hint && (
                <p className="text-sm text-gray-500 italic">{question.hint}</p>
              )}
            </div>

            <Textarea
              placeholder={question.placeholder}
              value={answers[question.id] || ''}
              onChange={(e) => setAnswers(prev => ({ ...prev, [question.id]: e.target.value }))}
              className="min-h-[150px] resize-none border-2 border-gray-200 focus:border-gray-900 rounded-lg text-lg"
            />

            <Button
              onClick={handleNext}
              disabled={!answers[question.id]?.trim()}
              className="w-full h-12 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white font-medium group"
            >
              {currentQuestion === BIO_QUESTIONS.length - 1 ? 'Genereer Bio\'s' : 'Volgende Vraag'}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
