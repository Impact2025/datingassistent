# 📧 SendGrid Setup Guide

## ✅ SENDGRID CONFIGURATIE

---

## STAP 1: API KEY TOEVOEGEN

### **In .env.local:**
```env
# SendGrid Configuration
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@datingassistent.nl
SENDGRID_FROM_NAME=DatingAssistent

# Base URL
NEXT_PUBLIC_BASE_URL=https://datingassistent.nl

# Cron Security
CRON_SECRET=your_super_secret_random_string_here

# Test Email (voor development)
TEST_EMAIL_SECRET=test_secret_123
```

### **In .env.production (Vercel):**
Voeg dezelfde variabelen toe in Vercel Dashboard:
```
Settings → Environment Variables → Add:
- SENDGRID_API_KEY
- SENDGRID_FROM_EMAIL
- SENDGRID_FROM_NAME
- NEXT_PUBLIC_BASE_URL
- CRON_SECRET
```

---

## STAP 2: SENDGRID SENDER VERIFICATION

### **Domain Verificatie (Aanbevolen):**
1. Ga naar SendGrid Dashboard → Settings → Sender Authentication
2. Klik "Authenticate Your Domain"
3. Voeg DNS records toe:
   ```
   Type: TXT
   Host: em1234.datingassistent.nl
   Value: [SendGrid geeft dit]

   Type: CNAME
   Host: s1._domainkey.datingassistent.nl
   Value: [SendGrid geeft dit]

   Type: CNAME
   Host: s2._domainkey.datingassistent.nl
   Value: [SendGrid geeft dit]
   ```
4. Verifieer in SendGrid (kan 24-48 uur duren)

### **Single Sender Verification (Quick):**
Als je domein verificatie niet direct lukt:
1. Ga naar Settings → Sender Authentication → Single Sender Verification
2. Voeg `noreply@datingassistent.nl` toe
3. Verifieer via email die SendGrid stuurt

---

## STAP 3: EMAIL SERVICE IMPLEMENTATIE

De email service is al gebouwd in `src/lib/email-service.ts`, maar laat me checken of SendGrid correct geïntegreerd is:

```typescript
// src/lib/email-service.ts
import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function sendBasicEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<boolean> {
  try {
    await sgMail.send({
      to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'noreply@datingassistent.nl',
        name: process.env.SENDGRID_FROM_NAME || 'DatingAssistent',
      },
      subject,
      html,
      text: text || stripHtml(html),
    });

    return true;
  } catch (error) {
    console.error('SendGrid error:', error);
    return false;
  }
}
```

---

## STAP 4: TRACKING PIXELS & LINKS

### **Open Tracking:**
SendGrid heeft ingebouwde open tracking. Enable in:
```
Settings → Tracking → Open Tracking → ON
```

### **Click Tracking:**
Enable click tracking:
```
Settings → Tracking → Click Tracking → ON
```

### **Custom Tracking (Onze implementatie):**
We hebben eigen tracking in `src/lib/email-sender.ts`:

```typescript
// Tracking pixel URL
const trackingPixelUrl = `${BASE_URL}/api/email/track/open/${trackingId}`;

// Tracking links
const trackedUrl = `${BASE_URL}/api/email/track/click/${trackingId}?url=${encodeURIComponent(originalUrl)}`;
```

---

## STAP 5: TEMPLATES TESTEN

### **Test 1: Welcome Email**
```bash
curl -X POST http://localhost:9001/api/test-email \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 3,
    "emailType": "welcome",
    "testEmail": "jouw.email@gmail.com"
  }'
```

### **Test 2: Alle Templates**
```bash
# Profile Optimization
curl -X POST http://localhost:9001/api/test-email \
  -H "Content-Type: application/json" \
  -d '{
    "emailType": "profile_optimization_reminder",
    "testEmail": "jouw.email@gmail.com"
  }'

# Weekly Digest
curl -X POST http://localhost:9001/api/test-email \
  -H "Content-Type: application/json" \
  -d '{
    "emailType": "weekly_digest",
    "testEmail": "jouw.email@gmail.com"
  }'
```

---

## STAP 6: SENDGRID BEST PRACTICES

### **1. Warm-up Je IP (belangrijk!):**
Eerste 2 weken:
- Week 1: Max 50 emails/dag
- Week 2: Max 200 emails/dag
- Week 3: Max 500 emails/dag
- Week 4+: Unlimited

### **2. Monitor Bounce Rate:**
Houd onder 5%:
```
SendGrid → Activity → Bounces
```

