# 📊 Email Monitoring & Optimization Guide

## ✅ EMAIL PERFORMANCE MONITORING

---

## 📈 KEY METRICS DASHBOARD

### **Core Email Metrics:**

```sql
-- Overall Email Performance (Last 30 Days)
SELECT
  COUNT(*) as total_sent,
  COUNT(DISTINCT user_id) as unique_users,
  SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) as total_opens,
  SUM(CASE WHEN clicked_at IS NOT NULL THEN 1 ELSE 0 END) as total_clicks,
  ROUND(100.0 * SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as open_rate,
  ROUND(100.0 * SUM(CASE WHEN clicked_at IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as click_rate,
  ROUND(100.0 * SUM(CASE WHEN clicked_at IS NOT NULL THEN 1 ELSE 0 END) / NULLIF(SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END), 0), 2) as click_to_open_rate
FROM email_tracking
WHERE sent_at > NOW() - INTERVAL '30 days';
```

### **Performance by Email Type:**

```sql
-- Email Type Performance Breakdown
SELECT
  email_type,
  COUNT(*) as sent,
  SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) as opens,
  SUM(CASE WHEN clicked_at IS NOT NULL THEN 1 ELSE 0 END) as clicks,
  ROUND(100.0 * SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as open_rate,
  ROUND(100.0 * SUM(CASE WHEN clicked_at IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as click_rate,
  AVG(EXTRACT(EPOCH FROM (opened_at - sent_at)) / 3600) as avg_hours_to_open
FROM email_tracking
WHERE sent_at > NOW() - INTERVAL '30 days'
GROUP BY email_type
ORDER BY sent DESC;
```

### **Engagement Funnel:**

```sql
-- Email Engagement Funnel
SELECT
  'Sent' as stage,
  COUNT(*) as count,
  100.0 as percentage
FROM email_tracking
WHERE sent_at > NOW() - INTERVAL '30 days'

UNION ALL

SELECT
  'Delivered',
  COUNT(*),
  ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM email_tracking WHERE sent_at > NOW() - INTERVAL '30 days'), 2)
FROM email_tracking
WHERE sent_at > NOW() - INTERVAL '30 days'
  AND delivered_at IS NOT NULL

UNION ALL

SELECT
  'Opened',
  COUNT(*),
  ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM email_tracking WHERE sent_at > NOW() - INTERVAL '30 days'), 2)
FROM email_tracking
WHERE opened_at IS NOT NULL
  AND sent_at > NOW() - INTERVAL '30 days'

UNION ALL

SELECT
  'Clicked',
  COUNT(*),
  ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM email_tracking WHERE sent_at > NOW() - INTERVAL '30 days'), 2)
FROM email_tracking
WHERE clicked_at IS NOT NULL
  AND sent_at > NOW() - INTERVAL '30 days'

ORDER BY percentage DESC;
```

---

## 🎯 OPTIMIZATION QUERIES

### **Best Performing Subject Lines:**

```sql
-- Top 10 Subject Lines by Open Rate (min 50 sends)
SELECT
  subject_line,
  COUNT(*) as sent,
  SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) as opens,
  ROUND(100.0 * SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as open_rate
FROM email_tracking
WHERE sent_at > NOW() - INTERVAL '90 days'
GROUP BY subject_line
HAVING COUNT(*) >= 50
ORDER BY open_rate DESC
LIMIT 10;
```

### **Time-of-Day Analysis:**

```sql
-- Best Send Times by Day of Week
SELECT
  TO_CHAR(sent_at, 'Day') as day_of_week,
  EXTRACT(HOUR FROM sent_at) as hour,
  COUNT(*) as sent,
  ROUND(100.0 * SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as open_rate
FROM email_tracking
WHERE sent_at > NOW() - INTERVAL '90 days'
GROUP BY day_of_week, hour
HAVING COUNT(*) >= 20
ORDER BY open_rate DESC
LIMIT 20;
```

### **User Segmentation Performance:**

