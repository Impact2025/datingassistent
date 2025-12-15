"use client";

import { Suspense } from 'react';



import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/providers/user-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { BottomNavigation } from '@/components/layout/bottom-navigation';
import {
  ArrowLeft,
  CreditCard,
  CheckIcon,
  Crown,
  Star,
  Zap,
  Users
} from 'lucide-react';

function MobileSubscriptionPageContent() {
  const router = useRouter();
  const { user } = useUser();
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  useEffect(() => {
    const loadCurrentSubscription = async () => {
      if (!user?.id) {
        setLoadingSubscription(false);
        return;
      }

      try {
        const response = await fetch(`/api/user/subscription?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setCurrentSubscription(data.subscription);
        }
      } catch (error) {
        console.error('Error loading subscription:', error);
      } finally {
        setLoadingSubscription(false);
      }
    };

    loadCurrentSubscription();
  }, [user?.id]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (loadingSubscription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Abonnement</h1>
            <p className="text-sm text-gray-600">Je abonnement beheren</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {currentSubscription && currentSubscription.status === 'active' ? (
          // Current Subscription Display
          <Card className="border-0 bg-gradient-to-r from-pink-50 to-pink-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center">
                  <CheckIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Actief Abonnement</h2>
                  <p className="text-gray-600">Je hebt toegang tot alle premium features</p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {currentSubscription.packageType === 'premium' && <Crown className="w-5 h-5 text-yellow-500" />}
                    {currentSubscription.packageType === 'pro' && <Star className="w-5 h-5 text-blue-500" />}
                    {currentSubscription.packageType === 'core' && <Zap className="w-5 h-5 text-green-500" />}
                    {currentSubscription.packageType === 'sociaal' && <Users className="w-5 h-5 text-gray-500" />}
                    <span className="font-semibold capitalize">{currentSubscription.packageType}</span>
                  </div>
                  <Badge className="bg-pink-100 text-pink-700">
                    {currentSubscription.billingPeriod === 'yearly' ? 'Jaarlijks' : 'Maandelijks'}
                  </Badge>
                </div>

                <div className="text-2xl font-bold text-gray-900">
                  €{(currentSubscription.amount / 100).toFixed(2)}
                  <span className="text-sm font-normal text-gray-600 ml-1">
                    per {currentSubscription.billingPeriod === 'yearly' ? 'jaar' : 'maand'}
                  </span>
                </div>

                <p className="text-sm text-gray-600">
                  Geactiveerd op {new Date(currentSubscription.startDate).toLocaleDateString('nl-NL')}
                </p>
              </div>

              <Button
                onClick={() => router.push('/select-package')}
                variant="outline"
                className="w-full mt-4"
              >
                Abonnement Aanpassen
              </Button>
            </CardContent>
          </Card>
        ) : (
          // No Active Subscription - Show Upgrade Options
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-gray-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Upgrade naar Premium</h2>
              <p className="text-gray-600 mb-6">
                Ontgrendel alle features en maximaliseer je dating succes
              </p>

              <Button
                onClick={() => router.push('/select-package')}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-purple-600 text-white"
                size="lg"
              >
                <Crown className="w-5 h-5 mr-2" />
                Bekijk Premium Pakketten
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Benefits */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Waarom Premium?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">Onbeperkte AI berichten</p>
                <p className="text-sm text-gray-600">Chat met onze AI coach wanneer je wilt</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">Alle cursus modules</p>
                <p className="text-sm text-gray-600">Direct toegang tot alle leercontent</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">Professionele foto analyse</p>
                <p className="text-sm text-gray-600">Onbeperkte foto reviews van experts</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">Live 1-op-1 coaching</p>
                <p className="text-sm text-gray-600">Persoonlijke begeleiding van experts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
}
export default function MobileSubscriptionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
      </div>
    }>
      <MobileSubscriptionPageContent />
    </Suspense>
  );
}
