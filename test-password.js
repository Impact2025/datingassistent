// Quick test for password validation
function validatePassword(password) {
  const errors = [];

  // Minimum length check
  if (password.length < 8) {
    errors.push('Wachtwoord moet minimaal 8 karakters lang zijn');
  }

  // Maximum length check (prevent DoS via bcrypt)
  if (password.length > 128) {
    errors.push('Wachtwoord mag maximaal 128 karakters lang zijn');
  }

  // Uppercase letter check
  if (!/[A-Z]/.test(password)) {
    errors.push('Wachtwoord moet minimaal één hoofdletter bevatten');
  }

  // Lowercase letter check
  if (!/[a-z]/.test(password)) {
    errors.push('Wachtwoord moet minimaal één kleine letter bevatten');
  }

  // Number check
  if (!/[0-9]/.test(password)) {
    errors.push('Wachtwoord moet minimaal één cijfer bevatten');
  }

  // Special character check
  if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
    errors.push('Wachtwoord moet minimaal één speciaal teken bevatten (!@#$%^&* etc.)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Test cases
const testCases = [
  'short', // too short
  '123456789', // 9 chars, no uppercase/lowercase/special
  'Password123', // 11 chars, missing special char
  'Password123!', // 12 chars, should pass
  'TestPassword123!', // longer, should pass
];

console.log('Testing password validation:');
testCases.forEach(test => {
  const result = validatePassword(test);
  console.log(`Password: '${test}' -> Valid: ${result.isValid}, Errors: [${result.errors.join(', ')}]`);
});