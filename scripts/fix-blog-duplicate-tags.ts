/**
 * Fix duplicate tags/keywords across all blog posts.
 *
 * Problem: allTags = [...blog.tags, ...blog.keywords] caused duplicates when
 * the same value appeared in both arrays (e.g. "Koningsdag" in tags AND keywords).
 *
 * This script:
 * 1. Deduplicates within tags (case-insensitive)
 * 2. Deduplicates within keywords (case-insensitive)
 * 3. Removes from keywords any value already present in tags
 * 4. Updates the database for every blog that changed
 *
 * Run: npx tsx scripts/fix-blog-duplicate-tags.ts
 */

import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

function parseJsonArray(val: unknown): string[] {
  if (Array.isArray(val)) return val as string[];
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return []; }
  }
  return [];
}

function deduplicateArray(arr: string[]): string[] {
  const seen = new Set<string>();
  return arr.filter(v => {
    const key = v.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function removeOverlap(primary: string[], secondary: string[]): string[] {
  const primaryKeys = new Set(primary.map(v => v.toLowerCase().trim()));
  return secondary.filter(v => !primaryKeys.has(v.toLowerCase().trim()));
}

async function main() {
  console.log('Fetching all blogs...');

  const rows = await sql`
    SELECT id, slug, title, tags, keywords FROM blogs ORDER BY id
  `;

  console.log(`Found ${rows.length} blogs\n`);

  let fixed = 0;
  let clean = 0;

  for (const row of rows) {
    const originalTags     = parseJsonArray(row.tags);
    const originalKeywords = parseJsonArray(row.keywords);

    // Step 1: deduplicate each array internally
    const dedupedTags     = deduplicateArray(originalTags);
    // Step 2: remove from keywords anything already in (deduped) tags
    const dedupedKeywords = deduplicateArray(removeOverlap(dedupedTags, originalKeywords));

    const tagsChanged     = JSON.stringify(dedupedTags)     !== JSON.stringify(originalTags);
    const keywordsChanged = JSON.stringify(dedupedKeywords) !== JSON.stringify(originalKeywords);

    if (!tagsChanged && !keywordsChanged) {
      console.log(`✅  [${row.id}] "${row.slug}" — geen duplicaten`);
      clean++;
      continue;
    }

    // Show what changed
    if (tagsChanged) {
      console.log(`🔧  [${row.id}] "${row.slug}" — tags:`);
      console.log(`    voor:  ${JSON.stringify(originalTags)}`);
      console.log(`    na:    ${JSON.stringify(dedupedTags)}`);
    }
    if (keywordsChanged) {
      console.log(`🔧  [${row.id}] "${row.slug}" — keywords:`);
      console.log(`    voor:  ${JSON.stringify(originalKeywords)}`);
      console.log(`    na:    ${JSON.stringify(dedupedKeywords)}`);
    }

    await sql`
      UPDATE blogs
      SET tags     = ${JSON.stringify(dedupedTags)},
          keywords = ${JSON.stringify(dedupedKeywords)},
          updated_at = NOW()
      WHERE id = ${row.id}
    `;

    fixed++;
  }

  console.log(`\nKlaar: ${fixed} blogs bijgewerkt, ${clean} waren al schoon.`);
}

main().catch(err => {
  console.error('Script mislukt:', err);
  process.exit(1);
});