```sql
-- Performance by User Subscription Status
SELECT
  u.subscription_status,
  COUNT(DISTINCT et.user_id) as users,
  COUNT(*) as emails_sent,
  ROUND(100.0 * SUM(CASE WHEN et.opened_at IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as open_rate,
  ROUND(100.0 * SUM(CASE WHEN et.clicked_at IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as click_rate
FROM email_tracking et
JOIN users u ON et.user_id = u.id
WHERE et.sent_at > NOW() - INTERVAL '30 days'
GROUP BY u.subscription_status
ORDER BY emails_sent DESC;
```

---

## 🚨 ALERT QUERIES

### **Email Health Alerts:**

```sql
-- Detect Sudden Drop in Open Rates (Last 7 days vs Previous 7 days)
WITH current_week AS (
  SELECT
    email_type,
    ROUND(100.0 * SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as open_rate
  FROM email_tracking
  WHERE sent_at > NOW() - INTERVAL '7 days'
  GROUP BY email_type
),
previous_week AS (
  SELECT
    email_type,
    ROUND(100.0 * SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as open_rate
  FROM email_tracking
  WHERE sent_at BETWEEN NOW() - INTERVAL '14 days' AND NOW() - INTERVAL '7 days'
  GROUP BY email_type
)
SELECT
  cw.email_type,
  pw.open_rate as previous_open_rate,
  cw.open_rate as current_open_rate,
  ROUND(cw.open_rate - pw.open_rate, 2) as change,
  CASE
    WHEN cw.open_rate < pw.open_rate * 0.8 THEN '🚨 CRITICAL DROP'
    WHEN cw.open_rate < pw.open_rate * 0.9 THEN '⚠️ WARNING'
    ELSE '✅ OK'
  END as status
FROM current_week cw
JOIN previous_week pw ON cw.email_type = pw.email_type
WHERE cw.open_rate < pw.open_rate * 0.9
ORDER BY change ASC;
```

### **Failed Email Queue Monitoring:**

```sql
-- Monitor Failed Emails
SELECT
  email_type,
  COUNT(*) as failed_count,
  array_agg(DISTINCT error_message) as error_messages,
  MAX(processed_at) as last_failure
FROM email_queue
WHERE status = 'failed'
  AND processed_at > NOW() - INTERVAL '24 hours'
GROUP BY email_type
ORDER BY failed_count DESC;
```

### **Unsubscribe Rate Monitoring:**

```sql
-- Track Unsubscribe Rates by Email Type
WITH email_counts AS (
  SELECT
    email_type,
    COUNT(*) as sent
  FROM email_tracking
  WHERE sent_at > NOW() - INTERVAL '30 days'
  GROUP BY email_type
),
unsubscribe_counts AS (
  SELECT
    et.email_type,
    COUNT(DISTINCT ep.user_id) as unsubscribes
  FROM email_tracking et
  JOIN email_preferences ep ON et.user_id = ep.user_id
  WHERE et.sent_at > NOW() - INTERVAL '30 days'
    AND ep.unsubscribed_at > NOW() - INTERVAL '30 days'
    AND ep.unsubscribed_at > et.sent_at
  GROUP BY et.email_type
)
SELECT
  ec.email_type,
  ec.sent,
  COALESCE(uc.unsubscribes, 0) as unsubscribes,
  ROUND(100.0 * COALESCE(uc.unsubscribes, 0) / ec.sent, 3) as unsubscribe_rate,
  CASE
    WHEN ROUND(100.0 * COALESCE(uc.unsubscribes, 0) / ec.sent, 3) > 0.5 THEN '🚨 HIGH'
    WHEN ROUND(100.0 * COALESCE(uc.unsubscribes, 0) / ec.sent, 3) > 0.2 THEN '⚠️ MODERATE'
    ELSE '✅ NORMAL'
  END as status
FROM email_counts ec
LEFT JOIN unsubscribe_counts uc ON ec.email_type = uc.email_type
ORDER BY unsubscribe_rate DESC;
```

---

## 📧 USER ENGAGEMENT SCORING

### **Email Engagement Score:**

