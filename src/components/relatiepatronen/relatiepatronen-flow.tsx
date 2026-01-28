"use client";

/**
 * RelatiepatronenFlow - Relationship Patterns Reflection Flow
 * Analyzes recurring relationship patterns and provides growth strategies
 */

import { useState } from 'react';
import { useUser } from '@/providers/user-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Repeat,
  ArrowRight,
  ArrowLeft,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Target
} from 'lucide-react';

type AssessmentStep = 'intro' | 'assessment' | 'results';

interface RelatiepatronenFlowProps {
  onClose?: () => void;
}

const questions = [
  {
    id: 1,
    text: 'Hoe zou je je meest voorkomende relatiepatroon beschrijven?',
    options: [
      'Ik kies vaak voor partners die emotioneel niet beschikbaar zijn',
      'Ik verlies mezelf in relaties en vergeet mijn eigen behoeften',
      'Ik heb moeite met commitment en trek me vaak terug',
      'Ik blijf te lang in ongezonde relaties hangen',
      'Ik herhaal dezelfde ruzies in verschillende relaties'
    ]
  },
  {
    id: 2,
    text: 'Wat gebeurt er meestal als een relatie intens wordt?',
    options: [
      'Ik voel paniek en wil ruimte',
      'Ik word extra klampend en angstig',
      'Ik begin te saboteren',
      'Ik zoek bevestiging buiten de relatie',
      'Ik voel me juist veiliger en opener'
    ]
  },
  {
    id: 3,
    text: 'Welk patroon herken je uit je vorige relaties?',
    options: [
      'Ik aantrek steeds hetzelfde type partner',
      'Relaties beginnen geweldig maar eindigen slecht',
      'Ik geef meer dan ik terugkrijg',
      'Ik voel me vaak niet gehoord of gezien',
      'Ik heb conflicten met intimiteit en nabijheid'
    ]
  },
  {
    id: 4,
    text: 'Hoe ga je om met conflict in relaties?',
    options: [
      'Ik vermijd conflict ten koste van alles',
      'Ik word defensief en sluit me af',
      'Ik escaleer snel en word emotioneel',
      'Ik praat het uit op een constructieve manier',
      'Ik geef altijd toe om de vrede te bewaren'
    ]
  },
  {
    id: 5,
    text: 'Wat zou je het liefst anders doen in je volgende relatie?',
    options: [
      'Mijn eigen grenzen beter bewaken',
      'Niet te snel investeren emotioneel',
      'Patronen eerder herkennen en aanpakken',
      'Beter communiceren over mijn behoeften',
      'Kiezen voor een meer compatibele partner'
    ]
  }
];

export function RelatiepatronenFlow({ onClose }: RelatiepatronenFlowProps) {
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState<AssessmentStep>('intro');
  const [responses, setResponses] = useState<any[]>([]);
  const [results, setResults] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const getStepProgress = () => {
    switch (currentStep) {
      case 'intro': return 0;
      case 'assessment': return 50;
      case 'results': return 100;
      default: return 0;
    }
  };

  const startAssessment = () => {
    setCurrentStep('assessment');
  };

  const handleAnswer = (question: any, answer: string, value: number) => {
    const response = { questionId: question.id, question: question.text, answer, value };
    setResponses([...responses, response]);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      generateResults();
    }
  };

  const generateResults = () => {
    const mockResults = {
      primaryPattern: 'Angstig-Vermijdend Patroon',
      description: 'Je hebt de neiging om te schakelen tussen angst voor verlating en behoefte aan afstand.',
      triggers: ['Partner trekt zich terug', 'Te snel te close worden', 'Onzekerheid over de toekomst'],
      growthStrategies: [
        { title: 'Bewustwording verhogen', description: 'Herken je triggers voordat je reageert.' },
        { title: 'Communicatie verbeteren', description: 'Leer je behoeften direct te benoemen.' },
        { title: 'Zelfregulatie oefenen', description: 'Gebruik ademhaling en mindfulness.' }
      ],
      redFlags: ['Partners die "hot and cold" zijn', 'Mensen die niet over gevoelens willen praten'],
      score: 72
    };
    setResults(mockResults);
    setCurrentStep('results');
  };

  const renderIntro = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-50 via-coral-50 to-blue-50 border-0">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Repeat className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Relatiepatronen Reflectie</h2>
          <p className="text-gray-600 max-w-xl mx-auto mb-6">
            Ontdek je terugkerende relatiepatronen en leer hoe je ongezonde cycli kunt doorbreken.
          </p>
        </CardContent>
      </Card>
      <div className="flex justify-center">
        <Button onClick={startAssessment} className="bg-gradient-to-r from-purple-500 to-coral-600 text-white px-8 py-6 text-lg">
          Start Reflectie <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderAssessment = () => {
    const currentQuestion = questions[currentQuestionIndex];
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Badge variant="outline">Vraag {currentQuestionIndex + 1} van {questions.length}</Badge>
            <CardTitle className="text-xl mt-2">{currentQuestion.text}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentQuestion.options.map((option: string, index: number) => (
                <Button key={index} variant="outline" className="w-full justify-start text-left h-auto py-4 px-6 hover:bg-purple-50"
                  onClick={() => handleAnswer(currentQuestion, option, index)}>
                  {option}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderResults = () => {
    if (!results) return null;
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-purple-50 to-coral-50 border-0">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">Je Relatiepatroon Analyse</h2>
            <p className="text-gray-600 max-w-xl mx-auto">Ontdek je primaire patroon.</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Repeat className="w-5 h-5 text-purple-600" />
              Je Primaire Patroon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="font-bold text-lg mb-2">{results.primaryPattern}</h3>
            <p className="text-gray-700">{results.description}</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Groei Strategieën
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.growthStrategies?.map((strategy: any, i: number) => (
                <div key={i} className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-semibold mb-1">{strategy.title}</h4>
                  <p className="text-sm text-gray-700">{strategy.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        {onClose && (
          <Button onClick={onClose} className="w-full bg-gradient-to-r from-purple-500 to-coral-600">
            Terug naar Dashboard
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">
            {currentStep === 'intro' && 'Introductie'}
            {currentStep === 'assessment' && 'Assessment'}
            {currentStep === 'results' && 'Resultaten'}
          </span>
          <span className="text-sm text-gray-500">{getStepProgress()}%</span>
        </div>
        <Progress value={getStepProgress()} className="h-2" />
      </div>
      {currentStep === 'intro' && renderIntro()}
      {currentStep === 'assessment' && renderAssessment()}
      {currentStep === 'results' && renderResults()}
    </div>
  );
}
