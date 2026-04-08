# 🚀 PRODUCTION READINESS CHECKLIST - DatingAssistent.nl

## Status: ⚠️ NIET KLAAR VOOR 10 TESTERS

---

## ❌ CRITICAL BLOCKERS (MOET GEFIXED)

### 1. Environment Variables - .env.local
**Status:** ❌ LOCALHOST CONFIGURATIE

**Huidige situatie:**
```env
NEXT_PUBLIC_BASE_URL=http://localhost:9000
```

**Wat moet gebeuren:**
```env
# PRODUCTIE WAARDES:
NEXT_PUBLIC_BASE_URL=https://datingassistent.nl

# BELANGRIJK: Vercel Environment Variables instellen:
# 1. Ga naar Vercel Dashboard > datingassistent > Settings > Environment Variables
# 2. Voeg toe voor PRODUCTION environment:
#    - NEXT_PUBLIC_BASE_URL=https://datingassistent.nl
#    - STRIPE_SECRET_KEY=sk_live_...
#    - STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. Stripe Payment Integration
**Status:** ❌ CONTROLEER LIVE KEYS

**Actie vereist:**
- [ ] Stripe live keys instellen in Vercel environment variables
- [ ] Stripe webhook endpoint configureren in Stripe Dashboard
- [ ] Test payment flow op staging eerst
- [ ] Check of Stripe account actief is voor productie

### 3. Domain Configuration
**Status:** ⚠️ TE CONTROLEREN

**Checklist:**
- [ ] DNS instellingen correct voor datingassistent.nl
- [ ] Vercel domein gekoppeld
- [ ] SSL certificaat actief
- [ ] Redirects van www → datingassistent.nl

---

## ⚠️ HIGH PRIORITY (Zeer belangrijk)

### 4. SendGrid Email Templates
**Status:** ⚠️ INCOMPLETE

**Huidige .env.local:**
```env
SENDGRID_WELCOME_TEMPLATE_ID=d-83f3e735c84245e7af3c5360021e07c5
SENDGRID_PASSWORD_RESET_TEMPLATE_ID=d-password-reset-template-id  ❌ PLACEHOLDER
SENDGRID_PAYMENT_CONFIRMATION_TEMPLATE_ID=d-payment-confirmation-template-id  ❌ PLACEHOLDER
```

**Actie:**
- [ ] Maak ontbrekende SendGrid templates
- [ ] Update template IDs in Vercel environment variables
- [ ] Test alle email flows

### 5. Database Backups
**Status:** ⚠️ TE CONTROLEREN

**Checklist:**
- [ ] Neon database backup policy gecheckt
- [ ] Automated backups enabled
- [ ] Backup restore procedure getest

### 6. Error Monitoring
**Status:** ⚠️ SENTRY DISABLED

**next.config.ts lijn 201-212:**
```typescript
// Temporarily disable Sentry wrapping to fix "self is not defined" error
// TODO: Re-enable after successful deployment
```

**Actie:**
- [ ] Sentry configuratie fixen
- [ ] Error tracking enablen voor productie
- [ ] Alternative: Vercel Analytics gebruiken

---

## ✅ GOOD TO GO (Wel klaar)

### 7. Security Headers ✅
- ✅ Content Security Policy
- ✅ HSTS enabled
- ✅ X-Frame-Options: DENY
- ✅ XSS Protection

### 8. Database Connection ✅
- ✅ Neon PostgreSQL geconfigureerd
- ✅ Connection pooling enabled
- ✅ SSL required

### 9. API Keys Configured ✅
- ✅ OpenRouter API (AI features)
- ✅ SendGrid API key
- ✅ reCAPTCHA keys
- ✅ MultiSafePay API key (test mode)

### 10. Performance ✅
- ✅ Image optimization enabled
- ✅ Video streaming headers
- ✅ Cache headers configured
- ✅ Console.log removal in production

---

## 🧪 TESTING CHECKLIST VOOR 10 TESTERS

### Pre-Launch Tests (MOET EERST):
- [ ] **User Registration Flow**
  - Email verificatie werkt
  - Welcome email wordt verzonden
  - Account wordt aangemaakt in database

- [ ] **Login Flow**
  - Gebruikers kunnen inloggen
  - JWT tokens werken correct
  - Session persistentie

- [ ] **Payment Flow (KRITISCH!)**
  - Kickstart €47 betaling werkt
  - Webhook van MultiSafePay komt aan
  - Enrollment wordt correct aangemaakt
  - Confirmation email wordt verzonden
  
- [ ] **Core Features**
  - Dashboard laadt correct
  - Kickstart dag 1 toegankelijk na betaling
  - Video playback werkt
  - Quiz functionaliteit
  - Reflectie opslaan

- [ ] **Mobile Experience**
  - Responsive design werkt
  - Bottom navigation
  - Touch interactions

---

## 📋 DEPLOYMENT STEPS

### Stap 1: Environment Variables in Vercel
```bash
# In Vercel Dashboard:
NEXT_PUBLIC_BASE_URL=https://datingassistent.nl
DATABASE_URL=[from .env.local]
JWT_SECRET=[generate new voor productie!]
SENDGRID_API_KEY=[from .env.local]
OPENROUTER_API_KEY=[from .env.local]
STRIPE_SECRET_KEY=sk_live_[jouw live key]
STRIPE_WEBHOOK_SECRET=whsec_[jouw webhook secret]
```

### Stap 2: Domain Setup
1. Vercel: Add domain "datingassistent.nl"
2. DNS: Point A record naar Vercel
3. Wait voor SSL provisioning (5-10 min)
4. Test: https://datingassistent.nl

### Stap 3: Database Check
```bash
# Test database connection op productie:
npm run test-db
```

### Stap 4: Deploy
```bash
git push origin master
# Vercel auto-deploy triggered
```

### Stap 5: Smoke Tests
- [ ] Homepage laadt
- [ ] Registratie werkt
- [ ] Login werkt  
- [ ] Payment werkt (met test betaling)
- [ ] Dashboard toegankelijk

---

## ⚠️ AANBEVOLEN: Staging Environment

**Voor je live gaat met 10 testers:**

1. **Maak staging environment**
   - Aparte Vercel deployment
   - staging.datingassistent.nl
   - Separate database (of database branch)
   - Test mode payments

2. **Test volledig op staging**
   - Alle flows doorlopen
   - Payment flows
   - Email delivery
   - Mobile experience

3. **Pas dan naar productie**

---

## 🎯 MINIMUM VIABLE LAUNCH

**Voor 10 testers kan je live met:**

### MOET werken:
✅ Registratie + email verificatie
✅ Login
✅ Payment (Kickstart €47)
✅ Kickstart Day 1-3 toegankelijk
✅ Dashboard basis
✅ Mobile responsive

### MAG nog broken zijn:
⚠️ Advanced features
⚠️ Alle 21 dagen content
⚠️ Email templates (basic versies ok)
⚠️ Sentry monitoring

---

## 🚨 FINAL CHECKLIST VOOR GO-LIVE

- [ ] NEXT_PUBLIC_BASE_URL = https://datingassistent.nl
- [ ] MultiSafePay PRODUCTIE mode
- [ ] Nieuwe JWT_SECRET voor productie
- [ ] DNS correct geconfigureerd
- [ ] SSL certificate actief
- [ ] SendGrid welcome email werkt
- [ ] Payment flow getest (1x test transactie)
- [ ] Database backups enabled
- [ ] Error logging werkt (Vercel Analytics minimum)

---

## ⏱️ GESCHATTE TIJD

**Om production-ready te zijn: 2-4 uur werk**

1. Environment variables updaten (30 min)
2. Vercel configuratie (30 min)  
3. Domain setup (30 min + DNS propagation)
4. Testing alle flows (1-2 uur)

**Totaal met buffer: 4-6 uur**

---

## 💡 AANBEVELING

**JA, technisch kan je live**  
**MAAR: Doe eerst deze stappen:**

1. ✅ Update environment variables (KRITISCH)
2. ✅ Test payment flow op staging
3. ✅ Test 1 complete user journey end-to-end
4. ✅ Bereid rollback plan voor

**Dan kan je veilig naar 10 testers!**
