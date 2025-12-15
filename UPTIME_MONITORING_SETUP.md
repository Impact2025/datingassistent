# ⏱️ Uptime Monitoring Setup Guide

## UptimeRobot Configuration (Recommended - Free)

### 1. Create Account
- Visit: https://uptimerobot.com
- Sign up (free tier: 50 monitors)

### 2. Add HTTP(s) Monitor

**Monitor #1: Main Website**
```
Monitor Type: HTTP(s)
Friendly Name: DatingAssistent - Homepage
URL: https://datingassistent.vercel.app
Monitoring Interval: 5 minutes
Monitor Timeout: 30 seconds
```

**Monitor #2: Health Endpoint**
```
Monitor Type: HTTP(s)
Friendly Name: DatingAssistent - Health API
URL: https://datingassistent.vercel.app/api/health
Monitoring Interval: 5 minutes
Keyword to check: "healthy"
Alert when: Keyword not found
```

**Monitor #3: Database Check**
```
Monitor Type: Keyword
Friendly Name: DatingAssistent - Database
URL: https://datingassistent.vercel.app/api/health
Keyword: "database":"ok"
Monitoring Interval: 5 minutes
```

### 3. Alert Contacts

**Email Alert:**
```
Type: Email
Email: your-email@domain.com
Receive: Down, Up, SSL expiry
```

**Webhook Alert (Optional):**
```
Type: Webhook
URL: https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
Or: Discord, Telegram, PagerDuty
```

### 4. Status Page (Public)

Create free status page:
```
URL: https://stats.uptimerobot.com/your-custom-url
Shows: Current status + 30-day uptime %
```

## Alternative: Vercel Monitoring (Built-in)

Vercel automatically monitors:
- Deployment status
- Function errors
- Performance metrics

Access: https://vercel.com/your-team/datingassistent/monitoring

## Healthchecks.io (Alternative)

Simple ping monitoring:
```
1. Visit: https://healthchecks.io
2. Add check: DatingAssistent
3. Ping URL: https://hc-ping.com/YOUR-UUID
4. Schedule: */5 * * * * (every 5 min)
```

Add to cron (or use Vercel Cron):
```typescript
// src/app/api/cron/health-ping/route.ts
export async function GET() {
  const healthCheck = await fetch('https://datingassistent.vercel.app/api/health');
  
  if (healthCheck.ok) {
    await fetch('https://hc-ping.com/YOUR-UUID');
  }
  
  return NextResponse.json({ pinged: true });
}
```

## Sentry Uptime Monitoring

If using Sentry, enable uptime monitoring:
```
1. Sentry Dashboard
2. Alerts → Add Check
3. Type: Uptime
4. URL: https://datingassistent.vercel.app/api/health
5. Interval: 5 minutes
```

## Recommended Setup

**For World-Class Monitoring:**
1. ✅ UptimeRobot (free) - Basic uptime
2. ✅ Vercel Monitoring (included) - Deployment health
3. ✅ Sentry (paid) - Error tracking + uptime
4. ✅ Custom health checks via /api/health

**Alerts to configure:**
- Email when down > 5 minutes
- Slack when critical error
- SMS for database failures (optional)

## Testing Your Monitoring

```bash
# Test health endpoint
curl https://datingassistent.vercel.app/api/health

# Simulate downtime (return 500)
# This will trigger your alerts
curl https://datingassistent.vercel.app/api/test-error
```

## Metrics to Track

**Uptime:**
- Target: 99.9% (43 min downtime/month)
- Current: Check after 30 days

**Response Time:**
- Target: < 500ms p95
- Health endpoint: < 200ms

**Error Rate:**
- Target: < 0.1%
- Track via Sentry

## Status Page Example

Share with users:
```
https://stats.uptimerobot.com/datingassistent

Shows:
- Current Status: ✅ Operational
- 24h uptime: 100%
- 7d uptime: 99.8%
- 30d uptime: 99.9%
```