```sql
-- Calculate User Email Engagement Score (0-100)
SELECT
  user_id,
  COUNT(*) as emails_received,
  SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) as emails_opened,
  SUM(CASE WHEN clicked_at IS NOT NULL THEN 1 ELSE 0 END) as emails_clicked,
  ROUND(
    (SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) * 50.0 / COUNT(*)) +
    (SUM(CASE WHEN clicked_at IS NOT NULL THEN 1 ELSE 0 END) * 50.0 / COUNT(*)),
    2
  ) as email_engagement_score
FROM email_tracking
WHERE sent_at > NOW() - INTERVAL '90 days'
GROUP BY user_id
HAVING COUNT(*) >= 3
ORDER BY email_engagement_score DESC;
```

### **Churn Risk Detection:**

```sql
-- Identify Users at Risk of Churning (Low Email Engagement)
WITH user_engagement AS (
  SELECT
    et.user_id,
    u.email,
    u.first_name,
    u.subscription_status,
    COUNT(*) as emails_received,
    SUM(CASE WHEN et.opened_at IS NOT NULL THEN 1 ELSE 0 END) as emails_opened,
    MAX(et.opened_at) as last_email_opened,
    ROUND(100.0 * SUM(CASE WHEN et.opened_at IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as open_rate
  FROM email_tracking et
  JOIN users u ON et.user_id = u.id
  WHERE et.sent_at > NOW() - INTERVAL '60 days'
  GROUP BY et.user_id, u.email, u.first_name, u.subscription_status
)
SELECT
  user_id,
  email,
  first_name,
  subscription_status,
  emails_received,
  emails_opened,
  open_rate,
  last_email_opened,
  EXTRACT(DAY FROM NOW() - last_email_opened) as days_since_last_open,
  CASE
    WHEN open_rate < 10 AND emails_received >= 5 THEN '🚨 HIGH RISK'
    WHEN open_rate < 25 OR EXTRACT(DAY FROM NOW() - last_email_opened) > 14 THEN '⚠️ MODERATE RISK'
    ELSE '✅ ENGAGED'
  END as churn_risk
FROM user_engagement
WHERE subscription_status IN ('active', 'trial')
  AND (open_rate < 25 OR EXTRACT(DAY FROM NOW() - last_email_opened) > 14)
ORDER BY
  CASE
    WHEN open_rate < 10 THEN 1
    WHEN open_rate < 25 THEN 2
    ELSE 3
  END,
  last_email_opened ASC;
```

---

## 🧪 A/B TESTING FRAMEWORK

### **Subject Line A/B Test Setup:**

```sql
-- Example: A/B Test Tracking Table
CREATE TABLE IF NOT EXISTS email_ab_tests (
  id SERIAL PRIMARY KEY,
  test_name VARCHAR(100) NOT NULL,
  email_type VARCHAR(50) NOT NULL,
  variant_a_subject VARCHAR(255) NOT NULL,
  variant_b_subject VARCHAR(255) NOT NULL,
  start_date TIMESTAMP NOT NULL DEFAULT NOW(),
  end_date TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Track which variant each email was
ALTER TABLE email_tracking
ADD COLUMN IF NOT EXISTS ab_test_id INTEGER REFERENCES email_ab_tests(id),
ADD COLUMN IF NOT EXISTS ab_variant VARCHAR(1); -- 'A' or 'B'
```

### **A/B Test Results Analysis:**

```sql
-- Analyze A/B Test Results
SELECT
  abt.test_name,
  abt.email_type,
  et.ab_variant,
  CASE
    WHEN et.ab_variant = 'A' THEN abt.variant_a_subject
    WHEN et.ab_variant = 'B' THEN abt.variant_b_subject
  END as subject_line,
  COUNT(*) as sent,
  SUM(CASE WHEN et.opened_at IS NOT NULL THEN 1 ELSE 0 END) as opens,
  SUM(CASE WHEN et.clicked_at IS NOT NULL THEN 1 ELSE 0 END) as clicks,
  ROUND(100.0 * SUM(CASE WHEN et.opened_at IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as open_rate,
  ROUND(100.0 * SUM(CASE WHEN et.clicked_at IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as click_rate
FROM email_tracking et
JOIN email_ab_tests abt ON et.ab_test_id = abt.id
WHERE abt.status = 'active'
  AND et.sent_at > NOW() - INTERVAL '30 days'
GROUP BY abt.test_name, abt.email_type, et.ab_variant, abt.variant_a_subject, abt.variant_b_subject
ORDER BY abt.test_name, et.ab_variant;
```

