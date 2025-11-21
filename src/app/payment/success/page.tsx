"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { CheckCircle, ArrowRight, Home, User, Sparkles } from 'lucide-react';
import Link from 'next/link';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const [isProcessing, setIsProcessing] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'pending' | 'failed' | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [orderData, setOrderData] = useState<any>(null);

  const orderId = searchParams?.get('order_id');
  const mock = searchParams?.get('mock');

  useEffect(() => {
    const processPayment = async () => {
      if (!orderId) {
        setPaymentStatus('failed');
        setIsProcessing(false);
        return;
      }

      try {
        // Verify payment status
        const response = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, mock: mock === '1' }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setPaymentStatus('success');
          setUserData(data.user);
          setOrderData(data.order);

          // Clear pending order from localStorage
          localStorage.removeItem('pending_order_id');
          localStorage.removeItem('pending_transaction_id');

          // Trigger welcome email automation
          if (data.user?.id) {
            await fetch('/api/automation/welcome', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: data.user.id }),
            });
          }

          toast({
            title: "Betaling geslaagd!",
            description: "Welkom bij DatingAssistent! Je account is geactiveerd.",
          });
        } else {
          setPaymentStatus('failed');
          toast({
            title: "Betaling verificatie mislukt",
            description: data.error || "Kon betaling niet verifiëren.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setPaymentStatus('failed');
        toast({
          title: "Fout",
          description: "Er ging iets mis bij het verwerken van je betaling.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [orderId, mock, toast]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <LoadingSpinner />
        <p className="text-muted-foreground">Betaling verifiëren...</p>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="mx-auto w-full max-w-2xl p-4 sm:p-6 lg:p-8">
        <Card className="rounded-2xl bg-card shadow-2xl">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold">Betaling mislukt</h2>
              <p className="text-muted-foreground text-base max-w-md">
                Er ging iets mis bij het verwerken van je betaling. Neem contact op met onze support als je vragen hebt.
              </p>
            </div>
            <div className="flex gap-4">
              <Link href="/">
                <Button variant="outline">
                  <Home className="w-4 h-4 mr-2" />
                  Naar home
                </Button>
              </Link>
              <Link href="/contact">
                <Button>
                  Contact opnemen
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 lg:p-8">
      <div className="space-y-4">
        {/* Compact Success Header */}
        <Card className="rounded-2xl bg-card shadow-2xl">
          <CardContent className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold">Welkom bij DatingAssistent!</h2>
              <p className="text-muted-foreground text-sm max-w-sm">
                Je betaling is succesvol verwerkt. Je account is nu geactiveerd en je hebt toegang tot al je tools.
              </p>
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
                <p className="text-pink-800 font-medium text-sm text-center">
                  Profiel Compleet Maken
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Completion Button - Immediately Visible */}
        <Card className="rounded-xl bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2 text-pink-900">Start nu met je profiel</h3>
            <p className="text-sm text-pink-700 mb-4">
              Maak je profiel compleet voor persoonlijk advies van je AI coach
            </p>
            <button
              onClick={() => router.push('/register/profile')}
              className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-colors"
            >
              <User className="w-4 h-4 mr-2" />
              Profiel Compleet Maken
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </CardContent>
        </Card>

        {/* Order Details */}
        {orderData && (
          <Card>
            <CardHeader>
              <CardTitle>Besteloverzicht</CardTitle>
              <CardDescription>Order #{orderData.id}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">{orderData.package_type} abonnement</span>
                <span className="font-semibold">€{(orderData.amount / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Betaalmethode</span>
                <span>{orderData.payment_provider || 'MultiSafePay'}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Status</span>
                <span className="text-green-600 font-medium">Betaald</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Journey Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-pink-600" />
              Wat gebeurt er nu?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-100">
                <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-pink-600 font-semibold text-xs">1</span>
                </div>
                <div>
                  <p className="font-medium text-pink-900">Profiel compleet maken</p>
                  <p className="text-xs text-pink-700">Persoonlijke AI coaching</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-semibold text-xs">2</span>
                </div>
                <div>
                  <p className="font-medium text-purple-900">AI coach ontmoeten</p>
                  <p className="text-xs text-purple-700">Gepersonaliseerd advies</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-100">
                <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-pink-600 font-semibold text-xs">3</span>
                </div>
                <div>
                  <p className="font-medium text-pink-900">Doelen stellen</p>
                  <p className="text-xs text-pink-700">Dating succes plannen</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Note */}
        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertDescription>
            <strong>Belangrijk:</strong> Maak eerst je profiel compleet met je persoonlijke gegevens.
            Daarna start je de AI-coach scan om direct gepersonaliseerd advies te krijgen.
          </AlertDescription>
        </Alert>

        {/* Quick actions section completely removed */}

        {/* Support */}
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Vragen?</strong> Neem contact op met ons support team via de chat of email support@datingassistent.nl
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <LoadingSpinner />
        <p className="text-muted-foreground">Betaling verifiëren...</p>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}