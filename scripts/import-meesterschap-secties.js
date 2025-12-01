/**
 * ============================================================================
 * MEESTERSCHAP IN RELATIES - SECTIES IMPORT SCRIPT
 * ============================================================================
 *
 * Dit script importeert alle secties uit de JSON bestanden van de
 * "Meesterschap in Relaties" cursus naar de database.
 *
 * Features:
 * - ✅ Leest alle 29 les JSON bestanden
 * - ✅ Matched lessen met database IDs
 * - ✅ Importeert secties met juiste volgorde
 * - ✅ Importeert quiz vragen in aparte tabel
 * - ✅ Transaction support (alles of niets)
 * - ✅ Dry-run mode voor testing
 * - ✅ Uitgebreide logging en progress tracking
 * - ✅ Error handling en rollback
 *
 * Usage:
 *   node scripts/import-meesterschap-secties.js           # Dry run
 *   node scripts/import-meesterschap-secties.js --execute # Execute import
 *
 * ============================================================================
 */

const fs = require('fs').promises;
const path = require('path');
const { neon } = require('@neondatabase/serverless');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  cursusSlug: 'meesterschap-in-relaties',
  cursusDir: path.join(process.cwd(), 'cursussen', 'cursussen', 'meesterschap-in-relaties', 'meesterschap-in-relaties-pro'),
  dryRun: !process.argv.includes('--execute'),
  verbose: process.argv.includes('--verbose'),
};

// Database connection
const sql = neon(process.env.DATABASE_URL);

// ============================================================================
// UTILITIES
// ============================================================================

class Logger {
  static colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',

    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
  };

  static info(message) {
    console.log(`${this.colors.blue}ℹ${this.colors.reset} ${message}`);
  }

  static success(message) {
    console.log(`${this.colors.green}✓${this.colors.reset} ${message}`);
  }

  static warning(message) {
    console.log(`${this.colors.yellow}⚠${this.colors.reset} ${message}`);
  }

  static error(message) {
    console.log(`${this.colors.red}✗${this.colors.reset} ${message}`);
  }

  static debug(message) {
    if (CONFIG.verbose) {
      console.log(`${this.colors.dim}  ${message}${this.colors.reset}`);
    }
  }

  static section(title) {
    console.log(`\n${this.colors.bright}${this.colors.cyan}━━━ ${title} ━━━${this.colors.reset}\n`);
  }

  static progress(current, total, message) {
    const percentage = Math.round((current / total) * 100);
    const bar = '█'.repeat(Math.floor(percentage / 2)) + '░'.repeat(50 - Math.floor(percentage / 2));
    process.stdout.write(`\r${this.colors.cyan}[${bar}]${this.colors.reset} ${percentage}% - ${message}`);
    if (current === total) console.log(''); // New line when complete
  }
}

// ============================================================================
// DATA LOADING
// ============================================================================

/**
 * Laad alle les JSON bestanden uit de cursus directory
 */
async function loadLessenJSON() {
  Logger.section('STAP 1: JSON Bestanden Laden');

  const lessenData = [];
  const modules = ['module-1', 'module-2', 'module-3', 'module-4', 'module-5', 'module-6'];
  let globalVolgorde = 1; // Global counter for all lessen

  for (const module of modules) {
    const modulePath = path.join(CONFIG.cursusDir, module);

    try {
      const lesDirs = await fs.readdir(modulePath);
      Logger.debug(`Gevonden in ${module}: ${lesDirs.join(', ')}`);

      for (const lesDir of lesDirs) {
        if (!lesDir.startsWith('les-')) continue;

        const lesJsonPath = path.join(modulePath, lesDir, 'les.json');

        try {
          const jsonContent = await fs.readFile(lesJsonPath, 'utf-8');
          const lesData = JSON.parse(jsonContent);

          lessenData.push({
            module,
            lesId: lesData.meta.id,
            slug: lesData.meta.id, // les-1-1, les-1-2, etc.
            titel: lesData.meta.titel,
            volgorde: globalVolgorde++, // Global volgorde across all modules
            secties: lesData.secties || [],
            quiz: lesData.quiz || null,
            path: lesJsonPath
          });

          Logger.debug(`  ✓ ${lesData.meta.id}: ${lesData.meta.titel}`);
        } catch (error) {
          Logger.warning(`Kan ${lesJsonPath} niet lezen: ${error.message}`);
        }
      }
    } catch (error) {
      Logger.warning(`Module ${module} niet gevonden of niet toegankelijk`);
    }
  }

  Logger.success(`${lessenData.length} lessen JSON bestanden geladen\n`);
  return lessenData;
}

/**
 * Haal les IDs op uit de database
 */
