/**
 * AI Service - Centrale service voor alle AI functionaliteiten
 * Ondersteunt meerdere providers: OpenRouter, Gemini, Anthropic
 */

import { generateBlogWithOpenRouter } from './generate-blog-with-openrouter';
import { openRouter, OPENROUTER_MODELS } from './openrouter';

export type AIProvider = 'openrouter'; // Alleen OpenRouter ondersteund

/**
 * AI Service configuratie
 */
export const AI_CONFIG = {
  // Standaard provider voor blog generatie
  defaultBlogProvider: 'openrouter' as AIProvider,

  // Standaard provider voor chatbot/conversaties
  defaultChatProvider: 'openrouter' as AIProvider,

  // Model configuratie per provider
  models: {
    openrouter: OPENROUTER_MODELS.CLAUDE_35_HAIKU, // Snel en kosteneffectief
  },
} as const;

/**
 * Genereer een blog met de opgegeven AI provider
 */
export async function generateBlog(
  input: any, // BlogInput type verwijderd om import conflicten te voorkomen
  provider?: AIProvider
): Promise<any> { // BlogOutput type verwijderd om import conflicten te voorkomen
  const selectedProvider = provider || AI_CONFIG.defaultBlogProvider;

  console.log(`Genereren blog met ${selectedProvider}...`);

  switch (selectedProvider) {
    case 'openrouter':
      return await generateBlogWithOpenRouter(input);

    default:
      throw new Error(`Onbekende AI provider: ${selectedProvider}`);
  }
}

/**
 * Chat completion voor dating assistant features
 * Gebruikt OpenRouter standaard (kosteneffectief)
 */
export async function chatCompletion(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  options?: {
    provider?: AIProvider;
    model?: string;
    maxTokens?: number;
    temperature?: number;
  }
): Promise<string> {
  const provider = options?.provider || AI_CONFIG.defaultChatProvider;

  if (provider === 'openrouter') {
    const model = options?.model || AI_CONFIG.models.openrouter;
    return await openRouter.createChatCompletion(model, messages, {
      max_tokens: options?.maxTokens || 2048,
      temperature: options?.temperature || 0.7,
    });
  }

  throw new Error(`Chat completion niet ondersteund voor provider: ${provider}`);
}

/**
 * Cached version of chatCompletion for production use
 * Automatically caches responses to reduce costs and improve performance
 */
export async function cachedChatCompletion(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  options?: {
    provider?: AIProvider;
    model?: string;
    maxTokens?: number;
    temperature?: number;
    skipCache?: boolean;
  }
): Promise<string> {
  const { cachedChatCompletion: cachedFn } = await import('./ai-cache');
  return cachedFn(messages, options);
}

/**
 * Genereer een dating profiel tekst
 */
