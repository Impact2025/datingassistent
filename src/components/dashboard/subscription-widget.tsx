"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  CheckIcon,
  BookOpen,
  Calendar,
  ExternalLink,
  CreditCard,
  Sparkles
} from 'lucide-react';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { motion } from 'framer-motion';

interface SubscriptionWidgetProps {
  userId?: number;
}

export function SubscriptionWidget({ userId }: SubscriptionWidgetProps) {
  const router = useRouter();
  const [enrolledPrograms, setEnrolledPrograms] = useState<any[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  // Load enrolled programs and subscription
  useEffect(() => {
    const loadData = async () => {
      if (!userId) {
        setLoadingPrograms(false);
        setLoadingSubscription(false);
        return;
      }

      try {
        // Load enrolled programs and subscription in parallel
        const [programsResponse, subResponse] = await Promise.all([
          fetch('/api/user/enrolled-programs', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('datespark_auth_token')}`
            }
          }),
          fetch(`/api/user/subscription?userId=${userId}`)
        ]);

        if (programsResponse.ok) {
          const programsData = await programsResponse.json();
          setEnrolledPrograms(programsData.programs || []);
        }

        if (subResponse.ok) {
          const data = await subResponse.json();
          setCurrentSubscription(data.subscription);
        }
      } catch (error) {
        console.error('Error loading subscription data:', error);
      } finally {
        setLoadingPrograms(false);
        setLoadingSubscription(false);
      }
    };

    loadData();
  }, [userId]);

  if (loadingPrograms || loadingSubscription) {
    return (
      <Card className="border-pink-100 dark:border-pink-800">
        <CardContent className="flex items-center justify-center py-8">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  const hasActiveSubscription = currentSubscription && currentSubscription.status === 'active';
  const hasEnrolledPrograms = enrolledPrograms.length > 0;

  // Don't show widget if no subscription and no programs
  if (!hasActiveSubscription && !hasEnrolledPrograms) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="space-y-4"
    >
      {/* Enrolled Programs Section */}
      {hasEnrolledPrograms && (
        <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-blue-900 dark:text-blue-100">Mijn Programma's</CardTitle>
                <CardDescription className="text-blue-700 dark:text-blue-300">
                  Je hebt toegang tot de volgende programma's
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard?tab=subscription')}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <Sparkles className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {enrolledPrograms.map((program) => (
              <div
                key={program.program_id}
                className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  if (program.program_slug === 'kickstart') {
                    router.push('/kickstart');
                  } else if (program.program_slug === 'transformatie') {
                    router.push('/transformatie');
                  } else {
                    router.push(`/cursus/${program.program_slug}`);
                  }
                }}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold dark:text-white">{program.program_name || 'Programma'}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant={program.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                        {program.status === 'active' ? 'Actief' : program.status}
                      </Badge>
                      {program.enrolled_at && (
                        <span className="text-xs">Gestart {new Date(program.enrolled_at).toLocaleDateString('nl-NL')}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {program.program_type === 'kickstart' && (
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        Dag {program.next_day || 1}/21
                      </div>
                    </div>
                  )}
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Active Subscription Section */}
      {hasActiveSubscription && (
        <Card className="border-pink-200 dark:border-pink-800 bg-gradient-to-br from-pink-50/50 to-rose-50/50 dark:from-pink-900/20 dark:to-rose-900/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/50 rounded-full flex items-center justify-center">
                <CheckIcon className="w-5 h-5 text-pink-600 dark:text-pink-400" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-pink-900 dark:text-pink-100">Abonnement</CardTitle>
                <CardDescription className="text-pink-700 dark:text-pink-300">
                  Je hebt toegang tot alle premium features
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard?tab=subscription')}
                className="text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300"
              >
                Details
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                <div>
                  <h3 className="font-semibold dark:text-white">{currentSubscription.packageType} Abonnement</h3>
                  <p className="text-sm text-muted-foreground">
                    Geactiveerd op {new Date(currentSubscription.startDate).toLocaleDateString('nl-NL')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold dark:text-white">
                  €{(currentSubscription.amount / 100).toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">
                  per {currentSubscription.billingPeriod === 'yearly' ? 'jaar' : 'maand'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Subscription CTA - Only show if no subscription but has programs */}
      {!hasActiveSubscription && hasEnrolledPrograms && (
        <Card className="border-dashed border-2 border-gray-300 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <CardContent className="text-center py-6">
            <Heart className="w-8 h-8 mx-auto mb-3 text-pink-500" />
            <h3 className="font-semibold mb-2 dark:text-white">Voeg een abonnement toe</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Krijg toegang tot AI coaching, profiel analyse en meer
            </p>
            <Button
              onClick={() => router.push('/dashboard?tab=subscription')}
              className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
            >
              Bekijk Abonnementen
            </Button>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