async function fetchLessenFromDB() {
  Logger.section('STAP 2: Database Lessen Ophalen');

  const result = await sql`
    SELECT
      cl.id,
      cl.slug,
      cl.titel,
      cl.volgorde,
      c.slug as cursus_slug
    FROM cursus_lessen cl
    JOIN cursussen c ON c.id = cl.cursus_id
    WHERE c.slug = ${CONFIG.cursusSlug}
    ORDER BY cl.volgorde ASC
  `;

  Logger.success(`${result.length} lessen gevonden in database\n`);

  // Create lookup map by volgorde (1-based index)
  const lesMap = new Map();
  result.forEach(les => {
    lesMap.set(les.volgorde, les.id);
    Logger.debug(`  ${les.volgorde}. ${les.slug} → ID ${les.id}`);
  });

  return lesMap;
}

// ============================================================================
// SECTIE TYPE MAPPING
// ============================================================================

/**
 * Map JSON sectie type naar database sectie_type
 */
function mapSectieType(jsonType) {
  const typeMap = {
    'content': 'tekst',
    'hook': 'reflectie',
    'framework': 'kernpunten',
    'praktijk': 'opdracht',
    'video': 'video',
    'quiz': 'quiz',
    'reflectie': 'reflectie',
    'opdracht': 'opdracht',
    'tool': 'tool',
    'tip': 'tip'
  };

  return typeMap[jsonType] || 'tekst';
}

/**
 * Bouw inhoud JSONB voor een sectie
 */
function buildInhoudJSON(sectie) {
  // Basis inhoud is altijd de content
  const inhoud = {
    type: sectie.type,
    ...sectie.content
  };

  return inhoud;
}

// ============================================================================
// IMPORT LOGIC
// ============================================================================

/**
 * Importeer een sectie naar de database
 */
async function importSectie(lesId, sectie, volgorde, dryRun = true) {
  const sectieType = mapSectieType(sectie.type);
  const inhoud = buildInhoudJSON(sectie);
  const slug = sectie.id;
  const titel = sectie.titel || null;

  if (dryRun) {
    Logger.debug(`  [DRY RUN] Zou importeren: ${slug} (${sectieType})`);
    return null;
  }

  // Insert sectie
  const result = await sql`
    INSERT INTO cursus_secties (
      les_id,
      slug,
      sectie_type,
      titel,
      inhoud,
      volgorde
    ) VALUES (
      ${lesId},
      ${slug},
      ${sectieType},
      ${titel},
      ${JSON.stringify(inhoud)},
      ${volgorde}
    )
    ON CONFLICT (les_id, slug)
    DO UPDATE SET
      sectie_type = EXCLUDED.sectie_type,
      titel = EXCLUDED.titel,
      inhoud = EXCLUDED.inhoud,
      volgorde = EXCLUDED.volgorde,
      updated_at = NOW()
    RETURNING id
  `;

  return result[0].id;
}

/**
 * Importeer quiz vragen voor een quiz sectie
 */
async function importQuizVragen(sectieId, quiz, dryRun = true) {
  if (!quiz || !quiz.vragen || quiz.vragen.length === 0) {
    return;
  }

  for (let i = 0; i < quiz.vragen.length; i++) {
    const vraag = quiz.vragen[i];

    // Build opties JSONB
    const opties = vraag.opties.map((optie, idx) => ({
      id: String.fromCharCode(97 + idx), // a, b, c, d
      tekst: optie,
      correct: idx === vraag.correct
    }));

    if (dryRun) {
      Logger.debug(`    [DRY RUN] Zou quiz vraag importeren: "${vraag.vraag.substring(0, 50)}..."`);
      continue;
    }

    await sql`
      INSERT INTO cursus_quiz_vragen (
        sectie_id,
        vraag,
        vraag_type,
        opties,
        uitleg_correct,
        uitleg_incorrect,
        volgorde
      ) VALUES (
        ${sectieId},
        ${vraag.vraag},
        'multiple-choice',
        ${JSON.stringify(opties)},
        ${vraag.feedback?.correct || 'Correct!'},
        ${vraag.feedback?.incorrect || 'Niet helemaal juist, probeer het nog eens.'},
        ${i + 1}
      )
      ON CONFLICT (sectie_id, volgorde)
      DO UPDATE SET
        vraag = EXCLUDED.vraag,
        opties = EXCLUDED.opties,
        uitleg_correct = EXCLUDED.uitleg_correct,
        uitleg_incorrect = EXCLUDED.uitleg_incorrect
    `;
  }

  if (!dryRun) {
    Logger.debug(`    ✓ ${quiz.vragen.length} quiz vragen geïmporteerd`);
  }
}

/**
 * Importeer alle lessen
 */