export async function generateDatingProfile(
  userInfo: {
    name: string;
    age: number;
    interests: string[];
    bio?: string;
  },
  provider?: AIProvider
): Promise<string> {
  const prompt = `Genereer een aantrekkelijke dating profiel bio voor:
Naam: ${userInfo.name}
Leeftijd: ${userInfo.age}
Interesses: ${userInfo.interests.join(', ')}
${userInfo.bio ? `Huidige bio: ${userInfo.bio}` : ''}

Maak de bio:
- Authentiek en persoonlijk
- Positief en uitnodigend
- 2-3 zinnen lang
- Focus op wat de persoon uniek maakt

Geef alleen de bio terug, zonder extra uitleg.`;

  return await chatCompletion(
    [
      {
        role: 'system',
        content: 'Je bent een expert dating coach die helpt met het schrijven van authentieke dating profielen.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    { provider, maxTokens: 500, temperature: 0.8 }
  );
}

/**
 * Genereer een opener voor een dating match
 */
export async function generateOpener(
  matchInfo: {
    name: string;
    bio?: string;
    interests?: string[];
  },
  provider?: AIProvider
): Promise<string> {
  const prompt = `Genereer een leuke en persoonlijke eerste bericht (opener) voor een dating match:
Naam: ${matchInfo.name}
${matchInfo.bio ? `Bio: ${matchInfo.bio}` : ''}
${matchInfo.interests ? `Interesses: ${matchInfo.interests.join(', ')}` : ''}

Maak de opener:
- Persoonlijk (verwijs naar iets uit hun profiel)
- Speels maar respectvol
- Vraag-stellend (om conversatie te starten)
- 1-2 zinnen

Geef alleen de opener terug, zonder extra uitleg.`;

  return await chatCompletion(
    [
      {
        role: 'system',
        content: 'Je bent een expert dating coach die helpt met het starten van betekenisvolle gesprekken.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    { provider, maxTokens: 300, temperature: 0.8 }
  );
}

/**
 * Analyseer een dating profiel en geef verbeter tips
 */
export async function analyzeProfile(
  profileText: string,
  provider?: AIProvider
): Promise<{
  score: number;
  strengths: string[];
  improvements: string[];
  suggestion: string;
}> {
  const prompt = `Analyseer dit dating profiel en geef feedback:

"${profileText}"

Geef een analyse in JSON format:
{
  "score": [nummer tussen 1-10],
  "strengths": ["sterke punten..."],
  "improvements": ["verbeterpunten..."],
  "suggestion": "concrete suggestie voor verbetering"
}`;

  const response = await chatCompletion(
    [
      {
        role: 'system',
        content: 'Je bent een expert dating coach die dating profielen analyseert en verbetert.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    { provider, maxTokens: 1000, temperature: 0.5 }
  );

  // Parse JSON response
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Geen geldige analyse ontvangen');
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * Converteer een artikel naar een SEO-geoptimaliseerde blog met OpenRouter
 */
export async function convertArticleToBlog(
  input: {
    articleUrl?: string;
    articleText?: string;
    customInstructions?: string;
  },
  provider?: AIProvider
): Promise<any> {
  // Artikel content ophalen
  let articleContent = input.articleText || '';

  if (input.articleUrl && !articleContent) {
    try {
      const response = await fetch(input.articleUrl);
      const html = await response.text();

      // Eenvoudige HTML parsing
      articleContent = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    } catch (error) {
      throw new Error('Kon artikel niet ophalen van URL');
    }
  }

  if (!articleContent) {
    throw new Error('Geen artikel content beschikbaar');
  }

  const prompt = `Je bent een expert SEO contentwriter voor DatingAssistent.nl, gespecialiseerd in het herschrijven van externe artikelen naar SEO-geoptimaliseerde blogs over online daten.

**BRON ARTIKEL:**
${articleContent}

${input.customInstructions ? `\n**EXTRA INSTRUCTIES:**\n${input.customInstructions}\n` : ''}

**TAAK:**
Herschrijf dit artikel naar een SEO-geoptimaliseerde blog voor DatingAssistent.nl die:

1. **TONE OF VOICE:**
   - Vriendelijk, motiverend en persoonlijk
   - Praktisch en concreet met voorbeelden
   - Positief en laagdrempelig
   - Alsof een dating coach je direct aanspreekt
   - Inclusief en toegankelijk voor alle singles

2. **INHOUD AANPASSINGEN:**
   - Behoud de kernboodschap en belangrijke punten van het originele artikel
   - Vertaal naar de context van DatingAssistent (AI dating coach)
   - Voeg praktische tips toe die direct toepasbaar zijn
   - Maak het relevant voor Nederlandse singles in 2025
   - Verwerk subtiel dat DatingAssistent kan helpen bij deze uitdagingen

3. **STRUCTUUR (in HTML):**

<h1>[Pakkende titel gebaseerd op artikel thema]</h1>

<p><strong>Introductie (100-150 woorden):</strong> Waarom dit thema belangrijk is voor singles. Maak een verbinding met hun uitdagingen.</p>

<h2>[Hoofdpunt 1 uit origineel artikel]</h2>
<p>[Uitgewerkt met praktische tips]</p>

<h3>[Subpunt 1.1]</h3>
<p>[Detail en voorbeeld]</p>

<h3>[Subpunt 1.2]</h3>
<p>[Detail en voorbeeld]</p>

<h2>[Hoofdpunt 2 uit origineel artikel]</h2>
<p>[Uitgewerkt met praktische tips]</p>

<h3>[Subpunt 2.1]</h3>
<p>[Detail en voorbeeld]</p>

[Etc. - minimaal 3 hoofdpunten (H2) met elk 2-3 subpunten (H3)]

<h2>Conclusie: Jouw Volgende Stap</h2>
<p>Wil je deze tips direct toepassen en je dating succes vergroten? DatingAssistent helpt je persoonlijk met profiel optimalisatie, gesprek starters en dating strategieën. <a href="/register">Probeer DatingAssistent gratis</a> en ontdek hoe AI jouw dating game naar een hoger niveau tilt.</p>

4. **SEO VEREISTEN:**
   - Meta title: MAX 60 karakters, bevat hoofdkeyword
   - Meta description: MAX 155 karakters, bevat call-to-action
   - Slug: korte-url-slug (lowercase, hyphens, gebaseerd op hoofdthema)
   - Identificeer 5-7 long-tail keywords uit het artikel
   - Voeg natuurlijk interne links toe naar:
     * / (homepage)
     * /features (diensten/features pagina)
     * /register (start/registratie pagina)
     * /prijzen (prijzen pagina)

5. **KWALITEIT:**
   - Minimaal 600-800 woorden
   - Unieke content (geen letterlijk kopiëren)
   - Nederlandse spelling en grammatica
   - Scanbare opmaak met lijsten waar relevant
   - Concrete voorbeelden en actiestappen

**OUTPUT FORMAT (JSON):**
Geef ALLEEN een geldig JSON object terug, zonder extra tekst, code blocks, of andere opmaak:
{
  "title": "H1 titel hier",
  "metaTitle": "Meta title (max 60 chars)",
  "metaDescription": "Meta description (max 155 chars)",
  "slug": "url-slug-hier",
  "content": "<h1>...</h1><p>...</p>...",
  "excerpt": "Korte samenvatting van 2-3 zinnen voor preview",
  "keywords": ["keyword 1", "keyword 2", "keyword 3", "keyword 4", "keyword 5", "keyword 6", "keyword 7"]
}

Genereer nu een complete, SEO-geoptimaliseerde blog gebaseerd op het bronartikel. Geef ALLEEN het JSON object terug, zonder code blocks of extra tekst.`;

  const response = await chatCompletion(
    [
      {
        role: 'system',
        content: 'Je bent een expert SEO contentwriter voor DatingAssistent.nl.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    { provider, maxTokens: 4000, temperature: 0.7 }
  );

  // Parse JSON from response
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in OpenRouter response');
  }

  const blogData = JSON.parse(jsonMatch[0]);
  return blogData;
}
