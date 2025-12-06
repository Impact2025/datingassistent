import { ai } from '../genkit';
import { z } from 'zod';

const ArticleToBlogInputSchema = z.object({
  articleUrl: z.string().optional().describe('URL van het externe artikel'),
  articleText: z.string().optional().describe('Volledige tekst van het artikel'),
  customInstructions: z.string().optional().describe('Extra instructies voor de AI'),
});

const ArticleToBlogOutputSchema = z.object({
  title: z.string().describe('Blog titel (H1)'),
  metaTitle: z.string().max(60).describe('Meta title (max 60 karakters)'),
  metaDescription: z.string().max(155).describe('Meta description (max 155 karakters)'),
  slug: z.string().describe('URL slug (korte, SEO-vriendelijke URL)'),
  content: z.string().describe('Volledige blog content in HTML format met H2, H3, p tags'),
  excerpt: z.string().describe('Korte samenvatting voor preview'),
  keywords: z.array(z.string()).describe('Lijst van 5-7 SEO keywords'),
  midjourneyPrompt: z.string().describe('Midjourney prompt voor featured image'),
  socialMedia: z.object({
    instagram: z.object({
      caption: z.string().max(2200).describe('Instagram caption met emojis'),
      hashtags: z.array(z.string()).describe('15-20 relevante hashtags'),
    }),
    facebook: z.object({
      post: z.string().max(500).describe('Facebook post tekst'),
      hashtags: z.array(z.string()).describe('5-10 hashtags'),
    }),
    linkedin: z.object({
      post: z.string().max(700).describe('LinkedIn post tekst (professioneel)'),
      hashtags: z.array(z.string()).describe('3-5 professionele hashtags'),
    }),
    twitter: z.object({
      tweet: z.string().max(280).describe('Twitter/X tweet'),
      hashtags: z.array(z.string()).describe('2-3 hashtags'),
    }),
  }).describe('Social media content voor verschillende platforms'),
});

export const articleToBlogFlow = ai.defineFlow(
  {
    name: 'articleToBlog',
    inputSchema: ArticleToBlogInputSchema,
    outputSchema: ArticleToBlogOutputSchema,
  },
  async (_input) => {
    // Instead of using ai.generate with a Gemini model, we'll throw an error
    // directing users to use the OpenRouter-based service
    throw new Error('This flow has been deprecated. Please use the OpenRouter-based service in src/lib/ai-service.ts instead.');
    
    /*
    // Eerst het artikel ophalen als URL is gegeven
    let articleContent = input.articleText || '';

    if (input.articleUrl && !articleContent) {
      try {
        const response = await fetch(input.articleUrl);
        const html = await response.text();

        // Eenvoudige HTML parsing (in productie zou je een betere parser gebruiken)
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

    const { text } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: `Je bent een expert SEO contentwriter voor DatingAssistent.nl, gespecialiseerd in het herschrijven van externe artikelen naar SEO-geoptimaliseerde blogs over online daten.

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

6. **BELANGRIJKE SCHRIJFREGELS:**
   - Gebruik ALTIJD correcte hoofdletters:
     * Begin van elke zin met een HOOFDLETTER
     * Begin van H1, H2, H3 tags met een HOOFDLETTER
     * Gebruik GEEN volledig kleine letters (lowercase) in de content
     * Voorbeeld GOED: "De realiteit van dating apps: hoop vs. teleurstelling"
     * Voorbeeld FOUT: "De Realiteit van Dating Apps: Hoop vs. Teleurstelling"
   - Zorg dat HTML tags correct zijn geformatteerd
   - Gebruik Nederlandse grammatica en interpunctie correct

**MIDJOURNEY IMAGE PROMPT:**
Genereer een professionele Midjourney prompt voor de featured image van deze blog:
- Stijl: Modern, warm, inclusief, professioneel
- Thema: Gebaseerd op het artikel onderwerp
- Sfeer: Positief, hoopvol, menselijk
- Technische specs: "--ar 16:9 --style raw --v 6"
- Focus: Diverse singles, dating context, modern technologie
- Vermijd: Stock photo gevoel, clichés, overdreven romantiek

**SOCIAL MEDIA CONTENT:**
Genereer voor elk platform optimale content:

**Instagram:**
- Caption: 2-3 alinea's, gebruik emojis, call-to-action, persoonlijke toon
- Hashtags: 15-20 stuks, mix van populair (#dating #liefde) en niche (#datingcoach2025 #aidating)

**Facebook:**
- Post: Korte intro, kernboodschap, vraag aan lezers, link
- Hashtags: 5-10 relevante hashtags
- Tone: Vriendelijk, conversationeel

**LinkedIn:**
- Post: Professionele insteek, waarde voor professionals, netwerk-gericht
- Hashtags: 3-5 professionele hashtags (#RelationshipCoaching #AIInnovation)
- Tone: Zakelijk maar toegankelijk

**Twitter/X:**
- Tweet: Pakkende one-liner, key takeaway, link
- Hashtags: 2-3 hashtags
- Max 280 karakters

**OUTPUT FORMAT (JSON):**
{
  "title": "H1 titel hier",
  "metaTitle": "Meta title (max 60 chars)",
  "metaDescription": "Meta description (max 155 chars)",
  "slug": "url-slug-hier",
  "content": "<h1>...</h1><p>...</p>...",
  "excerpt": "Korte samenvatting van 2-3 zinnen voor preview",
  "keywords": ["keyword 1", "keyword 2", "keyword 3", "keyword 4", "keyword 5", "keyword 6", "keyword 7"],
  "midjourneyPrompt": "Professional Midjourney prompt here with technical parameters",
  "socialMedia": {
    "instagram": {
      "caption": "Instagram caption met emojis en persoonlijke toon",
      "hashtags": ["hashtag1", "hashtag2", ...]
    },
    "facebook": {
      "post": "Facebook post tekst",
      "hashtags": ["hashtag1", "hashtag2", ...]
    },
    "linkedin": {
      "post": "LinkedIn professionele post",
      "hashtags": ["hashtag1", "hashtag2", ...]
    },
    "twitter": {
      "tweet": "Pakkende tweet max 280 chars",
      "hashtags": ["hashtag1", "hashtag2"]
    }
  }
}

Genereer nu een complete, SEO-geoptimaliseerde blog met Midjourney prompt en social media content gebaseerd op het bronartikel.`,
      output: { schema: ArticleToBlogOutputSchema },
    });

    return text as z.infer<typeof ArticleToBlogOutputSchema>;
    */
  }
);
