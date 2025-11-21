# Analytics Setup Guide

Deze gids legt uit hoe je echte data kunt krijgen voor het management dashboard door Google Analytics 4 en SendGrid te integreren.

## 📊 Google Analytics 4 Setup

### Stap 1: GA4 Property Aanmaken
1. Ga naar [Google Analytics](https://analytics.google.com/)
2. Klik op "Start measuring" → "Web"
3. Voer je website URL in (bijv. `datingassistent.nl`)
4. Kies "Create a Google Analytics 4 property"
5. Noteer je **Property ID** (begint met "G-")

### Stap 2: Service Account Aanmaken
1. Ga naar [Google Cloud Console](https://console.cloud.google.com/)
2. Maak een nieuw project aan of selecteer bestaand project
3. Ga naar "APIs & Services" → "Credentials"
4. Klik "Create Credentials" → "Service Account"
5. Geef het een naam (bijv. "dating-analytics")
6. Klik "Create and Continue" (skip roles voor nu)
7. Klik op de service account → "Keys" tab
8. "Add Key" → "Create new key" → JSON
9. Download de JSON key file

### Stap 3: GA4 API Inschakelen
1. In Google Cloud Console, ga naar "APIs & Services" → "Library"
2. Zoek naar "Google Analytics Data API"
3. Klik "Enable"

### Stap 4: Service Account Toegang Geven
1. Ga terug naar Google Analytics
2. Ga naar Admin → Property → Data Streams
3. Klik op je data stream
4. Ga naar "Configure tag settings" → "Show all" → "Configure your Google tag"
5. Klik op "Admin" (linkerbalk) → "Property Access Management"
6. Klik "+" → "Add users"
7. Voeg je service account email toe (van de JSON key)
8. Geef "Viewer" permissions

### Stap 5: Environment Variables
Voeg toe aan je `.env.local`:
```env
# Google Analytics 4
GA4_PROPERTY_ID=G-XXXXXXXXXX
GA4_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GA4_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----"
```

## 📧 SendGrid Setup

### Stap 1: SendGrid Account
1. Ga naar [SendGrid](https://sendgrid.com/)
2. Maak een account aan (gratis tier is voldoende)
3. Verificeer je email adres

### Stap 2: API Key Aanmaken
1. Ga naar Settings → API Keys
2. Klik "Create API Key"
3. Geef het een naam (bijv. "DatingAssistent Analytics")
4. Kies "Full Access" permissions
5. Kopieer de API key (bewaar veilig!)

### Stap 3: Domain Authenticatie (Optioneel maar Aanbevolen)
1. Ga naar Settings → Sender Authentication
2. Kies "Verify a domain" voor betere deliverability
3. Voeg je domain toe en volg de DNS instructies

### Stap 4: Environment Variables
Voeg toe aan je `.env.local`:
```env
# SendGrid
SENDGRID_API_KEY=SG.your-api-key-here
```

## 🔧 Technische Configuratie

### Vercel/Postgres Setup
Zorg ervoor dat je Vercel Postgres database heeft met de juiste tabellen:

```sql
-- API Usage tracking (voor token kosten)
CREATE TABLE IF NOT EXISTS api_usage (
  id SERIAL PRIMARY KEY,
  provider VARCHAR(50),
  model VARCHAR(100),
  tokens_used INTEGER,
  cost_cents INTEGER,
  user_id INTEGER,
  feature_type VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Email campaign tracking (voor SendGrid data)
CREATE TABLE IF NOT EXISTS email_campaigns (
  id SERIAL PRIMARY KEY,
  campaign_name VARCHAR(255),
  subject VARCHAR(255),
  sent_count INTEGER,
  open_count INTEGER,
  click_count INTEGER,
  sendgrid_campaign_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Dashboard Testing
Na setup, test de integraties:

```bash
# Test Google Analytics
curl http://localhost:3000/api/admin/visitors

# Test SendGrid
curl http://localhost:3000/api/admin/emails

# Test alle analytics
curl http://localhost:3000/api/admin/analytics
```

## 📈 Wat Je Krijgt

### Met GA4 Integratie:
- ✅ **Echte bezoeker data** - geen mock data meer
- ✅ **Conversie tracking** - zie welke pagina's converteren
- ✅ **Geografische data** - bezoekers per land/stad
- ✅ **Device analytics** - desktop vs mobile usage
- ✅ **Traffic bronnen** - organic, direct, referral

### Met SendGrid Integratie:
- ✅ **Echte email metrics** - open rates, klik rates
- ✅ **Campaign performance** - vergelijk verschillende emails
- ✅ **Deliverability stats** - bounces, spam complaints
- ✅ **A/B test resultaten** - vergelijk subject lines
- ✅ **Unsubscribe tracking** - monitor lijst kwaliteit

## 🚨 Troubleshooting

### GA4 Problemen:
- **"Access denied"**: Check of service account de juiste permissions heeft
- **"Property not found"**: Controleer GA4_PROPERTY_ID
- **Mock data verschijnt**: GA4 credentials ontbreken of ongeldig

### SendGrid Problemen:
- **"Invalid API key"**: Check SENDGRID_API_KEY
- **Geen data**: Wacht 24 uur na eerste emails versturen
- **Mock data verschijnt**: API key ontbreekt of ongeldig

### Algemene Tips:
- Gebruik altijd environment variables, nooit hardcode credentials
- Test lokaal eerst voordat je naar productie gaat
- Monitor API rate limits (GA4: 10k requests/dag, SendGrid: varieert per plan)
- Set up alerts voor wanneer APIs falen (dashboard toont automatisch mock data)

## 💡 Pro Tips

1. **Start met SendGrid** - Email data is vaak sneller beschikbaar dan GA4
2. **Monitor API Costs** - GA4 en SendGrid hebben usage limits
3. **Backup Strategy** - Dashboard valt automatisch terug op mock data
4. **Caching** - Overweeg data caching om API calls te verminderen
5. **Privacy Compliance** - GA4 data is anoniem, check GDPR compliance

---

**Na setup zie je echte data in plaats van mock data in je management dashboard!** 🎉