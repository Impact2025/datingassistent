"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/providers/user-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckIcon, AlertCircle, Info } from 'lucide-react';
import { PACKAGES, getPackagePrice, calculateDiscountedPrice } from '@/lib/multisafepay';
import { PackageType } from '@/lib/subscription';
import { LoadingSpinner } from '@/components/shared/loading-spinner';

// We'll handle the redirect_after_payment parameter in a client-side effect
const SelectPackagePage = () => {
  const router = useRouter();
  const { user } = useUser();
  const [selectedPackage, setSelectedPackage] = useState<PackageType>('premium');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [redirectAfterPayment, setRedirectAfterPayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [orderError, setOrderError] = useState('');

  // Check for redirect_after_payment parameter
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const redirectParam = urlParams.get('redirect_after_payment');
      if (redirectParam === 'true') {
        setRedirectAfterPayment(true);
      }
    }
  }, []);

  // Apply coupon when code changes
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setCouponLoading(true);
    setCouponError('');
    
    try {
      const originalPrice = getPackagePrice(selectedPackage, billingPeriod);
      
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: couponCode,
          packageType: selectedPackage,
          amount: originalPrice
        }),
      });
      
      const result = await response.json();
      
      if (result.valid) {
        setCouponData(result);
      } else {
        setCouponError(result.error || 'Invalid coupon code');
        setCouponData(null);
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      setCouponError('Error validating coupon code');
      setCouponData(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSelectPackage = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setIsProcessing(true);
    setOrderError('');
    setProcessingMessage('Je bestelling wordt verwerkt...');

    try {
      // Create order with or without coupon
      const originalPrice = getPackagePrice(selectedPackage, billingPeriod);
      const finalPrice = couponData?.newAmount ?? originalPrice;
      const normalizedAmount = Math.round(finalPrice);
      const customerName = user.name || user.email || '';
      const browserLocale = typeof navigator !== 'undefined' ? navigator.language : 'nl-NL';
      const normalizedLocale = browserLocale.replace('-', '_');
      
      const orderResponse = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageType: selectedPackage,
          billingPeriod,
          amount: normalizedAmount,
          userId: user.id,
          userEmail: user.email,
          couponCode: couponData?.coupon?.code,
          redirectAfterPayment,
          customerName,
          customerLocale: normalizedLocale
        }),
      });

      const orderData = await orderResponse.json();

      if (orderData.success && orderData.paymentUrl) {
        setProcessingMessage('Doorsturen naar betaling...');
        
        // If we have a redirect_after_payment flag, go directly to payment
        if (redirectAfterPayment) {
          setTimeout(() => {
            window.location.href = orderData.paymentUrl;
          }, 1500);
        } else {
          setTimeout(() => {
            router.push(orderData.paymentUrl);
          }, 1500);
        }
      } else {
        console.error('Order creation failed:', orderData.error);
        setOrderError(orderData.error || 'Het aanmaken van de bestelling is mislukt.');
        setIsProcessing(false);
        // Show error message to user
      }
    } catch (error) {
      console.error('Error creating order:', error);
      setOrderError('Er is een fout opgetreden tijdens het starten van de betaling. Probeer het opnieuw.');
      setIsProcessing(false);
      // Show error message to user
    }
  };

  const getDiscountedPrice = () => {
    if (!couponData) return null;
    
    const originalPrice = getPackagePrice(selectedPackage, billingPeriod);
    return calculateDiscountedPrice(
      originalPrice,
      couponData.coupon.discount_type,
      couponData.coupon.discount_value
    );
  };

  const formatPrice = (price: number) => {
    return `€${(price / 100).toFixed(2)}`;
  };

  const getPackageFeatures = (pkg: PackageType): string[] => {
    const features: Record<PackageType, string[]> = {
      sociaal: [
        '25 AI-berichten/week',
        '2 profiel-rewrites/30 dagen',
        '5 foto-checks/30 dagen',
        '1 cursus/week (max 8)',
        '10 icebreakers/dag',
        'Begeleide onboarding'
      ],
      core: [
        '60 AI-berichten/week',
        '4 profiel-rewrites/30 dagen',
        '12 foto-checks/30 dagen',
        '1 cursus/week (unlimited)',
        '20 icebreakers/dag',
        'Reactie-assistent',
        'Date Planner'
      ],
      pro: [
        '125 AI-berichten/week',
        '8 profiel-rewrites/30 dagen',
        '25 foto-checks/30 dagen',
        '2 cursussen/week (unlimited)',
        '40 icebreakers/dag',
        'Alles van Core',
        'Priority Support'
      ],
      premium: [
        '250 AI-berichten/week',
        '15 profiel-rewrites/30 dagen',
        '50 foto-checks/30 dagen',
        'Alle cursussen direct',
        '100 icebreakers/dag',
        'Alles van Pro',
        'Live 1-op-1 coach',
        'VIP Support'
      ]
    };
    return features[pkg];
  };

  const renderPackageCard = (pkg: PackageType, options?: { featured?: boolean }) => {
    const pkgInfo = PACKAGES[pkg];
    const originalPrice = getPackagePrice(pkg, billingPeriod);
    const discountedPrice = couponData?.newAmount ?? originalPrice;
    const hasDiscount = couponData && couponData.coupon?.package_type === pkg;
    const isSelected = selectedPackage === pkg;
    const isFeatured = options?.featured ?? pkg === 'premium';
    const features = getPackageFeatures(pkg);

    return (
      <Card
        className={`cursor-pointer transition-all hover:shadow-lg ${
          isSelected ? 'border-primary ring-2 ring-primary/30' : 'border-border'
        } ${isFeatured ? 'lg:scale-[1.05] lg:shadow-2xl lg:-translate-y-2' : ''}`}
        onClick={() => setSelectedPackage(pkg)}
      >
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{pkgInfo.name}</span>
            {isSelected && <CheckIcon className="h-5 w-5 text-primary" />}
          </CardTitle>
          <CardDescription>{pkgInfo.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-baseline gap-2 justify-center sm:justify-start">
              {hasDiscount && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
              <span className="text-3xl font-bold">
                {formatPrice(discountedPrice)}
              </span>
              <span className="text-muted-foreground">
                {billingPeriod === 'monthly' ? '/maand' : '/jaar'}
              </span>
            </div>
            {hasDiscount && (
              <Alert className="mt-2">
                <AlertDescription>
                  Korting toegepast: {couponData.coupon.discount_type === 'percentage'
                    ? `${couponData.coupon.discount_value}%`
                    : `€${(couponData.coupon.discount_value / 100).toFixed(2)}`}
                </AlertDescription>
              </Alert>
            )}
            <ul className="space-y-2 text-sm">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Please log in to select a package.</p>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-background py-12 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <LoadingSpinner />
            <p className="mt-4 text-muted-foreground">{processingMessage}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Je wordt automatisch doorgestuurd...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">Kies je pakket</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Selecteer het pakket dat het beste bij jouw behoeften past
          </p>
        </div>

        <div className="mt-12">
          <div className="flex justify-center gap-4 mb-8">
            <Button
              variant={billingPeriod === 'monthly' ? 'default' : 'outline'}
              onClick={() => setBillingPeriod('monthly')}
            >
              Maandelijks
            </Button>
            <Button
              variant={billingPeriod === 'yearly' ? 'default' : 'outline'}
              onClick={() => setBillingPeriod('yearly')}
            >
              Jaarlijks
            </Button>
          </div>

          <div className="space-y-6 mb-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              <div className="lg:self-end">
                {renderPackageCard('core')}
              </div>
              <div className="lg:-mt-4">
                {renderPackageCard('premium', { featured: true })}
              </div>
              <div className="lg:self-end">
                {renderPackageCard('pro')}
              </div>
              <div className="md:col-span-2 lg:col-span-3 lg:max-w-2xl lg:mx-auto">
                {renderPackageCard('sociaal')}
              </div>
            </div>
          </div>

          {orderError && (
            <Alert variant="destructive" className="mb-8">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{orderError}</AlertDescription>
            </Alert>
          )}

          {/* Coupon Code Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Coupon Code</CardTitle>
              <CardDescription>
                Heb je een kortingscode? Voer deze hier in.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="coupon-code" className="sr-only">
                    Coupon Code
                  </Label>
                  <Input
                    id="coupon-code"
                    placeholder="Voer je coupon code in"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                  />
                </div>
                <Button 
                  onClick={handleApplyCoupon} 
                  disabled={!couponCode.trim() || couponLoading}
                >
                  {couponLoading ? 'Controleren...' : 'Toepassen'}
                </Button>
              </div>
              {couponError && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{couponError}</AlertDescription>
                </Alert>
              )}
              {couponData && (
                <Alert className="mt-4">
                  <CheckIcon className="h-4 w-4" />
                  <AlertDescription>
                    Coupon "{couponData.coupon.code}" succesvol toegepast! 
                    Je krijgt {couponData.coupon.discount_type === 'percentage' 
                      ? `${couponData.coupon.discount_value}% korting` 
                      : `€${(couponData.coupon.discount_value / 100).toFixed(2)} korting`}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Info about payment process */}
          <Alert className="mb-8">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Na het selecteren van je pakket word je doorgestuurd naar MultiSafepay voor betaling. 
              Je abonnement wordt automatisch geactiveerd na succesvolle betaling.
            </AlertDescription>
          </Alert>

          <div className="text-center">
            <Button 
              size="lg" 
              onClick={handleSelectPackage}
              disabled={!user || isProcessing}
              className="w-full sm:w-auto"
            >
              {isProcessing ? <LoadingSpinner /> : 'Ga naar betaling'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectPackagePage;