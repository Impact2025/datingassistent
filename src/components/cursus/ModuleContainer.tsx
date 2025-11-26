'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Play, CheckCircle, Lock, Clock } from 'lucide-react';

// Mock data voor development - later vervangen door API call
const mockModule = {
  id: 1,
  slug: 'mindset-voorbereiding',
  titel: 'Goed Jezelf Kennen - De Basis',
  beschrijving: 'Ontdek wat je écht zoekt in de liefde. Waarom zelfkennis de basis is voor aantrekkelijke profielen.',
  icon: 'Brain',
  toegang_niveau: 'free',
  lessen: [
    {
      id: 1,
      slug: 'introductie-module-1',
      titel: 'Introductie Module 1: Goed Jezelf Kennen',
      beschrijving: 'Waarom zelfkennis de basis is voor aantrekkelijke profielen',
      volgorde: 1,
      duur_minuten: 15,
      is_actief: true,
      voortgang: {
        status: 'niet_gestart',
        percentage: 0
      }
    },
    {
      id: 2,
      slug: 'zelfreflectie-basis',
      titel: 'Zelfreflectie: Wat Zoek Je Echt?',
      beschrijving: 'Ontdek je diepste wensen en behoeften in relaties',
      volgorde: 2,
      duur_minuten: 20,
      is_actief: true,
      voortgang: {
        status: 'bezig',
        percentage: 50
      }
    },
    {
      id: 3,
      slug: 'authentieke-uitstraling',
      titel: 'Authentieke Uitstraling Ontwikkelen',
      beschrijving: 'Leer hoe je jezelf authentiek presenteert',
      volgorde: 3,
      duur_minuten: 25,
      is_actief: false,
      voortgang: {
        status: 'vergrendeld',
        percentage: 0
      }
    }
  ]
};

interface ModuleContainerProps {
  moduleSlug: string;
}

export function ModuleContainer({ moduleSlug }: ModuleContainerProps) {
  const [module, setModule] = useState(mockModule);
  const [loading, setLoading] = useState(false);

  // Calculate overall progress
  const totaalLessen = module.lessen.length;
  const voltooideLessen = module.lessen.filter(les => les.voortgang.status === 'voltooid').length;
  const voortgangPercentage = (voltooideLessen / totaalLessen) * 100;

  const getLesStatus = (les: any) => {
    switch (les.voortgang.status) {
      case 'voltooid':
        return { icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-50' };
      case 'bezig':
        return { icon: Play, color: 'text-blue-500', bgColor: 'bg-blue-50' };
      case 'vergrendeld':
        return { icon: Lock, color: 'text-gray-400', bgColor: 'bg-gray-50' };
      default:
        return { icon: Play, color: 'text-gray-500', bgColor: 'bg-gray-50' };
    }
  };

  const getLesButtonText = (les: any) => {
    switch (les.voortgang.status) {
      case 'voltooid':
        return 'Herhalen';
      case 'bezig':
        return 'Doorgaan';
      case 'vergrendeld':
        return 'Vergrendeld';
      default:
        return 'Starten';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/cursus">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Terug naar cursussen
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🧠</span>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {module.titel}
              </h1>
              <p className="text-gray-600 mb-4">
                {module.beschrijving}
              </p>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Voortgang</span>
                  <span>{voltooideLessen} van {totaalLessen} lessen voltooid</span>
                </div>
                <Progress value={voortgangPercentage} className="h-3" />
              </div>
            </div>
          </div>

          {/* Module stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totaalLessen}</div>
              <div className="text-sm text-gray-600">Lessen</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {module.lessen.reduce((acc, les) => acc + les.duur_minuten, 0)}
              </div>
              <div className="text-sm text-gray-600">Minuten</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {module.toegang_niveau === 'free' ? 'Gratis' : 'Premium'}
              </div>
              <div className="text-sm text-gray-600">Toegang</div>
            </div>
          </div>
        </div>
      </div>

      {/* Lessons */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Lessen in deze module</h2>

        {module.lessen.map((les, index) => {
          const status = getLesStatus(les);
          const Icon = status.icon;
          const isDisabled = les.voortgang.status === 'vergrendeld';

          return (
            <Card key={les.id} className={`transition-all duration-200 ${
              isDisabled ? 'opacity-60' : 'hover:shadow-md'
            }`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Status indicator */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${status.bgColor}`}>
                    <Icon className={`w-6 h-6 ${status.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          Les {les.volgorde}: {les.titel}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          {les.beschrijving}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {les.duur_minuten} min
                      </div>
                    </div>

                    {/* Progress for active lessons */}
                    {les.voortgang.status === 'bezig' && (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Voortgang</span>
                          <span>{les.voortgang.percentage}%</span>
                        </div>
                        <Progress value={les.voortgang.percentage} className="h-2" />
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {les.voortgang.status === 'voltooid' && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            Voltooid
                          </span>
                        )}
                        {les.voortgang.status === 'bezig' && (
                          <span className="flex items-center gap-1">
                            <Play className="w-4 h-4 text-blue-500" />
                            Bezig
                          </span>
                        )}
                      </div>

                      <Link href={`/cursus/${moduleSlug}/${les.slug}`}>
                        <Button
                          disabled={isDisabled}
                          className="min-w-[100px]"
                        >
                          {getLesButtonText(les)}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Module completion */}
      {voltooideLessen === totaalLessen && (
        <Card className="mt-8 border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-green-900 mb-2">
              Module voltooid! 🎉
            </h3>
            <p className="text-green-700 mb-4">
              Gefeliciteerd! Je hebt alle lessen in deze module voltooid.
              Je inzichten helpen je om betere dating resultaten te behalen.
            </p>
            <Link href="/cursus">
              <Button>
                Volgende module starten
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}