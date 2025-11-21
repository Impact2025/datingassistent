# DatingAssistent.nl - AI-Powered Dating Coach Platform

> Professionele dating coach applicatie met AI-ondersteuning voor profieloptimalisatie, conversatie coaching en persoonlijke dating begeleiding.

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=flat-square&logo=postgresql)](https://neon.tech/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com)

## 🎯 Over DatingAssistent

DatingAssistent is een moderne AI-powered platform dat singles helpt met:
- **Profiel Optimalisatie**: AI-gedreven analyse en verbetering van dating profielen
- **Foto Advies**: Computer vision analyse van profielfoto's met feedback
- **Conversatie Coaching**: Real-time hulp bij gesprekken en openers
- **Online Cursussen**: Gestructureerde lesprogramma's met interactieve quizzen
- **Date Planning**: Gepersonaliseerde date ideeën en tips
- **Community Forum**: Veilige ruimte voor ervaringen delen

## 🏗️ Technische Stack

### Frontend
- **Framework**: Next.js 15.5 (App Router)
- **UI Library**: React 18.3 met TypeScript
- **Styling**: Tailwind CSS + Radix UI componenten
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod validatie

### Backend
- **Database**: Neon PostgreSQL (serverless)
- **Authentication**: JWT (jose library)
- **Email**: SendGrid
- **Payment**: MultiSafePay
- **File Storage**: Vercel Blob Storage

### AI Services
- **Primary Provider**: OpenRouter
  - Vision: Google Gemini Flash 1.5 8B
  - Text: Meta Llama 3.1 8B
- **Backup**: Google Generative AI

### Infrastructure
- **Hosting**: Vercel (Frankfurt region)
- **Monitoring**: Sentry
- **Analytics**: Google Analytics 4
- **Security**: reCAPTCHA v3

## 🚀 Deployment Guide

### Vereisten
- Node.js 20.x of hoger
- Git
- GitHub account
- Vercel account
- Neon PostgreSQL database

### 1. Repository Setup

```bash
# Clone de repository
git clone https://github.com/YOUR_USERNAME/datingassistent.git
cd datingassistent

# Installeer dependencies
npm install
```

### 2. Environment Variables

Kopieer `.env.example` naar `.env.local`:

```bash
cp .env.example .env.local
```

Vul alle vereiste environment variables in:

#### Database (Neon PostgreSQL)
```env
POSTGRES_URL="postgresql://user:password@host/database?sslmode=require"
POSTGRES_PRISMA_URL="postgresql://user:password@host/database?sslmode=require"
POSTGRES_URL_NON_POOLING="postgresql://user:password@host/database?sslmode=require"
```

#### Authentication
```env
JWT_SECRET="your-secure-jwt-secret-min-32-characters"
```

#### Email Service (SendGrid)
```env
SENDGRID_API_KEY="SG.your_sendgrid_api_key_here"
```

#### AI Services (OpenRouter)
```env
OPENROUTER_API_KEY="sk-or-v1-your_openrouter_api_key_here"
NEXT_PUBLIC_APP_URL="http://localhost:9000"
```

#### Payment (MultiSafePay)
```env
MULTISAFEPAY_API_KEY="your_multisafepay_api_key_here"
NEXT_PUBLIC_MSP_TEST_MODE="true"
MULTISAFEPAY_WEBHOOK_SECRET="your-secure-webhook-secret"
```

#### Security
```env
RECAPTCHA_SECRET_KEY="your_recaptcha_secret_key_here"
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="your_recaptcha_site_key_here"
```

#### Monitoring (Sentry)
```env
SENTRY_DSN="https://your-sentry-dsn@sentry.io/project-id"
NEXT_PUBLIC_SENTRY_DSN="https://your-sentry-dsn@sentry.io/project-id"
SENTRY_ORG="your-sentry-org"
SENTRY_PROJECT="your-sentry-project"
```

#### Analytics
```env
GA4_PROPERTY_ID="G-XXXXXXXXXX"
```

#### Application
```env
NEXT_PUBLIC_BASE_URL="http://localhost:9000"
NODE_ENV="development"
```

### 3. Database Setup

```bash
# Run database migrations (indien nodig)
npm run init-db
```

### 4. Local Development

```bash
# Start development server
npm run dev

# Server draait op http://localhost:9000
```

### 5. Vercel Deployment

#### Via Vercel Dashboard (Aanbevolen)

1. **GitHub Connectie**
   - Ga naar [Vercel Dashboard](https://vercel.com/dashboard)
   - Klik op "Add New Project"
   - Import je GitHub repository

2. **Configuratie**
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Node Version: 20.x

3. **Environment Variables**
   Voeg ALLE environment variables toe uit `.env.example`

   **BELANGRIJK**: Gebruik productie waarden, niet development waarden!

   - Genereer nieuwe JWT_SECRET: `openssl rand -base64 32`
   - Genereer nieuwe MULTISAFEPAY_WEBHOOK_SECRET: `openssl rand -base64 32`
   - Gebruik productie database URLs
   - Zet NEXT_PUBLIC_MSP_TEST_MODE="false" voor productie
   - Update NEXT_PUBLIC_BASE_URL naar je Vercel URL

4. **Deploy**
   - Klik "Deploy"
   - Vercel bouwt en deploy automatisch

#### Via Vercel CLI

```bash
# Installeer Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy naar productie
vercel --prod
```

### 6. Post-Deployment Checklist

- [ ] Database connectie werkt
- [ ] Email sending werkt (SendGrid)
- [ ] AI features werken (OpenRouter)
- [ ] Payment flow werkt (MultiSafePay webhook)
- [ ] Admin panel toegankelijk
- [ ] reCAPTCHA werkt
- [ ] Analytics tracking actief
- [ ] Sentry errors worden gevangen
- [ ] SSL certificaat actief
- [ ] Custom domain geconfigureerd (optioneel)

## 🛠️ Development Scripts

```bash
# Development
npm run dev              # Start dev server op poort 9000
npm run dev:genkit       # Start Genkit AI development server

# Building
npm run build            # Production build
npm run build:analyze    # Build met bundle analyzer
npm run start            # Start production server

# Code Quality
npm run lint             # ESLint
npm run typecheck        # TypeScript type checking
npm test                 # Run tests
npm run test:watch       # Test watch mode
npm run test:coverage    # Test met coverage

# Database
npm run init-db          # Initialize database
npm run setup-db         # Setup database schema
npm run test-db          # Test database connection

# Utilities
npm run check-env        # Valideer environment variables
npm run sync:courses     # Sync courses from data
```

## 📁 Project Structure

```
datingassistent/
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── api/             # API routes
│   │   ├── dashboard/       # Dashboard pages
│   │   ├── admin/          # Admin panel
│   │   └── ...
│   ├── components/          # React components
│   │   ├── auth/           # Authentication components
│   │   ├── dashboard/      # Dashboard components
│   │   ├── layout/         # Layout components
│   │   ├── shared/         # Shared components
│   │   └── ui/             # UI library (Radix)
│   ├── lib/                # Utility libraries
│   │   ├── ai-service.ts   # AI integration
│   │   ├── auth.ts         # Authentication
│   │   ├── db-schema.ts    # Database schema
│   │   └── ...
│   ├── providers/          # React context providers
│   └── types/              # TypeScript types
├── public/                 # Static files
│   ├── images/            # Images
│   └── videos/            # Videos
├── scripts/               # Utility scripts
├── sql/                   # SQL migrations
├── .env.example          # Environment variables template
├── .env.local            # Local environment (niet in git)
├── next.config.ts        # Next.js configuratie
├── tailwind.config.ts    # Tailwind configuratie
├── tsconfig.json         # TypeScript configuratie
└── vercel.json          # Vercel deployment configuratie
```

## 🔒 Security

### Belangrijke Security Maatregelen
- ✅ JWT-based authentication
- ✅ Environment variables voor secrets
- ✅ reCAPTCHA op formulieren
- ✅ CSRF protection
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS protection headers
- ✅ Rate limiting op API endpoints
- ✅ Webhook signature verification
- ✅ Password hashing (bcrypt)

### Security Headers
Geconfigureerd in `next.config.ts`:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Content-Security-Policy
- Strict-Transport-Security (productie)

### Best Practices
1. **Secrets Management**
   - Gebruik NOOIT hardcoded secrets
   - Bewaar .env.local NOOIT in git
   - Roteer secrets regelmatig (elke 90 dagen)
   - Gebruik verschillende secrets per environment

2. **Database**
   - Gebruik altijd prepared statements
   - Beperk database user permissions
   - Enable SSL voor database connecties
   - Regular backups

3. **API Security**
   - Authentication op alle protected routes
   - Rate limiting actief
   - Input validation met Zod
   - Error messages niet te verbose

## 📊 Monitoring & Analytics

### Sentry (Error Tracking)
- Automatische error capture
- Performance monitoring
- Source maps voor debugging
- Real-time alerts

### Google Analytics 4
- Pageview tracking
- Event tracking
- User behavior analysis
- Conversion tracking

### Custom Metrics
- AI token usage tracking
- API response times
- Database query performance
- User engagement metrics

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# CI mode
npm run test:ci
```

Test files: `src/components/__tests__/`

## 🤝 Contributing

Dit is een private project. Voor wijzigingen:

1. Create feature branch: `git checkout -b feature/naam`
2. Commit changes: `git commit -m 'Add feature'`
3. Push branch: `git push origin feature/naam`
4. Create Pull Request

## 📝 License

Copyright © 2025 DatingAssistent.nl - Alle rechten voorbehouden

## 🆘 Support

Voor vragen of problemen:
- 📧 Email: support@datingassistent.nl
- 🌐 Website: https://datingassistent.nl
- 📚 Documentatie: Zie `/docs` folder

---

**Gemaakt met ❤️ door het DatingAssistent team**
