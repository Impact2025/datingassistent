const { sql } = require('@vercel/postgres');

(async () => {
  try {
    // 1. Haal alle cursussen op
    const cursussen = await sql`
      SELECT id, slug, titel, subtitel, cursus_type, niveau, beschrijving, doelen, gekoppelde_tools, duur_minuten, status
      FROM cursussen
      ORDER BY id
    `;

    console.log('=== ALLE CURSUSSEN (' + cursussen.rows.length + ') ===\n');

    for (const c of cursussen.rows) {
      console.log('--- ' + c.titel + ' ---');
      console.log('  Slug:', c.slug);
      console.log('  Type:', c.cursus_type, '| Niveau:', c.niveau, '| Status:', c.status);
      console.log('  Duur:', c.duur_minuten, 'minuten');
      console.log('  Beschrijving:', (c.beschrijving || '').substring(0, 120) + (c.beschrijving && c.beschrijving.length > 120 ? '...' : ''));
      console.log('  Doelen:', JSON.stringify(c.doelen));
      console.log('  Gekoppelde Tools:', JSON.stringify(c.gekoppelde_tools));
      console.log('');
    }

    // 2. Haal lessen per cursus op
    const lessenQuery = await sql`
      SELECT c.titel as cursus, c.slug as cursus_slug, cl.titel as les, cl.volgorde, cl.beschrijving, cl.duur_minuten
      FROM cursussen c
      LEFT JOIN cursus_lessen cl ON cl.cursus_id = c.id
      ORDER BY c.id, cl.volgorde
    `;

    console.log('\n=== LESSEN PER CURSUS ===\n');
    let currentCursus = '';
    for (const l of lessenQuery.rows) {
      if (l.cursus !== currentCursus) {
        currentCursus = l.cursus;
        console.log('\n📚 ' + l.cursus + ' (' + l.cursus_slug + ')');
      }
      if (l.les) {
        console.log('  ' + l.volgorde + '. ' + l.les + (l.duur_minuten ? ' (' + l.duur_minuten + ' min)' : ''));
        if (l.beschrijving) {
          console.log('     → ' + l.beschrijving.substring(0, 80) + (l.beschrijving.length > 80 ? '...' : ''));
        }
      }
    }

    // 3. Tel secties per les
    const sectiesQuery = await sql`
      SELECT c.titel as cursus, cl.titel as les, cs.sectie_type, COUNT(*) as aantal
      FROM cursussen c
      JOIN cursus_lessen cl ON cl.cursus_id = c.id
      JOIN cursus_secties cs ON cs.les_id = cl.id
      GROUP BY c.titel, cl.titel, cs.sectie_type
      ORDER BY c.titel, cl.titel
    `;

    console.log('\n\n=== SECTIES PER LES ===\n');
    let currentLes = '';
    for (const s of sectiesQuery.rows) {
      const lesKey = s.cursus + ' - ' + s.les;
      if (lesKey !== currentLes) {
        currentLes = lesKey;
        console.log('\n' + s.cursus + ' → ' + s.les);
      }
      console.log('  ' + s.sectie_type + ': ' + s.aantal);
    }

    // 4. Kickstart program_days vergelijken
    const kickstartDays = await sql`
      SELECT dag_nummer, titel, dag_type, emoji, ai_tool
      FROM program_days
      WHERE program_id = (SELECT id FROM programs WHERE slug = 'kickstart')
      ORDER BY dag_nummer
    `;

    console.log('\n\n=== KICKSTART 21-DAGEN PROGRAMMA ===\n');
    for (const d of kickstartDays.rows) {
      console.log('Dag ' + d.dag_nummer + ': ' + d.emoji + ' ' + d.titel + ' [' + d.dag_type + ']' + (d.ai_tool ? ' → AI Tool: ' + d.ai_tool : ''));
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
  process.exit(0);
})();
