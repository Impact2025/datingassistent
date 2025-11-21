// MultiSafePay API integration
// Docs: https://docs.multisafepay.com/api/

export interface MultiSafePayOrderRequest {
  type: 'redirect' | 'direct';
  order_id: string;
  currency: string;
  amount: number; // in cents
  description: string;
  payment_options: {
    notification_url?: string;
    redirect_url?: string;
    cancel_url?: string;
    close_window?: boolean;
  };
  customer: {
    locale: string;
    ip_address?: string;
    first_name?: string;
    last_name?: string;
    email: string;
  };
  recurring_id?: string;
  recurring_model?: 'cardOnFile' | 'subscription' | 'unscheduled';
}

export interface MultiSafePayOrderResponse {
  success: boolean;
  data?: {
    order_id: string;
    payment_url: string;
    transaction_id: string;
  };
  error_code?: number;
  error_info?: string;
}

const MSP_API_URL = process.env.NEXT_PUBLIC_MSP_TEST_MODE === 'true'
  ? 'https://testapi.multisafepay.com/v1/json/'
  : 'https://api.multisafepay.com/v1/json/';

// Using MULTISAFEPAY_API_KEY as per project configuration
const MSP_API_KEY = process.env.MULTISAFEPAY_API_KEY || '';

function buildMockResponse(orderData: MultiSafePayOrderRequest): MultiSafePayOrderResponse {
  const mockUrl =
    orderData.payment_options.redirect_url ??
    `http://localhost:9002/payment/success?order_id=${encodeURIComponent(orderData.order_id)}&mock=1`;
  console.warn(
    '⚠️ MULTISAFEPAY_API_KEY ontbreekt. Gebruik mock payment URL voor ontwikkelomgeving:',
    mockUrl
  );

  return {
    success: true,
    data: {
      order_id: orderData.order_id,
      payment_url: mockUrl,
      transaction_id: `mock-${Date.now()}`,
    },
  };
}

export async function createMultiSafePayOrder(
  orderData: MultiSafePayOrderRequest
): Promise<MultiSafePayOrderResponse> {
  try {
    if (!MSP_API_KEY) {
      return buildMockResponse(orderData);
    }

    const response = await fetch(`${MSP_API_URL}orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api_key': MSP_API_KEY,
      },
      body: JSON.stringify(orderData),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('MultiSafePay API Error:', error);
    throw new Error('Failed to create payment order');
  }
}

export async function getMultiSafePayOrder(orderId: string) {
  try {
    if (!MSP_API_KEY) {
      console.warn('⚠️ MULTISAFEPAY_API_KEY ontbreekt. Geef mock order status terug voor ontwikkelomgeving.');
      return {
        success: true,
        data: {
          order_id: orderId,
          status: 'initialized',
        },
      };
    }

    const response = await fetch(`${MSP_API_URL}orders/${orderId}`, {
      headers: {
        'api_key': MSP_API_KEY,
      },
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('MultiSafePay API Error:', error);
    throw new Error('Failed to get payment order');
  }
}

// Package configurations
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

/**
 * Calculate discounted price using coupon
 */
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