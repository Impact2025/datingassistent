// Package configurations for subscription plans (Sociaal, Core, Pro, Premium)
// These are managed internally and are NOT connected to Stripe.

export const PACKAGES = {
  sociaal: {
    name: 'Sociaal',
    price_monthly: 995, // €9.95 in cents
    price_yearly: 9950, // €99.50 in cents (10% discount)
    description: 'Sociaal pakket - Voor mensen met beperking',
  },
  core: {
    name: 'Core',
    price_monthly: 2450, // €24.50 in cents
    price_yearly: 24500, // €245 in cents (16% discount)
    description: 'Core pakket - De complete coach',
  },
  pro: {
    name: 'Pro',
    price_monthly: 3950, // €39.50 in cents
    price_yearly: 39500, // €395 in cents (18% discount)
    description: 'Pro pakket - Voor serieuze daters',
  },
  premium: {
    name: 'Premium',
    price_monthly: 6950, // €69.50 in cents
    price_yearly: 69500, // €695 in cents (20% discount)
    description: 'Premium pakket - VIP behandeling',
  },
};

export type PackageType = keyof typeof PACKAGES;
export type BillingPeriod = 'monthly' | 'yearly';

export function getPackagePrice(packageType: PackageType, period: BillingPeriod): number {
  const pkg = PACKAGES[packageType];
  return period === 'monthly' ? pkg.price_monthly : pkg.price_yearly;
}

export function calculateDiscountedPrice(
  originalPrice: number,
  discountType: 'percentage' | 'fixed',
  discountValue: number
): number {
  if (discountType === 'percentage') {
    const discounted = originalPrice - (originalPrice * discountValue / 100);
    return Math.max(0, Math.round(discounted));
  } else {
    return Math.max(0, Math.round(originalPrice - discountValue));
  }
}
