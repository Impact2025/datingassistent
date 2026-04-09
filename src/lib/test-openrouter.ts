/**
 * Test script voor OpenRouter integratie
 * Gebruik dit bestand om te testen of OpenRouter correct werkt
 */

import { generateBlog } from './ai-service';
import { generateDatingProfile, generateOpener, analyzeProfile } from './ai-service';
import { logger } from '@/lib/logger';

/**
 * Test blog generatie met OpenRouter
 */
async function testBlogGeneration() {
  logger.log('\n🔄 Test 1: Blog generatie met OpenRouter (Claude Haiku)...\n');

  try {
    const blogInput = {
      primaryKeyword: 'online dating tips',
      category: 'Dating Tips',
      year: '2025',
      targetAudience: 'Singles die net beginnen met online daten',
      toneOfVoice: 'Vriendelijk en motiverend',
      articleLength: 'Kort (400-600 woorden)',
    };

    const blog = await generateBlog(blogInput, 'openrouter');

    logger.log('✅ Blog succesvol gegenereerd!');
    logger.log('📝 Titel:', blog.title);
    logger.log('🔑 Keywords:', blog.keywords.join(', '));
    logger.log('📏 Content lengte:', blog.content.length, 'karakters');
    logger.log('📱 Social media platforms:', Object.keys(blog.socialMedia).join(', '));
    logger.log('\n');

    return true;
  } catch (error) {
    console.error('❌ Fout bij blog generatie:', error);
    return false;
  }
}

/**
 * Test dating profiel generatie
 */
async function testProfileGeneration() {
  logger.log('\n🔄 Test 2: Dating profiel generatie...\n');

  try {
    const userInfo = {
      name: 'Sarah',
      age: 28,
      interests: ['yoga', 'reizen', 'koken', 'fotografie'],
      bio: 'Ik hou van avontuur en nieuwe dingen ontdekken.',
    };

    const profile = await generateDatingProfile(userInfo, 'openrouter');

    logger.log('✅ Profiel succesvol gegenereerd!');
    logger.log('👤 Profiel:', profile);
    logger.log('\n');

    return true;
  } catch (error) {
    console.error('❌ Fout bij profiel generatie:', error);
    return false;
  }
}

/**
 * Test opener generatie
 */
async function testOpenerGeneration() {
  logger.log('\n🔄 Test 3: Opener generatie...\n');

  try {
    const matchInfo = {
      name: 'Emma',
      bio: 'Avontuurlijk en houdt van wandelen in de bergen',
      interests: ['hiking', 'fotografie', 'koffie'],
    };

    const opener = await generateOpener(matchInfo, 'openrouter');

    logger.log('✅ Opener succesvol gegenereerd!');
    logger.log('💬 Opener:', opener);
    logger.log('\n');

    return true;
  } catch (error) {
    console.error('❌ Fout bij opener generatie:', error);
    return false;
  }
}

/**
 * Test profiel analyse
 */
async function testProfileAnalysis() {
  logger.log('\n🔄 Test 4: Profiel analyse...\n');

  try {
    const profileText = `Hey! Ik ben een gezellige persoon die houdt van uitgaan en Netflix kijken.
    Swipe rechts als je van pizza houdt!`;

    const analysis = await analyzeProfile(profileText, 'openrouter');

    logger.log('✅ Analyse succesvol uitgevoerd!');
    logger.log('⭐ Score:', analysis.score, '/10');
    logger.log('💪 Sterke punten:', analysis.strengths.join(', '));
    logger.log('📈 Verbeterpunten:', analysis.improvements.join(', '));
    logger.log('💡 Suggestie:', analysis.suggestion);
    logger.log('\n');

    return true;
  } catch (error) {
    console.error('❌ Fout bij profiel analyse:', error);
    return false;
  }
}

/**
 * Voer alle tests uit
 */
async function runAllTests() {
  logger.log('🚀 OpenRouter Test Suite voor DatingAssistent\n');
  logger.log('=' .repeat(60));

  const results = {
    blogGeneration: false,
    profileGeneration: false,
    openerGeneration: false,
    profileAnalysis: false,
  };

  // Test 1: Blog generatie
  results.blogGeneration = await testBlogGeneration();

  // Test 2: Profiel generatie
  results.profileGeneration = await testProfileGeneration();

  // Test 3: Opener generatie
  results.openerGeneration = await testOpenerGeneration();

  // Test 4: Profiel analyse
  results.profileAnalysis = await testProfileAnalysis();

  // Resultaten
  logger.log('=' .repeat(60));
  logger.log('\n📊 Test Resultaten:\n');

  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;

  Object.entries(results).forEach(([test, passed]) => {
    const icon = passed ? '✅' : '❌';
    logger.log(`${icon} ${test}: ${passed ? 'GESLAAGD' : 'GEFAALD'}`);
  });

  logger.log(`\n🎯 Totaal: ${passed}/${total} tests geslaagd`);

  if (passed === total) {
    logger.log('\n🎉 Alle tests geslaagd! OpenRouter integratie werkt correct.\n');
  } else {
    logger.log(
      '\n⚠️  Sommige tests zijn gefaald. Controleer je OPENROUTER_API_KEY in .env.local\n'
    );
  }
}

// Alleen uitvoeren als dit bestand direct wordt aangeroepen
if (require.main === module) {
  runAllTests().catch(console.error);
}

export { testBlogGeneration, testProfileGeneration, testOpenerGeneration, testProfileAnalysis };
