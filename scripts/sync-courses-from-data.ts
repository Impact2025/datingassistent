import 'dotenv/config';

import { syncCoursesFromStaticData } from '@/lib/course-sync';

async function main() {
  console.log('🔄 Synchronising courses and modules from static data...');

  await syncCoursesFromStaticData();

  console.log('✅ Course synchronisation complete.');
  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Failed to synchronise courses:', error);
  process.exit(1);
});
