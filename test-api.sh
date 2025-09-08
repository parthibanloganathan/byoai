#!/bin/bash

# API Test Script for API Key Vault Service
# This script tests all the API endpoints

BASE_URL="http://localhost:3000"
EMAIL="test@example.com"

echo "🚀 Testing API Key Vault Service"
echo "================================"
echo ""

# Health Check
echo "1️⃣  Testing Health Endpoint..."
curl -s $BASE_URL/health | jq '.'
echo ""

# Register User
echo "2️⃣  Registering New User..."
RESPONSE=$(curl -s -X POST $BASE_URL/api/users/register \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\"}")

echo "$RESPONSE" | jq '.'
API_KEY=$(echo "$RESPONSE" | jq -r '.user.apiKey')

if [ "$API_KEY" = "null" ] || [ -z "$API_KEY" ]; then
  echo "❌ Failed to get API key from registration"
  exit 1
fi

echo "✅ Got API Key: $API_KEY"
echo ""

# Get Profile
echo "3️⃣  Testing Get Profile..."
curl -s -X GET $BASE_URL/api/users/profile \
  -H "X-API-Key: $API_KEY" | jq '.'
echo ""

# Store OpenAI API Key
echo "4️⃣  Storing OpenAI API Key..."
curl -s -X POST $BASE_URL/api/keys \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"provider": "openai", "apiKey": "sk-test-openai-key-12345"}' | jq '.'
echo ""

# Store Anthropic API Key
echo "5️⃣  Storing Anthropic API Key..."
curl -s -X POST $BASE_URL/api/keys \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"provider": "anthropic", "apiKey": "sk-ant-test-key-67890"}' | jq '.'
echo ""

# List All API Keys
echo "6️⃣  Listing All API Keys..."
curl -s -X GET $BASE_URL/api/keys \
  -H "X-API-Key: $API_KEY" | jq '.'
echo ""

# Get OpenAI API Key
echo "7️⃣  Retrieving OpenAI API Key..."
curl -s -X GET $BASE_URL/api/keys/openai \
  -H "X-API-Key: $API_KEY" | jq '.'
echo ""

# Update OpenAI API Key
echo "8️⃣  Updating OpenAI API Key..."
curl -s -X PUT $BASE_URL/api/keys/openai \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"apiKey": "sk-test-openai-key-updated-99999"}' | jq '.'
echo ""

# Verify Update
echo "9️⃣  Verifying Updated Key..."
curl -s -X GET $BASE_URL/api/keys/openai \
  -H "X-API-Key: $API_KEY" | jq '.'
echo ""

# Delete Anthropic API Key
echo "🔟 Deleting Anthropic API Key..."
curl -s -X DELETE $BASE_URL/api/keys/anthropic \
  -H "X-API-Key: $API_KEY" | jq '.'
echo ""

# Verify Deletion
echo "1️⃣1️⃣ Verifying Deletion (should return 404)..."
curl -s -X GET $BASE_URL/api/keys/anthropic \
  -H "X-API-Key: $API_KEY" | jq '.'
echo ""

# Test Invalid API Key
echo "1️⃣2️⃣ Testing Invalid API Key (should return 401)..."
curl -s -X GET $BASE_URL/api/users/profile \
  -H "X-API-Key: invalid-key" | jq '.'
echo ""

echo "✅ All tests completed!"
echo ""
echo "📝 Summary:"
echo "- API Key for testing: $API_KEY"
echo "- Email: $EMAIL"
echo ""
echo "To test rate limiting, run this script multiple times quickly."