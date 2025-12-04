"use client";

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@/providers/user-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, User, Key } from 'lucide-react';
import { trackPurchase, setUserProperties } from '@/lib/analytics/ga4-events';

export function PaymentSuccessClientComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, userProfile, login, refreshUser } = useUser();
  const [isVerifying, setIsVerifying] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Betaling verwerken...');
  const [autoCreatedAccount, setAutoCreatedAccount] = useState<{email: string, tempPassword: string} | null>(null);
  const [showPasswordInfo, setShowPasswordInfo] = useState(false);
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

      // User not logged in - auto-create account and login
      console.log('🔄 No user logged in, auto-creating account from order');
      setStatusMessage('Je betaling verwerken en account aanmaken...');

      try {
        const response = await fetch('/api/auth/auto-create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ orderId }),
        });

        const data = await response.json();

        if (!response.ok) {
          // If auto-create fails, show friendly message and redirect to login
          console.error('⚠️ Auto-create failed:', data.error);

          // Check if it's because account already exists
          if (data.error && data.error.includes('already exists')) {
            setStatusMessage('Je account bestaat al. Log in om verder te gaan!');
          } else {
            setStatusMessage('Betaling ontvangen! Log in of maak een account aan.');
          }

          setIsVerifying(false);

          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push(`/login?order_id=${orderId}`);
          }, 3000);
          return;
        }

        console.log('✅ Account created/linked:', data);

        // If it's a new account, auto-login
        if (data.isNewAccount && data.tempPassword) {
          console.log('🔐 Auto-logging in with temp password...');
          setStatusMessage('Inloggen...');

          try {
            await login(data.user.email, data.tempPassword);
            console.log('✅ Auto-login successful');

            // Store temp password info so user knows they should change it
            localStorage.setItem('needs_password_change', 'true');

            // Clear pending order
            localStorage.removeItem('pending_order_id');
            localStorage.removeItem('pending_transaction_id');

            // Track purchase in GA4
            await trackPurchaseEvent(data.user.id);

            setStatusMessage('Welkom bij DatingAssistent! 🎉');

            // Redirect to dashboard
            setTimeout(() => {
              router.push('/dashboard');
            }, 1500);
            return;
          } catch (loginError) {
            console.error('❌ Auto-login failed:', loginError);
            // Store credentials for manual login
            setAutoCreatedAccount({
              email: data.user.email,
              tempPassword: data.tempPassword,
            });
            setStatusMessage('Account aangemaakt! Log in om te beginnen.');
            setIsVerifying(false);
            return;
          }
        } else {
          // Existing account - redirect to login with order_id
          console.log('ℹ️ Existing account found, redirecting to login');
          setStatusMessage('Account gevonden! Log in om je abonnement te activeren.');
          setIsVerifying(false);

          setTimeout(() => {
            router.push(`/login?order_id=${orderId}`);
          }, 2000);
        }
      } catch (error) {
        console.error('❌ Failed to auto-create account:', error);
        // Fallback to login page
        setStatusMessage('Betaling geslaagd! Log in om je abonnement te activeren.');
        setIsVerifying(false);

        setTimeout(() => {
          router.push(`/login?order_id=${orderId}`);
        }, 2000);
      }
    };

    handleRedirect();
  }, [user, router, orderId, transactionId, login, refreshUser]);

  if (isVerifying) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <LoadingSpinner />
            <p className="mt-4 text-muted-foreground">{statusMessage}</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  // If auto-created account but login failed, show credentials
  if (autoCreatedAccount) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Account Aangemaakt!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Je betaling is succesvol verwerkt en je account is aangemaakt.
            </p>
            
            <Alert>
              <AlertDescription className="flex items-start">
                <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>
                  Je ontvangt een e-mail met je inloggegevens. Bewaar deze op een veilige plek.
                </span>
              </AlertDescription>
            </Alert>
            
            <div className="bg-muted p-4 rounded-lg text-left space-y-3">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="font-medium">E-mailadres:</span>
              </div>
              <p className="ml-6">{autoCreatedAccount.email}</p>
              
              <div className="flex items-center mt-3">
                <Key className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="font-medium">Tijdelijk wachtwoord:</span>
              </div>
              <p className="ml-6 font-mono">{autoCreatedAccount.tempPassword}</p>
              
              <Button 
                variant="link" 
                className="p-0 h-auto mt-2"
                onClick={() => setShowPasswordInfo(!showPasswordInfo)}
              >
                {showPasswordInfo ? 'Verberg details' : 'Waarom een tijdelijk wachtwoord?'}
              </Button>
              
              {showPasswordInfo && (
                <p className="text-sm text-muted-foreground mt-2 ml-6">
                  Voor je veiligheid hebben we een sterk wachtwoord gegenereerd. 
                  Je kunt dit wijzigen in je profielinstellingen na het inloggen.
                </p>
              )}
            </div>
            
            <Button
              onClick={() => router.push('/login')}
              className="w-full"
            >
              Ga naar Login
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Betaling Geslaagd!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            {statusMessage || 'Je betaling is verwerkt. Log in om je DatingAssistent te starten!'}
          </p>
          {orderId && (
            <p className="text-sm text-muted-foreground">
              Order ID: {orderId}
            </p>
          )}
          <div className="space-y-2 pt-4">
            <Button
              onClick={() => router.push('/login')}
              className="w-full"
            >
              Ga naar Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}