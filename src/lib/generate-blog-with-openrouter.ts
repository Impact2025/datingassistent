import { openRouter, OPENROUTER_MODELS } from './openrouter';

export interface BlogInput {
  topic?: string;
  primaryKeyword: string;
  year?: string;
  targetAudience?: string;
  category: string;
  extraKeywords?: string;
  toneOfVoice?: string;
  focus?: string;
  articleLength?: string;
}

export interface BlogOutput {
  title: string;
  metaTitle: string;
  metaDescription: string;
  slug: string;
  content: string;
  excerpt: string;
  keywords: string[];
  midjourneyPrompt: string;
  socialMedia: {
    instagram: {
      caption: string;
      hashtags: string[];
    };
    facebook: {
      post: string;
      hashtags: string[];
    };
    linkedin: {
      post: string;
      hashtags: string[];
    };
    twitter: {
      tweet: string;
      hashtags: string[];
    };
  };
}

/**
 * Genereer een blog met OpenRouter (Claude Haiku)
 * Claude Haiku is snel en kosteneffectief, ideaal voor content generatie
 */
export async function generateBlogWithOpenRouter(input: BlogInput): Promise<BlogOutput> {
  const prompt = `Je bent een expert dating coach en SEO contentwriter voor DatingAssistent.nl, gespecialiseerd in online daten, datingprofielen en AI-coaching voor singles.

Schrijf een SEO-geoptimaliseerde blogpost gericht op singles die begeleiding zoeken bij online daten.

**INPUT PARAMETERS:**
${input.topic ? `- Gewenste Titel: ${input.topic}` : '- Titel: Automatisch genereren op basis van keyword'}
- Primair Keyword: ${input.primaryKeyword}
- Categorie: ${input.category}
- Jaartal: ${input.year || '2025'}
${input.targetAudience ? `- Doelgroep/Doel: ${input.targetAudience}` : ''}
${input.extraKeywords ? `- Extra Keywords: ${input.extraKeywords}` : ''}
- Tone of Voice: ${input.toneOfVoice || 'Vriendelijk en motiverend'}
- Doelgroep Focus: ${input.focus || 'Algemeen - Alle singles'}
- Artikel Lengte: ${input.articleLength || 'Middellang (700-900 woorden)'}

**TONE OF VOICE:** ${input.toneOfVoice || 'Vriendelijk en motiverend'}
- Vriendelijk, motiverend en persoonlijk
- Praktisch en concreet met voorbeelden en stappenplannen
- Positief en laagdrempelig (geen zware theorie, maar bruikbare tips)
- Alsof een dating coach je direct aanspreekt
- Inclusief en toegankelijk voor ${input.focus || 'Algemeen - Alle singles'}

**SCHRIJFSTIJL REGELS:**
- Gebruik ALLEEN een hoofdletter aan het begin van een zin
- Titels en koppen: schrijf in normale zinsvorm (bijvoorbeeld: "Waarom online daten nu essentieel is" in plaats van "Waarom Online Daten Nu Essentieel Is")
- GEEN gedachtestreepjes gebruiken in de lopende tekst
- Gebruik komma's en punten voor natuurlijke zinsbouw
- Schrijf vloeiend en natuurlijk zoals je zou praten

**STRUCTUUR (in HTML):**

<h1>[Pakkende titel met primair keyword - alleen hoofdletter aan begin van zin]</h1>

<p><strong>Introductie (100-150 woorden):</strong> Begin met een herkenbare situatie of vraag waar singles mee worstelen. Maak een verbinding met hun uitdagingen en kansen bij online daten.</p>

<h2>Waarom [thema] nu essentieel is</h2>
<p>[Context en urgentie voor singles]</p>

<h2>Concrete tips voor succes</h2>
<p>[Inleiding op praktische tips]</p>

<h3>1. [Eerste tip - alleen hoofdletter aan begin]</h3>
<p>[Praktisch voorbeeld met resultaten. Gebruik anchor text: <a href="/register">DatingAssistent gratis proberen</a>]</p>

<h3>2. [Tweede tip - alleen hoofdletter aan begin]</h3>
<p>[Praktisch voorbeeld. Gebruik anchor text: <a href="/features">AI datingcoach</a>]</p>

<h3>3. [Derde tip - alleen hoofdletter aan begin]</h3>
<p>[Praktisch voorbeeld. Gebruik anchor text: <a href="/dashboard">profiel verbeteren</a>]</p>

[Optioneel: 4e en 5e tip]

<h2>Jouw dating succes in ${input.year || '2025'}</h2>
<p>[Vooruitblik, trends, mogelijkheden]</p>

<h2>Start vandaag met meer zelfvertrouwen</h2>
<p><strong>Conclusie:</strong> Wil je meer zelfvertrouwen bij het daten en je kans op een echte match vergroten? Probeer DatingAssistent gratis en ontdek hoe onze AI coach je persoonlijk helpt met je profiel, openers en gesprekken. Start vandaag nog en laat technologie jouw dating game naar een hoger niveau tillen.</p>

<p><a href="/register">Start gratis met DatingAssistent</a> en vind de liefde die je verdient.</p>

**SEO VEREISTEN:**
- Meta title: MAX 60 karakters, bevat primair keyword
- Meta description: MAX 155 karakters, bevat call-to-action
- Slug: korte-url-slug (lowercase, hyphens)
- Verwerk deze 3 interne anchor texts: "DatingAssistent gratis proberen", "AI datingcoach", "profiel verbeteren"
- Voeg natuurlijk interne links toe naar:
  * /register (registratie/start pagina)
  * /features (diensten/features pagina)
  * /dashboard (dashboard voor ingelogde gebruikers)
  * /prijzen (prijzen pagina)
- Target deze 5 long-tail keywords natuurlijk in de tekst (gebaseerd op categorie ${input.category}):
  1. online daten tips ${input.year || '2025'}
  2. datingprofiel verbeteren
  3. AI dating coach
  4. eerste date tips
  5. dating app succes

**MIDJOURNEY IMAGE PROMPT:**
Genereer een professionele Midjourney prompt voor de featured image van deze blog:
- Stijl: Modern, warm, inclusief, professioneel
- Thema: ${input.primaryKeyword} - ${input.category}
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
Geef ALLEEN een geldig JSON object terug, zonder extra tekst, markdown code blocks, of andere opmaak:
{
  "title": "H1 titel hier",
  "metaTitle": "Meta title (max 60 chars)",
  "metaDescription": "Meta description (max 155 chars)",
  "slug": "url-slug-hier",
  "content": "<h1>...</h1><p>...</p>...",
  "excerpt": "Korte samenvatting van 2-3 zinnen voor preview",
  "keywords": ["keyword 1", "keyword 2", "keyword 3", "keyword 4", "keyword 5"],
  "midjourneyPrompt": "Professional Midjourney prompt here with technical parameters",
  "socialMedia": {
    "instagram": {
      "caption": "Instagram caption met emojis en persoonlijke toon",
      "hashtags": ["hashtag1", "hashtag2"]
    },
    "facebook": {
      "post": "Facebook post tekst",
      "hashtags": ["hashtag1", "hashtag2"]
    },
    "linkedin": {
      "post": "LinkedIn professionele post",
      "hashtags": ["hashtag1", "hashtag2"]
    },
    "twitter": {
      "tweet": "Pakkende tweet max 280 chars",
      "hashtags": ["hashtag1", "hashtag2"]
    }
  }
}

Genereer nu een complete, professionele blogpost. Geef ALLEEN het JSON object terug, zonder code blocks of extra tekst.`;

  try {
    // Gebruik Claude 3.5 Haiku via OpenRouter
    const response = await openRouter.createChatCompletion(
      OPENROUTER_MODELS.CLAUDE_35_HAIKU,
      [
        {
          role: 'user',
          content: prompt,
        },
      ],
      {
        max_tokens: 8192,
        temperature: 0.7,
      }
    );

    // Clean response - verwijder eventuele markdown code blocks
    let cleanText = response.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    // Parse JSON
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Geen geldig JSON gevonden in OpenRouter response');
    }

    const blogData = JSON.parse(jsonMatch[0]);
    return blogData as BlogOutput;
  } catch (error) {
    console.error('Fout bij genereren blog met OpenRouter:', error);
    throw new Error(
      `OpenRouter blog generatie fout: ${error instanceof Error ? error.message : 'Onbekende fout'}`
    );
  }
}
