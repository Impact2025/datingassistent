/**
 * Migration script: replace console.log with logger.log
 *
 * - Replaces console.log( → logger.log( in all src/**\/*.ts(x) files
 * - Adds `import { logger } from '@/lib/logger'` where missing
 * - Skips src/lib/logger.ts (intentional console usage)
 * - Dry-run mode: pass --dry to preview without writing
 */

import { readFileSync, writeFileSync } from 'fs';
import { globSync } from 'glob';
import path from 'path';

const isDry = process.argv.includes('--dry');
const root = path.resolve(import.meta.dirname, '..');

const files = globSync('src/**/*.{ts,tsx}', { cwd: root, absolute: true });

const SKIP = [
  'src/lib/logger.ts',
  'src/__tests__',
];

let totalFiles = 0;
let totalReplacements = 0;

for (const file of files) {
  const rel = path.relative(root, file).replace(/\\/g, '/');
  if (SKIP.some((s) => rel.includes(s))) continue;

  const original = readFileSync(file, 'utf-8');
  if (!original.includes('console.log(')) continue;

  // Count replacements
  const count = (original.match(/console\.log\(/g) ?? []).length;

  // Replace console.log( → logger.log(
  let updated = original.replace(/console\.log\(/g, 'logger.log(');

  // Add logger import if not already present
  const hasLoggerImport = /from ['"]@\/lib\/logger['"]/.test(updated);
  if (!hasLoggerImport) {
    // Insert after the last existing import statement (or at top if none)
    const importInsertRegex = /(^(?:import\s[\s\S]*?from\s+['"][^'"]+['"];?\n)+)/m;
    const match = updated.match(importInsertRegex);
    if (match) {
      const insertAt = (match.index ?? 0) + match[0].length;
      updated =
        updated.slice(0, insertAt) +
        `import { logger } from '@/lib/logger';\n` +
        updated.slice(insertAt);
    } else {
      // No imports found — prepend
      updated = `import { logger } from '@/lib/logger';\n` + updated;
    }
  }

  if (updated === original) continue;

  totalFiles++;
  totalReplacements += count;

  if (isDry) {
    console.warn(`[dry] ${rel} — ${count} replacement(s)`);
  } else {
    writeFileSync(file, updated, 'utf-8');
    console.warn(`[done] ${rel} — ${count} replacement(s)`);
  }
}

console.warn(
  `\n${isDry ? '[dry-run] Would update' : 'Updated'} ${totalFiles} files, ${totalReplacements} console.log → logger.log`
);
