# ⏰ Cron Jobs Setup Guide

## ✅ AUTOMATED EMAIL CAMPAIGNS

---

## 📋 OVERZICHT CRON JOBS

### **1. Email Queue Processor** ⚡
- **Path:** `/api/cron/email-queue`
- **Schedule:** Elk uur (0 * * * *)
- **Doel:** Process pending emails from queue
- **Max:** 100 emails per run

### **2. Email Automation** 🤖
- **Path:** `/api/cron/email-automation`
- **Schedule:** Dagelijks 22:00 (0 22 * * *)
- **Doel:** Check triggers voor automated emails
- **Triggers:**
  - Inactivity alerts (3, 7, 14 dagen)
  - Subscription renewal reminders
  - Churn risk detection

### **3. Weekly Campaigns** 📊
- **Path:** `/api/cron/weekly-campaigns`
- **Schedule:** Elke maandag 08:00 (0 8 * * 1)
- **Doel:** Schedule weekly digest emails
- **Voor:** Alle actieve gebruikers

---

## 🚀 VERCEL DEPLOYMENT

### **Method 1: vercel.json (Aanbevolen)**

Ik heb al een `vercel.json` gemaakt:

```json
{
  "crons": [
    {
      "path": "/api/cron/email-queue",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/cron/email-automation",
      "schedule": "0 22 * * *"
    },
    {
      "path": "/api/cron/weekly-campaigns",
      "schedule": "0 8 * * 1"
    }
  ]
}
```

**Deployment:**
```bash
# Commit vercel.json
git add vercel.json
git commit -m "Add Vercel cron jobs for email automation"
git push

# Deploy to Vercel
vercel --prod
```

### **Method 2: Vercel Dashboard**

Als vercel.json niet werkt:

1. Ga naar Vercel Dashboard
2. Select jouw project
3. Settings → Cron Jobs
4. Add nieuwe cron jobs:

**Job 1: Email Queue**
```
Path: /api/cron/email-queue
Schedule: 0 * * * *
```

**Job 2: Email Automation**
```
Path: /api/cron/email-automation
Schedule: 0 22 * * *
```

**Job 3: Weekly Campaigns**
```
Path: /api/cron/weekly-campaigns
Schedule: 0 8 * * 1
```

---

## 🔐 CRON SECURITY

### **Environment Variable:**
Zorg dat `CRON_SECRET` ingesteld is:

```env
# In Vercel Environment Variables
CRON_SECRET=your_super_secret_random_string_here
```

### **Generate Random Secret:**
```bash
# Option 1: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: OpenSSL
openssl rand -hex 32

# Option 3: Online
# https://randomkeygen.com/
```

### **Verificatie in Code:**
Alle cron endpoints checken de secret:

```typescript
// Example from /api/cron/email-queue/route.ts
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'dev_secret';

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Process emails...
}
```

---

## 🧪 TESTING CRON JOBS

### **Test Lokaal:**

```bash
# Test email queue processor
curl http://localhost:9001/api/cron/email-queue \
  -H "Authorization: Bearer dev_secret"

# Test email automation
curl http://localhost:9001/api/cron/email-automation \
  -H "Authorization: Bearer dev_secret"

# Test weekly campaigns
curl http://localhost:9001/api/cron/weekly-campaigns \
  -H "Authorization: Bearer dev_secret"
```

### **Test Production:**

```bash
# Get your CRON_SECRET from Vercel env vars
CRON_SECRET="your_production_secret"

# Test email queue
curl https://datingassistent.nl/api/cron/email-queue \
  -H "Authorization: Bearer $CRON_SECRET"

# Check response
# Should see: {"success": true, "processed": X}
```

---

## 📊 MONITORING

### **Vercel Cron Logs:**

1. Vercel Dashboard → Your Project
2. Logs tab
3. Filter by path: `/api/cron/`
4. Check for errors or failures

### **Database Monitoring:**

```sql
-- Check recent queue processing
SELECT
  status,
  COUNT(*) as count,
  MAX(processed_at) as last_processed
FROM email_queue
GROUP BY status;

-- Check emails sent today
SELECT
  email_type,
  COUNT(*) as sent_today
FROM email_tracking
WHERE sent_at::date = CURRENT_DATE
GROUP BY email_type;

-- Check failed emails
SELECT *
FROM email_queue
WHERE status = 'failed'
  AND processed_at > NOW() - INTERVAL '24 hours'
ORDER BY processed_at DESC
LIMIT 20;
```

### **Create Monitoring Script:**

