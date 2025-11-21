# 🚀 Vercel Deployment Guide - DatingAssistent.nl

Complete stap-voor-stap handleiding voor het deployen van DatingAssistent naar Vercel.

## 📋 Vereisten Checklist

Voordat je begint, zorg dat je het volgende hebt:

- [ ] GitHub account met de repository gepushed
- [ ] Vercel account (gratis tier is voldoende voor starten)
- [ ] Neon PostgreSQL database (productie database)
- [ ] SendGrid API key (verified sender)
- [ ] OpenRouter API key (met credit)
- [ ] MultiSafePay account (test of productie)
- [ ] reCAPTCHA v3 keys (site + secret)
- [ ] Sentry account (optioneel, voor monitoring)
- [ ] Google Analytics 4 property (optioneel)

## 🎯 Deployment Opties

### Optie 1: Via Vercel Dashboard (Aanbevolen voor beginners)

#### Stap 1: Connect GitHub Repository

1. Ga naar [Vercel Dashboard](https://vercel.com/dashboard)
2. Klik op **"Add New Project"**
3. Selecteer **"Import Git Repository"**
4. Kies je GitHub account en zoek **datingassistent** repository
5. Klik op **"Import"**

#### Stap 2: Configureer Project Settings

**Framework Preset**: Next.js (wordt automatisch gedetecteerd)

**Root Directory**: `./` (laat leeg)

**Build Settings**:
```
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Development Command: npm run dev
```

**Node.js Version**: 20.x

#### Stap 3: Environment Variables Toevoegen

⚠️ **KRITIEK**: Voeg ALLE variabelen toe voordat je deploy!

Klik op **"Environment Variables"** en voeg de volgende variabelen toe:

##### Database (Vereist)
```
POSTGRES_URL = postgresql://[USERNAME]:[PASSWORD]@[HOST]/[DATABASE]?sslmode=require&pgbouncer=true&connect_timeout=15

POSTGRES_PRISMA_URL = postgresql://[USERNAME]:[PASSWORD]@[HOST]/[DATABASE]?sslmode=require&channel_binding=require&pgbouncer=true&connect_timeout=15

POSTGRES_URL_NON_POOLING = postgresql://[USERNAME]:[PASSWORD]@[HOST]/[DATABASE]?sslmode=require&channel_binding=require
```

📝 **Neon Database Instructies**:
1. Ga naar [Neon Console](https://console.neon.tech/)
2. Selecteer je productie database
3. Klik op "Connection Details"
4. Kopieer de connection strings (selecteer "Pooled" voor POSTGRES_URL)

##### Authentication (Vereist)
```
JWT_SECRET = [GENEREER NIEUWE SECRET]
```

🔐 **Genereer nieuwe secret**:
```bash
openssl rand -base64 32
# Of gebruik: https://generate-secret.vercel.app/32
```

##### Email Service (Vereist)
```
SENDGRID_API_KEY = SG.[YOUR_API_KEY]
```

📧 **SendGrid Setup**:
1. Ga naar [SendGrid](https://app.sendgrid.com/)
2. Ga naar Settings > API Keys
3. Create API Key met "Full Access"
4. Kopieer de key (je ziet hem maar 1x!)

##### AI Services (Vereist)
```
OPENROUTER_API_KEY = sk-or-v1-[YOUR_KEY]
NEXT_PUBLIC_APP_URL = [JE_VERCEL_URL]
```

🤖 **OpenRouter Setup**:
1. Ga naar [OpenRouter](https://openrouter.ai/keys)
2. Create API Key
3. Add credits ($5 minimum voor start)

##### Payment Provider (Vereist)
```
MULTISAFEPAY_API_KEY = [YOUR_API_KEY]
NEXT_PUBLIC_MSP_TEST_MODE = false
MULTISAFEPAY_WEBHOOK_SECRET = [GENEREER NIEUWE SECRET]
```

💳 **MultiSafePay Setup**:
1. Log in op [MultiSafePay Merchant](https://merchant.multisafepay.com/)
2. Ga naar Settings > API Keys
3. Kopieer Production API Key
4. Genereer webhook secret: `openssl rand -base64 32`

⚠️ **Webhook URL**: Na deployment, configureer in MultiSafePay:
```
https://jouw-domain.vercel.app/api/payment/webhook
```

##### Application Settings (Vereist)
```
NEXT_PUBLIC_BASE_URL = https://jouw-domain.vercel.app
NODE_ENV = production
```

##### Security (Vereist)
```
RECAPTCHA_SECRET_KEY = [YOUR_SECRET_KEY]
NEXT_PUBLIC_RECAPTCHA_SITE_KEY = [YOUR_SITE_KEY]
```

🔒 **reCAPTCHA v3 Setup**:
1. Ga naar [reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Register new site
3. Select reCAPTCHA v3
4. Add domain: jouw-domain.vercel.app
5. Copy site key en secret key

##### Monitoring (Optioneel maar aanbevolen)
```
SENTRY_DSN = https://[KEY]@[REGION].ingest.sentry.io/[PROJECT_ID]
NEXT_PUBLIC_SENTRY_DSN = [SAME_AS_ABOVE]
SENTRY_ORG = [YOUR_ORG_SLUG]
SENTRY_PROJECT = [YOUR_PROJECT_NAME]
```

📊 **Sentry Setup**:
1. Ga naar [Sentry](https://sentry.io/)
2. Create new project (Next.js)
3. Copy DSN
4. Copy org slug en project name

##### Analytics (Optioneel)
```
GA4_PROPERTY_ID = G-[YOUR_ID]
```

📈 **Google Analytics 4 Setup**:
1. Ga naar [Google Analytics](https://analytics.google.com/)
2. Create property
3. Copy Measurement ID

#### Stap 4: Deploy!

1. Controleer of alle environment variables zijn toegevoegd
2. Klik op **"Deploy"**
3. Wacht terwijl Vercel:
   - Installeert dependencies
   - Bouwt de applicatie
   - Deploy naar productie

⏱️ **Verwachte build tijd**: 3-5 minuten

---

### Optie 2: Via Vercel CLI (Voor gevorderden)

#### Stap 1: Installeer Vercel CLI

```bash
npm install -g vercel
```

#### Stap 2: Login

```bash
vercel login
```

#### Stap 3: Link Project

```bash
# In je project directory
vercel link
```

Volg de prompts:
- Kies je team/account
- Link naar existing project of create new
- Geef project naam: datingassistent

#### Stap 4: Environment Variables

```bash
# Voeg secrets toe via CLI
vercel env add POSTGRES_URL production
vercel env add JWT_SECRET production
vercel env add SENDGRID_API_KEY production
# ... voeg alle andere variabelen toe
```

Of importeer uit bestand:
```bash
vercel env pull .env.production
# Edit .env.production met productie waarden
vercel env push .env.production production
```

#### Stap 5: Deploy

```bash
# Deploy naar productie
vercel --prod
```

---

## 🔧 Post-Deployment Configuratie

### 1. Custom Domain (Optioneel)

**Via Vercel Dashboard**:
1. Ga naar Project Settings > Domains
2. Add Domain: `datingassistent.nl`
3. Voeg DNS records toe bij je domain provider:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

4. Wacht op DNS propagatie (5-60 minuten)

### 2. MultiSafePay Webhook

1. Ga naar [MultiSafePay Merchant](https://merchant.multisafepay.com/)
2. Settings > Websites > [Your Site]
3. Notification URL:
```
https://datingassistent.nl/api/payment/webhook
```

### 3. Database Migraties

Als je database migraties moet draaien:

```bash
# Via Vercel CLI met productie env
vercel env pull .env.production
npm run init-db
```

Of gebruik Neon Console SQL Editor om migraties handmatig te draaien.

### 4. SendGrid Domain Authentication

Voor betere email deliverability:

1. Ga naar SendGrid > Settings > Sender Authentication
2. Authenticate your domain
3. Add DNS records bij je domain provider
4. Verify domain

---

## ✅ Deployment Verification Checklist

Na deployment, test de volgende functionaliteit:

### Basis Functionaliteit
- [ ] Homepage laadt correct
- [ ] Static assets (images, fonts) laden
- [ ] CSS/Tailwind styles werken
- [ ] Navigation werkt

### Authentication
- [ ] Registratie pagina bereikbaar
- [ ] Nieuwe gebruiker kan registreren
- [ ] Verificatie email wordt verzonden
- [ ] Login werkt
- [ ] JWT tokens worden correct aangemaakt
- [ ] Protected routes zijn beveiligd

### Database
- [ ] Database queries werken
- [ ] Data wordt correct opgeslagen
- [ ] Data wordt correct opgehaald
- [ ] Geen connection pool errors

### AI Features
- [ ] Foto analyse werkt
- [ ] Chat coach werkt
- [ ] Bio generator werkt
- [ ] Geen rate limit errors bij eerste requests

### Email
- [ ] Welcome email wordt verzonden
- [ ] Password reset email werkt
- [ ] Email templates renderen correct
- [ ] Geen SendGrid errors in logs

### Payment
- [ ] Payment page bereikbaar
- [ ] MultiSafePay redirect werkt
- [ ] Webhook wordt ontvangen
- [ ] Subscriptions worden geactiveerd

### Admin Panel
- [ ] Admin login werkt
- [ ] Dashboard data laadt
- [ ] Admin functies werken
- [ ] Analytics worden weergegeven

### Security
- [ ] HTTPS is actief (groene hangslot)
- [ ] Security headers aanwezig
- [ ] reCAPTCHA werkt op formulieren
- [ ] Rate limiting werkt
- [ ] CORS correct geconfigureerd

### Monitoring
- [ ] Sentry errors worden gevangen
- [ ] GA4 pageviews worden getrackt
- [ ] Performance metrics beschikbaar

---

## 🐛 Troubleshooting

### Build Fails

**Error**: "Module not found"
```bash
# Zorg dat alle dependencies in package.json staan
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

**Error**: "TypeScript errors"
```bash
# Run type check lokaal
npm run typecheck
# Fix alle errors voordat je pushed
```

### Database Connection Errors

**Error**: "Connection timeout"
- Check of POSTGRES_URL correct is
- Verify dat Neon database actief is
- Check Neon dashboard voor connection limits

**Error**: "SSL required"
- Zorg dat `?sslmode=require` in connection string staat

### Environment Variables

**Error**: "JWT_SECRET is not defined"
- Vercel Dashboard > Settings > Environment Variables
- Check of variabele bestaat voor "Production"
- Redeploy na toevoegen variabelen

### Email Sending Fails

**Error**: "SendGrid 403 Forbidden"
- Verify dat API key Full Access heeft
- Check of sender is verified in SendGrid
- Verify domain authentication

### Payment Webhook

**Error**: "Webhook not received"
- Check webhook URL in MultiSafePay (geen trailing slash!)
- Verify webhook secret is correct
- Check Vercel Function Logs voor errors

---

## 📊 Monitoring & Logs

### Vercel Logs

```bash
# Real-time logs via CLI
vercel logs [deployment-url] --follow

# Via Dashboard
Project > Deployments > [Latest] > Runtime Logs
```

### Sentry Dashboard

[https://sentry.io/organizations/YOUR_ORG/issues/](https://sentry.io/organizations/YOUR_ORG/issues/)

Monitor:
- Error rate
- Performance issues
- User feedback

### Database Monitoring

Neon Console > Monitoring:
- Connection count
- Query performance
- Storage usage
- Compute usage

---

## 🔄 Continuous Deployment

Vercel automatically deploys:
- **Production**: Pushes naar `main` of `master` branch
- **Preview**: Pull requests en andere branches

**Deployment Settings**:
- Project Settings > Git
- Configure production branch
- Enable/disable auto-deployment

---

## 💰 Cost Optimization

### Vercel
- **Free Tier**: 100GB bandwidth/maand
- **Pro**: €20/maand voor meer resources
- Monitor usage in Dashboard

### Neon
- **Free Tier**: 0.5 GB storage, 10 branches
- **Pro**: €19/maand voor meer compute
- Enable autoscaling voor cost efficiency

### OpenRouter
- Pay-per-use (tokens)
- Monitor spending in dashboard
- Set spending limits

### SendGrid
- **Free Tier**: 100 emails/dag
- **Essentials**: $19.95/maand voor 50k emails

---

## 🎉 Succes!

Je DatingAssistent applicatie draait nu op Vercel!

**Volgende stappen**:
1. ✅ Test alle functionaliteit grondig
2. 📊 Setup monitoring alerts (Sentry, Vercel)
3. 📈 Configureer analytics tracking
4. 🔒 Review security settings
5. 💾 Setup database backups (Neon dashboard)
6. 📝 Documenteer je deployment proces
7. 🎯 Start met gebruikers feedback verzamelen!

**Hulp nodig?**
- Vercel Docs: https://vercel.com/docs
- Neon Docs: https://neon.tech/docs
- DatingAssistent Support: support@datingassistent.nl

---

**Deployment Date**: [Vul in na deployment]
**Version**: v1.3
**Deployment URL**: [Vul in]
**Custom Domain**: [Vul in]
