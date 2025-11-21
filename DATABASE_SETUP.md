# Database Setup Instructions

This document explains how to set up the PostgreSQL database for the Dating Assistant application.

## Prerequisites

1. A PostgreSQL database (local or cloud-based)
2. Database connection credentials (host, port, username, password, database name)

## Database Options

### Option 1: Local PostgreSQL Installation

1. Install PostgreSQL on your local machine
2. Create a new database:
   ```sql
   CREATE DATABASE datespark;
   ```
3. Create a user with appropriate permissions:
   ```sql
   CREATE USER datespark_user WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE datespark TO datespark_user;
   ```

### Option 2: Vercel Postgres (Recommended for Deployment)

1. Sign up for a Vercel account
2. Create a new PostgreSQL database through the Vercel dashboard
3. Get your connection string from the Vercel Postgres dashboard

### Option 3: Cloud PostgreSQL Services

Services like Supabase, Render, or Railway offer free tiers that work well for development.

## Configuration

1. Open the [.env.local](file:///C:/Users/v_mun/.claude/projects/DatingAssistent/DatingAssistentApp/.env.local) file in the root of your project
2. Update the `POSTGRES_URL` variable with your actual database connection string:
   ```
   # Example for local PostgreSQL
   POSTGRES_URL=postgresql://datespark_user:your_secure_password@localhost:5432/datespark
   
   # Example for Vercel Postgres
   POSTGRES_URL=postgresql://default:your_password@your_endpoint.vercel.com:5432/verceldb
   ```

3. Update the `JWT_SECRET` with a secure random string:
   ```
   JWT_SECRET=your_very_secure_random_string_here_change_this_in_production
   ```

## Initialize Database Schema

After configuring your database connection:

1. Test the connection:
   ```bash
   npm run test-db
   ```

2. Initialize the database schema:
   ```bash
   npm run setup-db
   ```

This will create all necessary tables for the application.

## Troubleshooting

### "Internal server error" during registration

This typically means the database connection is not configured correctly. Check:

1. Your `POSTGRES_URL` in [.env.local](file:///C:/Users/v_mun/.claude/projects/DatingAssistent/DatingAssistentApp/.env.local) is correct
2. The database server is running and accessible
3. The database user has proper permissions
4. The database exists

### Connection refused errors

- Ensure your PostgreSQL server is running
- Check that the host, port, and credentials are correct
- Verify that your firewall allows connections to the database port

### Permission denied errors

- Ensure your database user has CONNECT privileges
- Check that the user has permissions to create tables in the database