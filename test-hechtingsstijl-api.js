async function testAPI() {
  try {
    console.log('Testing hechtingsstijl questions API...\n');

    const response = await fetch('http://localhost:9000/api/hechtingsstijl/questions');

    console.log('Response status:', response.status);
    console.log('Response OK:', response.ok);

    const data = await response.json();

    console.log('\nResponse data:');
    console.log('- Success:', data.success);
    console.log('- Questions count:', data.questions ? data.questions.length : 0);

    if (data.questions && data.questions.length > 0) {
      console.log('\n✅ First question:');
      console.log('   ID:', data.questions[0].id);
      console.log('   Type:', data.questions[0].question_type);
      console.log('   Text:', data.questions[0].question_text);
      console.log('   Category:', data.questions[0].category);
    } else {
      console.log('\n❌ No questions returned!');
      console.log('Full response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testAPI();