### **3. Monitor Spam Rate:**
Houd onder 0.1%:
```
SendGrid → Activity → Spam Reports
```

### **4. Unsubscribe Link:**
Verplicht in alle marketing emails:
```html
<a href="{{unsubscribe_url}}">Unsubscribe</a>
```

Onze implementatie:
```typescript
<Link href={`${dashboardUrl}/settings/email-preferences`}>
  Email Voorkeuren
</Link>
```

### **5. Email Categories (voor analytics):**
```typescript
await sgMail.send({
  to,
  from,
  subject,
  html,
  categories: ['onboarding', 'welcome'], // Voor filtering in SendGrid
  customArgs: {
    userId: userId.toString(),
    emailType: 'welcome',
  },
});
```

---

## STAP 7: TROUBLESHOOTING

### **Probleem: Email komt niet aan**
1. Check SendGrid Activity Feed:
   ```
   SendGrid → Activity
   ```
2. Check sender verification
3. Check spam folder
4. Check bounce/block list

### **Probleem: API Error 401**
```
Error: Unauthorized
```
Fix: Check of SENDGRID_API_KEY correct is in .env.local

### **Probleem: API Error 403**
```
Error: Forbidden
```
Fix: Check sender verification

### **Probleem: Rate Limited**
```
Error: Too many requests
```
Fix: Implementeer rate limiting:
```typescript
// Max 100 emails per hour
const RATE_LIMIT = 100;
const TIME_WINDOW = 3600000; // 1 hour
```

---

## STAP 8: MONITORING

### **SendGrid Dashboard Metrics:**
Monitor daily:
- Delivery rate (should be >98%)
- Open rate (target 25-35%)
- Click rate (target 2-5%)
- Bounce rate (should be <5%)
- Spam rate (should be <0.1%)

### **Database Metrics:**
```sql
-- Open rate per email type
SELECT
  email_type,
  COUNT(*) as sent,
  SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) as opened,
  ROUND(100.0 * SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as open_rate
FROM email_tracking
WHERE sent_at > NOW() - INTERVAL '30 days'
GROUP BY email_type
ORDER BY sent DESC;

-- Click rate per email type
SELECT
  email_type,
  COUNT(*) as sent,
  SUM(CASE WHEN clicked_at IS NOT NULL THEN 1 ELSE 0 END) as clicked,
  ROUND(100.0 * SUM(CASE WHEN clicked_at IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as click_rate
FROM email_tracking
WHERE sent_at > NOW() - INTERVAL '30 days'
GROUP BY email_type
ORDER BY clicked DESC;
```

---

## STAP 9: GDPR COMPLIANCE

### **Required Elements:**
✅ Unsubscribe link in alle emails
✅ Company address in footer
✅ Clear sender identification
✅ Privacy policy link
✅ Data retention policy

### **Onze Implementatie:**
Alle templates hebben al:
```typescript
<Link href={`${dashboardUrl}/settings/email-preferences`}>
  Email Voorkeuren
</Link>
```

### **Unsubscribe Tracking:**
```sql
-- Track unsubscribes
UPDATE email_preferences
SET
  unsubscribed_all = true,
  unsubscribed_at = NOW()
WHERE user_id = $1;
```

---

## CHECKLIST ✅

Voor go-live, check:

- [ ] SendGrid API key toegevoegd aan .env.local
- [ ] Sender email geverifieerd (Single Sender of Domain)
- [ ] Test email verzonden en ontvangen
- [ ] Open tracking enabled in SendGrid
- [ ] Click tracking enabled in SendGrid
- [ ] Bounce/spam monitoring ingesteld
- [ ] Rate limiting geconfigureerd
- [ ] GDPR compliance gecontroleerd
- [ ] Privacy policy link in emails
- [ ] Unsubscribe flow werkt
- [ ] Production env vars in Vercel

---

## 🚀 QUICK START

```bash
# 1. Voeg API key toe aan .env.local
echo "SENDGRID_API_KEY=your_key_here" >> .env.local
echo "SENDGRID_FROM_EMAIL=noreply@datingassistent.nl" >> .env.local

# 2. Restart dev server
# Stop (Ctrl+C) en start opnieuw

# 3. Test welcome email
curl -X POST http://localhost:9001/api/test-email \
  -H "Content-Type: application/json" \
  -d '{
    "emailType": "welcome",
    "testEmail": "your.email@gmail.com"
  }'

# 4. Check je inbox!
```

---

**Status:** ✅ Ready for SendGrid!
**Next:** Test alle 15 templates
