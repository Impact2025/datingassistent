"use client";

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@/providers/user-provider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { CheckCircle, Sparkles, ArrowRight, Mail, Rocket } from 'lucide-react';
import { trackPurchase, setUserProperties } from '@/lib/analytics/ga4-events';
import Image from 'next/image';

export function PaymentSuccessClientComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, refreshUser } = useUser();
  const [isVerifying, setIsVerifying] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Betaling verwerken...');
  const hasTrackedPurchase = useRef(false);
  const orderId = searchParams?.get('order_id') || '';
  const transactionId = searchParams?.get('transactionid') || '';

  // Helper to track purchase event
  const trackPurchaseEvent = async (userId: number | string) => {
    if (hasTrackedPurchase.current || !orderId) return;
    hasTrackedPurchase.current = true;

    try {
      // Fetch order details for accurate tracking
      const response = await fetch(`/api/payment/verify?orderId=${orderId}`);
      if (response.ok) {
        const orderData = await response.json();

        trackPurchase({
          transaction_id: orderId,
          plan_id: orderData.packageType || 'unknown',
          plan_name: orderData.packageName || orderData.packageType || 'Subscription',
          price: (orderData.amount || 0) / 100,
          billing_cycle: orderData.billingPeriod,
          currency: 'EUR',
          coupon: orderData.couponCode,
        });

        // Update user properties with subscription tier
        setUserProperties({
          user_id: userId.toString(),
          subscription_tier: orderData.packageType || 'pro',
        });

        console.log('✅ GA4 Purchase event tracked:', orderId);
      }
    } catch (error) {
      console.error('Failed to track purchase:', error);
    }
  };

  useEffect(() => {
    const handleRedirect = async () => {
      console.log('💳 Payment success - Order ID:', orderId);

      if (!orderId) {
        console.error('❌ No order ID provided');
        setIsVerifying(false);
        return;
      }

      // Save order info to localStorage for the registration process
      localStorage.setItem('pending_order_id', orderId);
      if (transactionId) {
        localStorage.setItem('pending_transaction_id', transactionId);
      }
      console.log('💾 Saved order info to localStorage');

      // Check if user is already logged in
      if (user) {
        console.log('✅ User already logged in, linking order to existing account');
        setStatusMessage('Order koppelen aan je account...');
        try {
          const response = await fetch('/api/orders/link', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.id,
              orderId: orderId,
            }),
          });

          if (response.ok) {
            console.log('✅ Order linked successfully');
            await refreshUser();
            // Clear localStorage
            localStorage.removeItem('pending_order_id');
            localStorage.removeItem('pending_transaction_id');

            // Track purchase in GA4
            await trackPurchaseEvent(user.id);

            setStatusMessage('Abonnement geactiveerd! Doorsturen naar dashboard...');
            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
              router.push('/dashboard');
            }, 2000);
            return;
          }
        } catch (error) {
          console.error('❌ Failed to link order:', error);
        }
      }

      // User not logged in - redirect to registration to create proper account
      console.log('🔄 No user logged in, redirecting to registration with order_id');
      setStatusMessage('Betaling geslaagd! Account aanmaken om te starten...');
      setIsVerifying(false);

      // Redirect to registration page with order_id
      // User will complete registration, email verification, and profile setup
      // Order will be linked after successful registration
      setTimeout(() => {
        router.push(`/register?order_id=${orderId}`);
      }, 2000);
    };

    handleRedirect();
  }, [user, router, orderId, transactionId, refreshUser]);

  // Show loading or success state
  if (isVerifying) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 border-pink-100 shadow-xl">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center">
              <LoadingSpinner />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Even geduld...</h2>
              <p className="text-gray-600">{statusMessage}</p>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-white">
      {/* Header with Logo */}
      <div className="pt-8 pb-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold">
            <span className="text-pink-500">Dating</span>
            <span className="text-gray-800">Assistent</span>
          </span>
        </div>
      </div>

      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-lg space-y-6">
          {/* Main Success Card */}
          <Card className="border-2 border-pink-200 shadow-xl bg-white overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 pt-8 pb-6 text-center">
              <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Gefeliciteerd!</h1>
              <p className="text-lg text-gray-600">Je betaling is succesvol voltooid!</p>
            </div>

            <CardContent className="pt-6 pb-8 space-y-6">
              {/* Kickstart Badge */}
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200 text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Kickstart geactiveerd</span>
                </div>
              </div>

              {/* Order Details */}
              {orderId && (
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">Bevestigingsnummer:</p>
                  <p className="font-mono font-semibold text-gray-900">{orderId}</p>
                </div>
              )}

              {/* What's Next */}
              <div className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl p-5 border border-pink-100">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                    <Rocket className="w-4 h-4 text-pink-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Wat gebeurt er nu?</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Kickstart is klaar om te starten</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Je ontvangt een bevestigingsmail met alle details</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Start direct met dag 1 van je transformatie!</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <Button
                onClick={() => router.push('/kickstart')}
                className="w-full bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white py-6 text-lg font-semibold rounded-xl shadow-lg"
              >
                Start met Kickstart
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              {/* Support */}
              <p className="text-center text-sm text-gray-500">
                Vragen? Mail ons op{' '}
                <a href="mailto:support@datingassistent.nl" className="text-pink-600 hover:underline">
                  support@datingassistent.nl
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}