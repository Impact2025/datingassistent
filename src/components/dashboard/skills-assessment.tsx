"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useUser } from '@/providers/user-provider';
import * as Lucide from 'lucide-react';
import type { UserProfile } from '@/lib/types';

interface Question {
  id: number;
  text: string;
  type: 'multiple-choice' | 'scale' | 'open';
  options?: string[];
  scale?: string[];
  category: 'experience' | 'confidence' | 'strategy' | 'goals' | 'safety';
  weight: number;
}

interface AssessmentResult {
  overallScore: number;
  confidenceLevel: 'beginner' | 'intermediate' | 'advanced';
  categoryScores: {
    experience: number;
    confidence: number;
    strategy: number;
    goals: number;
    safety: number;
  };
  strengths: string[];
  areasForImprovement: string[];
  recommendations: Array<{
    text: string;
    action: string;
    tab?: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  nextSteps: string[];
}

// Extended UserProfile type for skills assessment
interface ExtendedUserProfile extends UserProfile {
  datingExperience?: 'beginner' | 'intermediate' | 'advanced';
  strengths?: string[];
  areasForImprovement?: string[];
  assessmentScore?: number;
  assessmentDate?: string;
}

const ASSESSMENT_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Hoe comfortabel voel je je bij het starten van gesprekken met vreemden?",
    type: 'scale',
    scale: ['Helemaal niet comfortabel', 'Een beetje oncomfortabel', 'Neutraal', 'Redelijk comfortabel', 'Heel comfortabel'],
    category: 'confidence',
    weight: 1.2
  },
  {
    id: 2,
    text: "Hoeveel ervaring heb je met online daten in de afgelopen 12 maanden?",
    type: 'multiple-choice',
    options: [
      "Nog nooit gedaan",
      "1-2 keer geprobeerd",
      "3-5 keer geprobeerd",
      "Regelmatig (maandelijks)",
      "Zeer ervaren (wekelijks+)"
    ],
    category: 'experience',
    weight: 1.0
  },
  {
    id: 3,
    text: "Hoe goed weet je wat je zoekt in een partner?",
    type: 'scale',
    scale: ['Helemaal niet duidelijk', 'Een beetje vaag', 'Redelijk duidelijk', 'Duidelijk', 'Heel duidelijk'],
    category: 'goals',
    weight: 1.1
  },
  {
    id: 4,
    text: "Hoe vaak lukt het je om een eerste gesprek om te zetten in een date?",
    type: 'multiple-choice',
    options: [
      "Nog nooit gelukt",
      "Zelden (<25% van gesprekken)",
      "Soms (25-50% van gesprekken)",
      "Vaak (50-75% van gesprekken)",
      "Bijna altijd (>75% van gesprekken)"
    ],
    category: 'strategy',
    weight: 1.3
  },
  {
    id: 5,
    text: "Hoe belangrijk vind je veiligheid bij online daten?",
    type: 'scale',
    scale: ['Niet belangrijk', 'Een beetje belangrijk', 'Belangrijk', 'Heel belangrijk', 'Essentieel'],
    category: 'safety',
    weight: 1.4
  },
  {
    id: 6,
    text: "Hoeveel tijd besteed je gemiddeld aan het verbeteren van je dating vaardigheden?",
    type: 'multiple-choice',
    options: [
      "Geen tijd",
      "Af en toe (wekelijks)",
      "Regelmatig (paar keer per week)",
      "Dagelijks",
      "Heel veel tijd (professioneel niveau)"
    ],
    category: 'experience',
    weight: 0.9
  },
  {
    id: 7,
    text: "Hoe goed kun je je eigen sterke en zwakke punten inschatten?",
    type: 'scale',
    scale: ['Helemaal niet', 'Slecht', 'Redelijk', 'Goed', 'Uitstekend'],
    category: 'confidence',
    weight: 1.0
  },
  {
    id: 8,
    text: "Wat is je grootste uitdaging bij online daten?",
    type: 'multiple-choice',
    options: [
      "Profiel optimaliseren",
      "Gesprekken starten",
      "Gesprekken gaande houden",
      "Grenzen stellen en veiligheid",
      "Van online naar offline gaan",
      "Geen specifieke uitdagingen"
    ],
    category: 'strategy',
    weight: 1.2
  },
  {
    id: 9,
    text: "Hoe duidelijk communiceer je je grenzen en verwachtingen?",
    type: 'scale',
    scale: ['Helemaal niet duidelijk', 'Vaag', 'Redelijk duidelijk', 'Duidelijk', 'Heel duidelijk'],
    category: 'safety',
    weight: 1.3
  },
  {
    id: 10,
    text: "Wat is je belangrijkste doel met online daten?",
    type: 'multiple-choice',
    options: [
      "Nieuwe mensen leren kennen",
      "Leuke dates hebben",
      "Een serieuze relatie vinden",
      "Meer zelfvertrouwen krijgen",
      "Dating ervaring opdoen"
    ],
    category: 'goals',
    weight: 1.0
  }
];

