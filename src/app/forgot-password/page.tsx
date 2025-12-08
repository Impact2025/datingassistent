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
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    // Verify reCAPTCHA
    if (!isRecaptchaLoaded) {
      toast({
        title: "Error",
        description: "reCAPTCHA is loading. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Skip reCAPTCHA in development for easier testing
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔧 Skipping reCAPTCHA verification in development mode');
      } else {
        // Execute reCAPTCHA v3 in production
        const recaptchaToken = await executeRecaptcha('forgot-password');
        if (!recaptchaToken) {
          toast({
            title: "Error",
            description: "reCAPTCHA verification failed. Please try again.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        // Verify token on server
        const verifyResponse = await fetch('/api/recaptcha/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: recaptchaToken, action: 'forgot-password' }),
        });

        if (!verifyResponse.ok) {
          const errorData = await verifyResponse.json();
          toast({
            title: "Error",
            description: errorData.error || "reCAPTCHA verification failed.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        console.log('✅ reCAPTCHA verification successful');
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
          title: "Error",
          description: data.error || "Failed to send reset link",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
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
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription>We've sent a password reset link to {email}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-sm text-muted-foreground">
              If you don't see the email, check your spam folder. The link will expire in 1 hour.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link href="/login">Back to Login</Link>
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
          <CardTitle className="text-2xl">Forgot Password?</CardTitle>
          <CardDescription>Enter your email to receive a password reset link</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
            <p className="text-sm text-muted-foreground">
              Remember your password?{" "}
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