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
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";

const adminLoginSchema = z.object({
  email: z.string().email("Ongeldig e-mailadres."),
  password: z.string().min(1, "Wachtwoord is vereist."),
});

const admin2FASchema = z.object({
  token: z.string().regex(/^\d{6}$/, "TOTP code moet 6 cijfers bevatten."),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;
type Admin2FAFormValues = z.infer<typeof admin2FASchema>;

export function AdminLoginForm() {
  const { login, user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [step, setStep] = useState<'login' | '2fa'>('login');
  const [tempUserId, setTempUserId] = useState<number | null>(null);
  const [formKey, setFormKey] = useState(Date.now());
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const loginForm = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const twoFAForm = useForm<Admin2FAFormValues>({
    resolver: zodResolver(admin2FASchema),
    defaultValues: {
      token: "",
    },
  });

  // Redirect to admin dashboard if already logged in
  useEffect(() => {
    if (user) {
      router.push('/admin');
    }
  }, [user, router]);

  // Cleanup sensitive data when component unmounts
  useEffect(() => {
    return () => {
      loginForm.reset();
      twoFAForm.reset();
    };
  }, []);

  // Force clear any browser autofill after render
  useEffect(() => {
    const timer = setTimeout(() => {
      if (passwordInputRef.current) {
        const input = passwordInputRef.current;
        // Check if input has autofilled content
        const isAutofilled = input.matches && input.matches(':-webkit-autofill');
        if (isAutofilled || (input.value && input !== document.activeElement)) {
          // Clear the value and update React state
          input.value = '';
          // Trigger change event to sync with React Hook Form
          const event = new Event('input', { bubbles: true });
          input.dispatchEvent(event);
        }
        // Ensure input is interactive
        input.focus();
        input.blur();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [step, formKey]);

  async function onLoginSubmit(data: AdminLoginFormValues) {
    if (isLoggingIn) {
      console.log('⚠️ Admin login already in progress');
      return;
    }

    console.log('🚀 Admin login form submitted', { email: data.email });
    setIsLoggingIn(true);

    try {
      console.log('🔐 Attempting admin login with email:', data.email);

      // First, check if user exists and has 2FA enabled
      const checkResponse = await fetch('/api/admin/2fa/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email })
      });

      const checkResult = await checkResponse.json();

      if (checkResult.requires2FA) {
        // User has 2FA enabled, proceed to 2FA step
        console.log('🔐 2FA required for user');
        setTempUserId(checkResult.userId);
        setStep('2fa');
        setIsLoggingIn(false);
        return;
      }

      // No 2FA required, proceed with normal login
      const result = await login(data.email, data.password);

      // Clear sensitive data from form immediately after successful login
      loginForm.reset();

      console.log('✅ Admin login successful:', result);
      // The AdminLayout will handle redirection on success.
    } catch (error: any) {
      console.error('❌ Admin login failed:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });

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
      console.log('🔄 Resetting admin login state');
      setIsLoggingIn(false);
    }
  }

  async function on2FASubmit(data: Admin2FAFormValues) {
    if (isLoggingIn || !tempUserId) {
      return;
    }

    setIsLoggingIn(true);

    try {
      console.log('🔐 Verifying 2FA token for user:', tempUserId);

      // Verify 2FA token
      const verifyResponse = await fetch('/api/admin/2fa/login-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: tempUserId,
          token: data.token
        })
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        throw new Error(errorData.error || '2FA verification failed');
      }

      // 2FA verified, now complete login
      const loginFormData = loginForm.getValues();
      const result = await login(loginFormData.email, loginFormData.password);

      // Clear sensitive data from forms immediately after successful login
      loginForm.reset();
      twoFAForm.reset();

      console.log('✅ Admin login with 2FA successful:', result);

    } catch (error: any) {
      console.error('❌ 2FA verification failed:', error);

      toast({
        title: "2FA Verificatie Mislukt",
        description: error.message || "Ongeldige 2FA code. Probeer het opnieuw.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  }

  function goBackToLogin() {
    setStep('login');
    setTempUserId(null);
    twoFAForm.reset();
    setFormKey(Date.now()); // Force re-render to clear any browser caching
  }

  return (
    <Card key={formKey} className="w-full max-w-md bg-card/50 shadow-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl flex items-center justify-center gap-2">
          <Shield className="h-8 w-8" />
          Admin Login
        </CardTitle>
        <CardDescription>
          {step === 'login'
            ? 'Log in om toegang te krijgen tot het admin dashboard'
            : 'Voer uw 2FA code in'
          }
        </CardDescription>
      </CardHeader>

      {step === 'login' ? (
        <Form {...loginForm}>
          <form
            onSubmit={loginForm.handleSubmit(onLoginSubmit)}
            autoComplete="off"
            data-form-type="admin-login-form"
          >
            {/* Hidden dummy inputs to prevent browser autofill */}
            <input type="text" style={{display: 'none'}} autoComplete="username" />
            <input type="password" style={{display: 'none'}} autoComplete="current-password" />

            <CardContent className="space-y-4">
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mailadres</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="admin@email.com"
                        autoComplete="off"
                        data-form-type="admin-login"
                        key={`email-${step}`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wachtwoord</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="********"
                        autoComplete="new-password"
                        data-form-type="admin-login"
                        key={`password-${step}-${formKey}`}
                        ref={(el) => {
                          passwordInputRef.current = el;
                          field.ref(el);
                        }}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button type="submit" size="lg" className="w-full" disabled={isLoggingIn}>
                  {isLoggingIn && <LoadingSpinner />}
                  Inloggen
              </Button>
              <p className="text-sm text-muted-foreground">
                Terug naar de{" "}
                <Link href="/" className="font-semibold text-primary underline-offset-4 hover:underline">
                  website
                </Link>
              </p>
            </CardFooter>
          </form>
        </Form>
      ) : (
        <Form {...twoFAForm}>
          <form
            onSubmit={twoFAForm.handleSubmit(on2FASubmit)}
            autoComplete="off"
            data-form-type="admin-2fa-form"
          >
            <CardContent className="space-y-4">
              <div className="text-center text-sm text-muted-foreground mb-4">
                Voer de 6-cijferige code in uit uw authenticator app
              </div>
              <FormField
                control={twoFAForm.control}
                name="token"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>2FA Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="000000"
                        maxLength={6}
                        className="text-center text-2xl tracking-widest"
                        autoComplete="off"
                        data-form-type="admin-2fa"
                        key={`token-${step}`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button type="submit" size="lg" className="w-full" disabled={isLoggingIn}>
                  {isLoggingIn && <LoadingSpinner />}
                  Verifiëren
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={goBackToLogin}
                disabled={isLoggingIn}
              >
                Terug naar Login
              </Button>
            </CardFooter>
          </form>
        </Form>
      )}
    </Card>
  );
}