export function SkillsAssessment() {
  const { userProfile, updateProfile } = useUser();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const handleAnswer = (value: string) => {
    setAnswers(prev => ({ ...prev, [ASSESSMENT_QUESTIONS[currentQuestion].id]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    // Calculate assessment result based on answers
    const assessmentResult: AssessmentResult = calculateResult(answers);
    setResult(assessmentResult);
    setIsCompleted(true);

    // Save to user profile
    if (userProfile) {
      const updatedProfile: ExtendedUserProfile = {
        ...userProfile,
        datingExperience: assessmentResult.confidenceLevel,
        strengths: assessmentResult.strengths,
        areasForImprovement: assessmentResult.areasForImprovement,
        assessmentScore: assessmentResult.overallScore,
        assessmentDate: new Date().toISOString()
      };
      updateProfile(updatedProfile);

      // Update coaching profile to mark personality scan as complete
      try {
        const token = localStorage.getItem('datespark_auth_token');

        // Mark personality scan as complete
        const stepResponse = await fetch('/api/coaching-profile/complete-step', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            stepName: 'personality_scan'
          })
        });

        // Update additional profile data
        const updateResponse = await fetch('/api/coaching-profile', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            comfortLevel: assessmentResult.overallScore,
            strengths: assessmentResult.strengths,
            growthAreas: assessmentResult.areasForImprovement
          })
        });

        if (stepResponse.ok && updateResponse.ok) {
          console.log('✅ Coaching profile updated with personality scan completion');
          // Trigger a page reload after a short delay to show the updated dashboard
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      } catch (error) {
        console.error('Failed to update coaching profile:', error);
      }
    }
  };

  const calculateResult = (answers: Record<number, string>): AssessmentResult => {
    // Initialize category scores
    const categoryScores = {
      experience: 0,
      confidence: 0,
      strategy: 0,
      goals: 0,
      safety: 0
    };

    // Score mapping for different answer types
    const scaleScores = {
      'Helemaal niet comfortabel': 1, 'Een beetje oncomfortabel': 2, 'Neutraal': 3, 'Redelijk comfortabel': 4, 'Heel comfortabel': 5,
      'Helemaal niet duidelijk': 1, 'Een beetje vaag': 2, 'Redelijk duidelijk': 3, 'Duidelijk': 4, 'Heel duidelijk': 5,
      'Niet belangrijk': 1, 'Een beetje belangrijk': 2, 'Belangrijk': 3, 'Heel belangrijk': 4, 'Essentieel': 5,
      'Helemaal niet': 1, 'Slecht': 2, 'Redelijk': 3, 'Goed': 4, 'Uitstekend': 5
    };

    const multipleChoiceScores = {
      // Experience (Q2, Q6)
      'Nog nooit gedaan': 1, '1-2 keer geprobeerd': 2, '3-5 keer geprobeerd': 3, 'Regelmatig (maandelijks)': 4, 'Zeer ervaren (wekelijks+)': 5,
      'Geen tijd': 1, 'Af en toe (wekelijks)': 2, 'Regelmatig (paar keer per week)': 3, 'Dagelijks': 4, 'Heel veel tijd (professioneel niveau)': 5,

      // Strategy (Q4, Q8)
      'Nog nooit gelukt': 1, 'Zelden (<25% van gesprekken)': 2, 'Soms (25-50% van gesprekken)': 3, 'Vaak (50-75% van gesprekken)': 4, 'Bijna altijd (>75% van gesprekken)': 5,
      'Profiel optimaliseren': 1, 'Gesprekken starten': 2, 'Gesprekken gaande houden': 3, 'Grenzen stellen en veiligheid': 4, 'Van online naar offline gaan': 5, 'Geen specifieke uitdagingen': 5,

      // Goals (Q10)
      'Nieuwe mensen leren kennen': 3, 'Leuke dates hebben': 3, 'Een serieuze relatie vinden': 4, 'Meer zelfvertrouwen krijgen': 2, 'Dating ervaring opdoen': 2
    };

    // Calculate scores for each question
    ASSESSMENT_QUESTIONS.forEach(question => {
      const answer = answers[question.id];
      if (!answer) return;

      let score = 0;

      if (question.type === 'scale' && question.scale) {
        score = scaleScores[answer as keyof typeof scaleScores] || 3;
      } else if (question.type === 'multiple-choice' && question.options) {
        score = multipleChoiceScores[answer as keyof typeof multipleChoiceScores] || 3;
      }

      // Apply weight and add to category
      categoryScores[question.category] += score * question.weight;
    });

    // Normalize scores (max possible per category varies due to weights)
    const maxScores = { experience: 2.9, confidence: 3.2, strategy: 4.5, goals: 2.1, safety: 4.2 };
    Object.keys(categoryScores).forEach(key => {
      const category = key as keyof typeof categoryScores;
      categoryScores[category] = Math.min(5, (categoryScores[category] / maxScores[category]) * 5);
    });

    // Calculate overall score
    const overallScore = Math.round(
      (categoryScores.experience + categoryScores.confidence + categoryScores.strategy + categoryScores.goals + categoryScores.safety) / 5
    );

    // Determine confidence level based on overall score
    let confidenceLevel: 'beginner' | 'intermediate' | 'advanced';
    if (overallScore <= 2.5) confidenceLevel = 'beginner';
    else if (overallScore <= 3.8) confidenceLevel = 'intermediate';
    else confidenceLevel = 'advanced';

    // Generate personalized strengths and areas for improvement
    const strengths: string[] = [];
    const areasForImprovement: string[] = [];
    const recommendations: Array<{text: string; action: string; tab?: string; priority: 'high' | 'medium' | 'low'}> = [];

    // Experience-based insights
    if (categoryScores.experience >= 4) {
      strengths.push("Ruime dating ervaring");
    } else if (categoryScores.experience >= 2.5) {
      strengths.push("Basis ervaring aanwezig");
    } else {
      areasForImprovement.push("Meer praktijkervaring opdoen");
      recommendations.push({
        text: "Begin met het oefenen van gesprekken",
        action: "Ga naar Chat Coach",
        tab: "chat-coach",
        priority: "high"
      });
    }

    // Confidence-based insights
    if (categoryScores.confidence >= 4) {
      strengths.push("Sterk zelfvertrouwen");
    } else if (categoryScores.confidence <= 2.5) {
      areasForImprovement.push("Zelfvertrouwen opbouwen");
      recommendations.push({
        text: "Werk aan je zelfvertrouwen",
        action: "Bekijk persoonlijke ontwikkeling tips",
        priority: "medium"
      });
    }

    // Strategy-based insights
    if (categoryScores.strategy >= 4) {
      strengths.push("Goede gesprekstechnieken");
    } else if (categoryScores.strategy <= 2.5) {
      areasForImprovement.push("Gesprekstechnieken verbeteren");
      recommendations.push({
        text: "Leer betere gesprek starters",
        action: "Ga naar Gesprek Starter",
        tab: "gesprek-starter",
        priority: "high"
      });
    }

    // Safety-based insights
    if (categoryScores.safety >= 4) {
      strengths.push("Veiligheid bewuste aanpak");
    } else if (categoryScores.safety <= 2.5) {
      areasForImprovement.push("Veiligheid prioriteit maken");
      recommendations.push({
        text: "Leer over dating veiligheid",
        action: "Bekijk cursus modules",
        tab: "online-cursus",
        priority: "high"
      });
    }

    // Goals-based insights
    if (categoryScores.goals >= 4) {
      strengths.push("Duidelijke relatie doelen");
    } else if (categoryScores.goals <= 2.5) {
      areasForImprovement.push("Doelen verduidelijken");
      recommendations.push({
        text: "Bepaal je dating doelen",
        action: "Maak een persoonlijk plan",
        priority: "medium"
      });
    }

    // Add default strengths if none found
    if (strengths.length === 0) {
      strengths.push("Motivatie om te leren", "Openheid voor feedback");
    }

    // Add default areas if none found
    if (areasForImprovement.length === 0) {
      areasForImprovement.push("Specifieke aandachtsgebieden identificeren");
    }

    // Generate next steps
    const nextSteps = [
      "Voltooi je profiel optimalisatie",
      "Oefen met de beschikbare tools",
      "Stel realistische doelen voor de komende maand",
      "Herhaal deze assessment over 4 weken"
    ];

    return {
      overallScore,
      confidenceLevel,
      categoryScores,
      strengths,
      areasForImprovement,
      recommendations,
      nextSteps
    };
  };

  const resetAssessment = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setIsCompleted(false);
    setResult(null);
  };

  if (isCompleted && result) {
    return (
      <Card className="bg-secondary/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lucide.Award className="text-primary" />
            Jouw Dating Vaardigheden Beoordeling
          </CardTitle>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">{result.overallScore}/5</div>
            <div className="flex items-center justify-center gap-2">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                result.confidenceLevel === 'beginner' ? 'bg-blue-100 text-blue-800' :
                result.confidenceLevel === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {result.confidenceLevel === 'beginner' ? 'Beginner' :
                 result.confidenceLevel === 'intermediate' ? 'Gemiddeld' : 'Gevorderd'}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Category Scores */}
          <div className="bg-background p-4 rounded-lg">
            <h3 className="font-semibold mb-4">Categorische Scores</h3>
            <div className="space-y-3">
              {Object.entries(result.categoryScores).map(([category, score]) => (
                <div key={category} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-24 capitalize">
                    {category === 'experience' ? 'Ervaring' :
                     category === 'confidence' ? 'Zelfvertrouwen' :
                     category === 'strategy' ? 'Strategie' :
                     category === 'goals' ? 'Doelen' : 'Veiligheid'}
                  </span>
                  <div className="flex-1">
                    <Progress value={(score / 5) * 100} className="h-2" />
                  </div>
                  <span className="text-sm font-semibold w-8">{score.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-background p-4 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Lucide.ThumbsUp className="text-green-500" />
                Sterke Punten
              </h3>
              <ul className="space-y-1">
                {result.strengths.map((strength, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Lucide.CheckCircle className="text-green-500 h-4 w-4" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-background p-4 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Lucide.Target className="text-orange-500" />
                Verbeterpunten
              </h3>
              <ul className="space-y-1">
                {result.areasForImprovement.map((area, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Lucide.Circle className="text-orange-500 h-4 w-4" />
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-background p-4 rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Lucide.Lightbulb className="text-primary" />
              Persoonlijke Aanbevelingen
            </h3>
            <div className="space-y-3">
              {result.recommendations.map((recommendation, index) => (
                <div key={index} className={`p-3 rounded-lg border-l-4 ${
                  recommendation.priority === 'high' ? 'border-l-red-500 bg-red-50' :
                  recommendation.priority === 'medium' ? 'border-l-yellow-500 bg-yellow-50' :
                  'border-l-blue-500 bg-blue-50'
                }`}>
                  <div className="flex items-start gap-2">
                    <Lucide.ChevronRight className="text-primary h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{recommendation.text}</p>
                      <p className="text-sm text-muted-foreground">{recommendation.action}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-background p-4 rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Lucide.Map className="text-primary" />
              Volgende Stappen
            </h3>
            <ul className="space-y-2">
              {result.nextSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={resetAssessment} variant="outline">
              Opnieuw doen
            </Button>
            <Button onClick={() => window.location.reload()}>
              Terug naar Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const question = ASSESSMENT_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / ASSESSMENT_QUESTIONS.length) * 100;

  return (
    <Card className="bg-secondary/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lucide.ClipboardList className="text-primary" />
          Dating Vaardigheden Beoordeling
        </CardTitle>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Vraag {currentQuestion + 1} van {ASSESSMENT_QUESTIONS.length}</span>
            <span>{Math.round(progress)}% compleet</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-background p-4 rounded-lg">
          <h3 className="font-semibold mb-4">{question.text}</h3>

          {question.type === 'multiple-choice' && question.options && (
            <RadioGroup
              onValueChange={handleAnswer}
              value={answers[question.id] || ''}
            >
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {question.type === 'scale' && question.scale && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Kies het antwoord dat het beste bij jou past:
              </p>
              <RadioGroup
                onValueChange={handleAnswer}
                value={answers[question.id] || ''}
                className="grid grid-cols-1 gap-3"
              >
                {question.scale.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value={option} id={`scale-${index}`} />
                    <Label htmlFor={`scale-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {question.type === 'open' && (
            <Textarea
              placeholder="Typ je antwoord hier..."
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswer(e.target.value)}
              rows={4}
            />
          )}
        </div>

        <div className="flex justify-between gap-3 pt-4">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            variant="outline"
          >
            Vorige
          </Button>
          <Button
            onClick={handleNext}
            disabled={!answers[question.id]}
          >
            {currentQuestion === ASSESSMENT_QUESTIONS.length - 1 ? 'Indienen' : 'Volgende'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}