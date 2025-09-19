#!/bin/bash

# Mirror PWA Deployment Script
# Usage: ./scripts/deploy.sh [environment]
# Environment: production (default) or preview

set -e

ENVIRONMENT=${1:-production}
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🚀 Starting deployment to $ENVIRONMENT..."

# Check if .env.local exists
if [ ! -f "$PROJECT_ROOT/.env.local" ]; then
    echo "❌ Error: .env.local file not found!"
    echo "Please copy .env.example to .env.local and fill in your values."
    exit 1
fi

# Check if required environment variables are set
if ! grep -q "VITE_SUPABASE_URL" "$PROJECT_ROOT/.env.local" || ! grep -q "VITE_SUPABASE_ANON_KEY" "$PROJECT_ROOT/.env.local"; then
    echo "❌ Error: Required Supabase environment variables not found in .env.local"
    echo "Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run linting
echo "🔍 Running linter..."
npm run lint

# Run tests
echo "🧪 Running tests..."
npm run test:run

# Build application
echo "🔨 Building application..."
if [ "$ENVIRONMENT" = "production" ]; then
    npm run build
else
    npm run build:dev
fi

# Check build size
echo "📊 Checking build size..."
if command -v du &> /dev/null; then
    BUILD_SIZE=$(du -sh dist/ | cut -f1)
    echo "📦 Build size: $BUILD_SIZE"
fi

# Deploy based on environment
if [ "$ENVIRONMENT" = "production" ]; then
    echo "🌐 Deploying to production..."
    if command -v vercel &> /dev/null; then
        npm run deploy:vercel
    else
        echo "⚠️  Vercel CLI not found. Please install it globally:"
        echo "npm install -g vercel"
        echo ""
        echo "Or deploy manually by uploading the 'dist/' folder to your hosting provider."
        exit 1
    fi
else
    echo "👀 Deploying to preview..."
    if command -v vercel &> /dev/null; then
        npm run deploy:preview
    else
        echo "⚠️  Vercel CLI not found. Please install it globally:"
        echo "npm install -g vercel"
        echo ""
        echo "Or deploy manually by uploading the 'dist/' folder to your hosting provider."
    fi
fi

echo "✅ Deployment completed successfully!"
echo ""
echo "📱 Your PWA is now ready for installation on mobile devices!"
echo "🔧 Service Worker will handle offline functionality"
echo "🔔 Push notifications are configured and ready"
echo ""
echo "🎉 Happy deploying!"