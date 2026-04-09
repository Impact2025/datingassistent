/**
 * Fix-script: verplaats logger import naar ná "use client"/"use server" directive
 *
 * Het migrate-console-logs script plaatste de import vóór de directive,
 * wat Next.js build-fouten veroorzaakte.
 */

import { readFileSync, writeFileSync } from 'fs';
import { globSync } from 'glob';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');
const files = globSync('src/**/*.{ts,tsx}', { cwd: root, absolute: true });

let fixed = 0;

for (const file of files) {
  const content = readFileSync(file, 'utf-8');
  const lines = content.split('\n');

  // Check if logger import is line 1 (index 0) AND "use client"/"use server" is line 2 (index 1)
  const firstLine = lines[0]?.trim();
  const secondLine = lines[1]?.trim();

  if (
    firstLine?.startsWith("import { logger }") &&
    (secondLine === '"use client";' || secondLine === '"use server";' ||
     secondLine === "'use client';" || secondLine === "'use server';")
  ) {
    // Swap: put directive first, then logger import
    const directive = lines[1];
    const loggerImport = lines[0];
    lines[0] = directive;
    lines[1] = loggerImport;

    writeFileSync(file, lines.join('\n'), 'utf-8');
    const rel = path.relative(root, file).replace(/\\/g, '/');
    console.warn(`[fixed] ${rel}`);
    fixed++;
  }
}

console.warn(`\nFixed ${fixed} files`);
