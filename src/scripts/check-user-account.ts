/**
 * Diagnostic script: check user account details
 * Run: npx tsx src/scripts/check-user-account.ts [email]
 */
import { sql } from '@vercel/postgres';

const log = (...args: any[]) => console.log(...args);

async function checkUser(email: string) {
  const userResult = await sql`
    SELECT
      u.id, u.email, u.first_name, u.last_name,
      u.subscription_type, u.is_email_verified, u.created_at,
      u.email_verified_at
    FROM users u
    WHERE u.email = ${email}
    LIMIT 1
  `;

  if (userResult.rows.length === 0) {
    log('❌ Gebruiker niet gevonden:', email);
    return;
  }

  const u = userResult.rows[0];
  log('\n=== ACCOUNT INFO ===');
  log(`ID:                ${u.id}`);
  log(`Email:             ${u.email}`);
  log(`Naam:              ${u.first_name} ${u.last_name}`);
  log(`Subscription type: ${u.subscription_type ?? '(null — wordt "free" in email)'}`);
  log(`Email verified:    ${u.is_email_verified} (op: ${u.email_verified_at ?? 'nog niet'})`);
  log(`Aangemeld:         ${u.created_at}`);

  // Latest subscription
  const subResult = await sql`
    SELECT tier, plan_name, started_at, expires_at, status
    FROM subscription_history
    WHERE user_id = ${u.id}
    ORDER BY started_at DESC
    LIMIT 3
  `;
  log('\n=== ABONNEMENTEN (laatste 3) ===');
  if (subResult.rows.length === 0) {
    log('  (geen)');
  } else {
    subResult.rows.forEach(s => {
      log(`  Tier: ${s.tier} | Plan: ${s.plan_name} | Status: ${s.status}`);
      log(`  Van: ${s.started_at} → Tot: ${s.expires_at ?? 'onbeperkt'}`);
    });
  }

  // Program enrollments
  const enrollResult = await sql`
    SELECT pe.status, pe.enrolled_at, pe.expires_at, p.slug, p.name
    FROM program_enrollments pe
    JOIN programs p ON p.id = pe.program_id
    WHERE pe.user_id = ${u.id}
  `;
  log('\n=== PROGRAMMA INSCHRIJVINGEN ===');
  if (enrollResult.rows.length === 0) {
    log('  (geen)');
  } else {
    enrollResult.rows.forEach(e => {
      log(`  ${e.slug} (${e.name}): ${e.status}`);
      log(`  Ingeschreven: ${e.enrolled_at} | Verloopt: ${e.expires_at ?? 'onbeperkt'}`);
    });
  }

  // Transformatie lesson progress
  const progressResult = await sql`
    SELECT
      COUNT(tl.id) as total_lessons,
      COUNT(tlp.id) FILTER (WHERE tlp.status = 'completed') as completed
    FROM transformatie_lessons tl
    JOIN transformatie_modules tm ON tl.module_id = tm.id
    JOIN programs pr ON tm.program_id = pr.id
    LEFT JOIN transformatie_lesson_progress tlp
      ON tlp.lesson_id = tl.id AND tlp.user_id = ${u.id}
    WHERE pr.slug = 'transformatie' AND tl.is_published = true
  `;
  const p = progressResult.rows[0];
  log('\n=== TRANSFORMATIE VOORTGANG ===');
  log(`  Voltooid: ${p.completed} / ${p.total_lessons} lessen`);

  // Check first lesson content (spot-check)
  const firstLesson = await sql`
    SELECT tl.title, tl.reflectie, tl.content
    FROM transformatie_lessons tl
    JOIN transformatie_modules tm ON tl.module_id = tm.id
    JOIN programs pr ON tm.program_id = pr.id
    WHERE pr.slug = 'transformatie' AND tl.is_published = true
    ORDER BY tm.module_order, tl.lesson_order
    LIMIT 1
  `;
  if (firstLesson.rows.length > 0) {
    const fl = firstLesson.rows[0];
    log('\n=== LES 1 CONTENT CHECK ===');
    log(`  Titel: ${fl.title}`);
    log(`  Reflectie: ${fl.reflectie ? '✓ aanwezig' : '❌ ontbreekt'}`);
    log(`  Content:   ${fl.content ? '✓ aanwezig' : '❌ ontbreekt'}`);
    if (fl.reflectie) {
      log(`  Spiegel:   "${fl.reflectie.spiegel?.substring(0, 60)}..."`);
    }
  }

  log('\n✅ Check compleet\n');
}

const email = process.argv[2] || 'vincent@bioexpress.nl';
checkUser(email).catch(console.error);
