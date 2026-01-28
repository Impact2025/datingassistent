"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUser } from "@/providers/user-provider";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Mail } from "lucide-react";
import { PACKAGES, getPackagePrice } from "@/lib/multisafepay";
import { PackageType } from "@/lib/subscription";
import { useTurnstile } from "../shared/turnstile";
import { VerificationCodeInput } from "./verification-code-input";
import { trackSignUp, setUserProperties } from "@/lib/analytics/ga4-events";

const signupSchema = z.object({
  firstName: z.string().min(2, "Voornaam moet minimaal 2 karakters lang zijn."),
  lastName: z.string().min(2, "Achternaam moet minimaal 2 karakters lang zijn."),
  email: z.string().email("Ongeldig e-mailadres."),
  password: z.string()
    .min(8, "Wachtwoord moet minimaal 8 karakters bevatten.")
    .regex(/[A-Z]/, "Wachtwoord moet minimaal één hoofdletter bevatten.")
    .regex(/[a-z]/, "Wachtwoord moet minimaal één kleine letter bevatten.")
    .regex(/[0-9]/, "Wachtwoord moet minimaal één cijfer bevatten.")
    .regex(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/, "Wachtwoord moet minimaal één speciaal teken bevatten (!@#$%^&* etc.)."),
  confirmPassword: z.string().min(1, "Bevestig je wachtwoord."),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "Je moet akkoord gaan met de voorwaarden.",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Wachtwoorden komen niet overeen.",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export function RegistrationClientComponent() {
  const { user, signup, logout } = useUser();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [tempName, setTempName] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Track logout state
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showVerificationPending, setShowVerificationPending] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string>('');
  const [paymentValidated, setPaymentValidated] = useState<boolean>(false);
  const [validatingPayment, setValidatingPayment] = useState<boolean>(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const hasLoggedOut = useRef(false); // Track if we already logged out to prevent infinite loop

  // Code-based verification states
  const [showCodeVerification, setShowCodeVerification] = useState(false);
  const [registeredUserId, setRegisteredUserId] = useState<number | null>(null);
  const [registeredUserEmail, setRegisteredUserEmail] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [registrationError, setRegistrationError] = useState<string | null>(null);

  // Cloudflare Turnstile - privacy-first bot protection
  const { execute: executeTurnstile, isLoaded: isTurnstileLoaded } = useTurnstile(
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''
  );

  // Support both subscription packages (plan) and program purchases (program)
  const plan = searchParams.get('plan');
  const programSlug = searchParams.get('program'); // For program purchases like kickstart
  const planKey = plan && Object.prototype.hasOwnProperty.call(PACKAGES, plan)
    ? (plan as PackageType)
    : null;
  const billing = searchParams.get('billing');
  const billingParam: 'monthly' | 'yearly' = billing === 'monthly' ? 'monthly' : 'yearly';
  const redirectAfterPayment = searchParams.get('redirect_after_payment');
  const loginUrl = plan && billing ? `/?plan=${plan}&billing=${billing}` : '/';
  const planLabel = planKey ? PACKAGES[planKey].name : plan ?? null;
  const planPriceCents = planKey ? getPackagePrice(planKey, billingParam) : null;

  // Check if this is a program purchase (not a subscription)
  const isProgramPurchase = !!programSlug;

  // Debug logging
  useEffect(() => {
    console.log('🔍 RegistrationClient - Current state:', {
      hasUser: !!user,
      plan,
      programSlug,
      isProgramPurchase,
      billing,
      redirectAfterPayment,
      isLoggingOut,
      hasLoggedOutRef: hasLoggedOut.current
    });
  }, [user, plan, programSlug, isProgramPurchase, billing, redirectAfterPayment, isLoggingOut]);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
  });

  // Get order_id from URL or localStorage (coming from payment)
  useEffect(() => {
    const orderIdParam = searchParams.get('order_id');
    const pendingOrderId = localStorage.getItem('pending_order_id');
    const orderIdTimestamp = localStorage.getItem('pending_order_id_timestamp');

    if (orderIdParam) {
      console.log('📦 Got order_id from URL:', orderIdParam);
      setOrderId(orderIdParam);
      // Save to localStorage as backup with timestamp
      localStorage.setItem('pending_order_id', orderIdParam);
      localStorage.setItem('pending_order_id_timestamp', Date.now().toString());
      // Validate payment status
      validatePaymentStatus(orderIdParam);
    } else if (pendingOrderId && orderIdTimestamp) {
      // Check if order_id is recent (within last 15 minutes)
      const timestamp = parseInt(orderIdTimestamp, 10);
      const fifteenMinutesInMs = 15 * 60 * 1000;
      const isRecent = (Date.now() - timestamp) < fifteenMinutesInMs;

      if (isRecent) {
        console.log('📦 Got recent order_id from localStorage:', pendingOrderId);
        setOrderId(pendingOrderId);
        // Validate payment status
        validatePaymentStatus(pendingOrderId);
      } else {
        console.log('🗑️ Clearing expired order_id from localStorage');
        localStorage.removeItem('pending_order_id');
        localStorage.removeItem('pending_order_id_timestamp');
      }
    } else if (pendingOrderId && !orderIdTimestamp) {
      // Old localStorage data without timestamp, clear it
      console.log('🗑️ Clearing old order_id from localStorage (no timestamp)');
      localStorage.removeItem('pending_order_id');
    }
  }, [searchParams]);

  // Validate payment status
  const validatePaymentStatus = async (orderIdToCheck: string) => {
    try {
      setValidatingPayment(true);
      console.log('🔍 Validating payment status for order:', orderIdToCheck);
      const response = await fetch(`/api/orders/validate-payment?orderId=${orderIdToCheck}`);
      const data = await response.json();

      if (response.ok && data.paid) {
        console.log('✅ Payment validated for order:', orderIdToCheck);
        setPaymentValidated(true);
      } else {
        console.log('❌ Payment not validated for order:', orderIdToCheck, data);
        setPaymentValidated(false);
        // Clear invalid order ID
        setOrderId(null);
        localStorage.removeItem('pending_order_id');
        localStorage.removeItem('pending_order_id_timestamp');
        // Show error message
        toast({
          title: "Betaling niet gevonden",
          description: "We konden je betaling niet verifiëren. Probeer het opnieuw of neem contact op met support.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Error validating payment:', error);
      setPaymentValidated(false);
      setOrderId(null);
      localStorage.removeItem('pending_order_id');
      localStorage.removeItem('pending_order_id_timestamp');
    } finally {
      setValidatingPayment(false);
    }
  };

  // If user is coming from index.html with a plan selected, log them out first
  // This ensures they can create a NEW account for the selected plan
  useEffect(() => {
    const handlePreRegistrationLogout = async () => {
      if (user && redirectAfterPayment === 'true' && plan && billing && !hasLoggedOut.current) {
        console.log('🚪 RegistrationClient - User already logged in, but redirect_after_payment=true');
        console.log('🚪 Logging out to allow new account creation');
        hasLoggedOut.current = true; // Mark that we're logging out
        setIsLoggingOut(true);
        try {
          await logout();
          console.log('✅ Logout completed successfully');
        } catch (error) {
          console.error('❌ Failed to logout:', error);
          hasLoggedOut.current = false; // Reset on error
          setIsLoggingOut(false);
        }
      } else if (!user && hasLoggedOut.current) {
        // Logout completed, user is now null
        console.log('✅ User logged out, ready for new registration');
        setIsLoggingOut(false);
      }
    };

    handlePreRegistrationLogout();
  }, [user, redirectAfterPayment, plan, billing, logout]);

  async function onSubmit(data: SignupFormValues) {
    if (isSigningUp) return;
    setIsSigningUp(true);
    setRegistrationError(null); // Clear previous errors
    console.log('🔵 Starting registration...', { orderId });

    // Verify Turnstile
    if (!isTurnstileLoaded) {
      toast({
        title: "Fout",
        description: "Beveiligingsverificatie wordt nog geladen. Probeer het opnieuw.",
        variant: "destructive",
      });
      setIsSigningUp(false);
      return;
    }

    try {
      // Execute Turnstile verification
      const turnstileToken = await executeTurnstile('register');
      if (!turnstileToken) {
        toast({
          title: "Fout",
          description: "Beveiligingsverificatie mislukt. Probeer het opnieuw.",
          variant: "destructive",
        });
        setIsSigningUp(false);
        return;
      }

      // Verify token on server (skip for bypass tokens in development)
      if (turnstileToken !== 'bypass_development') {
        const verifyResponse = await fetch('/api/turnstile/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: turnstileToken, action: 'register' }),
        });

        if (!verifyResponse.ok) {
          const errorData = await verifyResponse.json();
          toast({
            title: "Fout",
            description: errorData.error || "Beveiligingsverificatie mislukt.",
            variant: "destructive",
          });
          setIsSigningUp(false);
          return;
        }

        console.log('✅ Turnstile verification successful');
      } else {
        console.log('🔧 Skipping Turnstile server verification in development mode');
      }
    } catch (error) {
      console.error('Turnstile error:', error);
      toast({
        title: "Fout",
        description: "Beveiligingsverificatie mislukt.",
        variant: "destructive",
      });
      setIsSigningUp(false);
      return;
    }

    try {
      const fullName = `${data.firstName} ${data.lastName}`.trim();
      const result = await signup(data.email, data.password, fullName);
      const newUser = result.user;
      console.log('🔵 User created:', newUser.id);

      if (typeof window !== 'undefined') {
        localStorage.setItem('profile_setup_name', fullName);
      }

      // Create basic profile
      const basicProfile = {
        name: fullName,
        email: data.email,
        age: null,
        gender: null,
        lookingFor: null,
        bio: null,
        interests: [],
        location: null,
        photos: [],
      };

      // Save profile and link order if needed (only if orderId exists)
      try {
        if (orderId) {
          const response = await fetch('/api/subscription/link-order', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: newUser.id,
              orderId: orderId,
            }),
          });

          const linkData = await response.json();

          if (linkData.warning === 'missing_connection_string') {
            console.warn('⚠️ Subscription linking skipped: database connection string ontbreekt.');
          } else if (response.ok) {
            console.log('✅ Subscription linked for user:', newUser.id);
          }
        } else {
          console.log('ℹ️ No orderId provided, skipping subscription linking');
        }

        // Save basic profile (skip auth check during registration)
        const profileResponse = await fetch('/api/user/update-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: newUser.id,
            profile: basicProfile,
            skipAuth: true, // Skip authentication check during registration
          }),
        });

        if (profileResponse.ok) {
          console.log('✅ Profile saved to database');
          // Cache in localStorage
          localStorage.setItem(`datespark_user_profile_${newUser.id}`, JSON.stringify(basicProfile));
          console.log('💾 Profile cached in localStorage');
        }
      } catch (error) {
        console.error('Failed to save user data:', error);
        // Fallback: save to localStorage only
        localStorage.setItem(`datespark_user_profile_${newUser.id}`, JSON.stringify(basicProfile));
        console.log('⚠️ Fallback: Profile saved to localStorage only');
      }

      setTempName(data.name);

      // Email verification is now always required with codes
      console.log('📧 Email verification required, showing code verification screen');
      setRegisteredUserId(newUser.id);
      setRegisteredUserEmail(data.email);
      setShowCodeVerification(true);
      setIsSigningUp(false);

      // Note: Verification code is already sent by the registration API
      console.log('✅ Verification code already sent by registration API');
      return;

      // If there's an order_id, clear localStorage and redirect to profile setup
      if (orderId) {
        console.log('🔵 Has order_id, clearing localStorage and redirecting to profile setup');
        localStorage.removeItem('pending_order_id');
        localStorage.removeItem('pending_order_id_timestamp');
        localStorage.removeItem('pending_transaction_id');
        setIsRedirecting(true);
        setTimeout(() => {
          window.location.href = '/register/profile';
        }, 500);
        return;
      }

      // If coming from index.html with redirect_after_payment, go to checkout page
      if (redirectAfterPayment === 'true') {
        if (!planKey) {
          console.warn('⚠️ Geen geldig plan gevonden in URL, terug naar select-package');
          setIsRedirecting(true);
          toast({
            title: "Doorsturen...",
            description: "Je wordt doorgestuurd naar pakket selectie...",
          });
          setTimeout(() => {
            window.location.href = '/select-package';
          }, 1500);
          return;
        }

        console.log('🔵 Redirecting to checkout page with plan and billing');
        setIsRedirecting(true);
        toast({
          title: "Account aangemaakt! ✅",
          description: "Je wordt doorgestuurd naar de betaalpagina...",
        });
        setTimeout(() => {
          window.location.href = `/checkout?plan=${planKey}&billing=${billingParam}&userId=${newUser.id}`;
        }, 1500);
        return;
      }

      // No order - redirect to profile setup
      console.log('🔵 No order_id, redirecting to /register/profile');
      setShowSuccessMessage(true);

      // Redirect to profile setup after a short delay
      setTimeout(() => {
        window.location.href = '/register/profile';
      }, 3000);
    } catch (error: any) {
      console.error("Registratie error:", error);

      // Set error message for display in form
      if (error.message.includes('Dit emailadres is al bij ons bekend') || error.message.includes('Als je al een account hebt')) {
        setRegistrationError("existing_email");
      } else if (error.message.includes('Wachtwoord') || error.message.includes('Password')) {
        // Show the specific password error from the server
        setRegistrationError(error.message);
      } else {
        setRegistrationError(error.message || "Er is een onbekende fout opgetreden. Probeer het opnieuw.");
      }

      setIsSigningUp(false); // Reset on error
    }
  }

  // REMOVED: No automatic redirect - let users access registration page naturally
  // If they're logged in and try to register without any parameters, that's their choice
  // The actual registration logic will handle it properly

  // Show loading state while logging out for payment flow or redirecting
  if ((user && redirectAfterPayment === 'true') || isLoggingOut || isRedirecting) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <LoadingSpinner />
        <p className="text-muted-foreground">
          {isLoggingOut
            ? 'Account voorbereiden voor registratie...'
            : isRedirecting
            ? 'Doorsturen naar betaling...'
            : 'Laden...'}
        </p>
      </div>
    );
  }

  // Show code verification screen
  if (showCodeVerification && registeredUserId && registeredUserEmail) {
    const handleVerificationSuccess = (user: unknown) => {
      console.log('✅ Email verified successfully:', user);

      // Track successful sign up in GA4
      trackSignUp({
        method: 'email',
        user_id: user.id?.toString(),
        plan: planKey || programSlug || 'free',
      });

      // Set user properties for future tracking
      setUserProperties({
        user_id: user.id?.toString(),
        subscription_tier: 'free',
        account_created_at: new Date().toISOString(),
      });

      // Clear verification states
      setShowCodeVerification(false);
      setRegisteredUserId(null);
      setRegisteredUserEmail(null);
      setVerificationError(null);

      // Continue with post-registration flow
      setTempName(user.name);

      // Check if coming from assessment (PRO CONVERSION FLOW)
      const fromAssessment = searchParams.get('from');
      if (fromAssessment === 'assessment') {
        console.log('🎯 Coming from assessment, redirecting back to results');
        setIsRedirecting(true);
        toast({
          title: "Account geverifieerd! ✅",
          description: "Je wordt doorgestuurd naar je volledige aanbeveling...",
        });
        setTimeout(() => {
          window.location.href = '/assessment/result';
        }, 1500);
        return;
      }

      // Check if this is a PROGRAM PURCHASE (e.g., kickstart-programma)
      if (isProgramPurchase && programSlug) {
        console.log('🛒 Program purchase detected, redirecting to checkout:', programSlug);
        setIsRedirecting(true);
        toast({
          title: "Account geverifieerd! ✅",
          description: "Je wordt doorgestuurd naar de betaalpagina...",
          duration: 1500,
        });
        setTimeout(() => {
          window.location.href = `/checkout/${programSlug}`;
        }, 1500);
        return;
      }

      // If there's an order_id, clear localStorage and redirect to profile setup
      if (orderId) {
        console.log('🔵 Has order_id, clearing localStorage and redirecting to profile setup');
        localStorage.removeItem('pending_order_id');
        localStorage.removeItem('pending_order_id_timestamp');
        localStorage.removeItem('pending_transaction_id');
        setIsRedirecting(true);
        setTimeout(() => {
          window.location.href = '/register/profile';
        }, 500);
        return;
      }

      // If coming from index.html with redirect_after_payment, go to checkout page
      if (redirectAfterPayment === 'true') {
        if (!planKey) {
          console.warn('⚠️ Geen geldig plan gevonden in URL, terug naar select-package');
          setIsRedirecting(true);
          toast({
            title: "Doorsturen...",
            description: "Je wordt doorgestuurd naar pakket selectie...",
          });
          setTimeout(() => {
            window.location.href = '/select-package';
          }, 1500);
          return;
        }

        console.log('🔵 Redirecting to checkout page with plan and billing');
        setIsRedirecting(true);
        toast({
          title: "Account geverifieerd! ✅",
          description: "Je wordt doorgestuurd naar de betaalpagina...",
        });
        setTimeout(() => {
          window.location.href = `/checkout?plan=${planKey}&billing=${billingParam}&userId=${user.id}`;
        }, 1500);
        return;
      }

      // No order - redirect to profile setup
      console.log('🔵 No order_id, redirecting to /register/profile');
      setShowSuccessMessage(true);

      // Redirect to profile setup after a short delay
      setTimeout(() => {
        window.location.href = '/register/profile';
      }, 3000);
    };

    const handleVerificationError = (error: string) => {
      setVerificationError(error);
    };

    const handleResendCode = () => {
      console.log('🔄 Resending verification code...');
      // The VerificationCodeInput component handles this internally
    };

    return (
      <div className="min-h-screen bg-background dark:bg-gray-900 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <Card className="w-full max-w-md rounded-2xl bg-card dark:bg-gray-800 shadow-2xl">
          <CardHeader className="text-center pb-4 pt-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <span className="text-muted-foreground font-medium">Verificatie</span>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold">
              Verificeer je emailadres
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              We hebben een verificatie code gestuurd naar <strong className="break-all">{registeredUserEmail}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <VerificationCodeInput
              userId={registeredUserId}
              onSuccess={handleVerificationSuccess}
              onError={handleVerificationError}
              onResendCode={handleResendCode}
            />
          </CardContent>
          <CardFooter className="flex-col gap-4 pb-6">
            <Button
              onClick={() => {
                setShowCodeVerification(false);
                setRegisteredUserId(null);
                setRegisteredUserEmail(null);
                setVerificationError(null);
              }}
              variant="ghost"
              className="w-full"
            >
              Terug naar registratie
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Show email verification pending screen (legacy - keep for backward compatibility)
  if (showVerificationPending) {
    const handleResendEmail = async () => {
      if (resendingEmail) return;

      setResendingEmail(true);
      try {
        const response = await fetch('/api/auth/resend-verification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: pendingVerificationEmail,
          }),
        });

        if (response.ok) {
          toast({
            title: "Verificatie email verzonden",
            description: `Er is een nieuwe verificatie email verzonden naar ${pendingVerificationEmail}`,
          });
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to resend verification email');
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Resend verification email error:', error);
        toast({
          title: "Fout bij verzenden",
          description: errorMessage || "Er is een fout opgetreden bij het verzenden van de verificatie email.",
          variant: "destructive",
        });
      } finally {
        setResendingEmail(false);
      }
    };

    return (
      <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 lg:p-8">
        <Card className="rounded-2xl bg-card dark:bg-gray-800 shadow-2xl">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-6 text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <svg className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold dark:text-white">Controleer je email!</h2>
              <p className="text-muted-foreground text-base max-w-md">
                We hebben een verificatie email gestuurd naar <strong>{pendingVerificationEmail}</strong>.
                Klik op de link in de email om je account te activeren.
              </p>
              <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Belangrijk:</strong> Controleer ook je spam/junk folder als je de email niet ziet.
                  De verificatie link verloopt over 24 uur.
                </p>
              </div>
            </div>
            <div className="space-y-4 w-full max-w-sm">
              <Button
                onClick={handleResendEmail}
                disabled={resendingEmail}
                variant="outline"
                className="w-full"
              >
                {resendingEmail ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Email wordt verzonden...
                  </>
                ) : (
                  "Verificatie email opnieuw versturen"
                )}
              </Button>
              <Button
                onClick={() => {
                  setShowVerificationPending(false);
                  setPendingVerificationEmail('');
                }}
                variant="ghost"
                className="w-full"
              >
                Terug naar registratie
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show success message after registration
  if (showSuccessMessage) {
    return (
      <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 lg:p-8">
        <Card className="rounded-2xl bg-card dark:bg-gray-800 shadow-2xl">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-6 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-semibold text-sm">1</span>
                </div>
                <span className="text-muted-foreground font-medium">afgerond</span>
              </div>
              <h2 className="text-2xl font-bold dark:text-white">Account aangemaakt!</h2>
              <p className="text-muted-foreground text-base max-w-md">
                We zetten nu Stap 2 klaar: vul je profiel aan zodat je coach direct aan de slag kan.
                Je ontvangt ook een welkomstmail met een samenvatting.
              </p>
            </div>
            <LoadingSpinner />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 lg:p-8">
      <div className="space-y-6">
        {/* Payment Success Banner - Only show when payment is validated */}
        {orderId && paymentValidated && (
          <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/30">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              <strong>Betaling geslaagd!</strong> Stap 1: maak je inlog aan zodat we je abonnement kunnen koppelen. Stap 2 (profiel invullen) volgt direct daarna.
            </AlertDescription>
          </Alert>
        )}

        {/* Payment Validation Loading */}
        {orderId && validatingPayment && (
          <Alert>
            <LoadingSpinner className="h-4 w-4" />
            <AlertDescription>
              <strong>Betaling controleren...</strong> Even geduld terwijl we je betaling verifiëren.
            </AlertDescription>
          </Alert>
        )}

        {/* Program Purchase Info */}
        {isProgramPurchase && programSlug && !orderId && (
          <Alert className="border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/30">
            <AlertCircle className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-purple-800 dark:text-purple-200">
              <strong>Stap 1 van 2</strong> – Je hebt het <span className="font-semibold">{programSlug.replace(/-/g, ' ')}</span> geselecteerd.
              Maak eerst je account aan, daarna ga je naar de betaalpagina.
            </AlertDescription>
          </Alert>
        )}

        {/* Plan Selection Info */}
        {plan && billing && !orderId && !isProgramPurchase && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Stap 1 van 2</strong> – Je hebt het <span className="font-semibold">{planLabel ?? plan}</span>
              {planPriceCents !== null && (
                <span> ({billingParam === 'monthly' ? 'maandelijks' : 'jaarlijks'}: {(planPriceCents / 100).toFixed(2)})</span>
              )} geselecteerd. Vul hieronder je gegevens in om door te gaan naar het profielformulier.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Registration Card - Dashboard Style */}
        <Card className="rounded-2xl bg-card dark:bg-gray-800 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-semibold text-sm">1</span>
              </div>
              <span className="text-muted-foreground font-medium">van 2</span>
            </div>
            <CardTitle className="text-2xl font-bold">
              Maak je account aan
            </CardTitle>
            <CardDescription className="text-base">
              {orderId
                ? "Gebruik hetzelfde e-mailadres als bij je betaling. Hierna openen we automatisch het profielformulier."
                : "Met deze inlog kun je straks je profiel afronden en naar het dashboard."
              }
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} suppressHydrationWarning>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem suppressHydrationWarning>
                        <FormLabel suppressHydrationWarning>Voornaam</FormLabel>
                        <FormControl>
                          <Input placeholder="Voornaam" {...field} suppressHydrationWarning />
                        </FormControl>
                        <FormMessage suppressHydrationWarning />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem suppressHydrationWarning>
                        <FormLabel suppressHydrationWarning>Achternaam</FormLabel>
                        <FormControl>
                          <Input placeholder="Achternaam" {...field} suppressHydrationWarning />
                        </FormControl>
                        <FormMessage suppressHydrationWarning />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem suppressHydrationWarning>
                        <FormLabel suppressHydrationWarning>E-mailadres</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="jouw@email.com"
                            autoComplete="email"
                            autoCapitalize="none"
                            autoCorrect="off"
                            inputMode="email"
                            {...field}
                            suppressHydrationWarning
                          />
                        </FormControl>
                        <FormMessage suppressHydrationWarning />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem suppressHydrationWarning>
                        <FormLabel suppressHydrationWarning>Wachtwoord</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Minimaal 8 karakters, hoofdletter, cijfer & speciaal teken" {...field} suppressHydrationWarning />
                        </FormControl>
                        <FormMessage suppressHydrationWarning />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem suppressHydrationWarning>
                        <FormLabel suppressHydrationWarning>Herhaal wachtwoord</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Herhaal je wachtwoord" {...field} suppressHydrationWarning />
                        </FormControl>
                        <FormMessage suppressHydrationWarning />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="termsAccepted"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4" suppressHydrationWarning>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel suppressHydrationWarning>
                            Ik ga akkoord met de{" "}
                            <Link href="/algemene-voorwaarden" className="text-primary hover:underline" target="_blank">
                              Algemene Voorwaarden
                            </Link>{" "}
                            en{" "}
                            <Link href="/privacyverklaring" className="text-primary hover:underline" target="_blank">
                              Privacy Policy
                            </Link>
                          </FormLabel>
                          <FormMessage suppressHydrationWarning />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Registration Error Alert */}
                {registrationError && (
                  <Alert className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800 dark:text-red-200">
                      {registrationError === "existing_email" ? (
                        <div className="space-y-2">
                          <p>
                            <strong>Dit emailadres is al bij ons bekend.</strong>
                          </p>
                          <p className="text-sm">
                            Heb je al een account? <Link href={loginUrl} className="font-semibold underline hover:text-red-900">Log hier in</Link> of{' '}
                            <Link href="/auth/reset-password" className="font-semibold underline hover:text-red-900">vraag een nieuw wachtwoord aan</Link>.
                          </p>
                        </div>
                      ) : registrationError.includes('Wachtwoord') ? (
                        <div className="space-y-1">
                          <p><strong>Wachtwoord voldoet niet aan de eisen:</strong></p>
                          <p className="text-sm whitespace-pre-line">{registrationError}</p>
                        </div>
                      ) : (
                        <p>
                          <strong>Fout:</strong> {registrationError}
                        </p>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Security Note */}
                <Alert className="border-coral-200 dark:border-coral-800 bg-coral-50 dark:bg-coral-900/30">
                  <AlertCircle className="h-4 w-4 text-coral-600" />
                  <AlertDescription className="text-coral-800 dark:text-coral-200">
                    <strong>Veilig en Vertrouwelijk:</strong> Je gegevens zijn veilig versleuteld en worden alleen gebruikt voor je DatingAssistent account. We verkopen of delen je persoonlijke informatie nooit met derden.
                  </AlertDescription>
                </Alert>
              </CardContent>

              <CardFooter className="flex-col gap-4">
                <Button type="submit" className="w-full" disabled={isSigningUp}>
                  {isSigningUp ? (
                    <>
                      <LoadingSpinner />
                      Account aanmaken...
                    </>
                  ) : (
                    "Registreren"
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Heb je al een account?{" "}
                    <Link href={loginUrl} className="font-semibold text-primary hover:underline">
                      Log hier in
                    </Link>
                  </p>
                </div>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}