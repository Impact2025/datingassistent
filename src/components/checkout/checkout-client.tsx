"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@/providers/user-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "../shared/loading-spinner";
import { PACKAGES, getPackagePrice } from "@/lib/multisafepay";
import { PackageType } from "@/lib/subscription";

// Plan features mapping
const PLAN_FEATURES: Record<PackageType, string[]> = {
  sociaal: [
    '50 AI-berichten per week',
    'Profiel Coach – analyseer en verbeter je bio',
    'Chat Coach – 24/7 hulp bij gesprekken',
    'AI Foto Check – feedback op je foto\'s',
    '1 cursus per maand',
    'Voortgang Tracker – zie je groei week na week'
  ],
  core: [
    '50 AI-berichten per week',
    'Profiel Coach – analyseer en verbeter je bio',
    'Chat Coach – 24/7 hulp bij gesprekken',
    'AI Foto Check – feedback op je foto\'s',
    '1 cursus per maand',
    'Voortgang Tracker – zie je groei week na week'
  ],
  pro: [
    '125 AI-berichten per week',
    'Alle tools van Core, plus:',
    'Opener Lab – originele openingszinnen',
    'Match Analyse – waarom wel/niet matches',
    'Date Planner – creatieve date-ideeën',
    '2 cursussen per maand',
    'Prioriteit Support',
    'Maandelijkse AI-profielreview'
  ],
  premium: [
    'Alle tools en cursussen direct unlocked',
    '250 AI-berichten per week',
    'Persoonlijke intake (45 minuten video)',
    'Persoonlijk verbeterplan op maat',
    '3 Coach Check-ins (chat of voice)',
    'Voortgangsrapporten en AI-feedback',
    'Exclusieve AI-tools (Personality Match, Voice Chat)'
  ]
};
import { CheckCircle, CreditCard, Shield, Tag, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface CouponData {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  valid: boolean;
  message: string;
}

export function CheckoutClientComponent() {
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponData, setCouponData] = useState<CouponData | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Get plan details from URL
  const plan = searchParams?.get('plan') as PackageType;
  const billing = searchParams?.get('billing') as 'monthly' | 'yearly';
  const userId = searchParams?.get('userId');

  // Validate plan
  const planKey = plan && Object.prototype.hasOwnProperty.call(PACKAGES, plan) ? plan : null;
  const planData = planKey ? PACKAGES[planKey] : null;

  // Calculate pricing
  const originalPrice = planKey && billing ? getPackagePrice(planKey, billing) : 0;
  const discountAmount = couponData?.valid ? (
    couponData.discountType === 'percentage'
      ? Math.round(originalPrice * (couponData.discountValue / 100))
      : Math.min(couponData.discountValue * 100, originalPrice) // Convert euros to cents
  ) : 0;
  const finalPrice = Math.max(0, originalPrice - discountAmount);

  // Redirect if no valid plan
  useEffect(() => {
    if (!planKey || !billing || !userId) {
      toast({
        title: "Ongeldige checkout",
        description: "Plan of betalingsgegevens ontbreken.",
        variant: "destructive",
      });
      router.push('/');
      return;
    }
  }, [planKey, billing, userId, router, toast]);

  // Validate coupon
  const validateCoupon = async () => {
    if (!couponCode.trim()) return;

    setIsValidatingCoupon(true);
    try {
      const response = await fetch('/api/coupon/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          packageType: planKey,
          userId: userId
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCouponData({
          code: couponCode,
          discountType: data.discountType,
          discountValue: data.discountValue,
          valid: true,
          message: data.message || "Coupon toegepast!"
        });
        toast({
          title: "Coupon toegepast",
          description: data.message || "Korting is toegepast op je bestelling.",
        });
      } else {
        setCouponData({
          code: couponCode,
          discountType: 'fixed',
          discountValue: 0,
          valid: false,
          message: data.error || "Ongeldige coupon code."
        });
        toast({
          title: "Coupon ongeldig",
          description: data.error || "Deze coupon code is niet geldig.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Coupon validation error:', error);
      setCouponData({
        code: couponCode,
        discountType: 'fixed',
        discountValue: 0,
        valid: false,
        message: "Fout bij het valideren van coupon."
      });
      toast({
        title: "Fout",
        description: "Kon coupon niet valideren. Probeer het opnieuw.",
        variant: "destructive",
      });
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  // Handle payment
  const handlePayment = async () => {
    if (!planKey || !billing || !userId) {
      toast({
        title: "Fout",
        description: "Ontbrekende betalingsgegevens.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Get user email - either from logged in user or from database
      let userEmail = user?.email;

      if (!userEmail) {
        // Fetch user email from database if not logged in
        try {
          const userResponse = await fetch(`/api/user/profile?userId=${userId}`);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            userEmail = userData.email;
          }
        } catch (error) {
          console.error('Error fetching user email:', error);
        }
      }

      if (!userEmail) {
        toast({
          title: "Fout",
          description: "Kon gebruikers email niet ophalen. Probeer opnieuw in te loggen.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parseInt(userId),
          userEmail: userEmail,
          packageType: planKey,
          billingPeriod: billing,
          amount: finalPrice,
          couponCode: couponData?.valid ? couponCode : null,
          redirectAfterPayment: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Payment creation failed');
      }

      const paymentData = await response.json();

      if (paymentData.paymentUrl) {
        // Store order ID for success page
        localStorage.setItem('pending_order_id', paymentData.orderId);
        window.location.href = paymentData.paymentUrl;
      } else {
        throw new Error('No payment URL received');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Betalingsfout",
        description: error.message || "Er ging iets mis bij het starten van de betaling.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Don't render if invalid plan
  if (!planKey || !billing || !planData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <LoadingSpinner />
        <p className="text-muted-foreground">Checkout laden...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 lg:p-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Terug naar home
          </Link>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Afronden van je bestelling</h1>
            <p className="text-muted-foreground">
              Bijna klaar! Controleer je bestelling en voltooi de betaling.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Besteloverzicht
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Plan Details */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{planData.name}</h3>
                    <p className="text-sm text-muted-foreground">{planData.description}</p>
                    <Badge variant="secondary">
                      {billing === 'monthly' ? 'Maandelijks' : 'Jaarlijks'}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">€{(originalPrice / 100).toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">
                      {billing === 'monthly' ? '/maand' : '/jaar'}
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Inbegrepen:</h4>
                  <ul className="space-y-1">
                    {PLAN_FEATURES[planKey].slice(0, 3).map((feature: string, index: number) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                    {PLAN_FEATURES[planKey].length > 3 && (
                      <li className="text-sm text-muted-foreground">
                        + {PLAN_FEATURES[planKey].length - 3} extra features
                      </li>
                    )}
                  </ul>
                </div>

                <Separator />

                {/* Coupon Code */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    <span className="font-medium text-sm">Coupon Code</span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Voer coupon code in"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={validateCoupon}
                      disabled={isValidatingCoupon || !couponCode.trim()}
                    >
                      {isValidatingCoupon ? <LoadingSpinner /> : "Toepassen"}
                    </Button>
                  </div>
                  {couponData && (
                    <Alert className={couponData.valid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                      <AlertCircle className={`h-4 w-4 ${couponData.valid ? 'text-green-600' : 'text-red-600'}`} />
                      <AlertDescription className={couponData.valid ? 'text-green-800' : 'text-red-800'}>
                        {couponData.message}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <Separator />

                {/* Pricing Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotaal</span>
                    <span>€{(originalPrice / 100).toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Korting ({couponData?.code})</span>
                      <span>-€{(discountAmount / 100).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>BTW (21%)</span>
                    <span>€{(finalPrice * 0.21 / 100).toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Totaal</span>
                    <span>€{(finalPrice / 100).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Betalingsgegevens
                </CardTitle>
                <CardDescription>
                  Veilige betaling via MultiSafePay
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Veilig betalen:</strong> Je betaling wordt verwerkt door MultiSafePay,
                    een gecertificeerde payment provider. We slaan geen creditcard gegevens op.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-4 p-4 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Betalen met:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">iDEAL</span>
                      <span className="text-sm">•</span>
                      <span className="text-sm">Creditcard</span>
                      <span className="text-sm">•</span>
                      <span className="text-sm">PayPal</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <LoadingSpinner />
                      Betaling starten...
                    </>
                  ) : (
                    `Betalen €${(finalPrice / 100).toFixed(2)}`
                  )}
                </Button>
              </CardFooter>
            </Card>

            {/* Trust Badges */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <Shield className="w-4 h-4" />
                    <span>SSL Beveiligd</span>
                    <span>•</span>
                    <span>GDPR Compliant</span>
                    <span>•</span>
                    <span>24/7 Support</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Door te betalen ga je akkoord met onze{' '}
                    <Link href="/terms" className="text-primary hover:underline">
                      algemene voorwaarden
                    </Link>
                    {' '}en{' '}
                    <Link href="/privacy" className="text-primary hover:underline">
                      privacy policy
                    </Link>
                    .
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}