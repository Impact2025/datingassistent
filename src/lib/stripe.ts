import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
  typescript: true,
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
  return stripe.webhooks.constructEvent(rawBody, signature, secret);
}