### **Statistical Significance Calculator:**

```sql
-- Check if A/B Test Results are Statistically Significant
-- (Using Chi-Square test approximation)
WITH test_results AS (
  SELECT
    ab_test_id,
    ab_variant,
    COUNT(*) as sent,
    SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) as opens
  FROM email_tracking
  WHERE ab_test_id IS NOT NULL
  GROUP BY ab_test_id, ab_variant
),
variant_comparison AS (
  SELECT
    a.ab_test_id,
    a.sent as a_sent,
    a.opens as a_opens,
    b.sent as b_sent,
    b.opens as b_opens,
    ROUND(100.0 * a.opens / a.sent, 2) as a_rate,
    ROUND(100.0 * b.opens / b.sent, 2) as b_rate
  FROM test_results a
  JOIN test_results b ON a.ab_test_id = b.ab_test_id
  WHERE a.ab_variant = 'A' AND b.ab_variant = 'B'
)
SELECT
  ab_test_id,
  a_sent,
  a_opens,
  a_rate as variant_a_open_rate,
  b_sent,
  b_opens,
  b_rate as variant_b_open_rate,
  ROUND(ABS(a_rate - b_rate), 2) as difference,
  CASE
    WHEN (a_sent + b_sent) < 100 THEN '⏳ INSUFFICIENT DATA'
    WHEN ABS(a_rate - b_rate) > 5 AND (a_sent + b_sent) >= 1000 THEN '✅ SIGNIFICANT'
    WHEN ABS(a_rate - b_rate) > 3 AND (a_sent + b_sent) >= 500 THEN '⚠️ LIKELY SIGNIFICANT'
    ELSE '❌ NOT SIGNIFICANT'
  END as significance
FROM variant_comparison;
```

---

## 📊 PERFORMANCE BENCHMARKS

### **Industry Benchmarks (SaaS/Dating):**

| Metric | Good | Average | Poor |
|--------|------|---------|------|
| Open Rate | >35% | 25-35% | <25% |
| Click Rate | >5% | 2-5% | <2% |
| Click-to-Open | >15% | 10-15% | <10% |
| Unsubscribe | <0.2% | 0.2-0.5% | >0.5% |
| Bounce Rate | <2% | 2-5% | >5% |
| Spam Complaints | <0.1% | 0.1-0.3% | >0.3% |

### **Your Email Type Targets:**

```sql
-- Set Performance Targets per Email Type
CREATE TABLE IF NOT EXISTS email_performance_targets (
  email_type VARCHAR(50) PRIMARY KEY,
  target_open_rate NUMERIC(5,2),
  target_click_rate NUMERIC(5,2),
  target_conversion_rate NUMERIC(5,2),
  notes TEXT
);

INSERT INTO email_performance_targets VALUES
  ('welcome', 50.00, 15.00, 5.00, 'First impression email - should be highest performing'),
  ('profile_optimization_reminder', 40.00, 10.00, 8.00, 'Action-driven email'),
  ('first_win', 45.00, 12.00, 6.00, 'Celebrating success'),
  ('weekly_digest', 30.00, 5.00, 2.00, 'Regular engagement'),
  ('inactivity_3days', 35.00, 8.00, 4.00, 'Re-engagement campaign'),
  ('subscription_renewal', 40.00, 12.00, 10.00, 'Revenue critical'),
  ('payment_failed', 60.00, 20.00, 15.00, 'Urgent action required');
```

### **Performance vs Targets:**

```sql
-- Compare Actual Performance vs Targets
WITH actual_performance AS (
  SELECT
    email_type,
    COUNT(*) as sent,
    ROUND(100.0 * SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as open_rate,
    ROUND(100.0 * SUM(CASE WHEN clicked_at IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as click_rate
  FROM email_tracking
  WHERE sent_at > NOW() - INTERVAL '30 days'
  GROUP BY email_type
)
SELECT
  ap.email_type,
  ap.sent,
  ap.open_rate,
  ept.target_open_rate,
  ROUND(ap.open_rate - ept.target_open_rate, 2) as open_rate_diff,
  ap.click_rate,
  ept.target_click_rate,
  ROUND(ap.click_rate - ept.target_click_rate, 2) as click_rate_diff,
  CASE
    WHEN ap.open_rate >= ept.target_open_rate THEN '✅ MEETING TARGET'
    WHEN ap.open_rate >= ept.target_open_rate * 0.9 THEN '⚠️ CLOSE TO TARGET'
    ELSE '🚨 BELOW TARGET'
  END as status
FROM actual_performance ap
LEFT JOIN email_performance_targets ept ON ap.email_type = ept.email_type
ORDER BY open_rate_diff ASC;
```

