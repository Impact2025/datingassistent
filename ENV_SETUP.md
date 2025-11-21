# 🔐 Environment Variables Setup Guide

## ⚠️ SECURITY WARNING

**NEVER commit `.env.local` or any file containing real API keys to git!**

The `.gitignore` file is configured to ignore:
- `.env.local`
- `.env*.local`
- `.env`

Always double-check before committing.

---

## 📋 Setup Steps

### 1. Local Development Setup

```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local and fill in your actual values
```

### 2. Get Your API Keys

#### 🗄️ Database (Neon PostgreSQL)
1. Go to [console.neon.tech](https://console.neon.tech/)
2. Create a new project or select existing
3. Copy the connection strings:
   - `POSTGRES_URL` (pooled)
   - `POSTGRES_PRISMA_URL` (pooled with prisma settings)
   - `POSTGRES_URL_NON_POOLING` (direct connection)

#### 🔑 JWT Secret
Generate a secure random string:
```bash
# On Mac/Linux
openssl rand -base64 64

# On Windows (PowerShell)
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))
```

#### 📧 SendGrid (Email Service)
1. Go to [app.sendgrid.com](https://app.sendgrid.com/settings/api_keys)
2. Create new API key with "Full Access" or "Mail Send" permission
3. Copy the key (starts with "SG.")
4. Store it safely - you can only see it once!

#### 🤖 OpenRouter (AI Services)
1. Go to [openrouter.ai/keys](https://openrouter.ai/keys)
2. Create new API key
3. Add credits to your account
4. Copy the key (starts with "sk-or-v1-")

#### 💳 MultiSafePay (Payment Provider)
1. Go to [merchant.multisafepay.com](https://merchant.multisafepay.com/)
2. Navigate to Settings > API keys
3. Copy your TEST key for development
4. Copy your LIVE key for production (keep separate!)

---

## 🚀 Production Deployment

### Vercel Deployment

1. Install Vercel CLI (if not already):
```bash
npm i -g vercel
```

2. Link your project:
```bash
vercel link
```

3. Add environment variables via Vercel Dashboard:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add each variable from `.env.production.example`

Or use the CLI:
```bash
vercel env add POSTGRES_URL production
vercel env add JWT_SECRET production
# ... add all variables
```

4. Deploy:
```bash
vercel --prod
```

### ⚠️ Critical Production Settings

**MUST CHANGE for production:**

1. **JWT_SECRET**: Generate a NEW secret (different from development)
2. **MULTISAFEPAY_API_KEY**: Use LIVE key (not test key)
3. **NEXT_PUBLIC_MSP_TEST_MODE**: Set to `"false"`
4. **NEXT_PUBLIC_BASE_URL**: Set to your domain `"https://yourdomain.com"`
5. **Database**: Use production database (not dev database)

---

## 🧪 Testing Your Setup

Run these commands to verify your environment variables:

```bash
# Test database connection
npm run test-db

# Test email service (sends test email)
curl http://localhost:9002/api/test/welcome-email

# Check environment variables are loaded
node -e "console.log(process.env.JWT_SECRET ? '✅ JWT_SECRET loaded' : '❌ JWT_SECRET missing')"
```

---

## 🔍 Troubleshooting

### "API key does not start with SG."
- Your SendGrid API key is not configured correctly
- Make sure it starts with "SG." (case-sensitive)
- Regenerate if needed

### Database connection fails
- Check your connection strings are correct
- Verify the database exists in Neon
- Check firewall/IP restrictions

### JWT errors
- Make sure JWT_SECRET is at least 32 characters
- Use only alphanumeric and special characters
- Don't use quotes in the actual secret

### Payment webhook not working
- Verify NEXT_PUBLIC_BASE_URL is correct
- Check MultiSafePay webhook configuration
- Ensure webhook URL is publicly accessible

---

## 📚 Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Neon Documentation](https://neon.tech/docs)
- [SendGrid API Documentation](https://docs.sendgrid.com/api-reference)
- [MultiSafePay API Docs](https://docs.multisafepay.com/)

---

## 🆘 Need Help?

If you encounter issues:
1. Check this documentation first
2. Verify all environment variables are set
3. Check the application logs
4. Review the API provider's status pages
