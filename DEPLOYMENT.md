# 🚀 DatingAssistent Deployment Guide

## Prerequisites

- Node.js 20+
- PostgreSQL database (Neon recommended)
- Vercel account
- GitHub repository
- AI service API keys (OpenRouter, etc.)

## Environment Variables

### Required Production Variables

Set these in your Vercel project settings:

```bash
# Database
POSTGRES_URL=postgresql://...
DATABASE_URL=postgresql://...
POSTGRES_PRISMA_URL=postgresql://...

# Authentication
JWT_SECRET=your-super-secure-jwt-secret

# AI Services
OPENROUTER_API_KEY=sk-or-v1-...
GOOGLE_API_KEY=AIza...

# Email Service
SENDGRID_API_KEY=SG...
SENDGRID_FROM_EMAIL=noreply@datingassistent.nl
SENDGRID_FROM_NAME=DatingAssistent

# Payment Processing
MULTISAFEPAY_API_KEY=...
NEXT_PUBLIC_MSP_TEST_MODE=false

# reCAPTCHA
RECAPTCHA_SECRET_KEY=...
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=...

# Web3Forms (Contact forms)
WEB3FORMS_ACCESS_KEY=...
```

## Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/datingassistent.git
   cd datingassistent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

4. **Set up the database**
   ```bash
   # Run database migrations
   npx tsx scripts/setup-email-schema.ts
   npx tsx scripts/setup-cost-tracking.ts
   ```

5. **Run production setup checks**
   ```bash
   npx tsx scripts/setup-production.ts
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

## Vercel Deployment

### Option 1: GitHub Integration (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for production deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect Next.js settings

3. **Configure environment variables**
   - Go to Project Settings → Environment Variables
   - Add all required variables from above

4. **Deploy**
   - Vercel will automatically deploy on every push to main
   - Monitor deployment in Vercel dashboard

### Option 2: Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## Database Setup

### Using Neon (Recommended)

1. **Create Neon project**
   - Go to [neon.tech](https://neon.tech)
   - Create new project
   - Get connection string

2. **Run migrations**
   ```bash
   # Set POSTGRES_URL in environment
   export POSTGRES_URL="your-neon-connection-string"

   # Run migrations
   npx tsx scripts/setup-email-schema.ts
   npx tsx scripts/setup-cost-tracking.ts
   ```

### Using Other PostgreSQL Providers

The application works with any PostgreSQL-compatible database. Update the `POSTGRES_URL` accordingly.

## AI Service Configuration

### OpenRouter Setup

1. **Get API key** from [openrouter.ai](https://openrouter.ai)
2. **Set rate limits** in your OpenRouter dashboard
3. **Monitor usage** via their dashboard

### Google Gemini Setup

1. **Get API key** from Google AI Studio
2. **Enable Gemini API** in Google Cloud Console
3. **Set billing limits** to prevent unexpected costs

## Email Configuration

### SendGrid Setup

1. **Create SendGrid account**
2. **Verify domain** for better deliverability
3. **Set up templates** for welcome emails
4. **Configure webhooks** for bounce/complaint handling

## Payment Processing

### MultiSafePay Setup

1. **Create merchant account**
2. **Configure webhooks** for payment notifications
3. **Set up test mode** during development
4. **Configure supported payment methods**

## Monitoring & Analytics

### Vercel Analytics

Enabled automatically with Vercel deployment. Monitor:
- Page views
- User interactions
- Performance metrics

### Custom Monitoring

The application includes built-in monitoring:

```bash
# Check system health
curl https://yourdomain.com/api/health

# View cost analytics (admin only)
# Visit /admin/cost-monitoring
```

## Security Checklist

- [ ] JWT_SECRET changed from default
- [ ] Database credentials secured
- [ ] API keys properly configured
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] CSP headers configured
- [ ] Rate limiting active
- [ ] Input validation enabled

## Performance Optimization

The application includes several performance optimizations:

- **Image optimization** via Next.js
- **Bundle splitting** and code splitting
- **Caching headers** for static assets
- **Database query optimization**
- **CDN delivery** via Vercel

## Troubleshooting

### Common Issues

1. **Build fails**
   ```bash
   # Check TypeScript errors
   npm run typecheck

   # Check linting
   npm run lint
   ```

2. **Database connection fails**
   ```bash
   # Test connection
   npx tsx scripts/test-db-connection.ts
   ```

3. **AI services fail**
   - Check API key validity
   - Verify rate limits
   - Check service status

4. **Email delivery issues**
   - Check SendGrid configuration
   - Verify domain authentication
   - Check spam folder

## Post-Deployment

1. **Set up monitoring alerts**
2. **Configure backup systems**
3. **Set up cost monitoring**
4. **Test all critical user flows**
5. **Monitor error rates and performance**

## Support

For deployment issues:
- Check Vercel deployment logs
- Review application logs in Vercel dashboard
- Test API endpoints manually
- Verify environment variable configuration

---

## 🎉 Deployment Complete!

Your DatingAssistent application is now live and ready to help users improve their dating success! 🚀