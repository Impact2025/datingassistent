import 'dotenv/config';
import { PACKAGES, getPackagePrice } from '@/lib/multisafepay';

const DEFAULT_PLAN = 'core' as const;
const DEFAULT_BILLING: 'monthly' | 'yearly' = 'monthly';

function resolveBaseUrl(): string {
  const candidates = [
    process.env.SMOKE_BASE_URL,
    process.env.NEXT_PUBLIC_BASE_URL,
    process.env.VERCEL_URL,
    'http://localhost:9002',
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    if (candidate.startsWith('http://') || candidate.startsWith('https://')) {
      return candidate;
    }
    return `https://${candidate}`;
  }

  return 'http://localhost:9002';
}

async function request<T = unknown>(input: RequestInfo, init?: RequestInit): Promise<{ ok: boolean; status: number; data: T | null }>
{
  const res = await fetch(input, init);
  let data: T | null = null;

  try {
    data = await res.json();
  } catch {
    // ignore json parse errors (e.g. empty body)
  }

  return { ok: res.ok, status: res.status, data };
}

async function main() {
  const baseUrl = resolveBaseUrl();
  const timestamp = Date.now();
  const email = `smoke+${timestamp}@datingassistent.nl`;
  const password = 'Test1234!';
  const name = 'Smoke Test';

  console.log('🚀 Smoke test start');
  console.log('➡️  Registering user at', baseUrl);

  const registerResponse = await request<{ user: { id: number; email: string }; token: string }>(
    `${baseUrl}/api/auth/register`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    }
  );

  if (!registerResponse.ok || !registerResponse.data) {
    console.error('❌ Registration failed', registerResponse.status, registerResponse.data);
    process.exit(1);
  }

  const userId = registerResponse.data.user.id;
  console.log('✅ Registered user', { userId, email });

  if (process.env.MULTISAFEPAY_API_KEY) {
    const plan = DEFAULT_PLAN;
    const amount = getPackagePrice(plan, DEFAULT_BILLING);
    console.log('➡️  Creating payment order', { plan, billing: DEFAULT_BILLING, amount });

    const paymentResponse = await request<{ success: boolean; paymentUrl?: string; error?: string }>(
      `${baseUrl}/api/payment/create`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageType: plan,
          billingPeriod: DEFAULT_BILLING,
          amount,
          userId,
          userEmail: email,
          customerName: name,
          customerLocale: 'nl_NL',
        }),
      }
    );

    if (!paymentResponse.ok || !paymentResponse.data?.success) {
      console.error('❌ Payment order creation failed', paymentResponse.status, paymentResponse.data);
      process.exit(1);
    }

    console.log('✅ Payment order created', { paymentUrl: paymentResponse.data.paymentUrl });
  } else {
    console.warn('⚠️ MULTISAFEPAY_API_KEY not set, skipping payment step');
  }

  console.log('➡️  Fetching community profile');
  const profileResponse = await request<{ profile: unknown }>(
    `${baseUrl}/api/community/profile?userId=${userId}`
  );

  if (!profileResponse.ok) {
    console.error('❌ Community profile fetch failed', profileResponse.status, profileResponse.data);
    process.exit(1);
  }

  console.log('✅ Community profile accessible');
  console.log('🎉 Smoke test passed');
  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Smoke test encountered an error:', error);
  process.exit(1);
});
