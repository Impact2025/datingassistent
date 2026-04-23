import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { verifyToken } from '@/lib/auth';

type RestrictReason = 'accuracy_dispute' | 'unlawful_processing' | 'no_longer_needed' | 'objection_pending';

const REASON_LABELS: Record<RestrictReason, string> = {
  accuracy_dispute:     'Juistheid van de gegevens wordt betwist',
  unlawful_processing:  'Verwerking is onrechtmatig maar betrokkene verzet zich tegen verwijdering',
  no_longer_needed:     'Gegevens niet meer nodig, maar betrokkene heeft ze nodig voor rechtsvordering',
  objection_pending:    'Bezwaar ingediend — beperking lopende beslissing',
};

// POST: Verzoek tot beperking van verwerking (Art. 18 AVG)
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
  }
  const user = await verifyToken(authHeader.substring(7));
  if (!user) return NextResponse.json({ error: 'Ongeldig token' }, { status: 401 });

  const { reason, toelichting } = await request.json();
  if (!REASON_LABELS[reason as RestrictReason]) {
    return NextResponse.json({ error: 'Ongeldige reden' }, { status: 400 });
  }

  await sql`
    UPDATE users SET
      processing_restricted        = TRUE,
      processing_restricted_at     = NOW(),
      processing_restricted_reason = ${reason}
    WHERE id = ${user.id}
  `;

  await sql`
    INSERT INTO data_requests (user_id, request_type, status, data)
    VALUES (${user.id}, 'restrict', 'pending', ${JSON.stringify({
      reason,
      reasonLabel: REASON_LABELS[reason as RestrictReason],
      toelichting: toelichting ?? null,
      requestedAt: new Date().toISOString(),
    })})
  `.catch(() => {});

  return NextResponse.json({
    success: true,
    message: 'Beperkingsverzoek ontvangen. Verwerking van je gegevens is beperkt tot opslag.',
  });
}

// DELETE: Hef beperking op (gebruiker trekt verzoek in)
export async function DELETE(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
  }
  const user = await verifyToken(authHeader.substring(7));
  if (!user) return NextResponse.json({ error: 'Ongeldig token' }, { status: 401 });

  await sql`
    UPDATE users SET
      processing_restricted        = FALSE,
      processing_restricted_at     = NULL,
      processing_restricted_reason = NULL
    WHERE id = ${user.id}
  `;

  return NextResponse.json({ success: true, message: 'Beperking opgeheven.' });
}
