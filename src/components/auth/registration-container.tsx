"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUser } from "@/providers/user-provider";
import { useSearchParams } from "next/navigation";
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
import { RegistrationForm } from "./registration-form";
import { LoadingSpinner } from "../shared/loading-spinner";

const signupSchema = z.object({
  name: z.string().min(2, "Naam moet minimaal 2 karakters lang zijn."),
  email: z.string().email("Ongeldig e-mailadres."),
  password: z.string().min(8, "Wachtwoord moet minimaal 8 karakters bevatten."),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export function RegistrationContainer() {
  const { user, signup, updateProfile } = useUser();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [tempName, setTempName] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const plan = searchParams.get('plan');
  const billing = searchParams.get('billing');
  const redirectAfterPayment = searchParams.get('redirect_after_payment');
  const loginUrl = plan && billing ? `/?plan=${plan}&billing=${billing}` : '/';

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  // Get order_id from URL if coming from payment
  useEffect(() => {
    const orderIdParam = searchParams.get('order_id');
    if (orderIdParam) {
      setOrderId(orderIdParam);
    }
  }, [searchParams]);

  // Redirect admin users to admin dashboard
  useEffect(() => {
    if (user) {
      const isAdminUser = user.email && ['v_mun@hotmail.com', 'v.munster@weareimpact.nl'].includes(user.email);
      if (isAdminUser) {
        console.log('➡️ Admin user registered, redirecting to admin dashboard');
        window.location.href = '/admin';
      }
    }
  }, [user]);

  async function onSubmit(data: SignupFormValues) {
    if (isSigningUp) return;
    setIsSigningUp(true);
    console.log('🔵 Starting registration...', { orderId });
    try {
      const userCredential = await signup(data.email, data.password);
      const newUser = userCredential?.user;
      console.log('🔵 User created:', newUser?.uid);

      // Check if this is an admin user
      const isAdminUser = newUser?.email && ['v_mun@hotmail.com', 'v.munster@weareimpact.nl'].includes(newUser.email);
      
      if (isAdminUser) {
        // For admin users, just redirect to admin dashboard
        console.log('🔵 Admin user created, redirecting to admin dashboard');
        window.location.href = '/admin';
        return;
      }

      if (newUser) {
        // Store name temporarily in localStorage for later use
        if (typeof window !== 'undefined') {
          localStorage.setItem('temp_user_name', data.name);
        }

        // If there's an order_id, link it to the user and activate subscription
        if (orderId && newUser) {
          // Store basic profile in localStorage first
          if (typeof window !== 'undefined') {
            const basicProfile = {
              name: data.name,
              email: data.email,
              age: null,
              gender: null,
              lookingFor: null,
              bio: null,
              interests: [],
              location: null,
              photos: [],
            };
            localStorage.setItem(`datespark_user_profile_${newUser.id}`, JSON.stringify(basicProfile));
            console.log('✅ Profile saved to localStorage');
          }

          try {
            // Get order details and link to user
            const response = await fetch(`/api/orders/link`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: orderId,
                userId: newUser.id,
              }),
            });

            if (response.ok) {
              console.log('✅ Subscription activated for user:', newUser.id);
            } else {
              console.warn('⚠️ Failed to link order to user');
            }
          } catch (error) {
            console.error('Failed to link order to user:', error);
            // Continue anyway - user is created and profile is saved
          }
        }
      }

      setTempName(data.name);

      // If there's an order_id, redirect to dashboard (subscription already created above)
      if (orderId && newUser) {
        console.log('🔵 Has order_id, redirecting to dashboard');
        // Profile was already saved to Firestore above (lines 102-114)
        // Just redirect to dashboard
        window.location.href = '/dashboard';
        return;
      }

      // If coming from index.html with redirect_after_payment, go directly to payment
      if (redirectAfterPayment === 'true' && plan && billing && newUser) {
        console.log('🔵 Redirecting to payment with plan and billing');
        try {
          // Create payment order directly
          const response = await fetch('/api/payment/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: newUser.uid,
              email: data.email,
              packageType: plan,
              billingPeriod: billing,
              name: data.name,
            }),
          });

          if (!response.ok) {
            throw new Error('Payment creation failed');
          }

          const paymentData = await response.json();

          // Redirect to payment URL
          if (paymentData.payment_url) {
            window.location.href = paymentData.payment_url;
            return;
          } else {
            throw new Error('No payment URL received');
          }
        } catch (error) {
          console.error('Payment error:', error);
          // Fallback to select-package page if payment creation fails
          window.location.href = `/select-package?plan=${plan}&billing=${billing}`;
          return;
        }
      }

      // No order - redirect to package selection
      console.log('🔵 No order_id, redirecting to /select-package');
      window.location.href = '/select-package';
    } catch (error: any) {
      console.error("Registratie error:", error);
      let description = "Er is een onbekende fout opgetreden. Probeer het opnieuw.";

      if (error.code === 'auth/email-already-in-use') {
        description = "Dit e-mailadres is al in gebruik. Probeer in te loggen.";
      } else if (error.code === 'auth/operation-not-allowed') {
        description = "Email/wachtwoord authenticatie is niet ingeschakeld. Neem contact op met support.";
      } else if (error.code === 'auth/weak-password') {
        description = "Wachtwoord is te zwak. Gebruik minimaal 6 karakters.";
      } else if (error.code === 'auth/invalid-email') {
        description = "Ongeldig e-mailadres.";
      } else if (error.message) {
        description = error.message;
      }

      toast({
        title: "Registratie Mislukt",
        description,
        variant: "destructive",
      });
      setIsSigningUp(false); // Reset on error
    }
  }

  if (user && typeof window !== 'undefined') {
    // If user is already logged in, redirect to package selection
    window.location.href = '/select-package';
    return null;
  }

  return (
    <>
      {orderId && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg text-center">
          <p className="text-green-800 dark:text-green-200 font-semibold mb-1">
            ✓ Betaling geslaagd!
          </p>
          <p className="text-sm text-green-700 dark:text-green-300">
            Vul je gegevens in om je DatingAssistent account te activeren
          </p>
        </div>
      )}
      {plan && billing && !orderId && (
        <div className="mb-4 text-center">
          <p className="text-sm text-muted-foreground">
            Je hebt het <span className="font-semibold text-primary">{plan}</span> plan geselecteerd
          </p>
        </div>
      )}
      <Card className="w-full max-w-md bg-card/50 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">
            {orderId ? 'Activeer je Account' : 'Maak een Account'}
          </CardTitle>
          <CardDescription>
            {orderId
              ? 'Je abonnement wacht op je - vul je gegevens in om te starten'
              : 'Start je reis met de DatingAssistent'}
          </CardDescription>
        </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
             <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Naam / Roepnaam</FormLabel>
                  <FormControl>
                    <Input placeholder="Hoe wil je genoemd worden?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                    <Input type="password" placeholder="Minimaal 8 karakters" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button type="submit" size="lg" className="w-full" disabled={isSigningUp}>
              {isSigningUp ? <LoadingSpinner /> : (orderId ? "Account Activeren" : "Verder")}
            </Button>
            <div className="flex flex-col gap-2 w-full">
              <p className="text-sm text-muted-foreground">
                Heb je al een account?{" "}
                <Link href={loginUrl} className="font-semibold text-primary underline-offset-4 hover:underline">
                  Log hier in
                </Link>
              </p>
              <p className="text-sm text-muted-foreground">
                <Link href="/forgot-password" className="font-semibold text-primary underline-offset-4 hover:underline">
                  Wachtwoord vergeten?
                </Link>
              </p>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
    </>
  );
}
