// Test course synchronization
require('dotenv').config({ path: '.env.local' });
const { syncCoursesFromStaticData } = require('./src/lib/course-sync.ts');

async function testSync() {
  try {
    console.log('🔄 Starting course synchronization test...\n');

    await syncCoursesFromStaticData();

    console.log('\n✅ Synchronization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Synchronization failed:');
    console.error(error);
    process.exit(1);
  }
}

testSync();
