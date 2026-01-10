"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/providers/user-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard,
  CheckIcon,
  AlertCircle,
  Info,
  Crown,
  Star,
  Zap,
  Users,
  Calendar,
  BookOpen,
  ExternalLink
} from 'lucide-react';
import { PACKAGES, getPackagePrice, calculateDiscountedPrice } from '@/lib/multisafepay';
import { PackageType } from '@/lib/subscription';
import { LoadingSpinner } from '@/components/shared/loading-spinner';

export function SubscriptionTab() {
  const router = useRouter();
  const { user } = useUser();
  const [selectedPackage, setSelectedPackage] = useState<PackageType>('premium');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [orderError, setOrderError] = useState('');
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [enrolledPrograms, setEnrolledPrograms] = useState<any[]>([]);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [usageStats, setUsageStats] = useState<any>(null);
  const [loadingUsage, setLoadingUsage] = useState(false);
  const [showUpgradeOptions, setShowUpgradeOptions] = useState(false);

  // Load current subscription, enrolled programs, and usage stats
  useEffect(() => {
    const loadCurrentSubscription = async () => {
      if (!user?.id) {
        setLoadingSubscription(false);
        return;
      }

      try {
        // Load subscription and enrolled programs in parallel
        const [subResponse, programsResponse] = await Promise.all([
          fetch(`/api/user/subscription?userId=${user.id}`),
          fetch('/api/user/enrolled-programs', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('datespark_auth_token')}`
            }
          })
        ]);

        if (subResponse.ok) {
          const data = await subResponse.json();
          setCurrentSubscription(data.subscription);

          // Load usage stats if subscription is active
          if (data.subscription?.status === 'active') {
            loadUsageStats();
          }
        }

        if (programsResponse.ok) {
          const programsData = await programsResponse.json();
          setEnrolledPrograms(programsData.programs || []);
        }
      } catch (error) {
        console.error('Error loading subscription:', error);
      } finally {
        setLoadingSubscription(false);
      }
    };

    const loadUsageStats = async () => {
      if (!user?.id) return;

      setLoadingUsage(true);
      try {
        const response = await fetch(`/api/user/usage-stats?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setUsageStats(data);
        }
      } catch (error) {
        console.error('Error loading usage stats:', error);
      } finally {
        setLoadingUsage(false);
      }
    };

    loadCurrentSubscription();
  }, [user?.id]);

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
          customerName,
          customerLocale: normalizedLocale
        }),
      });

      const orderData = await orderResponse.json();

      if (orderData.success && orderData.paymentUrl) {
        setProcessingMessage('Doorsturen naar betaling...');

        setTimeout(() => {
          router.push(orderData.paymentUrl);
        }, 1500);
      } else {
        console.error('Order creation failed:', orderData.error);
        setOrderError(orderData.error || 'Het aanmaken van de bestelling is mislukt.');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      setOrderError('Er is een fout opgetreden tijdens het starten van de betaling. Probeer het opnieuw.');
      setIsProcessing(false);
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
        '10 icebreakers/dag'
      ],
      core: [
        '60 AI-berichten/week',
        '4 profiel-rewrites/30 dagen',
        '12 foto-checks/30 dagen',
        '1 cursus/week (unlimited)',
        '20 icebreakers/dag',
        'Reactie-assistent'
      ],
      pro: [
        '125 AI-berichten/week',
        '8 profiel-rewrites/30 dagen',
        '25 foto-checks/30 dagen',
        '2 cursussen/week (unlimited)',
        '40 icebreakers/dag',
        'Priority Support'
      ],
      premium: [
        '250 AI-berichten/week',
        '15 profiel-rewrites/30 dagen',
        '50 foto-checks/30 dagen',
        'Alle cursussen direct',
        '100 icebreakers/dag',
        'Live 1-op-1 coach'
      ]
    };
    return features[pkg];
  };

  const getPackageIcon = (pkg: PackageType) => {
    switch (pkg) {
      case 'sociaal': return <Users className="w-5 h-5" />;
      case 'core': return <Zap className="w-5 h-5" />;
      case 'pro': return <Star className="w-5 h-5" />;
      case 'premium': return <Crown className="w-5 h-5" />;
      default: return <CreditCard className="w-5 h-5" />;
    }
  };

  const renderCurrentSubscription = () => {
    if (!currentSubscription || currentSubscription.status !== 'active') {
      return null;
    }

    const pkgInfo = PACKAGES[currentSubscription.packageType as PackageType];
    const features = getPackageFeatures(currentSubscription.packageType as PackageType);

    return (
      <div className="space-y-6">
        {/* Current Subscription Status */}
        <Card className="border-pink-200 dark:border-pink-800 bg-pink-50/50 dark:bg-pink-900/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/50 rounded-full flex items-center justify-center">
                  <CheckIcon className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <CardTitle className="text-pink-900 dark:text-pink-100">Actief Abonnement</CardTitle>
                  <CardDescription className="text-pink-700 dark:text-pink-300">
                    Je hebt toegang tot alle {pkgInfo.name} features
                  </CardDescription>
                </div>
              </div>
              <Badge className="bg-pink-100 dark:bg-pink-900/50 text-pink-800 dark:text-pink-200 border-pink-200 dark:border-pink-700">
                {currentSubscription.billingPeriod === 'yearly' ? 'Jaarlijks' : 'Maandelijks'}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
              <div className="flex items-center gap-3">
                {getPackageIcon(currentSubscription.packageType as PackageType)}
                <div>
                  <h3 className="font-semibold dark:text-white">{pkgInfo.name} Abonnement</h3>
                  <p className="text-sm text-muted-foreground">
                    Geactiveerd op {new Date(currentSubscription.startDate).toLocaleDateString('nl-NL')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold dark:text-white">
                  €{(currentSubscription.amount / 100).toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">
                  per {currentSubscription.billingPeriod === 'yearly' ? 'jaar' : 'maand'}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 dark:text-white">Jouw Features:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm dark:text-gray-300">
                    <CheckIcon className="h-4 w-4 text-green-500 dark:text-green-400 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Gebruik deze maand</CardTitle>
            <CardDescription>
              Houd bij hoe je je abonnement gebruikt
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingUsage ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
                <span className="ml-2">Gebruiksdata laden...</span>
              </div>
            ) : usageStats ? (
              <div className="space-y-4">
                {/* AI Messages Weekly */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>AI berichten deze week</span>
                    <span>{usageStats.usage.aiMessagesWeekly.used} / {usageStats.usage.aiMessagesWeekly.limit}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${usageStats.usage.aiMessagesWeekly.percentage}%` }}
                    />
                  </div>
                </div>

                {/* Profile Rewrites Monthly */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Profiel rewrites deze maand</span>
                    <span>{usageStats.usage.profileRewritesMonthly.used} / {usageStats.usage.profileRewritesMonthly.limit}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${usageStats.usage.profileRewritesMonthly.percentage}%` }}
                    />
                  </div>
                </div>

                {/* Photo Checks Monthly */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Foto checks deze maand</span>
                    <span>{usageStats.usage.photoChecksMonthly.used} / {usageStats.usage.photoChecksMonthly.limit}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${usageStats.usage.photoChecksMonthly.percentage}%` }}
                    />
                  </div>
                </div>

                {/* Icebreakers Daily */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Icebreakers vandaag</span>
                    <span>{usageStats.usage.icebreakersDaily.used} / {usageStats.usage.icebreakersDaily.limit}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${usageStats.usage.icebreakersDaily.percentage}%` }}
                    />
                  </div>
                </div>

                {/* Courses Unlocked */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Cursussen ontgrendeld</span>
                    <span>{usageStats.usage.coursesUnlocked.used} / {usageStats.usage.coursesUnlocked.limit}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${usageStats.usage.coursesUnlocked.percentage}%` }}
                    />
                  </div>
                </div>

                {/* Weekly Goals Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Wekelijkse voortgang</span>
                    <span>{usageStats.usage.weeklyGoals.used} / {usageStats.usage.weeklyGoals.limit}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${usageStats.usage.weeklyGoals.percentage}%` }}
                    />
                  </div>
                </div>

                {/* Badges Earned */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Badges verdiend</span>
                    <span>{usageStats.usage.badgesEarned.used} / {usageStats.usage.badgesEarned.limit}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${usageStats.usage.badgesEarned.percentage}%` }}
                    />
                  </div>
                </div>

                {/* Token Usage */}
                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Tokens deze week:</span>
                      <span className="ml-2 font-medium">{usageStats.usage.tokensUsed.weekly.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Kosten deze maand:</span>
                      <span className="ml-2 font-medium">€{usageStats.usage.costUsed.monthly.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Info className="w-8 h-8 mx-auto mb-2" />
                <p>Kon gebruiksstatistieken niet laden</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderEnrolledPrograms = () => {
    if (enrolledPrograms.length === 0) {
      return null;
    }

    return (
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-blue-900 dark:text-blue-100">Mijn Programma&apos;s</CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-300">
                Je hebt toegang tot de volgende programma&apos;s
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {enrolledPrograms.map((program) => (
            <div
              key={program.program_id}
              className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold dark:text-white">{program.program_name || 'Kickstart 21-Dagen'}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant={program.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                      {program.status === 'active' ? 'Actief' : program.status}
                    </Badge>
                    {program.enrolled_at && (
                      <span>Gestart {new Date(program.enrolled_at).toLocaleDateString('nl-NL')}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {program.program_type === 'kickstart' && (
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      Dag {program.next_day || 1}/21
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {program.completed_days || 0} dagen voltooid
                    </div>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (program.program_slug === 'kickstart') {
                      router.push('/kickstart');
                    } else if (program.program_slug === 'transformatie') {
                      router.push('/transformatie');
                    } else {
                      router.push(`/cursus/${program.program_slug}`);
                    }
                  }}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
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
        className={`cursor-pointer transition-all hover:shadow-md ${
          isSelected ? 'border-primary ring-2 ring-primary/30' : 'border-border'
        } ${isFeatured ? 'relative' : ''}`}
        onClick={() => setSelectedPackage(pkg)}
      >
        {isFeatured && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-3 py-1">
              Meest Populair
            </Badge>
          </div>
        )}

        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getPackageIcon(pkg)}
              <CardTitle className="text-lg">{pkgInfo.name}</CardTitle>
            </div>
            {isSelected && <CheckIcon className="h-5 w-5 text-primary" />}
          </div>
          <CardDescription className="text-sm">{pkgInfo.description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-baseline gap-2 justify-center">
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
            <span className="text-2xl font-bold">
              {formatPrice(discountedPrice)}
            </span>
            <span className="text-sm text-muted-foreground">
              {billingPeriod === 'monthly' ? '/maand' : '/jaar'}
            </span>
          </div>

          {hasDiscount && (
            <Alert className="py-2">
              <AlertDescription className="text-sm">
                Korting toegepast: {couponData.coupon.discount_type === 'percentage'
                  ? `${couponData.coupon.discount_value}%`
                  : `€${(couponData.coupon.discount_value / 100).toFixed(2)}`}
              </AlertDescription>
            </Alert>
          )}

          <ul className="space-y-1 text-sm">
            {features.slice(0, 4).map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckIcon className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-xs">{feature}</span>
              </li>
            ))}
            {features.length > 4 && (
              <li className="text-xs text-muted-foreground pl-5">
                +{features.length - 4} meer features...
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    );
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (loadingSubscription) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
        <p className="mt-4 text-muted-foreground">Abonnement laden...</p>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="flex items-center justify-center py-16">
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

  // Show current subscription/programs if user has any
  const hasActiveSubscription = currentSubscription && currentSubscription.status === 'active';
  const hasEnrolledPrograms = enrolledPrograms.length > 0;

  // Show summary view with programs, unless user clicked to see upgrade options
  if ((hasActiveSubscription || hasEnrolledPrograms) && !showUpgradeOptions) {
    return (
      <div className="space-y-6">
        {/* Show enrolled programs first (like Kickstart) */}
        {renderEnrolledPrograms()}

        {/* Show traditional subscription if active */}
        {hasActiveSubscription && renderCurrentSubscription()}

        {/* Upgrade Options */}
        <Card>
          <CardHeader>
            <CardTitle>
              {hasActiveSubscription ? 'Upgrade je abonnement' : 'Voeg een abonnement toe'}
            </CardTitle>
            <CardDescription>
              {hasActiveSubscription
                ? 'Meer features en hogere limieten voor nog betere resultaten'
                : 'Krijg toegang tot AI coaching, profiel analyse en meer'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setShowUpgradeOptions(true)}
              variant="outline"
              className="w-full"
            >
              {hasActiveSubscription ? 'Bekijk Upgrade Opties' : 'Bekijk Abonnementen'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button when viewing upgrade options */}
      {showUpgradeOptions && (hasActiveSubscription || hasEnrolledPrograms) && (
        <Button
          variant="ghost"
          onClick={() => setShowUpgradeOptions(false)}
          className="mb-2"
        >
          ← Terug naar overzicht
        </Button>
      )}

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="mx-auto w-12 h-12 bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center">
          <CreditCard className="w-6 h-6 text-pink-600 dark:text-pink-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Upgrade je abonnement</h2>
          <p className="text-muted-foreground">
            Kies het pakket dat perfect past bij jouw dating doelen
          </p>
        </div>
      </div>

      {/* Billing Period Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg border p-1 bg-muted/50">
          <Button
            variant={billingPeriod === 'monthly' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setBillingPeriod('monthly')}
            className="px-4"
          >
            Maandelijks
          </Button>
          <Button
            variant={billingPeriod === 'yearly' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setBillingPeriod('yearly')}
            className="px-4"
          >
            Jaarlijks
            <Badge variant="secondary" className="ml-2 text-xs">Bespaar 20%</Badge>
          </Button>
        </div>
      </div>

      {/* Package Selection */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="md:col-span-2 lg:col-span-4 lg:max-w-2xl lg:mx-auto">
          {renderPackageCard('sociaal')}
        </div>
        <div>
          {renderPackageCard('core')}
        </div>
        <div>
          {renderPackageCard('pro')}
        </div>
        <div className="md:col-span-2 lg:col-span-2">
          {renderPackageCard('premium', { featured: true })}
        </div>
      </div>

      {/* Error Display */}
      {orderError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{orderError}</AlertDescription>
        </Alert>
      )}

      {/* Coupon Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="w-4 h-4" />
            Kortingscode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Voer je coupon code in"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
              />
            </div>
            <Button
              onClick={handleApplyCoupon}
              disabled={!couponCode.trim() || couponLoading}
              size="sm"
            >
              {couponLoading ? 'Controleren...' : 'Toepassen'}
            </Button>
          </div>

          {couponError && (
            <Alert variant="destructive" className="mt-3">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{couponError}</AlertDescription>
            </Alert>
          )}

          {couponData && (
            <Alert className="mt-3">
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

      {/* Payment Info */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Na het selecteren van je pakket word je doorgestuurd naar MultiSafepay voor een veilige betaling.
          Je abonnement wordt automatisch geactiveerd na succesvolle betaling.
        </AlertDescription>
      </Alert>

      {/* Action Button */}
      <div className="flex justify-center pt-4">
        <Button
          size="lg"
          onClick={handleSelectPackage}
          disabled={!user || isProcessing}
          className="px-8"
        >
          {isProcessing ? <LoadingSpinner /> : 'Upgrade Nu'}
        </Button>
      </div>
    </div>
  );
}