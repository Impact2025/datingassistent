"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUser } from "@/providers/user-provider";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "../shared/loading-spinner";
import { useSearchParams, usePathname } from "next/navigation";
import { useTurnstile } from "../shared/turnstile";
import { useDeviceDetection } from "@/hooks/use-device-detection";
import { trackLogin, setUserProperties } from "@/lib/analytics/ga4-events";
import { logger } from '@/lib/logger';
import { safeStorage } from "@/lib/safe-storage";

// ─── Schemas ────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email("Ongeldig e-mailadres."),
  password: z.string().min(1, "Wachtwoord is vereist."),
});

const otpEmailSchema = z.object({
  email: z.string().email("Ongeldig e-mailadres."),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type OtpEmailFormValues = z.infer<typeof otpEmailSchema>;

// ─── OTP Code Input ──────────────────────────────────────────────────────────

function OtpCodeInput({
  userId,
  onSuccess,
}: {
  userId: number;
  onSuccess: () => void;
}) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (value && index === 5 && next.every(d => d !== '')) {
      verifyCode(next.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '');
    if (pasted.length === 6) {
      setDigits(pasted.split(''));
      inputRefs.current[5]?.focus();
      verifyCode(pasted);
    }
  };

  const verifyCode = async (code: string) => {
    if (isVerifying) return;
    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/verify-login-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Persist token in localStorage so UserProvider can pick it up
        if (data.token) {
          safeStorage.setItem('datespark_auth_token', data.token);
          logger.log('Token saved to localStorage after OTP login');
        }
        onSuccess();
      } else {
        setError(data.error || 'Verificatie mislukt. Probeer het opnieuw.');
      }
    } catch {
      setError('Netwerkfout. Probeer het opnieuw.');
    } finally {
      setIsVerifying(false);
    }
  };

  const fullCode = digits.join('');

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}
      <div className="flex justify-center gap-2" onPaste={handlePaste}>
        {digits.map((digit, i) => (
          <Input
            key={i}
            ref={el => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            disabled={isVerifying}
            className="w-11 h-12 text-center text-lg font-semibold focus:border-coral-500 focus:ring-coral-500 focus:ring-2"
          />
        ))}
      </div>
      <Button
        type="button"
        size="lg"
        className="w-full bg-coral-500 hover:bg-coral-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
        disabled={isVerifying || fullCode.length !== 6}
        onClick={() => verifyCode(fullCode)}
      >
        {isVerifying ? <LoadingSpinner /> : 'Inloggen met code'}
      </Button>
    </div>
  );
}

// ─── Main LoginForm ──────────────────────────────────────────────────────────

