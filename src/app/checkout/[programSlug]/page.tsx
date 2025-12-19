'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/providers/user-provider';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CheckCircle, Lock, ArrowLeft, Tag, Clock, Target, Shield, Sparkles } from 'lucide-react';

interface ProgramData {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  transformation_promise: string;
  price_regular: number;
  price_beta: number | null;
  duration_days: number;
  tangible_proof: string;
  tier: string;
  outcomes: string[];
  features: { text: string; type: string }[];
}

interface CouponData {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  valid: boolean;
  message: string;
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const programSlug = params.programSlug as string;
  const { user, loading: userLoading } = useUser();

  const [program, setProgram] = useState<ProgramData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Coupon state
  const [showCoupon, setShowCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState<CouponData | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!userLoading && !user) {
      // Redirect to register with program slug
      router.push(`/register?program=${programSlug}`);
    }
  }, [user, userLoading, programSlug, router]);

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const response = await fetch(`/api/programs?slug=${programSlug}`);
        if (!response.ok) {
          throw new Error('Program not found');
        }
        const data = await response.json();
        setProgram(data);
      } catch (err) {
        console.error('Error fetching program:', err);
        setError(err instanceof Error ? err.message : 'Failed to load program');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch program if user is loaded
    if (!userLoading && user) {
      fetchProgram();
    }
  }, [programSlug, user, userLoading]);

  // Validate coupon code
  const validateCoupon = async () => {
    if (!couponCode.trim() || !program) return;

    setValidatingCoupon(true);
    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          packageType: program.slug, // Use program slug as package type
          amount: basePrice, // Send the base price for validation
        }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setCouponData({
          code: couponCode.toUpperCase(),
          discountType: data.coupon.discount_type,
          discountValue: data.coupon.discount_value,
          valid: true,
          message: data.coupon.discount_type === 'percentage'
            ? `${data.coupon.discount_value}% korting toegepast!`
            : `€${(data.discountAmount / 100).toFixed(2)} korting toegepast!`
        });
      } else {
        setCouponData({
          code: couponCode,
          discountType: 'fixed',
          discountValue: 0,
          valid: false,
          message: data.error || 'Ongeldige coupon code.'
        });
      }
    } catch (err) {
      console.error('Coupon validation error:', err);
      setCouponData({
        code: couponCode,
        discountType: 'fixed',
        discountValue: 0,
        valid: false,
        message: 'Fout bij valideren van coupon.'
      });
    } finally {
      setValidatingCoupon(false);
    }
  };

  // Calculate prices
  const basePrice = program?.price_beta || program?.price_regular || 0;
  const couponDiscount = couponData?.valid
    ? couponData.discountType === 'percentage'
      ? Math.round(basePrice * (couponData.discountValue / 100))
      : Math.min(couponData.discountValue, basePrice)
    : 0;
  const finalPrice = Math.max(0, basePrice - couponDiscount);

  const handlePayment = async () => {
    if (!program) return;

    setProcessingPayment(true);
    setError(null);

    try {
      console.log('Creating payment with:', {
        programId: program.id,
        programSlug: program.slug,
        amount: finalPrice,
        couponCode: couponData?.valid ? couponData.code : null
      });

      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programId: program.id,
          programSlug: program.slug,
          amount: finalPrice,
          couponCode: couponData?.valid ? couponData.code : null
        }),
        credentials: 'include' // Ensure cookies are sent
      });

      console.log('Payment response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Payment error response:', errorData);
        throw new Error(errorData.error || 'Payment creation failed');
      }

      const { payment_url } = await response.json();
      console.log('Redirecting to:', payment_url);
      window.location.href = payment_url;

    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment failed');
      setProcessingPayment(false);
    }
  };

  if (loading || userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If not authenticated, show nothing (redirect is happening)
  if (!user) {
    return null;
  }

  if (error && !program) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-sm p-8 text-center">
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/#programmas')}
            className="text-pink-500 hover:text-pink-600 font-medium"
          >
            Terug naar programma's
          </button>
        </Card>
      </div>
    );
  }

  if (!program) return null;

  const hasBetaDiscount = program.price_beta && program.price_beta < program.price_regular;
  const betaDiscount = hasBetaDiscount ? program.price_regular - (program.price_beta || 0) : 0;

  // Helper function to format price from cents to euros
  const formatPrice = (cents: number) => {
    const euros = cents / 100;
    return euros % 1 === 0 ? euros.toFixed(0) : euros.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-12">
        {/* Back Link */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-8 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Terug
        </button>

        {/* Main Card */}
        <Card className="p-8 rounded-2xl shadow-sm">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-600 text-xs font-medium px-3 py-1 rounded-full mb-3">
              <Sparkles className="w-3 h-3" />
              {program.tier === 'premium' ? 'Premium Programma' : 'Kickstart Programma'}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {program.name}
            </h1>
            <p className="text-gray-500 text-sm">
              {program.tagline}
            </p>
          </div>

          {/* Transformation Promise */}
          {program.transformation_promise && (
            <div className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl p-4 mb-6 border border-pink-100">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Wat je bereikt:</p>
                  <p className="text-sm text-gray-600">{program.transformation_promise}</p>
                </div>
              </div>
            </div>
          )}

          {/* Program Outcomes */}
          {program.outcomes && program.outcomes.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Dit programma bevat:</p>
              <div className="space-y-2">
                {program.outcomes.slice(0, 4).map((outcome, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{outcome}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price Section */}
          <div className="bg-gray-50 rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">{program.name}</span>
              {hasBetaDiscount ? (
                <span className="text-gray-400 line-through text-sm">€{formatPrice(program.price_regular)}</span>
              ) : (
                <span className="text-gray-900 font-medium">€{formatPrice(program.price_regular)}</span>
              )}
            </div>

            {hasBetaDiscount && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-600 text-sm">Beta korting</span>
                <span className="text-green-600 font-medium">-€{formatPrice(betaDiscount)}</span>
              </div>
            )}

            {couponData?.valid && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-600 text-sm">Coupon ({couponData.code})</span>
                <span className="text-green-600 font-medium">-€{formatPrice(couponDiscount)}</span>
              </div>
            )}

            <div className="border-t border-gray-200 my-3" />

            <div className="flex items-center justify-between">
              <span className="text-gray-900 font-semibold">Totaal</span>
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-900">€{formatPrice(finalPrice)}</span>
                <span className="text-gray-400 text-sm ml-1">eenmalig</span>
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
              Heb je een coupon code?
            </button>
          )}

          {showCoupon && !couponData?.valid && (
            <div className="flex gap-2 mb-6">
              <Input
                placeholder="Coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="flex-1 rounded-lg uppercase"
              />
              <button
                onClick={validateCoupon}
                disabled={validatingCoupon || !couponCode.trim()}
                className="px-4 py-2 text-sm font-medium text-pink-500 hover:text-pink-600 disabled:opacity-50"
              >
                {validatingCoupon ? '...' : 'Toepassen'}
              </button>
            </div>
          )}

          {couponData && !couponData.valid && (
            <div className="text-red-500 text-sm mb-4">
              {couponData.message}
            </div>
          )}

          {couponData?.valid && (
            <div className="flex items-center gap-2 text-sm text-green-600 mb-6">
              <CheckCircle className="w-4 h-4" />
              <span>{couponData.message}</span>
            </div>
          )}

          {/* Key Benefits */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-pink-500 flex-shrink-0" />
              <span>{program.duration_days} dagen toegang</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>Direct toegang na betaling</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Shield className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span>30 dagen geld-terug garantie</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 text-center">
              {error}
            </div>
          )}

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={processingPayment}
            className="w-full py-4 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
          >
            {processingPayment ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Even geduld...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Afrekenen - €{formatPrice(finalPrice)}</span>
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
          <a href="/algemene-voorwaarden" className="underline hover:text-gray-600">
            voorwaarden
          </a>
        </p>
      </div>
    </div>
  );
}
