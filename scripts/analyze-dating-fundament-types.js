const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '../cursussen/cursussen/dating-fundament-pro');

// Verzamel alle unieke sectie types
const sectieTypes = new Map();

function scanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      scanDirectory(fullPath);
    } else if (entry.name === 'les.json') {
      processLessonFile(fullPath);
    }
  }
}

function processLessonFile(filePath) {
  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const lesTitel = content.meta?.titel || 'Unknown';

    if (!content.secties) return;

    content.secties.forEach((sectie, idx) => {
      const type = sectie.type;

      if (!sectieTypes.has(type)) {
        sectieTypes.set(type, {
          count: 0,
          examples: [],
          contentStructures: new Set()
        });
      }

      const typeData = sectieTypes.get(type);
      typeData.count++;

      // Bewaar eerste 2 voorbeelden
      if (typeData.examples.length < 2) {
        typeData.examples.push({
          les: lesTitel,
          titel: sectie.titel || sectie.id,
          content: sectie.content || sectie.inhoud || {}
        });
      }

      // Analyseer content structuur
      const contentKeys = Object.keys(sectie.content || sectie.inhoud || {});
      typeData.contentStructures.add(JSON.stringify(contentKeys.sort()));
    });
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err.message);
  }
}

// Start scanning
console.log('🔍 Scanning Dating Fundament PRO lessons...\n');
scanDirectory(baseDir);

// Print results
console.log('📊 SECTIE TYPES FOUND:\n');
console.log(`Total unique types: ${sectieTypes.size}\n`);

const sortedTypes = Array.from(sectieTypes.entries()).sort((a, b) => b[1].count - a[1].count);

sortedTypes.forEach(([type, data]) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📌 Type: "${type}" (${data.count} voorkomens)`);
  console.log(`${'='.repeat(60)}`);

  console.log('\n📝 Voorbeelden:');
  data.examples.forEach((ex, idx) => {
    console.log(`\n   ${idx + 1}. ${ex.les} - "${ex.titel}"`);
    console.log(`      Content keys: ${Object.keys(ex.content).join(', ')}`);

    // Show first level of structure
    if (Object.keys(ex.content).length > 0) {
      console.log(`      Structure preview:`);
      Object.entries(ex.content).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          console.log(`         ${key}: Array[${value.length}]`);
          if (value.length > 0 && typeof value[0] === 'object') {
            console.log(`            └─ Item keys: ${Object.keys(value[0]).join(', ')}`);
          }
        } else if (typeof value === 'object' && value !== null) {
          console.log(`         ${key}: Object`);
          console.log(`            └─ Keys: ${Object.keys(value).join(', ')}`);
        } else {
          console.log(`         ${key}: ${typeof value}`);
        }
      });
    }
  });

  console.log(`\n   📊 Alle content structures voor dit type:`);
  Array.from(data.contentStructures).forEach(struct => {
    console.log(`      • ${struct}`);
  });
});

console.log(`\n\n${'='.repeat(60)}`);
console.log('✅ Analyse compleet!');
console.log(`${'='.repeat(60)}\n`);
