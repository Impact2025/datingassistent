/**
 * Post-deploy IndexNow submit script
 * Roept de IndexNow API aan om alle blog slugs direct te indexeren.
 * 
 * Gebruik: node scripts/indexnow-submit.cjs
 * Draait automatisch na elke Vercel deploy (zie package.json "postbuild").
 */

const INDEXNOW_API = 'https://datingassistent.nl/api/indexnow';

const BLOG_SLUGS = [
  'nepaccounts-datingsites-herkennen',
  'datingapps-onthulling-feiten',
  'opener-tips-online-daten-2025',
  'datingprofiel-verbeteren',
];

async function submit() {
  console.log(`[IndexNow] Submitting ${BLOG_SLUGS.length} blog URLs...`);
  
  try {
    const response = await fetch(INDEXNOW_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slugs: BLOG_SLUGS }),
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log(`[IndexNow] ✅ Success: ${result.submitted}/${result.totalRequested} URLs submitted`);
      if (result.batches) {
        console.log(`[IndexNow]    Batches: ${result.batches}`);
      }
    } else {
      console.error(`[IndexNow] ❌ Failed: ${response.status}`);
      console.error(result);
    }
  } catch (error) {
    console.error('[IndexNow] ❌ Network error:', error.message);
  }
}

submit();
