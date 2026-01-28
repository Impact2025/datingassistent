'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, MessageCircle, CalendarHeart, Lock, Play, User as UserIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Mock data - In a real app, this would come from an API
const mockModules = [
  {
    id: 1,
    slug: 'mindset-voorbereiding',
    titel: 'Goed Jezelf Kennen - De Basis',
    beschrijving: 'Ontdek wat je écht zoekt in de liefde. Waarom zelfkennis de basis is voor aantrekkelijke profielen.',
    icon: 'Brain',
    toegangNiveau: 'free',
    duur: '25 min',
    lessen: 5,
    isActief: true,
  },
  {
    id: 2,
    slug: 'profiel-optimalisatie',
    titel: 'Profiel van Onzichtbaar naar Onweerstaanbaar',
    beschrijving: 'Transformeer je dating profiel van onzichtbaar naar onweerstaanbaar met bewezen technieken.',
    icon: 'UserIcon',
    toegangNiveau: 'free',
    duur: '45 min',
    lessen: 8,
    isActief: true,
  },
  {
    id: 3,
    slug: 'gesprekken-masterclass',
    titel: 'Gesprekken van Awkward naar Awesome',
    beschrijving: 'Leer hoe je van eerste bericht naar diepgaande gesprekken gaat. Van opener tot eerste date.',
    icon: 'MessageCircle',
    toegangNiveau: 'pro',
    duur: '1 uur',
    lessen: 10,
    isActief: true,
  },
  {
    id: 4,
    slug: 'date-planning-expert',
    titel: 'Date Planning voor Succesvolle Ontmoetingen',
    beschrijving: 'Plan perfecte dates die leiden tot tweede dates. Van locatie keuze tot gespreksonderwerpen.',
    icon: 'CalendarHeart',
    toegangNiveau: 'pro',
    duur: '30 min',
    lessen: 6,
    isActief: false,
  },
];

// Icon mapping for professional and consistent icons
const iconMap = {
  Brain,
  UserIcon,
  MessageCircle,
  CalendarHeart,
};

type IconName = keyof typeof iconMap;

const ModuleCard = ({ module }: { module: typeof mockModules[0] }) => {
  const IconComponent = iconMap[module.icon as IconName] || Brain;
  const isLocked = module.toegangNiveau !== 'free';
  const isBinnenkort = !module.isActief;

  return (
    <Card className={`
      bg-white border border-gray-200 rounded-xl shadow-sm 
      transition-all duration-300 ease-in-out
      flex flex-col
      ${isBinnenkort 
        ? 'cursor-not-allowed' 
        : 'hover:shadow-lg hover:border-coral-200 hover:-translate-y-1'}
    `}>
      <CardContent className="p-6 flex flex-col flex-grow">
        <div className="flex items-start gap-4">
          <div className={`
            w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0
            ${isBinnenkort ? 'bg-gray-100' : 'bg-coral-50'}
          `}>
            <IconComponent className={`
              w-6 h-6 
              ${isBinnenkort ? 'text-gray-400' : 'text-coral-600'}
            `} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h3 className={`
                font-semibold text-lg
                ${isBinnenkort ? 'text-gray-400' : 'text-gray-900'}
              `}>
                {module.titel}
              </h3>
              {isBinnenkort && (
                <Badge variant="outline" className="bg-gray-100 text-gray-500 border-gray-200 ml-2">
                  Binnenkort
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <p className={`mt-3 text-sm flex-grow ${isBinnenkort ? 'text-gray-400' : 'text-gray-600'}`}>
          {module.beschrijving}
        </p>

        <div className="flex items-center gap-4 text-xs text-gray-500 mt-4 pt-4 border-t border-gray-100">
          <span className="flex items-center gap-1.5">
            <Play className="w-3 h-3" />
            {module.lessen} lessen
          </span>
          <span>•</span>
          <span>{module.duur}</span>
        </div>
      </CardContent>

      <div className="px-6 pb-6 pt-0">
        {isBinnenkort ? (
          <Button size="sm" disabled className="w-full bg-gray-200 text-gray-500">
            Binnenkort beschikbaar
          </Button>
        ) : isLocked ? (
          <Button size="sm" variant="secondary" className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800">
            <Lock className="w-4 h-4 mr-2" />
            Upgrade naar Pro
          </Button>
        ) : (
          <Link href={`/cursus/${module.slug}`} className="w-full">
            <Button size="sm" className="w-full bg-coral-600 hover:bg-coral-700">
              Start Cursus
            </Button>
          </Link>
        )}
      </div>
    </Card>
  );
};


export function CursusOverzicht() {
  const gratisModules = mockModules.filter(m => m.toegangNiveau === 'free');
  const premiumModules = mockModules.filter(m => m.toegangNiveau !== 'free');

  return (
    <div className="space-y-12">
      {/* Gratis Starter Cursussen */}
      <div>
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Gratis Cursussen</h2>
          <p className="text-gray-600 mt-1">
            Begin hier je reis met onze essentiële basismodules.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {gratisModules.map(module => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>
      </div>

      {/* Premium Cursussen */}
      <div>
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Premium Cursussen</h2>
          <p className="text-gray-600 mt-1">
            Ontgrendel diepgaande strategieën en word een meester in daten.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {premiumModules.map(module => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>
      </div>
    </div>
  );
}
