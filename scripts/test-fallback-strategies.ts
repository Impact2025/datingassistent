/**
 * Fallback Strategies Testing Script
 * Run: npx tsx scripts/test-fallback-strategies.ts
 */

import { config } from 'dotenv';
import { fallbackTester, failureSimulator } from '../src/lib/fallback-testing';

// Load environment variables
config({ path: '.env.local' });

async function runFallbackTests() {
  console.log('🧪 COMPREHENSIVE FALLBACK STRATEGIES TESTING\n');
  console.log('Testing AI service failure scenarios and fallback behaviors...\n');

  // Test 1: Normal operation (no failures)
  console.log('📋 TEST 1: Normal Operation (No Failures)');
  console.log('Expected: All services should work normally\n');

  const normalResults = await fallbackTester.runAllTests();
  const normalSuccess = normalResults.filter(r => r.success).length;
  console.log(`✅ Normal operation: ${normalSuccess}/${normalResults.length} tests passed\n`);

  // Test 2: Single service failure
  console.log('📋 TEST 2: Single Service Failure (OpenRouter 100% failure rate)');
  console.log('Expected: OpenRouter should trigger fallback, others work normally\n');

  failureSimulator.enableFailure('openrouter', 1.0, 'network');
  const singleFailureResults = await fallbackTester.runAllTests();
  const singleFailureSuccess = singleFailureResults.filter(r => r.success).length;
  const singleFallbacks = singleFailureResults.filter(r => r.fallbackTriggered).length;
  console.log(`✅ Single failure test: ${singleFailureSuccess}/${singleFailureResults.length} successful, ${singleFallbacks} fallbacks triggered\n`);

  // Test 3: Multiple service failures
  console.log('📋 TEST 3: Multiple Service Failures (50% failure rate)');
  console.log('Expected: Multiple services should trigger fallbacks\n');

  failureSimulator.enableFailure('google-gemini', 0.5, 'timeout');
  failureSimulator.enableFailure('anthropic', 0.5, 'rate_limit');
  const multiFailureResults = await fallbackTester.runAllTests();
  const multiFailureSuccess = multiFailureResults.filter(r => r.success).length;
  const multiFallbacks = multiFailureResults.filter(r => r.fallbackTriggered).length;
  console.log(`✅ Multiple failure test: ${multiFailureSuccess}/${multiFailureResults.length} successful, ${multiFallbacks} fallbacks triggered\n`);

  // Test 4: Complete AI outage
  console.log('📋 TEST 4: Complete AI Outage (All services 100% failure)');
  console.log('Expected: All services should trigger fallbacks\n');

  failureSimulator.enableFailure('openrouter', 1.0, 'server_error');
  failureSimulator.enableFailure('google-gemini', 1.0, 'server_error');
  failureSimulator.enableFailure('anthropic', 1.0, 'server_error');
  const outageResults = await fallbackTester.runAllTests();
  const outageSuccess = outageResults.filter(r => r.success).length;
  const outageFallbacks = outageResults.filter(r => r.fallbackTriggered).length;
  console.log(`✅ Complete outage test: ${outageSuccess}/${outageResults.length} successful, ${outageFallbacks} fallbacks triggered\n`);

  // Reset failures
  failureSimulator.disableFailure('openrouter');
  failureSimulator.disableFailure('google-gemini');
  failureSimulator.disableFailure('anthropic');

  // Generate comprehensive report
  console.log('📊 COMPREHENSIVE FALLBACK TESTING REPORT\n');

  const allResults = [
    ...normalResults,
    ...singleFailureResults,
    ...multiFailureResults,
    ...outageResults
  ];

  const summary = fallbackTester.getSummary();

  console.log('🎯 OVERALL SUMMARY:');
  console.log(`   Total Tests Run: ${summary.totalTests}`);
  console.log(`   Success Rate: ${summary.successRate.toFixed(1)}%`);
  console.log(`   Fallback Rate: ${summary.fallbackRate.toFixed(1)}%`);
  console.log(`   Average Response Time: ${summary.averageResponseTime}ms`);
  console.log(`   User Experience Distribution:`);
  Object.entries(summary.userExperienceDistribution).forEach(([level, count]) => {
    console.log(`     ${level}: ${count} tests`);
  });

  console.log('\n🔍 FALLBACK STRATEGY ANALYSIS:');

  // Analyze fallback effectiveness
  const fallbackResults = allResults.filter(r => r.fallbackTriggered);
  const fallbackTypes = fallbackResults.reduce((acc, r) => {
    acc[r.fallbackType] = (acc[r.fallbackType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('   Fallback Types Used:');
  Object.entries(fallbackTypes).forEach(([type, count]) => {
    console.log(`     ${type}: ${count} times`);
  });

  // User experience analysis
  const excellentExp = allResults.filter(r => r.userExperience === 'excellent').length;
  const goodExp = allResults.filter(r => r.userExperience === 'good').length;
  const acceptableExp = allResults.filter(r => r.userExperience === 'acceptable').length;
  const poorExp = allResults.filter(r => r.userExperience === 'poor').length;

  console.log('\n😊 USER EXPERIENCE ANALYSIS:');
  console.log(`   Excellent: ${excellentExp} tests (${((excellentExp/allResults.length)*100).toFixed(1)}%)`);
  console.log(`   Good: ${goodExp} tests (${((goodExp/allResults.length)*100).toFixed(1)}%)`);
  console.log(`   Acceptable: ${acceptableExp} tests (${((acceptableExp/allResults.length)*100).toFixed(1)}%)`);
  console.log(`   Poor: ${poorExp} tests (${((poorExp/allResults.length)*100).toFixed(1)}%)`);

  // Performance analysis
  const avgResponseTime = allResults.reduce((sum, r) => sum + r.responseTime, 0) / allResults.length;
  const maxResponseTime = Math.max(...allResults.map(r => r.responseTime));
  const minResponseTime = Math.min(...allResults.map(r => r.responseTime));

  console.log('\n⚡ PERFORMANCE ANALYSIS:');
  console.log(`   Average Response Time: ${Math.round(avgResponseTime)}ms`);
  console.log(`   Fastest Response: ${minResponseTime}ms`);
  console.log(`   Slowest Response: ${maxResponseTime}ms`);

  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');

  if (summary.successRate >= 90) {
    console.log('   ✅ Excellent fallback coverage - system is highly resilient');
  } else if (summary.successRate >= 75) {
    console.log('   ⚠️ Good fallback coverage - minor improvements needed');
  } else {
    console.log('   ❌ Poor fallback coverage - significant improvements required');
  }

  if (summary.fallbackRate >= 80) {
    console.log('   ✅ High fallback utilization - graceful degradation working well');
  } else {
    console.log('   ⚠️ Low fallback utilization - may need more failure scenarios');
  }

  const excellentRatio = (excellentExp + goodExp) / allResults.length;
  if (excellentRatio >= 0.8) {
    console.log('   ✅ Excellent user experience during failures');
  } else if (excellentRatio >= 0.6) {
    console.log('   ⚠️ Acceptable user experience - room for improvement');
  } else {
    console.log('   ❌ Poor user experience during failures - urgent fixes needed');
  }

  console.log('\n🎉 FALLBACK STRATEGIES TESTING COMPLETE!\n');

  if (summary.successRate >= 75 && excellentRatio >= 0.6) {
    console.log('✅ SYSTEM PASSES FALLBACK REQUIREMENTS');
    console.log('   The application gracefully handles AI service failures and maintains good user experience.\n');
  } else {
    console.log('❌ SYSTEM NEEDS FALLBACK IMPROVEMENTS');
    console.log('   Additional fallback strategies should be implemented.\n');
  }
}

// Run the tests
runFallbackTests()
  .then(() => {
    console.log('🏁 Testing finished successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Testing failed:', error);
    process.exit(1);
  });