```typescript
// scripts/monitor-email-queue.ts
import { sql } from '@vercel/postgres';

async function monitorQueue() {
  // Check pending emails
  const pending = await sql`
    SELECT COUNT(*) as count
    FROM email_queue
    WHERE status = 'pending'
  `;

  console.log(`Pending emails: ${pending.rows[0].count}`);

  // Check failed emails
  const failed = await sql`
    SELECT COUNT(*) as count
    FROM email_queue
    WHERE status = 'failed'
      AND processed_at > NOW() - INTERVAL '24 hours'
  `;

  console.log(`Failed last 24h: ${failed.rows[0].count}`);

  // Alert if too many failures
  if (failed.rows[0].count > 10) {
    console.error('⚠️ HIGH FAILURE RATE!');
    // Send alert email
  }
}

monitorQueue();
```

---

## 🔄 ALTERNATIVE: EXTERNAL CRON SERVICE

Als Vercel cron niet werkt, gebruik external service:

### **Option 1: Cron-job.org**

1. Ga naar https://cron-job.org
2. Maak account
3. Create nieuwe cronjobs:

**Email Queue (elk uur):**
```
URL: https://datingassistent.nl/api/cron/email-queue
Schedule: Every 1 hour
Headers:
  Authorization: Bearer YOUR_CRON_SECRET
```

**Email Automation (dagelijks 22:00):**
```
URL: https://datingassistent.nl/api/cron/email-automation
Schedule: Daily at 22:00
Headers:
  Authorization: Bearer YOUR_CRON_SECRET
```

**Weekly Campaigns (maandag 08:00):**
```
URL: https://datingassistent.nl/api/cron/weekly-campaigns
Schedule: Every Monday at 08:00
Headers:
  Authorization: Bearer YOUR_CRON_SECRET
```

### **Option 2: EasyCron**

https://www.easycron.com/

### **Option 3: GitHub Actions**

```yaml
# .github/workflows/email-queue.yml
name: Process Email Queue

on:
  schedule:
    - cron: '0 * * * *'  # Elk uur

jobs:
  process-queue:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Email Queue
        run: |
          curl -X GET \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://datingassistent.nl/api/cron/email-queue
```

---

## ⚙️ CRON SCHEDULE REFERENCE

```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of week (0-7, 0 & 7 = Sunday)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

**Examples:**
```
0 * * * *       # Elk uur (at :00)
0 8 * * *       # Dagelijks om 08:00
0 8 * * 1       # Elke maandag om 08:00
0 9,17 * * *    # Dagelijks om 09:00 en 17:00
*/15 * * * *    # Elke 15 minuten
0 0 1 * *       # Eerste dag van elke maand om 00:00
```

---

## 🚨 TROUBLESHOOTING

### **Probleem: Cron job niet uitgevoerd**

**Check:**
1. Vercel Logs voor errors
2. CRON_SECRET correct ingesteld
3. Routes zijn deployed
4. Database connectie werkt

```bash
# Test manual
curl https://datingassistent.nl/api/cron/email-queue \
  -H "Authorization: Bearer YOUR_SECRET" \
  -v
```

### **Probleem: Rate limiting**

Als je te veel emails verstuurt:

```typescript
// Adjust in email-sender.ts
const BATCH_SIZE = 50; // Reduce from 100
const DELAY_MS = 1000; // Add delay between batches
```

### **Probleem: Timezone issues**

Vercel cron jobs run in UTC:

```typescript
// Convert to local time
const LOCAL_HOUR = 8; // 08:00 local
const UTC_HOUR = LOCAL_HOUR - (new Date().getTimezoneOffset() / 60);

// Schedule: `0 ${UTC_HOUR} * * 1`
```

---

## ✅ DEPLOYMENT CHECKLIST

Voordat je live gaat:

- [ ] vercel.json created en committed
- [ ] CRON_SECRET environment variable ingesteld
- [ ] Alle 3 cron endpoints getest lokaal
- [ ] Deployed to Vercel
- [ ] Cron jobs geactiveerd in Vercel Dashboard
- [ ] Test met production endpoints
- [ ] Monitoring ingesteld
- [ ] SendGrid rate limits gecheckt
- [ ] Database indexes geoptimaliseerd
- [ ] Logs monitoring actief

---

## 📈 EXPECTED RESULTS

Na deployment:

**Week 1:**
- Email queue processed hourly
- Welcome emails send automatically
- Daily automation checks run

**Week 2:**
- Weekly digests send on Mondays
- Inactivity alerts trigger
- Subscription renewals scheduled

**Month 1:**
- Monthly progress reports
- Churn prevention emails
- Upsell campaigns

---

## 🎯 NEXT STEPS

1. **Deploy vercel.json:**
   ```bash
   git add vercel.json
   git commit -m "Add cron jobs for email automation"
   git push
   vercel --prod
   ```

2. **Set CRON_SECRET in Vercel**

3. **Test cron endpoints**

4. **Monitor logs daily for first week**

5. **Adjust schedules based on performance**

---

**Status:** ✅ Cron jobs configured!
**File:** `vercel.json` created
**Next:** Deploy and monitor
