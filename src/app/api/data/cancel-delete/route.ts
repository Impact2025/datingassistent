import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { verifyToken } from '@/lib/auth';
import { sendEmail } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
  }

  const user = await verifyToken(authHeader.substring(7));
  if (!user) {
    return NextResponse.json({ error: 'Ongeldig token' }, { status: 401 });
  }

  const pending = await sql`
    SELECT id FROM data_requests
    WHERE user_id    = ${user.id}
      AND request_type = 'delete'
      AND status       = 'pending'
    LIMIT 1
  `;

  if (pending.rows.length === 0) {
    return NextResponse.json(
      { error: 'Geen actief verwijderverzoek gevonden' },
      { status: 404 }
    );
  }

  await sql`
    UPDATE data_requests SET
      status       = 'cancelled',
      completed_at = NOW()
    WHERE id = ${pending.rows[0].id}
  `;

  await sql`
    UPDATE users SET
      data_retention_until = NULL
    WHERE id = ${user.id}
  `;

  // Bevestigingsemail
  await sendEmail({
    to: user.email,
    subject: 'Verwijderverzoek ingetrokken — DatingAssistent',
    html: `
      <p>Je verwijderverzoek is ingetrokken. Je account blijft actief.</p>
      <p>Als je later toch je account wilt verwijderen, kan dat via Instellingen → Privacy.</p>
      <p>DatingAssistent Team</p>
    `,
  }).catch(console.error);

  return NextResponse.json({ success: true });
}
