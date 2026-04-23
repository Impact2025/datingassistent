import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getServerSession } from 'next-auth';

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
  }
  const userId = parseInt(session.user.id);

  const result = await sql`
    SELECT article9_consent, article9_consent_at, article9_consent_version
    FROM users WHERE id = ${userId}
  `;

  if (!result.rows[0]) {
    return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 });
  }

  const row = result.rows[0];
  return NextResponse.json({
    hasConsent:  row.article9_consent ?? false,
    consentAt:   row.article9_consent_at ?? null,
    version:     row.article9_consent_version ?? null,
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
  }
  const userId = parseInt(session.user.id);

  const body = await request.json().catch(() => ({}));
  const version = body.version ?? '1.0';

  // Haal IP op voor audit log (AVG vereist aantoonbaarheid)
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';

  await sql`
    UPDATE users SET
      article9_consent         = TRUE,
      article9_consent_at      = NOW(),
      article9_consent_version = ${version}
    WHERE id = ${userId}
  `;

  // Audit log
  await sql`
    INSERT INTO user_activity_log (user_id, action, metadata, created_at)
    VALUES (
      ${userId},
      'article9_consent_given',
      ${JSON.stringify({ version, ip, timestamp: new Date().toISOString() })},
      NOW()
    )
    ON CONFLICT DO NOTHING
  `.catch(() => {}); // silent — activity_log mag missen

  return NextResponse.json({ success: true, version });
}

// Intrekken van Artikel 9-toestemming (Art. 7 lid 3 AVG)
export async function DELETE() {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
  }
  const userId = parseInt(session.user.id);

  await sql`
    UPDATE users SET
      article9_consent         = FALSE,
      article9_consent_at      = NULL,
      article9_consent_version = NULL
    WHERE id = ${userId}
  `;

  return NextResponse.json({
    success: true,
    message: 'Toestemming ingetrokken. Je Art.9-data wordt niet langer verwerkt voor nieuwe interacties.',
  });
}
