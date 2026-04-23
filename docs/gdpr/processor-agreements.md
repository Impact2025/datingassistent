# Verwerkersovereenkomsten (DPA's)
**DatingAssistent.nl** | Versie 1.0 | 23 april 2026

---

## Status per verwerker

| Verwerker | Dienst | Locatie | DPA aanwezig | Doorgifte-mechanisme | Categorieën data | Actie vereist |
|---|---|---|---|---|---|---|
| **Neon** | PostgreSQL database | EU (Frankfurt) | ✅ | N.v.t. (EU) | Alle data incl. Art.9 | — |
| **Vercel** | Hosting & edge | EU / VS | ✅ | SCC Module 2 | Alle data | — |
| **OpenRouter** | AI gateway | VS | ⚠️ Onbevestigd | SCC (claim) | Gepseudonimiseerd + Art.9 mogelijk | **Zie actie 1** |
| **Anthropic** | Claude AI-modellen | VS | ⚠️ Onbevestigd | SCC (claim) | Gepseudonimiseerd | **Zie actie 2** |
| **Resend** | Transactionele email | VS | ✅ | SCC Module 2 | Naam + e-mail | — |
| **Stripe** | Betalingen | VS | ✅ | SCC Module 2 | Betaaldata | — |
| **Microsoft** | Clarity analytics | VS | ✅ | SCC Module 2 | Gedragsdata (gemaskerd op Art.9-routes) | — |
| **Google** | Analytics 4 | VS | ✅ | SCC Module 2 | Geanonimiseerde analytics | — |
| **Vercel** | Blob storage | EU / VS | ✅ | SCC Module 2 | Profielfoto's | — |

---

## Openstaande acties

### Actie 1 — OpenRouter DPA bevestigen
- Ga naar https://openrouter.ai/privacy
- Controleer of een DPA te activeren is voor zakelijke accounts
- Als geen formele DPA beschikbaar: overweeg directe Anthropic API-integratie
- **Deadline:** 1 juni 2026

### Actie 2 — Anthropic DPA activeren
- Ga naar https://www.anthropic.com/legal/dpa
- Activeer DPA voor het account gekoppeld aan de API key
- Verifieer no-training clausule is van toepassing
- **Deadline:** 1 juni 2026

---

## Pseudonimisering vóór AI-doorgifte

Conform `src/lib/ai-privacy.ts` worden de volgende transformaties uitgevoerd vóór verzending naar OpenRouter/Anthropic:

| Origineel | Verzonden als |
|---|---|
| Naam | Verwijderd |
| Exacte leeftijd | Leeftijdsrange (bijv. "30s") |
| Stad / regio | "Nederland" |
| User-ID | Nooit meegestuurd |
| E-mailadres | Nooit meegestuurd |

**Resterende Art.9-data in AI-verzoeken:**
- Gender (m/v/x)
- Seksuele voorkeur (wanneer relevant voor coaching)
- Psychologische inzichten (hechtingsstijl, patronen)

Deze data wordt gepseudonimiseerd verstuurd (geen directe identificatie mogelijk zonder koppeling aan de database).

---

## Bewaartermijnen bij verwerkers

| Verwerker | Bewaartermijn logs/data |
|---|---|
| OpenRouter | Max. 30 dagen API-logs (per DPA te bevestigen) |
| Anthropic | API-logs — zie anthropic.com/legal/dpa |
| Resend | Email-logs 30 dagen |
| Stripe | Betaaltransacties 7 jaar (fiscaal) |
| Microsoft Clarity | Sessie-opnames max. 30 dagen |
| Google Analytics | Geanonimiseerd na 14 maanden |
| Neon | Data blijft tot gebruiker verwijderd wordt |

---

## Wijzigingshistorie

| Datum | Versie | Wijziging |
|---|---|---|
| 23-04-2026 | 1.0 | Initiële versie |
