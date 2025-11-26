'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, User, MessageCircle, Camera, Target, Heart } from 'lucide-react';

interface IntegratieHubProps {
  sessionId: number;
  onComplete: () => void;
}

export function IntegratieHub({ sessionId, onComplete }: IntegratieHubProps) {
  const [completedIntegrations, setCompletedIntegrations] = useState<string[]>([]);
  const router = useRouter();

  const integrations = [
    {
      id: 'profiel_coach',
      name: 'Profiel Coach',
      icon: <Camera className="w-6 h-6 text-blue-500" />,
      description: 'Bio suggesties gebaseerd op jouw kernwaarden',
      benefits: [
        'Profieltekst die je authenticiteit uitstraalt',
        'Foto suggesties die passen bij je waarden',
        'Highlights van wat jou uniek maakt'
      ],
      route: '/profiel'
    },
    {
      id: 'chat_coach',
      name: 'Chat Coach',
      icon: <MessageCircle className="w-6 h-6 text-green-500" />,
      description: 'Gesprekstips die aansluiten bij je communicatiestijl',
      benefits: [
        'Openers die passen bij je humor en diepgang',
        'Rode vlag detectie in gesprekken',
        'Diepere connecties door waarde-gedreven gesprekken'
      ],
      route: '/chat'
    },
    {
      id: 'match_analyse',
      name: 'Match Analyse',
      icon: <User className="w-6 h-6 text-purple-500" />,
      description: 'Profielen scannen op compatibiliteit met je waarden',
      benefits: [
        'Snellere herkenning van goede matches',
        'Vroegtijdige detectie van rode vlaggen',
        'Betere beslissingen over wie te daten'
      ],
      route: '/tools'
    },
    {
      id: 'date_planner',
      name: 'Date Planner',
      icon: <Heart className="w-6 h-6 text-pink-500" />,
      description: 'Date ideeën die passen bij je lifestyle voorkeuren',
      benefits: [
        'Activiteiten die je energie geven',
        'Settings die passen bij je comfort zone',
        'Betere eerste indrukken door goede matching'
      ],
      route: '/date-planner'
    },
    {
      id: 'opener_lab',
      name: 'Opener Lab',
      icon: <Target className="w-6 h-6 text-orange-500" />,
      description: 'Openingszinnen die je persoonlijkheid weerspiegelen',
      benefits: [
        'Authentieke eerste berichten',
        'Hogere response rates door echtheid',
        'Betere eerste gesprekken'
      ],
      route: '/tools'
    }
  ];

  const handleIntegrationClick = (integrationId: string, route: string) => {
    // Mark as completed
    setCompletedIntegrations(prev => [...prev, integrationId]);

    // Navigate to the tool on the same page
    router.push(route);
  };

  const handleComplete = async () => {
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
          action: 'complete_session'
        }),
      });

      if (response.ok) {
        onComplete();
      }
    } catch (error) {
      console.error('Error completing session:', error);
    }
  };

  const completedCount = completedIntegrations.length;
  const totalCount = integrations.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="text-center">
        <CardContent className="pt-8 pb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Integratie in Jouw Dating Tools
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Nu je je Waarden Kompas hebt, laten we het integreren in al je dating tools.
            Dit zorgt ervoor dat elke tool rekening houdt met wat jij écht belangrijk vindt.
          </p>
        </CardContent>
      </Card>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Integratie Voortgang</h2>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {completedCount}/{totalCount} geïntegreerd
            </Badge>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((integration) => {
          const isCompleted = completedIntegrations.includes(integration.id);

          return (
            <Card
              key={integration.id}
              className={`transition-all duration-200 ${
                isCompleted
                  ? 'border-green-200 bg-green-50/50'
                  : 'hover:border-purple-200 hover:shadow-md cursor-pointer'
              }`}
              onClick={() => !isCompleted && handleIntegrationClick(integration.id, integration.route)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {integration.icon}
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                  </div>
                  {isCompleted && (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  )}
                </div>
                <p className="text-gray-600 text-sm">{integration.description}</p>
              </CardHeader>

              <CardContent>
                <ul className="space-y-2 mb-4">
                  {integration.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-green-600 mt-1">•</span>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    isCompleted
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                  } text-white`}
                  disabled={isCompleted}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Geïntegreerd
                    </>
                  ) : (
                    <>
                      Bekijken & Integreren
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Completion Card */}
      {completedCount === totalCount && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Perfect! Jouw Waarden Kompas is Nu Actief
            </h2>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Alle tools houden nu rekening met jouw kernwaarden. Je dating beslissingen worden voortaan
              gebaseerd op wat jij écht belangrijk vindt, wat leidt tot betere matches en meer voldoening.
            </p>

            <div className="bg-white/50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Wat gebeurt er nu?</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>✅ Profiel Coach gebruikt je waarden voor bio suggesties</li>
                <li>✅ Chat Coach detecteert rode vlaggen in gesprekken</li>
                <li>✅ Match Analyse beoordeelt compatibiliteit</li>
                <li>✅ Date Planner stelt waarde-gedreven dates voor</li>
                <li>✅ Opener Lab genereert authentieke openingszinnen</li>
              </ul>
            </div>

            <Button
              onClick={handleComplete}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-8 py-3"
              size="lg"
            >
              Start met Waarde-Gedreven Dating
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Help Text */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 text-sm">💡</span>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Hoe werkt de integratie?</h4>
              <p className="text-sm text-blue-800">
                Klik op elke tool om te zien hoe jouw Waarden Kompas wordt toegepast.
                De tools krijgen context over jouw kernwaarden en passen hun suggesties daarop aan.
                Dit gebeurt automatisch - je hoeft alleen maar de tools te gebruiken zoals normaal.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}