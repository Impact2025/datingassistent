"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import AuthLayout from "../auth-layout";
import { useRecaptchaV3 } from "@/components/shared/recaptcha";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  // reCAPTCHA v3 hook
  const { execute: executeRecaptcha, isLoaded: isRecaptchaLoaded } = useRecaptchaV3(
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: "Fout",
        description: "Vul je emailadres in",
        variant: "destructive",
      });
      return;
    }

    // Verify reCAPTCHA
    if (!isRecaptchaLoaded) {
      toast({
        title: "Even geduld",
        description: "Beveiliging wordt geladen. Probeer het opnieuw.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Skip reCAPTCHA in development for easier testing
      const shouldUseRecaptcha = process.env.NODE_ENV === 'production' &&
                                 process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY &&
                                 process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY !== '';

      if (!shouldUseRecaptcha) {
        console.log('🔧 Skipping reCAPTCHA verification (not configured or in development)');
      } else {
        // Execute reCAPTCHA v3 in production
        try {
          const recaptchaToken = await executeRecaptcha('forgot-password');
          if (!recaptchaToken) {
            console.warn('⚠️ reCAPTCHA token generation failed, proceeding anyway...');
          } else {
            // Verify token on server
            const verifyResponse = await fetch('/api/recaptcha/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: recaptchaToken, action: 'forgot-password' }),
            });

            if (verifyResponse.ok) {
              console.log('✅ reCAPTCHA verification successful');
            } else {
              console.warn('⚠️ reCAPTCHA verification failed, proceeding anyway...');
            }
          }
        } catch (recaptchaError) {
          console.warn('⚠️ reCAPTCHA error:', recaptchaError, '- proceeding anyway...');
        }
      }

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        toast({
          title: "Fout",
          description: data.error || "Kon reset link niet verzenden",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Fout",
        description: "Er ging iets mis. Probeer het opnieuw.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <AuthLayout>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Check je Email</CardTitle>
            <CardDescription>Als {email} bij ons bekend is, hebben we een wachtwoord reset link gestuurd</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-sm text-muted-foreground">
              Zie je de email niet? Check dan je spam folder. De link verloopt over 1 uur.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="/login">Terug naar Inloggen</Link>
            </Button>
          </CardFooter>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Wachtwoord Vergeten?</CardTitle>
          <CardDescription>Vul je emailadres in om een reset link te ontvangen</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Emailadres</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="jouw@email.com"
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Verzenden..." : "Verstuur Reset Link"}
            </Button>
            <p className="text-sm text-muted-foreground">
              Weet je je wachtwoord weer?{" "}
              <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
                Log in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </AuthLayout>
  );
}