export function LoginForm() {
  const { login, user } = useUser();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const hasRedirectedRef = useRef(false);
  const { isMobile } = useDeviceDetection();

  // OTP mode state — default to Inlogcode (magic link) tab
  const [otpMode, setOtpMode] = useState(true);
  const [otpStep, setOtpStep] = useState<'email' | 'code'>('email');
  const [otpUserId, setOtpUserId] = useState<number | null>(null);
  const [otpEmail, setOtpEmail] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);

  // Cloudflare Turnstile - privacy-first bot protection
  const { execute: executeTurnstile, isLoaded: isTurnstileLoaded } = useTurnstile(
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''
  );

  // Track user state changes
  useEffect(() => {
    logger.log('LoginForm - User state changed:', {
      userExists: !!user,
      userEmail: user?.email,
      userId: user?.id
    });
  }, [user]);

  const plan = searchParams.get('plan');
  const billing = searchParams.get('billing');
  const orderId = searchParams.get('order_id');
  const returnUrl = searchParams.get('returnUrl');
  const prefillEmail = searchParams.get('email');
  const registerUrl = plan && billing ? `/register?plan=${plan}&billing=${billing}` : '/register';

  // Pre-fill email from URL param (e.g. when redirected from registration with existing email)
  useEffect(() => {
    if (prefillEmail) {
      form.setValue('email', prefillEmail);
      otpForm.setValue('email', prefillEmail);
    }
  }, [prefillEmail]);

  // Handle order_id after payment - this will be handled by an API route
  useEffect(() => {
    const handlePostPaymentLogin = async () => {
      if (user && orderId) {
        try {
          const response = await fetch('/api/subscription/link-order', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.id,
              orderId: orderId,
            }),
          });

          const data = await response.json();

          if (data.warning === 'missing_connection_string') {
            console.warn('Subscription linking skipped: database connection string ontbreekt.');
            return;
          }

          if (response.ok) {
            logger.log('Subscription activated for user:', user.id);
          } else {
            console.warn('Failed to link order to user');
          }
        } catch (error) {
          console.error('Failed to link order to user:', error);
        }
      }
    };

    handlePostPaymentLogin();
  }, [user, orderId]);

  // Password login form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // OTP email form
  const otpForm = useForm<OtpEmailFormValues>({
    resolver: zodResolver(otpEmailSchema),
    defaultValues: { email: "" },
  });

  // Auto-redirect after successful login
  useEffect(() => {
    if (user && pathname === '/login' && !hasRedirectedRef.current) {
      logger.log('Login successful, checking redirect destination...');
      hasRedirectedRef.current = true;

      if (returnUrl) {
        logger.log('Redirecting to returnUrl:', returnUrl);
        setTimeout(() => { window.location.href = returnUrl; }, 500);
        return;
      }

      const dashboardUrl = isMobile ? '/mobile-dashboard' : '/dashboard';
      logger.log('Redirecting to:', dashboardUrl, 'for device type:', isMobile ? 'mobile' : 'desktop');
      setTimeout(() => { window.location.href = dashboardUrl; }, 500);
    }
  }, [user, pathname, isMobile, returnUrl]);

  // Show success message while redirecting
  if (user && pathname === '/login') {
    const destinationName = returnUrl
      ? (returnUrl.includes('onboarding') ? 'onboarding' : 'pagina')
      : (isMobile ? 'mobiele dashboard' : 'dashboard');
    return (
      <Card className="w-full max-w-md bg-card/50 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Login Succesvol!</CardTitle>
          <CardDescription>
            Welkom terug, {user.email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <LoadingSpinner />
          <p className="text-sm text-muted-foreground">
            Je wordt doorgestuurd naar je {destinationName}...
          </p>
        </CardContent>
      </Card>
    );
  }

  // ─── Password login submit ─────────────────────────────────────────────────

  async function onSubmit(data: LoginFormValues) {
    if (isLoggingIn) return;
    setIsLoggingIn(true);

    if (!isTurnstileLoaded) {
      toast({
        title: "Fout",
        description: "Beveiligingsverificatie wordt nog geladen. Probeer het opnieuw.",
        variant: "destructive",
      });
      setIsLoggingIn(false);
      return;
    }

    try {
      const turnstileToken = await executeTurnstile('login');
      if (!turnstileToken) {
        toast({
          title: "Fout",
          description: "Beveiligingsverificatie mislukt. Probeer het opnieuw.",
          variant: "destructive",
        });
        setIsLoggingIn(false);
        return;
      }

      if (turnstileToken !== 'bypass_development') {
        const verifyResponse = await fetch('/api/turnstile/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: turnstileToken, action: 'login' }),
        });

        if (!verifyResponse.ok) {
          const errorData = await verifyResponse.json();
          console.error('Turnstile verification failed:', errorData);
          toast({
            title: "Fout",
            description: errorData.error || "Beveiligingsverificatie mislukt.",
            variant: "destructive",
          });
          setIsLoggingIn(false);
          return;
        }

        logger.log('Turnstile verification successful');
      } else {
        logger.log('Skipping Turnstile server verification in development mode');
      }

      logger.log('Attempting login with email:', data.email);
      const result = await login(data.email, data.password);
      logger.log('Login successful, result:', result);

      trackLogin({
        method: 'email',
        user_id: result?.user?.id?.toString(),
      });

      if (result?.user) {
        setUserProperties({ user_id: result.user.id?.toString() });
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      let description = error.message || "Er is een onbekende fout opgetreden. Probeer het opnieuw.";

      if (error.message.includes('Invalid email or password')) {
        description = "De ingevoerde e-mail of wachtwoord is onjuist.";
      }

      toast({
        title: "Login Mislukt",
        description,
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  }

  // ─── OTP: send code submit ─────────────────────────────────────────────────

  async function onSendOtpCode(data: OtpEmailFormValues) {
    if (isSendingCode) return;
    setIsSendingCode(true);

    try {
      const response = await fetch('/api/auth/send-login-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: "Fout",
          description: result.error || "Kon de inlogcode niet versturen. Probeer het opnieuw.",
          variant: "destructive",
        });
        return;
      }

      setOtpUserId(result.userId);
      setOtpEmail(data.email);
      setOtpStep('code');
      logger.log('Login code sent, userId:', result.userId);
    } catch {
      toast({
        title: "Fout",
        description: "Netwerkfout. Probeer het opnieuw.",
        variant: "destructive",
      });
    } finally {
      setIsSendingCode(false);
    }
  }

  // ─── OTP: after successful code verification ───────────────────────────────

  function handleOtpSuccess() {
    // UserProvider will pick up the token from localStorage on next render /
    // route change — trigger a full page navigation.
    if (returnUrl) {
      window.location.href = returnUrl;
      return;
    }
    const dashboardUrl = isMobile ? '/mobile-dashboard' : '/dashboard';
    window.location.href = dashboardUrl;
  }

  // ─── Render ────────────────────────────────────────────────────────────────

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

        {/* Tab toggle */}
        <div className="flex gap-1 mt-4 bg-muted rounded-lg p-1">
          <button
            type="button"
            onClick={() => { setOtpMode(false); setOtpStep('email'); }}
            className={`flex-1 text-sm py-1.5 rounded-md font-medium transition-colors ${
              !otpMode
                ? 'bg-background shadow text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Wachtwoord
          </button>
          <button
            type="button"
            onClick={() => { setOtpMode(true); setOtpStep('email'); }}
            className={`flex-1 text-sm py-1.5 rounded-md font-medium transition-colors ${
              otpMode
                ? 'bg-background shadow text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Inlogcode
          </button>
        </div>
      </CardHeader>

      {/* ── Password login ── */}
      {!otpMode && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mailadres</FormLabel>
                    <FormControl>
                      <Input placeholder="jouw@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wachtwoord</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button
                type="submit"
                size="lg"
                className="w-full bg-coral-500 hover:bg-coral-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
                disabled={isLoggingIn}
              >
                {isLoggingIn && <LoadingSpinner />}
                Inloggen
              </Button>
              <div className="flex flex-col gap-2 w-full">
                <p className="text-sm text-muted-foreground">
                  Nog geen account?{" "}
                  <Link href={registerUrl} className="font-semibold text-primary underline-offset-4 hover:underline">
                    Registreer hier
                  </Link>
                </p>
                <p className="text-sm text-muted-foreground">
                  <Link href="/forgot-password" className="font-semibold text-primary underline-offset-4 hover:underline">
                    Wachtwoord vergeten?
                  </Link>
                </p>
                <p className="text-sm text-muted-foreground">
                  <Link href="/resend-verification" className="font-semibold text-blue-600 underline-offset-4 hover:underline">
                    Email niet geverifieerd?
                  </Link>
                </p>
              </div>
            </CardFooter>
          </form>
        </Form>
      )}

      {/* ── OTP login ── */}
      {otpMode && (
        <div>
          <CardContent className="space-y-4">
            {otpStep === 'email' && (
              <Form {...otpForm}>
                <form onSubmit={otpForm.handleSubmit(onSendOtpCode)} className="space-y-4">
                  <FormField
                    control={otpForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mailadres</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="jouw@email.com"
                            inputMode="email"
                            autoComplete="email"
                            autoCapitalize="none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-coral-500 hover:bg-coral-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
                    disabled={isSendingCode}
                  >
                    {isSendingCode ? <LoadingSpinner /> : 'Stuur inlogcode'}
                  </Button>
                </form>
              </Form>
            )}

            {otpStep === 'code' && otpUserId !== null && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  We hebben een 6-cijferige code gestuurd naar{' '}
                  <span className="font-medium text-foreground">{otpEmail}</span>.
                  Voer de code hieronder in.
                </p>
                <OtpCodeInput userId={otpUserId} onSuccess={handleOtpSuccess} />
                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-muted-foreground hover:text-foreground underline"
                    onClick={() => { setOtpStep('email'); setOtpUserId(null); }}
                  >
                    Ander e-mailadres gebruiken
                  </button>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              Nog geen account?{" "}
              <Link href={registerUrl} className="font-semibold text-primary underline-offset-4 hover:underline">
                Registreer hier
              </Link>
            </p>
          </CardFooter>
        </div>
      )}
    </Card>
  );
}
