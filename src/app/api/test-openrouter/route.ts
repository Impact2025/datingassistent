import { NextResponse } from 'next/server';
import { generateBlog, convertArticleToBlog } from '@/lib/ai-service';
import { generateDatingProfile, generateOpener } from '@/lib/ai-service';

/**
 * Test API endpoint voor OpenRouter integratie
 * Gebruik: GET http://localhost:9002/api/test-openrouter
 */
export async function GET() {
  try {
    const results: any = {
      timestamp: new Date().toISOString(),
      tests: {},
      apiKeyConfigured: !!process.env.OPENROUTER_API_KEY,
    };

    // Test 1: Blog generatie (kort artikel voor snelheid)
    console.log('🔄 Test 1: Blog generatie...');
    try {
      const blogStart = Date.now();
      const blog = await generateBlog(
        {
          primaryKeyword: 'online dating tips',
          category: 'Dating Tips',
          year: '2025',
          articleLength: 'Kort (400-600 woorden)',
        },
        'openrouter'
      );

      results.tests.blogGeneration = {
        success: true,
        duration: Date.now() - blogStart,
        title: blog.title,
        contentLength: blog.content.length,
        keywords: blog.keywords,
      };
      console.log('✅ Blog generatie geslaagd!');
    } catch (error) {
      results.tests.blogGeneration = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      console.error('❌ Blog generatie gefaald:', error);
    }

    // Test 2: Dating profiel
    console.log('🔄 Test 2: Dating profiel generatie...');
    try {
      const profileStart = Date.now();
      const profile = await generateDatingProfile(
        {
          name: 'Test User',
          age: 28,
          interests: ['reizen', 'fotografie', 'yoga'],
        },
        'openrouter'
      );

      results.tests.profileGeneration = {
        success: true,
        duration: Date.now() - profileStart,
        profile: profile,
        length: profile.length,
      };
      console.log('✅ Profiel generatie geslaagd!');
    } catch (error) {
      results.tests.profileGeneration = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      console.error('❌ Profiel generatie gefaald:', error);
    }

    // Test 3: Opener generatie
    console.log('🔄 Test 3: Opener generatie...');
    try {
      const openerStart = Date.now();
      const opener = await generateOpener(
        {
          name: 'Emma',
          bio: 'Houdt van wandelen in de bergen',
          interests: ['hiking', 'fotografie'],
        },
        'openrouter'
      );

      results.tests.openerGeneration = {
        success: true,
        duration: Date.now() - openerStart,
        opener: opener,
        length: opener.length,
      };
      console.log('✅ Opener generatie geslaagd!');
    } catch (error) {
      results.tests.openerGeneration = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      console.error('❌ Opener generatie gefaald:', error);
    }

    // Samenvatting
    const totalTests = Object.keys(results.tests).length;
    const passedTests = Object.values(results.tests).filter((t: any) => t.success).length;

    results.summary = {
      total: totalTests,
      passed: passedTests,
      failed: totalTests - passedTests,
      successRate: `${Math.round((passedTests / totalTests) * 100)}%`,
    };

    console.log(`\n📊 Resultaten: ${passedTests}/${totalTests} tests geslaagd`);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('❌ Test suite gefaald:', error);
    return NextResponse.json(
      {
        error: 'Test suite failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * API endpoint voor blog generatie vanuit admin panel
 * Gebruik: POST http://localhost:9002/api/test-openrouter
 */
export async function POST(request: Request) {
  try {
    const input = await request.json();
    
    // Generate blog using the AI service
    const blog = await generateBlog(input, 'openrouter');
    
    return NextResponse.json(blog, { status: 200 });
  } catch (error) {
    console.error('❌ Blog generatie gefaald:', error);
    return NextResponse.json(
      {
        error: 'Blog generation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Helper function voor artikel naar blog conversie
 * Niet direct callable als route handler
 */
async function articleToBlog(request: Request) {
  try {
    const input = await request.json();
    
    // Convert article to blog using the AI service
    const blog = await convertArticleToBlog(input, 'openrouter');
    
    return NextResponse.json(blog, { status: 200 });
  } catch (error) {
    console.error('❌ Artikel naar blog conversie gefaald:', error);
    return NextResponse.json(
      {
        error: 'Article to blog conversion failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}