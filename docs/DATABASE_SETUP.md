# Database Setup & Migrations

## Overview

This document describes the database setup, migrations, and maintenance procedures for the DatingAssistent application.

## Database Stack

- **Provider**: Vercel Postgres (Neon)
- **ORM**: @vercel/postgres (SQL)
- **Migrations**: Custom migration system
- **Monitoring**: Built-in query logging & performance tracking

## Initial Setup

### 1. Environment Variables

Add to your `.env.local`:

```env
# Database (Vercel Postgres / Neon)
DATABASE_URL=postgres://...
POSTGRES_URL=postgres://...
POSTGRES_PRISMA_URL=postgres://...
POSTGRES_URL_NON_POOLING=postgres://...
```

Get these from Vercel Dashboard → Storage → Postgres

### 2. Run Migrations

**Option A: Via Health Check Endpoint**

```bash
# POST request to run migrations
curl -X POST https://your-domain.vercel.app/api/health/database

# Or locally
curl -X POST http://localhost:9000/api/health/database
```

**Option B: Programmatically**

```typescript
import { runMigrations } from '@/lib/db/migrations';

await runMigrations();
```

## Migration System

### How It Works

1. Migrations tracked in `schema_migrations` table
2. Each migration runs once (idempotent)
3. Failed migrations logged but don't block others
4. Migrations run in order (001, 002, 003...)

### Current Migrations

| # | Name | Description |
|---|------|-------------|
| 001 | admin_audit_logs | Create audit table with proper indexes |
| 002 | performance_indexes | Add indexes to existing tables |
| 003 | missing_constraints | Add foreign keys and constraints |

### Adding New Migrations

**Location**: `src/lib/db/migrations.ts`

**Steps**:

1. Create migration function:
```typescript
async function migration_004_your_migration(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS your_table (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_your_table_name ON your_table (name)`;
}
```

2. Add to migrations array:
```typescript
const migrations = [
  // ... existing
  { name: '004_your_migration', fn: migration_004_your_migration },
];
```

3. Run migrations

## Health Checks

### Check Database Health

**GET** `/api/health/database`

Returns:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-22T10:30:00.000Z",
  "checks": {
    "connection": {
      "status": "pass",
      "responseTime": 45
    },
    "schema": {
      "status": "pass"
    }
  }
}
```

**With Stats** (slower):

**GET** `/api/health/database?stats=true`

Returns database size, table counts, index usage, etc.

## Query Logging

### Automatic Logging

All queries are automatically logged using the query wrapper:

```typescript
import { query, select, insert } from '@/lib/db/query-wrapper';

// Automatic logging, monitoring, retry logic
const result = await select(
  () => sql`SELECT * FROM users WHERE id = ${userId}`,
  'get-user-by-id'
);
```

### Features

- ✅ Automatic performance tracking
- ✅ Slow query detection (> 1000ms)
- ✅ Retry logic for connection errors
- ✅ Error logging to Sentry
- ✅ Breadcrumbs for debugging

### Monitoring Slow Queries

Slow queries are automatically logged:

```
🐌 Slow query detected: get-user-profile took 1523ms
```

## Data Validation

### Before Inserting

```typescript
import { validate, UserValidation } from '@/lib/db/validation';

const result = validate(userData, [
  UserValidation.email,
  UserValidation.name,
]);

if (!result.valid) {
  throw new Error(result.errors.join(', '));
}

// Use sanitized data
await sql`INSERT INTO users (email, name) VALUES (${result.sanitized.email}, ${result.sanitized.name})`;
```

### Built-in Validators

- `UserValidation.email` - Valid email, sanitized
- `UserValidation.password` - Min 8 chars, max 128
- `UserValidation.name` - 1-100 chars, sanitized
- `UserValidation.username` - 3-30 chars, alphanumeric

### Security Checks

Automatic checks for:
- SQL injection patterns
- XSS attempts
- Path traversal
- Invalid characters

## Common Tasks

### View Audit Logs

```sql
SELECT *
FROM admin_audit_logs
WHERE user_id = 123
ORDER BY created_at DESC
LIMIT 100;
```

### Check Index Usage

```sql
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as scans
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### Find Slow Queries

Check application logs for:
```
🐌 Slow query detected: [query-name] took [duration]ms
```

### Clean Old Audit Logs

```sql
-- Manual cleanup (2 years retention)
SELECT cleanup_old_audit_logs();

-- Or set up cron job
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'cleanup-audit-logs',
  '0 0 * * 0', -- Every Sunday at midnight
  'SELECT cleanup_old_audit_logs()'
);
```

## Troubleshooting

### "Index does not exist" Error

**Problem**: Build logs show index errors

**Solution**: Run migrations
```bash
curl -X POST http://localhost:9000/api/health/database
```

### Slow Queries

**Problem**: Queries taking > 1000ms

**Solutions**:
1. Check if indexes exist: `\di` in psql
2. Run migration 002 for performance indexes
3. Use EXPLAIN ANALYZE to see query plan:
```sql
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';
```

### Connection Pool Exhausted

**Problem**: "Too many connections"

**Solution**: Vercel Postgres auto-manages connections, but:
- Use connection pooling URL (default)
- Don't hold connections open
- Use transactions wisely

### Migration Failed

**Problem**: Migration error

**Solution**:
1. Check `schema_migrations` table
2. Remove failed migration record if needed:
```sql
DELETE FROM schema_migrations WHERE name = '001_problematic_migration';
```
3. Fix migration code
4. Run again

## Production Checklist

Before deploying to production:

- [ ] Environment variables configured
- [ ] Migrations tested locally
- [ ] Health check returns "healthy"
- [ ] Indexes created on large tables
- [ ] Backup strategy in place
- [ ] Monitoring alerts configured

## Backup & Recovery

### Vercel Postgres Backups

- **Automatic**: Daily backups (7-day retention on Pro plan)
- **Manual**: Via Vercel Dashboard → Storage → Postgres → Backups

### Manual Backup

```bash
# Export database
pg_dump $DATABASE_URL > backup.sql

# Restore database
psql $DATABASE_URL < backup.sql
```

## Performance Tips

1. **Use Indexes**: All foreign keys and frequently queried columns
2. **Limit Results**: Always use LIMIT in queries
3. **Use Prepared Statements**: Let Postgres cache query plans
4. **Monitor Query Times**: Check health endpoint regularly
5. **Clean Old Data**: Use retention policies

## Support

- **Database Errors**: Check `/api/health/database`
- **Slow Queries**: Check application logs
- **Schema Issues**: Run migrations
- **Connection Issues**: Check Vercel Status page

## Useful SQL Commands

```sql
-- List all tables
\dt

-- Describe table structure
\d table_name

-- List all indexes
\di

-- Check table sizes
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(tablename::text)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::text) DESC;

-- Check connection count
SELECT count(*) FROM pg_stat_activity;

-- Kill long-running queries
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'active' AND query_start < now() - interval '5 minutes';
```
