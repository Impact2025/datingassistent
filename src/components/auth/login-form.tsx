"use client";

import { useEffect, useRef } from "react";
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
import { useState } from "react";
import { LoadingSpinner } from "../shared/loading-spinner";
import { useSearchParams, usePathname } from "next/navigation";
import { useTurnstile } from "../shared/turnstile";
import { useDeviceDetection } from "@/hooks/use-device-detection";
import { trackLogin, setUserProperties } from "@/lib/analytics/ga4-events";

const loginSchema = z.object({
  email: z.string().email("Ongeldig e-mailadres."),
  password: z.string().min(1, "Wachtwoord is vereist."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login, user } = useUser();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const hasRedirectedRef = useRef(false);
  const { isMobile } = useDeviceDetection();

  // Cloudflare Turnstile - privacy-first bot protection
  const { execute: executeTurnstile, isLoaded: isTurnstileLoaded } = useTurnstile(
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''
  );
  
  // Track user state changes
  useEffect(() => {
    console.log('🔄 LoginForm - User state changed:', {
      userExists: !!user,
      userEmail: user?.email,
      userId: user?.id
    });
  }, [user]);

  const plan = searchParams.get('plan');
  const billing = searchParams.get('billing');
  const orderId = searchParams.get('order_id');
  const returnUrl = searchParams.get('returnUrl');
  const registerUrl = plan && billing ? `/register?plan=${plan}&billing=${billing}` : '/register';

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
            console.warn('⚠️ Subscription linking skipped: database connection string ontbreekt.');
            return;
          }

          if (response.ok) {
            console.log('✅ Subscription activated for user:', user.id);
          } else {
            console.warn('⚠️ Failed to link order to user');
          }
        } catch (error) {
          console.error('Failed to link order to user:', error);
        }
      }
    };

    handlePostPaymentLogin();
  }, [user, orderId]);

  // NO AUTO-REDIRECT - User clicks button to go to dashboard after login

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Auto-redirect after successful login
  useEffect(() => {
    if (user && pathname === '/login' && !hasRedirectedRef.current) {
      console.log('✅ Login successful, checking redirect destination...');
      hasRedirectedRef.current = true;

      // Check if there's a returnUrl to redirect back to
      if (returnUrl) {
        console.log('📍 Redirecting to returnUrl:', returnUrl);
        setTimeout(() => {
          window.location.href = returnUrl;
        }, 500);
        return;
      }

      // Determine correct dashboard based on device
      const dashboardUrl = isMobile ? '/mobile-dashboard' : '/dashboard';
      console.log('📱 Redirecting to:', dashboardUrl, 'for device type:', isMobile ? 'mobile' : 'desktop');

      // Small delay to ensure state is updated
      setTimeout(() => {
        window.location.href = dashboardUrl;
      }, 500);
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

  async function onSubmit(data: LoginFormValues) {
    if (isLoggingIn) return;
    setIsLoggingIn(true);

    // Verify Turnstile
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
      // Execute Turnstile verification
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

      // Verify token on server (skip for bypass tokens in development)
      if (turnstileToken !== 'bypass_development') {
        const verifyResponse = await fetch('/api/turnstile/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: turnstileToken, action: 'login' }),
        });

        if (!verifyResponse.ok) {
          const errorData = await verifyResponse.json();
          console.error('❌ Turnstile verification failed:', errorData);
          toast({
            title: "Fout",
            description: errorData.error || "Beveiligingsverificatie mislukt.",
            variant: "destructive",
          });
          setIsLoggingIn(false);
          return;
        }

        console.log('✅ Turnstile verification successful');
      } else {
        console.log('🔧 Skipping Turnstile server verification in development mode');
      }
      console.log('🔐 Attempting login with email:', data.email);
      const result = await login(data.email, data.password);
      console.log('✅ Login successful, result:', result);

      // Track login in GA4
      trackLogin({
        method: 'email',
        user_id: result?.user?.id?.toString(),
      });

      // Set user properties
      if (result?.user) {
        setUserProperties({
          user_id: result.user.id?.toString(),
        });
      }

      // If we have an orderId, the useEffect will handle subscription activation
      // The auth provider will handle redirection on success.
      // We don't need to set isLoggingIn to false here because the component will unmount.
    } catch (error: any) {
      console.error('❌ Login failed:', error);
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
      // Ensure the loading state is always reset on failure.
      // On success, the component will unmount, so this won't be called.
      setIsLoggingIn(false);
    }
  }

  return (
    <Card className="w-full max-w-md bg-card/50 shadow-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl">Jouw DatingAssistent</CardTitle>
        <CardDescription>Vind liefde met een coach die altijd voor je klaarstaat.</CardDescription>
        {orderId && (
          <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md text-sm">
            ✅ Betaling succesvol! Log in om toegang te krijgen tot je abonnement.
          </div>
        )}
      </CardHeader>
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
            <Button type="submit" size="lg" className="w-full bg-pink-500 hover:bg-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all" disabled={isLoggingIn}>
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
    </Card>
  );
}
