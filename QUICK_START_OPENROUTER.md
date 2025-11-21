# Quick Start: OpenRouter met Claude 4.5 Haiku

## In 3 Minuten Live! 🚀

### Stap 1: API Key Verkrijgen (2 minuten)

1. Ga naar: **https://openrouter.ai/**
2. Klik op "Sign In" (rechtsboven)
3. Login met Google/GitHub
4. Ga naar: **https://openrouter.ai/keys**
5. Klik "Create Key"
6. Naam: `DatingAssistent`
7. **Kopieer je key** (begint met `sk-or-v1-...`)

### Stap 2: API Key Instellen (30 seconden)

Open `.env.local` en vervang deze regel:

\`\`\`bash
OPENROUTER_API_KEY=your-openrouter-api-key-here
\`\`\`

Door jouw echte key:

\`\`\`bash
OPENROUTER_API_KEY=sk-or-v1-abc123xyz...
\`\`\`

### Stap 3: Test (30 seconden)

Open je terminal en run:

\`\`\`bash
npx tsx src/lib/test-openrouter.ts
\`\`\`

Zie je ✅ groene vinkjes? **Gefeliciteerd! Het werkt!** 🎉

## Gebruik in je App

### Voorbeeld 1: Blog Genereren

\`\`\`typescript
import { generateBlog } from '@/lib/ai-service';

const blog = await generateBlog({
  primaryKeyword: 'eerste date tips',
  category: 'Dating Tips',
  year: '2025',
});

console.log(blog.title); // "10 Eerste Date Tips voor 2025"
\`\`\`

### Voorbeeld 2: Dating Profiel

\`\`\`typescript
import { generateDatingProfile } from '@/lib/ai-service';

const profiel = await generateDatingProfile({
  name: 'Jouw Naam',
  age: 28,
  interests: ['reizen', 'sporten', 'lezen'],
});

console.log(profiel); // "Avontuurlijke 28-jarige die..."
\`\`\`

### Voorbeeld 3: Opener Genereren

\`\`\`typescript
import { generateOpener } from '@/lib/ai-service';

const opener = await generateOpener({
  name: 'Emma',
  bio: 'Houdt van wandelen in de bergen',
});

console.log(opener); // "Hey Emma! Ik zag dat je..."
\`\`\`

## Kosten

Claude 3.5 Haiku is **super goedkoop**:

- Blog (1000 woorden) ≈ **$0.01** (1 cent!)
- Dating profiel ≈ **$0.001** (0.1 cent!)
- Opener ≈ **$0.0005** (0.05 cent!)

💡 **Voor €10 kun je ~1000 blogs genereren!**

## Troubleshooting

**❌ Error: "API key is niet ingesteld"**
→ Check `.env.local` en herstart je dev server

**❌ Error: "401 Unauthorized"**
→ Je API key is niet correct, haal een nieuwe op

**❌ Slow response**
→ Check je internet, OpenRouter is normaal super snel

## Support

Probleem? Check: https://openrouter.ai/docs

**Klaar om te beginnen? Laten we gaan! 🚀**
