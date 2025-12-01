"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  Clock,
  Target,
  MessageCircle,
  Heart,
  Shield,
  Zap,
  RefreshCw,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface MicroIntervention {
  id: string;
  titel: string;
  beschrijving: string;
  duur: string;
  categorie: 'veiligheid' | 'communicatie' | 'zelfzorg' | 'actie';
  stappen: string[];
  icoon: React.ReactNode;
  kleur: string;
}

interface MicroInterventionsProps {
  interventions: any;
  onInterventionComplete?: (interventionId: string) => void;
}

export function MicroInterventions({ interventions, onInterventionComplete }: MicroInterventionsProps) {
  const [activeIntervention, setActiveIntervention] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<string, number>>({});
  const [isRunning, setIsRunning] = useState<Record<string, boolean>>({});

  const getInterventionIcon = (categorie: string) => {
    switch (categorie) {
      case 'veiligheid': return <Shield className="w-5 h-5" />;
      case 'communicatie': return <MessageCircle className="w-5 h-5" />;
      case 'zelfzorg': return <Heart className="w-5 h-5" />;
      case 'actie': return <Target className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  const getInterventionColor = (categorie: string) => {
    switch (categorie) {
      case 'veiligheid': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'communicatie': return 'text-green-600 bg-green-50 border-green-200';
      case 'zelfzorg': return 'text-pink-600 bg-pink-50 border-pink-200';
      case 'actie': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleStepComplete = (interventionId: string, stepIndex: number) => {
    setCompletedSteps(prev => ({
      ...prev,
      [interventionId]: Math.max(prev[interventionId] || 0, stepIndex + 1)
    }));

    if (onInterventionComplete) {
      onInterventionComplete(interventionId);
    }
  };

  const toggleIntervention = (interventionId: string) => {
    setIsRunning(prev => ({
      ...prev,
      [interventionId]: !prev[interventionId]
    }));

    if (!isRunning[interventionId]) {
      setActiveIntervention(interventionId);
    } else {
      setActiveIntervention(null);
    }
  };

  const resetIntervention = (interventionId: string) => {
    setCompletedSteps(prev => ({
      ...prev,
      [interventionId]: 0
    }));
    setIsRunning(prev => ({
      ...prev,
      [interventionId]: false
    }));
    setActiveIntervention(null);
  };

  // Convert the interventions data to our format
  const formattedInterventions: MicroIntervention[] = [
    {
      id: 'veiligheidsanker',
      titel: 'Veiligheidsanker (2 min per dag)',
      beschrijving: 'Kort ritueel voor daten/appen om innerlijke rust te creëren',
      duur: '2 minuten',
      categorie: 'veiligheid',
      icoon: <Shield className="w-5 h-5" />,
      kleur: 'text-blue-600 bg-blue-50 border-blue-200',
      stappen: [
        'Adem 3x diep in en uit',
        'Vraag jezelf: "Wat is feitelijk waar?"',
        'Herinner jezelf: "Ik ben veilig in dit moment"',
        'Stel één kleine, haalbare intentie'
      ]
    },
    {
      id: 'pre_date_grounding',
      titel: 'Pre-Date Grounding',
      beschrijving: 'Voorbereiding voor elke date om aanwezig te blijven',
      duur: '1 minuut',
      categorie: 'zelfzorg',
      icoon: <Heart className="w-5 h-5" />,
      kleur: 'text-pink-600 bg-pink-50 border-pink-200',
      stappen: [
        '3 verwachtingen voor deze date noteren',
        '1 grens die je wilt bewaken',
        '1 behoefte die je wilt uitspreken',
        'Ademruimte nemen om te centeren'
      ]
    },
    {
      id: 'temporiseren',
      titel: 'Temporiseren Script',
      beschrijving: 'Bij te snelle intensiteit of onrust',
      duur: '30 seconden',
      categorie: 'communicatie',
      icoon: <MessageCircle className="w-5 h-5" />,
      kleur: 'text-green-600 bg-green-50 border-green-200',
      stappen: [
        '"Ik vind dit leuk, maar laten we een rustig tempo kiezen"',
        '"Ik wil dit goed doen, dus neem ik even tijd"',
        '"Dit voelt intens - mag ik even landen?"',
        'Gebruik wanneer emoties te hoog oplopen'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          🎯 Direct Toepasbare Micro-Interventies
        </h3>
        <p className="text-gray-600 text-sm">
          Kleine, krachtige oefeningen om je hechtingsstijl bewuster te maken
        </p>
      </div>

      <div className="grid gap-4">
        {formattedInterventions.map((intervention) => {
          const isActive = activeIntervention === intervention.id;
          const isRunningThis = isRunning[intervention.id] || false;
          const completedStepCount = completedSteps[intervention.id] || 0;
          const progress = (completedStepCount / intervention.stappen.length) * 100;

          return (
            <Card key={intervention.id} className={`transition-all duration-300 ${isActive ? 'ring-2 ring-pink-300 shadow-lg' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${intervention.kleur}`}>
                      {getInterventionIcon(intervention.categorie)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{intervention.titel}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {intervention.duur}
                        </Badge>
                        {completedStepCount === intervention.stappen.length && (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Voltooid
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleIntervention(intervention.id)}
                      className={isRunningThis ? 'bg-pink-50 border-pink-300' : ''}
                    >
                      {isRunningThis ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    {completedStepCount > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resetIntervention(intervention.id)}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <p className="text-gray-600 text-sm mt-2">{intervention.beschrijving}</p>

                {completedStepCount > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Voortgang</span>
                      <span>{completedStepCount}/{intervention.stappen.length}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
              </CardHeader>

              {isActive && (
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Stappen:</h4>
                    {intervention.stappen.map((stap, index) => {
                      const isCompleted = completedStepCount > index;

                      return (
                        <div
                          key={index}
                          className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                            isCompleted
                              ? 'bg-green-50 border border-green-200'
                              : 'bg-gray-50 border border-gray-200'
                          }`}
                        >
                          <button
                            onClick={() => handleStepComplete(intervention.id, index)}
                            className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                              isCompleted
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
                            }`}
                          >
                            {isCompleted ? <CheckCircle className="w-4 h-4" /> : index + 1}
                          </button>
                          <span className={`text-sm ${isCompleted ? 'text-green-800 line-through' : 'text-gray-700'}`}>
                            {stap}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Target className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Waarom Micro-Interventies?</h4>
            <p className="text-blue-800 text-sm">
              Deze kleine oefeningen zijn wetenschappelijk onderbouwd om je hechtingsstijl bewuster te maken.
              Door ze dagelijks te oefenen, bouw je nieuwe gewoontes op die beter passen bij hoe je wilt liefhebben.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}