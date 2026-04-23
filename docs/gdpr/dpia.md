# Data Protection Impact Assessment (DPIA)
**DatingAssistent.nl** | Versie 1.0 | 23 april 2026
Conform AVG Artikel 35 en AP-richtlijnen

---

## 1. Beschrijving van de verwerking

| Aspect | Details |
|---|---|
| **Verwerkingsverantwoordelijke** | DatingAssistent (chat@weareimpact.nl) |
| **Doeleinden** | Gepersonaliseerde AI dating coaching, assessment-uitkomsten, voortgangsbewaking |
| **Categorieën betrokkenen** | Geregistreerde gebruikers (18+), uitsluitend Nederland |
| **Categorieën persoonsgegevens** | Zie sectie 2 |
| **Ontvangers** | Zie processor-agreements.md |
| **Doorgifte buiten EU** | Ja — VS (OpenRouter, Anthropic, Vercel, Stripe, Resend, Microsoft) via SCC's |
| **Bewaartermijnen** | Zie privacyverklaring sectie 5 |

---

## 2. Categorieën persoonsgegevens

### Gewone persoonsgegevens (Art. 6 AVG)
- Naam, e-mailadres, wachtwoord (bcrypt)
- Leeftijdsrange, regio (gegeneraliseerd)
- Abonnements- en betaalgegevens
- Sessie- en navigatiedata (achter cookie consent)

### Bijzondere categorieën (Art. 9 AVG) — HOOG RISICO
| Categorie | Grondslag Art. 9(2) | Geïmplementeerd |
|---|---|---|
| Seksuele voorkeur (`looking_for`) | sub a — uitdrukkelijke toestemming | ✅ v1.0 |
| Psychologische data (hechtingsstijl, angsten, trauma's) | sub a — uitdrukkelijke toestemming | ✅ v1.0 |
| Persoonlijke reflecties (dagboek-achtig) | sub a — uitdrukkelijke toestemming | ✅ v1.0 |

---

## 3. Noodzakelijkheid en evenredigheid

**Waarom is deze verwerking noodzakelijk?**
De kernwaarde van DatingAssistent is hyperpersonalisatie op basis van psychologische inzichten. Zonder Art.9-data kan de app niet differentiëren van generieke dating tips. De verwerking is proportioneel aan het doel.

**Minimalisatieprincipe:**
- Leeftijd wordt omgezet naar range vóór AI-verwerking (`getAgeRange()`)
- Naam wordt verwijderd vóór AI-verwerking
- Locatie wordt gegeneraliseerd naar "Nederland"
- User-ID wordt nooit naar externe AI-APIs gestuurd

---

## 4. Risicobeoordeling

### Risico 1: Datalek van Art.9-data
- **Kans:** Middel (cloud-hosted, meerdere verwerkers)
- **Impact:** Hoog (seksuele voorkeur + psychologische data is zeer gevoelig)
- **Restrisico na maatregel:** Laag
- **Maatregelen:** TLS in transit, bcrypt wachtwoorden, Auth-tokens, rate limiting, Neon encryption-at-rest

### Risico 2: Ongeoorloofde AI-training op gebruikersdata
- **Kans:** Laag (contractueel geborgd)
- **Impact:** Hoog (privacyschending op grote schaal)
- **Restrisico:** Laag
- **Maatregelen:** DPA met Anthropic (no-training clausule), DPA met OpenRouter

### Risico 3: Profilering en discriminatie
- **Kans:** Laag
- **Impact:** Middel (coaching-aanbevelingen op basis van profiel)
- **Restrisico:** Laag
- **Maatregelen:** AI-uitkomsten zijn adviezen, geen automatische beslissingen met rechtsgevolg (Art. 22 n.v.t.)

### Risico 4: Onrechtmatige doorgifte buiten EU
- **Kans:** Laag (SCC's aanwezig)
- **Impact:** Hoog
- **Restrisico:** Laag-Middel
- **Maatregelen:** SCC's Module 2 met alle VS-verwerkers, pseudonimisering vóór AI-verwerking

### Risico 5: Identiteitsdiefstal via gestolen account
- **Kans:** Laag-Middel
- **Impact:** Hoog (gevoelige profieldata)
- **Restrisico:** Laag
- **Maatregelen:** bcrypt, email-verificatie, rate limiting op auth, JWT met expiry

---

## 5. Technische en organisatorische maatregelen

| Maatregel | Status |
|---|---|
| Encryption in transit (TLS 1.2+) | ✅ |
| Bcrypt wachtwoordhashing (10 rounds) | ✅ |
| JWT auth met expiry | ✅ |
| Rate limiting op auth-endpoints | ✅ |
| Pseudonimisering vóór AI-doorgifte | ✅ |
| Expliciete Art.9-toestemming (consent modal) | ✅ v1.0 |
| Automatische verwijdering (cron) | ✅ |
| Bewaartermijnen cron | ✅ |
| Gebruikersrechten dashboard (Art.15-21) | ✅ |
| Clarity masking op gevoelige routes | ✅ |
| DPA met alle verwerkers | ⚠️ OpenRouter/Anthropic te bevestigen |
| Encryption at rest (database) | ⚠️ Neon-niveau, verificatie vereist |
| Penetratietest | ❌ Gepland Q3 2026 |

---

## 6. Subverwerkers

Zie `docs/gdpr/processor-agreements.md`

---

## 7. Advies Functionaris Gegevensbescherming

*[DatingAssistent heeft geen aangestelde FG — bij schaalgroei <250 medewerkers is dit niet verplicht, tenzij grootschalige verwerking van Art.9-data. Gezien de aard van de app wordt aanstelling van een externe privacy-adviseur aanbevolen voor Q3 2026.]*

---

## 8. Besluit

De verwerking is noodzakelijk en evenredig. Met de geïmplementeerde maatregelen is het restrisico acceptabel. DPIA wordt jaarlijks herzien of bij materiële wijzigingen in de verwerking.

| | |
|---|---|
| **Datum** | 23 april 2026 |
| **Versie** | 1.0 |
| **Volgende review** | April 2027 of bij materiële wijziging |
