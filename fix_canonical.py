#!/usr/bin/env python3
"""Bulk fix: canonical/redirect base url apex (datingassistent.nl) -> www (www.datingassistent.nl).
Skips node_modules, .next, and only touches text-ish source files.
Guard: never produces https://www.www.datingassistent.nl
"""
import os, re

ROOT = os.path.dirname(os.path.abspath(__file__))
SKIP_DIRS = {'.git', 'node_modules', '.next', 'dist', 'build', 'coverage', '.turbo', '.vercel'}
SKIP_FILES = {'fix_canonical.py'}
TEXT_EXT = {'.ts', '.tsx', '.js', '.jsx', '.mjs', '.json', '.md', '.html', '.css', '.yaml', '.yml', '.env', '.txt'}

OLD_APEX = 'https://datingassistent.nl'
NEW_WWW = 'https://www.datingassistent.nl'
# Guard pattern: already-correct www or accidentally doubled www
DOUBLED = 'https://www.www.datingassistent.nl'

changed_files = 0
total_subs = 0

for dirpath, dirnames, filenames in os.walk(ROOT):
    # modify dirnames in place to prune
    dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
    for fn in filenames:
        if fn in SKIP_FILES:
            continue
        ext = os.path.splitext(fn)[1].lower()
        if ext not in TEXT_EXT:
            continue
        fp = os.path.join(dirpath, fn)
        if 'node_modules' in fp or '/.next/' in fp or '\\.next\\' in fp:
            continue
        try:
            with open(fp, 'r', encoding='utf-8') as f:
                data = f.read()
        except (UnicodeDecodeError, PermissionError):
            continue
        if OLD_APEX not in data:
            continue
        new_data = data.replace(OLD_APEX, NEW_WWW)
        # safety: remove any accidental double www
        if DOUBLED in new_data:
            new_data = new_data.replace(DOUBLED, NEW_WWW)
        if new_data != data:
            with open(fp, 'w', encoding='utf-8') as f:
                f.write(new_data)
            n = new_data.count(NEW_WWW) - data.count(NEW_WWW)
            changed_files += 1
            total_subs += n
            print(f"  {os.path.relpath(fp, ROOT)}  (+{n})")

print(f"\nDONE: {changed_files} files changed, {total_subs} substitutions (apex -> www).")
