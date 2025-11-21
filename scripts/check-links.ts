import 'dotenv/config';
import { sql } from '@vercel/postgres';

async function checkLinks() {
  const result = await sql`
    SELECT slug, content
    FROM blog_posts
    WHERE slug = 'datingprofiel-verbeteren'
  `;

  const content = result.rows[0]?.content || '';
  console.log('Content length:', content.length);

  const idx = content.indexOf('/features');
  console.log('Found /features at position:', idx);

  if (idx > -1) {
    console.log('\nContext around /features:');
    console.log(content.substring(idx-50, idx+100));
  }

  // Check all variations
  const variations = [
    'href="/features"',
    "href='/features'",
    'href="/start"',
    "href='/start'",
    'href="/profiel"',
    "href='/profiel'"
  ];

  console.log('\nChecking variations:');
  for (const v of variations) {
    if (content.includes(v)) {
      console.log(`  ✅ Found: ${v}`);
    } else {
      console.log(`  ❌ Not found: ${v}`);
    }
  }
}

checkLinks().then(() => process.exit(0)).catch(console.error);
