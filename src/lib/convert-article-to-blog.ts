export interface ArticleToBlogInput {
  articleUrl?: string;
  articleText?: string;
  customInstructions?: string;
}

export interface ArticleToBlogOutput {
  title: string;
  metaTitle: string;
  metaDescription: string;
  slug: string;
  content: string;
  excerpt: string;
  keywords: string[];
}

export async function convertArticleToBlog(input: ArticleToBlogInput): Promise<ArticleToBlogOutput> {
  // Instead of using Google's Gemini API, we'll use our OpenRouter service
  throw new Error('This function has been deprecated. Please use the OpenRouter-based service in src/lib/ai-service.ts instead.');
  
  /*
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

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
<p>Wil je deze tips direct toepassen en je dating succes vergroten? DatingAssistent helpt je persoonlijk met profiel optimalisatie, gesprek starters en dating strategieën. <a href="https://datingassistent.nl/start">Probeer DatingAssistent gratis</a> en ontdek hoe AI jouw dating game naar een hoger niveau tilt.</p>

4. **SEO VEREISTEN:**
   - Meta title: MAX 60 karakters, bevat hoofdkeyword
   - Meta description: MAX 155 karakters, bevat call-to-action
   - Slug: korte-url-slug (lowercase, hyphens, gebaseerd op hoofdthema)
   - Identificeer 5-7 long-tail keywords uit het artikel
   - Voeg natuurlijk interne links toe naar:
     * DatingAssistent homepage
     * Diensten/features pagina
     * Start/registratie pagina

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

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  // Remove markdown code blocks if present
  let cleanText = text.trim();
  if (cleanText.startsWith('```json')) {
    cleanText = cleanText.replace(/^```json\n/, '').replace(/\n```$/, '');
  } else if (cleanText.startsWith('```')) {
    cleanText = cleanText.replace(/^```\n/, '').replace(/\n```$/, '');
  }

  // Parse JSON from response
  const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in Gemini response');
  }

  const blogData = JSON.parse(jsonMatch[0]);
  return blogData as ArticleToBlogOutput;
*/
}
