import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { verifyToken } from '@/lib/auth';

type ObjectGround = 'direct_marketing' | 'legitimate_interest' | 'scientific_research';

// POST: Bezwaarrecht (Art. 21 AVG)
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
  }
  const user = await verifyToken(authHeader.substring(7));
  if (!user) return NextResponse.json({ error: 'Ongeldig token' }, { status: 401 });

  const { ground, toelichting } = await request.json();
  const validGrounds: ObjectGround[] = ['direct_marketing', 'legitimate_interest', 'scientific_research'];
  if (!validGrounds.includes(ground)) {
    return NextResponse.json({ error: 'Ongeldige grond' }, { status: 400 });
  }

  // Direct marketing: onmiddellijk stoppen (Art. 21 lid 3 AVG — absolute recht)
  if (ground === 'direct_marketing') {
    await sql`
      UPDATE email_preferences SET
        marketing_emails   = FALSE,
        unsubscribed_all   = TRUE,
        unsubscribed_at    = NOW()
      WHERE user_id = ${user.id}
    `.catch(async () => {
      // Tabel bestaat mogelijk — alsnog aanmaken
      await sql`
        INSERT INTO email_preferences (user_id, marketing_emails, unsubscribed_all, unsubscribed_at)
        VALUES (${user.id}, FALSE, TRUE, NOW())
        ON CONFLICT (user_id) DO UPDATE SET
          marketing_emails = FALSE,
          unsubscribed_all = TRUE,
          unsubscribed_at  = NOW()
      `.catch(() => {});
    });
  }

  await sql`
    INSERT INTO data_requests (user_id, request_type, status, data)
    VALUES (${user.id}, 'object', 'pending', ${JSON.stringify({
      ground,
      toelichting: toelichting ?? null,
      directMarketingStopped: ground === 'direct_marketing',
      requestedAt: new Date().toISOString(),
    })})
  `.catch(() => {});

  const message =
    ground === 'direct_marketing'
      ? 'Bezwaar verwerkt. Marketing e-mails zijn direct gestopt.'
      : 'Bezwaar ontvangen. We beoordelen je verzoek binnen 30 dagen.';

  return NextResponse.json({ success: true, message });
}
