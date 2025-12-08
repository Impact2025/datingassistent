async function initDatabase() {
  try {
    console.log('Initializing hechtingsstijl database...');

    const response = await fetch('http://localhost:9000/api/db/init-attachment-style', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ Database initialized successfully!');
      console.log('Details:', JSON.stringify(data.details, null, 2));
    } else {
      console.error('❌ Failed to initialize database:', data.message);
      console.error('Error details:', data.details);
    }
  } catch (error) {
    console.error('❌ Error calling API:', error.message);
  }
}

initDatabase();
