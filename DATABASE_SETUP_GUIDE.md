# Database Setup Guide for DatingAssistent.nl

## Option 1: Using Supabase (Recommended for Development)

1. Go to [https://supabase.com/](https://supabase.com/) and create a free account
2. Create a new project:
   - Choose a project name (e.g., "datingassistent-dev")
   - Set a secure database password
   - Select a region closest to you
3. Wait for the project to be created (this may take a few minutes)
4. Once created, go to the "Settings" → "Database" section
5. Copy the connection string:
   - It will look like: `postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-ID].supabase.co:5432/postgres`

## Option 2: Using Railway

1. Go to [https://railway.app/](https://railway.app/) and create a free account
2. Create a new project
3. Add a PostgreSQL database template
4. Once deployed, go to the PostgreSQL service
5. In the "Connect" tab, copy the "Postgres Connection URL"

## Option 3: Local PostgreSQL Installation

If you prefer to run PostgreSQL locally:

1. Download and install PostgreSQL from [https://www.postgresql.org/download/](https://www.postgresql.org/download/)
2. During installation, set a password for the default "postgres" user
3. The default connection string will be:
   `postgresql://postgres:[YOUR-PASSWORD]@localhost:5432/postgres`

## Configuring Your Environment

1. Open the `.env.local` file in your project root
2. Replace the `POSTGRES_URL` value with your actual connection string
3. Make sure to update the JWT_SECRET with a secure random string:
   ```env
   JWT_SECRET=your-very-secure-random-string-here-change-this-in-production
   ```

## Testing the Connection

After updating your `.env.local` file:

1. Install dependencies (if not already done):
   ```bash
   npm install --legacy-peer-deps
   ```

2. Test the database connection:
   ```bash
   npm run test-db
   ```

3. If the test is successful, initialize the database schema:
   ```bash
   npm run setup-db
   ```

## Troubleshooting

### Common Issues:

1. **Connection refused**: Make sure your database service is running
2. **Authentication failed**: Check your username and password
3. **Database does not exist**: Ensure the database name in your connection string is correct
4. **Permission denied**: Make sure your database user has the necessary privileges

### If you get "Module not found" errors:

Run:
```bash
npm install --legacy-peer-deps
```

### If you get TypeScript errors:

Run:
```bash
npm run typecheck
```

## Next Steps

Once your database is configured and connected:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Visit [http://localhost:9002](http://localhost:9002) to see your application

3. Test user registration at [http://localhost:9002/register](http://localhost:9002/register)