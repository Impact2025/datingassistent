import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * GDPR Cleanup Cron — draait elke nacht om 02:00 UTC
 *
 * Fase 1: Voer pending verwijderverzoeken uit die de 30-daagse cooling-off voorbij zijn
 * Fase 2: Verwijder iris_conversations ouder dan 12 maanden (privacyverklaring)
 * Fase 3: Verwijder user_activity_log ouder dan 24 maanden
 * Fase 4: Ruim verlopen verificatietokens op
 */
export async function GET(request: NextRequest) {
  const secret = request.headers.get('authorization');
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = {
    accountsDeleted:       0,
    conversationsDeleted:  0,
    activityLogsDeleted:   0,
    tokensCleared:         0,
    errors:                [] as string[],
  };

  // ═══════════════════════════════════════════════════════
  // FASE 1: Verwijder accounts waarvan cooling-off voorbij is
  // ═══════════════════════════════════════════════════════
  try {
    const pendingDeletions = await sql`
      SELECT dr.id AS request_id, dr.user_id, dr.data, u.email, u.name
      FROM   data_requests dr
      JOIN   users u ON u.id = dr.user_id
      WHERE  dr.request_type = 'delete'
        AND  dr.status       = 'pending'
        AND  (dr.data->>'scheduledDeletionDate')::timestamptz <= NOW()
        AND  (u.processing_restricted IS NULL OR u.processing_restricted = FALSE)
    `;

    for (const row of pendingDeletions.rows) {
      try {
        await deleteUserData(row.user_id);

        // Anonimiseer users record — behoud rij voor fiscale referenties
        await sql`
          UPDATE users SET
            email               = CONCAT('deleted_', id, '@removed.invalid'),
            name                = 'Verwijderd',
            password_hash       = NULL,
            profile             = NULL,
            article9_consent    = FALSE,
            article9_consent_at = NULL,
            updated_at          = NOW()
          WHERE id = ${row.user_id}
        `;

        await sql`
          UPDATE data_requests SET
            status       = 'completed',
            completed_at = NOW()
          WHERE id = ${row.request_id}
        `;

        // Bevestigingsemail via email-service (fire-and-forget)
        sendDeletionConfirmEmail(row.email, row.name, row.request_id).catch(console.error);

        results.accountsDeleted++;
        logger.log(`🗑️ GDPR: account ${row.user_id} permanent verwijderd`);

      } catch (err: any) {
        results.errors.push(`Account ${row.user_id}: ${err.message}`);
        console.error(`GDPR delete fout voor user ${row.user_id}:`, err);
      }
    }
  } catch (err: any) {
    results.errors.push(`Fase 1 fout: ${err.message}`);
  }

  // ═══════════════════════════════════════════════════════
  // FASE 2: Chat-gesprekken ouder dan 12 maanden
  // (privacyverklaring belofte + art. 5 lid 1 sub e AVG)
  // ═══════════════════════════════════════════════════════
  try {
    const chats = await sql`
      DELETE FROM iris_conversations
      WHERE created_at < NOW() - INTERVAL '12 months'
      RETURNING id
    `;
    results.conversationsDeleted += chats.rowCount ?? 0;

    // coach_client_messages indien aanwezig
    await sql`
      DELETE FROM coach_client_messages
      WHERE created_at < NOW() - INTERVAL '12 months'
    `.catch(() => {}); // tabel bestaat mogelijk niet in alle omgevingen

  } catch (err: any) {
    results.errors.push(`Fase 2 fout: ${err.message}`);
  }

  // ═══════════════════════════════════════════════════════
  // FASE 3: Activiteitslog ouder dan 24 maanden
  // ═══════════════════════════════════════════════════════
  try {
    const logs = await sql`
      DELETE FROM user_activity_log
      WHERE created_at < NOW() - INTERVAL '24 months'
      RETURNING id
    `;
    results.activityLogsDeleted += logs.rowCount ?? 0;
  } catch (err: any) {
    results.errors.push(`Fase 3 fout: ${err.message}`);
  }

  // ═══════════════════════════════════════════════════════
  // FASE 4: Verlopen verificatietokens opruimen
  // ═══════════════════════════════════════════════════════
  try {
    await sql`
      UPDATE users SET
        verification_token      = NULL,
        verification_expires_at = NULL
      WHERE verification_expires_at < NOW() - INTERVAL '7 days'
        AND verification_token IS NOT NULL
    `;
    results.tokensCleared++;
  } catch (err: any) {
    results.errors.push(`Fase 4 fout: ${err.message}`);
  }

  const hasErrors = results.errors.length > 0;
  logger.log('GDPR cleanup voltooid:', results);

  return NextResponse.json({
    success: !hasErrors,
    ...results,
    runAt: new Date().toISOString(),
  });
}

// ═══════════════════════════════════════════════════════
// Helper: verwijder alle persoonlijke data van een gebruiker
// Betalingsdata wordt NIET verwijderd (fiscale bewaarplicht 7 jaar)
// ═══════════════════════════════════════════════════════
async function deleteUserData(userId: number) {
  // Verwijder in volgorde om FK-fouten te voorkomen
  const tables = [
    'iris_conversations',
    'user_reflections',
    'user_goals',
    'goal_progress',
    'goal_hierarchies',
    'user_activity_log',
    'hechtingsstijl_assessments',
    'dating_snapshot_profiles',
    'transformatie_onboarding',
    'kickstart_onboarding',
    'ai_context_cache',
    'iris_user_context',
    'weekly_dating_logs',
    'push_subscriptions',
    'notification_queue',
  ];

  for (const table of tables) {
    await sql.query(
      `DELETE FROM ${table} WHERE user_id = $1`,
      [userId]
    ).catch(() => {}); // stil mislukken als tabel niet bestaat
  }

  // user_profiles via CASCADE of directe delete
  await sql`DELETE FROM user_profiles WHERE user_id = ${userId}`.catch(() => {});
}

// ═══════════════════════════════════════════════════════
// Helper: stuur bevestigingsemail na verwijdering
// ═══════════════════════════════════════════════════════
async function sendDeletionConfirmEmail(email: string, name: string, requestId: number) {
  const { sendEmail } = await import('@/lib/email-service');
  await sendEmail({
    to: email,
    subject: 'Je account is permanent verwijderd — DatingAssistent',
    html: `
      <p>Hoi ${name || 'daar'},</p>
      <p>Je account en persoonlijke gegevens zijn vandaag permanent verwijderd (verzoek #${requestId}).</p>
      <p>Betaalgeschiedenis wordt conform de fiscale bewaarplicht (7 jaar) bewaard.</p>
      <p>Als je vragen hebt, neem contact op via <a href="mailto:privacy@datingassistent.nl">privacy@datingassistent.nl</a>.</p>
      <p>DatingAssistent Team</p>
    `,
  });
}
