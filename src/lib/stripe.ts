import Stripe from 'stripe';

// Lazy initialization — voorkomt build-time crash als STRIPE_SECRET_KEY ontbreekt
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');
    _stripe = new Stripe(key, {
      apiVersion: '2026-03-25.dahlia',
      typescript: true,
    });
  }
  return _stripe;
}

// Named export voor backwards compat met bestaande imports
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

/**
 * Verify a Stripe webhook signature and construct the event.
 * Throws if invalid — let the caller handle the 400 response.
 */
export function constructStripeEvent(
  rawBody: string,
  signature: string,
  secret: string
): Stripe.Event {
  return getStripe().webhooks.constructEvent(rawBody, signature, secret);
}