---

## 🔧 OPTIMIZATION RECOMMENDATIONS

### **1. Subject Line Optimization:**

**Best Practices:**
- Use personalization (first name)
- Keep under 50 characters
- Use numbers and emojis strategically
- Create urgency (limited time, deadline)
- Ask questions
- Test curiosity vs clarity

**Examples to Test:**
```
❌ Poor: "Newsletter Update"
✅ Good: "{{firstName}}, je profiel scoort nog maar 6/10 📊"

❌ Poor: "New Feature Available"
✅ Good: "🎉 Je eerste match! Dit moet je nu doen..."

❌ Poor: "Weekly Report"
✅ Good: "{{firstName}}, 3 nieuwe matches deze week ❤️"
```

### **2. Send Time Optimization:**

```sql
-- Find Your Users' Best Engagement Times
SELECT
  EXTRACT(DOW FROM sent_at) as day_of_week,
  EXTRACT(HOUR FROM sent_at) as hour,
  COUNT(*) as sent,
  ROUND(100.0 * SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as open_rate
FROM email_tracking
WHERE sent_at > NOW() - INTERVAL '90 days'
GROUP BY day_of_week, hour
HAVING COUNT(*) >= 50
ORDER BY open_rate DESC
LIMIT 10;
```

**General Recommendations:**
- Tuesday-Thursday: Best days
- 8-10 AM: Morning commute
- 1-2 PM: Lunch break
- 7-9 PM: Evening relaxation
- Avoid: Late night (11PM-6AM), early Monday, Friday evening

### **3. Email Frequency Optimization:**

```sql
-- Analyze Impact of Email Frequency on Engagement
WITH user_email_frequency AS (
  SELECT
    user_id,
    COUNT(*) as emails_per_month,
    ROUND(100.0 * SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as open_rate,
    ROUND(100.0 * SUM(CASE WHEN clicked_at IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as click_rate
  FROM email_tracking
  WHERE sent_at > NOW() - INTERVAL '30 days'
  GROUP BY user_id
)
SELECT
  CASE
    WHEN emails_per_month <= 2 THEN '1-2 emails/month'
    WHEN emails_per_month <= 4 THEN '3-4 emails/month'
    WHEN emails_per_month <= 8 THEN '5-8 emails/month'
    ELSE '9+ emails/month'
  END as frequency_bucket,
  COUNT(*) as users,
  ROUND(AVG(open_rate), 2) as avg_open_rate,
  ROUND(AVG(click_rate), 2) as avg_click_rate
FROM user_email_frequency
GROUP BY frequency_bucket
ORDER BY
  CASE
    WHEN emails_per_month <= 2 THEN 1
    WHEN emails_per_month <= 4 THEN 2
    WHEN emails_per_month <= 8 THEN 3
    ELSE 4
  END;
```

### **4. Content Optimization:**

**Email Length Analysis:**
```sql
-- Correlation between Email Length and Engagement
SELECT
  CASE
    WHEN LENGTH(subject_line) < 30 THEN 'Short (<30)'
    WHEN LENGTH(subject_line) < 50 THEN 'Medium (30-50)'
    ELSE 'Long (>50)'
  END as subject_length,
  COUNT(*) as sent,
  ROUND(100.0 * SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as open_rate
FROM email_tracking
WHERE sent_at > NOW() - INTERVAL '90 days'
GROUP BY subject_length
ORDER BY open_rate DESC;
```

**CTA Optimization:**
- Use action verbs ("Start", "Ontdek", "Verbeter")
- Single clear CTA per email
- Button vs text link testing
- Above the fold placement
- Use contrasting colors

