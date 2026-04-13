"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/providers/user-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckIcon,
  Calendar,
  BookOpen,
  ExternalLink,
  Zap,
  Star,
  Crown,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { LoadingSpinner } from '@/components/shared/loading-spinner';

const PROGRAMS = [
  {
    slug: 'kickstart',
    name: 'De Kickstart',
    tagline: 'Voor de snelle start',
    duration: '21 dagen toegang',
    price: 47,
    priceOriginal: 97,
    icon: <Zap className="w-5 h-5" />,
    color: 'blue',
    features: [
      '21-Dagen Profiel Challenge (Video Cursus)',
      'AI Foto Check: Onbeperkt scannen',
      'Bio Builder: Laat AI je tekst schrijven',
      'Werkboek: Checklists & Templates',
      'Toegang tot Chat Coach',
    ],
    featured: false,
  },
  {
    slug: 'transformatie',
    name: 'De Transformatie',
    tagline: 'De complete opleiding tot succesvol daten',
    duration: '90 dagen toegang',
    price: 147,
    priceOriginal: 297,
    icon: <Star className="w-5 h-5" />,
    color: 'coral',
    features: [
      'Alles uit Kickstart',
      'Complete Videocursus (12 Modules in 3 Fases)',
      'Pro AI Suite (Onbeperkt)',
      '24/7 Chat Coach (Screenshots uploaden)',
      '3x Live Q&A Sessies met het team',
    ],
    featured: true,
  },
  {
    slug: 'vip-reis',
    name: 'De VIP Reis',
    tagline: 'Persoonlijke 1-op-1 begeleiding',
    duration: '180 dagen toegang',
    price: 797,
    priceOriginal: 997,
    icon: <Crown className="w-5 h-5" />,
    color: 'purple',
    features: [
      'Alles uit Transformatie',
      'Persoonlijke Intake (60 min) via video',
      '6x Maandelijkse 1-op-1 Calls',
      'WhatsApp Support: Directe lijn met coach',
      'Levenslang toegang tot cursusmateriaal',
    ],
    featured: false,
  },
];

export function SubscriptionTab() {
  const router = useRouter();
  const { user } = useUser();
  const [enrolledPrograms, setEnrolledPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    fetch('/api/user/enrolled-programs', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('datespark_auth_token')}`,
      },
    })
      .then((r) => r.ok ? r.json() : { programs: [] })
      .then((data) => setEnrolledPrograms(data.programs || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  const enrolledSlugs = new Set(enrolledPrograms.map((p: any) => p.program_slug));

  return (
    <div className="space-y-6">
      {/* Enrolled programs */}
      {enrolledPrograms.length > 0 && (
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-blue-900 dark:text-blue-100">Mijn Programma&apos;s</CardTitle>
                <CardDescription className="text-blue-700 dark:text-blue-300">
                  Je hebt toegang tot de volgende programma&apos;s
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {enrolledPrograms.map((program: any) => (
              <div
                key={program.program_id}
                className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold dark:text-white">
                      {program.program_name || program.program_slug}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge
                        variant={program.status === 'active' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {program.status === 'active' ? 'Actief' : program.status}
                      </Badge>
                      {program.enrolled_at && (
                        <span>
                          Gestart {new Date(program.enrolled_at).toLocaleDateString('nl-NL')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const slug = program.program_slug;
                    if (slug === 'kickstart') router.push('/kickstart');
                    else if (slug === 'transformatie') router.push('/transformatie');
                    else router.push(`/cursus/${slug}`);
                  }}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Program cards */}
      <div>
        <h2 className="text-xl font-bold mb-1">
          {enrolledPrograms.length > 0 ? 'Upgrade je programma' : 'Kies je programma'}
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Eenmalige betaling — geen abonnement, geen verborgen kosten
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          {PROGRAMS.map((program) => {
            const isEnrolled = enrolledSlugs.has(program.slug);
            return (
              <Card
                key={program.slug}
                className={`relative flex flex-col ${
                  program.featured
                    ? 'border-coral-400 dark:border-coral-600 ring-2 ring-coral-300/40'
                    : 'border-border'
                }`}
              >
                {program.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-coral-500 to-coral-600 text-white px-3 py-1">
                      Onze Aanrader
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 mb-1">
                    {program.icon}
                    <CardTitle className="text-base">{program.name}</CardTitle>
                  </div>
                  <CardDescription className="text-xs">{program.tagline}</CardDescription>
                  <Badge variant="outline" className="w-fit text-xs mt-1">
                    {program.duration}
                  </Badge>
                </CardHeader>

                <CardContent className="flex flex-col flex-1 gap-4">
                  <div className="text-center">
                    <span className="text-sm text-muted-foreground line-through">
                      €{program.priceOriginal}
                    </span>
                    <div className="text-3xl font-bold">€{program.price}</div>
                    <span className="text-xs text-muted-foreground">eenmalig</span>
                  </div>

                  <ul className="space-y-1.5 flex-1">
                    {program.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs">
                        <CheckIcon className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="space-y-2">
                    {isEnrolled ? (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          if (program.slug === 'kickstart') router.push('/kickstart');
                          else if (program.slug === 'transformatie') router.push('/transformatie');
                          else router.push(`/cursus/${program.slug}`);
                        }}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Ga naar programma
                      </Button>
                    ) : (
                      <Button
                        className={`w-full ${program.featured ? 'bg-coral-500 hover:bg-coral-600 text-white' : ''}`}
                        variant={program.featured ? 'default' : 'outline'}
                        onClick={() => router.push(`/checkout/${program.slug}`)}
                      >
                        Start nu
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Guarantee */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-2">
        <Shield className="w-4 h-4" />
        <span>30 dagen niet-goed-geld-terug garantie op alle programma&apos;s</span>
      </div>
    </div>
  );
}
