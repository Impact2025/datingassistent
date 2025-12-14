# 🔐 ENVIRONMENT VARIABLES SETUP GUIDE

## Required Variables for Production

### 1. Security (Critical)
```bash
# JWT Secret - Generate with: openssl rand -base64 32
JWT_SECRET="your-secure-random-string-minimum-32-characters"

# CSRF Secret - Generate with: openssl rand -base64 32
CSRF_SECRET="your-secure-random-string-minimum-32-characters"
```

### 2. Database (Critical)
```bash
# PostgreSQL Connection String (Neon/Vercel Postgres)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# Optional: Redis/KV for caching
KV_URL="redis://..."
KV_REST_API_TOKEN="..."
KV_REST_API_URL="https://..."
```

### 3. AI Services (Required)
```bash
# Anthropic Claude API
ANTHROPIC_API_KEY="sk-ant-..."

# Optional: OpenAI, OpenRouter
OPENAI_API_KEY="sk-..."
OPENROUTER_API_KEY="sk-or-..."
```

### 4. Email (Required)
```bash
# SendGrid for transactional emails
SENDGRID_API_KEY="SG...."
SENDGRID_FROM_EMAIL="noreply@datingassistent.nl"
SENDGRID_FROM_NAME="DatingAssistent"

# Email Templates
SENDGRID_WELCOME_TEMPLATE_ID="d-..."
SENDGRID_PASSWORD_RESET_TEMPLATE_ID="d-..."
```

### 5. Application (Required)
```bash
# Base URL for the application
NEXT_PUBLIC_BASE_URL="https://datingassistent.nl"

# Environment
NODE_ENV="production"
```

### 6. Payments (Required)
```bash
# MultiSafepay Payment Gateway
MULTISAFEPAY_API_KEY="..."
```

### 7. Monitoring (Optional but Recommended)
```bash
# Sentry Error Tracking
SENTRY_DSN="https://...@sentry.io/..."
SENTRY_ORG="..."
SENTRY_PROJECT="..."

# Vercel Analytics (auto-configured)
```

## How to Set in Vercel

1. Go to: https://vercel.com/your-project/settings/environment-variables
2. Click "Add New"
3. Enter variable name and value
4. Select environments: Production, Preview, Development
5. Click "Save"
6. Redeploy for changes to take effect

## Generate Secure Secrets

```bash
# On Mac/Linux:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Or use: https://generate-secret.vercel.app/32
```

## Verification

After setting all variables, check:
- Visit: https://your-app.vercel.app/api/health
- Should return: `{"status":"healthy"}`

## Security Best Practices

✅ **DO:**
- Use strong, random values (32+ characters)
- Rotate secrets regularly (every 90 days)
- Use different secrets for dev/staging/prod
- Store backup copies securely (1Password, Vault)

❌ **DON'T:**
- Commit secrets to git
- Share secrets via email/chat
- Use default/example values
- Reuse secrets across projects

## Troubleshooting

**Build fails:**
- Check all REQUIRED variables are set
- Verify no typos in variable names
- Ensure values don't contain invalid characters

**App crashes:**
- Check DATABASE_URL is correct
- Verify API keys are valid
- Check logs: `vercel logs your-app --prod`

**Features not working:**
- AI features → Check ANTHROPIC_API_KEY
- Emails → Check SENDGRID_API_KEY
- Payments → Check MULTISAFEPAY_API_KEY
