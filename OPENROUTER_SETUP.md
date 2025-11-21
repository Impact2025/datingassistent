# OpenRouter Integratie voor DatingAssistent

## Overzicht

Je DatingAssistent app is nu uitgebreid met **OpenRouter** ondersteuning! OpenRouter geeft je toegang tot meerdere AI modellen via één API, waaronder **Claude 3.5 Haiku** - een snel en kosteneffectief model perfect voor jouw use cases.

## Waarom OpenRouter?

✅ **Kosteneffectief**: Vaak goedkoper dan directe API's
✅ **Flexibel**: Toegang tot 100+ AI modellen via één API
✅ **Snel**: Claude 3.5 Haiku is geoptimaliseerd voor snelheid
✅ **Betrouwbaar**: Automatische fallback en load balancing

## Setup Instructies

### Stap 1: OpenRouter API Key Verkrijgen

1. Ga naar [https://openrouter.ai/](https://openrouter.ai/)
2. Maak een account aan of log in
3. Ga naar [https://openrouter.ai/keys](https://openrouter.ai/keys)
4. Klik op "Create Key" en geef je key een naam (bijv. "DatingAssistent")
5. Kopieer de gegenereerde API key

### Stap 2: API Key Toevoegen aan .env.local

Open `.env.local` en vul je OpenRouter API key in:

\`\`\`bash
# OpenRouter API Key (voor Claude Haiku en andere modellen)
OPENROUTER_API_KEY=sk-or-v1-jouw-api-key-hier
\`\`\`

**Let op**: Vervang `your-openrouter-api-key-here` met je echte API key!

### Stap 3: (Optioneel) Standaard AI Provider Instellen

Je kunt kiezen welke AI provider standaard wordt gebruikt:

\`\`\`bash
# Standaard AI provider voor blog generatie
DEFAULT_BLOG_AI=openrouter  # opties: openrouter, gemini, claude

# Standaard AI provider voor chat/dating features
DEFAULT_CHAT_AI=openrouter  # opties: openrouter, gemini, claude
\`\`\`

## Beschikbare Features

### 1. Blog Generatie met OpenRouter

\`\`\`typescript
import { generateBlog } from '@/lib/ai-service';

const blog = await generateBlog({
  primaryKeyword: 'online dating tips',
  category: 'Dating Tips',
  year: '2025',
  toneOfVoice: 'Vriendelijk en motiverend',
}, 'openrouter'); // Gebruik OpenRouter (Claude Haiku)
\`\`\`

### 2. Dating Profiel Genereren

\`\`\`typescript
import { generateDatingProfile } from '@/lib/ai-service';

const profile = await generateDatingProfile({
  name: 'Sarah',
  age: 28,
  interests: ['yoga', 'reizen', 'fotografie'],
});
\`\`\`

### 3. Opener Genereren

\`\`\`typescript
import { generateOpener } from '@/lib/ai-service';

const opener = await generateOpener({
  name: 'Emma',
  bio: 'Houdt van wandelen en fotografie',
  interests: ['hiking', 'koffie'],
});
\`\`\`

### 4. Profiel Analyse

\`\`\`typescript
import { analyzeProfile } from '@/lib/ai-service';

const analysis = await analyzeProfile(
  'Mijn huidige dating profiel tekst...'
);

console.log('Score:', analysis.score);
console.log('Sterke punten:', analysis.strengths);
console.log('Verbeterpunten:', analysis.improvements);
\`\`\`

## Beschikbare AI Modellen via OpenRouter

De volgende modellen zijn beschikbaar via de OpenRouter client:

\`\`\`typescript
import { OPENROUTER_MODELS } from '@/lib/openrouter';

// Claude modellen (Anthropic)
OPENROUTER_MODELS.CLAUDE_35_HAIKU    // Snel & goedkoop - AANBEVOLEN
OPENROUTER_MODELS.CLAUDE_35_SONNET   // Balans kwaliteit/snelheid
OPENROUTER_MODELS.CLAUDE_3_OPUS      // Hoogste kwaliteit

// GPT modellen (OpenAI)
OPENROUTER_MODELS.GPT_4_TURBO
OPENROUTER_MODELS.GPT_4
OPENROUTER_MODELS.GPT_35_TURBO

// Gemini modellen (Google)
OPENROUTER_MODELS.GEMINI_PRO
OPENROUTER_MODELS.GEMINI_PRO_VISION
\`\`\`

## Testen van de Integratie

Er is een test suite beschikbaar om te controleren of alles werkt:

\`\`\`bash
# Optie 1: Via Node.js
npx tsx src/lib/test-openrouter.ts

# Optie 2: In je code
import { runAllTests } from '@/lib/test-openrouter';
await runAllTests();
\`\`\`

De test suite controleert:
- ✅ Blog generatie
- ✅ Profiel generatie
- ✅ Opener generatie
- ✅ Profiel analyse

## Directe OpenRouter Client Gebruiken

Voor custom use cases kun je de OpenRouter client direct gebruiken:

\`\`\`typescript
import { openRouter, OPENROUTER_MODELS } from '@/lib/openrouter';

const response = await openRouter.createChatCompletion(
  OPENROUTER_MODELS.CLAUDE_35_HAIKU,
  [
    {
      role: 'system',
      content: 'Je bent een dating coach.',
    },
    {
      role: 'user',
      content: 'Geef me tips voor een eerste date.',
    },
  ],
  {
    max_tokens: 1000,
    temperature: 0.7,
  }
);

console.log(response);
\`\`\`

## Kosten Overzicht

OpenRouter prijzen voor Claude 3.5 Haiku (voorbeeld tarieven):
- **Input**: ~$0.25 per miljoen tokens
- **Output**: ~$1.25 per miljoen tokens

💡 **Tip**: Claude Haiku is 10-20x goedkoper dan Claude Sonnet/Opus en perfect voor jouw use cases!

## Provider Vergelijking

| Feature | Gemini (Gratis) | Claude Direct | OpenRouter (Haiku) |
|---------|----------------|---------------|-------------------|
| Kosten | Gratis* | $15/maand | Pay-as-you-go |
| Snelheid | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Kwaliteit | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Rate Limits | 15 req/min | 50 req/min | 200+ req/min |
| Best voor | Prototyping | Premium features | Productie |

*Gratis tier heeft beperkingen

## Troubleshooting

### Error: "OpenRouter API key is niet ingesteld"

**Oplossing**: Zorg dat `OPENROUTER_API_KEY` correct is ingesteld in `.env.local`

### Error: "401 Unauthorized"

**Oplossing**: Controleer of je API key geldig is en niet verlopen is

### Error: "429 Too Many Requests"

**Oplossing**: Je hebt het rate limit bereikt. Wacht even of upgrade je OpenRouter plan

### Lange response tijden

**Oplossing**: Claude Haiku is snel. Als responses lang duren:
1. Controleer je internetverbinding
2. Overweeg kortere prompts te gebruiken
3. Verlaag `max_tokens` parameter

## Migratie Strategie

### Van Gemini naar OpenRouter

\`\`\`typescript
// Voor (Gemini)
import { generateBlogWithGemini } from '@/lib/generate-blog-with-gemini';
const blog = await generateBlogWithGemini(input);

// Na (OpenRouter - via unified service)
import { generateBlog } from '@/lib/ai-service';
const blog = await generateBlog(input, 'openrouter');

// Of gebruik de standaard provider (geen tweede parameter)
const blog = await generateBlog(input); // Gebruikt DEFAULT_BLOG_AI
\`\`\`

### Geleidelijke Migratie

Je kunt beide providers naast elkaar gebruiken:

\`\`\`typescript
// Gebruik OpenRouter voor nieuwe features
const newFeature = await generateBlog(input, 'openrouter');

// Behoud Gemini voor bestaande features (tijdens testing)
const existingFeature = await generateBlog(input, 'gemini');
\`\`\`

## Best Practices

1. **Gebruik omgevingsvariabelen**: Sla nooit API keys op in code
2. **Error handling**: Vang altijd errors op bij AI calls
3. **Rate limiting**: Implementeer throttling voor hoge volumes
4. **Caching**: Cache AI responses waar mogelijk
5. **Monitoring**: Log API gebruik en kosten

## Volgende Stappen

1. ✅ Verkrijg OpenRouter API key
2. ✅ Voeg key toe aan `.env.local`
3. ✅ Run de test suite
4. ✅ Integreer in je bestaande features
5. ✅ Monitor gebruik en kosten

## Support & Links

- 📚 [OpenRouter Documentatie](https://openrouter.ai/docs)
- 💬 [OpenRouter Discord](https://discord.gg/openrouter)
- 📊 [Pricing Calculator](https://openrouter.ai/models)
- 🔑 [API Keys Beheren](https://openrouter.ai/keys)

---

**Succes met je DatingAssistent app! 🚀**

Bij vragen, check de [OpenRouter Docs](https://openrouter.ai/docs) of vraag om hulp.