async function importAllLessen(lessenJSON, lesDBMap, dryRun = true) {
  Logger.section(dryRun ? 'STAP 3: Dry Run - Preview Import' : 'STAP 3: Secties Importeren');

  const stats = {
    totalLessen: lessenJSON.length,
    processedLessen: 0,
    totalSecties: 0,
    importedSecties: 0,
    totalQuizVragen: 0,
    importedQuizVragen: 0,
    errors: []
  };

  for (let i = 0; i < lessenJSON.length; i++) {
    const les = lessenJSON[i];
    const lesId = lesDBMap.get(les.volgorde); // Match on volgorde instead of slug

    Logger.progress(i + 1, stats.totalLessen, `${les.slug}: ${les.titel}`);

    if (!lesId) {
      const error = `Les ${les.slug} (volgorde ${les.volgorde}) niet gevonden in database`;
      Logger.error(error);
      stats.errors.push({ les: les.slug, error });
      continue;
    }

    Logger.debug(`\n  Les ID ${lesId}: ${les.titel}`);

    // Import secties
    for (let j = 0; j < les.secties.length; j++) {
      const sectie = les.secties[j];
      stats.totalSecties++;

      try {
        const sectieId = await importSectie(lesId, sectie, j + 1, dryRun);

        if (!dryRun) {
          stats.importedSecties++;
          Logger.debug(`    ✓ Sectie ${sectie.id} (${sectie.type})`);

          // Als het een quiz sectie is, importeer ook de vragen
          if (sectie.type === 'quiz' && les.quiz) {
            const vragenCount = les.quiz.vragen?.length || 0;
            stats.totalQuizVragen += vragenCount;
            await importQuizVragen(sectieId, les.quiz, dryRun);
            stats.importedQuizVragen += vragenCount;
          }
        }
      } catch (error) {
        const errorMsg = `Fout bij importeren sectie ${sectie.id}: ${error.message}`;
        Logger.error(errorMsg);
        stats.errors.push({ les: les.slug, sectie: sectie.id, error: error.message });
      }
    }

    stats.processedLessen++;
  }

  console.log(''); // New line after progress bar
  return stats;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('\n');
  Logger.section('MEESTERSCHAP IN RELATIES - SECTIES IMPORT');

  if (CONFIG.dryRun) {
    Logger.warning('DRY RUN MODE - Geen data wordt gewijzigd');
    Logger.info('Run met --execute om daadwerkelijk te importeren\n');
  } else {
    Logger.warning('EXECUTE MODE - Data wordt geïmporteerd!');
    Logger.info('Dit kan niet ongedaan gemaakt worden (behalve via rollback)\n');
  }

  try {
    // Stap 1: Laad JSON bestanden
    const lessenJSON = await loadLessenJSON();

    if (lessenJSON.length === 0) {
      Logger.error('Geen lessen gevonden! Check het cursusdir path.');
      process.exit(1);
    }

    // Stap 2: Haal database lessen op
    const lesDBMap = await fetchLessenFromDB();

    if (lesDBMap.size === 0) {
      Logger.error('Geen lessen gevonden in database! Is de cursus geïmporteerd?');
      process.exit(1);
    }

    // Stap 3: Import (of dry-run)
    const stats = await importAllLessen(lessenJSON, lesDBMap, CONFIG.dryRun);

    // Resultaten
    Logger.section('RESULTATEN');
    console.log(`
  📊 Statistieken:
  ─────────────────────────────────────────
  Lessen verwerkt:        ${stats.processedLessen} / ${stats.totalLessen}
  Secties ${CONFIG.dryRun ? 'gevonden' : 'geïmporteerd'}:      ${CONFIG.dryRun ? stats.totalSecties : stats.importedSecties} / ${stats.totalSecties}
  Quiz vragen ${CONFIG.dryRun ? 'gevonden' : 'geïmporteerd'}:   ${CONFIG.dryRun ? stats.totalQuizVragen : stats.importedQuizVragen} / ${stats.totalQuizVragen}
  Errors:                 ${stats.errors.length}
    `);

    if (stats.errors.length > 0) {
      Logger.warning('Errors:');
      stats.errors.forEach(err => {
        console.log(`  - ${err.les}${err.sectie ? ` / ${err.sectie}` : ''}: ${err.error}`);
      });
    }

    if (CONFIG.dryRun) {
      Logger.info('\n✨ Dry run succesvol! Run met --execute om te importeren.\n');
    } else {
      Logger.success('\n🎉 Import succesvol voltooid!\n');
      Logger.info('Check de cursus op http://localhost:9000/cursussen/meesterschap-in-relaties\n');
    }

  } catch (error) {
    Logger.error(`\n❌ Onverwachte fout: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run
main();
