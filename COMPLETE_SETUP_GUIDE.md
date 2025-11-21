# Complete Setup Guide for DatingAssistent.nl

This guide will help you set up all required services for the DatingAssistent.nl application.

## Prerequisites

Before starting, ensure you have:
- Node.js (version 18 or higher)
- npm (comes with Node.js)
- Git

## Step 1: Database Setup

Follow the instructions in [DATABASE_SETUP_GUIDE.md](DATABASE_SETUP_GUIDE.md) to set up your PostgreSQL database.

## Step 2: SendGrid Email Service

1. Go to [https://sendgrid.com/](https://sendgrid.com/) and create a free account
2. Navigate to "Settings" → "API Keys"
3. Create a new API key with full access to "Mail Send"
4. Copy the API key
5. In your `.env.local` file, replace:
   ```env
   SENDGRID_API_KEY=your_sendgrid_api_key
   ```
   With your actual API key:
   ```env
   SENDGRID_API_KEY=SG.your-actual-api-key-here
   ```

## Step 3: OpenRouter AI Service

1. Go to [https://openrouter.ai/](https://openrouter.ai/) and create an account
2. Navigate to "API Keys" and create a new key
3. Copy the API key
4. In your `.env.local` file, replace:
   ```env
   OPENROUTER_API_KEY=your_openrouter_api_key
   ```
   With your actual API key:
   ```env
   OPENROUTER_API_KEY=your-actual-openrouter-api-key
   ```

## Step 4: MultiSafePay Payment Service

1. Go to [https://www.multisafepay.com/](https://www.multisafepay.com/) and create a test account
2. Navigate to "API Keys" in your dashboard
3. Copy your API key
4. In your `.env.local` file, replace:
   ```env
   MSP_API_KEY=your_multisafepay_api_key
   ```
   With your actual API key:
   ```env
   MSP_API_KEY=your-actual-multisafepay-api-key
   ```

## Step 5: Firebase Configuration (Optional)

If you need Firebase for authentication:

1. Go to [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. In Project Settings, find your web app configuration
4. Update the following values in `.env.local`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

## Step 6: JWT Secret

Generate a secure random string for JWT authentication:

1. You can use an online password generator or run this command in Node.js:
   ```javascript
   require('crypto').randomBytes(64).toString('hex')
   ```
2. In your `.env.local` file, replace:
   ```env
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
   ```
   With your generated secret:
   ```env
   JWT_SECRET=your-very-secure-randomly-generated-string-here
   ```

## Step 7: Install Dependencies

In your project directory, run:
```bash
npm install --legacy-peer-deps
```

## Step 8: Test Database Connection

```bash
npm run test-db
```

If successful, you should see:
```
🔍 Testing database connection...
🔗 Connecting to database...
✅ Database connection successful!
```

## Step 9: Initialize Database Schema

```bash
npm run setup-db
```

If successful, you should see:
```
🚀 Setting up database...
🔧 Initializing database schema...
✅ Database schema initialized successfully!
```

## Step 10: Start Development Server

```bash
npm run dev
```

Visit [http://localhost:9002](http://localhost:9002) to see your application.

## Troubleshooting

### Common Issues:

1. **Port already in use**: If you see an EADDRINUSE error, the application is already running or another process is using port 9002. Either stop the existing process or change the port in `package.json`.

2. **Module not found errors**: Run `npm install --legacy-peer-deps` to resolve dependency conflicts.

3. **TypeScript errors**: Run `npm run typecheck` to check for type errors.

4. **Database connection failed**: Double-check your `POSTGRES_URL` in `.env.local` and ensure your database service is running.

### Testing Registration

After successful setup:
1. Visit [http://localhost:9002/register](http://localhost:9002/register)
2. Try to register a new user
3. Check your database to confirm the user was created:
   ```sql
   SELECT * FROM users;
   ```

### Testing Payment Flow

1. Register a new user
2. Go to a pricing page and select a plan
3. Proceed to payment
4. You should be redirected to MultiSafePay test environment

## Next Steps

Once everything is working:
1. Customize the content to match your branding
2. Set up production environment variables
3. Configure your domain and SSL certificate
4. Set up monitoring and logging
5. Implement backup strategies for your database