### **5. Personalization Impact:**

```sql
-- Measure Impact of Personalization
WITH personalized_emails AS (
  SELECT
    CASE
      WHEN subject_line LIKE '%{{%' OR subject_line ~ '[A-Z][a-z]+,' THEN 'Personalized'
      ELSE 'Generic'
    END as personalization,
    COUNT(*) as sent,
    ROUND(100.0 * SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as open_rate,
    ROUND(100.0 * SUM(CASE WHEN clicked_at IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as click_rate
  FROM email_tracking
  WHERE sent_at > NOW() - INTERVAL '90 days'
  GROUP BY personalization
)
SELECT * FROM personalized_emails
ORDER BY open_rate DESC;
```

---

## 🤖 AUTOMATED MONITORING SCRIPT

### **Create Daily Monitoring Script:**

```typescript
// scripts/monitor-email-performance.ts
import { sql } from '@vercel/postgres';

interface EmailMetrics {
  totalSent: number;
  openRate: number;
  clickRate: number;
  unsubscribeRate: number;
  failedCount: number;
}

async function monitorEmailPerformance() {
  console.log('📊 Email Performance Monitor - ' + new Date().toISOString());
  console.log('='.repeat(60));

  // 1. Overall Metrics
  const overall = await sql<EmailMetrics>`
    SELECT
      COUNT(*) as total_sent,
      ROUND(100.0 * SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as open_rate,
      ROUND(100.0 * SUM(CASE WHEN clicked_at IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as click_rate
    FROM email_tracking
    WHERE sent_at > NOW() - INTERVAL '24 hours'
  `;

  console.log('\n📧 Last 24 Hours:');
  console.log(`  Sent: ${overall.rows[0].totalSent}`);
  console.log(`  Open Rate: ${overall.rows[0].openRate}%`);
  console.log(`  Click Rate: ${overall.rows[0].clickRate}%`);

  // 2. Failed Emails
  const failed = await sql`
    SELECT COUNT(*) as failed_count
    FROM email_queue
    WHERE status = 'failed'
      AND processed_at > NOW() - INTERVAL '24 hours'
  `;

  const failedCount = failed.rows[0].failed_count;
  console.log(`\n🚨 Failed Emails: ${failedCount}`);

  if (failedCount > 10) {
    console.error('⚠️ WARNING: High failure rate!');
    // TODO: Send alert email to admin
  }

  // 3. Pending Queue
  const pending = await sql`
    SELECT COUNT(*) as pending_count
    FROM email_queue
    WHERE status = 'pending'
  `;

  console.log(`\n⏳ Pending Queue: ${pending.rows[0].pending_count}`);

  // 4. Performance Drop Detection
  const performanceDrop = await sql`
    WITH current_day AS (
      SELECT ROUND(100.0 * SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as open_rate
      FROM email_tracking
      WHERE sent_at > NOW() - INTERVAL '24 hours'
    ),
    previous_day AS (
      SELECT ROUND(100.0 * SUM(CASE WHEN opened_at IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as open_rate
      FROM email_tracking
      WHERE sent_at BETWEEN NOW() - INTERVAL '48 hours' AND NOW() - INTERVAL '24 hours'
    )
    SELECT
      cd.open_rate as current_rate,
      pd.open_rate as previous_rate,
      cd.open_rate - pd.open_rate as change
    FROM current_day cd, previous_day pd
  `;

  const change = performanceDrop.rows[0]?.change || 0;
  console.log(`\n📈 Open Rate Change: ${change > 0 ? '+' : ''}${change}%`);

  if (change < -5) {
    console.error('⚠️ WARNING: Significant drop in open rate!');
    // TODO: Send alert
  }

  console.log('\n' + '='.repeat(60));
}

monitorEmailPerformance().catch(console.error);
```

### **Add to package.json:**

```json
{
  "scripts": {
    "monitor:emails": "tsx scripts/monitor-email-performance.ts"
  }
}
```

### **Run Daily via Cron:**

```json
// Add to vercel.json
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
    },
    {
      "path": "/api/cron/email-monitoring",
      "schedule": "0 9 * * *"
    }
  ]
}
```

---

## 📱 SENDGRID DASHBOARD MONITORING

### **Key SendGrid Metrics to Track:**

1. **Activity Feed** (Real-time):
   - Navigate to: SendGrid → Activity
   - Filter by: Last 24 hours
   - Watch for: Bounces, Blocks, Spam Reports

2. **Statistics Overview**:
   - Navigate to: SendGrid → Statistics → Overview
   - Track daily: Delivered, Opens, Clicks
   - Compare: Week-over-week trends

3. **Reputation Monitor**:
   - Navigate to: SendGrid → Settings → Sender Authentication
   - Check: Domain reputation score
   - Target: Keep above 95%

4. **Suppressions**:
   - Navigate to: SendGrid → Suppressions
   - Monitor: Bounces, Spam Reports, Unsubscribes
   - Action: Remove invalid emails from database

### **Set Up SendGrid Alerts:**

```
SendGrid → Settings → Alerts → Create Alert

Alert Types to Enable:
1. Bounce Rate > 5%
2. Spam Report Rate > 0.1%
3. Block Rate > 1%
4. Usage Limit (80% of plan limit)
```

---

## ✅ WEEKLY REVIEW CHECKLIST

Every Monday morning:

- [ ] Run overall performance query (last 7 days)
- [ ] Check email type performance breakdown
- [ ] Review failed emails and error messages
- [ ] Check unsubscribe rate (should be <0.2%)
- [ ] Analyze churn risk users
- [ ] Review A/B test results
- [ ] Check SendGrid reputation score
- [ ] Review pending queue size
- [ ] Identify best performing emails
- [ ] Identify worst performing emails
- [ ] Update performance targets if needed
- [ ] Document insights and action items

---

## 🎯 MONTHLY OPTIMIZATION TASKS

Every 1st of the month:

1. **Performance Review:**
   - Run all benchmark queries
   - Compare vs previous month
   - Identify trends

2. **Content Audit:**
   - Review lowest performing templates
   - Update copy/design
   - Plan A/B tests for next month

3. **Segmentation Review:**
   - Analyze user segments
   - Create new segments based on behavior
   - Adjust email frequency per segment

4. **Tech Maintenance:**
   - Check for SendGrid library updates
   - Review database performance
   - Optimize slow queries
   - Clean up old tracking data (>1 year)

5. **Compliance Check:**
   - Audit unsubscribe process
   - Review GDPR compliance
   - Update privacy policy if needed

---

## 🚀 QUICK WINS

Immediate actions for better performance:

1. **Add First Name to All Subjects:**
   ```typescript
   subject: `${firstName}, [rest of subject]`
   ```
   Expected impact: +5-10% open rate

2. **Optimize Send Times:**
   - Run time analysis query
   - Schedule emails for peak times
   Expected impact: +3-5% open rate

3. **Improve Preview Text:**
   ```tsx
   <Preview>Clear, compelling preview that complements subject</Preview>
   ```
   Expected impact: +2-3% open rate

4. **Add Social Proof:**
   - Include user testimonials
   - Show success statistics
   Expected impact: +5-8% click rate

5. **Simplify CTAs:**
   - One clear CTA per email
   - Action-oriented button text
   Expected impact: +3-5% click rate

---

## 📚 RESOURCES

### **Tools:**
- SendGrid Dashboard: https://app.sendgrid.com
- Email Subject Line Tester: https://subjectline.com
- Email HTML Tester: https://www.emailonacid.com
- GDPR Compliance: https://gdpr.eu

### **Benchmarks:**
- Mailchimp Email Benchmarks: https://mailchimp.com/resources/email-marketing-benchmarks/
- Campaign Monitor Benchmarks: https://www.campaignmonitor.com/resources/guides/email-marketing-benchmarks/

### **Learning:**
- Really Good Emails: https://reallygoodemails.com
- Email Design Reference: https://templates.mailchimp.com

---

**Status:** ✅ Monitoring & Optimization Guide Complete!
**Next Steps:**
1. Run performance queries weekly
2. Set up SendGrid alerts
3. Create monitoring cron job
4. Start first A/B test
5. Track metrics in spreadsheet or dashboard

