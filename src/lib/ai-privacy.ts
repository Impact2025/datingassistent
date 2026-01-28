/**
 * AI Privacy Utilities
 * Verwijdert of anonimiseert PII voordat data naar AI providers gaat
 *
 * Doel: Minimaliseer persoonlijke gegevens richting OpenRouter/AI providers
 * terwijl de functionaliteit behouden blijft.
 */

/**
 * Converteer exacte leeftijd naar leeftijdsgroep voor privacy
 */
export function getAgeRange(age: number): string {
  if (age < 25) return '18-24';
  if (age < 30) return '25-29';
  if (age < 35) return '30-34';
  if (age < 40) return '35-39';
  if (age < 50) return '40-49';
  return '50+';
}

/**
 * Vervang bekende namen door placeholder [Persoon] of [Match]
 * Dit helpt bij het anonimiseren van chat history
 */
export function anonymizeNames(text: string, knownNames?: string[]): string {
  let result = text;

  // Vervang specifiek bekende namen als die worden meegegeven
  if (knownNames && knownNames.length > 0) {
    for (const name of knownNames) {
      if (name && name.length > 1) {
        // Case-insensitive vervangen van de naam
        const regex = new RegExp(`\\b${escapeRegex(name)}\\b`, 'gi');
        result = result.replace(regex, '[Persoon]');
      }
    }
  }

  return result;
}

/**
 * Escape special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Interface voor raw user data die gesanitized moet worden
 */
export interface RawUserData {
  name?: string;
  age?: number;
  location?: string;
  userId?: string | number;
  gender?: string;
  bio?: string;
  seekingGender?: string[];
  chatHistory?: Array<{ role: string; content: string }>;
}

/**
 * Interface voor gesanitizede data die veilig naar AI kan
 */
export interface SanitizedUserData {
  // Naam wordt volledig verwijderd
  name: undefined;

  // Leeftijd wordt range
  ageRange?: string;

  // Locatie wordt gegeneraliseerd naar land
  country: string;

  // User ID wordt nooit meegestuurd
  userId: undefined;

  // Gender blijft behouden (relevant voor dating advies)
  gender?: string;

  // Bio blijft behouden (nodig voor analyse)
  bio?: string;

  // Seeking gender blijft behouden
  seekingGender?: string[];

  // Chat history wordt geanonimiseerd
  chatHistory?: Array<{ role: string; content: string }>;
}

/**
 * Sanitize user data voor verzending naar AI
 * Verwijdert of anonimiseert PII terwijl relevante context behouden blijft
 */
export function sanitizeForAI(data: RawUserData, knownNames?: string[]): SanitizedUserData {
  return {
    // Naam volledig verwijderen
    name: undefined,

    // Leeftijd naar range
    ageRange: data.age ? getAgeRange(data.age) : undefined,

    // Locatie generaliseren naar land
    country: 'Nederland',

    // User ID nooit meesturen
    userId: undefined,

    // Gender behouden (relevant voor dating context)
    gender: data.gender,

    // Bio behouden (nodig voor analyse)
    bio: data.bio,

    // Seeking gender behouden
    seekingGender: data.seekingGender,

    // Chat history anonimiseren
    chatHistory: data.chatHistory?.map(msg => ({
      ...msg,
      content: anonymizeNames(msg.content, knownNames)
    }))
  };
}

/**
 * Creëer een privacy-vriendelijke context string voor AI prompts
 */
export function createAnonymizedContext(data: RawUserData): string {
  const parts: string[] = [];

  parts.push('Gebruiker context (geanonimiseerd):');

  if (data.age) {
    parts.push(`- Leeftijdsgroep: ${getAgeRange(data.age)}`);
  }

  if (data.gender) {
    parts.push(`- Geslacht: ${data.gender}`);
  }

  // Altijd Nederland, geen specifieke locatie
  parts.push('- Land: Nederland');

  if (data.seekingGender && data.seekingGender.length > 0) {
    parts.push(`- Zoekt: ${data.seekingGender.join(', ')}`);
  }

  return parts.join('\n');
}
