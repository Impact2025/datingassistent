"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@/providers/user-provider";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { LoadingSpinner } from "../shared/loading-spinner";
import { useSearchParams, usePathname } from "next/navigation";
import { useDeviceDetection } from "@/hooks/use-device-detection";
import { logger } from '@/lib/logger';

export function LoginForm() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const hasRedirectedRef = useRef(false);
  const { isMobile } = useDeviceDetection();

  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'sent'>('email');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const plan = searchParams.get('plan');
  const billing = searchParams.get('billing');
  const orderId = searchParams.get('order_id');
  const returnUrl = searchParams.get('returnUrl');
  const prefillEmail = searchParams.get('email');
  const magicLinkError = searchParams.get('error');
  const registerUrl = plan && billing ? `/register?plan=${plan}&billing=${billing}` : '/register';

  useEffect(() => {
    if (prefillEmail) setEmail(prefillEmail);
  }, [prefillEmail]);

  // Handle order_id after payment
  useEffect(() => {
    if (!user || !orderId) return;
    fetch('/api/subscription/link-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, orderId }),
    }).catch(e => console.error('Failed to link order:', e));
  }, [user, orderId]);

  // Auto-redirect after login
  useEffect(() => {
    if (user && pathname === '/login' && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      if (returnUrl) {
        setTimeout(() => { window.location.href = returnUrl; }, 500);
        return;
      }
      const dest = isMobile ? '/mobile-dashboard' : '/dashboard';
      logger.log('Redirecting to', dest);
      setTimeout(() => { window.location.href = dest; }, 500);
    }
  }, [user, pathname, isMobile, returnUrl]);

  // Resend cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  if (user && pathname === '/login') {
    const dest = returnUrl
      ? (returnUrl.includes('onboarding') ? 'onboarding' : 'pagina')
      : (isMobile ? 'mobiele dashboard' : 'dashboard');
    return (
      <Card className="w-full max-w-md bg-card/50 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Ingelogd!</CardTitle>
          <CardDescription>Welkom terug, {user.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <LoadingSpinner />
          <p className="text-sm text-muted-foreground">
            Je wordt doorgestuurd naar je {dest}...
          </p>
        </CardContent>
      </Card>
    );
  }

  const sendMagicLink = async () => {
    const trimmed = email.trim();
    if (!trimmed.includes('@') || !trimmed.includes('.')) {
      setError('Voer een geldig e-mailadres in.');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/send-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmed,
          next: returnUrl || undefined,
        }),
      });

      if (!res.ok && res.status !== 200) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Er is iets misgegaan.');
      }

      setStep('sent');
      setResendCooldown(60);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Er is iets misgegaan.');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') sendMagicLink();
  };

  // ── Step: sent ────────────────────────────────────────────────────────────
  if (step === 'sent') {
    return (
      <Card className="w-full max-w-md bg-card/50 shadow-2xl">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">💌</div>
          <CardTitle className="text-2xl">Check je inbox</CardTitle>
          <CardDescription>
            We hebben een inloglink gestuurd naar{' '}
            <span className="font-semibold text-foreground">{email}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground space-y-1">
            <p>Klik op de link in de email om in te loggen.</p>
            <p>Geen email ontvangen? Check ook je spam.</p>
          </div>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <Button
            variant="outline"
            size="lg"
            className="w-full rounded-full"
            disabled={resendCooldown > 0 || isSending}
            onClick={sendMagicLink}
          >
            {isSending
              ? <LoadingSpinner />
              : resendCooldown > 0
                ? `Opnieuw sturen (${resendCooldown}s)`
                : 'Stuur opnieuw'
            }
          </Button>

          <button
            type="button"
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => { setStep('email'); setError(null); }}
          >
            Ander e-mailadres gebruiken
          </button>
        </CardContent>
      </Card>
    );
  }

  // ── Step: email ───────────────────────────────────────────────────────────
  return (
    <Card className="w-full max-w-md bg-card/50 shadow-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl">Jouw DatingAssistent</CardTitle>
        <CardDescription>Vind liefde met een coach die altijd voor je klaarstaat.</CardDescription>

        {orderId && (
          <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-md text-sm">
            Betaling succesvol! Log in om toegang te krijgen tot je abonnement.
          </div>
        )}
        {prefillEmail && !orderId && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-md text-sm">
            Je hebt al een account. Log in om verder te gaan.
          </div>
        )}
        {magicLinkError === 'expired_token' && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded-md text-sm">
            Je inloglink is verlopen. Vraag hieronder een nieuwe aan.
          </div>
        )}
        {(magicLinkError === 'invalid_token' || magicLinkError === 'missing_token') && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-md text-sm">
            Deze inloglink is ongeldig. Vraag een nieuwe aan.
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1.5">
            E-mailadres
          </label>
          <Input
            id="email"
            type="email"
            placeholder="jouw@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="email"
            autoCapitalize="none"
            inputMode="email"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <Button
          size="lg"
          className="w-full bg-coral-500 hover:bg-coral-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
          disabled={isSending}
          onClick={sendMagicLink}
        >
          {isSending ? <LoadingSpinner /> : 'Stuur inloglink'}
        </Button>
      </CardContent>

      <CardFooter>
        <p className="text-sm text-muted-foreground">
          Nog geen account?{" "}
          <Link href={registerUrl} className="font-semibold text-primary underline-offset-4 hover:underline">
            Registreer hier
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
