"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@/providers/user-provider";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { PACKAGES, getPackagePrice } from "@/lib/multisafepay";
import { PackageType } from "@/lib/subscription";
import { CheckCircle, Lock, ArrowLeft, Tag } from "lucide-react";
import Link from "next/link";
import { trackBeginCheckout, trackViewItem } from "@/lib/analytics/ga4-events";

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
  const [showCoupon, setShowCoupon] = useState(false);
  const hasTrackedViewItem = useRef(false);

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
      : Math.min(couponData.discountValue * 100, originalPrice)
  ) : 0;
  const finalPrice = Math.max(0, originalPrice - discountAmount);

  // Redirect if no valid plan, track view_item on valid checkout
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

    // Track view_item when checkout page loads (only once)
    if (planData && !hasTrackedViewItem.current) {
      hasTrackedViewItem.current = true;
      trackViewItem({
        item_id: planKey,
        item_name: planData.name,
        price: originalPrice / 100,
        currency: 'EUR',
      });
    }
  }, [planKey, billing, userId, router, toast, planData, originalPrice]);

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
          description: data.message || "Korting is toegepast.",
        });
      } else {
        setCouponData({
          code: couponCode,
          discountType: 'fixed',
          discountValue: 0,
          valid: false,
          message: data.error || "Ongeldige coupon code."
        });
      }
    } catch (error) {
      console.error('Coupon validation error:', error);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  // Handle payment
  const handlePayment = async () => {
    if (!planKey || !billing || !userId || !planData) return;

    // Track begin_checkout in GA4
    trackBeginCheckout({
      plan_id: planKey,
      plan_name: planData.name,
      price: finalPrice / 100,
      billing_cycle: billing,
      currency: 'EUR',
      coupon: couponData?.valid ? couponCode : undefined,
    });

    setIsProcessing(true);
    try {
      let userEmail = user?.email;

      if (!userEmail) {
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
          description: "Kon gebruikers email niet ophalen.",
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
        localStorage.setItem('pending_order_id', paymentData.orderId);
        window.location.href = paymentData.paymentUrl;
      } else {
        throw new Error('No payment URL received');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Betalingsfout",
        description: error.message || "Er ging iets mis.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Don't render if invalid plan
  if (!planKey || !billing || !planData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const billingLabel = billing === 'monthly' ? 'maand' : 'jaar';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-12">
        {/* Back Link */}
        <Link
          href="/"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-8 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Terug
        </Link>

        {/* Main Card */}
        <Card className="p-8 rounded-2xl shadow-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {planData.name}
            </h1>
            <p className="text-gray-500 text-sm">
              {planData.description}
            </p>
          </div>

          {/* Price Section */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">{planData.name} ({billingLabel})</span>
              <span className={discountAmount > 0 ? "text-gray-400 line-through" : "text-gray-900 font-semibold"}>
                €{(originalPrice / 100).toFixed(2)}
              </span>
            </div>

            {discountAmount > 0 && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-600 text-sm">Korting ({couponData?.code})</span>
                <span className="text-green-600 font-medium">-€{(discountAmount / 100).toFixed(2)}</span>
              </div>
            )}

            <div className="border-t border-gray-200 my-4" />

            <div className="flex items-center justify-between">
              <span className="text-gray-900 font-semibold">Totaal</span>
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-900">€{(finalPrice / 100).toFixed(2)}</span>
                <span className="text-gray-500 text-sm">/{billingLabel}</span>
              </div>
            </div>
          </div>

          {/* Coupon Section */}
          {!showCoupon && !couponData?.valid && (
            <button
              onClick={() => setShowCoupon(true)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
            >
              <Tag className="w-4 h-4" />
              Coupon code?
            </button>
          )}

          {showCoupon && !couponData?.valid && (
            <div className="flex gap-2 mb-6">
              <Input
                placeholder="Coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 rounded-lg"
              />
              <button
                onClick={validateCoupon}
                disabled={isValidatingCoupon || !couponCode.trim()}
                className="px-4 py-2 text-sm font-medium text-pink-500 hover:text-pink-600 disabled:opacity-50"
              >
                {isValidatingCoupon ? "..." : "Toepassen"}
              </button>
            </div>
          )}

          {couponData?.valid && (
            <div className="flex items-center gap-2 text-sm text-green-600 mb-6">
              <CheckCircle className="w-4 h-4" />
              <span>{couponData.message}</span>
            </div>
          )}

          {/* Features */}
          <div className="space-y-3 mb-8">
            {['Direct toegang tot alle features', 'Opzeggen wanneer je wilt', 'Geen verborgen kosten'].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full py-4 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Even geduld...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Betalen €{(finalPrice / 100).toFixed(2)}</span>
              </>
            )}
          </button>

          {/* Trust Text */}
          <p className="text-center text-xs text-gray-400 mt-4">
            Veilig betalen via MultiSafePay
          </p>
        </Card>

        {/* Payment Methods */}
        <div className="flex items-center justify-center gap-4 mt-6 text-xs text-gray-400">
          <span>iDEAL</span>
          <span>•</span>
          <span>Visa</span>
          <span>•</span>
          <span>Mastercard</span>
          <span>•</span>
          <span>PayPal</span>
        </div>

        {/* Terms */}
        <p className="text-center text-xs text-gray-400 mt-4">
          Door te betalen ga je akkoord met onze{' '}
          <Link href="/algemene-voorwaarden" className="underline hover:text-gray-600">
            voorwaarden
          </Link>
        </p>
      </div>
    </div>
  );
}
