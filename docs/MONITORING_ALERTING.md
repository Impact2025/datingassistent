# Monitoring & Alerting Setup

## Overview

This document describes the monitoring and alerting configuration for the DatingAssistent application.

## Sentry Configuration

### Environment Variables

Add these to your Vercel project:

```env
# Required
SENTRY_DSN=<your-sentry-dsn>
NEXT_PUBLIC_SENTRY_DSN=<your-sentry-dsn>

# Optional (for uploading source maps)
SENTRY_AUTH_TOKEN=<your-auth-token>
SENTRY_ORG=<your-org-slug>
SENTRY_PROJECT=<your-project-name>

# Security (recommended)
CSRF_SECRET=<random-64-char-string>
```

### Getting Your Sentry DSN

1. Go to [sentry.io](https://sentry.io/)
2. Create a new project or select existing
3. Choose "Next.js" as the platform
4. Copy the DSN from the setup page
5. Add to Vercel environment variables

## Alerting Rules

### Critical Alerts (PagerDuty / SMS)

1. **Production Errors > 10/minute**
   - Indicates system-wide issue
   - Immediate investigation required

2. **Database Connection Failures**
   - Service degradation
   - Check database status

3. **Security Events**
   - Multiple CSRF failures
   - Rate limit exceeded (admin)
   - Brute force attempts

### High Priority Alerts (Email / Slack)

1. **API Response Time > 5s** (p95)
   - Performance degradation
   - Investigate slow queries

2. **Error Rate > 5%**
   - Quality issue
   - Review recent deployments

3. **Memory Usage > 80%**
   - Potential memory leak
   - Monitor and scale if needed

### Medium Priority Alerts (Daily Digest)

1. **Performance Degradation**
   - LCP > 2.5s
   - FID > 100ms
   - CLS > 0.1

2. **High Error Count** (non-critical)
   - User errors (validation, etc.)
   - Review UX improvements

## Alert Channels

### Sentry Alerts

Configure in Sentry Dashboard:
- Settings → Alerts → Alert Rules

**Recommended Rules:**

1. **High Error Rate**
   ```
   IF number of events > 10
   IN 1 minute
   THEN send notification to #alerts
   ```

2. **New Issue**
   ```
   IF a new issue is created
   THEN send notification to #errors
   ```

3. **Regression**
   ```
   IF an issue is resolved and happens again
   THEN send notification to #regressions
   ```

4. **Performance Degradation**
   ```
   IF average response time > 2000ms
   IN 10 minutes
   THEN send notification to #performance
   ```

### Vercel Alerts

Configure in Vercel Dashboard:
- Project Settings → Integrations → Monitoring

1. **Deployment Failures**
2. **Build Errors**
3. **Function Errors**

## Dashboard Setup

### Sentry Dashboards

Create custom dashboards:

1. **Production Health**
   - Error rate (last 24h)
   - Active users
   - Response times (p50, p95, p99)
   - Crash-free sessions

2. **Performance**
   - Web Vitals (LCP, FID, CLS)
   - API response times
   - Database query times
   - Transaction throughput

3. **Security**
   - CSRF failures
   - Auth errors
   - Rate limit hits
   - Suspicious activity

### Vercel Analytics

Enable in Vercel:
- Project Settings → Analytics

Tracks:
- Page views
- Real User Monitoring
- Web Vitals
- Deployment performance

## On-Call Procedures

### When Alert Fires

1. **Acknowledge** the alert immediately
2. **Check** Sentry dashboard for context
3. **Investigate** error details and stack traces
4. **Assess** impact (# of users affected)
5. **Mitigate** if possible (rollback, hotfix)
6. **Document** in incident log
7. **Resolve** and conduct post-mortem

### Escalation Path

1. **L1**: On-call developer (15min response)
2. **L2**: Team lead (30min response)
3. **L3**: Technical director (1h response)

## Monitoring Best Practices

### Error Tracking

1. **Always include context**
   - User ID
   - Request details
   - Environment info

2. **Sanitize sensitive data**
   - Passwords
   - Tokens
   - PII

3. **Use proper error levels**
   - `fatal`: Service down
   - `error`: Feature broken
   - `warning`: Degraded
   - `info`: Notable events

### Performance Monitoring

1. **Track key metrics**
   - Page load times
   - API response times
   - Database query times

2. **Set realistic thresholds**
   - Based on user experience
   - p95, not p50

3. **Monitor trends**
   - Week-over-week
   - After deployments

## Testing Monitoring

### Verify Sentry

```javascript
// In browser console
throw new Error("Test error for Sentry");

// Or use test button
import { captureException } from '@sentry/nextjs';
captureException(new Error("Test error"));
```

### Verify Alerts

1. Trigger test alert in Sentry
2. Verify notification received
3. Check alert appears in dashboard

## Maintenance

### Weekly

- Review error trends
- Check alert fatigue (too many false positives?)
- Update thresholds if needed

### Monthly

- Review dashboard relevance
- Update alerting rules
- Clean up resolved issues
- Check source map uploads

### Quarterly

- Review on-call procedures
- Update runbooks
- Training for new team members
- Evaluate monitoring costs

## Cost Optimization

### Sentry

- Use sampling (10% in prod recommended)
- Filter out noisy errors
- Clean up old issues
- Review plan limits

### Current Configuration

```typescript
// Production sampling rates
tracesSampleRate: 0.1, // 10% of transactions
replaysSessionSampleRate: 0.05, // 5% of sessions
replaysOnErrorSampleRate: 1.0, // 100% when errors occur
```

## Support

- **Sentry Docs**: https://docs.sentry.io/
- **Vercel Docs**: https://vercel.com/docs/observability
- **Internal**: #dev-ops Slack channel
