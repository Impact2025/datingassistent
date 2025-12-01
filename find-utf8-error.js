const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'cursussen', '[slug]', 'page.tsx');

try {
  // Read file as buffer to find exact byte position
  const buffer = fs.readFileSync(filePath);

  console.log(`Total file size: ${buffer.length} bytes`);
  console.log(`Looking for issue at byte index 4658...`);

  // Show bytes around position 4658
  const start = Math.max(0, 4658 - 50);
  const end = Math.min(buffer.length, 4658 + 50);

  console.log('\n--- Bytes around position 4658 ---');
  for (let i = start; i < end; i++) {
    const byte = buffer[i];
    const char = byte >= 32 && byte < 127 ? String.fromCharCode(byte) : '?';
    const marker = i === 4658 ? ' <-- PROBLEMATIC BYTE' : '';
    console.log(`Index ${i}: byte ${byte.toString(16).padStart(2, '0')} (${byte}) = '${char}'${marker}`);
  }

  // Try to decode as UTF-8 and find where it fails
  console.log('\n--- Attempting UTF-8 decode ---');
  try {
    const text = buffer.toString('utf-8');
    console.log('✅ File decoded successfully as UTF-8');
  } catch (e) {
    console.log('❌ UTF-8 decode failed:', e.message);
  }

  // Find line number for byte position 4658
  let lineNum = 1;
  let charPos = 0;
  for (let i = 0; i < 4658 && i < buffer.length; i++) {
    if (buffer[i] === 10) { // newline
      lineNum++;
      charPos = 0;
    } else {
      charPos++;
    }
  }

  console.log(`\nByte position 4658 is approximately at line ${lineNum}, character ${charPos}`);

} catch (error) {
  console.error('Error reading file:', error);
}
