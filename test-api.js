const http = require('http');

http.get('http://localhost:9000/api/courses/by-slug/je-profieltekst-die-wel-werkt', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Title:', json.title);
      console.log('Modules:', json.modules?.length || 0);
      if (json.modules) {
        json.modules.forEach((m, i) => {
          console.log(`  ${i+1}. ${m.title} (${m.lessons?.length || 0} lessons)`);
          if (m.lessons) {
            m.lessons.forEach(l => {
              console.log(`     - ${l.title} (${l.lesson_type})`);
            });
          }
        });
      }
    } catch (e) {
      console.error('Error:', e.message);
      console.log('Response:', data);
    }
  });
}).on('error', (e) => {
  console.error('Request error:', e.message);
});
