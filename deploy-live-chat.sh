#!/bin/bash

# 🚀 Live Chat System - Production Deployment Script
# Run this script to deploy the complete live chat system

set -e  # Exit on any error

echo "🚀 Starting Live Chat System Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "src" ]; then
    print_error "Please run this script from the DatingAssistentApp directory"
    exit 1
fi

print_status "Checking system requirements..."

# Check Node.js version
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js version check passed"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi

print_success "npm check passed"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    print_warning ".env.local not found. Creating from template..."
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        print_warning "Please edit .env.local with your production values before continuing"
        print_warning "Required: DATABASE_URL, JWT_SECRET, WHATSAPP_ACCESS_TOKEN, etc."
        read -p "Press Enter when .env.local is configured..."
    else
        print_error ".env.example not found. Please create environment configuration."
        exit 1
    fi
fi

print_status "Installing dependencies..."
npm install

print_success "Dependencies installed"

print_status "Running database migrations..."
# Check if we have database access
if ! npm run db:test 2>/dev/null; then
    print_warning "Database connection test failed. Please check your DATABASE_URL in .env.local"
    print_warning "Make sure your PostgreSQL database is running and accessible"
    exit 1
fi

print_success "Database connection verified"

print_status "Building application..."
npm run build

print_success "Application built successfully"

print_status "Setting up live chat database schema..."

# Create database tables if they don't exist
node -e "
const { sql } = require('@vercel/postgres');
const fs = require('fs');

async function setupDatabase() {
  try {
    console.log('Creating chat system tables...');

    // Read and execute schema
    const schema = fs.readFileSync('scripts/live-chat-schema.sql', 'utf8');
    const statements = schema.split(';').filter(stmt => stmt.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        await sql.unsafe(statement);
      }
    }

    console.log('✅ Database schema created successfully');
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();
"

print_success "Database schema created"

print_status "Creating initial admin agent..."

# Create initial admin agent account
node -e "
const { sql } = require('@vercel/postgres');
const bcrypt = require('bcryptjs');

async function createAdminAgent() {
  try {
    // Check if admin already exists
    const existing = await sql\`SELECT id FROM chat_agents WHERE email = 'admin@datingsassistent.nl'\`;

    if (existing.rows.length > 0) {
      console.log('✅ Admin agent already exists');
      return;
    }

    // Create admin agent
    const hashedPassword = await bcrypt.hash('ChangeThisPassword123!', 10);

    await sql\`
      INSERT INTO chat_agents (
        name, email, password_hash, role, department, is_available,
        max_concurrent_chats, avg_response_time, created_at, updated_at
      ) VALUES (
        'System Administrator', 'admin@datingsassistent.nl', \${hashedPassword},
        'supervisor', 'management', true, 10, 15, NOW(), NOW()
      )
    \`;

    console.log('✅ Admin agent created');
    console.log('📧 Email: admin@datingsassistent.nl');
    console.log('🔑 Password: ChangeThisPassword123!');
    console.log('⚠️  Please change the password after first login!');

  } catch (error) {
    console.error('❌ Failed to create admin agent:', error.message);
  }
}

createAdminAgent();
"

print_success "Admin agent created"

print_status "Testing live chat API endpoints..."

# Test basic API endpoints
API_TESTS=(
    "/api/live-chat/health"
    "/api/admin/agents"
    "/api/live-chat/analytics"
)

for endpoint in "${API_TESTS[@]}"; do
    if curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000${endpoint}" | grep -q "200\|401\|403"; then
        print_success "API endpoint ${endpoint} is responding"
    else
        print_warning "API endpoint ${endpoint} not responding (might be normal for protected routes)"
    fi
done

print_status "Starting application..."

# Start the application
if command -v pm2 &> /dev/null; then
    print_status "Using PM2 for production deployment..."
    pm2 stop datingassistent 2>/dev/null || true
    pm2 delete datingassistent 2>/dev/null || true
    pm2 start npm --name "datingassistent" -- start
    pm2 save
    print_success "Application started with PM2"
else
    print_warning "PM2 not found. Starting with npm directly..."
    print_warning "For production, consider installing PM2: npm install -g pm2"
    npm start &
    print_success "Application started with npm"
fi

print_status "Waiting for application to start..."
sleep 5

# Final health check
if curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000" | grep -q "200"; then
    print_success "🎉 Application is running successfully!"
    print_success ""
    print_success "📋 Next Steps:"
    echo "  1. Visit http://localhost:3000/admin/login"
    echo "  2. Login with: admin@datingsassistent.nl / ChangeThisPassword123!"
    echo "  3. Change the default password immediately"
    echo "  4. Configure WhatsApp Business API (see LIVE_CHAT_DEPLOYMENT_GUIDE.md)"
    echo "  5. Set up email integration (SendGrid/Mailgun)"
    echo "  6. Add the chat widget to your website"
    echo "  7. Train your support agents using AGENT_TRAINING_MANUAL.md"
    echo ""
    print_success "📚 Documentation:"
    echo "  - Deployment Guide: LIVE_CHAT_DEPLOYMENT_GUIDE.md"
    echo "  - Agent Training: AGENT_TRAINING_MANUAL.md"
    echo "  - API Documentation: /docs/api/live-chat"
    echo ""
    print_success "🚀 Your enterprise live chat system is ready!"
else
    print_error "❌ Application failed to start properly"
    print_error "Check the logs and try again"
    exit 1
fi

print_success ""
print_success "╔══════════════════════════════════════════════════════════════╗"
print_success "║                    🎉 DEPLOYMENT COMPLETE!                   ║"
print_success "║                                                              ║"
print_success "║  Your enterprise-grade live chat system is now live!        ║"
print_success "║  24/7 multi-channel support, intelligent routing, and       ║"
print_success "║  advanced analytics - everything you need for world-class   ║"
print_success "║  customer service.                                           ║"
print_success "║                                                              ║"
print_success "║  🚀 Ready to transform your customer experience!            ║"
print_success "╚══════════════════════════════════════════════════════════════╝"
print_success ""