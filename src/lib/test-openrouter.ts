/**
 * Test script voor OpenRouter integratie
 * Gebruik dit bestand om te testen of OpenRouter correct werkt
 */

import { generateBlog } from './ai-service';
import { generateDatingProfile, generateOpener, analyzeProfile } from './ai-service';

/**
 * Test blog generatie met OpenRouter
 */
async function testBlogGeneration() {
  console.log('\n🔄 Test 1: Blog generatie met OpenRouter (Claude Haiku)...\n');

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

    console.log('✅ Blog succesvol gegenereerd!');
    console.log('📝 Titel:', blog.title);
    console.log('🔑 Keywords:', blog.keywords.join(', '));
    console.log('📏 Content lengte:', blog.content.length, 'karakters');
    console.log('📱 Social media platforms:', Object.keys(blog.socialMedia).join(', '));
    console.log('\n');

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
  console.log('\n🔄 Test 2: Dating profiel generatie...\n');

  try {
    const userInfo = {
      name: 'Sarah',
      age: 28,
      interests: ['yoga', 'reizen', 'koken', 'fotografie'],
      bio: 'Ik hou van avontuur en nieuwe dingen ontdekken.',
    };

    const profile = await generateDatingProfile(userInfo, 'openrouter');

    console.log('✅ Profiel succesvol gegenereerd!');
    console.log('👤 Profiel:', profile);
    console.log('\n');

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
  console.log('\n🔄 Test 3: Opener generatie...\n');

  try {
    const matchInfo = {
      name: 'Emma',
      bio: 'Avontuurlijk en houdt van wandelen in de bergen',
      interests: ['hiking', 'fotografie', 'koffie'],
    };

    const opener = await generateOpener(matchInfo, 'openrouter');

    console.log('✅ Opener succesvol gegenereerd!');
    console.log('💬 Opener:', opener);
    console.log('\n');

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
  console.log('\n🔄 Test 4: Profiel analyse...\n');

  try {
    const profileText = `Hey! Ik ben een gezellige persoon die houdt van uitgaan en Netflix kijken.
    Swipe rechts als je van pizza houdt!`;

    const analysis = await analyzeProfile(profileText, 'openrouter');

    console.log('✅ Analyse succesvol uitgevoerd!');
    console.log('⭐ Score:', analysis.score, '/10');
    console.log('💪 Sterke punten:', analysis.strengths.join(', '));
    console.log('📈 Verbeterpunten:', analysis.improvements.join(', '));
    console.log('💡 Suggestie:', analysis.suggestion);
    console.log('\n');

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
  console.log('🚀 OpenRouter Test Suite voor DatingAssistent\n');
  console.log('=' .repeat(60));

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
  console.log('=' .repeat(60));
  console.log('\n📊 Test Resultaten:\n');

  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;

  Object.entries(results).forEach(([test, passed]) => {
    const icon = passed ? '✅' : '❌';
    console.log(`${icon} ${test}: ${passed ? 'GESLAAGD' : 'GEFAALD'}`);
  });

  console.log(`\n🎯 Totaal: ${passed}/${total} tests geslaagd`);

  if (passed === total) {
    console.log('\n🎉 Alle tests geslaagd! OpenRouter integratie werkt correct.\n');
  } else {
    console.log(
      '\n⚠️  Sommige tests zijn gefaald. Controleer je OPENROUTER_API_KEY in .env.local\n'
    );
  }
}

// Alleen uitvoeren als dit bestand direct wordt aangeroepen
if (require.main === module) {
  runAllTests().catch(console.error);
}

export { testBlogGeneration, testProfileGeneration, testOpenerGeneration, testProfileAnalysis };
