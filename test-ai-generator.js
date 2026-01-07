/**
 * PRO TEST: AI Blog Generator
 * Test the complete blog generation from a single keyword
 */

async function testAIGenerator() {
  console.log('🤖 Testing AI Blog Generator...\n');

  const testCases = [
    {
      name: 'Dating Tips Blog',
      payload: {
        primaryKeyword: 'eerste date tips',
        category: 'Online Dating Tips',
        targetAudience: 'Singles die hun eerste date willen verbeteren',
        articleLength: 'medium',
      }
    },
    {
      name: 'AI Technology Blog',
      payload: {
        primaryKeyword: 'AI dating coach',
        category: 'AI & Technologie',
        articleLength: 'short',
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📝 Test Case: ${testCase.name}`);
    console.log('Payload:', JSON.stringify(testCase.payload, null, 2));

    const startTime = Date.now();

    try {
      const response = await fetch('http://localhost:9050/api/ai/generate-blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.payload),
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        const error = await response.json();
        console.log(`❌ FAILED (${response.status}) in ${duration}ms`);
        console.log('Error:', error);
        continue;
      }

      const data = await response.json();
      console.log(`✅ SUCCESS in ${duration}ms`);

      // Validate response structure
      if (!data.success || !data.blog) {
        console.log('❌ Invalid response structure');
        console.log('Response:', JSON.stringify(data, null, 2));
        continue;
      }

      const blog = data.blog;

      // Comprehensive validation
      const validations = [
        { field: 'title', value: blog.title, min: 10, max: 100 },
        { field: 'content', value: blog.content, min: 500, max: 10000 },
        { field: 'excerpt', value: blog.excerpt, min: 50, max: 300 },
        { field: 'slug', value: blog.slug, min: 5, max: 100 },
        { field: 'seoTitle', value: blog.seoTitle, min: 30, max: 60 },
        { field: 'seoDescription', value: blog.seoDescription, min: 100, max: 160 },
        { field: 'socialTitle', value: blog.socialTitle, min: 10, max: 70 },
        { field: 'socialDescription', value: blog.socialDescription, min: 50, max: 200 },
      ];

      console.log('\n📊 BLOG STRUCTURE:');
      let allValid = true;

      validations.forEach(({ field, value, min, max }) => {
        const length = value ? value.length : 0;
        const isValid = length >= min && length <= max;
        const status = isValid ? '✅' : '❌';

        console.log(`${status} ${field.padEnd(20)} | ${length.toString().padStart(4)} chars | Range: ${min}-${max}`);

        if (!isValid) allValid = false;
      });

      // Check arrays
      console.log(`${blog.keywords && blog.keywords.length >= 3 ? '✅' : '❌'} keywords          | ${blog.keywords?.length || 0} items | Min: 3`);
      console.log(`${blog.hashtags && blog.hashtags.length >= 3 ? '✅' : '❌'} hashtags          | ${blog.hashtags?.length || 0} items | Min: 3`);

      // Check metadata
      console.log(`\n🎨 HEADER SUGGESTION:`);
      console.log(`   Type: ${blog.headerSuggestion?.type || 'N/A'}`);
      if (blog.headerSuggestion?.type === 'color') {
        console.log(`   Color: ${blog.headerSuggestion.colorHex}`);
        console.log(`   Title: ${blog.headerSuggestion.headerTitle}`);
      }

      console.log(`\n⏱️  Reading Time: ${blog.readingTime} min`);
      console.log(`📝 Category: ${blog.category}`);

      // Content quality checks
      console.log(`\n🔍 CONTENT QUALITY:`);
      const hasH2 = blog.content.includes('<h2>');
      const hasH3 = blog.content.includes('<h3>');
      const hasParagraphs = blog.content.includes('<p>');
      const hasLists = blog.content.includes('<ul>') || blog.content.includes('<ol>');
      const hasStrong = blog.content.includes('<strong>');

      console.log(`${hasH2 ? '✅' : '❌'} Contains H2 headings`);
      console.log(`${hasH3 ? '✅' : '❌'} Contains H3 subheadings`);
      console.log(`${hasParagraphs ? '✅' : '❌'} Contains paragraphs`);
      console.log(`${hasLists ? '✅' : '❌'} Contains lists`);
      console.log(`${hasStrong ? '✅' : '❌'} Contains bold text`);

      // Preview
      console.log(`\n📰 PREVIEW:`);
      console.log(`Title: ${blog.title}`);
      console.log(`Slug: ${blog.slug}`);
      console.log(`Excerpt: ${blog.excerpt.substring(0, 100)}...`);
      console.log(`SEO Title: ${blog.seoTitle}`);
      console.log(`Keywords: ${blog.keywords?.slice(0, 5).join(', ')}`);

      if (allValid && hasH2 && hasH3 && hasParagraphs && hasLists) {
        console.log(`\n✅ ${testCase.name} PASSED ALL CHECKS`);
      } else {
        console.log(`\n⚠️  ${testCase.name} PASSED WITH WARNINGS`);
      }

    } catch (error) {
      console.log(`❌ EXCEPTION in ${Date.now() - startTime}ms`);
      console.log('Error:', error.message);
    }
  }

  console.log('\n\n✨ AI Generator Test Complete!\n');
}

testAIGenerator().catch(console.error);
