import 'dotenv/config';
import { createMultiSafePayOrder } from '@/lib/multisafepay';

async function main() {
  const apiKey = process.env.MULTISAFEPAY_API_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL;

  if (!apiKey) {
    throw new Error('MULTISAFEPAY_API_KEY is not configured');
  }

  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_BASE_URL or VERCEL_URL must be configured');
  }

  const orderId = `TEST-${Date.now()}`;

  console.log('🔁 Creating test MultiSafepay order...', { orderId, baseUrl });

  const response = await createMultiSafePayOrder({
    type: 'redirect',
    order_id: orderId,
    currency: 'EUR',
    amount: 1000,
    description: 'DatingAssistent test order',
    payment_options: {
      notification_url: `${baseUrl}/api/payment/webhook`,
      redirect_url: `${baseUrl}/payment/success?order_id=${orderId}`,
      cancel_url: `${baseUrl}/payment/cancelled`,
    },
    customer: {
      locale: 'nl_NL',
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'Order',
    },
  });

  if (!response.success) {
    console.error('❌ Failed to create test order:', response.error_info || response.error_code);
    process.exit(1);
  }

  console.log('✅ Test order created successfully');
  console.log('ℹ️ Payment URL:', response.data?.payment_url);
}

main().catch((error) => {
  console.error('❌ MultiSafepay test failed:', error);
  process.exit(1);
});
