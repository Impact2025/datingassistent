import { ai } from '../genkit';
import { z } from 'zod';

const BlogPostInputSchema = z.object({
  topic: z.string().optional().describe('Gewenste titel (optioneel, anders automatisch)'),
  primaryKeyword: z.string().describe('Primair SEO keyword'),
  year: z.string().default('2025').describe('Jaartal voor in de blog'),
  targetAudience: z.string().optional().describe('Doelgroep/Doel (optioneel)'),
  category: z.string().describe('Categorie van de blog'),
  extraKeywords: z.string().optional().describe('Extra keywords komma gescheiden'),
  toneOfVoice: z.string().default('Professioneel & Inspirerend').describe('Tone of voice'),
  focus: z.string().default('Algemeen - Alle kopzijde').describe('Doelgroep focus'),
  articleLength: z.string().default('Middellang (700-900 woorden)').describe('Gewenste artikel lengte'),
  includeImageSuggestion: z.boolean().default(true).describe('Include afbeelding suggesties'),
});

const BlogPostOutputSchema = z.object({
  title: z.string().describe('Blog titel (H1)'),
  metaTitle: z.string().max(60).describe('Meta title (max 60 karakters)'),
  metaDescription: z.string().max(155).describe('Meta description (max 155 karakters)'),
  slug: z.string().describe('URL slug (korte, SEO-vriendelijke URL)'),
  content: z.string().describe('Volledige blog content in HTML format met H2, H3, p tags'),
  excerpt: z.string().describe('Korte samenvatting voor preview'),
  keywords: z.array(z.string()).describe('Lijst van 5 long-tail keywords'),
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

export const generateBlogPostFlow = ai.defineFlow(
  {
    name: 'generateBlogPost',
    inputSchema: BlogPostInputSchema,
    outputSchema: BlogPostOutputSchema,
  },
  async (input) => {
    // Instead of using ai.generate with a Gemini model, we'll throw an error
    // directing users to use the OpenRouter-based service
    throw new Error('This flow has been deprecated. Please use the OpenRouter-based service in src/lib/ai-service.ts instead.');
    
    /*
    const { text } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp',
      prompt: `Je bent een expert dating coach en SEO contentwriter voor DatingAssistent.nl, gespecialiseerd in online daten, datingprofielen en AI-coaching voor singles.

Schrijf een SEO-geoptimaliseerde blogpost gericht op singles die begeleiding zoeken bij online daten.

**INPUT PARAMETERS:**
${input.topic ? `- Gewenste Titel: ${input.topic}` : '- Titel: Automatisch genereren op basis van keyword'}
- Primair Keyword: ${input.primaryKeyword}
- Categorie: ${input.category}
- Jaartal: ${input.year}
${input.targetAudience ? `- Doelgroep/Doel: ${input.targetAudience}` : ''}
${input.extraKeywords ? `- Extra Keywords: ${input.extraKeywords}` : ''}
- Tone of Voice: ${input.toneOfVoice}
- Doelgroep Focus: ${input.focus}
- Artikel Lengte: ${input.articleLength}

**TONE OF VOICE:** ${input.toneOfVoice}
- Vriendelijk, motiverend en persoonlijk
- Praktisch en concreet met voorbeelden en stappenplannen
- Positief en laagdrempelig (geen zware theorie, maar bruikbare tips)
- Alsof een dating coach je direct aanspreekt
- Inclusief en toegankelijk voor ${input.focus}

**STRUCTUUR (in HTML):**

<h1>[Pakkende titel met primair keyword]</h1>

<p><strong>Introductie (100-150 woorden):</strong> Waarom dit thema juist nu een kantelpunt is voor welzijnswerk. Maak een verbinding met de uitdagingen en kansen in het sociaal domein.</p>

<h2>Waarom [Thema] Nu Essentieel Is</h2>
<p>[Context en urgentie]</p>

<h2>Concrete Toepassingen in de Praktijk</h2>
<p>[Inleiding op toepassingen]</p>

<h3>1. [Eerste Toepassing]</h3>
<p>[Praktisch voorbeeld met resultaten. Gebruik anchor text: <a href="/diensten">impactvolle innovaties</a>]</p>

<h3>2. [Tweede Toepassing]</h3>
<p>[Praktisch voorbeeld. Gebruik anchor text: <a href="/ai-welzijn">AI voor welzijn</a>]</p>

<h3>3. [Derde Toepassing]</h3>
<p>[Praktisch voorbeeld. Gebruik anchor text: <a href="/contact">samen impact maken</a>]</p>

[Optioneel: 4e en 5e toepassing]

<h2>Kansen voor Organisaties in ${input.year}</h2>
<p>[Vooruitblik, trends, mogelijkheden]</p>

<h2>Klaar om aan de Slag?</h2>
<p><strong>Conclusie:</strong> Wil je meer zelfvertrouwen bij het daten en je kans op een echte match vergroten? Probeer DatingAssistent gratis en ontdek hoe onze AI-coach je persoonlijk helpt met je profiel, openers en gesprekken. Start vandaag nog en laat technologie jouw dating game naar een hoger niveau tillen.</p>

<p><a href="https://datingassistent.nl/start">Start gratis met DatingAssistent</a> en vind de liefde die je verdient.</p>

**SEO VEREISTEN:**
- Meta title: MAX 60 karakters, bevat primair keyword
- Meta description: MAX 155 karakters, bevat call-to-action
- Slug: korte-url-slug (lowercase, hyphens)
- Verwerk deze 3 interne anchor texts: "DatingAssistent gratis proberen", "AI datingcoach", "profiel verbeteren"
- Target deze 5 long-tail keywords natuurlijk in de tekst (gebaseerd op categorie ${input.category}):
  1. online daten tips ${input.year}
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

**BELANGRIJKE SCHRIJFREGELS:**
1. Gebruik ALTIJD correcte hoofdletters:
   - Begin van elke zin met een HOOFDLETTER
   - Begin van H1, H2, H3 tags met een HOOFDLETTER
   - Gebruik GEEN volledig kleine letters (lowercase) in de content
   - Voorbeeld GOED: "Waarom een datingprofiel verbeteren nu essentieel is"
   - Voorbeeld FOUT: "waarom een datingprofiel verbeteren nu essentieel is"
2. Zorg dat HTML tags correct zijn geformatteerd
3. Gebruik Nederlandse grammatica en interpunctie correct

Genereer nu een complete, professionele blogpost met Midjourney prompt en social media content.`,
      output: { schema: BlogPostOutputSchema },
    });

    return text as z.infer<typeof BlogPostOutputSchema>;
    */
  }
);
