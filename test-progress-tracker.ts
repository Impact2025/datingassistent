// Test script for the Voortgang Tracker
// Run with: npx tsx test-progress-tracker.ts

import { trackUserActivity, getCurrentWeekProgress, calculateWeeklyMetrics, generateWeeklyInsights } from './src/lib/progress-tracker';

async function testProgressTracker() {
  console.log('🧪 Testing Voortgang Tracker...\n');

  const testUserId = 3; // Use existing user ID

  try {
    // Test 1: Track some activities
    console.log('📝 Test 1: Tracking activities...');

    await trackUserActivity(testUserId, {
      type: 'profile_analysis',
      data: { overallScore: 85, categoriesAnalyzed: ['bio', 'photos', 'interests'] }
    });
    console.log('✅ Profile analysis activity tracked');

    await trackUserActivity(testUserId, {
      type: 'chat_coach',
      data: { messageCount: 5, conversationLength: 150 }
    });
    console.log('✅ Chat coach activity tracked');

    await trackUserActivity(testUserId, {
      type: 'login'
    });
    console.log('✅ Login activity tracked');

    // Test 2: Calculate weekly metrics
    console.log('\n📊 Test 2: Calculating weekly metrics...');
    const metrics = await calculateWeeklyMetrics(testUserId);
    console.log('✅ Weekly metrics calculated:', metrics);

    // Test 3: Get current week progress
    console.log('\n📈 Test 3: Getting current week progress...');
    const progress = await getCurrentWeekProgress(testUserId);
    console.log('✅ Current week progress:', progress);

    // Test 4: Generate weekly insights
    console.log('\n💡 Test 4: Generating weekly insights...');
    const insights = await generateWeeklyInsights(testUserId);
    console.log('✅ Weekly insights generated:', insights);

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n💡 Check the Voortgang Tracker tab in the dashboard to see the results.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testProgressTracker();