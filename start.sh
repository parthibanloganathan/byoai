#!/bin/bash

# API Key Vault - One-Click Startup Script
echo "🚀 Starting API Key Vault..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install docker-compose first."
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚙️ Setting up environment..."
    
    # Copy environment template
    cp .env.docker .env
    
    # Generate a secure encryption key
    echo "🔑 Generating secure encryption key..."
    ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" 2>/dev/null || openssl rand -hex 32)
    
    # Update the .env file with the generated key
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/your-32-char-encryption-key-here-change-this-immediately/$ENCRYPTION_KEY/g" .env
    else
        # Linux
        sed -i "s/your-32-char-encryption-key-here-change-this-immediately/$ENCRYPTION_KEY/g" .env
    fi
    
    echo "✅ Environment configured with secure encryption key"
fi

# Start the services
echo "🐳 Starting Docker services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo "🔍 Checking service health..."

# Check if backend is healthy
if curl -f http://localhost:3000/health &>/dev/null; then
    echo "✅ Backend API is running on http://localhost:3000"
else
    echo "⚠️  Backend API is starting up... (may take a few more seconds)"
fi

# Check if frontend is accessible
if curl -f http://localhost:3001 &>/dev/null; then
    echo "✅ Frontend UI is running on http://localhost:3001"
else
    echo "⚠️  Frontend UI is starting up... (may take a few more seconds)"
fi

echo ""
echo "🎉 API Key Vault is starting up!"
echo ""
echo "📝 Services:"
echo "   • API Server: http://localhost:3000"
echo "   • UI Component: http://localhost:3001"
echo "   • Database: MongoDB on localhost:27017"
echo ""
echo "📋 Commands:"
echo "   • View logs: docker-compose logs -f"
echo "   • Stop services: docker-compose down"
echo "   • Restart: docker-compose restart"
echo ""
echo "💡 Tip: It may take 1-2 minutes for all services to be fully ready."